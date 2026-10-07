import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { SuperAdminPanel } from './SuperAdminPanel';
import { FacilityManagerPanel } from './FacilityManagerPanel';
import { EnergyManagerPanel } from './EnergyManagerPanel';
import { TenantPanel } from './TenantPanel';

export const RoleDashboardDispatcher: React.FC = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'super_admin':
      return <SuperAdminPanel />;
    case 'facility_manager':
      return <FacilityManagerPanel />;
    case 'energy_manager':
      return <EnergyManagerPanel />;
    case 'tenant':
      return <TenantPanel />;
    default:
      return <FacilityManagerPanel />;
  }
};
