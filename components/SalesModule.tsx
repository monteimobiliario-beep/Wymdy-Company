
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  ChevronLeft,
  CreditCard,
  Banknote,
  Search,
  CheckCircle2,
  Percent,
  BanknoteIcon,
  Loader2,
  Info,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { Product, Client } from '../types';
import { supabase } from '../services/supabase';

interface CartItem {
  product: Product;
  quantity: number;
}

export const SalesModule: React.FC = () => {
  const [view, setView] = useState<'list' | 'new'>('list');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [paymentType, setPaymentType] = useState<'cash' | 'credit'>('cash');
  const [isLoading, setIsLoading] = useState(false);
  
  // New Sale State
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [showProductResults, setShowProductResults] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    setIsLoading(true);
    const { data: pData } = await supabase.from('products').select('*');
    const { data: cData } = await supabase.from('clients').select('*');
    
    if (pData) setProducts(pData.map(p => ({
      id: p.id, sku: p.sku, name: p.name, unit: p.unit, 
      costPrice: p.cost_price, salePrice: p.sale_price, 
      minStock: p.min_stock, currentStock: p.current_stock
    })));
    
    if (cData) setClients(cData.map(c => ({
      id: c.id, name: c.name, nuit: c.nuit, phone: c.phone, 
      address: c.address, creditLimit: c.credit_limit, balance: 0
    })));
    setIsLoading(false);
  }

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.product.salePrice * item.quantity), 0), [cart]);
  const discountAmount = useMemo(() => discountType === 'percent' ? (subtotal * discountValue) / 100 : discountValue, [subtotal, discountValue, discountType]);
  const finalTotal = useMemo(() => Math.max(0, subtotal - discountAmount), [subtotal, discountAmount]);

  const handleFinalize = async () => {
    if (!selectedClientId || cart.length === 0) return;
    setIsLoading(true);
    try {
      const saleData = {
        client_id: selectedClientId,
        total: finalTotal,
        discount: discountAmount,
        type: paymentType,
        status: paymentType === 'cash' ? 'paid' : 'pending',
        date: new Date().toISOString().split('T')[0]
      };

      const { error } = await supabase.from('sales').insert([saleData]);
      if (error) throw error;

      // Registrar no log
      await supabase.from('audit_logs').insert([{
        action: 'Nova Venda',
        entity: 'Vendas',
        details: `Venda de MT ${finalTotal.toLocaleString()} para cliente ID ${selectedClientId}`,
        level: 'info'
      }]);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setView('list');
        setCart([]);
        setSelectedClientId('');
      }, 2000);
    } catch (err) {
      alert("Erro ao gravar venda.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in">
        <div className="bg-emerald-100 p-6 rounded-full text-emerald-600 shadow-xl mb-4"><CheckCircle2 size={64} /></div>
        <h2 className="text-2xl font-black text-gray-800 uppercase">Venda Registrada!</h2>
        <button onClick={() => setSuccess(false)} className="mt-6 bg-emerald-600 text-white px-10 py-3 rounded-2xl font-black uppercase text-xs">Continuar</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Vendas & Balcão</h2>
          <p className="text-gray-500 italic">Operação de caixa em tempo real</p>
        </div>
        {view === 'list' && (
          <button onClick={() => setView('new')} className="bg-emerald-600 text-white px-6 py-4 rounded-2xl flex items-center shadow-xl font-black uppercase text-xs tracking-widest">
            <Plus size={20} className="mr-2" /> Nova Venda
          </button>
        )}
      </header>

      {view === 'new' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20 animate-in slide-in-from-right-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h3 className="text-xl font-black mb-6 flex items-center uppercase"><UserPlus className="mr-3 text-emerald-600" /> Cliente</h3>
              <select 
                value={selectedClientId} 
                onChange={e => setSelectedClientId(e.target.value)}
                className="w-full p-5 bg-gray-50 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 border-none outline-none"
              >
                <option value="">Selecione o Cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone || 'Sem fone'})</option>)}
              </select>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h3 className="text-xl font-black mb-6 flex items-center uppercase"><ShoppingCart className="mr-3 text-emerald-600" /> Carrinho</h3>
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Procurar Produto..." 
                  onFocus={() => setShowProductResults(true)}
                  onChange={e => setProductSearchQuery(e.target.value)}
                  className="w-full p-5 pl-12 bg-gray-50 rounded-2xl font-bold border-none outline-none" 
                />
                {showProductResults && productSearchQuery && (
                  <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-60 overflow-y-auto">
                    {products.filter(p => p.name.toLowerCase().includes(productSearchQuery.toLowerCase())).map(p => (
                      <button key={p.id} onClick={() => { setCart([...cart, { product: p, quantity: 1 }]); setShowProductResults(false); }} className="w-full p-4 text-left hover:bg-emerald-50 flex justify-between">
                        <span className="font-bold">{p.name}</span>
                        <span className="font-black text-emerald-600">MT {p.salePrice}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                    <span className="font-bold">{item.product.name}</span>
                    <div className="flex items-center space-x-4">
                      <span className="font-black">MT {item.product.salePrice}</span>
                      <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-red-400"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-100 h-fit sticky top-6">
            <h3 className="text-xl font-black mb-6 uppercase">Total da Venda</h3>
            <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
              <button onClick={() => setPaymentType('cash')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest ${paymentType === 'cash' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}>À Vista</button>
              <button onClick={() => setPaymentType('credit')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest ${paymentType === 'credit' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}>Crédito</button>
            </div>
            <div className="space-y-4 border-t pt-6">
              <div className="flex justify-between font-bold text-gray-400 uppercase text-[10px]"><span>Subtotal</span><span>MT {subtotal}</span></div>
              <div className="flex justify-between items-end border-t pt-4">
                <span className="text-lg font-black uppercase">Total Final</span>
                <span className="text-3xl font-black text-emerald-600">MT {finalTotal}</span>
              </div>
              <button 
                onClick={handleFinalize}
                disabled={isLoading || cart.length === 0}
                className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Confirmar Venda'}
              </button>
              <button onClick={() => setView('list')} className="w-full text-gray-400 font-black text-[10px] uppercase tracking-widest py-2">Cancelar</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-20 rounded-[3rem] text-center border border-dashed border-gray-200">
           <ShoppingCart size={48} className="mx-auto text-gray-200 mb-4" />
           <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Selecione uma ação ou visualize o histórico</p>
        </div>
      )}
    </div>
  );
};
