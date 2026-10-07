import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Badge } from './Badge';

interface AccessDeniedProps {
  requiredRoles?: string[];
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ requiredRoles = ['super_admin'] }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    facility_manager: 'Facility Manager',
    energy_manager: 'Energy Manager',
    tenant: 'Tenant User',
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <Badge variant="danger" size="md">
            403 Forbidden
          </Badge>
          <h2 className="text-xl font-extrabold text-slate-900 mt-2">
            Role Authorization Required
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Your current account role does not have authorization to view this enterprise module.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Your Current Role:</span>
            <span className="font-bold text-slate-800">
              {roleLabels[user?.role || 'tenant'] || user?.role}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Authorized Roles:</span>
            <span className="font-mono font-semibold text-blue-600">
              {requiredRoles.map((r) => roleLabels[r] || r).join(', ')}
            </span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => navigate('/overview')}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
