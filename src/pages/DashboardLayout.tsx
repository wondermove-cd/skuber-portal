import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';

export function DashboardLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleOpenNotifications = () => {
    // TODO: Implement notification panel
    console.log('Open notifications');
  };

  return (
    <div className="flex h-screen bg-black">
      {isSidebarOpen && <Sidebar />}
      <main className="flex-1 overflow-auto min-w-[1008px]">
        <Outlet context={{ onToggleSidebar: handleToggleSidebar, onOpenNotifications: handleOpenNotifications }} />
      </main>
    </div>
  );
}
