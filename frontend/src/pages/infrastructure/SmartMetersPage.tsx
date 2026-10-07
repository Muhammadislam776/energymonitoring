import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { api } from '../../services/api';
import { Meter } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Gauge, Search, Wifi, WifiOff, Activity, Zap, CheckCircle2, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export const SmartMetersPage: React.FC = () => {
  const { selectedBuildingId } = useTenant();

  const [meters, setMeters] = useState<Meter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeter, setSelectedMeter] = useState<(Meter & { recentReadings?: any[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadMeters = async () => {
    setLoading(true);
    try {
      const list = await api.getMeters({ buildingId: selectedBuildingId, search: searchTerm || undefined });
      setMeters(list);
    } catch (err) {
      console.error('Failed to load meters', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeters();
  }, [selectedBuildingId, searchTerm]);

  const handleOpenMeter = async (meter: Meter) => {
    try {
      const details = await api.getMeterDetails(meter.id);
      setSelectedMeter(details);
    } catch (err) {
      setSelectedMeter(meter);
    }
  };

  const handleToggleDisconnect = async (meterId: string) => {
    setActionLoading(true);
    try {
      await api.toggleMeterDisconnect(meterId);
      await loadMeters();
      if (selectedMeter && selectedMeter.id === meterId) {
        const details = await api.getMeterDetails(meterId);
        setSelectedMeter(details);
      }
    } catch (err) {
      console.error('Toggle error', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
            IoT Edge Sensors
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Smart Meter Telemetry Fleet
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Main incomer feeders, submeter busways, and branch circuit monitoring
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search meter by ID or type (e.g. meter-01, Chiller Feed)..."
            className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total Smart Meters: <strong>{meters.length}</strong>
        </div>
      </div>

      {/* Meters Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Meter ID</th>
                <th className="px-5 py-3.5">Feeder / Type</th>
                <th className="px-5 py-3.5">Location</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Power</th>
                <th className="px-5 py-3.5">Voltage</th>
                <th className="px-5 py-3.5">Current</th>
                <th className="px-5 py-3.5">Power Factor</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {meters.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => handleOpenMeter(m)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  <td className="px-5 py-3.5 font-bold font-mono text-slate-900 group-hover:text-blue-600">
                    {m.id}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-800">{m.meter_type}</td>
                  <td className="px-5 py-3.5 text-slate-500">{m.floor_name || 'Main Plant'}</td>
                  <td className="px-5 py-3.5">
                    <Badge
                      variant={m.status === 'connected' ? 'healthy' : 'danger'}
                      size="sm"
                      pulse={m.status === 'connected'}
                    >
                      {m.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                    {Number(m.power).toFixed(1)} kW
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">{m.voltage} V</td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">{m.current} A</td>
                  <td className="px-5 py-3.5 font-mono text-emerald-700 font-semibold">
                    {m.power_factor}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleDisconnect(m.id);
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                        m.status === 'connected'
                          ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                          : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {m.status === 'connected' ? 'Simulate Disconnect' : 'Reconnect'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Meter Details & Waveform Modal */}
      {selectedMeter && (
        <Modal
          isOpen={!!selectedMeter}
          onClose={() => setSelectedMeter(null)}
          title={`Smart Meter: ${selectedMeter.id}`}
          subtitle={`${selectedMeter.meter_type} • Status: ${selectedMeter.status.toUpperCase()}`}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            {/* Real-time telemetry cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-medium">Power</span>
                <span className="text-lg font-bold font-mono text-slate-900">
                  {Number(selectedMeter.power).toFixed(1)} kW
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-medium">Line Voltage</span>
                <span className="text-lg font-bold font-mono text-slate-900">{selectedMeter.voltage} V</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-medium">Phase Current</span>
                <span className="text-lg font-bold font-mono text-slate-900">{selectedMeter.current} A</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-medium">Power Factor</span>
                <span className="text-lg font-bold font-mono text-emerald-700">
                  {selectedMeter.power_factor}
                </span>
              </div>
            </div>

            {/* Historical Readings Chart for Meter */}
            {selectedMeter.recentReadings && selectedMeter.recentReadings.length > 0 && (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <h4 className="text-xs font-bold text-slate-800 mb-3">24-Hour Telemetry Profile</h4>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedMeter.recentReadings}>
                      <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={9} tickLine={false} />
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
                      <Line type="monotone" dataKey="power" stroke="#2563eb" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleToggleDisconnect(selectedMeter.id)}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  selectedMeter.status === 'connected'
                    ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                    : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                {selectedMeter.status === 'connected'
                  ? 'Simulate Telemetry Disconnect'
                  : 'Restore Meter Connection'}
              </button>

              <button
                onClick={() => setSelectedMeter(null)}
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
