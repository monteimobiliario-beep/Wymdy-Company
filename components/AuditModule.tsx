
import React, { useState, useEffect } from 'react';
import { History, ShieldAlert, User, Clock, Terminal, Search, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

export const AuditModule: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setIsLoading(true);
    const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50);
    if (data) setLogs(data);
    setIsLoading(false);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight uppercase">Auditoria & Logs</h2>
          <p className="text-gray-500 italic font-medium">Rastreabilidade total via Cloud Monitor</p>
        </div>
        <button onClick={fetchLogs} className="bg-emerald-50 text-emerald-600 p-3 rounded-xl hover:bg-emerald-100 transition-all"><History size={20} /></button>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-900 flex items-center space-x-2">
           <Terminal size={16} className="text-emerald-400" />
           <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">System Trace Active</span>
        </div>
        
        {isLoading ? (
          <div className="p-20 text-center text-emerald-600 font-black animate-pulse flex flex-col items-center">
            <Loader2 size={32} className="animate-spin mb-4" />
            LENDO TRACE...
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.length === 0 ? (
              <div className="p-20 text-center text-gray-300 font-black uppercase text-xs tracking-widest">Nenhum log registrado ainda</div>
            ) : logs.map(log => (
              <div key={log.id} className="p-6 flex flex-col md:flex-row md:items-center gap-4 hover:bg-gray-50/50 transition-colors group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  log.level === 'danger' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
                }`}>
                  {log.level === 'danger' ? <ShieldAlert size={24} /> : <History size={24} />}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">{log.action}</span>
                  </div>
                  <h4 className="font-black text-gray-900 text-sm tracking-tight">{log.entity}</h4>
                  <p className="text-xs text-gray-500 font-medium italic">{log.details}</p>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    <Clock size={12} className="mr-1" /> {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
