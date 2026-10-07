import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { api } from '../../services/api';
import { Floor, Room } from '../../types';
import { IsometricBuilding } from '../../components/digitaltwin/IsometricBuilding';
import { RoomDetailDrawer } from '../../components/digitaltwin/RoomDetailDrawer';
import { Badge } from '../../components/common/Badge';
import { Box, Layers, Cpu, Zap, Filter, Info, ShieldCheck, Thermometer } from 'lucide-react';

export const DigitalTwinPage: React.FC = () => {
  const { selectedBuildingId, selectedBuilding, floors, selectedFloorId, setSelectedFloorId } = useTenant();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [systemFilter, setSystemFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBuildingRooms() {
      setLoading(true);
      try {
        const rList = await api.getRooms({ buildingId: selectedBuildingId });
        setRooms(rList);
        if (rList.length > 0 && !selectedRoomId) {
          // Pre-select first interesting room (e.g. Room 303 Tier-3 Data Center or Room 101)
          const target = rList.find((r) => r.room_number === '303') || rList[0];
          setSelectedRoomId(target.id);
        }
      } catch (err) {
        console.error('Failed to load rooms for Digital Twin', err);
      } finally {
        setLoading(false);
      }
    }
    loadBuildingRooms();
  }, [selectedBuildingId]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
            Spatial Energy Digital Twin
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Interactive 3D Building Twin
            <Badge variant="blue" size="sm">
              Isometric Projection
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time physical asset mapping, floor layer isolation, and live thermal telemetry
          </p>
        </div>

        {/* System Sub-Filter tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: 'all', label: 'All Systems' },
            { id: 'hvac', label: 'HVAC & Chillers' },
            { id: 'servers', label: 'IT Data Centers' },
            { id: 'lighting', label: 'Lighting Arrays' },
            { id: 'solar', label: 'Solar PV' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSystemFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                systemFilter === tab.id
                  ? 'bg-white text-blue-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3D Digital Twin Viewer Canvas */}
      <div className="relative">
        <IsometricBuilding
          floors={floors}
          rooms={rooms}
          selectedFloorId={selectedFloorId}
          onSelectFloor={(fId) => setSelectedFloorId(fId)}
          onSelectRoom={(rId) => setSelectedRoomId(rId)}
          selectedRoomId={selectedRoomId}
          systemFilter={systemFilter}
        />
      </div>

      {/* Quick Floor Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex-shrink-0 mr-2 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> Floor Isolate:
        </span>
        {floors.map((floor) => {
          const isSelected = selectedFloorId === floor.id;
          return (
            <button
              key={floor.id}
              onClick={() => setSelectedFloorId(floor.id)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {floor.name}
            </button>
          );
        })}
      </div>

      {/* Slide-Over Room Detail Drawer */}
      <RoomDetailDrawer
        roomId={selectedRoomId}
        onClose={() => setSelectedRoomId(null)}
      />
    </div>
  );
};
