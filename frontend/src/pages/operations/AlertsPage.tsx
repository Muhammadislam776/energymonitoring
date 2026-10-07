import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { api } from '../../services/api';
import { Alert } from '../../types';
import { Badge } from '../../components/common/Badge';
import {
  Bell,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  ShieldAlert,
  Radio,
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { selectedBuildingId } = useTenant();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const list = await api.getAlerts({
        buildingId: selectedBuildingId,
        severity: severityFilter !== 'all' ? severityFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
      });
      setAlerts(list);
    } catch (err) {
      console.error('Failed to load alerts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [selectedBuildingId, severityFilter, statusFilter, searchTerm]);

  const handleUpdateStatus = async (id: string, status: 'acknowledged' | 'resolved') => {
    try {
      await api.updateAlertStatus(id, status);
      await loadAlerts();
    } catch (err) {
      console.error('Alert update failed', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block">
            Incident Dispatch & Monitoring
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Operational Alerts Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active telemetry alarms, communication drops, and utility demand limit breaches
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search alerts by title or location..."
            className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Severity</th>
                <th className="px-5 py-3.5">Alert Title</th>
                <th className="px-5 py-3.5">Location</th>
                <th className="px-5 py-3.5">Time</th>
                <th className="px-5 py-3.5">Telemetry vs Limit</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alerts.map((al) => (
                <tr key={al.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <Badge
                      variant={
                        al.severity === 'critical'
                          ? 'danger'
                          : al.severity === 'warning'
                          ? 'warning'
                          : 'info'
                      }
                      size="sm"
                      pulse={al.status === 'new' && al.severity === 'critical'}
                    >
                      {al.severity.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-bold text-slate-900 block">{al.title}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{al.message}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {al.location}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{al.created_at}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-700">
                    {al.current_value !== undefined && al.threshold !== undefined ? (
                      <span>
                        <strong>{al.current_value}</strong> / {al.threshold}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        al.status === 'new'
                          ? 'bg-rose-100 text-rose-700'
                          : al.status === 'acknowledged'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {al.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {al.status === 'new' && (
                        <button
                          onClick={() => handleUpdateStatus(al.id, 'acknowledged')}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-medium text-slate-700"
                        >
                          Acknowledge
                        </button>
                      )}
                      {al.status !== 'resolved' && (
                        <button
                          onClick={() => handleUpdateStatus(al.id, 'resolved')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[11px] font-bold text-emerald-700 border border-emerald-200"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
