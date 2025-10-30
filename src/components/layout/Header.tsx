import { PanelLeft, Bell } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenNotifications?: () => void;
}

export function Header({ onToggleSidebar, onOpenNotifications }: HeaderProps) {
  return (
    <div className="border-b border-zinc-800 bg-black">
      <div className="flex items-center justify-between px-6 h-16">
        {/* Left side - Sidebar toggle button */}
        <button
          onClick={onToggleSidebar}
          className="w-9 h-9 inline-flex items-center justify-center rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        {/* Right side - Notification button */}
        <button
          onClick={onOpenNotifications}
          className="w-9 h-9 inline-flex items-center justify-center rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
