import { PanelLeft, Bell, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenNotifications?: () => void;
  unreadCount?: number;
}

// Global navigation history tracker
const navigationHistory: string[] = [];
let currentHistoryIndex = -1;

export function Header({ onToggleSidebar, onOpenNotifications, unreadCount = 0 }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    // Track navigation history
    if (!isNavigatingRef.current) {
      // User navigated via link/button, not via back/forward
      const currentPath = location.pathname + location.search;

      // Remove any forward history when navigating to a new page
      navigationHistory.splice(currentHistoryIndex + 1);

      // Add current page to history if it's different from the last entry
      if (navigationHistory[currentHistoryIndex] !== currentPath) {
        navigationHistory.push(currentPath);
        currentHistoryIndex++;
      }
    }

    // Update button states
    const backEnabled = currentHistoryIndex > 0;
    const forwardEnabled = currentHistoryIndex < navigationHistory.length - 1;

    console.log('Navigation state:', {
      currentIndex: currentHistoryIndex,
      historyLength: navigationHistory.length,
      history: navigationHistory,
      canGoBack: backEnabled,
      canGoForward: forwardEnabled,
      isNavigating: isNavigatingRef.current
    });

    setCanGoBack(backEnabled);
    setCanGoForward(forwardEnabled);

    // Reset flag after state updates
    isNavigatingRef.current = false;
  }, [location]);

  const handleBack = () => {
    console.log('Back clicked - currentIndex:', currentHistoryIndex, 'historyLength:', navigationHistory.length);
    if (currentHistoryIndex > 0) {
      isNavigatingRef.current = true;
      currentHistoryIndex--;
      console.log('Going back to index:', currentHistoryIndex);
      navigate(-1);
    }
  };

  const handleForward = () => {
    console.log('Forward clicked - currentIndex:', currentHistoryIndex, 'historyLength:', navigationHistory.length);
    console.log('canGoForward:', currentHistoryIndex < navigationHistory.length - 1);
    console.log('History:', navigationHistory);
    if (currentHistoryIndex < navigationHistory.length - 1) {
      isNavigatingRef.current = true;
      currentHistoryIndex++;
      console.log('Going forward to index:', currentHistoryIndex);
      navigate(1);
    }
  };

  return (
    <div className="sticky top-0 z-10 border-b border-border bg-card">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Left side - Sidebar toggle, Back, Forward buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSidebar}
            className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center justify-center"
            aria-label="Toggle sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleBack}
            disabled={!canGoBack}
            className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleForward}
            disabled={!canGoForward}
            className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
            aria-label="Go forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right side - Notification button */}
        <button
          onClick={onOpenNotifications}
          className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center justify-center relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 flex items-center justify-center p-0 px-1 text-[10px] bg-red-500 hover:bg-red-500">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </button>
      </div>
    </div>
  );
}
