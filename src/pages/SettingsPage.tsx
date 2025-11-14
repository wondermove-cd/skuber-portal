import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Plus, Search, Send, X, Pencil, UserX, UserCheck, Trash2, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CreateAccountModal } from '@/components/settings/CreateAccountModal';
import { EditAccountModal } from '@/components/settings/EditAccountModal';
import { addUser, getAllUsers } from '@/lib/mock/auth';
import { UserRole } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

interface DashboardLayoutContext {
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
}

// Mock user accounts data
interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'Super Administrator' | 'Administrator' | 'Editor' | 'Viewer';
  invitationStatus: 'N/A' | 'Accepted' | 'Pending' | 'Rejected';
  createdAt: string;
}

// WonderMove accounts (for wm_admin)
const mockWMAccounts: UserAccount[] = [
  {
    id: '1',
    name: 'Paityn',
    email: 'paityn@wondermove.net',
    role: 'Super Administrator',
    invitationStatus: 'N/A',
    createdAt: '2023.02.21',
  },
  {
    id: '2',
    name: 'Paityn (Me)',
    email: 'paityn@wondermove.net',
    role: 'Administrator',
    invitationStatus: 'Accepted',
    createdAt: '2023.02.21',
  },
  {
    id: '3',
    name: 'kaden',
    email: 'paityn@wondermove.net',
    role: 'Administrator',
    invitationStatus: 'Accepted',
    createdAt: '2023.02.21',
  },
  {
    id: '4',
    name: 'ksodmkd',
    email: 'paityn@wondermove.net',
    role: 'Editor',
    invitationStatus: 'Accepted',
    createdAt: '2023.02.21',
  },
  {
    id: '5',
    name: 'akcmdkkd',
    email: 'paityn@wondermove.net',
    role: 'Editor',
    invitationStatus: 'Pending',
    createdAt: '2023.02.21',
  },
  {
    id: '6',
    name: 'Paityn',
    email: 'paityn@wondermove.net',
    role: 'Editor',
    invitationStatus: 'Pending',
    createdAt: '2023.02.21',
  },
  {
    id: '7',
    name: 'Paityn',
    email: 'paityn@wondermove.net',
    role: 'Editor',
    invitationStatus: 'Pending',
    createdAt: '2023.02.21',
  },
  {
    id: '8',
    name: 'Paityn',
    email: 'paityn@wondermove.net',
    role: 'Editor',
    invitationStatus: 'Accepted',
    createdAt: '2023.02.21',
  },
  {
    id: '9',
    name: 'Paityn',
    email: 'paityn@wondermove.net',
    role: 'Viewer',
    invitationStatus: 'Accepted',
    createdAt: '2023.02.21',
  },
  {
    id: '10',
    name: 'Paityn',
    email: 'paityn@wondermove.net',
    role: 'Viewer',
    invitationStatus: 'Rejected',
    createdAt: '2023.02.21',
  },
];

