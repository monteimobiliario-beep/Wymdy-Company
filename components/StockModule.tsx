
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertTriangle, 
  Package, 
  History, 
  ChevronLeft, 
  Save, 
  Trash2,
  Box,
  LayoutGrid,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Product, StockMovement } from '../types';

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', sku: 'FERT-001', name: 'Fertilizante NPK 15-15-15', unit: 'Saco 50kg', costPrice: 1200, salePrice: 1850, minStock: 20, currentStock: 45 },
  { id: '2', sku: 'SEM-M-02', name: 'Sementes de Milho Híbrido', unit: 'Saco 10kg', costPrice: 2500, salePrice: 3800, minStock: 10, currentStock: 8 },
  { id: '3', sku: 'PES-005', name: 'Herbicida Roundup', unit: 'Litro', costPrice: 450, salePrice: 750, minStock: 50, currentStock: 120 },
  { id: '4', sku: 'FERT-002', name: 'Ureia 46%', unit: 'Saco 50kg', costPrice: 1100, salePrice: 1600, minStock: 15, currentStock: 2 },
];

const MOCK_MOVEMENTS: StockMovement[] = [
  { id: 'm1', productId: '1', type: 'IN', quantity: 50, date: '2023-10-25', userId: 'admin', refDoc: 'Compra #45' },
  { id: 'm2', productId: '2', type: 'OUT', quantity: 5, date: '2023-10-25', userId: 'seller', refDoc: 'Venda V001' },
  { id: 'm3', productId: '4', type: 'ADJ', quantity: -3, date: '2023-10-24', userId: 'admin', refDoc: 'Quebra' },
];

