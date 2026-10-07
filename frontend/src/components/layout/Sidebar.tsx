import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Box,
  Radio,
  Building2,
  Layers,
  Cpu,
  Gauge,
  BarChart3,
  History,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Bot,
  Bell,
  FileText,
  Download,
  Users,
  Settings,
  ShieldCheck,
  Crown,
  Wrench,
  UserCheck,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: any;
  badge?: string;
  pulse?: boolean;
  badgeCount?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'facility_manager';

  let navSections: NavSection[] = [];

  if (role === 'tenant') {
    navSections = [
      {
        title: 'Tenant Suite',
        items: [
          { name: 'My Tenant Suite Portal', path: '/tenant-panel', icon: UserCheck, badge: 'Suite' },
          { name: 'Digital Twin 3D', path: '/digital-twin', icon: Box, badge: '3D' },
          { name: 'Allocated Rooms', path: '/floors-rooms', icon: Layers },
        ],
      },
      {
        title: 'Billing & Reports',
        items: [
          { name: 'Utility Reports', path: '/reports', icon: FileText },
          { name: 'Export Data', path: '/exports', icon: Download },
        ],
      },
    ];
  } else if (role === 'facility_manager') {
    navSections = [
      {
        title: 'Operations Desk',
        items: [
          { name: 'Facility Operations Panel', path: '/facility-panel', icon: Wrench, badge: 'Ops' },
          { name: 'Digital Twin 3D', path: '/digital-twin', icon: Box, badge: '3D' },
          { name: 'Architectural Floor Plans', path: '/floor-plan', icon: Layers },
          { name: 'Live Monitoring', path: '/live-monitoring', icon: Radio, pulse: true },
        ],
      },
      {
        title: 'Asset Infrastructure',
        items: [
          { name: 'Buildings Portfolio', path: '/buildings', icon: Building2 },
          { name: 'Floors & Rooms', path: '/floors-rooms', icon: Layers },
          { name: 'Equipment Fleet', path: '/equipment', icon: Cpu },
          { name: 'Smart Meters', path: '/meters', icon: Gauge },
        ],
      },
      {
        title: 'Maintenance & Alarms',
        items: [
          { name: 'Active Fault Alarms', path: '/alerts', icon: Bell, badgeCount: 7 },
          { name: 'Facility Reports', path: '/reports', icon: FileText },
          { name: 'Data Exports', path: '/exports', icon: Download },
        ],
      },
    ];
  } else if (role === 'energy_manager') {
    navSections = [
      {
        title: 'Energy Intelligence',
        items: [
          { name: 'Energy Analytics Panel', path: '/energy-panel', icon: TrendingUp, badge: 'AI' },
          { name: 'Live Incomer Telemetry', path: '/live-monitoring', icon: Radio, pulse: true },
          { name: 'Digital Twin 3D', path: '/digital-twin', icon: Box, badge: '3D' },
        ],
      },
      {
        title: 'Analytics & Models',
        items: [
          { name: 'Load Analytics', path: '/analytics', icon: BarChart3 },
          { name: 'Consumption History', path: '/history', icon: History },
          { name: 'AI Anomaly Dossiers', path: '/anomalies', icon: AlertTriangle, badge: 'AI' },
          { name: '48-Hour ML Forecast', path: '/forecast', icon: TrendingUp },
          { name: 'Efficiency Actions', path: '/recommendations', icon: Sparkles },
          { name: 'Energy Copilot AI', path: '/copilot', icon: Bot, badge: 'Copilot' },
        ],
      },
      {
        title: 'Governance & Audits',
        items: [
          { name: 'Alerts & Incidents', path: '/alerts', icon: Bell, badgeCount: 7 },
          { name: 'ESG & Energy Reports', path: '/reports', icon: FileText },
          { name: 'Data Exports', path: '/exports', icon: Download },
        ],
      },
    ];
  } else {
    // super_admin
    navSections = [
      {
        title: 'Enterprise Root',
        items: [
          { name: 'Admin Control Center', path: '/admin-panel', icon: Crown, badge: 'Root' },
          { name: 'Facility Operations', path: '/facility-panel', icon: Wrench },
          { name: 'Energy Intelligence', path: '/energy-panel', icon: TrendingUp },
          { name: 'Digital Twin 3D', path: '/digital-twin', icon: Box, badge: '3D' },
          { name: 'Live Monitoring', path: '/live-monitoring', icon: Radio, pulse: true },
        ],
      },
      {
        title: 'Infrastructure',
        items: [
          { name: 'Buildings', path: '/buildings', icon: Building2 },
          { name: 'Floors & Rooms', path: '/floors-rooms', icon: Layers },
          { name: 'Equipment', path: '/equipment', icon: Cpu },
          { name: 'Smart Meters', path: '/meters', icon: Gauge },
        ],
      },
      {
        title: 'Intelligence & AI',
        items: [
          { name: 'Analytics', path: '/analytics', icon: BarChart3 },
          { name: 'Consumption History', path: '/history', icon: History },
          { name: 'Anomalies', path: '/anomalies', icon: AlertTriangle, badge: 'AI' },
          { name: 'Forecast', path: '/forecast', icon: TrendingUp },
          { name: 'Recommendations', path: '/recommendations', icon: Sparkles },
          { name: 'Energy Copilot', path: '/copilot', icon: Bot, badge: 'Copilot' },
        ],
      },
      {
        title: 'Operations',
        items: [
          { name: 'Alerts', path: '/alerts', icon: Bell, badgeCount: 7 },
          { name: 'Reports', path: '/reports', icon: FileText },
          { name: 'Exports', path: '/exports', icon: Download },
        ],
      },
      {
        title: 'Administration',
        items: [
          { name: 'Users & Tenants', path: '/users-tenants', icon: Users },
          { name: 'Platform Settings', path: '/settings', icon: Settings },
          { name: 'Security Audit Logs', path: '/audit-logs', icon: ShieldCheck },
        ],
      },
    ];
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 bg-slate-950/40">
          <NavLink to="/overview" className="flex items-center gap-3 group">
            <img src="/logo.svg" alt="EnergyTwin Logo" className="w-8 h-8 rounded-lg group-hover:scale-105 transition-transform" />
            <div>
              <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                Energy<span className="text-blue-400">Twin</span>
              </span>
              <span className="text-[10px] text-slate-400 block -mt-1 font-medium">
                Enterprise SaaS
              </span>
            </div>
          </NavLink>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((sec) => (
            <div key={sec.title}>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5">
                {sec.title}
              </h4>
              <nav className="space-y-0.5">
                {sec.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5">
                          <item.icon
                            className={`w-4 h-4 transition-colors ${
                              isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                            }`}
                          />
                          <span>{item.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {item.pulse && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-pulse-dot" />
                          )}
                          {item.badge && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                isActive ? 'bg-blue-500 text-white' : 'bg-slate-800 text-blue-400 border border-blue-400/30'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                          {item.badgeCount && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                                isActive ? 'bg-white text-blue-600' : 'bg-rose-500 text-white'
                              }`}
                            >
                              {item.badgeCount}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer info & Demo Environment tag */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300">Environment</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-[10px] border border-blue-500/30">
              Demo Environment
            </span>
          </div>
          <span className="text-[10px] text-slate-400 truncate">
            {user?.organization_name || 'Metropolis Facilities'}
          </span>
        </div>
      </aside>
    </>
  );
};
