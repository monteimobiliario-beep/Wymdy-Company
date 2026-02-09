
import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertCircle,
  Plus,
  Sparkles,
  MapPin,
  Calendar
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getSmartInsights } from '../services/geminiService';

const MOCK_STATS = [
  { name: 'Receita Hoje', value: 'MT 45.000', change: '+12%', positive: true, icon: <TrendingUp className="text-emerald-600" /> },
  { name: 'Despesa Hoje', value: 'MT 12.500', change: '-5%', positive: false, icon: <TrendingDown className="text-red-600" /> },
  { name: 'Stock Baixo', value: '14 Itens', change: 'Alert', positive: false, icon: <Package className="text-amber-600" /> },
  { name: 'Pendentes', value: 'MT 89.400', change: '8 faturas', positive: false, icon: <AlertCircle className="text-blue-600" /> },
];

const MOCK_CHART_DATA = [
  { day: 'Seg', sales: 4000 },
  { day: 'Ter', sales: 3000 },
  { day: 'Qua', sales: 5500 },
  { day: 'Qui', sales: 2780 },
  { day: 'Sex', sales: 1890 },
  { day: 'Sáb', sales: 2390 },
  { day: 'Dom', sales: 3490 },
];

export const Dashboard: React.FC = () => {
  const [insight, setInsight] = useState<string>("Carregando insights inteligentes...");

  useEffect(() => {
    async function fetchInsights() {
      const result = await getSmartInsights(MOCK_STATS);
      setInsight(result || "Nenhum insight disponível.");
    }
    fetchInsights();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Hero Section com Imagem de Plantação */}
      <div className="relative h-[400px] w-full rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-white">
        <img 
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000" 
          alt="Plantação" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/20 to-transparent"></div>
        
        <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="text-white space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-black text-[10px] uppercase tracking-[0.4em]">
              <MapPin size={12} />
              <span>Unidade de Produção I - Chimoio</span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter leading-none uppercase">Wymdy <span className="text-emerald-400">Panorama</span></h2>
            <p className="text-white/60 font-medium italic">Dados em tempo real do ecossistema agrícola.</p>
          </div>
          <div className="flex space-x-3 no-print">
            <button className="bg-white text-emerald-900 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-emerald-50 transition-all active:scale-95 flex items-center">
              <Plus size={16} className="mr-2" /> Nova Venda
            </button>
            <div className="bg-emerald-500/20 backdrop-blur-md border border-white/10 px-6 py-4 rounded-2xl flex items-center text-white">
              <Calendar size={16} className="mr-2" />
              <span className="text-[10px] font-black uppercase tracking-widest">{new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats em Cartões Flutuantes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-20 relative z-10 px-4 md:px-10">
        {MOCK_STATS.map((stat, idx) => (
          <div key={idx} className="bg-white/90 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-xl border border-white hover:-translate-y-2 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-50 rounded-2xl">{stat.icon}</div>
              <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${
                stat.positive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.name}</h3>
            <p className="text-xl font-black text-gray-900 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Insights Section - Estilo "Earthy" */}
      <div className="bg-emerald-950 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden border-b-4 border-emerald-500">
        <div className="relative z-10 flex items-start space-x-6">
          <div className="bg-emerald-500 p-4 rounded-3xl text-emerald-950 shadow-lg shadow-emerald-500/20">
            <Sparkles size={28} />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-2">Relatório Estratégico IA</h4>
            <p className="text-lg font-bold text-white leading-tight max-w-3xl">{insight}</p>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 opacity-10 rotate-12">
          <Package size={300} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-black text-xl text-gray-800 uppercase tracking-tight">Desempenho Comercial</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Volume de Vendas Semanais</p>
            </div>
            <select className="text-[10px] font-black uppercase tracking-widest bg-gray-50 border-none rounded-xl px-4 py-2 focus:ring-emerald-500 outline-none">
              <option>Esta Semana</option>
              <option>Mês Passado</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#9ca3af', textAnchor: 'middle'}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#9ca3af'}} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase'}}
                />
                <Bar dataKey="sales" radius={[10, 10, 10, 10]} barSize={40}>
                  {MOCK_CHART_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 2 ? '#10b981' : '#ecfdf5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100">
          <h3 className="font-black text-xl text-gray-800 uppercase tracking-tight mb-8">Estado das Culturas</h3>
          <div className="space-y-6">
            <div className="p-6 bg-red-50 rounded-[2.5rem] border border-red-100 flex items-center group">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-4 animate-ping"></div>
              <div>
                <p className="text-[10px] font-black text-red-900 uppercase tracking-widest mb-1">Milho - Talhão 04</p>
                <p className="text-xs font-bold text-red-700/60">Baixa Irrigação Detectada</p>
              </div>
            </div>
            <div className="p-6 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex items-center">
              <div className="w-3 h-3 rounded-full bg-amber-500 mr-4"></div>
              <div>
                <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1">Armazém Central</p>
                <p className="text-xs font-bold text-amber-700/60">Stock de Fertilizantes Baixo</p>
              </div>
            </div>
            <div className="p-6 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex items-center">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mr-4"></div>
              <div>
                <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-1">Soja - Talhão 02</p>
                <p className="text-xs font-bold text-emerald-700/60">Maturação dentro do esperado</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-10 py-5 bg-gray-50 rounded-[2rem] text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:bg-emerald-50 hover:text-emerald-600 transition-all">
            Consultar Mapa de Campo
          </button>
        </div>
      </div>
    </div>
  );
};
