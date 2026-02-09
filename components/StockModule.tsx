import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Package, 
  ChevronLeft, 
  Save, 
  Trash2,
  Edit3,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Download,
  Printer,
  FileText,
  Calendar,
  XCircle,
  TrendingUp,
  History,
  User as UserIcon
} from 'lucide-react';
import { Product } from '../types';
import { supabase } from '../services/supabase';

type StockView = 'list' | 'form' | 'report' | 'history';

export const StockModule: React.FC = () => {
  const [view, setView] = useState<StockView>('list');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockHistory, setStockHistory] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (error) throw error;
      if (data) {
        setProducts(data.map(p => ({
          id: p.id, sku: p.sku, name: p.name, unit: p.unit,
          costPrice: p.cost_price, salePrice: p.sale_price,
          minStock: p.min_stock, currentStock: p.current_stock
        })));
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  const fetchStockHistory = async (productId: string) => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('stock_movements')
        .select('*, system_users(name)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      if (data) setStockHistory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [products, searchQuery]);

  const totalInventoryValue = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.currentStock * p.costPrice), 0);
  }, [products]);

  const exportCSV = (data: any[], filename: string) => {
    if(!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  if (successMsg) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-in zoom-in duration-300">
        <div className="bg-emerald-100 p-6 rounded-full text-emerald-600 shadow-xl"><CheckCircle2 size={64} /></div>
        <h2 className="text-2xl font-black text-gray-800">{successMsg}</h2>
        <button onClick={() => setSuccessMsg('')} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs">Continuar</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-header { display: block !important; border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
          .print-table { width: 100% !important; border-collapse: collapse; }
          .print-table th, .print-table td { border: 1px solid #e5e7eb; padding: 10px; font-size: 10px; }
        }
      `}</style>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight uppercase">Stock & Armazém</h2>
          <p className="text-gray-500 font-medium italic">Gestão de Inventário e Balanços</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          {view === 'list' && (
            <>
              <button onClick={() => setView('report')} className="bg-white border border-gray-200 text-gray-600 px-6 py-4 rounded-2xl flex items-center shadow-sm font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-all"><FileText size={18} className="mr-2" /> Relatório</button>
              <button onClick={() => { setView('form'); setSelectedProduct(null); }} className="bg-emerald-600 text-white px-6 py-4 rounded-2xl flex items-center shadow-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all"><Plus size={18} className="mr-2" /> Novo Item</button>
            </>
          )}
          {view !== 'list' && <button onClick={() => setView('list')} className="text-gray-400 hover:text-red-500 font-black uppercase text-xs flex items-center"><ChevronLeft size={18} className="mr-1" /> Voltar à Lista</button>}
        </div>
      </header>

      {/* FILTROS DE DATA NO-PRINT */}
      {view !== 'form' && (
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center no-print">
          <div className="flex items-center space-x-3 w-full">
            <Calendar size={18} className="text-emerald-600" />
            <div className="flex-1 grid grid-cols-2 gap-2">
              <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="p-3 bg-gray-50 rounded-xl text-[10px] font-black outline-none" />
              <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="p-3 bg-gray-50 rounded-xl text-[10px] font-black outline-none" />
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={() => { setDateStart(''); setDateEnd(''); }} className="p-3 bg-gray-100 text-gray-400 rounded-xl hover:text-red-500"><XCircle size={18} /></button>
            {/* Fix: replaced undefined FileDown with imported Download icon */}
            <button onClick={() => exportCSV(view === 'history' ? stockHistory : filteredProducts, `Stock_${view}`)} className="bg-white border border-gray-200 px-6 py-3 rounded-xl text-[10px] font-black uppercase flex items-center hover:bg-gray-50"><Download size={14} className="mr-2" /> CSV</button>
            <button onClick={handlePrint} className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase flex items-center shadow-lg"><Printer size={14} className="mr-2" /> PDF</button>
          </div>
        </div>
      )}

      {view === 'report' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-8 print-content">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
              <div className="bg-emerald-950 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 opacity-60 mb-2">Valor Total do Inventário (Custo)</p>
                <p className="text-4xl font-black">MT {totalInventoryValue.toLocaleString()}</p>
                <TrendingUp size={100} className="absolute -bottom-5 -right-5 opacity-5" />
              </div>
           </div>

           <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
             <div className="hidden print:block mb-8 border-b-2 border-emerald-500 pb-4">
                <h1 className="text-2xl font-black">RELATÓRIO DE INVENTÁRIO - WYMDY COMPANY</h1>
                <p className="text-xs font-bold text-gray-500">Emitido em: {new Date().toLocaleString()}</p>
             </div>
             
             <table className="w-full text-left print-table">
               <thead>
                 <tr className="border-b-2 border-gray-100">
                   <th className="pb-4 font-black uppercase text-[10px] text-gray-400 px-2">Produto</th>
                   <th className="pb-4 font-black uppercase text-[10px] text-gray-400 text-center">Stock</th>
                   <th className="pb-4 font-black uppercase text-[10px] text-gray-400 text-right">Custo Unit</th>
                   <th className="pb-4 font-black uppercase text-[10px] text-gray-400 text-right">Valor Total</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {filteredProducts.map(p => (
                   <tr key={p.id}>
                     <td className="py-4 px-2">
                        <p className="font-black text-gray-900 text-xs">{p.name}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">{p.sku}</p>
                     </td>
                     <td className="py-4 px-2 text-center font-black text-gray-800 text-xs">{p.currentStock} {p.unit}</td>
                     <td className="py-4 px-2 text-right text-[10px] font-bold">MT {p.costPrice.toLocaleString()}</td>
                     <td className="py-4 px-2 text-right font-black text-gray-900 text-xs">MT {(p.currentStock * p.costPrice).toLocaleString()}</td>
                   </tr>
                 ))}
                 <tr className="bg-gray-50">
                   <td colSpan={3} className="py-6 px-2 font-black uppercase text-xs">Avaliação Bruta de Ativos</td>
                   <td className="py-6 px-2 text-right font-black text-emerald-600 text-lg">MT {totalInventoryValue.toLocaleString()}</td>
                 </tr>
               </tbody>
             </table>
           </div>
        </div>
      )}

      {view === 'history' && selectedProduct && (
        <div className="space-y-8 animate-in slide-in-from-right-8 print-content">
          <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100">
             <div className="flex items-center space-x-4 mb-8">
                <div className="bg-emerald-50 p-4 rounded-3xl text-emerald-600"><History size={32} /></div>
                <div>
                   <h3 className="text-xl font-black uppercase tracking-tight">{selectedProduct.name}</h3>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Histórico Completo de Movimentos</p>
                </div>
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-left print-table">
                 <thead>
                   <tr className="border-b-2 border-gray-100">
                     <th className="pb-4 font-black uppercase text-[10px] text-gray-400 px-2">Data / Hora</th>
                     <th className="pb-4 font-black uppercase text-[10px] text-gray-400 text-center">Tipo</th>
                     <th className="pb-4 font-black uppercase text-[10px] text-gray-400 text-center">Quantidade</th>
                     <th className="pb-4 font-black uppercase text-[10px] text-gray-400 px-2">Utilizador</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                   {isLoading ? (
                     <tr><td colSpan={4} className="p-10 text-center animate-pulse font-black text-emerald-600 uppercase text-[10px]">Carregando logs...</td></tr>
                   ) : stockHistory.length === 0 ? (
                     <tr><td colSpan={4} className="p-10 text-center font-black text-gray-300 uppercase text-[10px]">Sem movimentos registrados</td></tr>
                   ) : stockHistory.map(move => (
                     <tr key={move.id}>
                       <td className="py-4 px-2 text-xs font-bold text-gray-600">{new Date(move.created_at).toLocaleString()}</td>
                       <td className="py-4 px-2 text-center">
                         <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                           move.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 
                           move.type === 'OUT' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                         }`}>
                           {move.type}
                         </span>
                       </td>
                       <td className="py-4 px-2 text-center font-black text-gray-900 text-sm">
                         {move.type === 'OUT' ? '-' : '+'}{move.quantity}
                       </td>
                       <td className="py-4 px-2 text-xs font-bold text-gray-400 uppercase">
                         {move.system_users?.name || 'Sistema'}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      )}

      {view === 'list' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-gray-100 no-print">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Pesquisar por nome ou SKU..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
            {isLoading ? (
              <div className="col-span-full py-20 text-center text-emerald-600 font-black animate-pulse flex flex-col items-center">
                <Loader2 size={32} className="animate-spin mb-4" /> SINCRONIZANDO...
              </div>
            ) : filteredProducts.map(product => (
              <div key={product.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:border-emerald-200 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-emerald-50 p-4 rounded-3xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all"><Package size={28} /></div>
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${product.currentStock <= product.minStock ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {product.currentStock <= product.minStock ? 'Stock Baixo' : 'Ok'}
                  </span>
                </div>
                <h4 className="font-black text-xl text-gray-900 tracking-tight">{product.name}</h4>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-6">{product.sku}</p>
                
                <div className="flex justify-between items-end pt-6 border-t border-gray-50">
                  <div>
                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Qtd Atual</p>
                    <p className="text-2xl font-black text-gray-900">{product.currentStock} <span className="text-xs font-bold text-gray-400">{product.unit}</span></p>
                  </div>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => { setSelectedProduct(product); setView('history'); fetchStockHistory(product.id); }}
                      className="p-3 bg-gray-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all"
                      title="Ver Histórico"
                    >
                      <History size={18} />
                    </button>
                    <button 
                      onClick={() => { setSelectedProduct(product); setView('form'); }} 
                      className="p-3 bg-gray-50 text-gray-400 hover:bg-emerald-600 hover:text-white rounded-xl transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'form' && (
        <div className="max-w-4xl mx-auto no-print">
          <form className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-100 space-y-8" onSubmit={(e) => {
            e.preventDefault();
            const target = e.target as any;
            const payload = {
              sku: target.sku.value,
              name: target.name.value,
              unit: target.unit.value,
              cost_price: Number(target.costPrice.value),
              sale_price: Number(target.salePrice.value),
              min_stock: Number(target.minStock.value),
              current_stock: Number(target.currentStock.value)
            };
            setIsLoading(true);
            const query = selectedProduct 
              ? supabase.from('products').update(payload).eq('id', selectedProduct.id)
              : supabase.from('products').insert([payload]);
            
            query.then(({error}) => {
              if(!error) {
                setSuccessMsg("Produto guardado!");
                fetchProducts();
                setView('list');
              }
              setIsLoading(false);
            });
          }}>
            <h3 className="text-2xl font-black uppercase tracking-tight">{selectedProduct ? 'Editar Produto' : 'Novo Produto'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input name="name" defaultValue={selectedProduct?.name} placeholder="Nome do Produto" required className="p-4 bg-gray-50 rounded-xl font-bold outline-none" />
              <input name="sku" defaultValue={selectedProduct?.sku} placeholder="SKU / Código" required className="p-4 bg-gray-50 rounded-xl font-bold outline-none" />
              <input name="unit" defaultValue={selectedProduct?.unit} placeholder="Unidade (Kg, Uni, L)" required className="p-4 bg-gray-50 rounded-xl font-bold outline-none" />
              <input name="costPrice" type="number" step="0.01" defaultValue={selectedProduct?.costPrice} placeholder="Preço de Custo" required className="p-4 bg-gray-50 rounded-xl font-bold outline-none" />
              <input name="salePrice" type="number" step="0.01" defaultValue={selectedProduct?.salePrice} placeholder="Preço de Venda" required className="p-4 bg-gray-50 rounded-xl font-bold outline-none" />
              <input name="minStock" type="number" defaultValue={selectedProduct?.minStock} placeholder="Stock Mínimo" required className="p-4 bg-gray-50 rounded-xl font-bold outline-none" />
              <input name="currentStock" type="number" defaultValue={selectedProduct?.currentStock} placeholder="Stock Inicial" required className="p-4 bg-gray-50 rounded-xl font-bold outline-none" />
            </div>
            <button type="submit" className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl">Confirmar Registro</button>
          </form>
        </div>
      )}
    </div>
  );
};