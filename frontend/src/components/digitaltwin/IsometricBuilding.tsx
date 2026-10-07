import React, { useState } from 'react';
import { Floor, Room } from '../../types';
import {
  Zap,
  AlertTriangle,
  Layers,
  Maximize2,
  Minimize2,
  Thermometer,
  Sun,
  Eye,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface IsometricBuildingProps {
  floors: Floor[];
  rooms: Room[];
  selectedFloorId: string | null;
  onSelectFloor: (floorId: string) => void;
  onSelectRoom: (roomId: string) => void;
  selectedRoomId: string | null;
  systemFilter: string; // 'all' | 'hvac' | 'lighting' | 'servers' | 'solar'
}

export const IsometricBuilding: React.FC<IsometricBuildingProps> = ({
  floors,
  rooms,
  selectedFloorId,
  onSelectFloor,
  onSelectRoom,
  selectedRoomId,
  systemFilter,
}) => {
  const [exploded, setExploded] = useState(true);
  const [renderMode, setRenderMode] = useState<'standard' | 'thermal' | 'power'>('standard');
  const [hoveredFloorId, setHoveredFloorId] = useState<string | null>(null);
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);

  // Floor order: Top to bottom (Roof/5 down to B1/0)
  const sortedFloors = [...floors].sort((a, b) => b.floor_number - a.floor_number);

  // Vertical spacing offsets
  const spacing = exploded ? 92 : 40;
  const baseY = 80;

  // Active hovered details for HUD tooltip
  const hoveredFloor = floors.find((f) => f.id === (hoveredFloorId || selectedFloorId));
  const hoveredRoom = rooms.find((r) => r.id === (hoveredRoomId || selectedRoomId));

  return (
    <div className="relative w-full h-[650px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col justify-between select-none">
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Explode / Collapse */}
          <button
            onClick={() => setExploded(!exploded)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 backdrop-blur-md transition-all shadow-md"
          >
            {exploded ? <Minimize2 className="w-3.5 h-3.5 text-blue-400" /> : <Maximize2 className="w-3.5 h-3.5 text-blue-400" />}
            <span>{exploded ? 'Collapse Stack' : 'Explode 3D Stack'}</span>
          </button>

          {/* 3D Mode Selector: Standard / Thermal Heatmap / Power Intensity */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 backdrop-blur-md text-xs font-medium">
            <button
              onClick={() => setRenderMode('standard')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                renderMode === 'standard' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              System Mesh
            </button>
            <button
              onClick={() => setRenderMode('thermal')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                renderMode === 'thermal' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Thermometer className="w-3 h-3" />
              <span>Thermal 3D</span>
            </button>
            <button
              onClick={() => setRenderMode('power')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                renderMode === 'power' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Power Density</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-[11px] text-slate-300 pointer-events-auto shadow-md">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Healthy
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Warning
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Critical
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 live-pulse-dot" /> Active Conduit
          </div>
        </div>
      </div>

      {/* Floating HUD Telemetry Card (Pinned Top-Right) */}
      <div className="absolute top-16 right-4 z-20 w-64 bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl rounded-xl p-3 text-xs text-slate-300 shadow-xl pointer-events-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block mb-1">
          Target Slab Telemetry
        </span>
        <div className="font-bold text-white text-sm mb-1">
          {hoveredRoom ? `${hoveredRoom.room_number} ${hoveredRoom.name}` : hoveredFloor?.name || 'EnergyTwin Tower'}
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
          <div>
            <span className="text-slate-500 block text-[10px]">Active Load</span>
            <span className="font-mono font-bold text-blue-400">
              {Number(hoveredRoom?.current_power_kw || hoveredFloor?.current_power_kw || 48.2).toFixed(1)} kW
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Zone Temp</span>
            <span className="font-mono font-bold text-amber-400">
              {hoveredRoom?.temperature || 22.4}°C
            </span>
          </div>
        </div>
      </div>

      {/* Main Isometric SVG Canvas */}
      <div className="w-full h-full flex items-center justify-center p-4">
        <svg
          viewBox="0 0 1000 700"
          className="w-full h-full max-h-[600px] drop-shadow-2xl transition-all duration-500 ease-out"
        >
          <defs>
            {/* Standard Slab Gradient */}
            <linearGradient id="floorGradNormal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
            </linearGradient>

            {/* Selected Slab Gradient */}
            <linearGradient id="floorGradSelected" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.95" />
            </linearGradient>

            {/* Thermal Heatmap Gradients */}
            <linearGradient id="thermalCool" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="thermalNormal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="thermalHot" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d97706" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0.95" />
            </linearGradient>

            {/* Power Density Gradient */}
            <linearGradient id="powerDense" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#3730a3" stopOpacity="0.95" />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid Foundation Ground Plate */}
          <g transform="translate(500, 640)">
            <polygon
              points="0,-160 380,0 0,160 -380,0"
              fill="#090d16"
              stroke="#1e293b"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          </g>

          {/* Central Vertical Energy Conduit / Backbone Riser with animated flow */}
          <g>
            <line
              x1="500"
              y1={baseY + 40}
              x2="500"
              y2={baseY + sortedFloors.length * spacing + 40}
              stroke="#38bdf8"
              strokeWidth="4"
              className="animate-energy-flow"
              opacity="0.85"
            />
            <line
              x1="495"
              y1={baseY + 40}
              x2="495"
              y2={baseY + sortedFloors.length * spacing + 40}
              stroke="#2563eb"
              strokeWidth="2"
              opacity="0.5"
            />
          </g>

          {/* Render Stacked Floors */}
          {sortedFloors.map((floor, index) => {
            const floorY = baseY + index * spacing;
            const isSelected = selectedFloorId === floor.id;
            const isHovered = hoveredFloorId === floor.id;

            // Rooms on this floor
            const floorRooms = rooms.filter((r) => r.floor_id === floor.id);
            const hasAlert = floorRooms.some((r) => (r.active_alerts_count || 0) > 0);
            const statusColor = isSelected ? '#38bdf8' : hasAlert ? '#f59e0b' : '#10b981';

            // Determine Fill style based on Render Mode
            let slabFill = isSelected ? 'url(#floorGradSelected)' : 'url(#floorGradNormal)';
            if (renderMode === 'thermal') {
              if (floor.floor_number === 0) slabFill = 'url(#thermalCool)';
              else if (floor.floor_number === 3) slabFill = 'url(#thermalHot)';
              else slabFill = 'url(#thermalNormal)';
            } else if (renderMode === 'power') {
              slabFill = floor.floor_number === 0 || floor.floor_number === 3 ? 'url(#powerDense)' : 'url(#floorGradNormal)';
            }

            return (
              <g
                key={floor.id}
                className="cursor-pointer transition-all duration-300"
                onClick={() => onSelectFloor(floor.id)}
                onMouseEnter={() => setHoveredFloorId(floor.id)}
                onMouseLeave={() => setHoveredFloorId(null)}
              >
                {/* 3D Slab Side Faces */}
                <polygon
                  points={`
                    ${500 - 320},${floorY}
                    ${500},${floorY + 120}
                    ${500},${floorY + 134}
                    ${500 - 320},${floorY + 14}
                  `}
                  fill="#0b1329"
                  stroke="#1e293b"
                  strokeWidth="1"
                />
                <polygon
                  points={`
                    ${500},${floorY + 120}
                    ${500 + 320},${floorY}
                    ${500 + 320},${floorY + 14}
                    ${500},${floorY + 134}
                  `}
                  fill="#0f172a"
                  stroke="#1e293b"
                  strokeWidth="1"
                />

                {/* Top Isometric Face */}
                <polygon
                  points={`
                    500,${floorY - 120}
                    ${500 + 320},${floorY}
                    500,${floorY + 120}
                    ${500 - 320},${floorY}
                  `}
                  fill={slabFill}
                  stroke={isSelected ? '#38bdf8' : isHovered ? '#60a5fa' : '#334155'}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                  filter={isSelected ? 'url(#neonGlow)' : undefined}
                />

                {/* Left Elevation Label Pill */}
                <g transform={`translate(${500 - 340}, ${floorY - 10})`}>
                  <rect
                    x="-125"
                    y="-14"
                    width="115"
                    height="28"
                    rx="6"
                    fill={isSelected ? '#1d4ed8' : '#0f172a'}
                    stroke={isSelected ? '#60a5fa' : '#334155'}
                    strokeWidth="1.5"
                  />
                  <text
                    x="-68"
                    y="4"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    Level {floor.floor_number === 0 ? 'B1' : floor.floor_number}
                  </text>
                  <circle cx="-114" cy="0" r="4" fill={statusColor} />
                </g>

                {/* Right Elevation kW Pill */}
                <g transform={`translate(${500 + 350}, ${floorY - 10})`}>
                  <rect
                    x="0"
                    y="-14"
                    width="105"
                    height="28"
                    rx="6"
                    fill="#0f172a"
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                  <text
                    x="52"
                    y="4"
                    fill="#38bdf8"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {Number(floor.current_power_kw || 48).toFixed(1)} kW
                  </text>
                </g>

                {/* Room Asset Nodes */}
                {(isSelected || isHovered || exploded) && (
                  <g>
                    {floorRooms.slice(0, 6).map((rm, rIdx) => {
                      const row = Math.floor(rIdx / 3);
                      const col = rIdx % 3;
                      const ox = (col - 1) * 80 - row * 60;
                      const oy = (col - 1) * 35 + row * 35;
                      const rx = 500 + ox;
                      const ry = floorY + oy;

                      const isRoomSel = selectedRoomId === rm.id;
                      const hasRoomAlert = (rm.active_alerts_count || 0) > 0;
                      const nodeColor = isRoomSel ? '#38bdf8' : hasRoomAlert ? '#f59e0b' : '#10b981';

                      return (
                        <g
                          key={rm.id}
                          className="cursor-pointer group"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectFloor(floor.id);
                            onSelectRoom(rm.id);
                          }}
                          onMouseEnter={() => setHoveredRoomId(rm.id)}
                          onMouseLeave={() => setHoveredRoomId(null)}
                        >
                          <polygon
                            points={`
                              ${rx},${ry - 18}
                              ${rx + 36},${ry}
                              ${rx},${ry + 18}
                              ${rx - 36},${ry}
                            `}
                            fill={isRoomSel ? '#1e40af' : '#1e293b'}
                            stroke={nodeColor}
                            strokeWidth={isRoomSel ? '2.5' : '1'}
                            opacity={isSelected ? '0.9' : '0.6'}
                          />
                          <circle cx={rx} cy={ry} r={isRoomSel ? '6' : '4'} fill={nodeColor} filter="url(#neonGlow)" />
                          {(isSelected || hoveredRoomId === rm.id) && (
                            <text
                              x={rx}
                              y={ry - 8}
                              fill="#f8fafc"
                              fontSize="9"
                              fontWeight="bold"
                              fontFamily="monospace"
                              textAnchor="middle"
                            >
                              {rm.room_number}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* Rooftop Solar PV Inverter Node & Solar Canopy */}
                {floor.floor_number === 5 && (
                  <g transform={`translate(500, ${floorY - 45})`}>
                    <polygon
                      points="0,-35 80,-5 0,25 -80,-5"
                      fill="#0284c7"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      opacity="0.85"
                    />
                    <text x="0" y="-12" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                      ROOFTOP SOLAR PV (64.2 kW)
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom Status bar */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <span>
            Selected Floor: <strong className="text-white">{hoveredFloor?.name || 'All Floors'}</strong>
          </span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-3">
          <span>Mode: <strong>{renderMode.toUpperCase()}</strong></span>
          <span>Tip: Click any floor or room node to isolate and inspect live IoT telemetry.</span>
        </div>
      </div>
    </div>
  );
};
