import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import {
  Settings,
  Building,
  Zap,
  Bell,
  Radio,
  Shield,
  Save,
  CheckCircle2,
  DollarSign,
  Leaf,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'energy' | 'organization' | 'notifications' | 'integrations'>('energy');
  const [costPerKwh, setCostPerKwh] = useState(0.16);
  const [carbonFactor, setCarbonFactor] = useState(0.42);
  const [peakThreshold, setPeakThreshold] = useState(650.0);
  const [dailyTarget, setDailyTarget] = useState(4200.0);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [orgName, setOrgName] = useState('EnergyTwin Global Enterprise');
  const [savedMessage, setSavedMessage] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getSettings();
        if (res.settings) {
          setCostPerKwh(res.settings.cost_per_kwh || 0.16);
          setCarbonFactor(res.settings.carbon_factor || 0.42);
          setPeakThreshold(res.settings.peak_demand_threshold || 650.0);
          setDailyTarget(res.settings.daily_target_kwh || 4200.0);
          setEmailAlerts(!!res.settings.email_alerts);
          setInAppAlerts(!!res.settings.in_app_alerts);
        }
        if (res.organization) {
          setOrgName(res.organization.name);
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings({
        cost_per_kwh: costPerKwh,
        carbon_factor: carbonFactor,
        peak_demand_threshold: peakThreshold,
        daily_target_kwh: dailyTarget,
        email_alerts: emailAlerts,
        in_app_alerts: inAppAlerts,
      });
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (err) {
      console.error('Save error', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
            System Configuration
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Platform Settings & Integrations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure utility tariff baselines, carbon emission coefficients, and notification rules
          </p>
        </div>

        {savedMessage && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'energy', label: 'Tariffs & Energy Targets', icon: Zap },
          { id: 'organization', label: 'Organization Profile', icon: Building },
          { id: 'notifications', label: 'Alert Preferences', icon: Bell },
          { id: 'integrations', label: 'IoT & WebSocket Gateway', icon: Radio },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 max-w-3xl">
        <form onSubmit={handleSave} className="space-y-6">
          {activeTab === 'energy' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Energy Rates & Penalties</h3>
              <p className="text-xs text-slate-500 mb-4">
                Set billing parameters for cost projections and carbon auditing.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Blended Cost per kWh ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={costPerKwh}
                    onChange={(e) => setCostPerKwh(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Default: $0.16 / kWh</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Carbon Emission Factor (kg CO₂e / kWh)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={carbonFactor}
                    onChange={(e) => setCarbonFactor(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Regional grid intensity</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Peak Demand Surcharge Limit (kW)
                  </label>
                  <input
                    type="number"
                    value={peakThreshold}
                    onChange={(e) => setPeakThreshold(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Alarms trigger when exceeded</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Daily Building Target (kWh)
                  </label>
                  <input
                    type="number"
                    value={dailyTarget}
                    onChange={(e) => setDailyTarget(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Target ceiling budget</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'organization' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Organization Profile</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Headquarters Contact</label>
                <input
                  type="text"
                  defaultValue="facility-ops@metropolis.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Dispatch Preferences</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Email Notifications</span>
                    <span className="text-[11px] text-slate-500">Dispatch critical alarm summaries to engineers</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inAppAlerts}
                    onChange={(e) => setInAppAlerts(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Real-time WebSocket Toasts</span>
                    <span className="text-[11px] text-slate-500">Show instant navbar notifications when spikes are detected</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 mb-1">IoT Communications & Cloud Services</h3>
              
              {/* Supabase Cloud Integration Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50/60 to-blue-50/60 border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      SB
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Supabase Cloud Database & Auth</h4>
                      <p className="text-[11px] text-slate-500 font-mono">https://qwvajvktwxvbzsheikxj.supabase.co</p>
                    </div>
                  </div>
                  <Badge variant="healthy" size="sm" pulse>Active / Connected</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/80 p-2.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Project ID:</span>
                    <span className="font-mono font-bold text-slate-800">qwvajvktwxvbzsheikxj</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">REST Protocol:</span>
                    <span className="font-mono font-bold text-slate-800">PostgREST v12</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600">
                  Schema migration script ready in <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono">/supabase/schema.sql</code> for instant PostgreSQL cloud instantiation.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">WebSocket Live Engine</span>
                  <Badge variant="healthy" size="sm" pulse>Active (ws://localhost:5000/ws)</Badge>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Modbus TCP Gateway</span>
                  <Badge variant="healthy" size="sm">Online (Port 502)</Badge>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">BACnet/IP Gateway</span>
                  <Badge variant="healthy" size="sm">Online (Port 47808)</Badge>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
