import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';

interface DashboardLayoutContext {
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
}

export function ForbiddenPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Try to get context, but it might not exist if outside DashboardLayout
  let context: DashboardLayoutContext | undefined;
  try {
    context = useOutletContext<DashboardLayoutContext>();
  } catch {
    context = undefined;
  }

  const handleBackToDashboard = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  // If context is available (inside DashboardLayout), use it
  const hasContext = context && context.onToggleSidebar && context.onOpenNotifications;

  return (
    <div className="flex flex-col h-full bg-background">
      {hasContext && (
        <Header
          onToggleSidebar={context.onToggleSidebar}
          onOpenNotifications={context.onOpenNotifications}
        />
      )}
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col gap-6 items-center w-[321px]">
          <div className="flex flex-col gap-4 items-center w-full">
            <div className="flex flex-col gap-2 items-center text-center w-full">
              <p className="text-lg font-medium leading-7 text-foreground">
                403 - Forbidden
              </p>
              <p className="text-sm font-normal leading-[1.625] text-muted-foreground">
                You don't have permission to view this page.Please contact your administrator.
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-start justify-center">
            <button
              onClick={handleBackToDashboard}
              className="h-9 px-4 py-2 flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {user ? 'Back to Dashboard' : 'Go to Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
