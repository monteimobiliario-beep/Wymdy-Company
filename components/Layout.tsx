
import React from 'react';
import { NAV_ITEMS } from '../constants';
import { UserRole } from '../types';

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
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-emerald-900 text-white p-6 shadow-xl">
        <div className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight">Wymdy ERP</h1>
          <p className="text-emerald-300 text-xs font-medium uppercase tracking-widest mt-1">Agricultural Edition</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          {filteredNav.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-emerald-500 text-white shadow-lg' 
                  : 'hover:bg-emerald-800 text-emerald-100'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-emerald-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center text-emerald-900 font-bold">
              {userRole[0]}
            </div>
            <div>
              <p className="text-sm font-semibold truncate">Utilizador</p>
              <p className="text-xs text-emerald-400 uppercase">{userRole}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center h-16 px-2 shadow-2xl z-50">
        {filteredNav.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              activeTab === item.id ? 'text-emerald-600' : 'text-gray-400'
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
