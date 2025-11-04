import { PanelLeft, Bell } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenNotifications?: () => void;
}

export function Header({ onToggleSidebar, onOpenNotifications }: HeaderProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-border bg-card">
      <div className="flex items-center justify-between px-6 h-16">
        {/* Left side - Sidebar toggle button */}
        <button
          onClick={onToggleSidebar}
          className="h-8 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-2"
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        {/* Right side - Notification button */}
        <button
          onClick={onOpenNotifications}
          className="h-8 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-2"
        >
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
