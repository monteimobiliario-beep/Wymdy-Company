
import React from 'react';
import { NAV_ITEMS } from '../constants';
import { UserRole } from '../types';
import { UserCircle, ShieldCheck } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, userRole }) => {
  const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0 md:pl-64">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-emerald-950 text-white p-6 shadow-2xl z-40 border-r border-emerald-900">
        <div className="mb-10 flex items-center space-x-3">
          <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter leading-none">WYMDY COMPANY</h1>
            <p className="text-emerald-400 text-[8px] font-black uppercase tracking-[0.3em] mt-1">Light Edition</p>
          </div>
        </div>
        
        <nav className="flex-1 space-y-2">
          {filteredNav.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-5 py-4 rounded-[1.25rem] transition-all group ${
                activeTab === item.id 
                  ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/50 translate-x-1' 
                  : 'hover:bg-emerald-900/50 text-emerald-400/80 hover:text-white'
              }`}
            >
              <span className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-emerald-900 mt-auto">
          <div className="flex items-center space-x-3 p-4 bg-emerald-900/30 rounded-2xl border border-emerald-900">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black shadow-lg">
              {userRole[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black truncate uppercase tracking-tighter">Sessão Ativa</p>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">{userRole}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
        <div className="animate-in fade-in duration-700">
          {children}
        </div>
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center h-20 px-4 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] z-50 rounded-t-[2.5rem]">
        {filteredNav.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${
              activeTab === item.id ? 'text-emerald-600 scale-110' : 'text-gray-300'
            }`}
          >
            <div className={`p-2.5 rounded-2xl transition-all ${activeTab === item.id ? 'bg-emerald-50 text-emerald-600' : ''}`}>
              {item.icon}
            </div>
            <span className="text-[8px] mt-1 font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};