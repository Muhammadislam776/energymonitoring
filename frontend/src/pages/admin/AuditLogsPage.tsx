import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { ShieldCheck, Clock, User, Activity, Search } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await api.getAuditLogs();
        setLogs(list);
      } catch (err) {
        console.error('Failed to load audit logs', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.resource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
            Compliance & Security Records
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Immutable Audit Trail Log
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically stamped logs of user actions, threshold adjustments, and simulator triggers
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by operator, action, or resource..."
            className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total Logged Transactions: <strong>{logs.length}</strong>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Operator</th>
                <th className="px-5 py-3.5">Action Type</th>
                <th className="px-5 py-3.5">Resource Target</th>
                <th className="px-5 py-3.5">Details</th>
                <th className="px-5 py-3.5 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-slate-900">{log.user_name}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant="blue" size="sm">
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-800">{log.resource}</td>
                  <td className="px-5 py-3.5 text-slate-600 max-w-md truncate">{log.details}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-400 text-right">{log.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
