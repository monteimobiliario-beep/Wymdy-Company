
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ShoppingCart, 
  FileText, 
  Clock, 
  Users, 
  Plus, 
  Trash2, 
  ChevronLeft,
  CreditCard,
  Banknote,
  Search,
  CheckCircle2,
  Percent,
  BanknoteIcon,
  X,
  TrendingUp,
  UserPlus,
  Receipt,
  HandCoins,
  FileCheck
} from 'lucide-react';
import { Product } from '../types';

const MOCK_SALES = [
  { id: 'V001', client: 'César Manhiça', date: '2023-10-24', total: 15400, type: 'credit', status: 'partial' },
  { id: 'V002', client: 'Maria Joaquina', date: '2023-10-25', total: 5200, type: 'cash', status: 'paid' },
  { id: 'V003', client: 'António Cuamba', date: '2023-10-25', total: 28900, type: 'credit', status: 'overdue' },
  { id: 'V004', client: 'Escola Agrária X', date: '2023-10-26', total: 12000, type: 'credit', status: 'pending' },
];

const MOCK_PRODUCTS: Product[] = [
  { id: '1', sku: 'FERT-001', name: 'Fertilizante NPK 15-15-15', unit: 'Saco 50kg', costPrice: 1200, salePrice: 1850, minStock: 20, currentStock: 45 },
  { id: '2', sku: 'SEM-M-02', name: 'Sementes de Milho Híbrido', unit: 'Saco 10kg', costPrice: 2500, salePrice: 3800, minStock: 10, currentStock: 8 },
  { id: '3', sku: 'PES-005', name: 'Herbicida Roundup', unit: 'Litro', costPrice: 450, salePrice: 750, minStock: 50, currentStock: 120 },
  { id: '4', sku: 'FERT-002', name: 'Ureia 46%', unit: 'Saco 50kg', costPrice: 1100, salePrice: 1600, minStock: 15, currentStock: 2 },
];

interface CartItem {
  product: Product;
  quantity: number;
}

