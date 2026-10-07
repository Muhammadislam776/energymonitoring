import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Lock,
  Mail,
  User,
  Building,
  ArrowRight,
  AlertCircle,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  Crown,
  Wrench,
  TrendingUp,
  UserCheck,
  Zap,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';

interface RoleOption {
  id: 'super_admin' | 'facility_manager' | 'energy_manager' | 'tenant';
  title: string;
  badge: string;
  badgeVariant: 'blue' | 'healthy' | 'warning' | 'purple';
  icon: any;
  description: string;
  permissions: string[];
}

const ROLES: RoleOption[] = [
  {
    id: 'facility_manager',
    title: 'Facility Manager',
    badge: 'Operations',
    badgeVariant: 'healthy',
    icon: Wrench,
    description: 'Day-to-day building operations, equipment assets, and maintenance schedules',
    permissions: ['Floor & room controls', 'Equipment health monitoring', 'Alarm triage & dispatch'],
  },
  {
    id: 'energy_manager',
    title: 'Energy Manager',
    badge: 'Analytics & AI',
    badgeVariant: 'blue',
    icon: TrendingUp,
    description: 'Deep energy telemetry, peak demand forecasting, and carbon reporting',
    permissions: ['ML load forecasts', 'AI anomaly dossiers', 'Demand response simulation'],
  },
  {
    id: 'super_admin',
    title: 'Super Admin',
    badge: 'Full Enterprise',
    badgeVariant: 'purple',
    icon: Crown,
    description: 'Global administrator across all buildings, tenants, meters, and system settings',
    permissions: ['Manage organizations & tenants', 'User & role provisioning', 'Audit logs & tariff settings'],
  },
  {
    id: 'tenant',
    title: 'Tenant Occupant',
    badge: 'Private Suite',
    badgeVariant: 'warning',
    icon: UserCheck,
    description: 'Strictly isolated access confined to your assigned suites and sub-meters',
    permissions: ['Private suite energy view', 'Zone thermal comfort', 'Sub-meter billing statements'],
  },
];

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState<'super_admin' | 'facility_manager' | 'energy_manager' | 'tenant'>('facility_manager');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-blue-500' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must contain at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      setError('You must accept the terms of service to proceed');
      return;
    }

    setLoading(true);
    try {
      await signup({
        name,
        email,
        password,
        organization: organization || 'Enterprise Client',
        role,
      });
      navigate('/overview');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 selection:bg-blue-500 selection:text-white">
      {/* Background Decorative Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10 text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
          <img src="/logo.svg" alt="EnergyTwin" className="w-10 h-10 rounded-xl shadow-lg ring-1 ring-white/20 transition-transform group-hover:scale-105" />
          <span className="text-2xl font-black tracking-tight text-white">
            Energy<span className="text-blue-400">Twin</span>
          </span>
        </Link>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Create Your Platform Account
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Select your enterprise role and deploy digital twin energy intelligence for your facilities.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="bg-white text-slate-900 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-200">
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Role Selection Cards */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  Select Your Operational Role
                </label>
                <span className="text-[11px] text-blue-600 font-semibold">
                  Required for access permissions
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ROLES.map((r) => {
                  const isSelected = role === r.id;
                  const Icon = r.icon;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`relative p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/40 shadow-sm shadow-blue-500/10'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-slate-600 border border-slate-200'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block leading-tight">
                              {r.title}
                            </span>
                            <Badge variant={r.badgeVariant} size="sm">
                              {r.badge}
                            </Badge>
                          </div>
                        </div>

                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-snug mb-2">
                        {r.description}
                      </p>

                      <div className="pt-2 border-t border-slate-200/60 space-y-1">
                        {r.permissions.map((perm, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-600">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                            <span className="truncate">{perm}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Personal & Organization Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Marcus Sterling"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Work Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="marcus@metropolis.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Organization / Facility Company <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Metropolis Real Estate & Energy Corp"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Security & Password */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password strength progress bar */}
              {password && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Security strength:</span>
                    <span className="font-bold text-slate-700">{strength.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-0.5"
                />
                <span>
                  I agree to EnergyTwin's{' '}
                  <span className="text-blue-600 font-semibold underline hover:text-blue-700">
                    Enterprise Master Terms of Service
                  </span>{' '}
                  and{' '}
                  <span className="text-blue-600 font-semibold underline hover:text-blue-700">
                    Privacy Policy
                  </span>
                  .
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account & Initializing...' : 'Create Account & Start Monitoring'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Bottom Switch to Login */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an active account?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 underline">
              Sign In Here
            </Link>
          </div>
        </div>

        {/* Trust Footnote */}
        <div className="mt-6 text-center text-[11px] text-slate-400 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-blue-400" /> SOC 2 Type II Certified
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 256-bit TLS Encryption
          </span>
          <span>•</span>
          <span>Tenant Isolated</span>
        </div>
      </div>
    </div>
  );
};
