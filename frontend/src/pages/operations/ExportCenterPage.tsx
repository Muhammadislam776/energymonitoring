import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { api } from '../../services/api';
import { exportToCSV, exportToExcel, exportToPDF } from '../../services/exportUtils';
import { Badge } from '../../components/common/Badge';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Clock,
  CheckCircle2,
  Database,
  ArrowRight,
  History,
} from 'lucide-react';

export const ExportCenterPage: React.FC = () => {
  const { selectedBuildingId } = useTenant();

  const [history, setHistory] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState('consumption_history');
  const [format, setFormat] = useState('CSV');
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    try {
      const logs = await api.getExportHistory();
      setHistory(logs);
    } catch (err) {
      console.error('Failed to load export history', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.generateExport({
        dataset: selectedDataset,
        format,
        buildingId: selectedBuildingId,
      });

      if (format === 'CSV') {
        exportToCSV(res.filename.replace('.csv', ''), res.records);
      } else if (format === 'XLSX') {
        exportToExcel(res.filename.replace('.xlsx', ''), res.records, selectedDataset);
      } else {
        if (res.records.length > 0) {
          const headers = Object.keys(res.records[0]);
          const rows = res.records.map((r: any) => headers.map((h) => String(r[h] ?? '')));
          exportToPDF(`EnergyTwin Export — ${selectedDataset}`, headers, rows, res.filename.replace('.pdf', ''));
        }
      }

      await loadHistory();
    } catch (err) {
      console.error('Export error', err);
    } finally {
      setLoading(false);
    }
  };

  const datasets = [
    { id: 'consumption_history', name: 'Consumption History (30 Days)', count: '360 intervals' },
    { id: 'meter_readings', name: 'Smart Meters Telemetry Fleet', count: '24 meters' },
    { id: 'equipment', name: 'Equipment Fleet & Health Ratings', count: '120 units' },
    { id: 'anomalies', name: 'AI Anomalies & Diagnostic Dossiers', count: '4 incidents' },
    { id: 'alerts', name: 'Operational Alarms & Incidents Log', count: '7 alarms' },
    { id: 'recommendations', name: 'AI Efficiency Savings Recommendations', count: '4 opportunities' },
    { id: 'forecasts', name: 'Demand Forecast Series & Confidence Bounds', count: '48 time steps' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
            Data Portability Hub
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Enterprise Export Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Extract granular energy telemetry, physical asset states, and AI diagnostic records
          </p>
        </div>
      </div>

      {/* Export Configuration Card */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-card">
        <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600" />
          <span>Configure Data Export Extraction</span>
        </h3>
        <p className="text-xs text-slate-500 mb-6">Select telemetry dataset and target export format:</p>

        <form onSubmit={handleExport} className="space-y-6">
          {/* Dataset Selector Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Select Dataset</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {datasets.map((ds) => (
                <div
                  key={ds.id}
                  onClick={() => setSelectedDataset(ds.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedDataset === ds.id
                      ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20'
                      : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 block">{ds.name}</span>
                  <span className="text-[10px] text-slate-500 block mt-1">{ds.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Format Radio / Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Export File Format</label>
            <div className="flex items-center gap-3">
              {[
                { id: 'CSV', label: 'CSV (Comma Separated)', icon: Download },
                { id: 'XLSX', label: 'Microsoft Excel (XLSX)', icon: FileSpreadsheet },
                { id: 'PDF', label: 'Audit PDF Document', icon: FileText },
              ].map((fmt) => (
                <button
                  type="button"
                  key={fmt.id}
                  onClick={() => setFormat(fmt.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    format === fmt.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <fmt.icon className="w-4 h-4" />
                  <span>{fmt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{loading ? 'Extracting...' : 'Extract & Download Dataset'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Export History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Export Transaction Log
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Dataset</th>
                <th className="px-5 py-3.5">Format</th>
                <th className="px-5 py-3.5">Records</th>
                <th className="px-5 py-3.5">File Size</th>
                <th className="px-5 py-3.5">Exported By</th>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{log.dataset}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant="blue" size="sm">
                      {log.format}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-700">{log.recordsCount} rows</td>
                  <td className="px-5 py-3.5 font-mono text-slate-500">{log.fileSize}</td>
                  <td className="px-5 py-3.5 text-slate-600">{log.exportedBy}</td>
                  <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-emerald-700 font-semibold text-[11px] flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Complete
                    </span>
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
