import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardLayout } from '@/pages/DashboardLayout';
import { DashboardMainPage } from '@/pages/DashboardMainPage';
import { ResellerDashboardPage } from '@/pages/ResellerDashboardPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { ContractsPage } from '@/pages/ContractsPage';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { Toaster } from '@/components/ui/toaster';

function DashboardRouter() {
  const { user } = useAuth();

  if (!user) return null;

  const isResellerUser = user.role.startsWith('reseller_');

  return isResellerUser ? <ResellerDashboardPage /> : <DashboardMainPage />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={<DashboardLayout />}>
            <Route path="dashboard" element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            } />

            {/* Customers Page - accessible to authenticated users */}
            <Route path="customers" element={
              <ProtectedRoute>
                <CustomersPage />
              </ProtectedRoute>
            } />

            {/* Contracts Page - accessible to authenticated users */}
            <Route path="contracts" element={
              <ProtectedRoute>
                <ContractsPage />
              </ProtectedRoute>
            } />

            {/* 403 Forbidden Page - accessible to all users */}
            <Route path="403" element={<ForbiddenPage />} />

            {/* WM Admin/Staff only routes - Reseller Management */}
            <Route path="reseller" element={
              <ProtectedRoute allowedRoles={['wm_admin', 'wm_staff']}>
                <div>Reseller Management Page (WM Admin/Staff Only)</div>
              </ProtectedRoute>
            } />

            {/* Settings page - accessible by WM Admin and Reseller Admin */}
            <Route path="settings/users" element={
              <ProtectedRoute allowedRoles={['wm_admin', 'reseller_admin']}>
                <div>User Settings Page (WM Admin & Reseller Admin)</div>
              </ProtectedRoute>
            } />

            {/* 404 Not Found - Catch all unmatched routes (inside DashboardLayout) */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
