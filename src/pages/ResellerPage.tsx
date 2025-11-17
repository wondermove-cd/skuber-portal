import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Search, Download, Plus, MoreVertical, StickyNote, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, Send, Filter, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { mockResellers, Reseller } from '@/lib/mock/resellers';
import { CustomerNote } from '@/lib/mock/customers';
import { AddNoteModal } from '@/components/customers/AddNoteModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddResellerModal } from '@/components/reseller/AddResellerModal';

interface DashboardLayoutContext {
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
}

export function ResellerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { onToggleSidebar, onOpenNotifications } = useOutletContext<DashboardLayoutContext>();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Permission check - WM users only (all WM roles)
  useEffect(() => {
    if (!user?.role || !user.role.startsWith('wm_')) {
      navigate('/403');
    }
  }, [user, navigate]);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<'name' | 'customerCount' | 'contractCount' | 'invitationStatus' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resellerToDelete, setResellerToDelete] = useState<Reseller | null>(null);
  const [addResellerModalOpen, setAddResellerModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteResellerId, setNoteResellerId] = useState<string>('');

  // Filter states
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterInvitationStatus, setFilterInvitationStatus] = useState<string>('all');
  const [tempFilterInvitationStatus, setTempFilterInvitationStatus] = useState<string>('all');

  // Initialize resellers from localStorage merged with mockResellers
  const [resellers, setResellers] = useState<Reseller[]>(() => {
    const stored = localStorage.getItem('resellers');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        // Create a map of stored resellers by ID
        const storedMap = new Map(parsed.map((r: Reseller) => [r.id, r]));

        // Merge: Update mock resellers data and add any user-created resellers
        const mockIds = new Set(mockResellers.map(r => r.id));
        const userCreated = parsed.filter((r: Reseller) => !mockIds.has(r.id));

        // Use mockResellers as base (always up-to-date) and add user-created ones
        return [...mockResellers, ...userCreated].map((reseller: any) => ({
          ...reseller,
          invitationStatus: reseller.invitationStatus || 'N/A',
          invitationSentAt: reseller.invitationSentAt || null,
        }));
      } catch (e) {
        console.error('Failed to parse resellers from localStorage:', e);
        return mockResellers;
      }
    }
    return mockResellers;
  });

  // Sync resellers to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('resellers', JSON.stringify(resellers));
  }, [resellers]);

  // Listen for storage changes (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'resellers' && e.newValue) {
        try {
          setResellers(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Failed to parse resellers from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const canAddNote = ['wm_admin', 'wm_staff', 'wm_editor'].includes(user?.role || '');
  const canDelete = user?.role === 'wm_admin';
  const showActionsColumn = user?.role !== 'wm_viewer';

  // Calculate invitation status based on invitationSentAt
  const calculateInvitationStatus = (reseller: Reseller): 'Accepted' | 'Pending' | 'Expired' | 'Canceled' | 'N/A' => {
    // If canceled, return canceled
    if (reseller.invitationStatus === 'Canceled') {
      return 'Canceled';
    }

    // If no invitation sent date, return the stored status
    if (!reseller.invitationSentAt) {
      return reseller.invitationStatus;
    }

    // If already accepted, keep it
    if (reseller.invitationStatus === 'Accepted') {
      return 'Accepted';
    }

    // Parse invitation sent date (format: YYYY. MM. DD)
    const [year, month, day] = reseller.invitationSentAt.split('. ').map(Number);
    const sentDate = new Date(year, month - 1, day);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24));

    // If more than 7 days have passed, mark as expired
    if (daysDiff > 7) {
      return 'Expired';
    }

    // Otherwise, keep as pending
    return 'Pending';
  };

  // Sort handler
  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Filter resellers based on search and filters
  let filteredResellers = resellers.filter((reseller) => {
    const matchesSearch =
      reseller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reseller.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reseller.contactEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesInvitationStatus =
      filterInvitationStatus === 'all' ||
      calculateInvitationStatus(reseller).toLowerCase() === filterInvitationStatus.toLowerCase();

    return matchesSearch && matchesInvitationStatus;
  });

  // Sort resellers
  if (sortBy) {
    filteredResellers = [...filteredResellers].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortBy === 'invitationStatus') {
        // Use calculated invitation status for sorting
        aValue = calculateInvitationStatus(a);
        bValue = calculateInvitationStatus(b);
      } else if (sortBy === 'name') {
        aValue = a[sortBy].toLowerCase();
        bValue = b[sortBy].toLowerCase();
      } else {
        aValue = a[sortBy];
        bValue = b[sortBy];
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (sortOrder === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      } else {
        if (sortOrder === 'asc') {
          return (aValue as number) - (bValue as number);
        } else {
          return (bValue as number) - (aValue as number);
        }
      }
    });
  }

  // Pagination
  const totalPages = Math.ceil(filteredResellers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentResellers = filteredResellers.slice(startIndex, endIndex);

  // Delete handlers
  const handleDeleteClick = (reseller: Reseller) => {
    setResellerToDelete(reseller);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setResellerToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (resellerToDelete) {
      setResellers(resellers.filter((r) => r.id !== resellerToDelete.id));
      toast({
        title: t('toast.deleted'),
        description: t('resellerDetail.resellerDeletedDesc', { name: resellerToDelete.name }),
      });
    }
    setDeleteDialogOpen(false);
    setResellerToDelete(null);
  };

  // Resend invitation handler
  const handleResendInvitation = (reseller: Reseller) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}. ${month}. ${day}`;

    setResellers(resellers.map((r) => {
      if (r.id === reseller.id) {
        return {
          ...r,
          invitationStatus: 'Pending',
          invitationSentAt: formattedDate,
        };
      }
      return r;
    }));

    toast({
      title: t('settings.resendInvitation'),
      description: t('settings.resendInvitation') + ` email has been resent to ${reseller.name}.`,
    });
  };

  // Cancel invitation handler
  const handleCancelInvitation = (reseller: Reseller) => {
    setResellers(resellers.map((r) => {
      if (r.id === reseller.id) {
        return {
          ...r,
          invitationStatus: 'Canceled',
          invitationSentAt: null,
        };
      }
      return r;
    }));

    toast({
      title: t('settings.cancelInvitation'),
      description: `${t('settings.cancelInvitation')} to ${reseller.name} has been canceled.`,
    });
  };

  // Add Note handler
  const handleAddNote = (content: string) => {
    if (!noteResellerId) return;

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}. ${month}. ${day}`;

    const newNote: CustomerNote = {
      id: `note-${Date.now()}`,
      customerId: noteResellerId,
      content,
      author: user?.name || 'Unknown',
      createdAt: formattedDate,
    };

    const existingNotes = JSON.parse(localStorage.getItem('customerNotes') || '[]');
    localStorage.setItem('customerNotes', JSON.stringify([newNote, ...existingNotes]));

    toast({
      title: t('note.noteAdded'),
      description: t('note.noteAddedDesc'),
    });

    setNoteResellerId('');
  };

  // Add Reseller handler
  const handleAddResellerSubmit = (data: {
    name: string;
    contactEmail: string;
    services: string[];
    pricing: any;
    billingEmails: string[];
    note: string;
  }) => {
    // Generate new ID
    const newId = String(Math.max(...resellers.map(r => parseInt(r.id)), 0) + 1);

    // Get current date
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}. ${month}. ${day}`;

    // Log the selected services and pricing for now (will be stored in reseller data structure later)
    console.log('Selected services:', data.services);
    console.log('Pricing configuration:', data.pricing);
    console.log('Billing emails:', data.billingEmails);
    console.log('Note:', data.note);

    // Create new reseller
    const newReseller: Reseller = {
      id: newId,
      name: data.name,
      resellerId: `RES-${year}${month}${day}${newId}`,
      country: 'South Korea',
      businessRegNo: '',
      customerCount: 0,
      contractCount: 0,
      invitationStatus: 'Pending',
      invitationSentAt: formattedDate, // Set invitation sent date when adding via Add Reseller button
      contactPerson: '',
      contactEmail: data.contactEmail,
      createdAt: formattedDate,
      billingEmails: data.billingEmails,
      note: data.note || null,
    };

    // Add to resellers list
    setResellers([newReseller, ...resellers]);

    // Show success toast
    toast({
      title: t('toast.success'),
      description: `${data.name} has been added successfully. ${t('settings.resendInvitation')} email sent.`,
    });
  };

  // Filter dialog handlers
  const handleApplyFilters = () => {
    setFilterInvitationStatus(tempFilterInvitationStatus);
    setFilterDialogOpen(false);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setTempFilterInvitationStatus('all');
    setFilterInvitationStatus('all');
  };

  const handleCancelFilters = () => {
    setTempFilterInvitationStatus(filterInvitationStatus);
    setFilterDialogOpen(false);
  };

  // Export to Excel
  const handleExportToExcel = () => {
    const excelData = filteredResellers.map((reseller) => ({
      'Reseller': reseller.name,
      'Customer Count': reseller.customerCount,
      'Contract Count': reseller.contractCount,
      'Invitation Status': calculateInvitationStatus(reseller),
      'Invitation Sent At': reseller.invitationSentAt || 'N/A',
      'Contact Person': reseller.contactPerson,
      'Contact Person Email': reseller.contactEmail,
      'Note': reseller.note || 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const columnWidths = [
      { wch: 30 }, // Reseller
      { wch: 15 }, // Customer Count
      { wch: 15 }, // Contract Count
      { wch: 18 }, // Invitation Status
      { wch: 18 }, // Invitation Sent At
      { wch: 20 }, // Contact Person
      { wch: 30 }, // Contact Person Email
      { wch: 40 }, // Note
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resellers');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `resellers_${timestamp}.xlsx`;

    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <Header
        onToggleSidebar={onToggleSidebar}
        onOpenNotifications={onOpenNotifications}
      />

      <div className="flex-1 p-8 overflow-auto">
        {/* Page Title */}
        <h1 className="text-2xl font-semibold text-foreground mb-6">{t('resellers.title')}</h1>

        {/* Search and Actions Bar */}
        <div className="flex items-center justify-between mb-4">
          {/* Search */}
          <div className="flex items-center w-full max-w-[320px] h-9 border border-input rounded-md bg-card">
            <Input
              placeholder={t('common.search') + '...'}
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

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Filter */}
            <div className="relative">
              <Button
                variant="outline"
                className="h-9 px-3 text-xs gap-2 bg-card"
                onClick={() => {
                  setTempFilterInvitationStatus(filterInvitationStatus);
                  setFilterDialogOpen(true);
                }}
              >
                <Filter className="w-4 h-4" />
                {t('common.filter')}
              </Button>
              {filterInvitationStatus !== 'all' && (
                <Badge
                  variant="default"
                  className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center rounded-full px-1 text-xs"
                >
                  1
                </Badge>
              )}
            </div>

            {/* Export to Excel */}
            <Button variant="outline" className="h-9 px-3 text-xs gap-2 bg-card" onClick={handleExportToExcel}>
              <Download className="w-4 h-4" />
              {t('common.exportToExcel')}
            </Button>

            {/* Add Reseller */}
            {canAddNote && (
              <Button
                className="h-9 px-3 text-xs gap-2"
                onClick={() => setAddResellerModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                {t('resellers.addReseller')}
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="bg-muted/50 hover:!bg-muted/50">
                <TableHead className="font-medium w-[22%]">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1"
                  >
                    {t('resellers.resellerName')}
                    {sortBy === 'name' ? (
                      sortOrder === 'asc' ? (
                        <ArrowUp className="w-3 h-3" />
                      ) : (
                        <ArrowDown className="w-3 h-3" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="font-medium w-[10%]">
                  <button
                    onClick={() => handleSort('customerCount')}
                    className="flex items-center gap-1"
                  >
                    {t('resellers.customerCount')}
                    {sortBy === 'customerCount' ? (
                      sortOrder === 'asc' ? (
                        <ArrowUp className="w-3 h-3" />
                      ) : (
                        <ArrowDown className="w-3 h-3" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="font-medium w-[10%]">
                  <button
                    onClick={() => handleSort('contractCount')}
                    className="flex items-center gap-1"
                  >
                    {t('resellers.contractCount')}
                    {sortBy === 'contractCount' ? (
                      sortOrder === 'asc' ? (
                        <ArrowUp className="w-3 h-3" />
                      ) : (
                        <ArrowDown className="w-3 h-3" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="font-medium w-[13%]">
                  <button
                    onClick={() => handleSort('invitationStatus')}
                    className="flex items-center gap-1"
                  >
                    {t('resellers.invitationStatus')}
                    {sortBy === 'invitationStatus' ? (
                      sortOrder === 'asc' ? (
                        <ArrowUp className="w-3 h-3" />
                      ) : (
                        <ArrowDown className="w-3 h-3" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="font-medium w-[13%]">{t('common.contactPerson')}</TableHead>
                <TableHead className="font-medium w-[18%]">{t('common.contactPersonEmail')}</TableHead>
                <TableHead className="font-medium w-[10%]">{t('note.title')}</TableHead>
                {showActionsColumn && <TableHead className="w-[4%]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentResellers.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={showActionsColumn ? 8 : 7} className="h-[400px]">
                    <div className="flex flex-col items-center justify-center gap-6 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                          <Search className="w-6 h-6 text-foreground" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <p className="text-lg font-medium text-foreground leading-7">{t('common.noResults')}</p>
                          <p className="text-sm text-muted-foreground leading-[1.625]">
                            {t('common.noResultsDesc')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentResellers.map((reseller) => (
                  <TableRow
                    key={reseller.id}
                    className="h-14 cursor-pointer"
                    onClick={() => navigate(`/reseller/${reseller.id}`)}
                  >
                    <TableCell className="font-medium overflow-hidden text-ellipsis whitespace-nowrap pr-2">
                      {reseller.name}
                    </TableCell>
                    <TableCell className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {reseller.customerCount}
                    </TableCell>
                    <TableCell className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {reseller.contractCount}
                    </TableCell>
                    <TableCell className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {calculateInvitationStatus(reseller)}
                    </TableCell>
                    <TableCell className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {reseller.contactPerson}
                    </TableCell>
                    <TableCell className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {reseller.contactEmail}
                    </TableCell>
                    <TableCell className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                      {reseller.note ? reseller.note : <span className="text-muted-foreground">N/A</span>}
                    </TableCell>
                    {showActionsColumn && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-accent ml-auto">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {/* Resend Invitation - for Expired, Pending, or Canceled status */}
                            {canAddNote && (calculateInvitationStatus(reseller) === 'Expired' || calculateInvitationStatus(reseller) === 'Pending' || calculateInvitationStatus(reseller) === 'Canceled') && (
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleResendInvitation(reseller);
                              }}>
                                <Send className="mr-2 h-4 w-4" />
                                {t('settings.resendInvitation')}
                              </DropdownMenuItem>
                            )}
                            {/* Cancel Invitation - only for Pending status */}
                            {canAddNote && calculateInvitationStatus(reseller) === 'Pending' && (
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleCancelInvitation(reseller);
                              }}>
                                <X className="mr-2 h-4 w-4" />
                                {t('settings.cancelInvitation')}
                              </DropdownMenuItem>
                            )}
                            {canAddNote && (
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setNoteResellerId(reseller.id);
                                setNoteModalOpen(true);
                              }}>
                                <StickyNote className="mr-2 h-4 w-4" />
                                {t('note.addNote')}
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <>
                                {canAddNote && <DropdownMenuSeparator />}
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(reseller);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t('common.delete')}
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {currentResellers.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <span>{t('settings.rowsPerPage')}</span>
              <Select
                value={String(rowsPerPage)}
                onValueChange={(value) => {
                  setRowsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-20 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-8">
              <span className="text-sm text-foreground font-medium">
                {t('settings.page')} {currentPage} {t('settings.of')} {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 disabled:opacity-50"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 disabled:opacity-50"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 disabled:opacity-50"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 disabled:opacity-50"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border p-6 rounded-lg gap-4">
          <AlertDialogHeader className="gap-2">
            <AlertDialogTitle className="text-lg font-semibold text-foreground">
              {t('resellers.deleteReseller')}
            </AlertDialogTitle>
            <AlertDialogDescription
              className="text-sm text-muted-foreground"
              dangerouslySetInnerHTML={{
                __html: t('resellers.deleteResellerDesc', { name: resellerToDelete?.name || '' })
              }}
            />
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 justify-end">
            <AlertDialogCancel
              onClick={handleDeleteCancel}
              className="h-9 px-4 py-2 text-sm font-medium rounded-md bg-secondary border border-border text-secondary-foreground hover:bg-accent transition-colors"
            >
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="h-9 px-4 py-2 text-sm font-medium rounded-md bg-destructive text-white hover:bg-destructive/90 transition-colors"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="sm:max-w-[425px] gap-6">
          <DialogHeader className="gap-1.5">
            <DialogTitle className="text-lg font-semibold leading-none">{t('common.filter')}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* Invitation Status Filter */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-foreground">{t('resellers.invitationStatus')}</label>
              <Select value={tempFilterInvitationStatus} onValueChange={setTempFilterInvitationStatus}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder={t('common.all')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  <SelectItem value="accepted">{t('status.accepted')}</SelectItem>
                  <SelectItem value="pending">{t('status.pending')}</SelectItem>
                  <SelectItem value="expired">{t('status.expired')}</SelectItem>
                  <SelectItem value="canceled">{t('status.canceled')}</SelectItem>
                  <SelectItem value="n/a">N/A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <Button variant="outline" onClick={handleResetFilters}>
              {t('common.reset')}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancelFilters}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleApplyFilters}>{t('common.apply')}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Reseller Modal */}
      <AddResellerModal
        open={addResellerModalOpen}
        onOpenChange={setAddResellerModalOpen}
        onSubmit={handleAddResellerSubmit}
      />

      {/* Add Note Modal */}
      <AddNoteModal
        open={noteModalOpen}
        onOpenChange={(open) => {
          setNoteModalOpen(open);
          if (!open) {
            setTimeout(() => setNoteResellerId(''), 200);
          }
        }}
        onAddNote={handleAddNote}
      />
    </div>
  );
}
