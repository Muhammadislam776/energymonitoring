import React, { useState } from 'react';
import { Room } from '../../types';
import { Zap, Thermometer, Users, AlertTriangle, Eye, Activity } from 'lucide-react';
import { Badge } from '../common/Badge';

interface FloorPlanViewerProps {
  rooms: Room[];
  selectedFloorName: string;
  onSelectRoom: (roomId: string) => void;
  selectedRoomId: string | null;
}

export const FloorPlanViewer: React.FC<FloorPlanViewerProps> = ({
  rooms,
  selectedFloorName,
  onSelectRoom,
  selectedRoomId,
}) => {
  const [heatmapMode, setHeatmapMode] = useState<'power' | 'temp' | 'occupancy'>('power');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
      {/* Floor Plan Header & Heatmap mode controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
            Architectural Schematic Plan
          </span>
          <h3 className="text-base font-bold text-slate-900">{selectedFloorName}</h3>
        </div>

        {/* Heatmap overlay toggles */}
        <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setHeatmapMode('power')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              heatmapMode === 'power'
                ? 'bg-white text-blue-600 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Power Density
          </button>
          <button
            onClick={() => setHeatmapMode('temp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              heatmapMode === 'temp'
                ? 'bg-white text-amber-600 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" /> Thermal Heatmap
          </button>
          <button
            onClick={() => setHeatmapMode('occupancy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              heatmapMode === 'occupancy'
                ? 'bg-white text-indigo-600 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Occupancy Load
          </button>
        </div>
      </div>

      {/* Interactive 2D Blueprint Floor Plan Layout */}
      <div className="p-6 bg-slate-900/5 relative min-h-[500px]">
        {/* Exterior Blueprint Wall outline */}
        <div className="border-4 border-slate-700/80 rounded-2xl bg-white/90 p-4 shadow-inner">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {rooms.map((room) => {
              const isSelected = selectedRoomId === room.id;
              const hasAlert = (room.active_alerts_count || 0) > 0;
              const currentKw = room.current_power_kw || 12.4;
              const isHigh = currentKw > (room.energy_target || 30.0);

              // Background tint based on active heatmap mode
              let heatBg = 'bg-white';
              let heatBorder = isSelected ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200';

              if (heatmapMode === 'power') {
                heatBg = isHigh ? 'bg-amber-50/70 border-amber-300' : 'bg-blue-50/30';
              } else if (heatmapMode === 'temp') {
                heatBg = room.temperature > 23.0 ? 'bg-orange-50/70 border-orange-300' : 'bg-emerald-50/30';
              } else if (heatmapMode === 'occupancy') {
                const ratio = room.current_occupancy / (room.occupancy_capacity || 1);
                heatBg = ratio > 0.8 ? 'bg-purple-50/70 border-purple-300' : 'bg-slate-50/50';
              }

              return (
                <div
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={`relative p-4 rounded-xl border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-card-hover group ${heatBg} ${heatBorder}`}
                >
                  {/* Room Number & Status Header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-blue-600">
                      {room.room_number}
                    </span>
                    <Badge
                      variant={isHigh ? 'warning' : 'healthy'}
                      size="sm"
                      pulse={isHigh}
                    >
                      {isHigh ? '⚠ High consumption' : 'Normal'}
                    </Badge>
                  </div>

                  {/* Room Name & Type */}
                  <div className="mb-3">
                    <h4 className="text-xs font-semibold text-slate-800 truncate" title={room.name}>
                      {room.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 block">{room.type} • {room.area} m²</span>
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 text-center">
                    <div className="p-1 rounded bg-slate-50">
                      <span className="text-[9px] text-slate-400 block font-medium">Power</span>
                      <span className="text-xs font-bold font-mono text-slate-800">
                        {currentKw.toFixed(1)} <span className="text-[9px] font-sans text-slate-500">kW</span>
                      </span>
                    </div>

                    <div className="p-1 rounded bg-slate-50">
                      <span className="text-[9px] text-slate-400 block font-medium">Temp</span>
                      <span className="text-xs font-bold font-mono text-slate-800">
                        {room.temperature}°C
                      </span>
                    </div>

                    <div className="p-1 rounded bg-slate-50">
                      <span className="text-[9px] text-slate-400 block font-medium">Occupancy</span>
                      <span className="text-xs font-bold font-mono text-slate-800">
                        {room.current_occupancy}
                      </span>
                    </div>
                  </div>

                  {/* Click to open badge indicator */}
                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                    <span>Inspect Zone</span>
                    <Eye className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
