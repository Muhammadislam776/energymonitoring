import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { api } from '../../services/api';
import { Floor, Room } from '../../types';
import { Badge } from '../../components/common/Badge';
import { RoomDetailDrawer } from '../../components/digitaltwin/RoomDetailDrawer';
import { Layers, Box, DoorOpen, Users, Thermometer, Zap, Search, Filter } from 'lucide-react';

export const FloorsRoomsPage: React.FC = () => {
  const { selectedBuildingId, floors } = useTenant();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedFloorFilter, setSelectedFloorFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRooms() {
      setLoading(true);
      try {
        const list = await api.getRooms({
          buildingId: selectedBuildingId,
          floorId: selectedFloorFilter !== 'all' ? selectedFloorFilter : undefined,
          type: typeFilter !== 'all' ? typeFilter : undefined,
        });
        setRooms(list);
      } catch (err) {
        console.error('Failed to load rooms', err);
      } finally {
        setLoading(false);
      }
    }
    loadRooms();
  }, [selectedBuildingId, selectedFloorFilter, typeFilter]);

  const filteredRooms = rooms.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.room_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
            Spatial Hierarchy
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Floors & Rooms Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage floor zones, occupancy thresholds, thermal targets, and room asset allocations
          </p>
        </div>
      </div>

      {/* Floors Overview Carousel / Cards */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" /> Building Floors ({floors.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {floors.map((fl) => (
            <div
              key={fl.id}
              onClick={() => setSelectedFloorFilter(selectedFloorFilter === fl.id ? 'all' : fl.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedFloorFilter === fl.id
                  ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900">
                  Level {fl.floor_number === 0 ? 'B1' : fl.floor_number}
                </span>
                <span className="text-[10px] text-slate-400">{fl.area} m²</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate" title={fl.name}>
                {fl.name}
              </p>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Target</span>
                <span className="font-bold font-mono text-blue-600">{fl.energy_target} kW</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rooms Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search room number or name..."
            className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Room Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="all">All Room Types</option>
            <option value="Office">Office</option>
            <option value="Meeting Room">Meeting Room</option>
            <option value="Server Room">Server Room</option>
            <option value="Laboratory">Laboratory</option>
            <option value="Lobby">Lobby</option>
            <option value="Storage">Storage</option>
            <option value="Retail">Retail</option>
          </select>

          {/* Reset Filters */}
          {(selectedFloorFilter !== 'all' || typeFilter !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedFloorFilter('all');
                setTypeFilter('all');
                setSearchTerm('');
              }}
              className="text-xs text-blue-600 font-semibold px-2 hover:underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Room</th>
                <th className="px-5 py-3.5">Floor</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Area</th>
                <th className="px-5 py-3.5">Occupancy</th>
                <th className="px-5 py-3.5">Temp</th>
                <th className="px-5 py-3.5">Power</th>
                <th className="px-5 py-3.5">Target</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRooms.map((rm) => (
                <tr
                  key={rm.id}
                  onClick={() => setSelectedRoomId(rm.id)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  <td className="px-5 py-3.5 font-semibold text-slate-900 group-hover:text-blue-600">
                    <span className="font-mono text-slate-500 font-normal mr-1.5">{rm.room_number}</span>
                    {rm.name}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{rm.floor_name}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant="neutral" size="sm">
                      {rm.type}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{rm.area} m²</td>
                  <td className="px-5 py-3.5 text-slate-700">
                    {rm.current_occupancy} <span className="text-slate-400">/ {rm.occupancy_capacity}</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-700">{rm.temperature}°C</td>
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                    {Number(rm.current_power_kw || 12.4).toFixed(1)} kW
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-500">{rm.energy_target} kW</td>
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

      {/* Room Drawer */}
      <RoomDetailDrawer roomId={selectedRoomId} onClose={() => setSelectedRoomId(null)} />
    </div>
  );
};
