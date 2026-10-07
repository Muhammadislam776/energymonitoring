import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { api } from '../../services/api';
import { Recommendation } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Sparkles,
  DollarSign,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  CalendarCheck,
  XCircle,
  HelpCircle,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const { selectedBuildingId } = useTenant();

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const list = await api.getRecommendations({ buildingId: selectedBuildingId });
      setRecommendations(list);
    } catch (err) {
      console.error('Failed to load recommendations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [selectedBuildingId]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.updateRecommendationStatus(id, status);
      await loadRecommendations();
      if (selectedRec && selectedRec.id === id) {
        setSelectedRec({ ...selectedRec, status: status as any });
      }
    } catch (err) {
      console.error('Status update failed', err);
    }
  };

  const totalMonthlySavings = recommendations
    .filter((r) => r.status !== 'dismissed')
    .reduce((acc, r) => acc + r.monthly_saving_usd, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
            Evidence-Based AI Advisory
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            AI Energy Efficiency Recommendations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational setpoint optimizations and load-shedding opportunities verified by measured evidence
          </p>
        </div>

        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs flex items-center gap-3">
          <div>
            <span className="text-[10px] text-emerald-600 font-semibold uppercase block">Verified Pipeline ROI</span>
            <span className="text-base font-bold font-mono text-emerald-800">
              ${totalMonthlySavings.toLocaleString()} / month
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">(${Math.round(totalMonthlySavings * 12).toLocaleString()}/yr)</span>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((rec) => {
          const isImplemented = rec.status === 'implemented';
          const isTask = rec.status === 'task_created';
          const isDismissed = rec.status === 'dismissed';

          return (
            <div
              key={rec.id}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between shadow-card hover:shadow-card-hover ${
                isImplemented
                  ? 'bg-emerald-50/30 border-emerald-300'
                  : isDismissed
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{rec.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={rec.priority === 'high' ? 'danger' : rec.priority === 'medium' ? 'warning' : 'neutral'}
                        size="sm"
                      >
                        {rec.priority.toUpperCase()} PRIORITY
                      </Badge>
                      <Badge variant={isImplemented ? 'healthy' : isTask ? 'blue' : 'neutral'} size="sm">
                        {rec.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-bold font-mono text-emerald-700 block">
                      ${rec.monthly_saving_usd.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400">Monthly Savings</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">{rec.description}</p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-center mb-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Potential Reduction</span>
                    <span className="font-bold font-mono text-blue-600">{rec.potential_saving_pct}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Model Confidence</span>
                    <span className="font-bold font-mono text-emerald-700">{rec.confidence}%</span>
                  </div>
                </div>

                {/* Evidence highlights preview */}
                <div className="space-y-1 text-[11px] text-slate-500 mb-4">
                  <span className="font-bold text-slate-700 text-xs block mb-1">Measured Evidence:</span>
                  {rec.evidence.slice(0, 2).map((ev, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => setSelectedRec(rec)}
                  className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>View All Evidence</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1.5">
                  {!isImplemented && (
                    <button
                      onClick={() => handleUpdateStatus(rec.id, 'task_created')}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium text-slate-700 transition-colors"
                    >
                      Create Task
                    </button>
                  )}
                  {!isImplemented ? (
                    <button
                      onClick={() => handleUpdateStatus(rec.id, 'implemented')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs transition-colors"
                    >
                      Mark Implemented
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(rec.id, 'active')}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium text-slate-600"
                    >
                      Reopen
                    </button>
                  )}
                  {!isDismissed && !isImplemented && (
                    <button
                      onClick={() => handleUpdateStatus(rec.id, 'dismissed')}
                      className="px-2 py-1.5 text-slate-400 hover:text-slate-600"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View Evidence Modal */}
      {selectedRec && (
        <Modal
          isOpen={!!selectedRec}
          onClose={() => setSelectedRec(null)}
          title={`Evidence Behind: ${selectedRec.title}`}
          subtitle={`Potential Monthly Savings: $${selectedRec.monthly_saving_usd.toLocaleString()} (${selectedRec.potential_saving_pct}%) • ${selectedRec.confidence}% Confidence`}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              {selectedRec.description}
            </div>

            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Verified Telemetry Audit Points
            </h4>

            <div className="space-y-2">
              {selectedRec.evidence.map((ev, i) => (
                <div key={i} className="p-3 rounded-xl bg-blue-50/40 border border-blue-100 text-xs text-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{ev}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRec(null)}
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
