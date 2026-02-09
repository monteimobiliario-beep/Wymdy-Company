
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { StockModule } from './components/StockModule';
import { SalesModule } from './components/SalesModule';
import { FinanceModule } from './components/FinanceModule';
import { UserRole } from './types';

// Mock simple routing system
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser] = useState({ name: 'Admin', role: UserRole.ADMIN });

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
        return (
          <div className="space-y-6">
             <h2 className="text-2xl font-bold">Recursos Humanos</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                   <h3 className="font-bold mb-4">Funcionários Ativos</h3>
                   <ul className="divide-y divide-gray-50">
                      <li className="py-3 flex justify-between">
                         <div>
                            <p className="font-bold">João Pedro</p>
                            <p className="text-xs text-gray-500">Gestor de Stock</p>
                         </div>
                         <span className="text-xs text-emerald-600 font-bold uppercase">Ativo</span>
                      </li>
                      <li className="py-3 flex justify-between">
                         <div>
                            <p className="font-bold">Ana Maria</p>
                            <p className="text-xs text-gray-500">Caixa / Vendedora</p>
                         </div>
                         <span className="text-xs text-emerald-600 font-bold uppercase">Ativo</span>
                      </li>
                   </ul>
                </div>
             </div>
          </div>
        );
      case 'audit':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Audit Log</h2>
            <div className="bg-emerald-900 text-emerald-100 p-4 rounded-xl font-mono text-xs overflow-x-auto space-y-2">
              <p>[2023-10-25 10:15:22] ADMIN: Ajuste de stock ProductID=FERT-002, Quantidade= -13, Motivo: Quebra</p>
              <p>[2023-10-25 09:45:01] SELLER: Venda Criada ID=V004, Cliente=Escola Agrária, Total=MT 12.000</p>
              <p>[2023-10-25 08:30:11] FINANCE: Pagamento Recebido Parcela ID=P-9921, Valor=MT 5.000</p>
            </div>
          </div>
        );
      case 'config':
        return (
          <div className="max-w-xl space-y-6">
            <h2 className="text-2xl font-bold">Configurações do Sistema</h2>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nome da Empresa</label>
                <input type="text" defaultValue="Wymdy Company Lda" className="w-full p-3 bg-gray-50 border-none rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Moeda Principal</label>
                <input type="text" defaultValue="Metical (MT)" className="w-full p-3 bg-gray-50 border-none rounded-xl" />
              </div>
              <button className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold">Salvar Alterações</button>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} userRole={currentUser.role}>
      {renderContent()}
    </Layout>
  );
};

export default App;
