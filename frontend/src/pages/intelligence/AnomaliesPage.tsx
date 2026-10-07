import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { api } from '../../services/api';
import { Anomaly } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Activity,
  Layers,
  Thermometer,
  Users,
  ChevronRight,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const AnomaliesPage: React.FC = () => {
  const { selectedBuildingId } = useTenant();

  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnomalies = async () => {
    setLoading(true);
    try {
      const list = await api.getAnomalies({ buildingId: selectedBuildingId });
      setAnomalies(list);
    } catch (err) {
      console.error('Failed to load anomalies', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnomalies();
  }, [selectedBuildingId]);

  const handleUpdateStatus = async (id: string, status: 'active' | 'investigating' | 'resolved') => {
    try {
      await api.updateAnomalyStatus(id, status);
      await loadAnomalies();
      if (selectedAnomaly && selectedAnomaly.id === id) {
        setSelectedAnomaly({ ...selectedAnomaly, status });
      }
    } catch (err) {
      console.error('Status update failed', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block">
            Statistical Validation & AI Diagnostics
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            AI Anomaly Detection & Evidence Log
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-referencing live telemetry against thermal physics, occupancy trends, and historical baselines
          </p>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="grid grid-cols-1 gap-4">
        {anomalies.map((an) => {
          const isHigh = an.severity === 'critical' || an.severity === 'high';
          return (
            <div
              key={an.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isHigh ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{an.title}</h3>
                      <span className="text-[11px] text-slate-400">
                        Detected: {an.detected_at} • {an.floor_name || 'Level 3'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={isHigh ? 'danger' : 'warning'} size="sm">
                      {an.severity.toUpperCase()} SEVERITY
                    </Badge>
                    <Badge variant={an.status === 'resolved' ? 'healthy' : 'neutral'} size="sm">
                      {an.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Explanation text */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-4 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-0.5">Why is this unusual?</span>
                  {an.explanation}
                </div>

                {/* Quantitative Comparison Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-medium">Measured Power</span>
                    <span className="text-sm font-bold font-mono text-slate-900">{an.measured_value} kW</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-medium">Expected Baseline</span>
                    <span className="text-sm font-bold font-mono text-slate-600">{an.expected_value} kW</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-medium">Variance</span>
                    <span className="text-sm font-bold font-mono text-rose-600">
                      {an.difference_pct > 0 ? `+${an.difference_pct}%` : `${an.difference_pct}%`}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-medium">Model Confidence</span>
                    <span className="text-sm font-bold font-mono text-emerald-700">{an.confidence}%</span>
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedAnomaly(an)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  <span>Inspect Diagnostic Evidence & Timeline</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2 text-xs">
                  {an.status !== 'investigating' && an.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(an.id, 'investigating')}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium text-slate-700"
                    >
                      Investigate
                    </button>
                  )}
                  {an.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(an.id, 'resolved')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Evidence & Timeline Modal */}
      {selectedAnomaly && (
        <Modal
          isOpen={!!selectedAnomaly}
          onClose={() => setSelectedAnomaly(null)}
          title={`Evidence Dossier: ${selectedAnomaly.title}`}
          subtitle={`AI Behavioral Verification Log • Detected at ${selectedAnomaly.detected_at}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            {/* Ground-Truth Evidence Points */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs space-y-2">
              <span className="font-bold text-blue-900 block mb-1">Measured Evidence Variables:</span>
              <ul className="space-y-1.5 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <span><strong>Historical Baseline:</strong> {selectedAnomaly.evidence?.historicalBaseline || '27.4 kW (±1.8 kW normal variance)'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <span><strong>Occupancy Correlation:</strong> {selectedAnomaly.evidence?.occupancyFactor || '14 occupants in zone (cooling load expected < 28 kW)'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <span><strong>Operating Schedule:</strong> {selectedAnomaly.evidence?.compressorStatus || 'Compressor running continuously at 100% capacity without cycling'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <span><strong>Similar Days:</strong> {selectedAnomaly.evidence?.similarDaysComparison || 'Last 4 Tuesdays averaged 26.9 kW at matching interval'}</span>
                </li>
              </ul>
            </div>

            {/* Evidence Timeline Chart if available */}
            {selectedAnomaly.evidence?.timeline && (
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <h4 className="text-xs font-bold text-slate-800 mb-2">Evidence Telemetry Surge Timeline</h4>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedAnomaly.evidence.timeline}>
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} unit=" kW" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#ffffff',
                          fontSize: '11px',
                        }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2.5} name="Measured kW" />
                      <Line type="monotone" dataKey="expected" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1.5} name="Expected kW" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAnomaly(null)}
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
