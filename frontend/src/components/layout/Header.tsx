import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import { useTenant } from '../../context/TenantContext';
import {
  Search,
  Bell,
  Building2,
  Layers,
  Calendar,
  LogOut,
  User as UserIcon,
  Shield,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  Menu,
  Zap,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onOpenSearch }) => {
  const { user, logout } = useAuth();
  const { isConnected, notifications, clearNotification, clearAllNotifications } = useWebSocket();
  const { buildings, selectedBuildingId, setSelectedBuildingId, floors, selectedFloorId, setSelectedFloorId } = useTenant();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [dateRange, setDateRange] = useState('Today');

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    facility_manager: 'Facility Manager',
    energy_manager: 'Energy Manager',
    tenant: 'Tenant User',
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      {/* Left side: Hamburger + Selectors */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Building Selector */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
          <Building2 className="w-3.5 h-3.5 text-blue-600" />
          <select
            value={selectedBuildingId}
            onChange={(e) => setSelectedBuildingId(e.target.value)}
            className="bg-transparent font-medium focus:outline-none cursor-pointer pr-1"
          >
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Floor Selector */}
        {floors.length > 0 && (
          <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedFloorId || ''}
              onChange={(e) => setSelectedFloorId(e.target.value || null)}
              className="bg-transparent font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="">All Floors</option>
              {floors.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date Range Selector */}
        <div className="hidden xl:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-transparent font-medium focus:outline-none cursor-pointer"
          >
            <option value="Today">Today (Real-time)</option>
            <option value="Yesterday">Yesterday</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="BillingMonth">This Billing Month</option>
          </select>
        </div>
      </div>

      {/* Right side: Search, Live Indicator, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-600 rounded-lg text-xs font-medium transition-colors border border-slate-200/60"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Search assets...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
            Ctrl K
          </kbd>
        </button>

        {/* Real-time Connection Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 live-pulse-dot' : 'bg-rose-500'}`} />
          <span className="hidden sm:inline">{isConnected ? '● Live' : 'Connecting'}</span>
        </div>

        {/* Notifications Center */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Telemetry Notifications</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 font-semibold rounded-full">
                    {notifications.length}
                  </span>
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No active alerts or notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-lg border text-xs flex gap-2.5 items-start justify-between ${
                        n.severity === 'critical'
                          ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                          : n.severity === 'warning'
                          ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                          : 'bg-blue-50/60 border-blue-200 text-blue-900'
                      }`}
                    >
                      <div className="flex gap-2 items-start">
                        {n.severity === 'critical' ? (
                          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Zap className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-semibold">{n.title}</p>
                          <p className="text-[11px] opacity-80 mt-0.5">{n.message}</p>
                          <span className="text-[10px] opacity-60 block mt-1">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => clearNotification(n.id)}
                        className="text-slate-400 hover:text-slate-700 text-[10px] font-bold p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Demo Switcher */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left text-xs">
              <span className="font-semibold text-slate-800 block truncate max-w-[120px]">
                {user?.name || 'User'}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {roleLabels[user?.role || 'facility_manager']}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-semibold text-slate-800">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="mt-1.5">
                  <Badge variant="blue" size="sm">
                    {roleLabels[user?.role || 'super_admin']}
                  </Badge>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
