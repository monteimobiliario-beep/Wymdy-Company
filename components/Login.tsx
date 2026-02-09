
import React, { useState } from 'react';
import { KeyRound, ShieldCheck, Loader2, AlertCircle, User as UserIcon } from 'lucide-react';
import { supabase } from '../services/supabase';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !key) return;

    setLoading(true);
    setError('');

    try {
      const { data, error: dbError } = await supabase
        .from('system_users')
        .select('*')
        .ilike('name', username) // Busca pelo nome (insensível a maiúsculas)
        .eq('access_key', key)
        .eq('status', 'active')
        .single();

      if (dbError || !data) {
        throw new Error('Credenciais inválidas ou utilizador inativo.');
      }

      const user: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
        status: data.status,
        accessKey: data.access_key
      };

      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Erro ao validar acesso.');
      setKey('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      {/* Background Video - Folhas verdes em movimento */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute min-w-full min-h-full object-cover scale-110"
        >
          <source 
            src="https://assets.mixkit.co/videos/preview/mixkit-close-up-of-green-leaves-swaying-in-the-wind-1129-large.mp4" 
            type="video/mp4" 
          />
        </video>
        {/* Overlay para contraste */}
        <div className="absolute inset-0 bg-emerald-950/40 backdrop-brightness-50"></div>
      </div>

      {/* Login Card - Glassmorphism */}
      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[3.5rem] p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] animate-in zoom-in duration-700">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="bg-emerald-500/20 backdrop-blur-md p-5 rounded-3xl text-emerald-400 mb-6 border border-emerald-400/30 shadow-lg">
            <ShieldCheck size={48} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase drop-shadow-md">Wymdy Company</h1>
          <p className="text-emerald-100/60 font-black text-[10px] uppercase tracking-[0.3em] mt-2">Portal de Produção Agrícola</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            {/* Campo Nome de Utilizador */}
            <div>
              <label className="block text-[10px] font-black text-emerald-100/50 uppercase tracking-[0.2em] mb-2 ml-2">Nome do Utilizador</label>
              <div className="relative">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-400" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full pl-14 pr-6 py-5 bg-white/10 border border-white/10 rounded-[2rem] font-bold text-white placeholder:text-white/20 focus:ring-4 focus:ring-emerald-500/30 focus:bg-white/20 transition-all outline-none"
                />
              </div>
            </div>

            {/* Campo Senha/PIN */}
            <div>
              <label className="block text-[10px] font-black text-emerald-100/50 uppercase tracking-[0.2em] mb-2 ml-2">Palavra-passe / PIN</label>
              <div className="relative">
                <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-400" size={20} />
                <input
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-5 bg-white/10 border border-white/10 rounded-[2rem] font-black text-xl tracking-[0.5em] text-white placeholder:text-white/20 placeholder:tracking-normal focus:ring-4 focus:ring-emerald-500/30 focus:bg-white/20 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-100 p-4 rounded-2xl flex items-center space-x-3 text-xs font-bold animate-in slide-in-from-top-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !key}
            className="w-full py-6 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-[2rem] font-black shadow-2xl shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center justify-center uppercase tracking-widest disabled:opacity-50 disabled:grayscale"
          >
            {loading ? <Loader2 className="animate-spin mr-3" size={24} /> : 'Autenticar Acesso'}
          </button>
        </form>

        <p className="text-center mt-10 text-[9px] text-emerald-100/40 font-black uppercase tracking-widest leading-relaxed">
          Sistema de Gestão Wymdy Company <br/> 
          <span className="opacity-50">Protegido por Encriptação de Ponta</span>
        </p>
      </div>
    </div>
  );
};