import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { ConfigProvider } from 'antd';
import ukUA from 'antd/locale/uk_UA';
import enUS from 'antd/locale/en_US';
import dayjs from 'dayjs';
import { useTranslation } from './i18n';
import { darkTheme } from './theme/darkTheme';
import { lightTheme } from './theme/lightTheme';
import { useThemeStore } from './stores/themeStore';
import AppLayout from './components/Layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import Dashboard from './pages/Dashboard';
import CompaniesPage from './pages/SuperAdmin/CompaniesPage';
import CompanyUsersPage from './pages/SuperAdmin/CompanyUsersPage';
import FieldsList from './pages/Fields/FieldsList';
import FieldDetail from './pages/Fields/FieldDetail';

// New consolidated hub pages
import WarehousePage from './pages/Warehouse/WarehousePage';
import OperationsHubPage from './pages/Ops/OperationsHubPage';
import TeamPage from './pages/Team/TeamPage';
import FinancePage from './pages/Finance/FinancePage';

// Operations detail pages (keep own routes)
import OperationDetail from './pages/Operations/OperationDetail';
import MachineDetail from './pages/Machinery/MachineDetail';
import MaintenancePage from './pages/Machinery/MaintenancePage';

// Settings / Admin pages
import UsersPage from './pages/Settings/UsersPage';
import AdminAuditLogPage from './pages/Admin/AuditLogPage';
import ApiKeysPage from './pages/Admin/ApiKeysPage';
import RolePermissionsPage from './pages/Admin/RolePermissionsPage';
import PendingApprovalsPage from './pages/Admin/PendingApprovalsPage';
import ApprovalRulesPage from './pages/Admin/ApprovalRulesPage';
import SettingsAuditLogPage from './pages/Settings/AuditLogPage';

// Utility pages
import ProfilePage from './pages/Profile/ProfilePage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import AccessDenied from './pages/AccessDenied';
import NotFound from './pages/NotFound';
import OnboardingWizard from './pages/Onboarding/OnboardingWizard';
import LandingPage from './pages/Landing/LandingPage';
import { useAuthStore } from './stores/authStore';
import DesignSystemPreview from './pages/__design-system';

function RootRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

