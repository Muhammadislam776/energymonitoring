import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { api } from '../../services/api';
import { Equipment, Alert, Floor } from '../../types';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import {
  Wrench,
  AlertTriangle,
  Cpu,
  Layers,
  CheckCircle2,
  Clock,
  Activity,
  ShieldAlert,
  Flame,
  Thermometer,
  Zap,
  Filter,
  Check,
  Send,
  Building2,
  RefreshCw,
} from 'lucide-react';

export const FacilityManagerPanel: React.FC = () => {
  const { user } = useAuth();
  const { selectedBuildingId, floors } = useTenant();

  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [workOrderModal, setWorkOrderModal] = useState<{ open: boolean; item?: Equipment }>({ open: false });
  const [workOrderNotes, setWorkOrderNotes] = useState('');
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eq, al] = await Promise.all([
        api.getEquipment({ buildingId: selectedBuildingId }),
        api.getAlerts({ buildingId: selectedBuildingId }),
      ]);
      setEquipmentList(eq);
      setAlerts(al);
    } catch (err) {
      console.error('Failed to load Facility Manager operational data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBuildingId]);

  const handleResolveAlert = async (id: string) => {
    try {
      await api.updateAlertStatus(id, 'resolved');
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Failed to resolve alert', err);
    }
  };

  const handleDispatchWorkOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setDispatchSuccess(true);
    setTimeout(() => {
      setDispatchSuccess(false);
      setWorkOrderModal({ open: false });
      setWorkOrderNotes('');
    }, 1500);
  };

  const onlineCount = equipmentList.filter((e) => e.status === 'online').length;
  const warningCount = equipmentList.filter((e) => e.status === 'warning').length;
  const criticalCount = equipmentList.filter((e) => e.status === 'critical').length;
  const maintenanceCount = equipmentList.filter((e) => e.status === 'maintenance').length;

  const filteredEquipment = equipmentList.filter((e) => {
    if (selectedStatusFilter === 'all') return true;
    return e.status === selectedStatusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 live-pulse-dot" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Operations & Asset Health Desk
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mt-0.5">
            Facility Operations Center
            <Badge variant="healthy" size="sm">
              Level-2 Operational Desk
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Physical equipment monitoring, chiller runtime, maintenance ticketing, and urgent alarm triage
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold shadow-2xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Facility Operations Center Visual Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-800 bg-slate-950 h-44 sm:h-52 flex items-end">
        <img
          src="/assets/facility_ops_center.jpg"
          alt="Facility Engineering Operations Center"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="relative z-10 p-5 sm:p-6 w-full flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 text-white">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="healthy" size="sm">Central Plant Engineering</Badge>
              <span className="text-[11px] text-emerald-300 font-mono">120 Mechanical Units Tracked</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Chiller Plant & Fleet Asset Operations
            </h2>
            <p className="text-xs text-slate-300 max-w-xl mt-0.5">
              Live vibration monitoring, bearing temperature logging, and dispatching work orders to field teams.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 live-pulse-dot" />
            <span className="font-semibold text-slate-200">Building Automation: Online</span>
          </div>
        </div>
      </div>

      {/* Operations Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Online Equipment"
          value={`${onlineCount} / ${equipmentList.length}`}
          unit="Active Units"
          icon={Cpu}
          delta={`${Math.round((onlineCount / (equipmentList.length || 1)) * 100)}% Availability`}
          status="healthy"
        />
        <StatCard
          title="Warning / Degraded"
          value={warningCount.toString()}
          unit="Units Requiring Inspection"
          icon={AlertTriangle}
          delta="Filter / Pressure check"
          status="warning"
        />
        <StatCard
          title="Active Critical Alarms"
          value={alerts.filter((a) => a.severity === 'critical').length.toString()}
          unit="Urgent Dispatches"
          icon={ShieldAlert}
          delta="Immediate action needed"
          status="critical"
        />
        <StatCard
          title="In Scheduled Service"
          value={maintenanceCount.toString()}
          unit="Units Under Work Order"
          icon={Wrench}
          delta="Next PM: Tomorrow"
          status="normal"
        />
      </div>

      {/* Main Operational Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Asset Health Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Equipment Fleet Roster</h3>
              <p className="text-xs text-slate-500">Live operational state, power draw, and maintenance countdown</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {['all', 'online', 'warning', 'critical', 'maintenance'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                    selectedStatusFilter === st
                      ? 'bg-white text-emerald-700 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">Equipment Asset</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Live Draw</th>
                  <th className="pb-3">Runtime Hours</th>
                  <th className="pb-3">Health Status</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEquipment.slice(0, 10).map((eq) => {
                  const statusVariant: any =
                    eq.status === 'online' ? 'healthy' :
                    eq.status === 'warning' ? 'warning' :
                    eq.status === 'critical' ? 'danger' : 'blue';
                  return (
                    <tr key={eq.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 pl-2 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-slate-500" />
                          <span>{eq.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-slate-600 capitalize">{eq.type}</td>
                      <td className="py-3 font-mono font-bold text-slate-800">{eq.current_power} kW</td>
                      <td className="py-3 text-slate-600 font-mono">{eq.runtime_hours} hrs</td>
                      <td className="py-3">
                        <Badge variant={statusVariant} size="sm">
                          {eq.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 text-right pr-2">
                        <button
                          onClick={() => setWorkOrderModal({ open: true, item: eq })}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          Dispatch PM
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Urgent Alarm Triage Desk */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Urgent Alarm Triage</h3>
                  <p className="text-xs text-slate-500">Live operational alerts & safety limits</p>
                </div>
              </div>
              <Badge variant="danger" size="sm">{alerts.length} Pending</Badge>
            </div>

            <div className="space-y-3 mt-4">
              {alerts.length > 0 ? (
                alerts.slice(0, 5).map((al) => (
                  <div
                    key={al.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{al.title}</span>
                      <Badge variant={al.severity === 'critical' ? 'danger' : 'warning'} size="sm">
                        {al.severity}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">{al.message}</p>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span>{al.location}</span>
                      <button
                        onClick={() => handleResolveAlert(al.id)}
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold"
                      >
                        <Check className="w-3 h-3" /> Mark Resolved
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 py-10 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  All facility assets operating within nominal boundaries
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Maintenance Schedule:</span>
            <span className="font-bold text-slate-800">100% On-Track</span>
          </div>
        </div>
      </div>

      {/* Work Order Modal */}
      {workOrderModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Dispatch Preventive Maintenance</h3>
              </div>
              <button
                onClick={() => setWorkOrderModal({ open: false })}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            {dispatchSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-xs text-emerald-800 font-bold space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p>Work Order Dispatched to Field Technicians</p>
              </div>
            ) : (
              <form onSubmit={handleDispatchWorkOrder} className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <span className="text-slate-500 block">Target Asset:</span>
                  <span className="font-bold text-slate-900">{workOrderModal.item?.name}</span>
                  <span className="text-[11px] text-slate-500 block font-mono">
                    Runtime: {workOrderModal.item?.runtime_hours} hrs | Draw: {workOrderModal.item?.current_power} kW
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Technician Dispatch Notes
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={workOrderNotes}
                    onChange={(e) => setWorkOrderNotes(e.target.value)}
                    placeholder="e.g., Inspect refrigerant pressure, clean evaporator coils, verify delta T..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Confirm & Dispatch Ticket
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
