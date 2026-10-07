import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { api } from '../../services/api';
import { Equipment } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Cpu, Search, Filter, Wrench, AlertTriangle, CheckCircle2, Zap, Clock, ShieldAlert } from 'lucide-react';

export const EquipmentPage: React.FC = () => {
  const { selectedBuildingId } = useTenant();

  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await api.getEquipment({
          buildingId: selectedBuildingId,
          type: typeFilter !== 'all' ? typeFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchTerm || undefined,
        });
        setEquipmentList(list);
      } catch (err) {
        console.error('Failed to load equipment', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedBuildingId, typeFilter, statusFilter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
            Asset Inventory & Health
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Equipment Fleet Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor mechanical, electrical, and thermal assets across EnergyTwin Tower
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search equipment by name or ID (e.g. HVAC-03)..."
            className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="all">All Equipment Types</option>
            <option value="HVAC">HVAC</option>
            <option value="Chiller">Chiller</option>
            <option value="Boiler">Boiler</option>
            <option value="Lighting">Lighting</option>
            <option value="Elevator">Elevator</option>
            <option value="Server">Server</option>
            <option value="Pump">Pump</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="online">Online</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
            <option value="maintenance">Maintenance</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Equipment Name</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Location</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Rated Power</th>
                <th className="px-5 py-3.5">Live Draw</th>
                <th className="px-5 py-3.5">Efficiency</th>
                <th className="px-5 py-3.5">Runtime</th>
                <th className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {equipmentList.map((eq) => (
                <tr
                  key={eq.id}
                  onClick={() => setSelectedEquipment(eq)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  <td className="px-5 py-3.5 font-bold text-slate-900 group-hover:text-blue-600">
                    {eq.name}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{eq.type}</td>
                  <td className="px-5 py-3.5 text-slate-500">
                    {eq.room_name} ({eq.floor_name})
                  </td>
                  <td className="px-5 py-3.5">
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
                      pulse={eq.status === 'online'}
                    >
                      {eq.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">{eq.rated_power} kW</td>
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                    {eq.current_power} kW
                  </td>
                  <td className="px-5 py-3.5 font-mono text-emerald-700 font-semibold">
                    {eq.efficiency}%
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-500">{eq.runtime_hours} hrs</td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="text-blue-600 hover:text-blue-800 font-semibold text-xs">
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Equipment Detail Modal */}
      {selectedEquipment && (
        <Modal
          isOpen={!!selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
          title={`Asset Detail: ${selectedEquipment.name}`}
          subtitle={`${selectedEquipment.type} • ${selectedEquipment.room_name}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-medium">Status</span>
                <Badge
                  variant={
                    selectedEquipment.status === 'online'
                      ? 'healthy'
                      : selectedEquipment.status === 'warning'
                      ? 'warning'
                      : 'danger'
                  }
                  size="sm"
                >
                  {selectedEquipment.status.toUpperCase()}
                </Badge>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-medium">Rated vs Draw</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedEquipment.current_power} / {selectedEquipment.rated_power} kW
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-medium">Efficiency Index</span>
                <span className="font-mono font-bold text-emerald-700">
                  {selectedEquipment.efficiency}% COP
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-medium">Total Runtime</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedEquipment.runtime_hours} h
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Connected Submeter:</span>
                <span className="font-mono font-semibold text-blue-700">
                  {selectedEquipment.connected_meter_id || 'meter-01'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Serviced:</span>
                <span className="text-slate-800">30 days ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Next Scheduled Maintenance:</span>
                <span className="text-slate-800">In 60 days</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedEquipment(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
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
