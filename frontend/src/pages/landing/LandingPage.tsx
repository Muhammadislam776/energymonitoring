import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Box,
  Layers,
  Cpu,
  Gauge,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Activity,
  AlertTriangle,
  Building2,
  DollarSign,
  Leaf,
  Crown,
  Wrench,
  UserCheck,
  Radio,
  Eye,
  Lock,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const LandingPage: React.FC = () => {
  const [activeRoleTab, setActiveRoleTab] = useState<'super_admin' | 'facility_manager' | 'energy_manager' | 'tenant'>('super_admin');

  const ROLE_DASHBOARDS = {
    super_admin: {
      roleTitle: 'Super Admin Control Center',
      tagline: 'Enterprise Global Governance & Multi-Tenant Boundaries',
      badge: 'Root Authority',
      badgeVariant: 'purple' as const,
      icon: Crown,
      image: '/assets/super_admin_hub.jpg',
      description:
        'Manage global multi-tenant boundaries, organization hierarchies, RBAC user provisioning, IoT streaming gateways, and view immutable security audit trails.',
      features: [
        'Multi-tenant database boundary isolation',
        'User account provisioning & role assignment',
        'Supabase PostgreSQL cloud & WebSocket gateway health',
        'Immutable event audit trail with IP address tracking',
      ],
      link: '/signup',
      btnText: 'Deploy Super Admin Portal',
    },
    facility_manager: {
      roleTitle: 'Facility Operations Center',
      tagline: 'Mechanical Plant Operations & Urgent Alarm Dispatch',
      badge: 'Operational Desk',
      badgeVariant: 'healthy' as const,
      icon: Wrench,
      image: '/assets/facility_ops_center.jpg',
      description:
        'Continuous fleet health monitoring across 120+ mechanical assets, chiller runtimes, interactive architectural floor plans, and technician maintenance work orders.',
      features: [
        '120+ asset fleet telemetry & runtime logging',
        'Urgent fault alarm triage & 1-click resolution',
        'Interactive 3D architectural floor plans',
        'Preventive Maintenance (PM) field dispatch tickets',
      ],
      link: '/signup',
      btnText: 'Access Facility Operations Desk',
    },
    energy_manager: {
      roleTitle: 'Energy Intelligence Center',
      tagline: 'Continuous Substation Load Profiling & ML Curtailment',
      badge: 'Analytics & AI',
      badgeVariant: 'blue' as const,
      icon: TrendingUp,
      image: '/assets/energy_analytics_center.jpg',
      description:
        'Substation electrical load curves (kW), Sankey power balance matrices, AI anomaly evidence dossiers, 48-hour forecasting, and Automated Demand Response simulation.',
      features: [
        'Real-time Sankey power balance (Grid + Solar PV)',
        'Continuous 24-submeter demand profiling',
        'AI anomaly dossiers with verified variance curves',
        'Automated Demand Response & peak load shaving simulator',
      ],
      link: '/signup',
      btnText: 'Launch Energy Intelligence Desk',
    },
    tenant: {
      roleTitle: 'Private Tenant Suite Portal',
      tagline: 'Strictly Isolated Sub-Meters & Indoor Thermal Comfort',
      badge: 'Private Suite',
      badgeVariant: 'warning' as const,
      icon: UserCheck,
      image: '/assets/tenant_suite_portal.jpg',
      description:
        'Exclusive space monitoring strictly restricted to tenant micro-zones, real-time sub-meter consumption, monthly utility cost estimates, and thermostat setback requests.',
      features: [
        'Strict tenant boundary protection (Privacy Shield)',
        'In-suite microclimate: Temp, Humidity, CO2 & Headcount',
        'Private sub-meter consumption & billing statements',
        'Thermostat slider & direct facility dispatch request',
      ],
      link: '/signup',
      btnText: 'Enter Tenant Comfort Portal',
    },
  };

  const currentDashboard = ROLE_DASHBOARDS[activeRoleTab];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="EnergyTwin" className="w-9 h-9 rounded-xl shadow-xs" />
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Energy<span className="text-blue-600">Twin</span>
              </span>
              <span className="hidden sm:block text-[11px] text-slate-400 font-medium -mt-1">
                Enterprise Digital Twin Platform
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#digital-twin" className="hover:text-blue-600 transition-colors">3D Digital Twin</a>
            <a href="#role-dashboards" className="hover:text-blue-600 transition-colors">Dedicated Role Panels</a>
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">Architecture</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl shadow-sm transition-all shadow-blue-500/20"
            >
              Sign Up & Select Role
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-14 pb-20 overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-100/70 text-blue-700 border border-blue-200 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 live-pulse-dot" />
            <span>Next-Generation Spatial Energy Management Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-950 max-w-4xl mx-auto leading-[1.1]">
            Turn Your Building Into a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Smart Energy Twin
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mt-5 leading-relaxed">
            Monitor every sub-meter, micro-zone, floor stack, and mechanical asset in real time. Detect anomalies, forecast loads, and execute automated demand response across 4 purpose-built role panels.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link
              to="/signup"
              className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-102"
            >
              <span>Get Started & Choose Role</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 shadow-sm transition-colors"
            >
              Sign In to Existing Account
            </Link>
          </div>

          {/* 3D Digital Twin Visual Preview Container */}
          <div id="digital-twin" className="mt-12 relative max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-950 group">
            <img
              src="/assets/digital_twin_building.jpg"
              alt="EnergyTwin 3D Digital Twin Building"
              className="w-full h-auto object-cover max-h-[580px] transition-transform duration-700 group-hover:scale-101"
            />

            {/* Overlaid Live Telemetry HUD Badges */}
            <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-none">
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-2 shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 live-pulse-dot" />
                <span>Live Power: <strong>428.6 kW</strong></span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Rooftop Solar: <strong>64.2 kW</strong></span>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-2 pointer-events-none">
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-slate-300 text-xs shadow-lg flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>6 Floors Zoned • 24 Submeters • 120 Assets</span>
              </div>
            </div>
          </div>

          {/* Animated Flow Steps */}
          <div className="mt-12 p-6 max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Real-Time Digital Energy Flow Telemetry</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs">
              {[
                { title: '1. Building', sub: 'EnergyTwin Tower', icon: Building2 },
                { title: '2. Floors', sub: '6 Zoned Levels', icon: Layers },
                { title: '3. Rooms', sub: '48 Micro-Zones', icon: Box },
                { title: '4. Equipment', sub: '120 HVAC & Chillers', icon: Cpu },
                { title: '5. Meters', sub: '24 IoT Submeters', icon: Gauge },
                { title: '6. Analytics', sub: 'Evidence AI Copilot', icon: TrendingUp },
              ].map((step, idx) => (
                <div key={idx} className="relative p-3 rounded-xl bg-slate-50 border border-slate-200/80 group hover:border-blue-300 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <step.icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-900">{step.title}</h4>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{step.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Dedicated 4 Role Dashboards Showcase Section */}
      <section id="role-dashboards" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Zero Generic Dashboards
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mt-2">
              4 Distinct Dashboards Built for Every Role
            </h2>
            <p className="text-sm text-slate-400 mt-3">
              Every persona logs into a dedicated, purpose-built dashboard with specialized data, distinct controls, and strict permission boundaries.
            </p>
          </div>

          {/* Interactive Role Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {[
              { id: 'super_admin' as const, label: 'Super Admin', icon: Crown, color: 'text-purple-400' },
              { id: 'facility_manager' as const, label: 'Facility Manager', icon: Wrench, color: 'text-emerald-400' },
              { id: 'energy_manager' as const, label: 'Energy Manager', icon: TrendingUp, color: 'text-blue-400' },
              { id: 'tenant' as const, label: 'Tenant Occupant', icon: UserCheck, color: 'text-amber-400' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeRoleTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveRoleTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-102'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Role Dashboard Showcase Card */}
          <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-0 items-center">
            {/* Left 5 Cols: Description & Features */}
            <div className="lg:col-span-5 p-8 sm:p-10 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={currentDashboard.badgeVariant} size="sm">
                    {currentDashboard.badge}
                  </Badge>
                  <span className="text-xs font-mono text-slate-400">Strict RBAC Scope</span>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {currentDashboard.roleTitle}
                </h3>
                <p className="text-xs font-semibold text-blue-400 mt-1">
                  {currentDashboard.tagline}
                </p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {currentDashboard.description}
              </p>

              <div className="space-y-2.5 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Exclusive Panel Capabilities:
                </span>
                {currentDashboard.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link
                  to={currentDashboard.link}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  <span>{currentDashboard.btnText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right 7 Cols: High-Resolution Dashboard Mockup */}
            <div className="lg:col-span-7 bg-slate-900 h-full min-h-[380px] relative overflow-hidden group">
              <img
                src={currentDashboard.image}
                alt={currentDashboard.roleTitle}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between text-xs text-slate-300 backdrop-blur-md bg-slate-900/70 p-3 rounded-xl border border-slate-700/60">
                <span className="font-bold flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-400" /> UI Mockup: {currentDashboard.roleTitle}
                </span>
                <span className="text-[10px] font-mono text-slate-400">Database Isolated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section (8 Cards) */}
      <section id="features" className="py-20 bg-slate-50/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Enterprise Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-2">
              Engineered for Modern Building Operations
            </h2>
            <p className="text-sm text-slate-500 mt-3">
              Comprehensive telemetry, real-time spatial digital twinning, and machine-learning intelligence unified in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Real-Time Energy Monitoring', desc: 'Sub-second WebSocket telemetry with active power, voltage harmonics, current, and power factor curves.', icon: Activity },
              { title: 'Digital Twin Visualization', desc: 'Interactive isometric and 2D spatial building representation with exploded floor layers and asset hotspots.', icon: Box },
              { title: 'AI Anomaly Detection', desc: 'Real-time statistical anomaly flags with exact variance percentages and confidence indices.', icon: AlertTriangle },
              { title: 'Consumption Forecasting', desc: 'Hybrid LSTM predictive models for 24h, 7d, and 30d future demand with confidence bounds.', icon: TrendingUp },
              { title: 'AI Efficiency Recommendations', desc: 'Actionable savings backed by verified operational evidence and monthly ROI estimates.', icon: Sparkles },
              { title: 'Smart Alerts & Dispatch', desc: 'Instant multi-channel alerts when equipment drifts or utility demand penalties are threatened.', icon: ShieldCheck },
              { title: 'Multi-Tenant Isolation', desc: 'Database-enforced isolation ensuring tenants never access another organization’s data or spaces.', icon: Building2 },
              { title: 'Reports & Data Exports', desc: 'One-click executive PDF audit reports and raw telemetry exports in CSV and XLSX.', icon: BarChart3 },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card hover:shadow-card-hover transition-all group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-indigo-950 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready to Digitize Your Facilities?
          </h2>
          <p className="text-sm text-blue-200 max-w-xl mx-auto">
            Create your account today, choose your operational role, and begin monitoring with real-time digital twin intelligence.
          </p>
          <div className="pt-2">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-xs rounded-2xl shadow-xl transition-all"
            >
              <span>Sign Up & Select Role</span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
