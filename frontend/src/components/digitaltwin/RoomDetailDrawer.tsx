import React, { useEffect, useState } from 'react';
import { X, Cpu, AlertTriangle, Zap, Thermometer, Users, ShieldAlert, CheckCircle2, Gauge } from 'lucide-react';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';

interface RoomDetailDrawerProps {
  roomId: string | null;
  onClose: () => void;
}

export const RoomDetailDrawer: React.FC<RoomDetailDrawerProps> = ({ roomId, onClose }) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    async function load() {
      setLoading(true);
      try {
        const details = await api.getRoomDetails(roomId!);
        setData(details);
      } catch (err) {
        console.error('Failed to load room details', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [roomId]);

  if (!roomId) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
            Digital Twin Zone Telemetry
          </span>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            {loading ? 'Loading...' : `${data?.room_number || ''} ${data?.name || 'Room Details'}`}
          </h3>
          <span className="text-xs text-slate-500">{data?.floor_name} • {data?.building_name}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer content */}
      {loading ? (
        <div className="p-6 text-center text-xs text-slate-400">Loading room sensor telemetry...</div>
      ) : data ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Top Quick Status Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Live Power */}
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
              <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3" /> Live Draw
              </span>
              <p className="text-xl font-bold font-mono text-blue-900 mt-1">
                {Number(data.current_power_kw || 0).toFixed(1)} <span className="text-xs font-sans text-blue-600">kW</span>
              </p>
              <span className="text-[10px] text-blue-600/80">Target: {data.energy_target} kW</span>
            </div>

            {/* Temperature */}
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
              <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                <Thermometer className="w-3 h-3" /> Zone Temp
              </span>
              <p className="text-xl font-bold font-mono text-amber-900 mt-1">
                {data.temperature} <span className="text-xs font-sans text-amber-600">°C</span>
              </p>
              <span className="text-[10px] text-amber-600/80">Setpoint: 22.0°C</span>
            </div>

            {/* Occupancy */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3" /> Occupancy
              </span>
              <p className="text-xl font-bold font-mono text-slate-800 mt-1">
                {data.current_occupancy}{' '}
                <span className="text-xs font-sans text-slate-400">/ {data.occupancy_capacity}</span>
              </p>
              <span className="text-[10px] text-slate-500">
                {Math.round((data.current_occupancy / (data.occupancy_capacity || 1)) * 100)}% Capacity
              </span>
            </div>

            {/* Efficiency Score */}
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Efficiency
              </span>
              <p className="text-xl font-bold font-mono text-emerald-900 mt-1">
                {data.efficiency_score} <span className="text-xs font-sans text-emerald-600">/ 100</span>
              </p>
              <span className="text-[10px] text-emerald-600/80">Grade A (Optimal)</span>
            </div>
          </div>

          {/* Active Alerts in this room */}
          {data.alerts && data.alerts.length > 0 && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
              <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5 mb-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" /> Active Alerts ({data.alerts.length})
              </h4>
              <div className="space-y-1.5">
                {data.alerts.map((al: any) => (
                  <div key={al.id} className="text-xs bg-white p-2 rounded-lg border border-rose-100">
                    <p className="font-semibold text-rose-950">{al.title}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">{al.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Anomalies */}
          {data.anomalies && data.anomalies.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Recent Anomaly Detections
              </h4>
              <div className="space-y-1.5">
                {data.anomalies.map((an: any) => (
                  <div key={an.id} className="text-xs bg-white p-2 rounded-lg border border-amber-100">
                    <p className="font-semibold text-slate-800">{an.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{an.explanation}</p>
                    <span className="text-[10px] text-amber-700 font-semibold block mt-1">
                      Measured {an.measured_value} kW vs Expected {an.expected_value} kW
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Equipment in this room */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> Installed Equipment ({data.equipment?.length || 0})
            </h4>
            <div className="space-y-2">
              {data.equipment && data.equipment.length > 0 ? (
                data.equipment.map((eq: any) => (
                  <div
                    key={eq.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{eq.name}</span>
                      <Badge
                        variant={
                          eq.status === 'online'
                            ? 'healthy'
                            : eq.status === 'warning'
                            ? 'warning'
                            : eq.status === 'critical'
                            ? 'danger'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {eq.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                      <span>{eq.type} • Rated {eq.rated_power} kW</span>
                      <span className="font-mono font-semibold text-slate-800">{eq.current_power} kW live</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 py-3 text-center">No dedicated sub-equipment registered</div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
