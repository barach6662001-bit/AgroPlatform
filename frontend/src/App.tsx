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
import ResourceConsumption from './pages/Analytics/ResourceConsumption';
import FieldEfficiency from './pages/Analytics/FieldEfficiency';
import AccessDenied from './pages/AccessDenied';
import NotFound from './pages/NotFound';

export default function App() {
  const { lang } = useTranslation();
  return (
    <ConfigProvider
      locale={lang === 'uk' ? ukUA : enUS}
      theme={{
        token: {
          colorPrimary: '#0D9488',
          colorLink: '#0F766E',
          colorBgBase: '#FAFBFC',
          colorTextBase: '#1E293B',
          borderRadius: 10,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        components: {
          Layout: {
            siderBg: '#0F172A',
            headerBg: '#FFFFFF',
          },
          Menu: {
            darkItemBg: '#0F172A',
            darkItemSelectedBg: '#1E293B',
            darkItemHoverBg: '#1E293B',
            darkItemColor: '#94A3B8',
            darkItemSelectedColor: '#2DD4BF',
          },
          Card: {
            borderRadiusLG: 12,
          },
          Button: {
            borderRadius: 8,
            primaryShadow: '0 2px 8px rgba(13, 148, 136, 0.3)',
          },
        },
      }}
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
            <Route path="/fields/:id" element={<FieldDetail />} />
            <Route path="/warehouses" element={<WarehousesList />} />
            <Route path="/warehouses/items" element={<WarehouseItems />} />
            <Route path="/operations" element={<OperationsList />} />
            <Route path="/operations/:id" element={<OperationDetail />} />
            <Route path="/machinery" element={<MachineryList />} />
            <Route path="/machinery/:id" element={<MachineDetail />} />
            <Route path="/economics" element={<CostRecords />} />
            <Route path="/analytics/resources" element={<ResourceConsumption />} />
            <Route path="/analytics/efficiency" element={<FieldEfficiency />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
