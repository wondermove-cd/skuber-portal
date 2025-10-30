import { PanelLeft, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenNotifications?: () => void;
}

export function Header({ onToggleSidebar, onOpenNotifications }: HeaderProps) {
  return (
    <div className="border-b border-zinc-800 bg-black">
      <div className="flex items-center justify-between px-6 h-20">
        {/* Left side - Sidebar toggle button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="text-zinc-400 hover:text-white hover:bg-zinc-900"
        >
          <PanelLeft className="w-5 h-5" />
        </Button>

        {/* Right side - Notification button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenNotifications}
          className="text-zinc-400 hover:text-white hover:bg-zinc-900"
        >
          <Bell className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
