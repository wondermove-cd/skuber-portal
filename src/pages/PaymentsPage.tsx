import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Download, ExternalLink, DollarSign, Check, CheckCircle, Loader, TrendingUp, TrendingDown, Receipt, Calendar as CalendarIcon, Clock, Minus, Copy, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { mockInvoices, Invoice } from '@/lib/mock/invoices';
import { mockResellers } from '@/lib/mock/resellers';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

interface DashboardLayoutContext {
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
}

interface StatisticCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  showTrend?: boolean;
}

function StatisticCard({ title, value, trend, trendUp, icon, showTrend = true }: StatisticCardProps) {
  const { t } = useTranslation();
  return (
    <div className="border border-border rounded-lg p-6 bg-card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-3xl font-semibold">{value}</p>
        {showTrend && trend && (
          <div className="flex items-center gap-1 text-xs">
            {trendUp ? (
              <TrendingUp className="w-3 h-3 text-green-600" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-600" />
            )}
            <span className={trendUp ? 'text-green-600' : 'text-red-600'}>{trend}</span>
            <span className="text-muted-foreground">{t('payments.fromLastMonth')}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function PaymentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { onToggleSidebar, onOpenNotifications } = useOutletContext<DashboardLayoutContext>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Permission check - WM only
  useEffect(() => {
    if (!user?.role.startsWith('wm_')) {
      navigate('/403');
    }
  }, [user, navigate]);

  // Permission helpers
  const canEdit = user?.role === 'wm_editor' || user?.role === 'wm_admin' || user?.role === 'wm_staff';
  const canAccessPrix = user?.role === 'wm_admin';
  const canExport = user?.role === 'wm_editor' || user?.role === 'wm_admin' || user?.role === 'wm_staff' || user?.role === 'wm_viewer';

  // Initialize states from URL parameters
  const initialShowUnpaid = searchParams.get('showUnpaid') === 'true';
  const initialPeriod = searchParams.get('period') === 'all' ? 'all' : '2025. 10';
  const initialResellerId = searchParams.get('reseller') || null;
  const initialCustomerId = searchParams.get('customer') || null;
  const initialContractId = searchParams.get('contract') || null;
  const initialSearch = searchParams.get('search') || '';
  const initialService = searchParams.get('service') || null;

  // If reseller ID is provided in URL, find reseller name for search query
  const initialResellerName = initialResellerId
    ? mockResellers.find(r => r.id === initialResellerId)?.name || ''
    : '';

  const [searchQuery, setSearchQuery] = useState(initialSearch || initialResellerName);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  // Sorting states
  const [sortColumn, setSortColumn] = useState<'date' | 'billedAmount' | 'difference' | 'status' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showOnlyUnpaid, setShowOnlyUnpaid] = useState(initialShowUnpaid);
  const [filterResellerId, setFilterResellerId] = useState<string | null>(initialResellerId);
  const [filterCustomerId, setFilterCustomerId] = useState<string | null>(initialCustomerId);
  const [filterContractId, setFilterContractId] = useState<string | null>(initialContractId);
  const [filterService, setFilterService] = useState<string | null>(initialService);

  // Clear URL parameters after initialization
  useEffect(() => {
    if (searchParams.has('showUnpaid') || searchParams.has('period') || searchParams.has('reseller') || searchParams.has('customer') || searchParams.has('contract') || searchParams.has('search') || searchParams.has('service')) {
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Filter states
  const [filterContractType, setFilterContractType] = useState<string>('all');
  const [filterTax, setFilterTax] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Temp filter states (for dialog)
  const [tempFilterContractType, setTempFilterContractType] = useState<string>('all');
  const [tempFilterTax, setTempFilterTax] = useState<string>('all');
  const [tempFilterStatus, setTempFilterStatus] = useState<string>('all');
  const [tempFilterContractId, setTempFilterContractId] = useState<string | null>(null);
  const [tempFilterService, setTempFilterService] = useState<string | null>(null);

  // Initialize invoices - always use mockInvoices as base, merge with user-created invoices from localStorage
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const stored = localStorage.getItem('invoices');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Get IDs from mock invoices
        const mockIds = new Set(mockInvoices.map(inv => inv.id));
        // Only keep user-created invoices (not in mock data)
        const userCreated = parsed.filter((inv: Invoice) => !mockIds.has(inv.id));
        // Merge: mock invoices first, then user-created
        return [...mockInvoices, ...userCreated];
      } catch (e) {
        console.error('Failed to parse invoices from localStorage:', e);
        return mockInvoices;
      }
    }
    return mockInvoices;
  });

  // Editing state for paid amount
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [editingPaidAmount, setEditingPaidAmount] = useState<string>('');

  // Editing state for deposit date
  const [editingDepositDateId, setEditingDepositDateId] = useState<string | null>(null);
  const [tempDepositDate, setTempDepositDate] = useState<Date | undefined>(undefined);

  // Pending state: track paid amount for each invoice
  const [pendingPaidAmounts, setPendingPaidAmounts] = useState<Record<string, string>>({});
  const [pendingDepositDates, setPendingDepositDates] = useState<Record<string, Date | undefined>>({});

  // Sync invoices to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }, [invoices]);

  // Initialize pending paid amounts with billed amount
  useEffect(() => {
    const initialPendingAmounts: Record<string, string> = {};
    invoices.forEach(invoice => {
      if (invoice.status === 'pending') {
        initialPendingAmounts[invoice.id] = String(invoice.billedAmount);
      }
    });
    setPendingPaidAmounts(initialPendingAmounts);
  }, [invoices]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, showOnlyUnpaid]);

  // Filter invoices by selected period
  const filteredInvoices = invoices.filter((invoice) => {
    // Period filter
    const matchesPeriod = selectedPeriod === 'all' || invoice.period === selectedPeriod;

    // Reseller filter - only show reseller invoices when explicitly filtering by reseller
    const matchesReseller = !filterResellerId || invoice.resellerId === filterResellerId;

    // Customer filter - only show Direct contract invoices for this customer
    // Important: Reseller contracts don't generate individual invoices
    let matchesCustomer = true;
    if (filterCustomerId) {
      // Only show Direct contracts for this customer
      matchesCustomer = invoice.customerId === filterCustomerId;
    }

    // Contract filter - only show invoices for this specific contract
    const matchesContract = !filterContractId || invoice.contractId === filterContractId;

    // Service filter - only show invoices for this specific service
    const matchesService = !filterService || invoice.service === filterService;

    // Search filter
    const query = searchQuery.toLowerCase().trim();
    let matchesSearch = true;

    if (query) {
      matchesSearch =
        invoice.invoiceNo.toLowerCase().includes(query) ||
        invoice.service.toLowerCase().includes(query) ||
        invoice.companyName.toLowerCase().includes(query) ||
        invoice.contractType.toLowerCase().includes(query) ||
        invoice.businessRegNo.toLowerCase().includes(query) ||
        invoice.contactPerson.toLowerCase().includes(query) ||
        invoice.contactPersonEmail.toLowerCase().includes(query) ||
        invoice.status.toLowerCase().includes(query);
    }

    // Unpaid filter (difference > 0)
    const matchesUnpaidFilter = !showOnlyUnpaid || invoice.difference > 0;

    // Contract type filter
    const matchesContractType = filterContractType === 'all' || invoice.contractType.toLowerCase() === filterContractType.toLowerCase();

    // Tax filter
    const matchesTax = filterTax === 'all' || invoice.tax === filterTax;

    // Status filter
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;

    return matchesPeriod && matchesReseller && matchesCustomer && matchesContract && matchesService && matchesSearch && matchesUnpaidFilter && matchesContractType && matchesTax && matchesStatus;
  });

  // Apply sorting
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (!sortColumn) return 0;

    let compareValue = 0;

    switch (sortColumn) {
      case 'date':
        // Convert YYYY.MM.DD to comparable format
        const dateA = new Date(a.issueDate.replace(/\./g, '-'));
        const dateB = new Date(b.issueDate.replace(/\./g, '-'));
        compareValue = dateA.getTime() - dateB.getTime();
        break;
      case 'billedAmount':
        compareValue = a.billedAmount - b.billedAmount;
        break;
      case 'difference':
        compareValue = a.difference - b.difference;
        break;
      case 'status':
        const statusOrder = { pending: 0, partial: 1, paid: 2 };
        compareValue = statusOrder[a.status] - statusOrder[b.status];
        break;
    }

    return sortDirection === 'asc' ? compareValue : -compareValue;
  });

  // Calculate statistics for current period
  const currentPeriodInvoices = invoices.filter(inv => {
    const matchesPeriod = selectedPeriod === 'all' || inv.period === selectedPeriod;
    const matchesReseller = !filterResellerId || inv.resellerId === filterResellerId;
    return matchesPeriod && matchesReseller;
  });

  const totalBilledAmount = currentPeriodInvoices.reduce((sum, inv) => sum + inv.billedAmount, 0);
  const totalPaidAmount = currentPeriodInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalDifference = currentPeriodInvoices.reduce((sum, inv) => sum + inv.difference, 0);
  const unpaidInvoices = currentPeriodInvoices.filter(inv => inv.status === 'pending' || inv.status === 'partial').length;

  // Calculate previous period statistics for trends
  const getPreviousPeriod = (period: string) => {
    if (period === 'all') return null;
    const [year, month] = period.split('. ').map(Number);
    if (month === 1) {
      return `${year - 1}. 12`;
    }
    return `${year}. ${String(month - 1).padStart(2, '0')}`;
  };

  const previousPeriod = getPreviousPeriod(selectedPeriod);
  const previousPeriodInvoices = previousPeriod ? invoices.filter(inv => inv.period === previousPeriod) : [];
  const prevTotalBilled = previousPeriodInvoices.reduce((sum, inv) => sum + inv.billedAmount, 0);
  const prevTotalPaid = previousPeriodInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const prevTotalDifference = previousPeriodInvoices.reduce((sum, inv) => sum + inv.difference, 0);
  const prevUnpaidInvoices = previousPeriodInvoices.filter(inv => inv.status === 'pending' || inv.status === 'partial').length;

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { percent: 0, isUp: current > 0 };
    const percent = Math.round(((current - previous) / previous) * 100);
    return { percent: Math.abs(percent), isUp: percent > 0 };
  };

  const billedTrend = calculateTrend(totalBilledAmount, prevTotalBilled);
  const paidTrend = calculateTrend(totalPaidAmount, prevTotalPaid);
  const differenceTrend = calculateTrend(totalDifference, prevTotalDifference);
  const unpaidTrend = { percent: Math.abs(unpaidInvoices - prevUnpaidInvoices), isUp: unpaidInvoices > prevUnpaidInvoices };

  // Pagination
  const totalPages = Math.ceil(sortedInvoices.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentInvoices = sortedInvoices.slice(startIndex, endIndex);

  // Format amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Copy to clipboard
  const handleCopyInvoiceNo = (invoiceNo: string) => {
    navigator.clipboard.writeText(invoiceNo);
    toast({
      description: t('common.invoiceCopiedDesc'),
    });
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge variant="outline" className="border-green-200 bg-green-100 text-foreground font-semibold text-xs flex items-center gap-1 w-fit">
            <Check className="w-3 h-3" />
            {t('status.paid')}
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="border-border bg-transparent text-foreground font-semibold text-xs flex items-center gap-1 w-fit">
            <Loader className="w-3 h-3" />
            {t('status.pending')}
          </Badge>
        );
      case 'partial':
        return (
          <Badge variant="outline" className="border-orange-200 bg-orange-100 text-foreground font-semibold text-xs flex items-center gap-1 w-fit">
            <Minus className="w-3 h-3" />
            {t('status.partial')}
          </Badge>
        );
      default:
        return null;
    }
  };

  // Handle pending invoice save (paid amount + deposit date + status change)
  const handleSavePendingInvoice = (invoice: Invoice) => {
    // For partial status, if no input, keep existing paidAmount
    const paidAmountStr = invoice.status === 'partial' && !pendingPaidAmounts[invoice.id]
      ? String(invoice.paidAmount)
      : pendingPaidAmounts[invoice.id] || '0';
    const newPaidAmount = parseFloat(paidAmountStr) || 0;
    const depositDate = pendingDepositDates[invoice.id];

    const newDifference = invoice.billedAmount - newPaidAmount;

    let newStatus: 'pending' | 'partial' | 'paid' = 'pending';
    if (newPaidAmount === 0) {
      newStatus = 'pending';
    } else if (newPaidAmount >= invoice.billedAmount) {
      newStatus = 'paid';
    } else {
      newStatus = 'partial';
    }

    setInvoices(invoices.map(inv => {
      if (inv.id === invoice.id) {
        return {
          ...inv,
          paidAmount: newPaidAmount,
          difference: newDifference,
          status: newStatus,
          depositDate: depositDate ? format(depositDate, 'yyyy.MM.dd') : inv.depositDate,
        };
      }
      return inv;
    }));

    // Clear pending states
    const newPendingAmounts = { ...pendingPaidAmounts };
    delete newPendingAmounts[invoice.id];
    setPendingPaidAmounts(newPendingAmounts);

    const newPendingDates = { ...pendingDepositDates };
    delete newPendingDates[invoice.id];
    setPendingDepositDates(newPendingDates);

    toast({
      description: 'Invoice updated successfully',
    });
  };

  // Handle deposit date change (for editing existing deposit dates)
  const handleDepositDateChange = (invoiceId: string, date: Date | undefined) => {
    if (!date) return;

    setInvoices(invoices.map(inv => {
      if (inv.id === invoiceId) {
        const formattedDate = format(date, 'yyyy.MM.dd');
        return { ...inv, depositDate: formattedDate };
      }
      return inv;
    }));

    setEditingDepositDateId(null);
    setTempDepositDate(undefined);

    toast({
      description: 'Deposit date updated successfully',
    });
  };

  // Handle paid amount edit
  const handleEditPaidAmount = (invoice: Invoice) => {
    setEditingInvoiceId(invoice.id);
    // For partial status, don't auto-fill, keep existing value
    setEditingPaidAmount(String(invoice.paidAmount));
  };

  const handleSavePaidAmount = (invoice: Invoice) => {
    const newPaidAmount = parseFloat(editingPaidAmount) || 0;
    const newDifference = invoice.billedAmount - newPaidAmount;

    let newStatus: 'pending' | 'partial' | 'paid' = 'pending';
    if (newPaidAmount === 0) {
      newStatus = 'pending';
    } else if (newPaidAmount >= invoice.billedAmount) {
      newStatus = 'paid';
    } else {
      newStatus = 'partial';
    }

    setInvoices(invoices.map(inv => {
      if (inv.id === invoice.id) {
        return {
          ...inv,
          paidAmount: newPaidAmount,
          difference: newDifference,
          status: newStatus,
        };
      }
      return inv;
    }));

    setEditingInvoiceId(null);
    setEditingPaidAmount('');
  };

  // Filter dialog handlers
  const handleOpenFilterDialog = () => {
    setTempFilterContractType(filterContractType);
    setTempFilterTax(filterTax);
    setTempFilterStatus(filterStatus);
    setTempFilterContractId(filterContractId);
    setTempFilterService(filterService);
    setFilterDialogOpen(true);
  };

  const handleApplyFilters = () => {
    setFilterContractType(tempFilterContractType);
    setFilterTax(tempFilterTax);
    setFilterStatus(tempFilterStatus);
    setFilterContractId(tempFilterContractId);
    setFilterService(tempFilterService);
    setFilterDialogOpen(false);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setTempFilterContractType('all');
    setTempFilterTax('all');
    setTempFilterStatus('all');
    setTempFilterContractId(null);
    setTempFilterService(null);
  };

  const handleCancelFilters = () => {
    setFilterDialogOpen(false);
  };

  // Sorting handler
  const handleSort = (column: 'date' | 'billedAmount' | 'difference' | 'status') => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleExportToExcel = () => {
    // Prepare data for Excel export
    const excelData = filteredInvoices.map((invoice) => ({
      'Invoice No.': invoice.invoiceNo,
      'Service': invoice.service,
      'Company Name': invoice.companyName,
      'Contract Type': invoice.contractType.toLowerCase() === 'direct' ? t('payments.direct') : t('payments.reseller'),
      'Business Reg. No.': invoice.businessRegNo,
      'Period': invoice.period,
      'Billed Amount': formatAmount(invoice.billedAmount),
      'Tax': invoice.tax,
      'vCPU Usage': invoice.vcpuUsage,
      'Contact Person': invoice.contactPerson,
      'Contact Person Email': invoice.contactPersonEmail,
      'Status': invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1),
      'Deposit Date': invoice.depositDate || 'N/A',
      'Paid Amount': formatAmount(invoice.paidAmount),
      'Difference': formatAmount(invoice.difference),
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 18 }, // Invoice No.
      { wch: 20 }, // Service
      { wch: 18 }, // Company Name
      { wch: 15 }, // Contract Type
      { wch: 18 }, // Business Reg. No.
      { wch: 12 }, // Period
      { wch: 18 }, // Billed Amount
      { wch: 8 },  // Tax
      { wch: 15 }, // vCPU Usage
      { wch: 20 }, // Contact Person
      { wch: 25 }, // Contact Person Email
      { wch: 12 }, // Status
      { wch: 15 }, // Deposit Date
      { wch: 15 }, // Paid Amount
      { wch: 15 }, // Difference
    ];
    worksheet['!cols'] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `payments_${timestamp}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, filename);
  };

  // Get unique periods for dropdown
  const periods = Array.from(new Set(invoices.map(inv => inv.period))).sort().reverse();

  // Count active filters
  const activeFiltersCount = [filterContractType, filterTax, filterStatus].filter(f => f !== 'all').length;

  // Get reseller name if filtering by reseller
  const currentReseller = filterResellerId ? mockResellers.find(r => r.id === filterResellerId) : null;

  // Get customer name if filtering by customer
  const currentCustomer = filterCustomerId ? filteredInvoices.find(inv => inv.customerId === filterCustomerId) : null;

  return (
    <div className="flex flex-col h-full bg-background">
      <Header
        onToggleSidebar={onToggleSidebar}
        onOpenNotifications={onOpenNotifications}
      />

      <div className="flex-1 p-8 overflow-auto">
        {/* Page Title and Period Selector */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-foreground">{t('payments.title')}</h1>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[200px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('payments.allPeriods')}</SelectItem>
              {periods.map(period => (
                <SelectItem key={period} value={period}>{period}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatisticCard
            title={t('payments.totalBilledAmount')}
            value={formatAmount(totalBilledAmount)}
            trend={`${billedTrend.percent}%`}
            trendUp={billedTrend.isUp}
            icon={<DollarSign className="w-4 h-4" />}
            showTrend={selectedPeriod !== 'all'}
          />
          <StatisticCard
            title={t('payments.totalPaidAmount')}
            value={formatAmount(totalPaidAmount)}
            trend={`${paidTrend.percent}%`}
            trendUp={paidTrend.isUp}
            icon={<Check className="w-4 h-4" />}
            showTrend={selectedPeriod !== 'all'}
          />
          <StatisticCard
            title={t('payments.totalDifference')}
            value={formatAmount(totalDifference)}
            trend={`${differenceTrend.percent}%`}
            trendUp={differenceTrend.isUp}
            icon={<Loader className="w-4 h-4" />}
            showTrend={selectedPeriod !== 'all'}
          />
          <StatisticCard
            title={t('payments.unpaidInvoices')}
            value={String(unpaidInvoices)}
            trend={`${unpaidTrend.percent}`}
            trendUp={unpaidTrend.isUp}
            icon={<Receipt className="w-4 h-4" />}
            showTrend={selectedPeriod !== 'all'}
          />
        </div>

        {/* Search and Actions Bar */}
        <div className="flex items-center justify-between mb-4">
          {/* Search and Filter */}
          <div className="flex items-center gap-4">
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

            {/* Show only with difference toggle */}
            <div className="flex items-center gap-2">
              <Switch
                id="show-with-difference"
                checked={showOnlyUnpaid}
                onCheckedChange={(checked) => setShowOnlyUnpaid(checked)}
              />
              <label
                htmlFor="show-with-difference"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer whitespace-nowrap"
              >
                {t('payments.showOnlyUnpaid')}
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Filter Button */}
            <div className="relative">
              <Button variant="outline" className="h-8 px-3 text-xs gap-2 bg-card" onClick={handleOpenFilterDialog}>
                <Filter className="w-4 h-4" />
                {t('common.filter')}
              </Button>
              {activeFiltersCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center rounded-full px-1 text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </div>

            {/* Export to Excel - All WM roles */}
            {canExport && (
              <Button variant="outline" className="h-8 px-3 text-xs gap-2 bg-card" onClick={handleExportToExcel}>
                <Download className="w-4 h-4" />
                {t('common.exportToExcel')}
              </Button>
            )}

            {/* Go to Prix - Admin only */}
            {canAccessPrix && (
              <Button className="h-8 px-3 text-xs gap-2">
                {t('payments.goToPrix')}
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Hybrid Scrollable Table */}
        {currentInvoices.length === 0 ? (
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <div className="flex items-center justify-center h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                  <Search className="w-6 h-6 text-foreground" />
                </div>
                <div className="flex flex-col gap-2 text-center">
                  <p className="text-lg font-medium text-foreground leading-7">{t('payments.noInvoicesFound')}</p>
                  <p className="text-sm text-muted-foreground leading-[1.625]">
                    {t('payments.noInvoicesFoundDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <div className="relative flex">
            {/* Left Fixed Column - Invoice No. */}
            <div className="flex-shrink-0 border-r border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:!bg-muted/50">
                    <TableHead className="font-medium w-[180px]">{t('common.invoiceNo')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="h-[53px] group hover:bg-transparent">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span>{invoice.invoiceNo}</span>
                            <button
                              onClick={() => handleCopyInvoiceNo(invoice.invoiceNo)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>

            {/* Middle Scrollable Columns - Service, Company Name, Contract type, Business Reg. No., Period, Billed Amount, Tax, vCPU Usage, Contact Person, Contact Person Email */}
            <div className="flex-1 overflow-x-auto">
              <Table style={{ minWidth: '1600px' }}>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:!bg-muted/50">
                    <TableHead className="font-medium" style={{ width: '170px', minWidth: '170px' }}>{t('common.service')}</TableHead>
                    <TableHead className="font-medium" style={{ width: '170px', minWidth: '170px' }}>{t('common.companyName')}</TableHead>
                    <TableHead className="font-medium" style={{ width: '150px', minWidth: '150px' }}>{t('common.contractType')}</TableHead>
                    <TableHead className="font-medium" style={{ width: '180px', minWidth: '180px' }}>{t('common.businessRegNo')}</TableHead>
                    <TableHead className="font-medium" style={{ width: '140px', minWidth: '140px' }}>{t('common.period')}</TableHead>
                    <TableHead
                      className="font-medium cursor-pointer hover:bg-muted/50"
                      style={{ width: '140px', minWidth: '140px' }}
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-1">
                        {t('common.date')}
                        {sortColumn === 'date' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-40" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="font-medium cursor-pointer hover:bg-muted/50"
                      style={{ width: '170px', minWidth: '170px' }}
                      onClick={() => handleSort('billedAmount')}
                    >
                      <div className="flex items-center gap-1">
                        {t('common.billedAmount')}
                        {sortColumn === 'billedAmount' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-40" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-medium" style={{ width: '100px', minWidth: '100px' }}>{t('common.tax')}</TableHead>
                    <TableHead className="font-medium" style={{ width: '140px', minWidth: '140px' }}>{t('common.vcpuUsage')}</TableHead>
                    <TableHead className="font-medium" style={{ width: '170px', minWidth: '170px' }}>{t('common.contactPerson')}</TableHead>
                    <TableHead className="font-medium" style={{ width: '210px', minWidth: '210px' }}>{t('common.contactPersonEmail')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="h-[53px] group hover:bg-transparent">
                        <TableCell style={{ width: '170px', minWidth: '170px' }}>
                          <div className="inline-flex items-center justify-center gap-1 px-2 py-0.5 bg-white border border-border rounded-md">
                            <span className="text-xs font-semibold text-foreground whitespace-nowrap">{invoice.service}</span>
                          </div>
                        </TableCell>
                        <TableCell style={{ width: '170px', minWidth: '170px' }}>{invoice.companyName}</TableCell>
                        <TableCell style={{ width: '150px', minWidth: '150px' }}>
                          {invoice.contractType.toLowerCase() === 'direct' ? t('payments.direct') : t('payments.reseller')}
                        </TableCell>
                        <TableCell style={{ width: '180px', minWidth: '180px' }}>{invoice.businessRegNo}</TableCell>
                        <TableCell style={{ width: '140px', minWidth: '140px' }}>{invoice.period}</TableCell>
                        <TableCell style={{ width: '140px', minWidth: '140px' }}>{invoice.issueDate}</TableCell>
                        <TableCell style={{ width: '170px', minWidth: '170px' }}>{formatAmount(invoice.billedAmount)}</TableCell>
                        <TableCell style={{ width: '100px', minWidth: '100px' }}>{invoice.tax}</TableCell>
                        <TableCell style={{ width: '140px', minWidth: '140px' }}>{invoice.vcpuUsage}</TableCell>
                        <TableCell style={{ width: '170px', minWidth: '170px' }}>{invoice.contactPerson}</TableCell>
                        <TableCell style={{ width: '210px', minWidth: '210px' }}>{invoice.contactPersonEmail}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>

            {/* Right Fixed Columns - Status, Deposit Date, Paid Amount, Difference */}
            <div className="flex-shrink-0 border-l border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:!bg-muted/50">
                    <TableHead
                      className="font-medium w-[160px] cursor-pointer hover:bg-muted"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-1">
                        {t('common.status')}
                        {sortColumn === 'status' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-40" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-medium w-[220px]">{t('contracts.depositDate')}</TableHead>
                    <TableHead className="font-medium w-[220px]">{t('common.paidAmount')}</TableHead>
                    <TableHead
                      className="font-medium w-[150px] cursor-pointer hover:bg-muted"
                      onClick={() => handleSort('difference')}
                    >
                      <div className="flex items-center gap-1">
                        {t('common.difference')}
                        {sortColumn === 'difference' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-40" />
                        )}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="h-[53px] group hover:bg-transparent">
                        <TableCell>{renderStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          {invoice.status === 'pending' ? (
                            canEdit ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="h-9 px-3 text-xs gap-2 text-muted-foreground justify-start">
                                    <CalendarIcon className="w-4 h-4" />
                                    {pendingDepositDates[invoice.id]
                                      ? format(pendingDepositDates[invoice.id]!, 'yyyy.MM.dd')
                                      : format(new Date(), 'yyyy.MM.dd')}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={pendingDepositDates[invoice.id] || new Date()}
                                    onSelect={(date) => setPendingDepositDates({ ...pendingDepositDates, [invoice.id]: date })}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <span className="text-sm text-muted-foreground">{invoice.depositDate || 'N/A'}</span>
                            )
                          ) : editingDepositDateId === invoice.id ? (
                            <div className="flex items-center gap-2">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="h-9 px-3 text-xs gap-2 justify-start">
                                    <CalendarIcon className="w-4 h-4" />
                                    {tempDepositDate
                                      ? format(tempDepositDate, 'yyyy.MM.dd')
                                      : invoice.depositDate || format(new Date(), 'yyyy.MM.dd')}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={tempDepositDate || (invoice.depositDate ? new Date(invoice.depositDate) : new Date())}
                                    onSelect={(date) => setTempDepositDate(date)}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <Button
                                size="sm"
                                className="h-8 px-3 text-xs"
                                onClick={() => handleDepositDateChange(invoice.id, tempDepositDate)}
                                disabled={!tempDepositDate}
                              >
                                {t('common.save')}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 text-xs"
                                onClick={() => {
                                  setEditingDepositDateId(null);
                                  setTempDepositDate(undefined);
                                }}
                              >
                                {t('common.cancel')}
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{invoice.depositDate || 'N/A'}</span>
                              {canEdit && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => {
                                    setEditingDepositDateId(invoice.id);
                                    setTempDepositDate(invoice.depositDate ? new Date(invoice.depositDate) : new Date());
                                  }}
                                >
                                  {t('common.edit')}
                                </Button>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {invoice.status === 'pending' ? (
                            canEdit ? (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 border border-input rounded-md px-3 py-1.5 h-9 bg-background">
                                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                                  <Input
                                    type="number"
                                    value={pendingPaidAmounts[invoice.id] || String(invoice.billedAmount)}
                                    onChange={(e) => setPendingPaidAmounts({ ...pendingPaidAmounts, [invoice.id]: e.target.value })}
                                    className="w-20 border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                                  />
                                </div>
                                <Button
                                  size="sm"
                                  className="h-8 px-3 text-xs"
                                  onClick={() => handleSavePendingInvoice(invoice)}
                                >
                                  {t('common.save')}
                                </Button>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">{formatAmount(invoice.paidAmount)}</span>
                            )
                          ) : invoice.status === 'partial' || invoice.status === 'paid' ? (
                            editingInvoiceId === invoice.id ? (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 border border-input rounded-md px-3 py-1.5 h-9 bg-background">
                                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                                  <Input
                                    type="number"
                                    value={editingPaidAmount}
                                    onChange={(e) => setEditingPaidAmount(e.target.value)}
                                    className="w-20 border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                                  />
                                </div>
                                <Button
                                  size="sm"
                                  className="h-8 px-3 text-xs"
                                  onClick={() => handleSavePaidAmount(invoice)}
                                >
                                  {t('common.save')}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-3 text-xs"
                                  onClick={() => {
                                    setEditingInvoiceId(null);
                                    setEditingPaidAmount('');
                                  }}
                                >
                                  {t('common.cancel')}
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className={`text-sm ${invoice.status === 'paid' ? 'text-muted-foreground' : ''}`}>
                                  {formatAmount(invoice.paidAmount)}
                                </span>
                                {canEdit && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleEditPaidAmount(invoice)}
                                  >
                                    {t('common.edit')}
                                  </Button>
                                )}
                              </div>
                            )
                          ) : null}
                        </TableCell>
                        <TableCell className={invoice.difference > 0 ? 'text-destructive font-medium' : ''}>
                          {formatAmount(invoice.difference)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <span>{t('payments.rowsPerPage')}</span>
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
                {t('payments.pageOf', { current: currentPage, total: totalPages })}
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
          </>
        )}
      </div>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="sm:max-w-[425px] gap-6">
          <DialogHeader className="gap-1.5">
            <DialogTitle className="text-lg font-semibold leading-none">{t('common.filter')}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* Contract Type Filter */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-foreground">{t('payments.contractTypeFilter')}</label>
              <Select value={tempFilterContractType} onValueChange={setTempFilterContractType}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder={t('common.all')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  <SelectItem value="direct">{t('payments.direct')}</SelectItem>
                  <SelectItem value="reseller">{t('payments.reseller')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tax Filter */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-foreground">{t('payments.taxFilter')}</label>
              <Select value={tempFilterTax} onValueChange={setTempFilterTax}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder={t('common.all')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  <SelectItem value="Y">Y</SelectItem>
                  <SelectItem value="N">N</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-foreground">{t('payments.statusFilter')}</label>
              <Select value={tempFilterStatus} onValueChange={setTempFilterStatus}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder={t('common.all')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  <SelectItem value="pending">{t('status.pending')}</SelectItem>
                  <SelectItem value="partial">{t('status.partial')}</SelectItem>
                  <SelectItem value="paid">{t('status.paid')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Contract Filter - only show if contract filter is active */}
            {tempFilterContractId && (
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-foreground">{t('payments.contractFilter')}</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={tempFilterContractId}
                    readOnly
                    className="h-9 bg-muted"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3"
                    onClick={() => setTempFilterContractId(null)}
                  >
                    {t('common.clear')}
                  </Button>
                </div>
              </div>
            )}

            {/* Service Filter - only show if service filter is active */}
            {tempFilterService && (
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-foreground">{t('payments.serviceFilter')}</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={tempFilterService}
                    readOnly
                    className="h-9 bg-muted"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3"
                    onClick={() => setTempFilterService(null)}
                  >
                    {t('common.clear')}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <Button variant="outline" className="h-9 px-4" onClick={handleResetFilters}>
              {t('common.reset')}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="h-9 px-4" onClick={handleCancelFilters}>
                {t('common.cancel')}
              </Button>
              <Button className="h-9 px-4" onClick={handleApplyFilters}>
                {t('common.apply')}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
