
import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertCircle,
  Plus,
  Sparkles
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Visão Geral</h2>
          <p className="text-gray-500">Bem-vindo à Wymdy Company</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-emerald-600 text-white p-2 md:px-4 md:py-2 rounded-xl flex items-center shadow-lg hover:bg-emerald-700 transition-all">
            <Plus size={20} className="md:mr-2" />
            <span className="hidden md:inline">Nova Venda</span>
          </button>
        </div>
      </header>

      {/* Insights Section */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 flex items-start space-x-4 shadow-sm">
        <div className="bg-emerald-500 p-2 rounded-lg text-white">
          <Sparkles size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-emerald-800">Insights IA</h4>
          <p className="text-sm text-emerald-700 leading-relaxed mt-1">{insight}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {MOCK_STATS.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">{stat.icon}</div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                stat.positive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-xs font-medium text-gray-500 mb-1">{stat.name}</h3>
            <p className="text-lg font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Vendas da Semana</h3>
            <select className="text-xs bg-gray-50 border-none rounded-lg focus:ring-emerald-500">
              <option>Esta Semana</option>
              <option>Mês Passado</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
                  {MOCK_CHART_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 2 ? '#10b981' : '#d1fae5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">Alertas Críticos</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-xl border border-red-100">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <div className="flex-1">
                <p className="text-xs font-bold text-red-900">Ureia 50kg</p>
                <p className="text-[10px] text-red-700">Stock Crítico (2 uni)</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <div className="flex-1">
                <p className="text-xs font-bold text-amber-900">José Marico</p>
                <p className="text-[10px] text-amber-700">Parcela Vencida (3 dias)</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <div className="flex-1">
                <p className="text-xs font-bold text-emerald-900">Sementes Milho</p>
                <p className="text-[10px] text-emerald-700">Entrada Confirmada</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-6 py-3 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors">
            Ver Todos Alertas
          </button>
        </div>
      </div>
    </div>
  );
};
