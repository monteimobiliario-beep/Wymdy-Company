
import React, { useState, useMemo } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  FileText, 
  Users, 
  Download, 
  Edit3, 
  CheckCircle2, 
  ChevronLeft,
  Calendar,
  DollarSign,
  Receipt,
  UserPlus,
  Printer,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Expense, SalarySheet, MarketingAgent, Client, Sale } from '../types';

const MOCK_AGENTS: MarketingAgent[] = [
  { id: 'a1', name: 'Ricardo Santos', bonusPercentage: 5 },
  { id: 'a2', name: 'Helena Matola', bonusPercentage: 3 },
];

const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'Agro Industrial Lda', nuit: '4001', phone: '841', address: 'Maputo', creditLimit: 50000, balance: 12000, marketingAgentId: 'a1' },
  { id: 'c2', name: 'Fazenda Wymdy B', nuit: '4002', phone: '842', address: 'Gaza', creditLimit: 20000, balance: 0, marketingAgentId: 'a1' },
  { id: 'c3', name: 'Escola Agrária X', nuit: '4003', phone: '843', address: 'Inhambane', creditLimit: 100000, balance: 45000, marketingAgentId: 'a2' },
];

const MOCK_SALES: Sale[] = [
  { id: 'S001', clientId: 'c1', total: 10000, discount: 0, status: 'paid', type: 'cash', date: '2023-10-20', userId: 'user1' },
  { id: 'S002', clientId: 'c3', total: 50000, discount: 500, status: 'partial', type: 'credit', date: '2023-10-22', userId: 'user1' },
];

const MOCK_EXPENSES: Expense[] = [
  { id: 'e1', category: 'Combustível', amount: 4500, date: '2023-10-24', provider: 'Petromoc', description: 'Trator A1', userId: 'finance', status: 'paid' },
  { id: 'e2', category: 'Manutenção', amount: 1200, date: '2023-10-25', provider: 'Mecânica X', description: 'Reparação Bomba', userId: 'finance', status: 'pending' },
];

