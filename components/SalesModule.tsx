
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus,
  Trash2, 
  ChevronLeft,
  CreditCard,
  Banknote,
  Search,
  CheckCircle2,
  Loader2,
  Info,
  UserPlus,
  History,
  X,
  User,
  Hash,
  Phone,
  DollarSign,
  Barcode,
  LayoutGrid,
  Zap,
  FileText,
  Filter
} from 'lucide-react';
import { Product, Client } from '../types';
import { supabase } from '../services/supabase';

interface CartItem {
  product: Product;
  quantity: number;
}

interface SaleHistoryItem {
  id: string;
  total: number;
  date: string;
  status: string;
  type: string;
  client_name?: string;
}

export const SalesModule: React.FC = () => {
  const [view, setView] = useState<'list' | 'new'>('list');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [paymentType, setPaymentType] = useState<'cash' | 'credit'>('cash');
  const [installments, setInstallments] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [listFilter, setListFilter] = useState<'all' | 'proforma' | 'confirmed'>('all');
  const [salesHistory, setSalesHistory] = useState<SaleHistoryItem[]>([]);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // New Sale State
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientHistory, setClientHistory] = useState<SaleHistoryItem[]>([]);
  const [clientBalance, setClientBalance] = useState<number>(0);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  
  // New Client Form State
  const [showClientForm, setShowClientForm] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientNuit, setNewClientNuit] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');

  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [success, setSuccess] = useState<{type: 'sale' | 'proforma'} | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (view === 'list') {
      fetchSalesHistory();
    }
  }, [view, listFilter]);

  useEffect(() => {
    if (selectedClientId) {
      fetchClientContext(selectedClientId);
    }
  }, [selectedClientId]);

  async function fetchInitialData() {
    setIsLoading(true);
    const { data: pData } = await supabase.from('products').select('*');
    const { data: cData } = await supabase.from('clients').select('*').order('name');
    
    if (pData) setProducts(pData.map(p => ({
      id: p.id, sku: p.sku, name: p.name, unit: p.unit, 
      costPrice: p.cost_price, salePrice: p.sale_price, 
      minStock: p.min_stock, currentStock: p.current_stock
    })));
    
    if (cData) setClients(cData.map(c => ({
      id: c.id, name: c.name, nuit: c.nuit, phone: c.phone, 
      address: c.address || '', creditLimit: c.credit_limit || 0, balance: 0
    })));
    setIsLoading(false);
  }

  async function fetchSalesHistory() {
    setIsLoading(true);
    let query = supabase
      .from('sales')
      .select('id, total, date, status, type, clients(name)')
      .order('date', { ascending: false });

    if (listFilter === 'proforma') {
      query = query.eq('status', 'proforma');
    } else if (listFilter === 'confirmed') {
      query = query.neq('status', 'proforma');
    }

    const { data } = await query;
    if (data) {
      setSalesHistory(data.map((s: any) => ({
        ...s,
        client_name: s.clients?.name
      })));
    }
    setIsLoading(false);
  }

  async function fetchClientContext(clientId: string) {
    setIsFetchingHistory(true);
    try {
      const { data: history } = await supabase
        .from('sales')
        .select('id, total, date, status, type')
        .eq('client_id', clientId)
        .order('date', { ascending: false })
        .limit(3);

      const { data: balanceData } = await supabase
        .from('sales')
        .select('total')
        .eq('client_id', clientId)
        .eq('type', 'credit')
        .neq('status', 'paid');

      if (history) setClientHistory(history);
      const totalOwed = balanceData?.reduce((acc, sale) => acc + (sale.total || 0), 0) || 0;
      setClientBalance(totalOwed);
    } catch (err) {
      console.error("Error context:", err);
    } finally {
      setIsFetchingHistory(false);
    }
  }

  const filteredProducts = useMemo(() => {
    const query = productSearchQuery.toLowerCase();
    if (!query) return products;
    return products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.sku.toLowerCase().includes(query)
    );
  }, [products, productSearchQuery]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.product.salePrice * item.quantity), 0), [cart]);

  const handleFinalize = async (isProforma: boolean = false) => {
    if (!selectedClientId || cart.length === 0) return;
    setIsLoading(true);
    try {
      const saleData = {
        client_id: selectedClientId,
        total: subtotal,
        type: isProforma ? 'quote' : paymentType,
        status: isProforma ? 'proforma' : (paymentType === 'cash' ? 'paid' : 'pending'),
        date: new Date().toISOString().split('T')[0]
      };

      const { data: sale, error: saleError } = await supabase.from('sales').insert([saleData]).select().single();
      if (saleError) throw saleError;

      // Se for crédito e não proforma, registar parcelas
      if (!isProforma && paymentType === 'credit' && installments > 1) {
        const installmentAmount = subtotal / installments;
        const installmentRecords = Array.from({ length: installments }).map((_, i) => ({
          sale_id: sale.id,
          number: i + 1,
          amount: installmentAmount,
          due_date: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending'
        }));
        await supabase.from('installments').insert(installmentRecords);
      }

      setSuccess({ type: isProforma ? 'proforma' : 'sale' });
      setTimeout(() => {
        setSuccess(null);
        setView('list');
        setCart([]);
        setSelectedClientId('');
      }, 2500);
    } catch (err) {
      alert("Erro ao gravar documento.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('clients').insert([{
        name: newClientName,
        nuit: newClientNuit,
        phone: newClientPhone
      }]).select().single();
      if (error) throw error;
      
      const newC: Client = { id: data.id, name: data.name, nuit: data.nuit, phone: data.phone, address: '', creditLimit: 0, balance: 0 };
      setClients(prev => [...prev, newC].sort((a,b) => a.name.localeCompare(b.name)));
      setSelectedClientId(data.id);
      setShowClientForm(false);
    } catch (err: any) { alert(err.message); }
    finally { setIsLoading(false); }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in">
        <div className={`p-10 rounded-full shadow-2xl mb-8 ${success.type === 'proforma' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
          {success.type === 'proforma' ? <FileText size={100} /> : <CheckCircle2 size={100} />}
        </div>
        <h2 className="text-4xl font-black text-gray-800 uppercase tracking-tighter">
          {success.type === 'proforma' ? 'Pro-forma Gerada!' : 'Venda Finalizada!'}
        </h2>
        <p className="text-gray-500 mt-4 text-lg font-medium max-w-md mx-auto">
          {success.type === 'proforma' 
            ? 'A cotação foi salva no sistema e está pronta para ser enviada ao cliente.' 
            : 'O estoque foi abatido e a transação financeira registrada.'}
        </p>
        <button onClick={() => setSuccess(null)} className={`mt-12 text-white px-16 py-5 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.3em] shadow-2xl transition-all active:scale-95 ${success.type === 'proforma' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}>
          {success.type === 'proforma' ? 'Fazer Nova Cotação' : 'Próximo Atendimento'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Vendas & Balcão</h2>
          <p className="text-gray-500 italic font-medium">PDV Integrado com Pro-formas</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          {view === 'list' ? (
            <button onClick={() => setView('new')} className="flex-1 md:flex-none bg-emerald-600 text-white px-8 py-5 rounded-3xl flex items-center justify-center shadow-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all">
              <Plus size={20} className="mr-2" /> Iniciar Venda
            </button>
          ) : (
            <button onClick={() => setView('list')} className="text-gray-400 hover:text-red-500 font-black uppercase text-xs flex items-center transition-colors">
              <ChevronLeft size={18} className="mr-1" /> Fechar Caixa
            </button>
          )}
        </div>
      </header>

      {view === 'new' && (
        <div className="flex flex-col lg:flex-row gap-8 animate-in slide-in-from-right-8 duration-500">
          
          {/* LADO ESQUERDO: PDV Grid */}
          <div className="flex-1 space-y-6">
            
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                  type="text" 
                  placeholder="Filtrar produtos por nome ou código..."
                  value={productSearchQuery}
                  onChange={e => setProductSearchQuery(e.target.value)}
                  className="w-full p-5 pl-14 bg-gray-50 rounded-2xl font-bold border-none focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                />
              </div>
              <button 
                onClick={() => setShowClientForm(!showClientForm)}
                className={`px-6 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${showClientForm ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}
              >
                {showClientForm ? 'Lista Clientes' : '+ Novo Cliente'}
              </button>
            </div>

            {showClientForm && (
              <div className="bg-emerald-50 p-8 rounded-[2.5rem] border-2 border-dashed border-emerald-200 animate-in slide-in-from-top-4">
                <form onSubmit={handleAddClient} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input required placeholder="Nome Completo" value={newClientName} onChange={e => setNewClientName(e.target.value)} className="p-4 bg-white rounded-xl font-bold border-none shadow-sm" />
                  <input placeholder="NUIT" value={newClientNuit} onChange={e => setNewClientNuit(e.target.value)} className="p-4 bg-white rounded-xl font-bold border-none shadow-sm" />
                  <input placeholder="Telefone" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} className="p-4 bg-white rounded-xl font-bold border-none shadow-sm" />
                  <button type="submit" className="md:col-span-3 py-4 bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg">Registrar Agora</button>
                </form>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {filteredProducts.map(p => (
                <button 
                  key={p.id} 
                  onClick={() => addToCart(p)}
                  className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all flex flex-col items-start group active:scale-95 text-left relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-2 h-full ${p.currentStock <= p.minStock ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                  <div className="mb-4 bg-gray-50 p-3 rounded-2xl text-gray-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <LayoutGrid size={24} />
                  </div>
                  <p className="font-black text-gray-900 text-sm leading-tight mb-1 line-clamp-2 uppercase tracking-tight">{p.name}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-4">{p.sku}</p>
                  <div className="mt-auto w-full">
                    <p className="text-xl font-black text-emerald-600">MT {p.salePrice.toLocaleString()}</p>
                    <div className="flex justify-between items-center mt-2 opacity-60">
                      <span className="text-[8px] font-black tracking-widest">{p.unit}</span>
                      <span className={`text-[8px] font-black tracking-widest ${p.currentStock <= p.minStock ? 'text-red-500' : 'text-gray-400'}`}>Est: {p.currentStock}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* LADO DIREITO: Carrinho e Checkout */}
          <div className="w-full lg:w-[400px] flex flex-col space-y-6">
            
            <div className="bg-emerald-950 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/50 mb-4 flex items-center">
                <User size={14} className="mr-2" /> Atendimento Ativo
              </h3>
              <select 
                value={selectedClientId} 
                onChange={e => setSelectedClientId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-black text-sm text-white outline-none appearance-none"
              >
                <option value="" className="text-emerald-900">Selecione o Cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id} className="text-emerald-900">{c.name}</option>)}
              </select>
            </div>

            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 space-y-3 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-200">
                    <ShoppingCart size={40} className="mb-2 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Carrinho Vazio</p>
                  </div>
                ) : cart.map(item => (
                  <div key={item.product.id} className="bg-gray-50 rounded-2xl p-4 group border border-transparent hover:border-emerald-100 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-black text-[12px] text-gray-800 uppercase tracking-tight leading-tight">{item.product.name}</p>
                      <button onClick={() => setCart(cart.filter(i => i.product.id !== item.product.id))} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center bg-white rounded-xl p-1 shadow-sm">
                        <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1.5 text-gray-400"><Minus size={14} /></button>
                        <span className="w-8 text-center font-black text-xs">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1.5 text-gray-400"><Plus size={14} /></button>
                      </div>
                      <span className="font-black text-gray-900 text-sm">MT {(item.product.salePrice * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100 space-y-6">
                <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                  <button onClick={() => setPaymentType('cash')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center ${paymentType === 'cash' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}>
                    <Banknote size={14} className="mr-2" /> Cash
                  </button>
                  <button onClick={() => setPaymentType('credit')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center ${paymentType === 'credit' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}>
                    <CreditCard size={14} className="mr-2" /> Crédito
                  </button>
                </div>

                <div className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-1">Total Documento</span>
                  <span className="text-4xl font-black text-emerald-600 tracking-tighter">MT {subtotal.toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => handleFinalize(false)}
                    disabled={isLoading || cart.length === 0 || !selectedClientId}
                    className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest text-[11px] transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center"
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Zap size={18} className="mr-2 fill-current" />}
                    Concluir Venda
                  </button>
                  
                  <button 
                    onClick={() => handleFinalize(true)}
                    disabled={isLoading || cart.length === 0 || !selectedClientId}
                    className="w-full py-6 bg-white border-2 border-emerald-600 text-emerald-600 rounded-[2rem] font-black uppercase tracking-widest text-[11px] transition-all hover:bg-emerald-50 active:scale-95 disabled:opacity-20 flex items-center justify-center"
                  >
                    <FileText size={18} className="mr-2" /> Gerar Pro-forma
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'list' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Dashboard Rápido de Vendas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Histórico</p>
                <p className="text-xl font-black text-gray-900">MT {salesHistory.reduce((acc, s) => acc + s.total, 0).toLocaleString()}</p>
             </div>
             <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 shadow-sm">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Cotações Pro-forma</p>
                <p className="text-xl font-black text-blue-600">{salesHistory.filter(s => s.status === 'proforma').length} Documentos</p>
             </div>
          </div>

          <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
               <h3 className="font-black text-lg text-gray-800 uppercase tracking-tight flex items-center">
                 <History size={20} className="mr-2 text-emerald-600" /> Registos Recentes
               </h3>
               <div className="flex bg-gray-100 p-1 rounded-2xl">
                 <button onClick={() => setListFilter('all')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${listFilter === 'all' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}>Tudo</button>
                 <button onClick={() => setListFilter('confirmed')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${listFilter === 'confirmed' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}>Vendas</button>
                 <button onClick={() => setListFilter('proforma')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${listFilter === 'proforma' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}>Pro-formas</button>
               </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-5 font-black uppercase text-[10px] text-gray-400 tracking-widest">Documento / Data</th>
                    <th className="px-8 py-5 font-black uppercase text-[10px] text-gray-400 tracking-widest">Cliente</th>
                    <th className="px-8 py-5 font-black uppercase text-[10px] text-gray-400 tracking-widest">Estado</th>
                    <th className="px-8 py-5 font-black uppercase text-[10px] text-gray-400 tracking-widest text-right">Valor Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    <tr><td colSpan={4} className="p-20 text-center text-[10px] font-black text-emerald-600 animate-pulse">Sincronizando com a Nuvem...</td></tr>
                  ) : salesHistory.length === 0 ? (
                    <tr><td colSpan={4} className="p-20 text-center text-[10px] font-black text-gray-300">Nenhum registo encontrado</td></tr>
                  ) : salesHistory.map(sale => (
                    <tr key={sale.id} className="hover:bg-gray-50/50 group transition-colors">
                      <td className="px-8 py-5">
                        <p className="font-black text-gray-900 text-sm">#{sale.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(sale.date).toLocaleDateString()}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="font-black text-gray-800 text-sm uppercase">{sale.client_name || 'Consumidor Final'}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          sale.status === 'proforma' ? 'bg-blue-50 text-blue-500' : 
                          sale.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {sale.status === 'proforma' ? 'PRO-FORMA' : (sale.status === 'paid' ? 'PAGO' : 'PENDENTE')}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-gray-900">
                        MT {sale.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
