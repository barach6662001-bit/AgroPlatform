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
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FieldsList from './pages/Fields/FieldsList';
import FieldDetail from './pages/Fields/FieldDetail';
import LeasePage from './pages/Fields/LeasePage';
import WarehousesList from './pages/Warehouses/WarehousesList';
import WarehouseItems from './pages/Warehouses/WarehouseItems';
import StockMovements from './pages/Warehouses/StockMovements';
import GrainBatchList from './pages/GrainStorage/GrainBatchList';
import OperationsList from './pages/Operations/OperationsList';
import OperationDetail from './pages/Operations/OperationDetail';
import MachineryList from './pages/Machinery/MachineryList';
import MachineDetail from './pages/Machinery/MachineDetail';
import MaintenancePage from './pages/Machinery/MaintenancePage';
import FleetMap from './pages/Fleet/FleetMap';
import CostRecords from './pages/Economics/CostRecords';
import FieldPnl from './pages/Economics/FieldPnl';
import BudgetPage from './pages/Economics/BudgetPage';
import SalesPage from './pages/Economics/SalesPage';
import ResourceConsumption from './pages/Analytics/ResourceConsumption';
import FieldEfficiency from './pages/Analytics/FieldEfficiency';
import EmployeeList from './pages/HR/EmployeeList';
import WorkLogPage from './pages/HR/WorkLogPage';
import SalaryPage from './pages/HR/SalaryPage';
import UsersPage from './pages/Settings/UsersPage';
import ProfilePage from './pages/Profile/ProfilePage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import AccessDenied from './pages/AccessDenied';
import NotFound from './pages/NotFound';
import FuelStation from './pages/Fuel/FuelStation';

export default function App() {
  const { lang } = useTranslation();

  useEffect(() => {
    dayjs.locale(lang === 'uk' ? 'uk' : 'en');
  }, [lang]);

  return (
    <ConfigProvider
      locale={lang === 'uk' ? ukUA : enUS}
      theme={darkTheme}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/fields" element={<FieldsList />} />
            <Route path="/fields/leases" element={<LeasePage />} />
            <Route path="/fields/:id" element={<FieldDetail />} />
            <Route path="/warehouses" element={<WarehousesList />} />
            <Route path="/warehouses/items" element={<WarehouseItems />} />
            <Route path="/warehouses/movements" element={<StockMovements />} />
            <Route path="/grain" element={<GrainBatchList />} />
            <Route path="/warehouses/grain" element={<GrainBatchList />} />
            <Route path="/operations" element={<OperationsList />} />
            <Route path="/operations/:id" element={<OperationDetail />} />
            <Route path="/machinery" element={<MachineryList />} />
            <Route path="/machinery/:id" element={<MachineDetail />} />
            <Route path="/machinery/:id/maintenance" element={<MaintenancePage />} />
            <Route path="/fleet" element={<FleetMap />} />
            <Route path="/fuel" element={<FuelStation />} />
            <Route path="/economics" element={<CostRecords />} />
            <Route path="/economics/pnl" element={<FieldPnl />} />
            <Route path="/economics/budget" element={<BudgetPage />} />
            <Route path="/economics/sales" element={<SalesPage />} />
            <Route path="/analytics/resources" element={<ResourceConsumption />} />
            <Route path="/analytics/efficiency" element={<FieldEfficiency />} />
            <Route path="/hr/employees" element={<EmployeeList />} />
            <Route path="/hr/worklogs" element={<WorkLogPage />} />
            <Route path="/hr/salary" element={<SalaryPage />} />
            <Route path="/settings/users" element={<UsersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
