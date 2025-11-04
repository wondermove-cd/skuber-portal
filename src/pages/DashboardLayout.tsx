import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, matchPath } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';

export function DashboardLayout() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Define public routes that don't require authentication
  const publicRoutes = ['/403', '/404'];
  const isPublicRoute = publicRoutes.some(route =>
    matchPath({ path: route, end: false }, location.pathname)
  );

  useEffect(() => {
    // Don't redirect while loading user data
    if (isLoading) {
      return;
    }

    // Only redirect if not logged in AND not on a public route
    // Don't redirect on unknown routes (they'll show 404)
    if (!user && !isPublicRoute) {
      const knownRoutes = ['/dashboard', '/reseller', '/settings'];
      const isKnownRoute = knownRoutes.some(route =>
        location.pathname.startsWith(route)
      );

      if (isKnownRoute) {
        navigate('/login', { replace: true }); // Use replace to not add to history
      }
    }
  }, [user, isLoading, navigate, location.pathname, isPublicRoute]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleOpenNotifications = () => {
    // TODO: Implement notification panel
    console.log('Open notifications');
  };

  return (
    <div className="flex h-screen bg-background">
      {isSidebarOpen && user && <Sidebar />}
      <main className="flex-1 overflow-auto min-w-[1008px]">
        <Outlet context={{ onToggleSidebar: handleToggleSidebar, onOpenNotifications: handleOpenNotifications }} />
      </main>
    </div>
  );
}
