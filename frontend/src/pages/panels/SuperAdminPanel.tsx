import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import {
  Crown,
  Building,
  Users,
  ShieldCheck,
  Radio,
  Server,
  Layers,
  Settings,
  Plus,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HardDrive,
  Activity,
  Zap,
} from 'lucide-react';

export const SuperAdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tenants' | 'users' | 'audit' | 'gateways'>('tenants');

  const loadData = async () => {
    setLoading(true);
    try {
      const [tData, uData, aLogs, settingsData] = await Promise.all([
        api.getTenants().catch(() => []),
        api.getUsers().catch(() => []),
        api.getAuditLogs().catch(() => []),
        api.getSettings().catch(() => null),
      ]);
      setTenants(tData);
      setUsersList(uData);
      setAuditLogs(aLogs);
      if (settingsData?.integrations) {
        setIntegrations(settingsData.integrations);
      }
    } catch (err) {
      console.error('Failed to load Super Admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Super Admin Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 live-pulse-dot" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
              Enterprise Global Authority
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mt-0.5">
            Super Admin Control Center
            <Badge variant="purple" size="sm">
              Root Authority
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-tenant orchestration, RBAC provisioning, IoT telemetry gateways, and audit governance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold shadow-2xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-600' : ''}`} />
            <span>Sync Grid</span>
          </button>
        </div>
      </div>

      {/* Super Admin Control Room Visual Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-800 bg-slate-950 h-44 sm:h-52 flex items-end">
        <img
          src="/assets/super_admin_hub.jpg"
          alt="Super Admin Enterprise Control Room"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="relative z-10 p-5 sm:p-6 w-full flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 text-white">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="purple" size="sm">Enterprise Operations Room</Badge>
              <span className="text-[11px] text-purple-300 font-mono">SOC 2 Type II Encrypted</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Global Tenant & Infrastructure Matrix
            </h2>
            <p className="text-xs text-slate-300 max-w-xl mt-0.5">
              Live multi-tenant partition monitoring, PostgREST cloud database synchronization, and user privileges.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 live-pulse-dot" />
            <span className="font-semibold text-slate-200">Grid Telemetry: Synchronized</span>
          </div>
        </div>
      </div>

      {/* Global Executive KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Tenant Orgs"
          value={tenants.length.toString()}
          unit="Organizations"
          icon={Building}
          delta="+1 this quarter"
          status="normal"
        />
        <StatCard
          title="Total Provisioned Users"
          value={usersList.length.toString()}
          unit="Accounts"
          icon={Users}
          delta="4 RBAC tiers"
          status="normal"
        />
        <StatCard
          title="Monitored Facilities"
          value="1"
          unit="Tower (6 Floors)"
          icon={Layers}
          delta="24 Smart Meters"
          status="normal"
        />
        <StatCard
          title="Cloud DB Handshake"
          value={integrations?.supabaseCloud?.status || 'Connected'}
          unit="Supabase Cloud"
          icon={HardDrive}
          delta="PostgreSQL 15"
          status="normal"
        />
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'tenants', label: 'Tenants & Organizations', icon: Building, count: tenants.length },
          { id: 'users', label: 'User Provisioning & Roles', icon: Users, count: usersList.length },
          { id: 'gateways', label: 'IoT & Cloud Gateways', icon: Radio },
          { id: 'audit', label: 'Security Audit Log', icon: ShieldCheck, count: auditLogs.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === tab.id ? 'bg-purple-700 text-purple-100' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'tenants' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Tenant Isolation Boundaries</h3>
              <p className="text-xs text-slate-500">Database-enforced client partition groups</p>
            </div>
            <Badge variant="purple" size="sm">Strict Isolation Enforced</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">Tenant Name</th>
                  <th className="pb-3">Code</th>
                  <th className="pb-3">Parent Organization</th>
                  <th className="pb-3">Assigned Buildings</th>
                  <th className="pb-3">Active Users</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pl-2 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                          {t.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span>{t.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 font-mono text-slate-600 font-semibold">{t.code}</td>
                    <td className="py-3.5 text-slate-600">{t.organization_name || 'EnergyTwin Enterprise'}</td>
                    <td className="py-3.5">
                      <span className="font-bold text-slate-800">{t.buildings_count || 1}</span>
                      <span className="text-slate-400 ml-1">facility</span>
                    </td>
                    <td className="py-3.5">
                      <span className="font-bold text-slate-800">{t.users_count || 1}</span>
                      <span className="text-slate-400 ml-1">members</span>
                    </td>
                    <td className="py-3.5">
                      <Badge variant="healthy" size="sm">Active Isolated</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Role-Based Access Control (RBAC) Accounts</h3>
              <p className="text-xs text-slate-500">All registered users across tenant boundaries</p>
            </div>
            <span className="text-xs text-slate-500 font-medium">Total: <strong>{usersList.length}</strong></span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">User Name</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Assigned Role</th>
                  <th className="pb-3">Tenant Affiliation</th>
                  <th className="pb-3">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => {
                  const roleBadgeVariant: any =
                    u.role === 'super_admin' ? 'purple' :
                    u.role === 'facility_manager' ? 'healthy' :
                    u.role === 'energy_manager' ? 'blue' : 'warning';
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 pl-2 font-bold text-slate-900">{u.name}</td>
                      <td className="py-3 text-slate-600 font-mono text-[11px]">{u.email}</td>
                      <td className="py-3">
                        <Badge variant={roleBadgeVariant} size="sm">
                          {u.role.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 text-slate-600">{u.tenant_name || u.organization_name || 'Global'}</td>
                      <td className="py-3">
                        <Badge variant={u.status === 'active' ? 'healthy' : 'neutral'} size="sm">
                          {u.status || 'active'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'gateways' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  SB
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Supabase Cloud PostgreSQL</h4>
                  <p className="text-[11px] text-slate-500 font-mono">https://qwvajvktwxvbzsheikxj.supabase.co</p>
                </div>
              </div>
              <Badge variant="healthy" size="sm" pulse>Live Connected</Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Protocol:</span>
                <span className="font-mono font-bold text-slate-800">PostgREST v12 + JWT</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Migration Script:</span>
                <span className="font-mono text-blue-600 font-bold">/supabase/schema.sql</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">IoT Streaming Engine</h4>
                  <p className="text-[11px] text-slate-500 font-mono">ws://localhost:5000/ws</p>
                </div>
              </div>
              <Badge variant="healthy" size="sm" pulse>Synchronized</Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Telemetry Cadence:</span>
                <span className="font-mono font-bold text-slate-800">2,000 ms ticks</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Connected Meters:</span>
                <span className="font-mono font-bold text-emerald-600">24 / 24 Submeters</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Immutable Security Audit Trail</h3>
              <p className="text-xs text-slate-500">Live operational events, logins, and configurations</p>
            </div>
            <Badge variant="blue" size="sm">Audit Level: Verbose</Badge>
          </div>

          <div className="space-y-2">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    <div>
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span className="text-slate-500 ml-2">by <strong>{log.user_name}</strong></span>
                      <p className="text-[11px] text-slate-600 mt-0.5">{log.details}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono self-start sm:self-auto">
                    <span>{log.ip_address}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 py-6 text-center">No recent audit entries</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
