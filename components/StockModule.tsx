
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
  AlertTriangle
} from 'lucide-react';
import { Product } from '../types';
import { supabase } from '../services/supabase';

export const StockModule: React.FC = () => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [unitFilter, setUnitFilter] = useState('Todas');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;

      if (data) {
        // Mapear de snake_case para camelCase para o resto da app
        const mapped = data.map(p => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          unit: p.unit,
          costPrice: p.cost_price,
          salePrice: p.sale_price,
          minStock: p.min_stock,
          currentStock: p.current_stock
        }));
        setProducts(mapped);
      }
    } catch (e: any) {
      console.error("Erro ao carregar produtos:", e);
      setErrorMsg(e.message || "Erro de conexão com a nuvem.");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesUnit = unitFilter === 'Todas' || p.unit === unitFilter;
      return matchesSearch && matchesUnit;
    });
  }, [products, searchQuery, unitFilter]);

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    const formData = new FormData(e.currentTarget);
    
    // Mapeamento explícito para snake_case da base de dados
    const productData = {
      name: formData.get('name') as string,
      sku: (formData.get('sku') as string).toUpperCase(),
      unit: formData.get('unit') as string,
      cost_price: Number(formData.get('costPrice')),
      sale_price: Number(formData.get('salePrice')),
      min_stock: Number(formData.get('minStock')),
      current_stock: selectedProduct ? selectedProduct.currentStock : Number(formData.get('initialStock') || 0),
    };

    try {
      const { error } = selectedProduct 
        ? await supabase.from('products').update(productData).eq('id', selectedProduct.id)
        : await supabase.from('products').insert([productData]);

      if (error) throw error;

      setSuccessMsg(selectedProduct ? "Artigo atualizado!" : "Novo artigo guardado!");
      await fetchProducts();
      setView('list');
      setSelectedProduct(null);
    } catch (err: any) {
      console.error("Erro Supabase:", err);
      setErrorMsg(`Erro ao gravar: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (successMsg) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-in zoom-in duration-300">
        <div className="bg-emerald-100 p-6 rounded-full text-emerald-600 shadow-xl">
          <CheckCircle2 size={64} />
        </div>
        <h2 className="text-2xl font-black text-gray-800">{successMsg}</h2>
        <button onClick={() => setSuccessMsg('')} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs">Continuar</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight uppercase">Stock & Inventário</h2>
          <p className="text-gray-500 font-medium italic">Sincronizado via Supabase Cloud</p>
        </div>
        
        {view === 'list' && (
          <button 
            onClick={() => { setView('form'); setSelectedProduct(null); setErrorMsg(''); }}
            className="bg-emerald-600 text-white px-6 py-4 rounded-2xl flex items-center shadow-xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all"
          >
            <Plus size={20} className="mr-2" /> Novo Artigo
          </button>
        )}
      </header>

      {errorMsg && (
        <div className="bg-red-50 border-2 border-red-100 p-4 rounded-2xl flex items-center text-red-600 text-sm font-bold animate-in slide-in-from-top-2">
          <AlertTriangle className="mr-3" size={20} />
          {errorMsg}
        </div>
      )}

      {view === 'list' ? (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Procurar SKU ou Nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full py-20 text-center text-emerald-600 font-black animate-pulse flex flex-col items-center">
                <Loader2 size={32} className="animate-spin mb-2" />
                CONECTANDO À NUVEM...
              </div>
            ) : filteredProducts.map(product => (
              <div key={product.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:border-emerald-200 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-emerald-50 p-4 rounded-3xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all cursor-pointer" onClick={() => { setSelectedProduct(product); setView('form'); setErrorMsg(''); }}>
                    <Package size={28} />
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${product.currentStock <= product.minStock ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {product.currentStock <= product.minStock ? 'Stock Baixo' : 'Em Stock'}
                  </span>
                </div>
                <h4 className="font-black text-xl text-gray-900 tracking-tight">{product.name}</h4>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-6">{product.sku}</p>
                <div className="flex justify-between items-end pt-6 border-t border-gray-50">
                  <div>
                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Qtd Disponível</p>
                    <p className="text-2xl font-black text-gray-900">{product.currentStock} <span className="text-xs font-bold text-gray-400">{product.unit}</span></p>
                  </div>
                  <button onClick={() => { setSelectedProduct(product); setView('form'); setErrorMsg(''); }} className="p-3 bg-gray-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all">
                    <Edit3 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="animate-in slide-in-from-right-8 duration-300 max-w-4xl mx-auto pb-10">
          <button onClick={() => setView('list')} className="flex items-center text-emerald-600 font-black text-sm mb-8 hover:translate-x-[-4px] transition-transform uppercase tracking-widest">
            <ChevronLeft size={18} className="mr-1" /> Voltar
          </button>

          <form onSubmit={handleSaveProduct} className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 space-y-8">
            <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">{selectedProduct ? 'Editar Artigo' : 'Novo Cadastro'}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Nome do Produto</label>
                <input name="name" defaultValue={selectedProduct?.name} required className="w-full p-5 bg-gray-50 border-none rounded-2xl font-bold text-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">SKU / Código</label>
                <input name="sku" defaultValue={selectedProduct?.sku} required className="w-full p-5 bg-emerald-50/50 border-none rounded-2xl font-mono font-black uppercase focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Unidade</label>
                <input name="unit" defaultValue={selectedProduct?.unit} required placeholder="Ex: Saco 50kg" className="w-full p-5 bg-gray-50 border-none rounded-2xl font-black focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="p-6 bg-gray-50 rounded-[2rem] space-y-4">
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Preços (MT)</label>
                <input name="costPrice" type="number" step="0.01" defaultValue={selectedProduct?.costPrice} placeholder="Custo" className="w-full p-4 rounded-xl font-black" required />
                <input name="salePrice" type="number" step="0.01" defaultValue={selectedProduct?.salePrice} placeholder="Venda" className="w-full p-4 rounded-xl font-black border-2 border-emerald-100" required />
              </div>
              <div className="p-6 bg-gray-50 rounded-[2rem] space-y-4">
                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Quantidades</label>
                <input name="minStock" type="number" defaultValue={selectedProduct?.minStock} placeholder="Mínimo Alerta" className="w-full p-4 rounded-xl font-black text-red-500" required />
                {!selectedProduct && <input name="initialStock" type="number" placeholder="Stock Inicial" className="w-full p-4 rounded-xl font-black" required />}
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest flex items-center justify-center disabled:opacity-50">
              {isLoading ? <Loader2 className="animate-spin mr-3" size={24} /> : <Save size={24} className="mr-3" />}
              {isLoading ? 'A GRAVAR...' : 'GUARDAR NA NUVEM'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
