
import React, { useState } from 'react';
import { KeyRound, ShieldCheck, Loader2, AlertCircle, User as UserIcon, X, Sparkles, Leaf } from 'lucide-react';
import { supabase } from '../services/supabase';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [showLoginForm, setShowLoginForm] = useState(false);
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
        .ilike('name', username)
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
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-black">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        {/* Background Video (Welcome Screen) */}
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className={`absolute min-w-full min-h-full object-cover transition-opacity duration-1000 ${showLoginForm ? 'opacity-0' : 'opacity-80'}`}
        >
          <source 
            src="https://assets.mixkit.co/videos/preview/mixkit-beautiful-landscape-of-green-fields-and-trees-40192-large.mp4" 
            type="video/mp4" 
          />
        </video>

        {/* Full Background Rice Plantation Image (Login Panel) */}
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105 ${showLoginForm ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1536633390841-39a44227dc6a?auto=format&fit=crop&q=80&w=2000')` }}
        ></div>

        {/* Dark Overlays */}
        <div className={`absolute inset-0 transition-all duration-1000 ${showLoginForm ? 'bg-emerald-950/70 backdrop-blur-md' : 'bg-black/30 backdrop-blur-[1px]'}`}></div>
      </div>

      {/* Botão de Chave no Canto Superior Direito */}
      <div className="absolute top-8 right-8 z-50">
        <button 
          onClick={() => setShowLoginForm(!showLoginForm)}
          className={`p-5 rounded-full shadow-2xl transition-all duration-500 transform hover:scale-110 active:scale-90 flex items-center justify-center ${
            showLoginForm 
            ? 'bg-white/10 text-white rotate-90 border border-white/20' 
            : 'bg-emerald-500 text-emerald-950 animate-bounce hover:animate-none border-4 border-emerald-400/50 shadow-emerald-500/40'
          }`}
        >
          {showLoginForm ? <X size={28} /> : <KeyRound size={28} />}
        </button>
      </div>

      {/* Camada Herói: Boas-vindas + Imagens de Plantação */}
      {!showLoginForm && (
        <div className="relative z-10 w-full max-w-6xl h-full flex flex-col items-center justify-center">
          
          {/* Imagens Decorativas de Plantação - Flutuantes */}
          <div className="hidden lg:block absolute inset-0 pointer-events-none">
            {/* Imagem 1: Milho/Verde */}
            <div className="absolute top-[15%] left-[10%] w-56 h-64 rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-2xl rotate-[-8deg] animate-in fade-in slide-in-from-left-20 duration-1000">
              <img src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="Plantação" />
            </div>
            {/* Imagem 2: Grãos/Sementes */}
            <div className="absolute bottom-[20%] left-[15%] w-48 h-48 rounded-[2.5rem] overflow-hidden border-4 border-white/10 shadow-2xl rotate-[12deg] animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-300">
              <img src="https://images.unsplash.com/photo-1592919016327-5192c72370bc?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="Sementes" />
            </div>
            {/* Imagem 3: Folhas/Textura */}
            <div className="absolute top-[20%] right-[10%] w-60 h-52 rounded-[3.5rem] overflow-hidden border-4 border-white/10 shadow-2xl rotate-[5deg] animate-in fade-in slide-in-from-right-20 duration-1000 delay-150">
              <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="Cultivo" />
            </div>
            {/* Imagem 4: Solo/Trabalho */}
            <div className="absolute bottom-[15%] right-[15%] w-44 h-60 rounded-[2rem] overflow-hidden border-4 border-white/10 shadow-2xl rotate-[-10deg] animate-in fade-in slide-in-from-top-20 duration-1000 delay-500">
              <img src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="Solo" />
            </div>
          </div>

          <div className="text-center animate-in fade-in zoom-in duration-1000">
            <div className="mb-8 flex justify-center">
               <div className="bg-emerald-500 p-5 rounded-[2rem] shadow-[0_20px_50px_rgba(16,185,129,0.4)] animate-pulse">
                  <Leaf size={40} className="text-emerald-950 fill-current" />
               </div>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)] leading-[0.9]">
              Bem-vindo à<br/>
              <span className="text-emerald-400">Wymdy Company</span>
            </h1>
            <div className="flex items-center justify-center space-x-4 mt-8">
              <div className="h-[1px] w-12 bg-white/20"></div>
              <p className="text-white/80 font-black text-xs md:text-sm uppercase tracking-[0.5em] drop-shadow-md">
                Excelência em Gestão Agrícola
              </p>
              <div className="h-[1px] w-12 bg-white/20"></div>
            </div>
          </div>
        </div>
      )}

      {/* Cartão de Login */}
      {showLoginForm && (
        <div className="relative z-20 w-full max-w-md bg-emerald-950/40 backdrop-blur-3xl border border-white/20 rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] animate-in slide-in-from-bottom-12 duration-700">
          
          {/* Header Mini-Banner: Plantação de Arroz */}
          <div className="relative h-40 w-full">
            <img 
              src="https://images.unsplash.com/photo-1536633390841-39a44227dc6a?auto=format&fit=crop&q=80&w=800" 
              className="w-full h-full object-cover"
              alt="Plantação de Arroz"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 to-transparent"></div>
            <div className="absolute bottom-4 left-8">
              <div className="flex items-center space-x-2 bg-emerald-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <Leaf size={10} className="text-emerald-400" />
                <span className="text-[8px] font-black text-white uppercase tracking-widest">Acesso Restrito</span>
              </div>
            </div>
          </div>

          <div className="p-12 pt-8">
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="bg-emerald-500 p-4 rounded-[1.8rem] text-emerald-950 mb-6 shadow-xl shadow-emerald-500/20">
                <ShieldCheck size={40} />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Painel de Acesso</h2>
              <p className="text-emerald-300/60 font-black text-[9px] uppercase tracking-[0.3em] mt-2">Identifique-se para continuar</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-emerald-100/50 uppercase tracking-[0.2em] mb-2 ml-2">Nome do Utilizador</label>
                  <div className="relative">
                    <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ex: João Admin"
                      className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-[2rem] font-bold text-white placeholder:text-white/20 focus:ring-4 focus:ring-emerald-500/30 focus:bg-white/10 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-emerald-100/50 uppercase tracking-[0.2em] mb-2 ml-2">Chave de Acesso (PIN)</label>
                  <div className="relative">
                    <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                    <input
                      type="password"
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      placeholder="••••"
                      className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-[2rem] font-black text-2xl tracking-[0.8em] text-white placeholder:text-white/20 placeholder:tracking-normal focus:ring-4 focus:ring-emerald-500/30 focus:bg-white/10 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-100 p-4 rounded-2xl flex items-center space-x-3 text-xs font-bold animate-in shake">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !username || !key}
                className="w-full py-6 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-[2.2rem] font-black shadow-2xl shadow-emerald-500/30 transition-all active:scale-[0.98] flex items-center justify-center uppercase tracking-widest text-[11px] disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin mr-3" size={20} /> : 'Validar Identidade'}
              </button>
            </form>

            <button 
              onClick={() => setShowLoginForm(false)}
              className="w-full mt-8 text-white/30 hover:text-white/60 transition-colors text-[9px] font-black uppercase tracking-widest"
            >
              Voltar para a Paisagem
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10 pointer-events-none">
        <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.5em]">
          Wymdy Group &copy; {new Date().getFullYear()} - Mozambique
        </p>
      </div>
    </div>
  );
};
