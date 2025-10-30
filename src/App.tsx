import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardLayout } from '@/pages/DashboardLayout';
import { DashboardMainPage } from '@/pages/DashboardMainPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<DashboardLayout />}>
            <Route path="dashboard" element={<DashboardMainPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
