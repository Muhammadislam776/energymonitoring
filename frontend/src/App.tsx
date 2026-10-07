import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { SimulatorControlPanel } from './components/simulator/SimulatorControlPanel';

// Public pages
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Authenticated Main
import { OverviewPage } from './pages/dashboard/OverviewPage';
import { DigitalTwinPage } from './pages/digitaltwin/DigitalTwinPage';
import { LiveMonitoringPage } from './pages/monitoring/LiveMonitoringPage';
import { FloorPlanPage } from './pages/floorplan/FloorPlanPage';

// Infrastructure
import { BuildingsPage } from './pages/infrastructure/BuildingsPage';
import { FloorsRoomsPage } from './pages/infrastructure/FloorsRoomsPage';
import { EquipmentPage } from './pages/infrastructure/EquipmentPage';
import { SmartMetersPage } from './pages/infrastructure/SmartMetersPage';

// Intelligence
import { EnergyAnalyticsPage } from './pages/intelligence/EnergyAnalyticsPage';
import { ConsumptionHistoryPage } from './pages/intelligence/ConsumptionHistoryPage';
import { AnomaliesPage } from './pages/intelligence/AnomaliesPage';
import { ForecastPage } from './pages/intelligence/ForecastPage';
import { RecommendationsPage } from './pages/intelligence/RecommendationsPage';
import { EnergyCopilotPage } from './pages/intelligence/EnergyCopilotPage';

// Operations
import { AlertsPage } from './pages/operations/AlertsPage';
import { ReportsPage } from './pages/operations/ReportsPage';
import { ExportCenterPage } from './pages/operations/ExportCenterPage';

// Administration
import { UsersTenantsPage } from './pages/admin/UsersTenantsPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';

import { useLocation } from 'react-router-dom';
import { AccessDenied } from './components/common/AccessDenied';

// Dedicated Role Panels
import { RoleDashboardDispatcher } from './pages/panels/RoleDashboardDispatcher';
import { SuperAdminPanel } from './pages/panels/SuperAdminPanel';
import { FacilityManagerPanel } from './pages/panels/FacilityManagerPanel';
import { EnergyManagerPanel } from './pages/panels/EnergyManagerPanel';
import { TenantPanel } from './pages/panels/TenantPanel';

// Protected Route wrapper: requires real authentication session
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Connecting to EnergyTwin Platform...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if unauthenticated
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

// Role-Based Authorization Guard
const RoleRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (user && !allowedRoles.includes(user.role)) {
    return <AccessDenied requiredRoles={allowedRoles} />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <>
      <Routes>
        {/* Marketing Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Authenticated Application Shell */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Main & Role-Specific Dedicated Panels */}
          <Route path="/overview" element={<RoleDashboardDispatcher />} />
          <Route
            path="/admin-panel"
            element={
              <RoleRoute allowedRoles={['super_admin']}>
                <SuperAdminPanel />
              </RoleRoute>
            }
          />
          <Route
            path="/facility-panel"
            element={
              <RoleRoute allowedRoles={['facility_manager', 'super_admin']}>
                <FacilityManagerPanel />
              </RoleRoute>
            }
          />
          <Route
            path="/energy-panel"
            element={
              <RoleRoute allowedRoles={['energy_manager', 'super_admin']}>
                <EnergyManagerPanel />
              </RoleRoute>
            }
          />
          <Route
            path="/tenant-panel"
            element={
              <RoleRoute allowedRoles={['tenant', 'super_admin']}>
                <TenantPanel />
              </RoleRoute>
            }
          />
          <Route path="/digital-twin" element={<DigitalTwinPage />} />
          <Route path="/live-monitoring" element={<LiveMonitoringPage />} />
          <Route path="/floor-plan" element={<FloorPlanPage />} />

          {/* Infrastructure */}
          <Route path="/buildings" element={<BuildingsPage />} />
          <Route path="/floors-rooms" element={<FloorsRoomsPage />} />
          <Route path="/equipment" element={<EquipmentPage />} />
          <Route path="/meters" element={<SmartMetersPage />} />

          {/* Intelligence */}
          <Route path="/analytics" element={<EnergyAnalyticsPage />} />
          <Route path="/history" element={<ConsumptionHistoryPage />} />
          <Route path="/anomalies" element={<AnomaliesPage />} />
          <Route path="/forecast" element={<ForecastPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/copilot" element={<EnergyCopilotPage />} />

          {/* Operations */}
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/exports" element={<ExportCenterPage />} />

          {/* Administration - Role Restricted */}
          <Route
            path="/users-tenants"
            element={
              <RoleRoute allowedRoles={['super_admin']}>
                <UsersTenantsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <RoleRoute allowedRoles={['super_admin', 'facility_manager', 'energy_manager']}>
                <SettingsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <RoleRoute allowedRoles={['super_admin', 'facility_manager']}>
                <AuditLogsPage />
              </RoleRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating Simulator Control Panel for live IoT evaluation */}
      <SimulatorControlPanel />
    </>
  );
};
