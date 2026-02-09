
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  UserCheck, 
  UserMinus, 
  Building2, 
  Save, 
  CheckCircle2,
  KeyRound,
  UserPlus,
  Loader2,
  Eye,
  EyeOff,
  Edit2,
  X,
  Search,
  UserCircle
} from 'lucide-react';
import { User, UserRole, Employee } from '../types';
import { supabase } from '../services/supabase';

export const SettingsModule: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'company'>('users');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchEmployees();
  }, []);

  async function fetchUsers() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('system_users').select('*').order('name');
      if (data) {
        setUsers(data.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role as UserRole,
          status: u.status,
          accessKey: u.access_key
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchEmployees() {
    try {
      const { data } = await supabase.from('employees').select('*').order('name');
      if (data) setEmployees(data);
    } catch (e) {
      console.error(e);
    }
  }

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as string,
      access_key: formData.get('access_key') as string,
      status: 'active'
    };

    try {
      if (editingUser && editingUser.id) {
        await supabase.from('system_users').update(userData).eq('id', editingUser.id);
      } else {
        await supabase.from('system_users').insert([userData]);
      }
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert("Erro ao salvar utilizador.");
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await supabase.from('system_users').update({ status: newStatus }).eq('id', id);
    fetchUsers();
  };

  const handleSelectEmployee = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (emp && editingUser) {
      setEditingUser({
        ...editingUser,
        name: emp.name,
        email: emp.email || ''
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight uppercase">Segurança & Acessos</h2>
          <p className="text-gray-500 italic font-medium">Controlo de Chaves e Permissões (RBAC)</p>
        </div>
        {!editingUser && activeSubTab === 'users' && (
          <button 
            onClick={() => setEditingUser({ id: '', name: '', email: '', role: UserRole.SELLER, status: 'active', accessKey: '' })}
            className="bg-emerald-600 text-white px-6 py-4 rounded-2xl flex items-center shadow-lg font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all"
          >
            <UserPlus size={18} className="mr-2" /> Novo Acesso
          </button>
        )}
      </header>

      {editingUser ? (
        <div className="max-w-3xl bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black uppercase tracking-tight">Configurar Acesso</h3>
            <button onClick={() => setEditingUser(null)} className="p-2 text-gray-400 hover:text-red-500"><X size={24} /></button>
          </div>
          
          <form onSubmit={handleSaveUser} className="space-y-8">
            {/* Opcional: Selecionar de Funcionários Cadastrados */}
            {!editingUser.id && (
              <div className="p-6 bg-emerald-50 rounded-[2rem] border-2 border-dashed border-emerald-100">
                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 block flex items-center">
                  <UserCircle size={14} className="mr-2" /> Puxar de Funcionário Cadastrado (Opcional)
                </label>
                <select 
                  onChange={(e) => handleSelectEmployee(e.target.value)}
                  className="w-full p-4 bg-white border-none rounded-xl font-bold text-gray-700 shadow-sm"
                >
                  <option value="">-- Selecione para preencher automaticamente --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.position})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Nome do Colaborador</label>
                <input 
                  name="name" 
                  value={editingUser.name} 
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  required 
                  className="w-full p-4 bg-gray-50 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Email Institucional</label>
                <input 
                  name="email" 
                  type="email" 
                  value={editingUser.email} 
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full p-4 bg-gray-50 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Cargo / Nível de Acesso</label>
                <select 
                  name="role" 
                  value={editingUser.role} 
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value as UserRole})}
                  className="w-full p-4 bg-gray-50 rounded-xl font-black uppercase text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 block">Chave de Acesso (PIN)</label>
                <div className="relative">
                   <KeyRound size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                   <input 
                    name="access_key" 
                    defaultValue={editingUser.accessKey} 
                    required 
                    placeholder="Ex: 1234" 
                    className="w-full p-5 pl-14 bg-emerald-50 border-2 border-emerald-100 rounded-2xl font-black text-2xl tracking-[0.5em] focus:ring-4 focus:ring-emerald-100 outline-none" 
                   />
                </div>
              </div>
            </div>
            
            <button type="submit" className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-emerald-100 active:scale-95 transition-all">
              {editingUser.id ? 'Atualizar Acesso' : 'Criar Novo Acesso'}
            </button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            {isLoading ? (
              <div className="p-20 text-center text-emerald-600 font-black animate-pulse flex flex-col items-center">
                <Loader2 size={32} className="animate-spin mb-4" />
                SINCRONIZANDO...
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-5 font-black uppercase text-[10px] text-gray-400">Funcionário</th>
                    <th className="px-8 py-5 font-black uppercase text-[10px] text-gray-400 text-center">PIN</th>
                    <th className="px-8 py-5 font-black uppercase text-[10px] text-gray-400 text-center">Nível</th>
                    <th className="px-8 py-5 font-black uppercase text-[10px] text-gray-400 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50/50">
                      <td className="px-8 py-5">
                        <p className="font-black text-gray-900 text-sm">{user.name}</p>
                        <span className={`text-[8px] font-black uppercase tracking-widest ${user.status === 'active' ? 'text-emerald-500' : 'text-red-400'}`}>
                          ● {user.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex items-center justify-center space-x-2">
                           <span className="font-mono font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                              {showKeys[user.id] ? user.accessKey : '••••'}
                           </span>
                           <button onClick={() => setShowKeys(prev => ({...prev, [user.id]: !prev[user.id]}))} className="text-gray-300 hover:text-emerald-500 transition-colors">
                              {showKeys[user.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                           </button>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[9px] font-black uppercase">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right flex justify-end space-x-2">
                        <button onClick={() => setEditingUser(user)} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-emerald-600 hover:bg-emerald-50 transition-all"><Edit2 size={16} /></button>
                        <button onClick={() => handleStatusToggle(user.id, user.status)} className={`p-3 rounded-xl transition-all ${user.status === 'active' ? 'text-red-400 bg-red-50 hover:bg-red-100' : 'text-emerald-400 bg-emerald-50 hover:bg-emerald-100'}`}>
                          {user.status === 'active' ? <UserMinus size={16} /> : <UserCheck size={16} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-emerald-900 text-white p-8 rounded-[2.5rem] shadow-2xl h-fit">
            <KeyRound className="text-emerald-400 mb-4" size={32} />
            <h3 className="text-xl font-black uppercase tracking-tight mb-4">Regras de Acesso</h3>
            <ul className="space-y-4 text-xs font-bold text-emerald-100/70">
              <li className="flex items-start">
                <span className="text-emerald-400 mr-2 font-black">1.</span> 
                ADMIN: Acesso total ao sistema, configurações e logs.
              </li>
              <li className="flex items-start">
                <span className="text-emerald-400 mr-2 font-black">2.</span> 
                STOCK: Acesso exclusivo ao módulo de inventário e alertas.
              </li>
              <li className="flex items-start">
                <span className="text-emerald-400 mr-2 font-black">3.</span> 
                SELLER: Permissão para criar vendas, proformas e gerir parcelas.
              </li>
              <li className="flex items-start">
                <span className="text-emerald-400 mr-2 font-black">4.</span> 
                FINANCE: Focado em despesas, salários e fluxo de caixa.
              </li>
            </ul>
            <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10 italic text-[10px] font-medium leading-relaxed opacity-60">
              "A rastreabilidade é a alma do negócio agrícola. Garanta que cada colaborador use a sua própria chave."
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