// Reseller accounts (for reseller_admin)
const mockResellerAccounts: UserAccount[] = [
  {
    id: '1',
    name: 'John Kim',
    email: 'john@megazone.com',
    role: 'Super Administrator',
    invitationStatus: 'N/A',
    createdAt: '2023.01.15',
  },
  {
    id: '2',
    name: 'Admin (Me)',
    email: 'admin@megazone.com',
    role: 'Administrator',
    invitationStatus: 'Accepted',
    createdAt: '2023.01.20',
  },
  {
    id: '3',
    name: 'Sarah Lee',
    email: 'sarah@megazone.com',
    role: 'Editor',
    invitationStatus: 'Accepted',
    createdAt: '2023.02.10',
  },
  {
    id: '4',
    name: 'Michael Park',
    email: 'michael@megazone.com',
    role: 'Editor',
    invitationStatus: 'Pending',
    createdAt: '2023.03.05',
  },
  {
    id: '5',
    name: 'Emma Choi',
    email: 'emma@megazone.com',
    role: 'Viewer',
    invitationStatus: 'Accepted',
    createdAt: '2023.03.15',
  },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const { onToggleSidebar, onOpenNotifications } = useOutletContext<DashboardLayoutContext>();

  // Initialize language from i18n
  const [language, setLanguage] = useState(i18n.language === 'ko' ? 'Korean' : 'English');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync language state with i18n language changes
  useEffect(() => {
    const currentLang = i18n.language === 'ko' ? 'Korean' : 'English';
    if (language !== currentLang) {
      setLanguage(currentLang);
    }
  }, [i18n.language]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [createAccountOpen, setCreateAccountOpen] = useState(false);
  const [editAccountOpen, setEditAccountOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<UserAccount | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<UserAccount | null>(null);

  // Only show Account tab for admin roles
  const isAdmin = user?.role === 'wm_admin' || user?.role === 'reseller_admin';

  // Determine which mock data to use based on user role
  const isResellerUser = user?.role?.startsWith('reseller_');
  const initialAccounts = isResellerUser ? mockResellerAccounts : mockWMAccounts;

  const [accounts, setAccounts] = useState<UserAccount[]>(initialAccounts);
  const [sortColumn, setSortColumn] = useState<'name' | 'role' | 'createdAt' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState('profile');

  // Check if current user is Super Administrator
  const currentUserAccount = accounts.find((account) => account.name.includes('(Me)'));
  const isSuperAdmin = currentUserAccount?.role === 'Super Administrator';

  // Get user initials for avatar
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'wm_admin':
        return 'Administrator';
      case 'wm_editor':
        return 'Editor';
      case 'wm_viewer':
        return 'Viewer';
      default:
        return role;
    }
  };

  // Handle create new account
  const handleCreateAccount = (newAccount: {
    email: string;
    name: string;
    role: UserRole;
    resellerId?: string;
    resellerName?: string;
  }) => {
    try {
      // Add user to the mock authentication system
      const createdUser = addUser({
        email: newAccount.email,
        name: newAccount.name,
        role: newAccount.role,
        resellerId: newAccount.resellerId,
        resellerName: newAccount.resellerName,
      });

      // Map role to display format for the accounts table
      const roleDisplayMap: Record<string, 'Administrator' | 'Editor' | 'Viewer'> = {
        wm_admin: 'Administrator',
        wm_editor: 'Editor',
        wm_viewer: 'Viewer',
        reseller_admin: 'Administrator',
        reseller_editor: 'Editor',
        reseller_viewer: 'Viewer',
      };

      // Add to local accounts state for display
      const account: UserAccount = {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: roleDisplayMap[createdUser.role] || 'Viewer',
        invitationStatus: 'Pending',
        createdAt: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      };

      // Add new account to the list
      const updatedAccounts = [...accounts, account];
      setAccounts(updatedAccounts);

      // Reset to first page to show the new account
      setCurrentPage(1);

      toast({
        title: 'Account created successfully',
        description: `${createdUser.name} has been added with ${roleDisplayMap[createdUser.role]} permissions.`,
      });

      console.log('Account created:', account);
      console.log('Total accounts:', updatedAccounts.length);
    } catch (error) {
      toast({
        title: 'Failed to create account',
        description: 'An error occurred while creating the account. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle delete account
  const confirmDelete = () => {
    if (deleteConfirm) {
      // Remove account from the list
      setAccounts(accounts.filter((account) => account.id !== deleteConfirm.id));

      toast({
        title: 'Account deleted successfully',
        description: `${deleteConfirm.name} has been removed.`,
      });

      setDeleteConfirm(null);
    }
  };

  // Handle edit account
  const handleEditAccount = (updatedAccount: {
    id: string;
    name: string;
    role: UserRole;
  }) => {
    try {
      // Map role to display format for the accounts table
      const roleDisplayMap: Record<string, 'Administrator' | 'Editor' | 'Viewer'> = {
        wm_admin: 'Administrator',
        wm_editor: 'Editor',
        wm_viewer: 'Viewer',
        reseller_admin: 'Administrator',
        reseller_editor: 'Editor',
        reseller_viewer: 'Viewer',
      };

      // Update the account in the local state
      setAccounts(
        accounts.map((account) =>
          account.id === updatedAccount.id
            ? {
                ...account,
                name: updatedAccount.name,
                role: roleDisplayMap[updatedAccount.role] || account.role,
              }
            : account
        )
      );

      toast({
        title: 'Account updated successfully',
        description: `${updatedAccount.name}'s account has been updated.`,
      });
    } catch (error) {
      toast({
        title: 'Failed to update account',
        description: 'An error occurred while updating the account. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle sort
  const handleSort = (column: 'name' | 'role' | 'createdAt') => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column with ascending by default
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filter accounts based on search
  const filteredAccounts = accounts.filter((account) =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort accounts with pinned items at top
  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    // Pin Super Administrator and (Me) at the top
    const aIsPinned = a.role === 'Super Administrator' || a.name.includes('(Me)');
    const bIsPinned = b.role === 'Super Administrator' || b.name.includes('(Me)');

    if (aIsPinned && !bIsPinned) return -1;
    if (!aIsPinned && bIsPinned) return 1;
    if (aIsPinned && bIsPinned) {
      // Super Administrator comes first among pinned items
      if (a.role === 'Super Administrator' && b.role !== 'Super Administrator') return -1;
      if (a.role !== 'Super Administrator' && b.role === 'Super Administrator') return 1;
      return 0;
    }

    // Sort non-pinned items
    if (!sortColumn) return 0;

    let comparison = 0;
    if (sortColumn === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortColumn === 'role') {
      const roleOrder = { 'Administrator': 1, 'Editor': 2, 'Viewer': 3 };
      comparison = (roleOrder[a.role] || 999) - (roleOrder[b.role] || 999);
    } else if (sortColumn === 'createdAt') {
      comparison = a.createdAt.localeCompare(b.createdAt);
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedAccounts.length / rowsPerPage);
  const paginatedAccounts = sortedAccounts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <>
      <Header
        onToggleSidebar={onToggleSidebar}
        onOpenNotifications={onOpenNotifications}
      />

      <div className="flex flex-col gap-8 p-8 overflow-auto">
        {/* Header with Tabs */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">{t('settings.title')}</h1>

          {isAdmin && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
              <TabsList className="grid w-full grid-cols-2 bg-muted p-[3px] h-9">
                <TabsTrigger value="profile" className="text-sm font-medium">
                  {t('settings.profile')}
                </TabsTrigger>
                <TabsTrigger value="account" className="text-sm font-medium">
                  {t('settings.account')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>

        {/* Profile Tab Content - Always visible */}
        {activeTab === 'profile' && (
          <div className="border border-border rounded-xl bg-card p-8">
            <div className="flex flex-col gap-8">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 bg-muted">
                  <AvatarFallback className="text-sm font-normal">
                    {user?.name ? getInitials(user.name) : 'CN'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col leading-none text-sm">
                  <p className="font-medium text-foreground overflow-ellipsis overflow-hidden leading-5">
                    {user?.name || 'Paityn'}
                  </p>
                  <p className="font-normal text-muted-foreground overflow-ellipsis overflow-hidden leading-5">
                    {getRoleDisplayName(user?.role || '')}
                  </p>
                </div>
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="email" className="text-sm font-medium leading-5">
                  {t('settings.email')}
                </Label>
                <Input
                  id="email"
                  value={user?.email || 'violet@wondermove.net'}
                  disabled
                  className="h-9 w-[433px] opacity-50 cursor-not-allowed"
                />
              </div>

              <Separator />

              {/* Language Selector */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="language" className="text-sm font-medium leading-none">
                  {t('settings.language')}
                </Label>
                <Select
                  value={language}
                  onValueChange={(value) => {
                    setLanguage(value);
                    // Change i18n language
                    i18n.changeLanguage(value === 'Korean' ? 'ko' : 'en');
                    toast({
                      title: t('toast.success'),
                      description: `Language changed to ${value}`,
                    });
                  }}
                >
                  <SelectTrigger className="h-9 w-[228px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">
                      <div className="flex items-center gap-2">
                        🇺🇸 {t('settings.english')}
                      </div>
                    </SelectItem>
                    <SelectItem value="Korean">
                      <div className="flex items-center gap-2">
                        🇰🇷 {t('settings.korean')}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm font-normal leading-5 text-muted-foreground">
                  {t('settings.languageDesc')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Account Tab Content - Admin only */}
        {activeTab === 'account' && isAdmin && (
          <div className="flex flex-col gap-4">
            {/* Search and Create Button */}
            <div className="flex items-center justify-between">
              {/* Search */}
              <div className="flex items-center w-full max-w-[320px] h-9 border border-input rounded-md bg-card">
                <Input
                  placeholder={t('settings.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 rounded-l-md h-full focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <button
                  type="button"
                  className="flex items-center justify-center h-full w-9 shrink-0 hover:bg-accent transition-colors rounded-r-md"
                >
                  <Search className="w-4 h-4 text-foreground" />
                </button>
              </div>

              <Button
                className="h-9 px-3 text-xs gap-2"
                onClick={() => setCreateAccountOpen(true)}
              >
                <Plus className="w-4 h-4" />
                {t('settings.createNewAccount')}
              </Button>
            </div>

            {/* Accounts Table */}
            <div className="border border-border rounded-lg bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:!bg-muted/50">
                    <TableHead className="font-medium w-[50px]"></TableHead>
                    <TableHead className="font-medium">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        {t('settings.name')}
                        {sortColumn === 'name' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-4 h-4" />
                          ) : (
                            <ArrowDown className="w-4 h-4" />
                          )
                        ) : (
                          <ArrowUpDown className="w-4 h-4 opacity-50" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="font-medium">
                      <button
                        onClick={() => handleSort('role')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        {t('settings.role')}
                        {sortColumn === 'role' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-4 h-4" />
                          ) : (
                            <ArrowDown className="w-4 h-4" />
                          )
                        ) : (
                          <ArrowUpDown className="w-4 h-4 opacity-50" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="font-medium">{t('settings.email')}</TableHead>
                    <TableHead className="font-medium">{t('settings.invitationStatus')}</TableHead>
                    <TableHead className="font-medium">
                      <button
                        onClick={() => handleSort('createdAt')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        {t('common.createdAt')}
                        {sortColumn === 'createdAt' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-4 h-4" />
                          ) : (
                            <ArrowDown className="w-4 h-4" />
                          )
                        ) : (
                          <ArrowUpDown className="w-4 h-4 opacity-50" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="font-medium w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAccounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-[400px]">
                        <div className="flex items-center justify-center h-full">
                          <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                              <Search className="w-6 h-6 text-foreground" />
                            </div>
                            <div className="flex flex-col gap-2">
                              <p className="text-lg font-medium text-foreground leading-7">{t('common.noResults')}</p>
                              <p className="text-sm text-muted-foreground leading-[1.625]">
                                {searchQuery
                                  ? t('common.noResultsDesc')
                                  : t('settings.noAccountsAvailable')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedAccounts.map((account) => (
                      <TableRow key={account.id} className="h-14">
                      <TableCell>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-sm">
                            {getInitials(account.name.replace(' (Me)', ''))}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-normal">
                        <div className="flex items-center gap-2">
                          <span>{account.name.replace(' (Me)', '')}</span>
                          {account.name.includes('(Me)') && (
                            <Badge variant="secondary" className="text-xs">
                              {t('settings.me')}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-normal">{account.role}</TableCell>
                      <TableCell className="font-normal">{account.email}</TableCell>
                      <TableCell className="font-normal">{account.invitationStatus}</TableCell>
                      <TableCell className="font-normal">{account.createdAt}</TableCell>
                      <TableCell>
                        {/* Hide more menu for Super Administrator if current user is not Super Admin */}
                        {account.role === 'Super Administrator' && !isSuperAdmin ? (
                          <div className="h-8 w-8" />
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {/* Resend Invitation - for Pending or Rejected status */}
                              {(account.invitationStatus === 'Pending' || account.invitationStatus === 'Rejected') && (
                                <DropdownMenuItem>
                                  <Send className="mr-2 h-4 w-4" />
                                  {t('settings.resendInvitation')}
                                </DropdownMenuItem>
                              )}
                              {/* Cancel Invitation - only for Pending status */}
                              {account.invitationStatus === 'Pending' && (
                                <DropdownMenuItem>
                                  <X className="mr-2 h-4 w-4" />
                                  {t('settings.cancelInvitation')}
                                </DropdownMenuItem>
                              )}
                              {/* Edit - Permission rules:
                                  - Super Admin: can edit anyone
                                  - Regular Admin: can edit everyone (including other Admins)
                              */}
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedAccount(account);
                                  setEditAccountOpen(true);
                                }}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                {t('common.edit')}
                              </DropdownMenuItem>
                              {/* Delegate Authority - only visible to Super Administrator for other accounts */}
                              {isSuperAdmin && !account.name.includes('(Me)') && (
                                <DropdownMenuItem>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  {t('settings.delegateAuthority')}
                                </DropdownMenuItem>
                              )}
                              {/* Delete - Permission rules:
                                  - Super Admin: can delete anyone (including themselves)
                                  - Regular Admin: can delete themselves and non-Admin users (Editor/Viewer)
                                  - Regular Admin: CANNOT delete other Admins or Super Admins
                              */}
                              {(() => {
                                const isMe = account.name.includes('(Me)');
                                const targetIsAdmin = account.role === 'Administrator' || account.role === 'Super Administrator';

                                // Super Admin can delete anyone (including themselves)
                                if (isSuperAdmin) {
                                  return (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() => setDeleteConfirm(account)}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        {t('common.delete')}
                                      </DropdownMenuItem>
                                    </>
                                  );
                                }

                                // Regular Admin can delete themselves
                                if (isMe) {
                                  return (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() => setDeleteConfirm(account)}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        {t('common.delete')}
                                      </DropdownMenuItem>
                                    </>
                                  );
                                }

                                // Regular Admin cannot delete other Admins
                                if (targetIsAdmin) return null;

                                // Regular Admin can delete non-Admin users
                                return (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      variant="destructive"
                                      onClick={() => setDeleteConfirm(account)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      {t('common.delete')}
                                    </DropdownMenuItem>
                                  </>
                                );
                              })()}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t('settings.rowsPerPage')}</span>
                <Select
                  value={rowsPerPage.toString()}
                  onValueChange={(value) => setRowsPerPage(Number(value))}
                >
                  <SelectTrigger className="h-9 w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {t('settings.page')} {currentPage} {t('settings.of')} {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    «
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    ‹
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    ›
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    »
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Account Modal */}
      <CreateAccountModal
        open={createAccountOpen}
        onOpenChange={setCreateAccountOpen}
        onSave={handleCreateAccount}
        existingEmails={getAllUsers().map((u) => u.email)}
      />

      {/* Edit Account Modal */}
      <EditAccountModal
        open={editAccountOpen}
        onOpenChange={setEditAccountOpen}
        onSave={handleEditAccount}
        account={selectedAccount}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.deleteAccount')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('settings.deleteAccountConfirm')}{' '}
              <strong>{deleteConfirm?.name.replace(' (Me)', '')}</strong>?
              <br /><br />
              {t('settings.deleteAccountDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
