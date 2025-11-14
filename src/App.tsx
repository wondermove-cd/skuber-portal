import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import './i18n';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import VerifyCodePage from '@/pages/VerifyCodePage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import ResellerSignupPage from '@/pages/ResellerSignupPage';
import UserSignupPage from '@/pages/UserSignupPage';
import { DashboardLayout } from '@/pages/DashboardLayout';
import { DashboardMainPage } from '@/pages/DashboardMainPage';
import { ResellerDashboardPage } from '@/pages/ResellerDashboardPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { CustomerDetailPage } from '@/pages/CustomerDetailPage';
import { ContractsPage } from '@/pages/ContractsPage';
import ContractDetailPage from '@/pages/ContractDetailPage';
import { MyPaymentsPage } from '@/pages/MyPaymentsPage';
import { PaymentsPage } from '@/pages/PaymentsPage';
import { ResellerPage } from '@/pages/ResellerPage';
import ResellerDetailPage from '@/pages/ResellerDetailPage';
import SettingsPage from '@/pages/SettingsPage';
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
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-code" element={<VerifyCodePage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/reseller-signup" element={<ResellerSignupPage />} />
          <Route path="/user-signup" element={<UserSignupPage />} />

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

            {/* Customer Detail Page - accessible to authenticated users */}
            <Route path="customers/:id" element={
              <ProtectedRoute>
                <CustomerDetailPage />
              </ProtectedRoute>
            } />

            {/* Contracts Page - accessible to authenticated users */}
            <Route path="contracts" element={
              <ProtectedRoute>
                <ContractsPage />
              </ProtectedRoute>
            } />

            {/* Contract Detail Page - accessible to authenticated users */}
            <Route path="contracts/:contractId" element={
              <ProtectedRoute>
                <ContractDetailPage />
              </ProtectedRoute>
            } />

            {/* My Payments Page - Reseller only */}
            <Route path="my-payments" element={
              <ProtectedRoute allowedRoles={['reseller_admin', 'reseller_editor', 'reseller_viewer']}>
                <MyPaymentsPage />
              </ProtectedRoute>
            } />

            {/* Payments Page - WM only */}
            <Route path="payments" element={
              <ProtectedRoute allowedRoles={['wm_admin', 'wm_staff', 'wm_editor', 'wm_viewer']}>
                <PaymentsPage />
              </ProtectedRoute>
            } />

            {/* 403 Forbidden Page - accessible to all users */}
            <Route path="403" element={<ForbiddenPage />} />

            {/* WM routes only - Reseller Management */}
            <Route path="reseller" element={
              <ProtectedRoute allowedRoles={['wm_admin', 'wm_staff', 'wm_editor', 'wm_viewer']}>
                <ResellerPage />
              </ProtectedRoute>
            } />

            {/* Reseller Detail Page - WM only */}
            <Route path="reseller/:resellerId" element={
              <ProtectedRoute allowedRoles={['wm_admin', 'wm_staff', 'wm_editor', 'wm_viewer']}>
                <ResellerDetailPage />
              </ProtectedRoute>
            } />

            {/* Settings page - accessible by all authenticated users */}
            <Route path="settings" element={
              <ProtectedRoute allowedRoles={['wm_admin', 'wm_editor', 'wm_viewer', 'reseller_admin', 'reseller_staff', 'reseller_editor', 'reseller_viewer']}>
                <SettingsPage />
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
