import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import ukUA from 'antd/locale/uk_UA';
import enUS from 'antd/locale/en_US';
import dayjs from 'dayjs';
import { useTranslation } from './i18n';
import { darkTheme } from './theme/darkTheme';
import AppLayout from './components/Layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import Dashboard from './pages/Dashboard';
import CompaniesPage from './pages/SuperAdmin/CompaniesPage';
import CompanyUsersPage from './pages/SuperAdmin/CompanyUsersPage';
import ControlCenter from './pages/SuperAdmin/ControlCenter';
import IntegrationsPage from './pages/SuperAdmin/IntegrationsPage';
import FieldsList from './pages/Fields/FieldsList';
import FieldDetail from './pages/Fields/FieldDetail';
import LeasePage from './pages/Fields/LeasePage';
import CropRotationAdvisor from './pages/Fields/CropRotationAdvisor';
import WarehousesList from './pages/Warehouses/WarehousesList';
import WarehouseItems from './pages/Warehouses/WarehouseItems';
import StockMovements from './pages/Warehouses/StockMovements';
import InventorySessions from './pages/Warehouses/InventorySessions';
import StoragePage from './pages/GrainStorage/StoragePage';
import OperationsList from './pages/Operations/OperationsList';
import OperationDetail from './pages/Operations/OperationDetail';
import MachineryList from './pages/Machinery/MachineryList';
import MachineDetail from './pages/Machinery/MachineDetail';
import MaintenancePage from './pages/Machinery/MaintenancePage';
import FleetMap from './pages/Fleet/FleetMap';
import CostRecords from './pages/Economics/CostRecords';
import CostAnalytics from './pages/Economics/CostAnalytics';
import FieldPnl from './pages/Economics/FieldPnl';
import BudgetPage from './pages/Economics/BudgetPage';
import MarginalityDashboard from './pages/Economics/MarginalityDashboard';
import SeasonComparison from './pages/Economics/SeasonComparison';
import BreakEvenCalculator from './pages/Economics/BreakEvenCalculator';
import ResourceConsumption from './pages/Analytics/ResourceConsumption';
import FieldEfficiency from './pages/Analytics/FieldEfficiency';
import AnalyticsMarginalityDashboard from './pages/Analytics/MarginalityDashboard';
import EmployeeList from './pages/HR/EmployeeList';
import WorkLogPage from './pages/HR/WorkLogPage';
import SalaryPage from './pages/HR/SalaryPage';
import UsersPage from './pages/Settings/UsersPage';
import AdminAuditLogPage from './pages/Admin/AuditLogPage';
import ApiKeysPage from './pages/Admin/ApiKeysPage';
import RolePermissionsPage from './pages/Admin/RolePermissionsPage';
import PendingApprovalsPage from './pages/Admin/PendingApprovalsPage';
import ApprovalRulesPage from './pages/Admin/ApprovalRulesPage';
import SettingsAuditLogPage from './pages/Settings/AuditLogPage';
import ProfilePage from './pages/Profile/ProfilePage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import AccessDenied from './pages/AccessDenied';
import NotFound from './pages/NotFound';
import FuelStation from './pages/Fuel/FuelStation';
import SalesList from './pages/Sales/SalesList';
import RevenueAnalytics from './pages/Sales/RevenueAnalytics';
import SalaryFuelAnalytics from './pages/Analytics/SalaryFuelAnalytics';
import ImportItemsPage from './pages/Warehouses/ImportItemsPage';
import OnboardingWizard from './pages/Onboarding/OnboardingWizard';
import LandingPage from './pages/Landing/LandingPage';
import { useAuthStore } from './stores/authStore';
import { useSidebarStore } from './stores/sidebarStore';
import { useFeatureFlagsStore } from './stores/featureFlagsStore';
import FeatureFlagGate from './components/FeatureFlagGate';
import { OptionalFeatureFlags } from './features/optionalFeatureFlags';
import DevBypassBanner from './components/DevBypassBanner';
import { isPublicDemoMode } from './utils/publicDemo';
import { usePublicDemoAutoLogin } from './hooks/usePublicDemoAutoLogin';

function RootRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  // Authenticated users (including auto-logged-in public-demo users who
  // navigated away from "/") go straight to the dashboard; unauthenticated
  // visitors always see the marketing landing page.
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

export default function App() {
  const { lang } = useTranslation();

  // Auto-login as the demo user when public demo mode is enabled. `ready`
  // stays false until the token is in place (or the attempt fails), which
  // prevents ProtectedRoute from redirecting to /login during the half-second
  // it takes the network round-trip to complete.
  const { ready: demoReady } = usePublicDemoAutoLogin();

  // Seed sidebar pinned items from role-based defaults once per browser+user.
  // One-shot (guarded inside the store) — user can freely repin/unpin after.
  const authRole = useAuthStore((s) => s.role);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const tenantId = useAuthStore((s) => s.tenantId);
  const applyDefaultPinsForRole = useSidebarStore((s) => s.applyDefaultPinsForRole);
  const fetchFeatureFlags = useFeatureFlagsStore((s) => s.fetchFeatureFlags);
  const resetFeatureFlags = useFeatureFlagsStore((s) => s.reset);
  const loadedForTenantId = useFeatureFlagsStore((s) => s.loadedForTenantId);
  useEffect(() => {
    if (isAuthenticated) applyDefaultPinsForRole(authRole);
  }, [isAuthenticated, authRole, applyDefaultPinsForRole]);

  useEffect(() => {
    if (!isAuthenticated) {
      resetFeatureFlags();
      return;
    }

    if (tenantId && loadedForTenantId && loadedForTenantId !== tenantId) {
      resetFeatureFlags();
    }

    void fetchFeatureFlags();
  }, [isAuthenticated, tenantId, loadedForTenantId, fetchFeatureFlags, resetFeatureFlags]);

  useEffect(() => {
    dayjs.locale(lang === 'uk' ? 'uk' : 'en');
  }, [lang]);

  useEffect(() => {
    // The application is dark-only; the attribute is still set so CSS
    // selectors keyed on [data-theme="dark"] keep working.
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  return (
    <ConfigProvider
      locale={lang === 'uk' ? ukUA : enUS}
      theme={darkTheme}
    >
      <ErrorBoundary>
      <BrowserRouter>
        <DevBypassBanner />
        {isPublicDemoMode && !demoReady ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100vh', color: 'rgba(255,255,255,0.58)', fontSize: 13,
          }}>
            {lang === 'uk' ? 'Завантаження демо…' : 'Loading demo…'}
          </div>
        ) : (
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route path="/change-password" element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          } />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/superadmin" element={<ControlCenter />} />
            <Route path="/superadmin/companies" element={<CompaniesPage />} />
            <Route path="/superadmin/companies/:id/users" element={<CompanyUsersPage />} />
            <Route path="/superadmin/integrations" element={<IntegrationsPage />} />
            <Route path="/fields" element={<FieldsList />} />
            <Route path="/fields/leases" element={<Navigate to="/finance/leases" replace />} />
            <Route path="/finance/leases" element={<LeasePage />} />
            <Route path="/fields/rotation-advisor" element={<CropRotationAdvisor />} />
            <Route path="/fields/:id" element={<FieldDetail />} />
            <Route path="/warehouses" element={<WarehousesList />} />
            <Route path="/warehouses/items" element={<WarehouseItems />} />
            <Route path="/warehouses/movements" element={<StockMovements />} />
            <Route path="/warehouses/inventory" element={<InventorySessions />} />
            <Route path="/warehouses/import" element={<ImportItemsPage />} />
            <Route path="/onboarding" element={<OnboardingWizard />} />
            <Route path="/storage" element={<StoragePage />} />
            <Route path="/grain" element={<Navigate to="/storage" replace />} />
            <Route path="/grain-storages" element={<Navigate to="/storage" replace />} />
            <Route path="/warehouses/grain" element={<Navigate to="/storage" replace />} />
            <Route path="/grain-overview" element={<Navigate to="/storage" replace />} />
            <Route path="/operations" element={<OperationsList />} />
            <Route path="/operations/:id" element={<OperationDetail />} />
            <Route path="/machinery" element={<MachineryList />} />
            <Route path="/machinery/:id" element={<MachineDetail />} />
            <Route path="/machinery/:id/maintenance" element={<MaintenancePage />} />
            <Route path="/fleet" element={<FleetMap />} />
            <Route path="/fuel" element={<FuelStation />} />
            <Route path="/sales" element={<SalesList />} />
            <Route
              path="/sales/analytics"
              element={
                <FeatureFlagGate feature={OptionalFeatureFlags.analyticsSalesAnalytics}>
                  <RevenueAnalytics />
                </FeatureFlagGate>
              }
            />
            <Route path="/expenses" element={<CostRecords />} />
            <Route path="/economics" element={<Navigate to="/expenses" replace />} />
            <Route path="/economics/costs" element={<Navigate to="/expenses" replace />} />
            <Route
              path="/economics/analytics"
              element={
                <FeatureFlagGate feature={OptionalFeatureFlags.analyticsExpenseAnalytics}>
                  <CostAnalytics />
                </FeatureFlagGate>
              }
            />
            <Route
              path="/economics/pnl"
              element={
                <FeatureFlagGate feature={OptionalFeatureFlags.pnlByFields}>
                  <FieldPnl />
                </FeatureFlagGate>
              }
            />
            <Route
              path="/economics/budget"
              element={
                <FeatureFlagGate feature={OptionalFeatureFlags.budget}>
                  <BudgetPage />
                </FeatureFlagGate>
              }
            />
            <Route
              path="/economics/marginality"
              element={
                <FeatureFlagGate feature={OptionalFeatureFlags.analyticsMarginality}>
                  <MarginalityDashboard />
                </FeatureFlagGate>
              }
            />
            <Route
              path="/economics/season-comparison"
              element={
                <FeatureFlagGate feature={OptionalFeatureFlags.analyticsSeasonComparison}>
                  <SeasonComparison />
                </FeatureFlagGate>
              }
            />
            <Route
              path="/economics/break-even"
              element={
                <FeatureFlagGate feature={OptionalFeatureFlags.analyticsBreakEven}>
                  <BreakEvenCalculator />
                </FeatureFlagGate>
              }
            />
            <Route
              path="/analytics/resources"
              element={
                <FeatureFlagGate feature={OptionalFeatureFlags.analyticsResourceUsage}>
                  <ResourceConsumption />
                </FeatureFlagGate>
              }
            />
            <Route
              path="/analytics/efficiency"
              element={
                <FeatureFlagGate feature={OptionalFeatureFlags.analyticsFieldEfficiency}>
                  <FieldEfficiency />
                </FeatureFlagGate>
              }
            />
            <Route
              path="/analytics/marginality"
              element={
                <FeatureFlagGate feature={OptionalFeatureFlags.analyticsMarginality}>
                  <AnalyticsMarginalityDashboard />
                </FeatureFlagGate>
              }
            />
            <Route path="/analytics/salary-fuel" element={<SalaryFuelAnalytics />} />
            <Route path="/hr/employees" element={<EmployeeList />} />
            <Route path="/hr/worklogs" element={<WorkLogPage />} />
            <Route path="/hr/salary" element={<SalaryPage />} />
            <Route path="/settings/users" element={<UsersPage />} />
            <Route path="/admin/audit" element={<AdminAuditLogPage />} />
            <Route path="/admin/api-keys" element={<ApiKeysPage />} />
            <Route path="/admin/role-permissions" element={<RolePermissionsPage />} />
            <Route path="/admin/approvals" element={<PendingApprovalsPage />} />
            <Route path="/admin/approval-rules" element={<ApprovalRulesPage />} />
            <Route path="/settings/audit" element={<SettingsAuditLogPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        )}
      </BrowserRouter>
      </ErrorBoundary>
    </ConfigProvider>
  );
}
