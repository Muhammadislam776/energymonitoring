import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { api } from '../../services/api';
import { Room } from '../../types';
import { FloorPlanViewer } from '../../components/floorplan/FloorPlanViewer';
import { RoomDetailDrawer } from '../../components/digitaltwin/RoomDetailDrawer';
import { Layers, Building, Eye } from 'lucide-react';

export const FloorPlanPage: React.FC = () => {
  const { selectedBuildingId, floors, selectedFloorId, setSelectedFloorId } = useTenant();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load rooms for current selected floor
  useEffect(() => {
    async function loadFloorRooms() {
      if (!selectedFloorId) return;
      setLoading(true);
      try {
        const rList = await api.getRooms({ floorId: selectedFloorId });
        setRooms(rList);
      } catch (err) {
        console.error('Failed to load floor rooms', err);
      } finally {
        setLoading(false);
      }
    }
    loadFloorRooms();
  }, [selectedFloorId]);

  const currentFloor = floors.find((f) => f.id === selectedFloorId) || floors[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
            Spatial Floor Plan Visualizer
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Floor Blueprint & Heatmaps
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Architectural room layout with power density, temperature, and occupancy heatmaps
          </p>
        </div>

        {/* Floor selector tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-100 p-1 rounded-xl">
          {floors.map((fl) => (
            <button
              key={fl.id}
              onClick={() => setSelectedFloorId(fl.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                fl.id === selectedFloorId
                  ? 'bg-white text-blue-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Level {fl.floor_number === 0 ? 'B1' : fl.floor_number}
            </button>
          ))}
        </div>
      </div>

      {/* Main Floor Plan Blueprint */}
      <FloorPlanViewer
        rooms={rooms}
        selectedFloorName={currentFloor?.name || 'Selected Floor'}
        onSelectRoom={(rId) => setSelectedRoomId(rId)}
        selectedRoomId={selectedRoomId}
      />

      {/* Room detail drawer */}
      <RoomDetailDrawer
        roomId={selectedRoomId}
        onClose={() => setSelectedRoomId(null)}
      />
    </div>
  );
};