export const StockModule: React.FC = () => {
  const [view, setView] = useState<'list' | 'form' | 'movement' | 'history'>('list');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'low'>('all');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'all' || p.currentStock <= p.minStock;
      return matchesSearch && matchesTab;
    });
  }, [products, searchQuery, activeTab]);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Logic for saving/updating product
    showNotification(selectedProduct ? "Produto atualizado com sucesso!" : "Produto cadastrado com sucesso!");
    setView('list');
    setSelectedProduct(null);
  };

  const handleMovement = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Logic for processing movement
    showNotification("Movimentação registrada com sucesso!");
    setView('list');
  };

  if (successMsg) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-in zoom-in duration-300">
        <div className="bg-emerald-100 p-6 rounded-full text-emerald-600">
          <CheckCircle2 size={64} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{successMsg}</h2>
        <button onClick={() => setSuccessMsg('')} className="text-emerald-600 font-bold">Voltar agora</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Stock & Armazém</h2>
          <p className="text-gray-500">Gestão inteligente de insumos e produtos</p>
        </div>
        
        {view === 'list' && (
          <div className="flex space-x-2">
            <button 
              onClick={() => { setView('movement'); setSelectedProduct(null); }}
              className="flex-1 md:flex-none bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-all active:scale-95"
            >
              <ArrowUpRight size={18} className="mr-2 text-emerald-600" />
              Mover Stock
            </button>
            <button 
              onClick={() => { setView('form'); setSelectedProduct(null); }}
              className="flex-1 md:flex-none bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center justify-center shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
            >
              <Plus size={18} className="mr-2" />
              Novo Artigo
            </button>
          </div>
        )}
      </header>

      {view === 'list' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Search & Tabs */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar por SKU ou nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            <div className="flex p-1 bg-gray-100 rounded-2xl w-full md:w-auto">
              <button 
                onClick={() => setActiveTab('all')}
                className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'all' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500'}`}
              >
                Todos
              </button>
              <button 
                onClick={() => setActiveTab('low')}
                className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${activeTab === 'low' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500'}`}
              >
                Stock Baixo
                <span className="ml-2 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              </button>
            </div>
          </div>

          {/* Product Grid (Mobile) / Table (Desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:hidden">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                onClick={() => { setSelectedProduct(product); setView('form'); }}
                className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
                    <Package size={24} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    product.currentStock <= product.minStock ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {product.currentStock <= product.minStock ? 'Baixo' : 'OK'}
                  </span>
                </div>
                <h4 className="font-bold text-gray-800">{product.name}</h4>
                <p className="text-[10px] text-gray-400 font-black uppercase mb-3">{product.sku}</p>
                <div className="flex justify-between items-end pt-3 border-t border-gray-50">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Disponível</p>
                    <p className="text-lg font-black text-gray-900">{product.currentStock} <span className="text-xs font-medium text-gray-500">{product.unit}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Preço</p>
                    <p className="font-black text-emerald-600">MT {product.salePrice.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden lg:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-50">
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Artigo</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">SKU</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Qtd Atual</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Custo Médio</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px] text-right">Preço Venda</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[10px] text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map((product) => {
                  const isLow = product.currentStock <= product.minStock;
                  return (
                    <tr 
                      key={product.id} 
                      onClick={() => { setSelectedProduct(product); setView('form'); }}
                      className="hover:bg-emerald-50/30 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                            <Box size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{product.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{product.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-gray-400 font-mono text-xs">{product.sku}</td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className={`font-black text-base ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
                            {product.currentStock}
                          </span>
                          <span className="text-[10px] text-gray-400 uppercase font-bold">Mín: {product.minStock}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-gray-500 font-medium italic">MT {product.costPrice.toLocaleString()}</td>
                      <td className="px-6 py-5 text-right font-black text-gray-900">MT {product.salePrice.toLocaleString()}</td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          isLow ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {isLow ? 'REPOR' : 'OK'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
               <Package className="mx-auto text-gray-200 mb-4" size={64} />
               <p className="text-gray-400 font-medium">Nenhum artigo encontrado para sua busca.</p>
            </div>
          )}
        </div>
      ) : view === 'form' ? (
        <div className="animate-in slide-in-from-right-8 duration-300 max-w-4xl mx-auto">
          <button 
            onClick={() => { setView('list'); setSelectedProduct(null); }}
            className="flex items-center text-emerald-600 font-bold text-sm mb-6 hover:translate-x-[-4px] transition-transform"
          >
            <ChevronLeft size={18} className="mr-1" />
            Voltar para Inventário
          </button>

          <form onSubmit={handleSaveProduct} className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100 space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">
                {selectedProduct ? 'Editar Artigo' : 'Novo Artigo'}
              </h3>
              {selectedProduct && (
                <button type="button" className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors">
                  <Trash2 size={20} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nome do Produto</label>
                <input 
                  type="text" 
                  defaultValue={selectedProduct?.name}
                  required
                  placeholder="Ex: Fertilizante Orgânico X"
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-800 placeholder-gray-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">SKU / Código</label>
                <input 
                  type="text" 
                  defaultValue={selectedProduct?.sku}
                  required
                  placeholder="Ex: FERT-ORG-001"
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-mono text-xs uppercase"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Unidade de Medida</label>
                <select 
                  defaultValue={selectedProduct?.unit}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-800 appearance-none"
                >
                  <option>Saco 50kg</option>
                  <option>Saco 10kg</option>
                  <option>Litro</option>
                  <option>Quilograma (kg)</option>
                  <option>Caixa</option>
                  <option>Unidade</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Custo Médio (MT)</label>
                <input 
                  type="number" 
                  defaultValue={selectedProduct?.costPrice}
                  required
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-black text-gray-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Preço de Venda (MT)</label>
                <input 
                  type="number" 
                  defaultValue={selectedProduct?.salePrice}
                  required
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-black text-emerald-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Stock Mínimo</label>
                <input 
                  type="number" 
                  defaultValue={selectedProduct?.minStock}
                  required
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-red-500"
                />
              </div>
              {!selectedProduct && (
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Stock Inicial</label>
                  <input 
                    type="number" 
                    required
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-800"
                  />
                </div>
              )}
            </div>

            <div className="pt-6">
              <button 
                type="submit"
                className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-[0.98] flex items-center justify-center"
              >
                <Save size={20} className="mr-2" />
                {selectedProduct ? 'ATUALIZAR ARTIGO' : 'CADASTRAR ARTIGO'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="animate-in slide-in-from-right-8 duration-300 max-w-4xl mx-auto">
          <button 
            onClick={() => setView('list')}
            className="flex items-center text-emerald-600 font-bold text-sm mb-6 hover:translate-x-[-4px] transition-transform"
          >
            <ChevronLeft size={18} className="mr-1" />
            Voltar para Inventário
          </button>

          <form onSubmit={handleMovement} className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100 space-y-8">
            <h3 className="text-2xl font-black text-gray-800 tracking-tight">
              Lançar Movimentação de Stock
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Selecionar Artigo</label>
                <select required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-800 appearance-none">
                  <option value="">Escolha um produto...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Atual: {p.currentStock})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tipo de Movimento</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" className="py-4 rounded-2xl bg-emerald-50 text-emerald-700 border-2 border-emerald-500 font-black text-xs">ENTRADA</button>
                  <button type="button" className="py-4 rounded-2xl bg-gray-50 text-gray-400 border-2 border-transparent font-black text-xs">SAÍDA</button>
                  <button type="button" className="py-4 rounded-2xl bg-gray-50 text-gray-400 border-2 border-transparent font-black text-xs">AJUSTE</button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Quantidade</label>
                <input 
                  type="number" 
                  required
                  placeholder="0"
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-black text-gray-800"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Motivo / Documento de Referência</label>
                <textarea 
                  rows={3}
                  required
                  placeholder="Ex: Compra do fornecedor X, Venda #123, Quebra de transporte..."
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-medium text-gray-800"
                />
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit"
                className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-[0.98] flex items-center justify-center"
              >
                <CheckCircle2 size={20} className="mr-2" />
                CONFIRMAR MOVIMENTAÇÃO
              </button>
            </div>
          </form>

          {/* Recent Movements for Context */}
          <div className="mt-10 space-y-4">
             <h4 className="font-bold text-gray-400 uppercase text-[10px] tracking-widest flex items-center">
               <History size={14} className="mr-2" />
               Últimos Movimentos
             </h4>
             <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                {MOCK_MOVEMENTS.map((m, i) => (
                  <div key={m.id} className={`p-4 flex items-center justify-between ${i !== MOCK_MOVEMENTS.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        m.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 
                        m.type === 'OUT' ? 'bg-red-100 text-red-600' : 
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {m.type === 'IN' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {m.type === 'IN' ? 'Entrada' : m.type === 'OUT' ? 'Saída' : 'Ajuste'}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium">{m.refDoc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className={`font-black ${m.quantity > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                         {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                       </p>
                       <p className="text-[10px] text-gray-400">{m.date}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
