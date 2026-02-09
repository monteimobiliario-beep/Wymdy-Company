
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { StockModule } from './components/StockModule';
import { SalesModule } from './components/SalesModule';
import { FinanceModule } from './components/FinanceModule';
import { HRModule } from './components/HRModule';
import { SettingsModule } from './components/SettingsModule';
import { AuditModule } from './components/AuditModule';
import { Login } from './components/Login';
import { User, UserRole } from './types';
import { supabase } from './services/supabase';
import { Database, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkConnection() {
      try {
        const { error } = await supabase.from('system_users').select('count', { count: 'exact', head: true });
        setDbConnected(!error);
      } catch (e) {
        setDbConnected(false);
      }
    }
    checkConnection();
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'stock':
        return <StockModule />;
      case 'sales':
        return <SalesModule />;
      case 'finance':
        return <FinanceModule />;
      case 'hr':
        return <HRModule />;
      case 'audit':
        return <AuditModule />;
      case 'config':
        return <SettingsModule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* DB Status & Profile info bar */}
      <div className="bg-emerald-950 text-white px-6 py-3 flex items-center justify-between text-[10px] font-bold z-[100] shadow-md">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="uppercase tracking-widest opacity-60">Sessão:</span>
            <span className="bg-emerald-800 px-3 py-1 rounded-full uppercase tracking-widest">{currentUser.name} ({currentUser.role})</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-2 border-l border-emerald-800 pl-6">
            <Database size={14} className={dbConnected ? "text-emerald-400" : "text-red-400"} />
            <span className="uppercase tracking-widest">
              Cloud Status: {dbConnected === null ? 'Checking...' : dbConnected ? 'Ligado' : 'Erro DB'}
            </span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center space-x-2 text-emerald-400 hover:text-white transition-colors uppercase tracking-widest"
        >
          <span>Sair</span>
          <LogOut size={14} />
        </button>
      </div>

      <Layout activeTab={activeTab} setActiveTab={setActiveTab} userRole={currentUser.role}>
        {renderContent()}
      </Layout>
    </div>
  );
};

export default App;
