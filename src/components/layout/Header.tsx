import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onToggleSidebar?: () => void;
  onOpenNotifications?: () => void;
}

export function Header({ title, subtitle, onToggleSidebar, onOpenNotifications }: HeaderProps) {
  return (
    <div className="border-b border-zinc-800 bg-black">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Sidebar toggle button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="text-zinc-400 hover:text-white hover:bg-zinc-900"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-white">{title}</h1>
            {subtitle && (
              <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

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
