
import React from 'react';
import { NAV_ITEMS } from '../constants';
import { UserRole } from '../types';
import { ShieldCheck, Leaf } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, userRole }) => {
  const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0 md:pl-64 bg-[#fcfdfc]">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-emerald-950 text-white p-6 shadow-2xl z-40 border-r border-emerald-900 overflow-hidden">
        {/* Background Leaf Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <Leaf className="absolute -right-10 top-20 rotate-45" size={200} />
          <Leaf className="absolute -left-10 bottom-40 -rotate-12" size={150} />
        </div>

        <div className="mb-10 flex items-center space-x-3 relative z-10">
          <div className="bg-emerald-500 p-2.5 rounded-2xl shadow-xl shadow-emerald-500/20">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter leading-none">WYMDY <span className="text-emerald-400">CO.</span></h1>
            <p className="text-emerald-500 text-[8px] font-black uppercase tracking-[0.4em] mt-1.5">Agricultural ERP</p>
          </div>
        </div>
        
        <nav className="flex-1 space-y-2 relative z-10">
          {filteredNav.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-4 px-6 py-4 rounded-[1.5rem] transition-all group ${
                activeTab === item.id 
                  ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/50 translate-x-1 border border-white/10' 
                  : 'hover:bg-emerald-900/50 text-emerald-500/50 hover:text-white'
              }`}
            >
              <span className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              <span className="font-black text-[10px] uppercase tracking-[0.2em]">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-emerald-900 mt-auto relative z-10">
          <div className="flex items-center space-x-3 p-4 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/5 shadow-inner">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-emerald-950 font-black shadow-lg">
              {userRole[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black truncate uppercase tracking-tighter opacity-50">Sessão</p>
              <p className="text-[9px] text-emerald-400 font-black uppercase tracking-widest leading-none">{userRole}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full relative z-0">
        <div className="animate-in fade-in duration-700">
          {children}
        </div>
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 flex justify-around items-center h-22 px-4 shadow-[0_-15px_40px_-20px_rgba(0,0,0,0.2)] z-50 rounded-t-[3.5rem]">
        {filteredNav.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${
              activeTab === item.id ? 'text-emerald-600 scale-110' : 'text-gray-300'
            }`}
          >
            <div className={`p-3 rounded-[1.5rem] transition-all ${activeTab === item.id ? 'bg-emerald-50 text-emerald-600 shadow-sm' : ''}`}>
              {item.icon}
            </div>
            <span className="text-[8px] mt-2 font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
