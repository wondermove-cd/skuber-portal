import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Download, Info, Mail, Check, Loader, Minus, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { mockResellerPayments, ResellerPayment } from '@/lib/mock/payments';
import { PaymentFilterDialog } from '@/components/payments/PaymentFilterDialog';
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

interface DashboardLayoutContext {
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
}

export function MyPaymentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { onToggleSidebar, onOpenNotifications } = useOutletContext<DashboardLayoutContext>();

  // Permission check - Reseller only
  useEffect(() => {
    if (!user?.role.startsWith('reseller_')) {
      navigate('/403');
    }
  }, [user, navigate]);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<'period' | 'date' | 'billedAmount' | 'paidAmount' | 'difference' | null>('period');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  // Filter states
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [appliedStatus, setAppliedStatus] = useState('all');
  const [selectedPeriodFrom, setSelectedPeriodFrom] = useState('');
  const [selectedPeriodTo, setSelectedPeriodTo] = useState('');
  const [appliedPeriodFrom, setAppliedPeriodFrom] = useState('');
  const [appliedPeriodTo, setAppliedPeriodTo] = useState('');

  // Initialize payments from localStorage or use mockResellerPayments
  const [payments, setPayments] = useState<ResellerPayment[]>([]);

  // Load and filter payments when user is available
  useEffect(() => {
    if (!user?.resellerId) {
      console.log('MyPayments: No resellerId found for user', user);
      return;
    }

    console.log('MyPayments: Loading payments for resellerId:', user.resellerId);

    const stored = localStorage.getItem('payments');
    let allPayments: ResellerPayment[];

    if (stored) {
      try {
        allPayments = JSON.parse(stored);
        console.log('MyPayments: Loaded payments from localStorage:', allPayments.length);

        // If localStorage has empty or invalid data, use mock data and clear localStorage
        if (!Array.isArray(allPayments) || allPayments.length === 0) {
          console.log('MyPayments: localStorage has invalid/empty data, clearing and using mockResellerPayments');
          localStorage.removeItem('payments');
          allPayments = mockResellerPayments;
        }
      } catch (e) {
        console.error('Failed to parse payments from localStorage:', e);
        localStorage.removeItem('payments');
        allPayments = mockResellerPayments;
        console.log('MyPayments: Using mockResellerPayments:', allPayments.length);
      }
    } else {
      allPayments = mockResellerPayments;
      console.log('MyPayments: No localStorage, using mockResellerPayments:', allPayments.length);
    }

    // Filter by current user's resellerId
    const filteredPayments = allPayments.filter((p: ResellerPayment) => p.resellerId === user.resellerId);
    console.log('MyPayments: Filtered payments:', filteredPayments.length, 'for resellerId:', user.resellerId);
    setPayments(filteredPayments);
  }, [user?.resellerId]);

  // Note: We don't sync reseller-specific payments back to localStorage
  // because localStorage should contain all payments for all resellers
  // This component only reads and filters payments for the current reseller

  // Sort handler
  const handleSort = (column: 'period' | 'date' | 'billedAmount' | 'paidAmount' | 'difference') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Filter handlers
  const handleFilterOpen = () => {
    setSelectedStatus(appliedStatus);
    setSelectedPeriodFrom(appliedPeriodFrom);
    setSelectedPeriodTo(appliedPeriodTo);
    setFilterDialogOpen(true);
  };

  const handleFilterApply = () => {
    setAppliedStatus(selectedStatus);
    setAppliedPeriodFrom(selectedPeriodFrom);
    setAppliedPeriodTo(selectedPeriodTo);
    setCurrentPage(1);
  };

  const handleFilterReset = () => {
    setSelectedStatus('all');
    setAppliedStatus('all');
    setSelectedPeriodFrom('');
    setSelectedPeriodTo('');
    setAppliedPeriodFrom('');
    setAppliedPeriodTo('');
    setCurrentPage(1);
  };

  // Filter payments based on search and status filter
  let filteredPayments = payments.filter((payment) => {
    // Search filter
    const query = searchQuery.toLowerCase().trim();
    let matchesSearch = true;

    if (query) {
      // Check if search query is a number (for amount search)
      const isNumericQuery = /^\d+$/.test(query);

      if (isNumericQuery) {
        // Search in amount fields
        const queryNum = query;
        matchesSearch =
          payment.billedAmount.toString().includes(queryNum) ||
          payment.paidAmount.toString().includes(queryNum) ||
          payment.difference.toString().includes(queryNum);
      } else {
        // Search in text fields
        matchesSearch =
          payment.period.toLowerCase().includes(query) ||
          payment.date.toLowerCase().includes(query) ||
          payment.status.toLowerCase().includes(query);
      }
    }

    // Status filter
    const matchesStatus =
      appliedStatus === 'all' ||
      appliedStatus === payment.status;

    // Period filter - Direct comparison with "YYYY. MM" format
    let matchesPeriod = true;
    if (appliedPeriodFrom || appliedPeriodTo) {
      const paymentPeriod = payment.period; // "2025. 10"

      if (appliedPeriodFrom && appliedPeriodTo) {
        matchesPeriod = paymentPeriod >= appliedPeriodFrom && paymentPeriod <= appliedPeriodTo;
      } else if (appliedPeriodFrom) {
        matchesPeriod = paymentPeriod >= appliedPeriodFrom;
      } else if (appliedPeriodTo) {
        matchesPeriod = paymentPeriod <= appliedPeriodTo;
      }
    }

    return matchesSearch && matchesStatus && matchesPeriod;
  });

  // Sort payments
  if (sortBy) {
    filteredPayments = [...filteredPayments].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortBy === 'period' || sortBy === 'date') {
        aValue = a[sortBy];
        bValue = b[sortBy];
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
  const totalPages = Math.ceil(filteredPayments.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  // Format amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
      case 'unpaid':
        return (
          <Badge variant="outline" className="border-red-200 bg-red-100 text-foreground font-semibold text-xs flex items-center gap-1 w-fit">
            <X className="w-3 h-3" />
            {t('status.unpaid')}
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleExportToExcel = () => {
    // Prepare data for Excel export
    const excelData = filteredPayments.map((payment) => ({
      'Period': payment.period,
      'Date': payment.date,
      'Billed Amount': formatAmount(payment.billedAmount),
      'Paid Amount': formatAmount(payment.paidAmount),
      'Difference': formatAmount(payment.difference),
      'Status': payment.status.charAt(0).toUpperCase() + payment.status.slice(1),
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 12 }, // Period
      { wch: 10 }, // Date
      { wch: 18 }, // Billed Amount
      { wch: 18 }, // Paid Amount
      { wch: 18 }, // Difference
      { wch: 12 }, // Status
    ];
    worksheet['!cols'] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'My Payments');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `my_payments_${timestamp}.xlsx`;

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
        <h1 className="text-2xl font-semibold text-foreground mb-6">{t('payments.myPayments')}</h1>

        {/* Alert - Payment Notice */}
        <div className="mb-4 border border-border rounded-lg p-4 bg-card flex items-start gap-3">
          <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground leading-5">
              {t('payments.paymentNotice')}
            </p>
            <p className="text-sm text-muted-foreground leading-5">
              {t('payments.contact')}: sales@wondermove.com
            </p>
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
            <Mail className="h-4 w-4" />
          </Button>
        </div>

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
              {(appliedStatus !== 'all' || appliedPeriodFrom || appliedPeriodTo) && (
                <Badge
                  variant="default"
                  className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center rounded-full px-1 text-xs"
                >
                  {(appliedStatus !== 'all' ? 1 : 0) + ((appliedPeriodFrom || appliedPeriodTo) ? 1 : 0)}
                </Badge>
              )}
            </div>

            {/* Export to Excel */}
            <Button variant="outline" className="h-9 px-3 text-xs gap-2 bg-card" onClick={handleExportToExcel}>
              <Download className="w-4 h-4" />
              {t('common.exportToExcel')}
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="bg-muted/50 hover:!bg-muted/50">
                <TableHead className="font-medium w-[15%]">
                  <button
                    onClick={() => handleSort('period')}
                    className="flex items-center gap-1"
                  >
                    {t('common.period')}
                    {sortBy === 'period' ? (
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
                <TableHead className="font-medium w-[12%]">
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center gap-1"
                  >
                    {t('common.date')}
                    {sortBy === 'date' ? (
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
                <TableHead className="font-medium w-[18%]">
                  <button
                    onClick={() => handleSort('billedAmount')}
                    className="flex items-center gap-1"
                  >
                    {t('common.billedAmount')}
                    {sortBy === 'billedAmount' ? (
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
                <TableHead className="font-medium w-[18%]">
                  <button
                    onClick={() => handleSort('paidAmount')}
                    className="flex items-center gap-1"
                  >
                    {t('common.paidAmount')}
                    {sortBy === 'paidAmount' ? (
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
                <TableHead className="font-medium w-[18%]">
                  <button
                    onClick={() => handleSort('difference')}
                    className="flex items-center gap-1"
                  >
                    {t('common.difference')}
                    {sortBy === 'difference' ? (
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
                <TableHead className="font-medium w-[19%]">{t('common.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPayments.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="h-[400px]">
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
                currentPayments.map((payment) => (
                  <TableRow key={payment.id} className="h-14 hover:bg-transparent">
                    <TableCell className="font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                      {payment.period}
                    </TableCell>
                    <TableCell className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {payment.date}
                    </TableCell>
                    <TableCell className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {formatAmount(payment.billedAmount)}
                    </TableCell>
                    <TableCell className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {formatAmount(payment.paidAmount)}
                    </TableCell>
                    <TableCell className={`overflow-hidden text-ellipsis whitespace-nowrap ${payment.difference > 0 ? 'text-destructive font-medium' : ''}`}>
                      {formatAmount(payment.difference)}
                    </TableCell>
                    <TableCell>
                      {renderStatusBadge(payment.status)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredPayments.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <span>{t('common.rowsPerPage')}</span>
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

      {/* Filter Dialog */}
      <PaymentFilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedPeriodFrom={selectedPeriodFrom}
        onPeriodFromChange={(value) => setSelectedPeriodFrom(value === '__CLEAR__' ? '' : value)}
        selectedPeriodTo={selectedPeriodTo}
        onPeriodToChange={(value) => setSelectedPeriodTo(value === '__CLEAR__' ? '' : value)}
        onReset={handleFilterReset}
        onApply={handleFilterApply}
      />
    </div>
  );
}
