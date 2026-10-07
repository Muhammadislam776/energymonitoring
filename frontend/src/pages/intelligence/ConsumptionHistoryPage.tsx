import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { api } from '../../services/api';
import { exportToCSV, exportToExcel, exportToPDF } from '../../services/exportUtils';
import { History, Search, Download, FileSpreadsheet, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

export const ConsumptionHistoryPage: React.FC = () => {
  const { selectedBuildingId } = useTenant();

  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getEnergyHistory({
        buildingId: selectedBuildingId,
        page,
        limit: 15,
        search: searchTerm || undefined,
      });
      setData(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedBuildingId, page, searchTerm]);

  // Export handlers
  const handleExportCSV = () => {
    exportToCSV(`EnergyTwin_History_${Date.now()}`, data);
  };

  const handleExportExcel = () => {
    exportToExcel(`EnergyTwin_History_${Date.now()}`, data, 'Historical Telemetry');
  };

  const handleExportPDF = () => {
    const headers = ['Timestamp', 'Meter ID', 'Floor', 'Power (kW)', 'Energy (kWh)', 'Cost ($)', 'Carbon (kg)'];
    const rows = data.map((d) => [
      d.date,
      d.meterId,
      d.floor,
      d.powerKw,
      d.consumptionKwh,
      `$${d.costUsd}`,
      `${d.carbonKg} kg`,
    ]);
    exportToPDF('Energy Consumption Historical Audit', headers, rows, `EnergyTwin_Audit_${Date.now()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
            Auditable Telemetry Archive
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Consumption History & Audit Log
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full granular interval readings, peak billing records, costs, and carbon accounting
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-emerald-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Audit PDF</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search by meter ID or location..."
            className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{data.length}</strong> of <strong>{total}</strong> records
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Meter ID</th>
                <th className="px-5 py-3.5">Floor</th>
                <th className="px-5 py-3.5">Zone</th>
                <th className="px-5 py-3.5">Power</th>
                <th className="px-5 py-3.5">Energy</th>
                <th className="px-5 py-3.5">Cost</th>
                <th className="px-5 py-3.5">Carbon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-slate-600">{row.date}</td>
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{row.meterId}</td>
                  <td className="px-5 py-3.5 text-slate-600">{row.floor}</td>
                  <td className="px-5 py-3.5 text-slate-500 truncate max-w-[180px]">{row.room}</td>
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{row.powerKw} kW</td>
                  <td className="px-5 py-3.5 font-mono text-blue-600 font-semibold">{row.consumptionKwh} kWh</td>
                  <td className="px-5 py-3.5 font-mono text-slate-800 font-semibold">${row.costUsd}</td>
                  <td className="px-5 py-3.5 font-mono text-emerald-700">{row.carbonKg} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>
            Page <strong>{page}</strong> of <strong>{totalPages || 1}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
