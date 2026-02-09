
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Plus, 
  Search, 
  ChevronLeft,
  Loader2,
  AlertCircle,
  Save,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '../services/supabase';

export const FinanceModule: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'expenses'>('dashboard');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    setIsLoading(true);
    const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
    if (data) setExpenses(data);
    setIsLoading(false);
  }

  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const expenseData = {
      category: formData.get('category'),
      amount: Number(formData.get('amount')),
      date: formData.get('date'),
      provider: formData.get('provider'),
      description: formData.get('description'),
      status: 'paid'
    };

    try {
      const { error } = await supabase.from('expenses').insert([expenseData]);
      if (error) throw error;
      setSuccess("Despesa registrada com sucesso!");
      await fetchExpenses();
      setTimeout(() => { setSuccess(''); setView('dashboard'); }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const totalExpenses = useMemo(() => expenses.reduce((acc, exp) => acc + Number(exp.amount), 0), [expenses]);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Finanças & Caixa</h2>
          <p className="text-gray-500 italic">Controlo de fluxo e gastos operacionais</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          <button onClick={() => setView('dashboard')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${view === 'dashboard' ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}>Resumo</button>
          <button onClick={() => setView('expenses')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${view === 'expenses' ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}>Despesas</button>
        </div>
      </header>

      {success && <div className="bg-emerald-100 text-emerald-700 p-4 rounded-2xl font-bold flex items-center animate-in slide-in-from-top-4"><CheckCircle2 className="mr-2" /> {success}</div>}

      {view === 'dashboard' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
           <div className="bg-emerald-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <TrendingUp size={48} className="text-emerald-400 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Total de Gastos Acumulados</h3>
                <p className="text-5xl font-black tracking-tighter">MT {totalExpenses.toLocaleString()}</p>
                <button onClick={() => setView('expenses')} className="mt-10 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Registar Nova Saída</button>
              </div>
              <Wallet size={250} className="absolute -bottom-20 -right-20 text-white opacity-5" />
           </div>

           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Últimas Movimentações</h3>
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {expenses.slice(0, 5).map(exp => (
                  <div key={exp.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                    <div>
                      <p className="font-black text-gray-800 text-sm">{exp.category}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{exp.date}</p>
                    </div>
                    <span className="font-black text-red-500">- MT {exp.amount}</span>
                  </div>
                ))}
              </div>
           </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto animate-in slide-in-from-right-8 pb-20">
          <button onClick={() => setView('dashboard')} className="flex items-center text-emerald-600 font-black text-sm mb-8 uppercase tracking-widest hover:translate-x-[-4px] transition-transform">
            <ChevronLeft size={18} className="mr-1" /> Voltar
          </button>
          <form onSubmit={handleAddExpense} className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 space-y-8">
            <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Registar Despesa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Categoria</label>
                <select name="category" required className="w-full p-5 bg-gray-50 border-none rounded-2xl font-black focus:ring-2 focus:ring-emerald-500">
                  <option>Combustível</option>
                  <option>Manutenção</option>
                  <option>Sementes</option>
                  <option>Salários</option>
                  <option>Outros</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Valor (MT)</label>
                <input name="amount" type="number" step="0.01" required className="w-full p-5 bg-gray-50 border-none rounded-2xl font-black text-xl focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Data</label>
                <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full p-5 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Fornecedor</label>
                <input name="provider" placeholder="Ex: Petromoc" className="w-full p-5 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Descrição / Notas</label>
                <input name="description" placeholder="Detalhes da despesa..." className="w-full p-5 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest active:scale-[0.98] transition-all flex justify-center items-center">
              {isLoading ? <Loader2 className="animate-spin" /> : <><Save className="mr-2" /> Guardar Saída</>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
