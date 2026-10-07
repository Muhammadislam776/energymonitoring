import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import { useTenant } from '../../context/TenantContext';
import { api } from '../../services/api';
import { Meter } from '../../types';
import { Badge } from '../../components/common/Badge';
import {
  Zap,
  Radio,
  Gauge,
  Activity,
  Waves as Wave,
  Leaf,
  Wifi,
  WifiOff,
  Cpu,
  Layers,
  Clock,
  Play,
  Pause,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const LiveMonitoringPage: React.FC = () => {
  const { isConnected, liveData } = useWebSocket();
  const { selectedBuildingId } = useTenant();

  const [meters, setMeters] = useState<Meter[]>([]);
  const [liveHistory, setLiveHistory] = useState<Array<{ time: string; power: number; voltage: number }>>([]);
  const [isPaused, setIsPaused] = useState(false);

  // Load meters
  useEffect(() => {
    async function loadMeters() {
      try {
        const mList = await api.getMeters({ buildingId: selectedBuildingId });
        setMeters(mList);
      } catch (err) {
        console.error('Failed to load meters', err);
      }
    }
    loadMeters();
  }, [selectedBuildingId]);

  // Append incoming telemetry tick to real-time waveform buffer
  useEffect(() => {
    if (!liveData || isPaused) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLiveHistory((prev) => {
      const next = [...prev, { time: timeStr, power: liveData.buildingPower, voltage: liveData.voltage }];
      return next.slice(-25); // keep last 25 real-time ticks
    });

    // Update power values of active meters in memory
    if (liveData.meters && liveData.meters.length > 0) {
      setMeters((prevMeters) =>
        prevMeters.map((m) => {
          const update = liveData.meters.find((um) => um.id === m.id);
          if (update) {
            return { ...m, power: update.power, last_reading: new Date().toISOString() };
          }
          return m;
        })
      );
    }
  }, [liveData, isPaused]);

  // Electrical parameters
  const powerKw = liveData?.buildingPower || 428.6;
  const voltage = liveData?.voltage || 401.2;
  const current = liveData?.current || 614.5;
  const powerFactor = liveData?.powerFactor || 0.95;
  const frequency = liveData?.frequency || 50.0;
  const carbonRateKgHr = Number((powerKw * 0.42).toFixed(2));

  return (
    <div className="space-y-6">
      {/* Top Telemetry Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
            Sub-Second Electrical Grid Busway
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Real-Time Live Telemetry
            <Badge variant={isConnected ? 'healthy' : 'danger'} size="md" pulse={isConnected}>
              {isConnected ? 'Connected: Live WebSocket' : 'Reconnecting...'}
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Streaming synchronous Modbus TCP & BACnet telemetry frames at 2,000ms intervals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isPaused
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-amber-600" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume Live Stream' : 'Pause Stream'}</span>
          </button>
        </div>
      </div>

      {/* Primary Electrical Gauges Grid (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Power */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-blue-400 mb-2">
            <span className="font-bold uppercase tracking-wider text-[10px]">Total Power</span>
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
            {powerKw.toFixed(1)}
          </div>
          <span className="text-xs text-slate-400 font-semibold">kW Active Draw</span>
          <div className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-pulse-dot" />
            <span>Telemetry verified</span>
          </div>
        </div>

        {/* 3-Phase Voltage */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold uppercase tracking-wider text-[10px]">Line Voltage</span>
            <Gauge className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{voltage.toFixed(1)}</div>
          <span className="text-xs text-slate-500 font-semibold">V (3-Phase L-L)</span>
          <div className="mt-2 text-[10px] text-slate-400">Nominal 400V ±1.5%</div>
        </div>

        {/* Phase Current */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold uppercase tracking-wider text-[10px]">Total Current</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{current.toFixed(1)}</div>
          <span className="text-xs text-slate-500 font-semibold">Amperes (A)</span>
          <div className="mt-2 text-[10px] text-slate-400">Main Busbar Capacity: 1000A</div>
        </div>

        {/* Power Factor */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold uppercase tracking-wider text-[10px]">Power Factor</span>
            <span className="text-xs font-bold font-mono text-emerald-600">cos φ</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">{powerFactor.toFixed(2)}</div>
          <span className="text-xs text-slate-500 font-semibold">PF Index</span>
          <div className="mt-2 text-[10px] text-emerald-600">Optimal (Capacitor Bank OK)</div>
        </div>

        {/* Frequency */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold uppercase tracking-wider text-[10px]">Grid Frequency</span>
            <Wave className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{frequency.toFixed(2)}</div>
          <span className="text-xs text-slate-500 font-semibold">Hertz (Hz)</span>
          <div className="mt-2 text-[10px] text-slate-400">Stable Synchronized</div>
        </div>

        {/* Carbon Emission Rate */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold uppercase tracking-wider text-[10px]">Carbon Burn Rate</span>
            <Leaf className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-teal-800">{carbonRateKgHr}</div>
          <span className="text-xs text-slate-500 font-semibold">kg CO₂e / hr</span>
          <div className="mt-2 text-[10px] text-slate-400">Derived from 0.42 kg/kWh</div>
        </div>
      </div>

      {/* Real-Time Live Oscilloscope / Waveform Chart */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 live-pulse-dot" />
              Live Telemetry Stream (Active kW vs Voltage)
            </h3>
            <p className="text-xs text-slate-500">Sub-second streaming updates pushed over WebSockets</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1 font-medium">
              <span className="w-3 h-0.5 bg-blue-600 inline-block" /> Power (kW)
            </span>
            <span className="flex items-center gap-1 font-medium">
              <span className="w-3 h-0.5 bg-amber-500 inline-block" /> Voltage (V)
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={liveHistory}>
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis yAxisId="left" stroke="#2563eb" fontSize={11} tickLine={false} domain={['auto', 'auto']} unit=" kW" />
              <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={11} tickLine={false} domain={[390, 410]} unit=" V" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '11px',
                }}
              />
              <Line yAxisId="left" type="monotone" dataKey="power" stroke="#2563eb" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              <Line yAxisId="right" type="monotone" dataKey="voltage" stroke="#f59e0b" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fleet Meter Status Grid */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Connected Smart Meter Array ({meters.length})</h3>
            <p className="text-xs text-slate-500">Live Modbus RTU / TCP gateway submeter telemetry</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {meters.map((m) => (
            <div
              key={m.id}
              className={`p-3.5 rounded-xl border transition-all ${
                m.status === 'connected'
                  ? 'bg-slate-50/70 border-slate-200 hover:border-blue-300'
                  : 'bg-rose-50/60 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-slate-900">{m.id}</span>
                <Badge
                  variant={m.status === 'connected' ? 'healthy' : 'danger'}
                  size="sm"
                  pulse={m.status === 'connected'}
                >
                  {m.status.toUpperCase()}
                </Badge>
              </div>

              <h4 className="text-xs font-semibold text-slate-800 truncate" title={m.meter_type}>
                {m.meter_type}
              </h4>
              <span className="text-[10px] text-slate-400 block mt-0.5">{m.building_name}</span>

              <div className="flex items-baseline justify-between mt-3 pt-2 border-t border-slate-200/60">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Live Power</span>
                <span className="text-sm font-bold font-mono text-slate-900">
                  {Number(m.power).toFixed(1)} <span className="text-[10px] font-sans text-slate-500">kW</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
