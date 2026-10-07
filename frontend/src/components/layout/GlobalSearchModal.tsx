import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Building, Layers, DoorOpen, Cpu, Gauge, AlertTriangle, Lightbulb, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    equipment: any[];
    rooms: any[];
    meters: any[];
    alerts: any[];
    anomalies: any[];
  }>({
    equipment: [],
    rooms: [],
    meters: [],
    alerts: [],
    anomalies: [],
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ equipment: [], rooms: [], meters: [], alerts: [], anomalies: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [eqList, rList, mList, alList, anList] = await Promise.all([
          api.getEquipment({ search: query }),
          api.getRooms(),
          api.getMeters({ search: query }),
          api.getAlerts({ search: query }),
          api.getAnomalies()
        ]);

        const filteredRooms = rList.filter(r =>
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.room_number.toLowerCase().includes(query.toLowerCase())
        );

        const filteredAnomalies = anList.filter(a =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.explanation.toLowerCase().includes(query.toLowerCase())
        );

        setResults({
          equipment: eqList.slice(0, 4),
          rooms: filteredRooms.slice(0, 4),
          meters: mList.slice(0, 4),
          alerts: alList.slice(0, 4),
          anomalies: filteredAnomalies.slice(0, 4),
        });
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults =
    results.equipment.length +
    results.rooms.length +
    results.meters.length +
    results.alerts.length +
    results.anomalies.length;

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-start justify-center p-4 sm:pt-20">
        <div
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input Bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search buildings, equipment (e.g. HVAC-03), meters, rooms, alerts..."
              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 mr-1">
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded">
              ESC
            </kbd>
          </div>

          {/* Quick suggestions if empty */}
          {!query && (
            <div className="p-6 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] block mb-3">
                Suggested Searches
              </span>
              <div className="flex flex-wrap gap-2">
                {['HVAC-03', 'Chiller-01', 'Floor 3', 'Meter-01', 'Data Center', 'High Consumption', 'Peak Demand'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-200"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {query && (
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
              {loading && <div className="text-center py-6 text-xs text-slate-400">Searching platform telemetry...</div>}

              {!loading && totalResults === 0 && (
                <div className="text-center py-8 text-xs text-slate-500">
                  No matching telemetry, equipment, or assets found for "{query}".
                </div>
              )}

              {/* Equipment */}
              {results.equipment.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" /> Equipment ({results.equipment.length})
                  </h4>
                  <div className="space-y-1">
                    {results.equipment.map((eq) => (
                      <div
                        key={eq.id}
                        onClick={() => handleSelect('/equipment')}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                            {eq.type.substring(0, 2)}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600">
                              {eq.name} <span className="text-slate-400 font-normal">({eq.type})</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {eq.room_name} • Rated {eq.rated_power} kW • {eq.current_power} kW live
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Anomalies */}
              {results.anomalies.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-rose-500 px-2 mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> AI Anomalies ({results.anomalies.length})
                  </h4>
                  <div className="space-y-1">
                    {results.anomalies.map((an) => (
                      <div
                        key={an.id}
                        onClick={() => handleSelect('/anomalies')}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50/50 hover:bg-rose-50 cursor-pointer border border-rose-100 transition-colors group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-rose-900">{an.title}</div>
                          <div className="text-[11px] text-rose-600">
                            Measured: {an.measured_value} kW (Expected: {an.expected_value} kW) • {an.confidence}% confidence
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-rose-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rooms */}
              {results.rooms.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                    <DoorOpen className="w-3.5 h-3.5" /> Rooms & Zones ({results.rooms.length})
                  </h4>
                  <div className="space-y-1">
                    {results.rooms.map((rm) => (
                      <div
                        key={rm.id}
                        onClick={() => handleSelect('/floors-rooms')}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600">
                            {rm.room_number} — {rm.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {rm.type} • {rm.area} m² • {rm.current_power_kw || 0} kW
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Meters */}
              {results.meters.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5" /> Smart Meters ({results.meters.length})
                  </h4>
                  <div className="space-y-1">
                    {results.meters.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleSelect('/meters')}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600">
                            {m.id} — {m.meter_type}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Status: {m.status} • {m.power} kW • {m.voltage}V
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
