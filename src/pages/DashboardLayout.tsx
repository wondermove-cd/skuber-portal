import { useEffect, useState, useMemo } from 'react';
import { Outlet, useNavigate, useLocation, matchPath } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { NotificationSheet } from '@/components/layout/NotificationSheet';
import { useAuth } from '@/contexts/AuthContext';

// Mock notifications - in real app, this would come from API/store
const mockNotifications = [
  {
    id: '1',
    description: 'DESCRIPTION',
    pageName: 'Page name',
    timestamp: '32 minute ago · 2023.02.21 11:19:22 (GMT +9)',
    isRead: false,
  },
  {
    id: '2',
    description: 'Your contract with TechPartners Solutions is expiring soon. Please review and renew the contract.',
    pageName: 'Contracts',
    timestamp: '1 hour ago · 2023.02.21 10:45:30 (GMT +9)',
    isRead: false,
  },
  {
    id: '3',
    description: 'New payment received from Alex Buckmaster for contract 240115-CUST001-01. The total amount is $4,024.92 and has been successfully processed.',
    pageName: 'Payments',
    timestamp: '2 hours ago · 2023.02.21 09:30:15 (GMT +9)',
    isRead: true,
  },
  {
    id: '4',
    description: 'DESCRIPTION',
    pageName: 'Page name',
    timestamp: '32 minute ago · 2023.02.21 11:19:22 (GMT +9)',
    isRead: true,
  },
];

export function DashboardLayout() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

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
    setIsNotificationOpen(true);
  };

  // Calculate unread notifications count
  const unreadCount = useMemo(() => {
    return mockNotifications.filter(n => !n.isRead).length;
  }, []);

  return (
    <div className="flex h-screen bg-background">
      {isSidebarOpen && user && <Sidebar />}
      <main className="flex-1 overflow-auto min-w-[1008px]">
        <Outlet context={{ onToggleSidebar: handleToggleSidebar, onOpenNotifications: handleOpenNotifications, unreadCount }} />
      </main>
      <NotificationSheet open={isNotificationOpen} onOpenChange={setIsNotificationOpen} />
    </div>
  );
}
