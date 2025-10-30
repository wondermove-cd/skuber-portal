import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Store,
  Settings,
  LogOut,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials } from '@/lib/utils/format';

const menuItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Customers',
    path: '/customers',
    icon: Users,
  },
  {
    name: 'Payments',
    path: '/payments',
    icon: DollarSign,
  },
  {
    name: 'Reseller',
    path: '/reseller',
    icon: Store,
  },
  {
    name: 'Setting',
    path: '/setting',
    icon: Settings,
  },
];

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  if (!user) return null;

  const userInitials = getInitials(user.name);

  return (
    <div className="w-60 h-screen bg-background border-r flex flex-col">
      {/* Logo Section */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">SK</span>
          </div>
          <span className="font-semibold text-foreground">Partner Portal</span>
        </div>
      </div>

      <Separator />

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-md text-sm
                    transition-colors
                    ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Separator />

      {/* User Info Section */}
      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors cursor-pointer">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-foreground">
                  {user.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user.email}
                </div>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={logout} className="cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
