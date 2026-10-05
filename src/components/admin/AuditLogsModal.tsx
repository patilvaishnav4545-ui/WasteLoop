import React from 'react';
import { AuditLog } from '../../types';
import { History, X, ShieldCheck } from 'lucide-react';

interface AuditLogsModalProps {
  logs: AuditLog[];
  onClose: () => void;
}

export const AuditLogsModal: React.FC<AuditLogsModalProps> = ({ logs, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative my-8">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">System Audit Trail & Security Logs</h3>
              <p className="text-[10px] text-slate-400 font-mono">Immutable Operations Timeline</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-bold text-emerald-400">{log.action}</span>
                <span className="text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-slate-200 leading-relaxed text-xs">{log.details}</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1">
                <span>Actor: <strong className="text-slate-300">{log.actorName}</strong> ({log.actorRole})</span>
                {log.reportId && <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-mono">{log.reportId}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
