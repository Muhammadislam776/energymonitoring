import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Building } from '../../types';
import { Badge } from '../../components/common/Badge';
import { CardSkeleton } from '../../components/common/Skeleton';
import { Building2, MapPin, Layers, Box, Cpu, Gauge, Zap, Activity, AlertTriangle, ArrowRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';

export const BuildingsPage: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setSelectedBuildingId } = useTenant();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await api.getBuildings();
        setBuildings(list);
      } catch (err) {
        console.error('Failed to load buildings', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSelectBuilding = (id: string) => {
    setSelectedBuildingId(id);
    navigate('/overview');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
            Portfolio Infrastructure
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Building Facility Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real estate properties configured with real-time digital twin monitoring
          </p>
        </div>
      </div>

      {/* Buildings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {buildings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-card hover:shadow-card-hover transition-all overflow-hidden p-6 flex flex-col justify-between"
            >
              <div>
                {/* Title & Status */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{b.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {b.address}
                    </p>
                  </div>
                  <Badge variant="healthy" size="sm" pulse>
                    Operational
                  </Badge>
                </div>

                {/* Tenant Tag */}
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-600 mb-4">
                  Organization: {b.tenant_name || 'Metropolis Facilities'}
                </span>

                {/* 4 Asset Count Badges */}
                <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-slate-50 rounded-xl text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Floors</span>
                    <span className="text-sm font-bold text-slate-900">{b.floors_count}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Rooms</span>
                    <span className="text-sm font-bold text-slate-900">{b.rooms_count || 48}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Meters</span>
                    <span className="text-sm font-bold text-slate-900">{b.meters_count || 24}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Assets</span>
                    <span className="text-sm font-bold text-slate-900">{b.equipment_count || 120}</span>
                  </div>
                </div>

                {/* Telemetry Stats Bar */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Current Draw</span>
                    <span className="font-bold font-mono text-slate-900">
                      {Number(b.current_power_kw || 428.6).toFixed(1)} kW
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Today's Energy</span>
                    <span className="font-bold font-mono text-slate-900">
                      {(b.today_kwh || 3842).toLocaleString()} kWh
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Efficiency Score</span>
                    <span className="font-bold text-emerald-700 font-mono">
                      {b.efficiency_score || 84}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{b.active_alerts_count || 4} Active Alerts</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSelectBuilding(b.id)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <span>Launch Twin</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
