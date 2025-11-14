import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Download, Plus, MoreVertical, FileText, StickyNote, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, UserRound, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import * as XLSX from 'xlsx';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Customer } from '@/lib/mock/customers';
import {
  getAllCustomers,
  saveCustomer,
  deleteCustomer,
  saveCustomerNote,
  getCustomerContracts,
} from '@/lib/data-store';
import { COUNTRIES } from '@/lib/constants/countries';
import { validateBusinessRegNo } from '@/lib/utils/validators';
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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { AddContractModal } from '@/components/contracts/AddContractModal';
import { AddNoteModal } from '@/components/customers/AddNoteModal';
import { CustomerNote } from '@/lib/mock/customers';

interface DashboardLayoutContext {
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
}

export function CustomersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { onToggleSidebar, onOpenNotifications } = useOutletContext<DashboardLayoutContext>();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteConfirm, setDeleteConfirm] = useState<Customer | null>(null);
  const [deleteError, setDeleteError] = useState<{ customer: Customer; contractCount: number } | null>(null);
  const [sortBy, setSortBy] = useState<'companyName' | 'createdAt' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [appliedServices, setAppliedServices] = useState<string[]>([]);
  const [addCustomerDialogOpen, setAddCustomerDialogOpen] = useState(false);
  const [customerFormData, setCustomerFormData] = useState({
    countryCode: 'KR', // Default to South Korea
    companyName: '',
    businessRegNo: '',
    ceoName: '',
    contactPerson: '',
    contactEmail: '',
    note: '',
  });
  const [formErrors, setFormErrors] = useState<{
    countryCode?: string;
    companyName?: string;
    businessRegNo?: string;
    ceoName?: string;
    contactPerson?: string;
    contactEmail?: string;
  }>({});
  const [addContractAfter, setAddContractAfter] = useState(true);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [contractCustomerId, setContractCustomerId] = useState<string>('');
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteCustomerId, setNoteCustomerId] = useState<string>('');

  // Initialize customers from data store
  const [customers, setCustomers] = useState<Customer[]>(() => getAllCustomers());

  // Function to reload customers from data store
  const reloadCustomers = () => {
    setCustomers(getAllCustomers());
  };

  // Listen for localStorage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'customers' && e.newValue) {
        reloadCustomers();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Reload customers when contract modal closes
  useEffect(() => {
    if (!contractModalOpen) {
      reloadCustomers();
    }
  }, [contractModalOpen]);

  // Permission checks
  const canDelete = user?.role === 'wm_admin';
  const canAdd = user?.role === 'wm_admin' || user?.role === 'wm_editor' || user?.role === 'reseller_admin' || user?.role === 'reseller_editor';
  const canEdit = user?.role === 'wm_admin' || user?.role === 'wm_editor' || user?.role === 'reseller_admin' || user?.role === 'reseller_editor';
  const isResellerUser = user?.role.startsWith('reseller_');

  // Actions column visibility (hide for viewers)
  const showActionsColumn = user?.role !== 'wm_viewer' && user?.role !== 'reseller_viewer';

  // More actions permissions
  const canAddContract = ['wm_admin', 'wm_editor', 'reseller_admin', 'reseller_editor'].includes(user?.role || '');
  const canAddNote = ['wm_admin', 'wm_editor', 'reseller_admin', 'reseller_editor'].includes(user?.role || '');

  // Sort handler
  const handleSort = (column: 'companyName' | 'createdAt') => {
    if (sortBy === column) {
      // Toggle between asc, desc, and no sort
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        setSortBy(null);
        setSortOrder('asc');
      }
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Filter handlers
  const handleFilterOpen = () => {
    setSelectedServices(appliedServices);
    setFilterDialogOpen(true);
  };

  const handleFilterClose = () => {
    setFilterDialogOpen(false);
  };

  const handleFilterReset = () => {
    setSelectedServices([]);
  };

  const handleFilterApply = () => {
    setAppliedServices(selectedServices);
    setFilterDialogOpen(false);
    setCurrentPage(1);
  };

  const handleServiceToggle = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  // Get selected country
  const selectedCountry = COUNTRIES.find((c) => c.code === customerFormData.countryCode);

  // Add Customer validation functions
  const validateField = (field: keyof typeof customerFormData, value: string): string | undefined => {
    switch (field) {
      case 'countryCode':
        if (!value) return 'Country is required';
        return undefined;

      case 'companyName':
        if (!value.trim()) return 'Company name is required';
        if (value.trim().length < 2) return 'Company name must be at least 2 characters';
        return undefined;

      case 'businessRegNo':
        const validation = validateBusinessRegNo(customerFormData.countryCode, value);
        return validation.error;

      case 'ceoName':
        if (!value.trim()) return 'CEO/Representative name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return undefined;

      case 'contactPerson':
        if (!value.trim()) return 'Contact person is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return undefined;

      case 'contactEmail':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return undefined;

      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof formErrors = {};

    Object.keys(customerFormData).forEach((key) => {
      const field = key as keyof typeof customerFormData;
      const error = validateField(field, customerFormData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add Customer handlers
  const handleAddCustomerOpen = () => {
    setCustomerFormData({
      countryCode: 'KR',
      companyName: '',
      businessRegNo: '',
      ceoName: '',
      contactPerson: '',
      contactEmail: '',
      note: '',
    });
    setFormErrors({});
    setAddContractAfter(true);
    setAddCustomerDialogOpen(true);
  };

  const handleAddCustomerClose = () => {
    setAddCustomerDialogOpen(false);
    setFormErrors({});
  };

  const handleCustomerInputChange = (field: string, value: string) => {
    setCustomerFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof typeof formErrors];
        return newErrors;
      });
    }
  };

  const handleFieldBlur = (field: keyof typeof customerFormData) => {
    const error = validateField(field, customerFormData[field]);
    if (error) {
      setFormErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const isCustomerFormValid = () => {
    return (
      customerFormData.countryCode !== '' &&
      customerFormData.companyName.trim() !== '' &&
      customerFormData.businessRegNo.trim() !== '' &&
      customerFormData.ceoName.trim() !== '' &&
      customerFormData.contactPerson.trim() !== '' &&
      customerFormData.contactEmail.trim() !== '' &&
      Object.keys(formErrors).length === 0
    );
  };

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Create new customer
    const newCustomer: Customer = {
      id: `customer-${Date.now()}`,
      companyName: customerFormData.companyName,
      businessRegNo: customerFormData.businessRegNo,
      services: [], // Empty services initially
      contactPerson: customerFormData.contactPerson,
      email: customerFormData.contactEmail,
      country: selectedCountry?.name || customerFormData.countryCode,
      ceo: customerFormData.ceoName,
      createdAt: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      createdAtTimestamp: Date.now(),
      resellerId: isResellerUser ? user?.resellerId : undefined, // Set resellerId for reseller users
    };

    // Save to data store
    saveCustomer(newCustomer);
    reloadCustomers();

    // Show success toast
    toast({
      title: 'Success',
      description: 'Customer created successfully',
    });

    setAddCustomerDialogOpen(false);

    if (addContractAfter) {
      // Open contract modal at step 3 with the new customer
      setContractCustomerId(newCustomer.id);
      setContractModalOpen(true);
    }
  };

  // Handler for adding customer from within AddContractModal
  const handleAddCustomerFromContract = (customer: Omit<Customer, 'id' | 'createdAt' | 'services' | 'resellerId'>) => {
    // Note: Customer is already saved in AddContractModal via saveCustomer
    // This handler is just for reloading data
    reloadCustomers();

    toast({
      title: 'Success',
      description: 'Customer created successfully',
    });
  };

  // Check if customer is new (created within last 7 days)
  const isNewCustomer = (customer: Customer) => {
    if (!customer.createdAtTimestamp) return false;
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return customer.createdAtTimestamp > sevenDaysAgo;
  };

  // Filter customers based on role, search and service filter
  let filteredCustomers = customers.filter((customer) => {
    // Reseller users can only see their own customers
    const matchesRole = isResellerUser
      ? customer.resellerId === user?.resellerId
      : true; // WM users see all customers

    const matchesSearch =
      customer.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.businessRegNo.includes(searchQuery) ||
      customer.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesService = appliedServices.length === 0 ||
      customer.services.some(service => appliedServices.includes(service));

    return matchesRole && matchesSearch && matchesService;
  });

  // Sort customers
  if (sortBy) {
    filteredCustomers = [...filteredCustomers].sort((a, b) => {
      let aValue: string;
      let bValue: string;

      if (sortBy === 'companyName') {
        aValue = a.companyName.toLowerCase();
        bValue = b.companyName.toLowerCase();
      } else {
        aValue = a.createdAt;
        bValue = b.createdAt;
      }

      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  const handleDelete = (customer: Customer) => {
    const contracts = getCustomerContracts(customer.id);
    const contractCount = contracts.length;

    if (contractCount > 0) {
      setDeleteError({ customer, contractCount });
    } else {
      setDeleteConfirm(customer);
    }
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      // Remove customer from data store
      deleteCustomer(deleteConfirm.id);
      reloadCustomers();

      toast({
        title: 'Success',
        description: `${deleteConfirm.companyName} has been deleted successfully.`,
      });

      setDeleteConfirm(null);
    }
  };

  const handleAddNote = (content: string) => {
    if (!noteCustomerId) return;

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}. ${month}. ${day}`;

    const newNote: CustomerNote = {
      id: `note-${Date.now()}`,
      customerId: noteCustomerId,
      content,
      author: user?.name || 'Unknown',
      createdAt: formattedDate,
    };

    // Save note to data store
    saveCustomerNote(newNote);

    toast({
      title: 'Note Added',
      description: 'Your note has been added successfully',
    });

    setNoteCustomerId('');
  };

  const handleExportToExcel = () => {
    // Prepare data for Excel export
    const excelData = filteredCustomers.map((customer) => ({
      'Company Name': customer.companyName,
      'Business Reg. No.': customer.businessRegNo,
      'Service': customer.services.join(', '),
      'Contact Person': customer.contactPerson,
      'Created At': customer.createdAt,
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 30 }, // Company Name
      { wch: 20 }, // Business Reg. No.
      { wch: 40 }, // Service
      { wch: 20 }, // Contact Person
      { wch: 15 }, // Created At
    ];
    worksheet['!cols'] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `customers_${timestamp}.xlsx`;

    // Download file
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
        <h1 className="text-2xl font-semibold text-foreground mb-6">{t('customers.title')}</h1>

        {/* Search and Actions Bar */}
        <div className="flex items-center justify-between mb-4">
          {/* Search */}
          <div className="flex items-center w-full max-w-[320px] h-9 border border-input rounded-md bg-card">
            <Input
              placeholder={`${t('common.search')}...`}
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
            {/* Filter Button */}
            <div className="relative">
              <Button variant="outline" className="h-9 px-3 text-xs gap-2 bg-card" onClick={handleFilterOpen}>
                <Filter className="w-4 h-4" />
                {t('common.filter')}
              </Button>
              {appliedServices.length > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center rounded-full px-1 text-xs"
                >
                  {appliedServices.length}
                </Badge>
              )}
            </div>

            {/* Export to Excel */}
            <Button variant="outline" className="h-9 px-3 text-xs gap-2 bg-card" onClick={handleExportToExcel}>
              <Download className="w-4 h-4" />
              {t('common.exportToExcel')}
            </Button>

            {/* Add Customer */}
            {canAdd && (
              <Button className="h-9 px-3 text-xs gap-2" onClick={handleAddCustomerOpen}>
                <Plus className="w-4 h-4" />
                {t('customers.addCustomer')}
              </Button>
            )}
          </div>
        </div>

        {/* Table or Empty State */}
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="bg-muted/50 hover:!bg-muted/50">
                <TableHead className="font-medium w-[19%]">
                  <button
                    onClick={() => handleSort('companyName')}
                    className="flex items-center gap-1"
                  >
                    {t('common.companyName')}
                    {sortBy === 'companyName' ? (
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
                <TableHead className="font-medium w-[18%]">{t('common.businessRegNo')}</TableHead>
                <TableHead className="font-medium w-[34%]">{t('common.service')}</TableHead>
                <TableHead className="font-medium w-[16%]">{t('common.contactPerson')}</TableHead>
                <TableHead className="font-medium w-[13%]">
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center gap-1"
                  >
                    {t('common.createdAt')}
                    {sortBy === 'createdAt' ? (
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
                {showActionsColumn && <TableHead className="w-[48px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={showActionsColumn ? 6 : 5} className="h-[400px]">
                    <div className="flex flex-col items-center justify-center gap-6 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                          <UserRound className="w-6 h-6 text-foreground" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <p className="text-lg font-medium text-foreground leading-7">{t('customers.noCustomers')}</p>
                          <p className="text-sm text-muted-foreground leading-[1.625]">
                            {t('customers.noCustomersDesc')}
                          </p>
                        </div>
                      </div>
                      {canAdd && (
                        <div className="flex items-center justify-center">
                          <Button className="h-9 px-4 text-sm gap-2" onClick={handleAddCustomerOpen}>
                            {t('customers.addCustomer')}
                          </Button>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={showActionsColumn ? 6 : 5} className="h-[400px]">
                    <div className="flex flex-col items-center justify-center gap-6 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                          <Search className="w-6 h-6 text-foreground" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <p className="text-lg font-medium text-foreground leading-7">No results found</p>
                          <p className="text-sm text-muted-foreground leading-[1.625]">
                            No results found for your search. Try adjusting your search terms.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentCustomers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="h-14 cursor-pointer hover:bg-accent/50"
                  onClick={() => navigate(`/customers/${customer.id}`)}
                >
                  <TableCell className="font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span>{customer.companyName}</span>
                      {isNewCustomer(customer) && (
                        <Badge variant="default" className="h-4 px-1 text-[10px] font-bold bg-primary">
                          N
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="overflow-hidden text-ellipsis whitespace-nowrap">
                    {customer.businessRegNo}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    {customer.services.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {customer.services.map((service, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-card font-medium">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="overflow-hidden text-ellipsis whitespace-nowrap">
                    {customer.contactPerson}
                  </TableCell>
                  <TableCell className="overflow-hidden text-ellipsis whitespace-nowrap">
                    {customer.createdAt}
                  </TableCell>
                  {showActionsColumn && (
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-accent ml-auto">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canAddContract && (
                            <DropdownMenuItem onClick={() => {
                              setContractCustomerId(customer.id);
                              setContractModalOpen(true);
                            }}>
                              <FileText className="mr-2 h-4 w-4" />
                              {t('customers.addContract')}
                            </DropdownMenuItem>
                          )}
                          {canAddNote && (
                            <DropdownMenuItem onClick={() => {
                              setNoteCustomerId(customer.id);
                              setNoteModalOpen(true);
                            }}>
                              <StickyNote className="mr-2 h-4 w-4" />
                              {t('customers.addNote')}
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => handleDelete(customer)}
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
        {filteredCustomers.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <span className="font-medium">{t('common.rowsPerPage')}</span>
            <Select
              value={rowsPerPage.toString()}
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

      {/* Delete Error Dialog (Has Contracts) */}
      <AlertDialog open={!!deleteError} onOpenChange={() => setDeleteError(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cannot Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteError?.customer.companyName}</strong> has{' '}
              {deleteError?.contractCount} active contract{deleteError?.contractCount !== 1 ? 's' : ''}.
              <br /><br />
              Please delete all contracts first before deleting the customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>OK</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate(`/customers/${deleteError?.customer.id}`)}>
              View Contracts
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog (No Contracts) */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{deleteConfirm?.companyName}</strong>?
              <br /><br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <button
            onClick={handleFilterClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Filter</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-foreground">Service</p>
              <div className="flex flex-col p-1">
                {['Observability', 'Management', 'Optimization'].map((service) => {
                  const isSelected = selectedServices.includes(service);
                  return (
                    <div
                      key={service}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-sm ${
                        isSelected ? 'bg-accent' : ''
                      }`}
                    >
                      <Checkbox
                        id={service}
                        checked={isSelected}
                        onCheckedChange={() => handleServiceToggle(service)}
                      />
                      <label
                        htmlFor={service}
                        className="text-sm flex-1 cursor-pointer select-none"
                      >
                        {service}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <Button variant="outline" className="h-9 px-4 text-sm" onClick={handleFilterReset}>
              Reset
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="h-9 px-4 text-sm" onClick={handleFilterClose}>
                Cancel
              </Button>
              <Button
                className="h-9 px-4 text-sm"
                onClick={handleFilterApply}
              >
                Apply
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog open={addCustomerDialogOpen} onOpenChange={setAddCustomerDialogOpen}>
        <DialogContent className="sm:max-w-[425px] gap-8 p-6">
          <button
            onClick={handleAddCustomerClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <DialogHeader className="gap-1.5">
            <DialogTitle className="text-lg font-semibold leading-none">
              {t('customers.addCustomer')}
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable form area */}
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto px-1">
            <form id="customer-form" onSubmit={handleCustomerSubmit} className="flex flex-col gap-5">
            {/* Company Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="companyName" className="text-sm font-medium">
                {t('customers.companyName')}
              </Label>
              <Input
                id="companyName"
                value={customerFormData.companyName}
                onChange={(e) => handleCustomerInputChange('companyName', e.target.value)}
                onBlur={() => handleFieldBlur('companyName')}
                className="h-9"
                placeholder={t('customers.enterCompanyName')}
                aria-invalid={!!formErrors.companyName}
              />
              {formErrors.companyName && (
                <p className="text-sm text-destructive -mt-1">{formErrors.companyName}</p>
              )}
            </div>

            {/* Country */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="country" className="text-sm font-medium">
                {t('customers.country')}
              </Label>
              <Select
                value={customerFormData.countryCode}
                onValueChange={(value) => {
                  setCustomerFormData((prev) => ({
                    ...prev,
                    countryCode: value,
                    businessRegNo: '',
                  }));
                  if (formErrors.businessRegNo) {
                    setFormErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.businessRegNo;
                      return newErrors;
                    });
                  }
                }}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder={t('common.selectCountry')} />
                </SelectTrigger>
                <SelectContent className="max-h-[240px]">
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.countryCode && (
                <p className="text-sm text-destructive -mt-1">{formErrors.countryCode}</p>
              )}
            </div>

            {/* Business Reg. No. */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="businessRegNo" className="text-sm font-medium">
                {selectedCountry?.businessRegNoLabel || t('customers.businessRegNo')}
              </Label>
              <Input
                id="businessRegNo"
                value={customerFormData.businessRegNo}
                onChange={(e) => handleCustomerInputChange('businessRegNo', e.target.value)}
                onBlur={() => handleFieldBlur('businessRegNo')}
                className="h-9"
                placeholder={selectedCountry?.businessRegNoFormat || ''}
                aria-invalid={!!formErrors.businessRegNo}
              />
              {formErrors.businessRegNo && (
                <p className="text-sm text-destructive -mt-1">{formErrors.businessRegNo}</p>
              )}
            </div>

            {/* CEO / Representative */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="ceoName" className="text-sm font-medium">
                {t('customers.ceo')}
              </Label>
              <Input
                id="ceoName"
                value={customerFormData.ceoName}
                onChange={(e) => handleCustomerInputChange('ceoName', e.target.value)}
                onBlur={() => handleFieldBlur('ceoName')}
                className="h-9"
                placeholder={t('customers.enterCeo')}
                aria-invalid={!!formErrors.ceoName}
              />
              {formErrors.ceoName && (
                <p className="text-sm text-destructive -mt-1">{formErrors.ceoName}</p>
              )}
            </div>

            {/* Contact Person */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="contactPerson" className="text-sm font-medium">
                {t('customers.contactPerson')}
              </Label>
              <Input
                id="contactPerson"
                value={customerFormData.contactPerson}
                onChange={(e) => handleCustomerInputChange('contactPerson', e.target.value)}
                onBlur={() => handleFieldBlur('contactPerson')}
                className="h-9"
                placeholder={t('customers.enterContactPerson')}
                aria-invalid={!!formErrors.contactPerson}
              />
              {formErrors.contactPerson && (
                <p className="text-sm text-destructive -mt-1">{formErrors.contactPerson}</p>
              )}
            </div>

            {/* Contact Person Email */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="contactEmail" className="text-sm font-medium">
                {t('resellers.contactEmail')}
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={customerFormData.contactEmail}
                onChange={(e) => handleCustomerInputChange('contactEmail', e.target.value)}
                onBlur={() => handleFieldBlur('contactEmail')}
                className="h-9"
                placeholder={t('customers.enterEmail')}
                aria-invalid={!!formErrors.contactEmail}
              />
              {formErrors.contactEmail && (
                <p className="text-sm text-destructive -mt-1">{formErrors.contactEmail}</p>
              )}
            </div>

            {/* Note Field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="note" className="text-sm font-medium">
                {t('customers.note')}
              </Label>
              <div className="relative border border-input rounded-md bg-background">
                <Textarea
                  id="note"
                  value={customerFormData.note}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 280) {
                      handleCustomerInputChange('note', value);
                    }
                  }}
                  className="min-h-[120px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 pb-10"
                  placeholder={t('customers.enterNote')}
                />
                <div className="absolute bottom-0 left-0 right-0 px-3 py-3 text-sm text-muted-foreground">
                  {customerFormData.note.length}/280 {t('customers.characters')}
                </div>
              </div>
            </div>
          </form>
          </div>

          {/* Fixed checkbox and footer */}
          <div className="flex items-start gap-2 pt-1 pb-0">
            <Checkbox
              id="add-contract-customer"
              checked={addContractAfter}
              onCheckedChange={(checked) => setAddContractAfter(checked === true)}
            />
            <Label
              htmlFor="add-contract-customer"
              className="text-sm font-medium cursor-pointer select-none"
            >
              {t('common.addContractAfterSaving')}
            </Label>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 sm:justify-end">
            <Button type="button" variant="outline" className="h-9 px-4 text-sm" onClick={handleAddCustomerClose}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              form="customer-form"
              className="h-9 px-4 text-sm"
              disabled={!isCustomerFormValid()}
            >
              {t('common.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Contract Modal */}
      <AddContractModal
        open={contractModalOpen}
        onOpenChange={setContractModalOpen}
        customers={customers}
        onAddCustomer={handleAddCustomerFromContract}
        initialCustomerId={contractCustomerId}
        initialStep={3}
      />

      {/* Add Note Modal */}
      <AddNoteModal
        open={noteModalOpen}
        onOpenChange={(open) => {
          setNoteModalOpen(open);
          if (!open) {
            setTimeout(() => {
              setNoteCustomerId('');
            }, 200);
          }
        }}
        onAddNote={handleAddNote}
      />
    </div>
  );
}
