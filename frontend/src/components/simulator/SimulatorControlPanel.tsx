import React, { useState } from 'react';
import { Sliders, Zap, WifiOff, RotateCcw, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

export const SimulatorControlPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleSpike = async () => {
    setLoading(true);
    try {
      const res = await api.triggerSpike('eq-003', 52.4);
      setLastAction(`Spike of 52.4 kW injected into HVAC-03! Anomaly & Alert fired.`);
    } catch (err: any) {
      setLastAction(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMeter = async () => {
    setLoading(true);
    try {
      const res = await api.toggleMeterDisconnect('meter-07');
      setLastAction(`Meter 07 state changed to ${res.status}. Alert generated.`);
    } catch (err: any) {
      setLastAction(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await api.resetSimulator();
      setLastAction('Demo baseline reseeded successfully.');
    } catch (err: any) {
      setLastAction(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-30">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-900/90 hover:bg-slate-900 text-slate-200 rounded-full border border-slate-700 shadow-xl backdrop-blur-md text-xs font-semibold hover:scale-105 transition-all"
        >
          <Sliders className="w-3.5 h-3.5 text-blue-400" />
          <span>Demo Controls</span>
        </button>
      ) : (
        <div className="w-80 bg-slate-900 text-slate-200 rounded-2xl border border-slate-700 shadow-2xl p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-white">Live Simulator Controls</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white text-xs font-bold p-1"
            >
              ✕
            </button>
          </div>

          <p className="text-[11px] text-slate-400 my-2">
            Simulate live IoT events to verify instant WebSocket UI reactivity:
          </p>

          <div className="space-y-2 mt-3">
            <button
              onClick={handleSpike}
              disabled={loading}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800 hover:bg-amber-500/20 hover:border-amber-500/40 border border-slate-700 text-xs font-medium text-amber-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Inject 52.4 kW Surge (HVAC-03)</span>
              </div>
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            </button>

            <button
              onClick={handleToggleMeter}
              disabled={loading}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:border-rose-500/40 border border-slate-700 text-xs font-medium text-rose-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-rose-400" />
                <span>Toggle Submeter 07 Disconnect</span>
              </div>
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            </button>

            <button
              onClick={handleReset}
              disabled={loading}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800 hover:bg-blue-500/20 hover:border-blue-500/40 border border-slate-700 text-xs font-medium text-blue-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-blue-400" />
                <span>Reset Demo Baseline State</span>
              </div>
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            </button>
          </div>

          {lastAction && (
            <div className="mt-3 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] text-emerald-400 flex items-start gap-1.5">
              <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>{lastAction}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