export const FinanceModule: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'expenses' | 'salaries' | 'marketing' | 'ledger'>('dashboard');
  const [selectedSheet, setSelectedSheet] = useState<SalarySheet | null>(null);
  const [isPdfPreview, setIsPdfPreview] = useState(false);

  // Bonus Calculation Logic
  const calculateCommissions = (agentId: string) => {
    const agentClients = MOCK_CLIENTS.filter(c => c.marketingAgentId === agentId);
    const clientIds = agentClients.map(c => c.id);
    const agentSales = MOCK_SALES.filter(s => clientIds.includes(s.clientId));
    const totalSales = agentSales.reduce((acc, s) => acc + s.total, 0);
    const agent = MOCK_AGENTS.find(a => a.id === agentId);
    return (totalSales * (agent?.bonusPercentage || 0)) / 100;
  };

  if (isPdfPreview) {
    return (
      <div className="animate-in fade-in zoom-in duration-300 bg-white min-h-screen p-8 max-w-4xl mx-auto shadow-2xl border border-gray-100 mt-10 mb-20 rounded-t-3xl overflow-hidden">
        <div className="flex justify-between items-start border-b-2 border-emerald-800 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-emerald-900 tracking-tighter">WYMDY COMPANY LDA</h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Agricultural Solutions & Management</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-gray-800">FOLHA SALARIAL</p>
            <p className="text-xs text-gray-500 uppercase">Referência: OUTUBRO 2023</p>
          </div>
        </div>

        <table className="w-full text-sm mb-12">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left border-b font-black uppercase text-[10px]">Funcionário</th>
              <th className="p-3 text-right border-b font-black uppercase text-[10px]">Salário Base</th>
              <th className="p-3 text-right border-b font-black uppercase text-[10px]">Bónus Mkt</th>
              <th className="p-3 text-right border-b font-black uppercase text-[10px]">Deduções</th>
              <th className="p-3 text-right border-b font-black uppercase text-[10px]">Líquido</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr className="hover:bg-gray-50">
              <td className="p-3 font-bold">João Pedro (Stock)</td>
              <td className="p-3 text-right">MT 15.000,00</td>
              <td className="p-3 text-right">MT 0,00</td>
              <td className="p-3 text-right">MT 450,00</td>
              <td className="p-3 text-right font-black">MT 14.550,00</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-3 font-bold">Ricardo Santos (Agente)</td>
              <td className="p-3 text-right">MT 10.000,00</td>
              <td className="p-3 text-right">MT {calculateCommissions('a1').toLocaleString()}</td>
              <td className="p-3 text-right">MT 300,00</td>
              <td className="p-3 text-right font-black">MT {(9700 + calculateCommissions('a1')).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div className="grid grid-cols-2 gap-20 mt-20">
          <div className="border-t border-gray-300 pt-4 text-center">
            <p className="text-[10px] font-black uppercase text-gray-400 mb-8">Assinatura da Contabilista</p>
            <div className="h-px w-full bg-gray-200 mb-2"></div>
            <p className="text-xs font-bold text-gray-800">Célia Vilanculos</p>
          </div>
          <div className="border-t border-gray-300 pt-4 text-center">
            <p className="text-[10px] font-black uppercase text-gray-400 mb-8">Visto do Gerente</p>
            <div className="h-px w-full bg-gray-200 mb-2"></div>
            <p className="text-xs font-bold text-gray-800">Direção Geral</p>
          </div>
        </div>

        <div className="fixed bottom-10 left-0 right-0 flex justify-center space-x-4 no-print">
          <button 
            onClick={() => setIsPdfPreview(false)}
            className="bg-gray-800 text-white px-8 py-3 rounded-2xl font-black shadow-xl"
          >
            VOLTAR
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl flex items-center space-x-2"
          >
            <Printer size={20} />
            <span>IMPRIMIR PDF</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Contabilidade & Finanças</h2>
          <p className="text-gray-500">Gestão avançada de ativos e rendimentos</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 self-start">
          <button 
            onClick={() => setView('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === 'dashboard' ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setView('expenses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === 'expenses' ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
          >
            Despesas
          </button>
          <button 
            onClick={() => setView('salaries')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === 'salaries' ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
          >
            Salários
          </button>
          <button 
            onClick={() => setView('marketing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === 'marketing' ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
          >
            Marketing
          </button>
        </div>
      </header>

      {view === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <TrendingUp size={80} className="text-emerald-600" />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Entradas Totais (Mês)</p>
                <h3 className="text-3xl font-black text-emerald-600">MT 845.200</h3>
                <div className="mt-4 flex items-center text-xs font-bold text-emerald-500">
                  <TrendingUp size={14} className="mr-1" />
                  <span>+24% vs mês anterior</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <TrendingDown size={80} className="text-red-600" />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Saídas Totais (Mês)</p>
                <h3 className="text-3xl font-black text-red-600">MT 312.800</h3>
                <div className="mt-4 flex items-center text-xs font-bold text-red-500">
                  <TrendingDown size={14} className="mr-1" />
                  <span>+12% vs mês anterior</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">Ajustes Rápidos de Lançamentos</h3>
                  <button onClick={() => setView('ledger')} className="text-emerald-600 font-bold text-xs hover:underline">Ver Livro Razão</button>
               </div>
               <div className="divide-y divide-gray-50">
                  {MOCK_SALES.map(sale => (
                    <div key={sale.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                          <Receipt size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">Venda {sale.id}</p>
                          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                            {MOCK_CLIENTS.find(c => c.id === sale.clientId)?.name} • {sale.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <p className="font-black text-gray-900">MT {sale.total.toLocaleString()}</p>
                        <button className="p-2 text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                          <Edit3 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-emerald-900 text-white p-6 rounded-3xl shadow-xl shadow-emerald-200">
               <h3 className="font-black text-emerald-400 uppercase text-[10px] tracking-widest mb-4">Fluxo de Caixa IA</h3>
               <p className="text-sm font-medium leading-relaxed opacity-90">
                 "Contabilista, notei que os pagamentos de bónus de marketing estão superando a margem operacional da fazenda Wymdy B. Recomendo revisar as taxas de comissão."
               </p>
               <button className="mt-6 w-full py-3 bg-emerald-500 text-white rounded-2xl text-xs font-black shadow-lg hover:bg-emerald-400 transition-all">REVISAR MÉTRICAS</button>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
               <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest mb-4">Ações Contabilista</h3>
               <div className="space-y-2">
                 <button className="w-full p-4 flex items-center space-x-3 bg-gray-50 rounded-2xl hover:bg-emerald-50 transition-all group">
                    <FileText size={20} className="text-gray-400 group-hover:text-emerald-600" />
                    <span className="text-sm font-bold text-gray-600 group-hover:text-emerald-700">Conciliação Bancária</span>
                 </button>
                 <button className="w-full p-4 flex items-center space-x-3 bg-gray-50 rounded-2xl hover:bg-emerald-50 transition-all group">
                    <ShieldCheck size={20} className="text-gray-400 group-hover:text-emerald-600" />
                    <span className="text-sm font-bold text-gray-600 group-hover:text-emerald-700">Relatório DRE</span>
                 </button>
                 <button className="w-full p-4 flex items-center space-x-3 bg-gray-50 rounded-2xl hover:bg-emerald-50 transition-all group">
                    <Download size={20} className="text-gray-400 group-hover:text-emerald-600" />
                    <span className="text-sm font-bold text-gray-600 group-hover:text-emerald-700">Exportar Primavera CSV</span>
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {view === 'expenses' && (
        <div className="animate-in slide-in-from-bottom-8 duration-500">
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Categoria</label>
                  <select className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold">
                    <option>Sementes</option>
                    <option>Combustível</option>
                    <option>Manutenção</option>
                    <option>Mão de Obra</option>
                    <option>Outros</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Valor (MT)</label>
                  <input type="number" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-black" placeholder="0.00" />
                </div>
                <button className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all">
                  LANÇAR DESPESA
                </button>
              </div>
           </div>

           <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
             <table className="w-full text-left text-sm">
               <thead className="bg-gray-50">
                 <tr>
                   <th className="px-6 py-4 font-black uppercase text-[10px] text-gray-500">Data</th>
                   <th className="px-6 py-4 font-black uppercase text-[10px] text-gray-500">Categoria</th>
                   <th className="px-6 py-4 font-black uppercase text-[10px] text-gray-500">Fornecedor</th>
                   <th className="px-6 py-4 font-black uppercase text-[10px] text-gray-500">Valor</th>
                   <th className="px-6 py-4 font-black uppercase text-[10px] text-gray-500">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {MOCK_EXPENSES.map(exp => (
                   <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                     <td className="px-6 py-5 text-gray-400 font-mono text-xs">{exp.date}</td>
                     <td className="px-6 py-5 font-bold text-gray-800">{exp.category}</td>
                     <td className="px-6 py-5 font-medium text-gray-500">{exp.provider}</td>
                     <td className="px-6 py-5 font-black text-red-600">MT {exp.amount.toLocaleString()}</td>
                     <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          exp.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {exp.status === 'paid' ? 'Liquidado' : 'Pendente'}
                        </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {view === 'salaries' && (
        <div className="animate-in slide-in-from-bottom-8 duration-500 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mês de Referência</p>
                <h3 className="text-xl font-black text-emerald-900">OUTUBRO 2023</h3>
              </div>
              <button 
                onClick={() => setIsPdfPreview(true)}
                className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg hover:bg-emerald-700 transition-all active:scale-95 flex items-center space-x-2"
              >
                <FileText size={20} />
                <span className="font-bold text-sm">Gerar Folha PDF</span>
              </button>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status do Fechamento</p>
                  <div className="flex items-center space-x-2">
                    <AlertCircle size={18} className="text-amber-500" />
                    <span className="text-lg font-black text-amber-600 uppercase">Aguardando Visto</span>
                  </div>
               </div>
               <button className="bg-gray-800 text-white px-6 py-3 rounded-2xl font-black text-xs">NOTIFICAR GERÊNCIA</button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">Listagem de Remuneração</h3>
              <div className="flex space-x-2">
                <button className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-emerald-600"><Plus size={18}/></button>
              </div>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 font-black uppercase text-[10px] text-gray-500">Colaborador</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] text-gray-500">Salário Base</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] text-gray-500">Bónus/Comissões</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] text-gray-500">INSS/Deduções</th>
                  <th className="px-6 py-4 font-black uppercase text-[10px] text-gray-500 text-right">Líquido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-5 font-bold">João Pedro</td>
                  <td className="px-6 py-5">MT 15.000</td>
                  <td className="px-6 py-5 text-gray-400">MT 0</td>
                  <td className="px-6 py-5 text-red-500">- MT 450</td>
                  <td className="px-6 py-5 text-right font-black">MT 14.550</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-5 font-bold">Ricardo Santos (Agente)</td>
                  <td className="px-6 py-5">MT 10.000</td>
                  <td className="px-6 py-5 text-emerald-600">MT {calculateCommissions('a1').toLocaleString()}</td>
                  <td className="px-6 py-5 text-red-500">- MT 300</td>
                  <td className="px-6 py-5 text-right font-black">MT {(9700 + calculateCommissions('a1')).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'marketing' && (
        <div className="animate-in slide-in-from-bottom-8 duration-500 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MOCK_AGENTS.map(agent => (
                <div key={agent.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black">
                        {agent.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-black text-gray-800">{agent.name}</h4>
                        <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">Agente de Marketing</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] text-gray-400 font-black uppercase">Taxa de Bónus</p>
                       <p className="text-xl font-black text-indigo-600">{agent.bonusPercentage}%</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clientes Vinculados</p>
                    {MOCK_CLIENTS.filter(c => c.marketingAgentId === agent.id).map(client => (
                      <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                        <span className="text-sm font-bold text-gray-600">{client.name}</span>
                        <span className="text-xs font-mono text-gray-400">NUIT {client.nuit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-gray-400 font-black uppercase">Bónus Acumulado</p>
                      <p className="text-2xl font-black text-indigo-600">MT {calculateCommissions(agent.id).toLocaleString()}</p>
                    </div>
                    <button className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              ))}
           </div>

           <div className="bg-indigo-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <h3 className="text-3xl font-black mb-2 tracking-tighter">Vincular Novo Cliente</h3>
                  <p className="text-indigo-200 font-medium max-w-md">Ligue um cliente a um agente para automatizar o cálculo de comissões mensais.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                   <select className="bg-indigo-800 border-none text-white rounded-2xl p-4 min-w-[200px] font-bold">
                     <option>Escolher Agente...</option>
                     {MOCK_AGENTS.map(a => <option key={a.id}>{a.name}</option>)}
                   </select>
                   <select className="bg-indigo-800 border-none text-white rounded-2xl p-4 min-w-[200px] font-bold">
                     <option>Escolher Cliente...</option>
                     {MOCK_CLIENTS.map(c => <option key={c.id}>{c.name}</option>)}
                   </select>
                   <button className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-100 active:scale-95 transition-all">VINCULAR</button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-800 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
           </div>
        </div>
      )}
    </div>
  );
};
