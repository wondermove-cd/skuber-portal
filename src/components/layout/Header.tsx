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
          className="h-8 px-3 py-2 rounded-md bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        {/* Right side - Notification button */}
        <button
          onClick={onOpenNotifications}
          className="h-8 px-3 py-2 rounded-md bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
        >
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
