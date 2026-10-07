import React from 'react';
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
} from 'lucide-react';

export const LandingPage: React.FC = () => {
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
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#analytics-preview" className="hover:text-blue-600 transition-colors">Live Analytics</a>
            <a href="#digital-twin" className="hover:text-blue-600 transition-colors">Digital Twin 3D</a>
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
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100/70 text-blue-700 border border-blue-200 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 live-pulse-dot" />
            <span>Next-Generation Energy Management SaaS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 max-w-4xl mx-auto leading-[1.1]">
            Turn Your Building Into a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Smart Energy Twin
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto mt-6 leading-relaxed">
            Monitor every meter, room, floor, and piece of equipment in real time. Detect anomalies, forecast consumption, and make smarter energy decisions with evidence-based AI.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link
              to="/signup"
              className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-102"
            >
              <span>Sign Up & Select Role</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-xl border border-slate-200 shadow-sm transition-colors"
            >
              Sign In to Existing Account
            </Link>
          </div>

          {/* Animated Energy Flow Diagram: Building -> Floors -> Rooms -> Equipment -> Meters -> Analytics */}
          <div className="mt-14 p-6 max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl">
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

      {/* How It Works (4-Step Process) */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Methodology</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-2">
              Four Steps to Zero Energy Waste
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Connect Smart Meters', desc: 'Ingest Modbus, BACnet, and IoT gateway meters across building incomers, risers, and circuits.' },
              { step: '02', title: 'Collect Real-Time Data', desc: 'Stream electrical parameters via low-latency WebSockets into an enterprise time-series store.' },
              { step: '03', title: 'Analyze Energy Behavior', desc: 'AI Copilot maps consumption against thermal models, occupancy schedules, and baselines.' },
              { step: '04', title: 'Optimize Building Efficiency', desc: 'Execute automated setbacks, eliminate phantom overnight loads, and shed costly peak charges.' },
            ].map((s, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-3xl font-extrabold text-blue-600 font-mono block mb-3">{s.step}</span>
                <h3 className="text-sm font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Preview Section */}
      <section id="analytics-preview" className="py-20 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Live Telemetry Preview</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2">Executive Analytics at a Glance</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
            {[
              { label: 'Current Power', val: '428.6 kW', icon: Zap, color: 'text-blue-400' },
              { label: 'Daily Consumption', val: '3,842 kWh', icon: Activity, color: 'text-indigo-400' },
              { label: 'Monthly Consumption', val: '112.4 MWh', icon: BarChart3, color: 'text-sky-400' },
              { label: 'Peak Demand', val: '621 kW', icon: AlertTriangle, color: 'text-amber-400' },
              { label: 'Estimated Cost', val: '$18,420', icon: DollarSign, color: 'text-emerald-400' },
              { label: 'Carbon Emissions', val: '47.8 tCO₂e', icon: Leaf, color: 'text-teal-400' },
              { label: 'Efficiency Score', val: '84/100', icon: Sparkles, color: 'text-purple-400' },
            ].map((k, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <k.icon className={`w-5 h-5 mx-auto mb-2 ${k.color}`} />
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{k.label}</span>
                <span className="text-base sm:text-lg font-bold font-mono text-white block mt-1">{k.val}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-tr from-blue-700 to-indigo-800 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Start Monitoring Your Building Today
          </h2>
          <p className="text-base text-blue-100 max-w-xl mx-auto mt-4">
            Unify smart meters, physical assets, and predictive AI into a living digital twin.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/signup"
              className="px-8 py-3.5 bg-white text-blue-900 font-bold rounded-xl shadow-lg hover:bg-blue-50 transition-colors text-sm"
            >
              Get Started Now
            </Link>
            <Link
              to="/overview"
              className="px-8 py-3.5 bg-blue-900/60 text-white border border-blue-400/40 font-bold rounded-xl hover:bg-blue-900 transition-colors text-sm"
            >
              Launch Live Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