export const SalesModule: React.FC = () => {
  const [view, setView] = useState<'list' | 'new'>('list');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentType, setPaymentType] = useState<'cash' | 'credit'>('cash');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [installments, setInstallments] = useState(1);
  const [interestRate, setInterestRate] = useState(0); // Percentual de juros para crédito
  const [success, setSuccess] = useState(false);
  
  // Product Search State
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductResults, setShowProductResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Discount state
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');

  const subtotal = useMemo(() => 
    cart.reduce((acc, item) => acc + (item.product.salePrice * item.quantity), 0)
  , [cart]);

  const discountAmount = useMemo(() => {
    if (discountType === 'percent') {
      return (subtotal * discountValue) / 100;
    }
    return discountValue;
  }, [subtotal, discountValue, discountType]);

  const amountAfterDiscount = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const interestAmount = useMemo(() => {
    if (paymentType === 'cash') return 0;
    return (amountAfterDiscount * interestRate) / 100;
  }, [paymentType, amountAfterDiscount, interestRate]);

  const finalTotal = useMemo(() => {
    return amountAfterDiscount + interestAmount;
  }, [amountAfterDiscount, interestAmount]);

  // Handle outside clicks for search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowProductResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!productSearchQuery.trim()) return [];
    const query = productSearchQuery.toLowerCase();
    return MOCK_PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.sku.toLowerCase().includes(query)
    );
  }, [productSearchQuery]);

  const addToCart = () => {
    if (selectedProduct) {
      const existing = cart.find(item => item.product.id === selectedProduct.id);
      if (existing) {
        setCart(cart.map(item => 
          item.product.id === selectedProduct.id 
            ? { ...item, quantity: item.quantity + itemQuantity }
            : item
        ));
      } else {
        setCart([...cart, { product: selectedProduct, quantity: itemQuantity }]);
      }
      setSelectedProduct(null);
      setProductSearchQuery('');
      setItemQuantity(1);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.product.id !== id));
  };

  const handleFinalize = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setView('list');
      setCart([]);
      setDiscountValue(0);
      setInterestRate(0);
      setInstallments(1);
      setPaymentType('cash');
    }, 2000);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-in zoom-in duration-300">
        <div className="bg-emerald-100 p-6 rounded-full text-emerald-600">
          <CheckCircle2 size={64} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Venda Realizada!</h2>
        <p className="text-gray-500">Documento gerado com sucesso.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Vendas & Clientes</h2>
          <p className="text-gray-500">Pedidos, Proformas e Créditos</p>
        </div>
        {view === 'list' && (
          <button 
            onClick={() => setView('new')}
            className="bg-emerald-600 text-white px-6 py-2 rounded-xl flex items-center shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
          >
            <Plus size={20} className="mr-2" />
            Nova Venda
          </button>
        )}
      </header>

      {view === 'list' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 text-emerald-600 mb-2">
                <FileText size={18} />
                <h4 className="text-xs font-bold uppercase tracking-wider">A Receber</h4>
              </div>
              <p className="text-2xl font-bold">MT 145.200</p>
              <p className="text-xs text-gray-500 mt-1">Total de parcelas em aberto</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 text-red-600 mb-2">
                <Clock size={18} />
                <h4 className="text-xs font-bold uppercase tracking-wider">Vencido</h4>
              </div>
              <p className="text-2xl font-bold">MT 32.800</p>
              <p className="text-xs text-gray-500 mt-1">Atrasos superiores a 15 dias</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 text-blue-600 mb-2">
                <Users size={18} />
                <h4 className="text-xs font-bold uppercase tracking-wider">Clientes</h4>
              </div>
              <p className="text-2xl font-bold">128</p>
              <p className="text-xs text-gray-500 mt-1">Base cadastrada ativa</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="font-bold">Vendas Recentes</h3>
              <div className="flex space-x-2">
                <button className="text-xs px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg">Todas</button>
                <button className="text-xs px-3 py-1 hover:bg-gray-50 rounded-lg">Crédito</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-3 font-semibold text-gray-600">ID</th>
                    <th className="px-6 py-3 font-semibold text-gray-600">Cliente</th>
                    <th className="px-6 py-3 font-semibold text-gray-600">Total</th>
                    <th className="px-6 py-3 font-semibold text-gray-600">Tipo</th>
                    <th className="px-6 py-3 font-semibold text-gray-600 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {MOCK_SALES.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{sale.id}</td>
                      <td className="px-6 py-4 font-bold text-gray-800">{sale.client}</td>
                      <td className="px-6 py-4 font-bold">MT {sale.total.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          sale.type === 'credit' ? 'text-purple-700' : 'text-blue-700'
                        }`}>
                          {sale.type === 'credit' ? 'Parcelado' : 'A Vista'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          sale.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                          sale.status === 'overdue' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {sale.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in slide-in-from-right-8 duration-300">
          <button 
            onClick={() => setView('list')}
            className="flex items-center text-emerald-600 font-bold text-sm mb-6 hover:translate-x-[-4px] transition-transform"
          >
            <ChevronLeft size={18} className="mr-1" />
            Voltar para Listagem
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Side */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-6 flex items-center text-gray-800">
                  <Users className="mr-2 text-emerald-600" size={20} />
                  Dados do Cliente
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Selecionar Cliente</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <select className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 appearance-none text-gray-700 font-medium">
                        <option>Pesquisar Cliente por Nome ou NUIT...</option>
                        <option>César Manhiça (NUIT 100234123)</option>
                        <option>Maria Joaquina (NUIT 122934123)</option>
                        <option>Avulso / Balcão</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all flex flex-col items-center justify-center space-y-2 group active:scale-95">
                  <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <FileText size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-emerald-700">Proforma</span>
                </button>
                <button className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all flex flex-col items-center justify-center space-y-2 group active:scale-95">
                  <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FileCheck size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-blue-700">Fatura</span>
                </button>
                <button className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-100 transition-all flex flex-col items-center justify-center space-y-2 group active:scale-95">
                  <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <HandCoins size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-amber-700">Pagamento</span>
                </button>
                <button className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col items-center justify-center space-y-2 group active:scale-95">
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <UserPlus size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-indigo-700">Novo Cliente</span>
                </button>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-6 flex items-center text-gray-800">
                  <Plus className="mr-2 text-emerald-600" size={20} />
                  Adicionar Produtos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-7 relative" ref={searchContainerRef}>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Artigo (Nome ou SKU)</label>
                    
                    {selectedProduct ? (
                      <div className="flex items-center justify-between w-full p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl">
                        <div className="flex flex-col">
                          <span className="font-bold text-emerald-900">{selectedProduct.name}</span>
                          <span className="text-[10px] text-emerald-600 uppercase font-black">{selectedProduct.sku}</span>
                        </div>
                        <button onClick={() => setSelectedProduct(null)} className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-600">
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          placeholder="Pesquisar produto..."
                          value={productSearchQuery}
                          onFocus={() => setShowProductResults(true)}
                          onChange={(e) => {
                            setProductSearchQuery(e.target.value);
                            setShowProductResults(true);
                          }}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-medium text-gray-700"
                        />
                        
                        {showProductResults && productSearchQuery.trim() !== '' && (
                          <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                            {filteredProducts.length > 0 ? (
                              <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
                                {filteredProducts.map(p => (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedProduct(p);
                                      setShowProductResults(false);
                                    }}
                                    className="w-full flex items-center justify-between p-4 hover:bg-emerald-50 transition-colors text-left"
                                  >
                                    <div>
                                      <p className="font-bold text-gray-900">{p.name}</p>
                                      <p className="text-[10px] text-gray-400 font-black uppercase">{p.sku}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold text-emerald-600">MT {p.salePrice.toLocaleString()}</p>
                                      <p className="text-[10px] text-gray-400">Stock: {p.currentStock}</p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="p-6 text-center text-gray-400 text-sm italic">
                                Nenhum produto encontrado.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Qtd</label>
                    <input 
                      type="number" 
                      min="1"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-center"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button 
                      onClick={addToCart}
                      disabled={!selectedProduct}
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none"
                    >
                      <Plus size={24} className="mx-auto" />
                    </button>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Carrinho de Compras</label>
                  {cart.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-3xl">
                      <ShoppingCart className="mx-auto text-gray-200 mb-2" size={32} />
                      <p className="text-gray-400 text-sm">O carrinho está vazio</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group transition-all hover:bg-emerald-50">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 text-sm">{item.product.name}</h4>
                            <p className="text-xs text-gray-500">{item.quantity} {item.product.unit} x MT {item.product.salePrice.toLocaleString()}</p>
                          </div>
                          <div className="text-right flex items-center space-x-4">
                            <p className="font-black text-gray-900">MT {(item.product.salePrice * item.quantity).toLocaleString()}</p>
                            <button 
                              onClick={() => removeFromCart(item.product.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Checkout Side */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-6 text-gray-800">Pagamento</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button 
                    onClick={() => setPaymentType('cash')}
                    className={`flex flex-col items-center justify-center p-6 rounded-3xl border-4 transition-all ${
                      paymentType === 'cash' 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-xl shadow-emerald-100 scale-[1.02]' 
                        : 'border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    <Banknote size={32} className="mb-2" />
                    <span className="text-sm font-black uppercase tracking-widest">A Vista</span>
                  </button>
                  <button 
                    onClick={() => setPaymentType('credit')}
                    className={`flex flex-col items-center justify-center p-6 rounded-3xl border-4 transition-all ${
                      paymentType === 'credit' 
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-xl shadow-indigo-100 scale-[1.02]' 
                        : 'border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    <CreditCard size={32} className="mb-2" />
                    <span className="text-sm font-black uppercase tracking-widest">Crédito</span>
                  </button>
                </div>

                {/* Discount Section */}
                <div className="mb-6 animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Aplicar Desconto</label>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <input 
                        type="number" 
                        min="0"
                        value={discountValue || ''}
                        onChange={(e) => setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))}
                        placeholder="0"
                        className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold pointer-events-none">
                        {discountType === 'percent' ? '%' : 'MT'}
                      </div>
                    </div>
                    <div className="flex bg-gray-50 rounded-2xl p-1">
                      <button 
                        type="button"
                        onClick={() => setDiscountType('fixed')}
                        className={`p-3 rounded-xl transition-all ${discountType === 'fixed' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400'}`}
                        title="Valor Fixo"
                      >
                        <BanknoteIcon size={18} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setDiscountType('percent')}
                        className={`p-3 rounded-xl transition-all ${discountType === 'percent' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400'}`}
                        title="Percentual"
                      >
                        <Percent size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {paymentType === 'credit' && (
                  <div className="mb-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Parcelas</label>
                        <input 
                          type="number" 
                          min="1"
                          max="36"
                          value={installments}
                          onChange={(e) => setInstallments(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full p-4 bg-indigo-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-black text-indigo-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Juros (%)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            min="0"
                            step="0.1"
                            value={interestRate || ''}
                            onChange={(e) => setInterestRate(Math.max(0, parseFloat(e.target.value) || 0))}
                            className="w-full p-4 bg-indigo-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-black text-indigo-700"
                            placeholder="0"
                          />
                          <Percent size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-300" />
                        </div>
                      </div>
                    </div>
                    
                    {finalTotal > 0 && (
                      <div className="bg-indigo-900 text-indigo-100 p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-indigo-100">
                        <div>
                          <p className="text-[10px] uppercase font-black opacity-60">Valor por Parcela</p>
                          <p className="text-lg font-black tracking-tighter">MT {(finalTotal / installments).toLocaleString()}</p>
                        </div>
                        <TrendingUp size={20} className="opacity-50" />
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-gray-500">
                    <span className="text-sm font-medium">Subtotal</span>
                    <span className="font-bold">MT {subtotal.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-gray-500">
                      <span className="text-sm font-medium">Desconto</span>
                      <span className="font-bold text-red-500">
                        - MT {discountAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {interestAmount > 0 && (
                    <div className="flex justify-between text-gray-500">
                      <span className="text-sm font-medium">Juros Adicionais</span>
                      <span className="font-bold text-indigo-600">
                        + MT {interestAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-end border-t border-gray-50 pt-4">
                    <span className="text-lg font-bold text-gray-800 tracking-tight uppercase">Total Final</span>
                    <div className="text-right">
                       <p className={`text-3xl font-black tracking-tighter ${paymentType === 'credit' ? 'text-indigo-600' : 'text-emerald-600'}`}>
                         MT {finalTotal.toLocaleString()}
                       </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <button 
                    onClick={handleFinalize}
                    disabled={cart.length === 0}
                    className={`w-full py-5 text-white rounded-3xl font-black shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none ${
                      paymentType === 'credit' 
                        ? 'bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700' 
                        : 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700'
                    }`}
                  >
                    FINALIZAR VENDA
                  </button>
                  <button 
                    disabled={cart.length === 0}
                    className="w-full py-4 border-2 border-gray-100 text-gray-400 rounded-3xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center space-x-2"
                  >
                    <FileCheck size={18} />
                    <span>Gerar Proforma</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
