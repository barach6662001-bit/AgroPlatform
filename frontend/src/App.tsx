import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import ukUA from 'antd/locale/uk_UA';
import enUS from 'antd/locale/en_US';
import { useTranslation } from './i18n';
import AppLayout from './components/Layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { RoleGuard } from './components/Auth/RoleGuard';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FieldsList from './pages/Fields/FieldsList';
import FieldDetail from './pages/Fields/FieldDetail';
import WarehousesList from './pages/Warehouses/WarehousesList';
import WarehouseItems from './pages/Warehouses/WarehouseItems';
import OperationsList from './pages/Operations/OperationsList';
import OperationDetail from './pages/Operations/OperationDetail';
import MachineryList from './pages/Machinery/MachineryList';
import MachineDetail from './pages/Machinery/MachineDetail';
import CostRecords from './pages/Economics/CostRecords';
import AccessDenied from './pages/AccessDenied';

export default function App() {
  const { lang } = useTranslation();
  return (
    <ConfigProvider
      locale={lang === 'uk' ? ukUA : enUS}
      theme={{
        token: {
          colorPrimary: '#52c41a',
          colorLink: '#389e0d',
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/fields" element={<FieldsList />} />
            <Route path="/fields/:id" element={<FieldDetail />} />
            <Route path="/warehouses" element={<WarehousesList />} />
            <Route path="/warehouses/items" element={<WarehouseItems />} />
            <Route path="/operations" element={
              <RoleGuard allowedRoles={['Administrator', 'Manager', 'Agronomist', 'Director']}>
                <OperationsList />
              </RoleGuard>
            } />
            <Route path="/operations/:id" element={
              <RoleGuard allowedRoles={['Administrator', 'Manager', 'Agronomist', 'Director']}>
                <OperationDetail />
              </RoleGuard>
            } />
            <Route path="/machinery" element={
              <RoleGuard allowedRoles={['Administrator', 'Manager', 'Agronomist', 'Director']}>
                <MachineryList />
              </RoleGuard>
            } />
            <Route path="/machinery/:id" element={
              <RoleGuard allowedRoles={['Administrator', 'Manager', 'Agronomist', 'Director']}>
                <MachineDetail />
              </RoleGuard>
            } />
            <Route path="/economics" element={
              <RoleGuard allowedRoles={['Administrator', 'Manager', 'Director']}>
                <CostRecords />
              </RoleGuard>
            } />
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
