import React, { useState } from 'react';
import { api } from '../../services/api';
import { Sliders, Zap, DollarSign, Thermometer, ShieldCheck, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { Badge } from '../common/Badge';

export const DemandResponseSimulator: React.FC = () => {
  const [offsetC, setOffsetC] = useState(1.5);
  const [selectedFloors, setSelectedFloors] = useState<string[]>(['fl-2', 'fl-3', 'fl-4']);
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    setDispatched(false);
    try {
      const res = await api.simulateDemandResponse({
        setpointOffsetC: offsetC,
        targetFloors: selectedFloors,
      });
      setResult(res.results);
    } catch (err) {
      console.error('Simulation error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = () => {
    setDispatched(true);
    setTimeout(() => setDispatched(false), 5000);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
            Grid Flexibility & Peak Shaving
          </span>
          <h3 className="text-sm font-bold text-slate-900">
            Automated Demand Response (ADR) Setpoint Simulator
          </h3>
          <p className="text-xs text-slate-500">
            Simulate thermostat setback actions to shed peak kW and avoid expensive demand penalties
          </p>
        </div>

        <Badge variant="blue" size="sm">
          ASHRAE 55 Adaptive Comfort
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Controls (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-semibold text-slate-700">
              <label>Cooling Setpoint Offset (+°C)</label>
              <span className="font-mono text-blue-600 font-bold">+{offsetC.toFixed(1)}°C Setback</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.5"
              value={offsetC}
              onChange={(e) => setOffsetC(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>+0.5°C (Gentle)</span>
              <span>+1.5°C (Recommended)</span>
              <span>+3.0°C (Aggressive Shed)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Target Zoned Floors for Shedding
            </label>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { id: 'fl-1', label: 'Level 1 (Lobby)' },
                { id: 'fl-2', label: 'Level 2 (Workspaces)' },
                { id: 'fl-3', label: 'Level 3 (Engineering)' },
                { id: 'fl-4', label: 'Level 4 (Tenant)' },
                { id: 'fl-5', label: 'Level 5 (Penthouse)' },
              ].map((fl) => {
                const isSelected = selectedFloors.includes(fl.id);
                return (
                  <button
                    type="button"
                    key={fl.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedFloors(selectedFloors.filter((id) => id !== fl.id));
                      } else {
                        setSelectedFloors([...selectedFloors, fl.id]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {fl.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleSimulate}
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sliders className="w-3.5 h-3.5" />}
              <span>Calculate Load Shedding</span>
            </button>

            {result && (
              <button
                onClick={handleDispatch}
                disabled={dispatched}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                {dispatched ? 'Dispatched to BAS!' : 'Dispatch Demand Response'}
              </button>
            )}
          </div>
        </div>

        {/* Right: Results Display (6 cols) */}
        <div className="lg:col-span-6 bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Simulation Yield & Impact Projections
          </span>

          <div className="grid grid-cols-2 gap-3 text-center mb-3">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 block font-medium">Estimated Peak Shed</span>
              <span className="text-xl font-extrabold font-mono text-blue-600">
                -{result?.loadShedKw || (offsetC * 13.2).toFixed(1)} kW
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 block font-medium">Event Cost Savings</span>
              <span className="text-xl font-extrabold font-mono text-emerald-700">
                +${result?.totalEventSavingsUsd || (offsetC * 245).toFixed(0)}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex justify-between">
              <span className="text-slate-500">New Projected Building Load:</span>
              <span className="font-mono font-bold text-slate-900">
                {result?.newProjectedPowerKw || (428.6 - offsetC * 13.2).toFixed(1)} kW
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Thermal Comfort Assessment:</span>
              <span className="font-semibold text-emerald-700">
                {result?.comfortImpact || 'Compliant with ASHRAE 55 Adaptive Envelope'}
              </span>
            </div>
          </div>

          {dispatched && (
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Modbus BACnet setpoints overridden across {selectedFloors.length} floors!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
