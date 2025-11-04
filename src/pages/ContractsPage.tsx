import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Search, Filter, Download, Plus, MoreVertical, FileText, StickyNote, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, CheckCircle, CircleDashed } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { mockContracts, Contract } from '@/lib/mock/contracts';
import { FilterDialog } from '@/components/contracts/FilterDialog';
import { AddContractModal } from '@/components/contracts/AddContractModal';
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

interface DashboardLayoutContext {
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
}

export function ContractsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { onToggleSidebar, onOpenNotifications } = useOutletContext<DashboardLayoutContext>();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<'companyName' | 'reseller' | 'startDate' | 'endDate' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);
  const [addContractModalOpen, setAddContractModalOpen] = useState(false);

  // Filter states
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedPricingModel, setSelectedPricingModel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedReseller, setSelectedReseller] = useState('all');

  // Applied filters (after clicking Apply)
  const [appliedServices, setAppliedServices] = useState<string[]>([]);
  const [appliedPricingModel, setAppliedPricingModel] = useState('all');
  const [appliedStatus, setAppliedStatus] = useState('all');
  const [appliedReseller, setAppliedReseller] = useState('all');

  // Initialize contracts from localStorage or use mockContracts
  const [contracts, setContracts] = useState<Contract[]>(() => {
    const stored = localStorage.getItem('contracts');
    if (stored) {
      try {
        const parsedContracts = JSON.parse(stored);
        // Check if the data has resellerId field (new schema)
        if (parsedContracts.length > 0 && !('resellerId' in parsedContracts[0])) {
          // Old data without resellerId, use fresh mockContracts
          console.log('Detected old contract data schema, loading fresh data');
          return mockContracts;
        }
        return parsedContracts;
      } catch (e) {
        console.error('Failed to parse contracts from localStorage:', e);
        return mockContracts;
      }
    }
    return mockContracts;
  });

  const { toast } = useToast();

  // Sync contracts to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('contracts', JSON.stringify(contracts));
  }, [contracts]);

  // Listen for localStorage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'contracts' && e.newValue) {
        try {
          const updatedContracts = JSON.parse(e.newValue);
          setContracts(updatedContracts);
        } catch (error) {
          console.error('Failed to parse contracts from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
  const handleSort = (column: 'companyName' | 'reseller' | 'startDate' | 'endDate') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Permission for reseller filter (WM users only)
  const showResellerFilter = user?.role.startsWith('wm_') || false;

  // Filter handlers
  const handleFilterOpen = () => {
    // Load current applied filters into selection state
    setSelectedServices(appliedServices);
    setSelectedPricingModel(appliedPricingModel);
    setSelectedStatus(appliedStatus);
    setSelectedReseller(appliedReseller);
    setFilterDialogOpen(true);
  };

  const handleFilterApply = () => {
    // Apply all selected filters
    setAppliedServices(selectedServices);
    setAppliedPricingModel(selectedPricingModel);
    setAppliedStatus(selectedStatus);
    setAppliedReseller(selectedReseller);
    setCurrentPage(1);
  };

  const handleFilterReset = () => {
    // Reset all filter selections
    setSelectedServices([]);
    setSelectedPricingModel('all');
    setSelectedStatus('all');
    setSelectedReseller('all');

    // Also reset applied filters
    setAppliedServices([]);
    setAppliedPricingModel('all');
    setAppliedStatus('all');
    setAppliedReseller('all');
    setCurrentPage(1);
  };

  // Delete handlers
  const handleDeleteClick = (contract: Contract) => {
    setContractToDelete(contract);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!contractToDelete) return;

    // Delete the contract from the state
    const updatedContracts = contracts.filter((c) => c.id !== contractToDelete.id);
    setContracts(updatedContracts);

    // Close the dialog
    setDeleteDialogOpen(false);
    setContractToDelete(null);

    // Show success toast
    toast({
      title: 'Contract deleted',
      description: `Contract for ${contractToDelete.companyName} has been successfully deleted.`,
    });
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setContractToDelete(null);
  };

  // Filter contracts based on search and all filters
  let filteredContracts = contracts.filter((contract) => {
    // Role filter - Reseller users can only see their own contracts
    const matchesRole = isResellerUser
      ? contract.resellerId === user?.resellerId
      : true; // WM users see all contracts

    // Search filter
    const matchesSearch =
      contract.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.reseller.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.service.toLowerCase().includes(searchQuery.toLowerCase());

    // Service filter (multi-select)
    const matchesService =
      appliedServices.length === 0 ||
      appliedServices.includes(contract.service);

    // Pricing Model filter
    const matchesPricingModel =
      appliedPricingModel === 'all' ||
      appliedPricingModel === contract.pricingModel;

    // Status filter
    const matchesStatus =
      appliedStatus === 'all' ||
      appliedStatus === contract.status;

    // Reseller filter (only for WM users)
    const matchesReseller =
      appliedReseller === 'all' ||
      appliedReseller === contract.reseller;

    return matchesRole && matchesSearch && matchesService && matchesPricingModel && matchesStatus && matchesReseller;
  });

  // Sort contracts
  if (sortBy) {
    filteredContracts = [...filteredContracts].sort((a, b) => {
      let aValue: string;
      let bValue: string;

      if (sortBy === 'companyName') {
        aValue = a.companyName.toLowerCase();
        bValue = b.companyName.toLowerCase();
      } else if (sortBy === 'reseller') {
        aValue = a.reseller.toLowerCase();
        bValue = b.reseller.toLowerCase();
      } else if (sortBy === 'startDate') {
        aValue = a.startDate;
        bValue = b.startDate;
      } else {
        aValue = a.endDate;
        bValue = b.endDate;
      }

      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }

  // Pagination
  const totalPages = Math.ceil(filteredContracts.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentContracts = filteredContracts.slice(startIndex, endIndex);

  const handleExportToExcel = () => {
    // Prepare data for Excel export
    const excelData = filteredContracts.map((contract) => ({
      'Company Name': contract.companyName,
      'Reseller': contract.reseller,
      'Service': contract.service,
      'Pricing Model': contract.pricingModel,
      'Start Date': contract.startDate,
      'End Date': contract.endDate,
      'Status': contract.status === 'active' ? 'Active' : 'Inactive',
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 30 }, // Company Name
      { wch: 20 }, // Reseller
      { wch: 15 }, // Service
      { wch: 18 }, // Pricing Model
      { wch: 15 }, // Start Date
      { wch: 15 }, // End Date
      { wch: 12 }, // Status
    ];
    worksheet['!cols'] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contracts');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `contracts_${timestamp}.xlsx`;

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
        <h1 className="text-2xl font-semibold text-foreground mb-6">Contracts</h1>

        {/* Search and Actions Bar */}
        <div className="flex items-center justify-between mb-4">
          {/* Search */}
          <div className="flex items-center w-full max-w-[320px] h-9 border border-input rounded-md bg-card">
            <Input
              placeholder="Search..."
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
                Filter
              </Button>
              {(() => {
                const activeFiltersCount =
                  appliedServices.length +
                  (appliedPricingModel !== 'all' ? 1 : 0) +
                  (appliedStatus !== 'all' ? 1 : 0) +
                  (appliedReseller !== 'all' ? 1 : 0);
                return activeFiltersCount > 0 ? (
                  <Badge
                    variant="default"
                    className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center rounded-full px-1 text-xs"
                  >
                    {activeFiltersCount}
                  </Badge>
                ) : null;
              })()}
            </div>

            {/* Export to Excel */}
            <Button variant="outline" className="h-9 px-3 text-xs gap-2 bg-card" onClick={handleExportToExcel}>
              <Download className="w-4 h-4" />
              Export to Excel
            </Button>

            {/* Add Contract */}
            {canAdd && (
              <Button className="h-9 px-3 text-xs gap-2" onClick={() => setAddContractModalOpen(true)}>
                <Plus className="w-4 h-4" />
                Add Contract
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="bg-muted/50 hover:!bg-muted/50">
                <TableHead className="font-medium w-[14%]">
                  <button
                    onClick={() => handleSort('companyName')}
                    className="flex items-center gap-1"
                  >
                    Company Name
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
                <TableHead className="font-medium w-[14%]">
                  <button
                    onClick={() => handleSort('reseller')}
                    className="flex items-center gap-1"
                  >
                    Reseller
                    {sortBy === 'reseller' ? (
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
                <TableHead className="font-medium w-[14%]">Service</TableHead>
                <TableHead className="font-medium w-[14%]">Pricing Model</TableHead>
                <TableHead className="font-medium w-[14%]">
                  <button
                    onClick={() => handleSort('startDate')}
                    className="flex items-center gap-1"
                  >
                    Start Date
                    {sortBy === 'startDate' ? (
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
                <TableHead className="font-medium w-[14%]">
                  <button
                    onClick={() => handleSort('endDate')}
                    className="flex items-center gap-1"
                  >
                    End Date
                    {sortBy === 'endDate' ? (
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
                <TableHead className="font-medium w-[14%]">Status</TableHead>
                {showActionsColumn && <TableHead className="w-[48px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentContracts.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={showActionsColumn ? 8 : 7} className="h-[400px]">
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
                currentContracts.map((contract) => (
                  <TableRow key={contract.id} className="h-14">
                    <TableCell className="font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                      {contract.companyName}
                    </TableCell>
                    <TableCell className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {contract.reseller === 'N/A' ? (
                        <span className="text-muted-foreground">N/A</span>
                      ) : (
                        contract.reseller
                      )}
                    </TableCell>
                    <TableCell className="overflow-hidden text-ellipsis whitespace-nowrap">
                      <Badge variant="outline" className="text-xs bg-card font-semibold">
                        {contract.service}
                      </Badge>
                    </TableCell>
                    <TableCell className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {contract.pricingModel}
                    </TableCell>
                    <TableCell className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {contract.startDate}
                    </TableCell>
                    <TableCell className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {contract.endDate}
                    </TableCell>
                    <TableCell>
                      {contract.status === 'active' ? (
                        <Badge className="bg-green-100 border-emerald-200 text-foreground font-semibold text-xs flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-card text-foreground font-semibold text-xs flex items-center gap-1 w-fit">
                          <CircleDashed className="w-3 h-3" />
                          Inactive
                        </Badge>
                      )}
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
                            {canAddNote && (
                              <DropdownMenuItem onClick={() => console.log('Add note for contract:', contract.id)}>
                                <StickyNote className="mr-2 h-4 w-4" />
                                Add Note
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => handleDeleteClick(contract)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
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
        {filteredContracts.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <span>Rows per page</span>
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
                Page {currentPage} of {totalPages}
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
      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        selectedServices={selectedServices}
        onServicesChange={setSelectedServices}
        selectedPricingModel={selectedPricingModel}
        onPricingModelChange={setSelectedPricingModel}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedReseller={selectedReseller}
        onResellerChange={setSelectedReseller}
        showResellerFilter={showResellerFilter}
        onReset={handleFilterReset}
        onApply={handleFilterApply}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contract
              {contractToDelete && ` for ${contractToDelete.companyName}`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Contract Modal */}
      <AddContractModal
        open={addContractModalOpen}
        onOpenChange={setAddContractModalOpen}
      />
    </div>
  );
}
