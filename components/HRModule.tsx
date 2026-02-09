
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  ChevronLeft, 
  CheckCircle2, 
  Save,
  Loader2,
  AlertTriangle,
  MapPin,
  CreditCard,
  Briefcase
} from 'lucide-react';
import { Employee } from '../types';
import { supabase } from '../services/supabase';

export const HRModule: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('employees').select('*').order('name');
      if (error) throw error;
      
      if (data) {
        setEmployees(data.map(e => ({
          id: e.id,
          name: e.name,
          email: e.email,
          phone: e.phone,
          position: e.position,
          department: e.department,
          salary: e.salary,
          status: e.status,
          admissionDate: e.admission_date,
          address: e.address || '',
          bankName: e.bank_name || '',
          accountNumber: e.account_number || '',
          nib: e.nib || ''
        })));
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Erro ao carregar colaboradores.");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                               e.position.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [employees, searchQuery]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    const formData = new FormData(e.currentTarget);
    
    // Mapeamento exato para snake_case da base de dados
    const employeeData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      position: formData.get('position') as string,
      department: formData.get('department') as string,
      salary: Number(formData.get('salary')),
      bank_name: formData.get('bankName') as string,
      account_number: formData.get('accountNumber') as string,
      nib: formData.get('nib') as string,
      status: 'active',
      admission_date: formData.get('admissionDate') as string || new Date().toISOString().split('T')[0]
    };

    try {
      const { error } = selectedEmployee
        ? await supabase.from('employees').update(employeeData).eq('id', selectedEmployee.id)
        : await supabase.from('employees').insert([employeeData]);

      if (error) throw error;

      setSuccessMsg(selectedEmployee ? "Dados atualizados!" : "Funcionário admitido!");
      await fetchEmployees();
      setView('list');
    } catch (err: any) {
      setErrorMsg(`Erro ao gravar: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (successMsg) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-300">
        <div className="bg-emerald-100 p-6 rounded-full text-emerald-600 shadow-xl mb-4">
          <CheckCircle2 size={64} />
        </div>
        <h2 className="text-2xl font-black text-gray-800">{successMsg}</h2>
        <button onClick={() => setSuccessMsg('')} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs mt-4">Continuar</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight uppercase">Equipe & RH</h2>
          <p className="text-gray-500 font-medium italic">Gestão centralizada na nuvem</p>
        </div>
        {view === 'list' && (
          <button onClick={() => { setView('form'); setSelectedEmployee(null); setErrorMsg(''); }} className="bg-emerald-600 text-white px-6 py-4 rounded-2xl flex items-center shadow-xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all">
            <UserPlus size={18} className="mr-2" /> Admitir Colaborador
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
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 relative">
            <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Pesquisar por nome ou cargo..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-14 pr-4 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full py-20 text-center text-emerald-600 font-black animate-pulse flex flex-col items-center">
                <Loader2 size={32} className="animate-spin mb-2" />
                CONECTANDO...
              </div>
            ) : filteredEmployees.map(emp => (
              <div key={emp.id} className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-emerald-600 font-black text-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    {emp.name[0]}
                  </div>
                  <button onClick={() => { setSelectedEmployee(emp); setView('form'); setErrorMsg(''); }} className="p-3 bg-gray-50 text-gray-400 hover:text-emerald-600 rounded-2xl transition-all"><Edit3 size={18} /></button>
                </div>
                <h4 className="font-black text-xl text-gray-900 leading-none mb-1">{emp.name}</h4>
                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-4">{emp.position}</p>
                <div className="text-[10px] text-gray-400 space-y-1 mb-6">
                  <p className="flex items-center"><MapPin size={10} className="mr-1" /> {emp.address || 'Sem morada'}</p>
                  <p className="flex items-center"><CreditCard size={10} className="mr-1" /> {emp.bankName || 'Sem banco'}</p>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-widest">{emp.status}</span>
                  <p className="text-[10px] font-bold text-gray-300 italic">{emp.admissionDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="animate-in slide-in-from-right-8 max-w-4xl mx-auto pb-20">
          <button onClick={() => setView('list')} className="flex items-center text-emerald-600 font-black text-sm mb-8 hover:translate-x-[-4px] transition-transform uppercase tracking-widest">
            <ChevronLeft size={18} className="mr-1" /> Voltar
          </button>
          
          <form onSubmit={handleSave} className="bg-white p-12 rounded-[3rem] shadow-2xl border border-gray-100 space-y-10">
            <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">{selectedEmployee ? 'Editar Ficha' : 'Ficha de Admissão'}</h3>
            
            <section className="space-y-6">
              <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center border-b border-emerald-50 pb-2">
                <Briefcase size={14} className="mr-2" /> Dados Profissionais
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input name="name" defaultValue={selectedEmployee?.name} placeholder="Nome Completo" required className="p-5 bg-gray-50 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                <input name="email" type="email" defaultValue={selectedEmployee?.email} placeholder="Email Institucional" required className="p-5 bg-gray-50 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                <input name="phone" defaultValue={selectedEmployee?.phone} placeholder="Telefone" required className="p-5 bg-gray-50 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                <input name="position" defaultValue={selectedEmployee?.position} placeholder="Cargo / Função" required className="p-5 bg-gray-50 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                <select name="department" defaultValue={selectedEmployee?.department} className="p-5 bg-gray-50 rounded-2xl font-black focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option>Logística</option>
                  <option>Vendas</option>
                  <option>Finanças</option>
                  <option>Produção</option>
                </select>
                <input name="salary" type="number" defaultValue={selectedEmployee?.salary} placeholder="Salário Base (MT)" required className="p-5 bg-gray-50 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                <input name="admissionDate" type="date" defaultValue={selectedEmployee?.admissionDate} className="p-5 bg-gray-50 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </section>

            <section className="space-y-6">
              <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center border-b border-emerald-50 pb-2">
                <MapPin size={14} className="mr-2" /> Localização & Contacto
              </h4>
              <input name="address" defaultValue={selectedEmployee?.address} placeholder="Endereço Completo / Província / Distrito" className="w-full p-5 bg-gray-50 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
            </section>

            <section className="space-y-6">
              <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center border-b border-emerald-50 pb-2">
                <CreditCard size={14} className="mr-2" /> Dados Bancários
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <input name="bankName" defaultValue={selectedEmployee?.bankName} placeholder="Nome do Banco" className="p-5 bg-gray-50 rounded-2xl font-bold outline-none" />
                <input name="accountNumber" defaultValue={selectedEmployee?.accountNumber} placeholder="Nº de Conta" className="p-5 bg-gray-50 rounded-2xl font-bold outline-none" />
                <input name="nib" defaultValue={selectedEmployee?.nib} placeholder="NIB / IBAN" className="p-5 bg-gray-50 rounded-2xl font-bold outline-none" />
              </div>
            </section>

            <button type="submit" disabled={isLoading} className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black shadow-xl uppercase tracking-widest active:scale-[0.98] transition-all disabled:opacity-50">
              {isLoading ? <Loader2 className="animate-spin mr-2 inline" size={24} /> : <Save size={24} className="inline mr-2" />}
              {isLoading ? 'SALVANDO...' : 'CONFIRMAR REGISTRO'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
