import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UsersRound,
  FilePenLine,
  DollarSign,
  Handshake,
  Settings,
  LogOut,
} from 'lucide-react';
import logoSvg from '@/asset/Sidebar/logo.svg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials } from '@/lib/utils/format';

const wmMenuItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Customers',
    path: '/customers',
    icon: UsersRound,
  },
  {
    name: 'Contracts',
    path: '/contracts',
    icon: FilePenLine,
  },
  {
    name: 'Payments',
    path: '/payments',
    icon: DollarSign,
  },
  {
    name: 'Reseller',
    path: '/reseller',
    icon: Handshake,
  },
];

const resellerMenuItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Customers',
    path: '/customers',
    icon: UsersRound,
  },
  {
    name: 'Contracts',
    path: '/contracts',
    icon: FilePenLine,
  },
  {
    name: 'My Payments',
    path: '/payments',
    icon: DollarSign,
  },
];

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  if (!user) return null;

  const userInitials = getInitials(user.name);
  const isResellerUser = user.role.startsWith('reseller_');
  const menuItems = isResellerUser ? resellerMenuItems : wmMenuItems;

  const handleLogoutClick = () => {
    setIsLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    setIsLogoutDialogOpen(false);
    logout();
  };

  return (
    <div className="w-60 h-screen bg-card border-r border-border flex flex-col">
      {/* Logo Section */}
      <div className="flex items-center h-16 px-6">
        <img src={logoSvg} alt="Skuber Partner Portal" className="h-8" />
      </div>

      <Separator className="bg-border" />

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
                        ? 'bg-secondary text-secondary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
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

      <Separator className="bg-border" />

      {/* User Info Section */}
      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors cursor-pointer">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-muted text-foreground text-xs">
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
          <DropdownMenuContent align="end" alignOffset={-16} className="w-56 mb-4">
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/setting" className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                <span>Setting</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogoutClick} className="cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent className="bg-card border-border p-6 rounded-lg gap-4">
          <AlertDialogHeader className="gap-2">
            <AlertDialogTitle className="text-lg font-semibold text-foreground">
              Logout
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to logout?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 justify-end">
            <button
              onClick={() => setIsLogoutDialogOpen(false)}
              className="h-9 px-4 py-2 text-sm font-medium rounded-md bg-secondary border border-border text-secondary-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLogoutConfirm}
              className="h-9 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Logout
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
