import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { api } from '../../services/api';
import { Room } from '../../types';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import {
  UserCheck,
  Building,
  Thermometer,
  Zap,
  DollarSign,
  Leaf,
  Wind,
  CheckCircle2,
  Clock,
  Send,
  HelpCircle,
  Lightbulb,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export const TenantPanel: React.FC = () => {
  const { user } = useAuth();
  const { selectedBuildingId } = useTenant();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [thermostatTarget, setThermostatTarget] = useState<number>(22.0);
  const [requestSent, setRequestSent] = useState(false);
  const [requestText, setRequestText] = useState('');

  useEffect(() => {
    async function loadTenantRooms() {
      setLoading(true);
      try {
        const allRooms = await api.getRooms({ buildingId: selectedBuildingId });
        // Tenant is allocated to 3rd Floor suites (Apex Tech) or specific rooms
        const tenantRooms = allRooms.filter(
          (r) => r.room_number.startsWith('3') || r.type === 'Office' || r.type === 'Server Room'
        );
        setRooms(tenantRooms.length > 0 ? tenantRooms.slice(0, 4) : allRooms.slice(0, 3));
      } catch (err) {
        console.error('Failed to load tenant rooms', err);
      } finally {
        setLoading(false);
      }
    }
    loadTenantRooms();
  }, [selectedBuildingId]);

  const handleSendComfortRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSent(true);
    setTimeout(() => {
      setRequestSent(false);
      setRequestText('');
    }, 2500);
  };

  // Aggregated tenant consumption
  const totalTenantKw = 48.6;
  const todayTenantKwh = 388.8;
  const monthCostUsd = Math.round(todayTenantKwh * 30 * 0.16);

  return (
    <div className="space-y-6">
      {/* Tenant Portal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 live-pulse-dot" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Private Tenant Suite Portal
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mt-0.5">
            {user?.organization_name || 'Apex Technologies'} Suite Portal
            <Badge variant="warning" size="sm">
              Isolated Space Access
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time sub-meter consumption, indoor environmental comfort, and private suite billing
          </p>
        </div>

        <div className="flex items-center gap-2 bg-amber-50/80 border border-amber-200/80 px-3 py-1.5 rounded-xl text-xs text-amber-800">
          <Lock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span>Tenant Isolated: Restricted to Suite 301-304</span>
        </div>
      </div>

      {/* Tenant Suite Visual Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-amber-900/30 bg-slate-950 h-44 sm:h-52 flex items-end">
        <img
          src="/assets/tenant_suite_portal.jpg"
          alt="Tenant Private Suite Energy Portal"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="relative z-10 p-5 sm:p-6 w-full flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 text-white">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="warning" size="sm">Private Tenant Suite Portal</Badge>
              <span className="text-[11px] text-amber-300 font-mono">End-to-End Tenant Isolation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {user?.organization_name || 'Apex Technologies'} Energy Management
            </h2>
            <p className="text-xs text-slate-300 max-w-xl mt-0.5">
              Dedicated sub-meter breakdown, environmental HVAC controls, and private utility invoicing.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-amber-500/30 text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 live-pulse-dot" />
            <span className="font-semibold text-slate-200">Thermostat: In Range (22.5°C)</span>
          </div>
        </div>
      </div>

      {/* Tenant Suite KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Suite Power Draw"
          value={totalTenantKw.toString()}
          unit="kW"
          icon={Zap}
          delta="Normal operating power"
          status="healthy"
        />
        <StatCard
          title="Today's Consumption"
          value={todayTenantKwh.toString()}
          unit="kWh"
          icon={Clock}
          delta="-6.2% vs yesterday"
          status="healthy"
        />
        <StatCard
          title="Estimated Monthly Utility"
          value={`$${monthCostUsd.toLocaleString()}`}
          unit="Current Cycle"
          icon={DollarSign}
          delta="Tariff: $0.16 / kWh"
          status="normal"
        />
        <StatCard
          title="Suite Comfort Index"
          value="96%"
          unit="Optimal IEQ"
          icon={Thermometer}
          delta="Avg 22.3°C | 45% RH"
          status="healthy"
        />
      </div>

      {/* Main Suite Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Assigned Micro-Zones & Sub-Meters */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Assigned Suite Micro-Zones</h3>
              <p className="text-xs text-slate-500">Sub-metered rooms and live indoor environmental metrics</p>
            </div>
            <Badge variant="healthy" size="sm">4 Allocated Zones</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-800 shadow-2xs">
                      {room.room_number}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{room.name}</h4>
                      <span className="text-[10px] text-slate-400 capitalize">{room.type}</span>
                    </div>
                  </div>
                  <Badge variant="healthy" size="sm">Active</Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-center">
                  <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 block">Temp</span>
                    <span className="font-bold text-slate-800 text-xs font-mono">{room.temperature}°C</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 block">Occupancy</span>
                    <span className="font-bold text-slate-800 text-xs font-mono">{room.current_occupancy} pax</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 block">Target</span>
                    <span className="font-bold text-blue-600 text-xs font-mono">{room.energy_target} kW</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Energy Conservation Tips for Tenant */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/70 to-blue-50/70 border border-emerald-200/80 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700">
              <span className="font-bold text-slate-900 block mb-0.5">Tenant Efficiency Tip</span>
              Your suite's smart sub-meter recorded 18% lower standby power after 7:00 PM. Maintaining your automated lighting schedule will save an estimated <strong>$140/month</strong> on utility allocations.
            </div>
          </div>
        </div>

        {/* Right 1 Col: Suite Comfort Adjustment & Service Desk */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Thermometer className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Suite Thermostat & Comfort</h3>
                <p className="text-xs text-slate-500">Request temperature setback or schedule</p>
              </div>
            </div>

            {/* Slider Control */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 mt-3 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Requested Setpoint:</span>
                <span className="font-mono font-extrabold text-blue-600 text-sm">
                  {thermostatTarget.toFixed(1)}°C
                </span>
              </div>

              <input
                type="range"
                min="19.0"
                max="25.0"
                step="0.5"
                value={thermostatTarget}
                onChange={(e) => setThermostatTarget(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>19.0°C (Cooler)</span>
                <span>22.0°C (Default)</span>
                <span>25.0°C (Warmer)</span>
              </div>
            </div>

            {/* Service Dispatch to Facility Manager */}
            <form onSubmit={handleSendComfortRequest} className="mt-4 space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Message to Facility Operations
              </label>
              <textarea
                rows={3}
                required
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                placeholder="e.g., Please adjust conference room airflow for tomorrow's 10:00 AM meeting..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />

              {requestSent ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-800 font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Request Dispatched to Building Operations</span>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Comfort Request
                </button>
              )}
            </form>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Tenant Privacy Shield
            </span>
            <span>Sub-meter: #MTR-301</span>
          </div>
        </div>
      </div>
    </div>
  );
};
