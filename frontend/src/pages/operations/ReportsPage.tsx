import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { api } from '../../services/api';
import { Report } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { exportToPDF } from '../../services/exportUtils';
import {
  FileText,
  Download,
  Share2,
  Eye,
  Plus,
  Calendar,
  Building,
  CheckCircle2,
  Zap,
  TrendingDown,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { selectedBuildingId, selectedBuilding } = useTenant();

  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [reportType, setReportType] = useState('Daily Energy Report');
  const [reportPeriod, setReportPeriod] = useState('Yesterday');
  const [reportFormat, setReportFormat] = useState('PDF');
  const [loading, setLoading] = useState(true);
  const [generateLoading, setGenerateLoading] = useState(false);

  const loadReports = async () => {
    setLoading(true);
    try {
      const list = await api.getReports(selectedBuildingId);
      setReports(list);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [selectedBuildingId]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerateLoading(true);
    try {
      const created = await api.generateReport({
        type: reportType,
        building_id: selectedBuildingId,
        period: reportPeriod,
        format: reportFormat,
      });
      setShowGenerateModal(false);
      await loadReports();
      setSelectedReport(created);
    } catch (err) {
      console.error('Failed to generate report', err);
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleDownloadPDF = (rep: Report) => {
    const summary = rep.data?.summaryMetrics || {};
    const headers = ['Metric', 'Audited Value'];
    const rows = [
      ['Total Consumption', `${summary.totalKwh?.toLocaleString()} kWh`],
      ['Peak Power Demand', `${summary.peakDemandKw} kW`],
      ['Estimated Cost', `$${summary.costEstimateUsd?.toLocaleString()}`],
      ['Carbon Footprint', `${summary.carbonTons} tCO2e`],
      ['Efficiency Rating', `${summary.efficiencyScore || 84} / 100`],
      ['Active Flags', `${summary.openAlerts || 0} incidents`],
    ];
    exportToPDF(rep.title, headers, rows, `EnergyTwin_${rep.type.replace(/\s+/g, '_')}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
            Executive Compliance Audits
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Energy Management Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ISO 50001, ESG sustainability filings, and executive utility cost allocation reporting
          </p>
        </div>

        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Report</span>
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <Badge variant="blue" size="sm">
                  {rep.file_format}
                </Badge>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{rep.title}</h3>
              <p className="text-xs text-slate-500 mt-1">Period: {rep.period}</p>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Generated: {new Date(rep.generated_at).toLocaleDateString()}
              </span>

              {/* Metrics preview */}
              {rep.data?.summaryMetrics && (
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Consumption</span>
                    <span className="font-mono font-bold text-slate-800">
                      {rep.data.summaryMetrics.totalKwh?.toLocaleString()} kWh
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Estimated Cost</span>
                    <span className="font-mono font-bold text-slate-800">
                      ${rep.data.summaryMetrics.costEstimateUsd?.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => setSelectedReport(rep)}
                className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPDF(rep)}
                  className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium px-2 py-1 rounded-lg hover:bg-slate-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <Modal
          isOpen={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          title="Generate Executive Energy Report"
          subtitle={`Property: ${selectedBuilding?.name || 'EnergyTwin Tower'}`}
        >
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Report Template</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
              >
                <option value="Daily Energy Report">Daily Energy Report</option>
                <option value="Weekly Energy Report">Weekly Energy Report</option>
                <option value="Monthly Energy Report">Monthly Energy Report</option>
                <option value="Building Performance Report">Building Performance Report</option>
                <option value="Equipment Efficiency Report">Equipment Efficiency Report</option>
                <option value="Anomaly Report">Anomaly Report</option>
                <option value="Energy Savings Report">Energy Savings Report</option>
                <option value="Tenant Report">Tenant Space Report</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reporting Period</label>
                <input
                  type="text"
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                  placeholder="e.g. September 2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Format</label>
                <select
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                >
                  <option value="PDF">Branded PDF Document</option>
                  <option value="Excel">Raw Excel Spreadsheet</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowGenerateModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={generateLoading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm"
              >
                {generateLoading ? 'Generating...' : 'Compile & Export'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Report Preview Modal */}
      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={selectedReport.title}
          subtitle={`Period: ${selectedReport.period}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs leading-relaxed text-slate-700">
              <p className="font-semibold text-slate-900 mb-1">Executive Summary:</p>
              {selectedReport.data?.executiveSummary || 'Audit log compilation completed.'}
            </div>

            {selectedReport.data?.summaryMetrics && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-center">
                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Total Usage</span>
                  <span className="text-base font-bold font-mono text-blue-900">
                    {selectedReport.data.summaryMetrics.totalKwh?.toLocaleString()} kWh
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Peak Draw</span>
                  <span className="text-base font-bold font-mono text-amber-900">
                    {selectedReport.data.summaryMetrics.peakDemandKw} kW
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Billed Cost</span>
                  <span className="text-base font-bold font-mono text-emerald-900">
                    ${selectedReport.data.summaryMetrics.costEstimateUsd?.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button
                onClick={() => handleDownloadPDF(selectedReport)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF Audit
              </button>

              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
