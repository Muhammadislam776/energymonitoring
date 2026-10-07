import React from 'react';
import { Zap, Sun, Server, Wind, Lightbulb, ArrowRight, Car, Activity } from 'lucide-react';

interface EnergyFlowDiagramProps {
  gridKw?: number;
  solarKw?: number;
  totalKw?: number;
}

export const EnergyFlowDiagram: React.FC<EnergyFlowDiagramProps> = ({
  gridKw = 364.4,
  solarKw = 64.2,
  totalKw = 428.6,
}) => {
  const consumers = [
    { name: 'HVAC & Chiller Plant', kw: 184.2, pct: 43, icon: Wind, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { name: 'Data Center PDU Infrastructure', kw: 112.5, pct: 26, icon: Server, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { name: 'Elevator Banks & Motors', kw: 51.6, pct: 12, icon: Activity, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { name: 'Architectural & Task Lighting', kw: 48.3, pct: 11, icon: Lightbulb, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
    { name: 'EV Fleet Fast Chargers', kw: 32.0, pct: 8, icon: Car, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
            Real-Time Power Balance
          </span>
          <h3 className="text-sm font-bold text-slate-900">
            Interactive Electrical Energy Flow (Sankey Matrix)
          </h3>
          <p className="text-xs text-slate-500">Live multi-source generation and distribution routing</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 live-pulse-dot" />
            Synchronized Flow
          </span>
        </div>
      </div>

      {/* 3-Column Visual Flow Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Left Column: Generation & Inflow Sources (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Generation Inflows
          </span>

          {/* Grid Inflow */}
          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 relative group hover:border-blue-400 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Utility Grid Inflow</span>
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-lg font-bold font-mono text-blue-900 mt-1">
              {gridKw.toFixed(1)} <span className="text-xs font-sans text-blue-600">kW</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">Metropolis 33kV Substation</span>
          </div>

          {/* Rooftop Solar PV Inflow */}
          <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/40 relative group hover:border-sky-400 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Rooftop Solar PV</span>
              <Sun className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-lg font-bold font-mono text-sky-900 mt-1">
              {solarKw.toFixed(1)} <span className="text-xs font-sans text-sky-600">kW</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-emerald-700 font-semibold mt-0.5">
              <span>94% Self-Consumed</span>
              <span>-173 kg CO₂/d</span>
            </div>
          </div>
        </div>

        {/* Center Column: Central Main Switchboard (3 cols) */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
          {/* Subtle animated background grid */}
          <div className="text-center z-10 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
              Central Switchboard
            </span>
            <div className="text-3xl font-extrabold font-mono text-white">
              {totalKw.toFixed(1)}
            </div>
            <span className="text-xs text-slate-400 font-medium block">kW Total Busbar Load</span>
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-semibold border border-blue-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 live-pulse-dot" />
              Power Factor: 0.95
            </div>
          </div>
        </div>

        {/* Right Column: Active Consumption Categories (6 cols) */}
        <div className="lg:col-span-6 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Sub-System Distribution
          </span>

          {consumers.map((c, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${c.color}`}>
                  <c.icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 block">{c.name}</span>
                  <div className="w-28 bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${c.pct * 2}%` }} />
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="font-bold font-mono text-slate-900 block">{c.kw} kW</span>
                <span className="text-[10px] text-slate-400 font-medium">{c.pct}% of load</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
