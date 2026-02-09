
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
  CheckCircle2,
  Calendar,
  User as UserIcon,
  Clock,
  Filter,
  ArrowRightCircle,
  Users,
  Banknote,
  ReceiptText,
  PlusCircle,
  MinusCircle,
  Calculator,
  Download,
  FileDown,
  Printer,
  XCircle,
  FileText
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { Employee } from '../types';

type FinanceView = 'dashboard' | 'expenses' | 'receivables' | 'salaries' | 'salary-form';

export const FinanceModule: React.FC = () => {
  const [view, setView] = useState<FinanceView>('dashboard');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [receivables, setReceivables] = useState<any[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaryEntries, setSalaryEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtering
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [categories, setCategories] = useState<string[]>(['Combustível', 'Manutenção', 'Sementes', 'Salários', 'Rendas', 'Eletricidade', 'Água']);
  const [newCatName, setNewCatName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Salary Form State
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [salaryData, setSalaryData] = useState({
    baseSalary: 0,
    foodAllowance: 0,
    transportAllowance: 0,
    bonus: 0,
    personalCommission: 0,
    teamCommission: 0,
    otherIncome: 0,
    loans: 0,
    otherDeductions: 0,
    inss: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    fetchInitialData();
  }, [view]);

  async function fetchInitialData() {
    setIsLoading(true);
    try {
      if (view === 'dashboard' || view === 'expenses') {
        const { data } = await supabase.from('expenses').select('*').order('date', { ascending: false });
        if (data) setExpenses(data);
      }
      if (view === 'receivables') {
        const { data } = await supabase.from('sales').select('*, clients(*)').eq('type', 'credit').neq('status', 'paid');
        if (data) setReceivables(data);
      }
      if (view === 'salaries' || view === 'salary-form') {
        const { data: empData } = await supabase.from('employees').select('*').eq('status', 'active');
        const { data: salData } = await supabase.from('salary_entries').select('*, employees(name)').order('created_at', { ascending: false });
        if (empData) setEmployees(empData);
        if (salData) setSalaryEntries(salData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const date = new Date(exp.date);
      const start = dateStart ? new Date(dateStart) : null;
      const end = dateEnd ? new Date(dateEnd) : null;
      if (start && date < start) return false;
      if (end && date > end) return false;
      return true;
    });
  }, [expenses, dateStart, dateEnd]);

  const filteredSalaries = useMemo(() => {
    return salaryEntries.filter(sal => {
      const start = dateStart ? new Date(dateStart) : null;
      const end = dateEnd ? new Date(dateEnd) : null;
      const salDate = new Date(sal.created_at);
      if (start && salDate < start) return false;
      if (end && salDate > end) return false;
      return true;
    });
  }, [salaryEntries, dateStart, dateEnd]);

  // Calculations for Salary
  const totals = useMemo(() => {
    const totalSubsidiaries = salaryData.foodAllowance + salaryData.transportAllowance + salaryData.bonus + salaryData.personalCommission + salaryData.teamCommission;
    const totalIncome = salaryData.baseSalary + totalSubsidiaries + salaryData.otherIncome;
    const totalDeductions = salaryData.loans + salaryData.otherDeductions + salaryData.inss;
    const netSalary = totalIncome - totalDeductions;
    return { totalSubsidiaries, totalIncome, totalDeductions, netSalary };
  }, [salaryData]);

  // CSV Export Helper
  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddCategory = () => {
    if (newCatName && !categories.includes(newCatName)) {
      setCategories([...categories, newCatName]);
      setNewCatName('');
      setShowAddCategory(false);
    }
  };

  const handleLaunchSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setIsLoading(true);
    try {
      const payload = {
        employee_id: selectedEmp.id,
        month: salaryData.month,
        year: salaryData.year,
        base_salary: salaryData.baseSalary,
        food_allowance: salaryData.foodAllowance,
        transport_allowance: salaryData.transportAllowance,
        bonus: salaryData.bonus,
        personal_commission: salaryData.personalCommission,
        team_commission: salaryData.teamCommission,
        other_income: salaryData.otherIncome,
        loans: salaryData.loans,
        other_deductions: salaryData.otherDeductions,
        inss: salaryData.inss,
        total_income: totals.totalIncome,
        total_deductions: totals.totalDeductions,
        net_salary: totals.netSalary,
        status: 'paid'
      };

      const { error } = await supabase.from('salary_entries').insert([payload]);
      if (error) throw error;

      await supabase.from('expenses').insert([{
        category: 'Salários',
        amount: totals.netSalary,
        date: new Date().toISOString().split('T')[0],
        description: `Salário ${selectedEmp.name} - ${salaryData.month}/${salaryData.year}`,
        status: 'paid'
      }]);

      setSuccess("Folha de pagamento processada!");
      setTimeout(() => { setSuccess(''); setView('salaries'); }, 2000);
    } catch (err: any) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-6 pb-20">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-content, .print-content * { visibility: visible; }
          .print-content { position: absolute; left: 0; top: 0; width: 100%; padding: 40px; }
          .no-print { display: none !important; }
        }
      `}</style>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Finanças & Folha</h2>
          <p className="text-gray-500 italic font-medium">Controlo Integrado de Fluxo de Caixa</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[2rem] shadow-sm border border-gray-100 self-stretch md:self-auto overflow-x-auto">
          <button onClick={() => setView('dashboard')} className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${view === 'dashboard' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-emerald-600'}`}>Dashboard</button>
          <button onClick={() => setView('expenses')} className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${view === 'expenses' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-emerald-600'}`}>Despesas</button>
          <button onClick={() => setView('receivables')} className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${view === 'receivables' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-emerald-600'}`}>Receber</button>
          <button onClick={() => setView('salaries')} className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${view === 'salaries' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-emerald-600'}`}>Salários</button>
        </div>
      </header>

      {/* FILTROS DE DATA GLOBAIS */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center no-print">
        <div className="flex items-center space-x-3 w-full">
          <Calendar size={18} className="text-emerald-600" />
          <div className="flex-1 grid grid-cols-2 gap-2">
            <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="p-3 bg-gray-50 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-emerald-500" />
            <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="p-3 bg-gray-50 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={() => { setDateStart(''); setDateEnd(''); }} className="p-3 bg-gray-100 text-gray-400 rounded-xl hover:text-red-500 transition-colors"><XCircle size={18} /></button>
          <button onClick={() => exportToCSV(view === 'salaries' ? filteredSalaries : filteredExpenses, `Relatorio_${view}`)} className="flex-1 md:flex-none bg-white border border-gray-200 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center hover:bg-gray-50"><FileDown size={14} className="mr-2" /> CSV</button>
          <button onClick={handlePrint} className="flex-1 md:flex-none bg-emerald-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center shadow-lg"><Printer size={14} className="mr-2" /> PDF</button>
        </div>
      </div>

      {success && <div className="bg-emerald-100 text-emerald-700 p-5 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center shadow-sm border border-emerald-200 no-print"><CheckCircle2 className="mr-3" /> {success}</div>}
      {error && <div className="bg-red-50 text-red-600 p-5 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center shadow-sm border border-red-200 no-print"><AlertCircle className="mr-3" /> {error}</div>}

      {view === 'dashboard' && (
        <div className="print-content space-y-8 animate-in fade-in duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-emerald-950 text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                <div className="relative z-10">
                  <TrendingUp size={48} className="text-emerald-400 mb-8" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-2">Saídas de Caixa Filtradas</p>
                  <p className="text-6xl font-black tracking-tighter">MT {filteredExpenses.reduce((acc, exp) => acc + Number(exp.amount), 0).toLocaleString()}</p>
                </div>
                <Wallet size={300} className="absolute -bottom-20 -right-20 text-white opacity-5 rotate-12" />
              </div>

              <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm space-y-8">
                <div className="flex justify-between items-center no-print">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Fluxo Filtrado</h3>
                  <ReceiptText size={20} className="text-gray-200" />
                </div>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {filteredExpenses.map(exp => (
                    <div key={exp.id} className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl hover:bg-emerald-50 transition-colors border border-transparent">
                      <div>
                        <p className="font-black text-gray-800 text-sm">{exp.category}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(exp.date).toLocaleDateString()}</p>
                      </div>
                      <span className="font-black text-red-500">MT -{exp.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
           </div>
        </div>
      )}

      {view === 'expenses' && (
        <div className="max-w-4xl mx-auto animate-in slide-in-from-right-8 pb-20 no-print">
          <form className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-100 space-y-10" onSubmit={(e) => {
             e.preventDefault();
             const target = e.target as any;
             const payload = {
               category: target.category.value,
               amount: Number(target.amount.value),
               date: target.date.value,
               provider: target.provider.value,
               description: target.description.value,
               status: 'paid'
             };
             setIsLoading(true);
             supabase.from('expenses').insert([payload]).then(({error}) => {
               if(!error) {
                 setSuccess("Despesa guardada!");
                 setView('dashboard');
               }
               setIsLoading(false);
             });
          }}>
            <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Registar Saída</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex justify-between">
                  Categoria 
                  <button type="button" onClick={() => setShowAddCategory(!showAddCategory)} className="text-emerald-600 hover:underline">
                    {showAddCategory ? 'Cancelar' : '+ Nova'}
                  </button>
                </label>
                {showAddCategory ? (
                  <div className="flex gap-2">
                    <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Nome Categoria..." className="flex-1 p-5 bg-emerald-50 rounded-2xl font-bold outline-none" />
                    <button type="button" onClick={handleAddCategory} className="bg-emerald-600 text-white p-5 rounded-2xl"><Plus size={20} /></button>
                  </div>
                ) : (
                  <select name="category" required className="w-full p-5 bg-gray-50 border-none rounded-2xl font-black text-sm outline-none">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Valor (MT)</label>
                <input name="amount" type="number" step="0.01" required className="w-full p-5 bg-gray-50 border-none rounded-2xl font-black text-2xl outline-none text-emerald-600" />
              </div>
              <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="p-5 bg-gray-50 rounded-2xl font-bold" />
              <input name="provider" placeholder="Beneficiário" className="p-5 bg-gray-50 rounded-2xl font-bold" />
              <textarea name="description" placeholder="Notas..." className="md:col-span-2 p-5 bg-gray-50 rounded-2xl font-bold min-h-[100px]" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full py-8 bg-emerald-600 text-white rounded-[2.5rem] font-black shadow-2xl uppercase tracking-[0.2em] text-[12px] flex justify-center items-center">
              {isLoading ? <Loader2 className="animate-spin" /> : <Save className="mr-3" />} Efetivar Saída
            </button>
          </form>
        </div>
      )}

      {view === 'salaries' && (
        <div className="print-content space-y-8 animate-in fade-in duration-500 pb-20">
          <div className="flex justify-between items-center no-print">
            <h3 className="text-xl font-black uppercase tracking-tight">Folha de Pagamentos</h3>
            <button onClick={() => setView('salary-form')} className="bg-emerald-600 text-white px-8 py-4 rounded-3xl flex items-center shadow-xl font-black uppercase text-xs tracking-widest"><Plus size={18} className="mr-2" /> Nova Folha</button>
          </div>

          <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-gray-100 overflow-hidden">
             <table className="w-full text-left">
               <thead className="border-b border-gray-100">
                 <tr>
                   <th className="pb-4 font-black uppercase text-[10px] text-gray-400">Funcionário</th>
                   <th className="pb-4 font-black uppercase text-[10px] text-gray-400 text-center">Rendimentos</th>
                   <th className="pb-4 font-black uppercase text-[10px] text-gray-400 text-center">Descontos</th>
                   <th className="pb-4 font-black uppercase text-[10px] text-gray-400 text-right">Líquido</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {filteredSalaries.map(sal => (
                   <tr key={sal.id}>
                     <td className="py-5">
                       <p className="font-black text-gray-900 text-sm">{sal.employees?.name}</p>
                       <p className="text-[10px] text-gray-400 font-bold uppercase">Mês {sal.month} / {sal.year}</p>
                     </td>
                     <td className="py-5 text-center text-emerald-600 font-bold text-xs">MT {sal.total_income.toLocaleString()}</td>
                     <td className="py-5 text-center text-red-400 font-bold text-xs">MT {sal.total_deductions.toLocaleString()}</td>
                     <td className="py-5 text-right font-black text-gray-900 text-sm">MT {sal.net_salary.toLocaleString()}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
      )}

      {view === 'salary-form' && (
        <div className="max-w-5xl mx-auto animate-in slide-in-from-right-8 pb-20 no-print">
          <header className="flex justify-between items-center mb-8">
            <button onClick={() => setView('salaries')} className="flex items-center text-emerald-600 font-black text-[10px] uppercase tracking-widest"><ChevronLeft size={16} className="mr-2" /> Cancelar</button>
            <div className="w-64">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Selecionar Funcionário</label>
              <select 
                onChange={(e) => {
                  const emp = employees.find(emp => emp.id === e.target.value);
                  if(emp) {
                    setSelectedEmp(emp);
                    setSalaryData({...salaryData, baseSalary: emp.salary, inss: emp.salary * 0.03});
                  }
                }} 
                className="w-full p-3 bg-white border border-gray-200 rounded-xl font-bold outline-none"
              >
                <option value="">Escolha...</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
          </header>

          <form className="grid grid-cols-1 lg:grid-cols-3 gap-8" onSubmit={handleLaunchSalary}>
            {/* RENDIMENTOS */}
            <div className="lg:col-span-2 bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-100 space-y-10">
               <div className="flex items-center space-x-4 border-b border-emerald-50 pb-6">
                  <PlusCircle size={24} className="text-emerald-600" />
                  <h3 className="text-xl font-black uppercase tracking-tight">Rendimentos e Subsídios</h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Salário Base (MT)</label>
                    <input type="number" value={salaryData.baseSalary} onChange={e => setSalaryData({...salaryData, baseSalary: Number(e.target.value)})} className="w-full p-4 bg-gray-50 rounded-2xl font-black text-emerald-600 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Subsídio de Alimentação</label>
                    <input type="number" value={salaryData.foodAllowance} onChange={e => setSalaryData({...salaryData, foodAllowance: Number(e.target.value)})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Subsídio de Transporte</label>
                    <input type="number" value={salaryData.transportAllowance} onChange={e => setSalaryData({...salaryData, transportAllowance: Number(e.target.value)})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Bónus</label>
                    <input type="number" value={salaryData.bonus} onChange={e => setSalaryData({...salaryData, bonus: Number(e.target.value)})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Comissão Pessoal</label>
                    <input type="number" value={salaryData.personalCommission} onChange={e => setSalaryData({...salaryData, personalCommission: Number(e.target.value)})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Comissão de Equipe</label>
                    <input type="number" value={salaryData.teamCommission} onChange={e => setSalaryData({...salaryData, teamCommission: Number(e.target.value)})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Outros Rendimentos</label>
                    <input type="number" value={salaryData.otherIncome} onChange={e => setSalaryData({...salaryData, otherIncome: Number(e.target.value)})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none" />
                  </div>
               </div>

               <div className="pt-10 border-t border-gray-100 flex flex-col space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase">
                    <span>Total de Subsídios</span>
                    <span>MT {totals.totalSubsidiaries.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-6 bg-emerald-50 rounded-[2.5rem] border border-emerald-100">
                    <span className="text-[10px] font-black text-emerald-900 uppercase tracking-[0.2em]">Total de Rendimentos</span>
                    <span className="font-black text-emerald-900 text-3xl">MT {totals.totalIncome.toLocaleString()}</span>
                  </div>
               </div>
            </div>

            {/* DESCONTOS */}
            <div className="space-y-8">
               <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-gray-100 space-y-8">
                  <div className="flex items-center space-x-4 border-b border-red-50 pb-6">
                    <MinusCircle size={24} className="text-red-500" />
                    <h3 className="text-xl font-black uppercase tracking-tight">Descontos</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Empréstimos</label>
                      <input type="number" value={salaryData.loans} onChange={e => setSalaryData({...salaryData, loans: Number(e.target.value)})} className="w-full p-4 bg-gray-50 rounded-2xl font-black text-red-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">INSS (3%)</label>
                      <input type="number" value={salaryData.inss} onChange={e => setSalaryData({...salaryData, inss: Number(e.target.value)})} className="w-full p-4 bg-gray-50 rounded-2xl font-black text-red-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Outros Descontos</label>
                      <input type="number" value={salaryData.otherDeductions} onChange={e => setSalaryData({...salaryData, otherDeductions: Number(e.target.value)})} className="w-full p-4 bg-gray-50 rounded-2xl font-black text-red-500 outline-none" />
                    </div>
                  </div>
                  <div className="pt-6 border-t border-red-50 flex justify-between items-center">
                    <span className="text-[10px] font-black text-red-900 uppercase tracking-widest">Total Descontos</span>
                    <span className="font-black text-red-600 text-xl">MT {totals.totalDeductions.toLocaleString()}</span>
                  </div>
               </div>

               <div className="bg-emerald-950 text-white p-10 rounded-[3.5rem] shadow-2xl space-y-8">
                  <div>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2 opacity-60">Salário Líquido</p>
                    <p className="text-5xl font-black tracking-tighter">MT {totals.netSalary.toLocaleString()}</p>
                  </div>
                  <button type="submit" disabled={isLoading || !selectedEmp} className="w-full py-6 bg-emerald-500 text-emerald-950 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[12px] shadow-2xl active:scale-95 transition-all flex items-center justify-center disabled:opacity-30">
                     {isLoading ? <Loader2 className="animate-spin mr-3" /> : <Calculator size={20} className="mr-3" />}
                     Processar Pagamento
                  </button>
               </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
