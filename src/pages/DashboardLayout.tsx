import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';

export function DashboardLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
      return;
    }

    // Redirect Reseller users to login
    if (user.role.startsWith('reseller_')) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Don't render if not authorized
  if (!user || user.role.startsWith('reseller_')) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto min-w-[1008px]">
        <Outlet />
      </main>
    </div>
  );
}
