import React from 'react';
import { ShieldCheck, Lock, Activity, CheckCircle2, User } from 'lucide-react';
import { AuditLog, Organization } from '../types/finance';

interface AuditViewProps {
  auditLogs: AuditLog[];
  activeOrg: Organization;
}

export const AuditView: React.FC<AuditViewProps> = ({ auditLogs, activeOrg }) => {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Audit Trail & Security Invariants</h2>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident system logs for all financial mutations, journals, and multi-tenant access.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400 font-semibold">
          <Lock className="h-3.5 w-3.5" />
          <span>RLS Enforced • Tenant: {activeOrg.slug}</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-4">Details</th>
                <th className="py-3.5 px-4">Actor Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-emerald-400 rounded bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300 capitalize">{log.entityName}</td>
                  <td className="py-3.5 px-4 text-slate-200">{log.details}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{log.userEmail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