export default function App() {
  const { lang } = useTranslation();
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    dayjs.locale(lang === 'uk' ? 'uk' : 'en');
  }, [lang]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <>
    <ConfigProvider
      locale={lang === 'uk' ? ukUA : enUS}
      theme={theme === 'dark' ? darkTheme : lightTheme}
    >
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/__design-system" element={<DesignSystemPreview />} />
            <Route path="/" element={<RootRoute />} />
            <Route path="/login" element={<Login />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route path="/change-password" element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            } />

            <Route element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              {/* Core pages */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/fields" element={<FieldsList />} />
              <Route path="/fields/:id" element={<FieldDetail />} />

              {/* New consolidated hubs */}
              <Route path="/operations" element={<OperationsHubPage />} />
              <Route path="/warehouse" element={<WarehousePage />} />
              <Route path="/finance" element={<FinancePage />} />
              <Route path="/team" element={<TeamPage />} />

              {/* Detail pages that need own routes */}
              <Route path="/operations/:id" element={<OperationDetail />} />
              <Route path="/machinery/:id" element={<MachineDetail />} />
              <Route path="/machinery/:id/maintenance" element={<MaintenancePage />} />

              {/* SuperAdmin */}
              <Route path="/superadmin/companies" element={<CompaniesPage />} />
              <Route path="/superadmin/companies/:id/users" element={<CompanyUsersPage />} />

              {/* Settings / Admin */}
              <Route path="/settings/users" element={<UsersPage />} />
              <Route path="/admin/audit" element={<AdminAuditLogPage />} />
              <Route path="/admin/api-keys" element={<ApiKeysPage />} />
              <Route path="/admin/role-permissions" element={<RolePermissionsPage />} />
              <Route path="/admin/approvals" element={<PendingApprovalsPage />} />
              <Route path="/admin/approval-rules" element={<ApprovalRulesPage />} />
              <Route path="/settings/audit" element={<SettingsAuditLogPage />} />

              {/* Utility */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/onboarding" element={<OnboardingWizard />} />

              {/* ── Redirects: old routes → new IA ────────────────────────── */}
              {/* Fields redirects */}
              <Route path="/fields/rotation-advisor" element={<Navigate to="/fields" replace />} />
              <Route path="/fields/leases" element={<Navigate to="/fields" replace />} />

              {/* Operations redirects */}
              <Route path="/machinery" element={<Navigate to="/operations?tab=machinery" replace />} />
              <Route path="/fleet" element={<Navigate to="/operations?tab=fleet" replace />} />
              <Route path="/fuel" element={<Navigate to="/operations?tab=fuel" replace />} />

              {/* Warehouse redirects */}
              <Route path="/warehouses" element={<Navigate to="/warehouse?tab=warehouses" replace />} />
              <Route path="/warehouses/items" element={<Navigate to="/warehouse?tab=stock" replace />} />
              <Route path="/warehouses/movements" element={<Navigate to="/warehouse?tab=movements" replace />} />
              <Route path="/warehouses/inventory" element={<Navigate to="/warehouse?tab=inventory" replace />} />
              <Route path="/warehouses/import" element={<Navigate to="/warehouse?tab=stock" replace />} />
              <Route path="/storage" element={<Navigate to="/warehouse?tab=grain" replace />} />
              <Route path="/grain" element={<Navigate to="/warehouse?tab=grain" replace />} />
              <Route path="/grain-storages" element={<Navigate to="/warehouse?tab=grain" replace />} />
              <Route path="/warehouses/grain" element={<Navigate to="/warehouse?tab=grain" replace />} />
              <Route path="/grain-overview" element={<Navigate to="/warehouse?tab=grain" replace />} />

              {/* Finance redirects */}
              <Route path="/economics" element={<Navigate to="/finance?tab=costs" replace />} />
              <Route path="/economics/analytics" element={<Navigate to="/finance?tab=analytics&dim=costs" replace />} />
              <Route path="/economics/pnl" element={<Navigate to="/finance?tab=analytics&dim=field" replace />} />
              <Route path="/economics/budget" element={<Navigate to="/finance?tab=budget" replace />} />
              <Route path="/economics/marginality" element={<Navigate to="/finance?tab=analytics&dim=category" replace />} />
              <Route path="/economics/season-comparison" element={<Navigate to="/finance?tab=analytics&dim=season" replace />} />
              <Route path="/economics/break-even" element={<Navigate to="/finance?tab=analytics&dim=breakeven" replace />} />
              <Route path="/sales" element={<Navigate to="/finance?tab=sales" replace />} />
              <Route path="/sales/analytics" element={<Navigate to="/finance?tab=analytics&dim=revenue" replace />} />
              <Route path="/analytics/resources" element={<Navigate to="/finance?tab=analytics&dim=resources" replace />} />
              <Route path="/analytics/efficiency" element={<Navigate to="/finance?tab=analytics&dim=efficiency" replace />} />
              <Route path="/analytics/marginality" element={<Navigate to="/finance?tab=analytics&dim=category" replace />} />
              <Route path="/analytics/salary-fuel" element={<Navigate to="/finance?tab=analytics&dim=payroll" replace />} />

              {/* HR redirects */}
              <Route path="/hr/employees" element={<Navigate to="/team?tab=employees" replace />} />
              <Route path="/hr/worklogs" element={<Navigate to="/team?tab=worklogs" replace />} />
              <Route path="/hr/salary" element={<Navigate to="/team?tab=salary" replace />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </ConfigProvider>
    <Toaster position="top-right" richColors={false} closeButton />
    </>
  );
}
