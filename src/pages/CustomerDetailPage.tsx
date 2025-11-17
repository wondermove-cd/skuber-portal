import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { ChevronLeft, Trash2, Plus, Copy, ChevronRight, ChevronLeft as ChevronLeftIcon, MoreVertical, PenLine, Pencil, Check, Loader, Minus, StickyNote, FolderOpen, DollarSign, FilePenLine, X, Ban, CircleCheckBig, CircleDashed, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDaysLeft } from '@/lib/utils/format';
import { AddContractModal } from '@/components/contracts/AddContractModal';
import { AddNoteModal } from '@/components/customers/AddNoteModal';
import { EditCustomerModal } from '@/components/customers/EditCustomerModal';
import {
  Customer,
  CustomerNote,
  CustomerContract,
  PaymentHistory
} from '@/lib/mock/customers';
import {
  getCustomerById,
  saveCustomer,
  deleteCustomer,
  getCustomerNotes,
  saveCustomerNote,
  deleteCustomerNote,
  getCustomerContracts,
  getCustomerPayments,
  getAllCustomers,
} from '@/lib/data-store';
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

interface DashboardLayoutContext {
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
}

export function CustomerDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { onToggleSidebar, onOpenNotifications } = useOutletContext<DashboardLayoutContext>();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<CustomerNote | null>(null);
  const [deleteNoteDialogOpen, setDeleteNoteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<CustomerNote | null>(null);
  const [deleteCustomerConfirm, setDeleteCustomerConfirm] = useState(false);
  const [deleteCustomerError, setDeleteCustomerError] = useState(false);
  const [editCustomerModalOpen, setEditCustomerModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const prevContractModalOpen = useRef(contractModalOpen);

  // Notes
  const [notes, setNotes] = useState<CustomerNote[]>([]);

  // Contracts
  const [contracts, setContracts] = useState<CustomerContract[]>([]);
  const [showExpired, setShowExpired] = useState(true);

  // Payment history pagination
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [currentPaymentPage, setCurrentPaymentPage] = useState(0);
  const paymentsPerPage = 5;

  // Fetch customer data
  useEffect(() => {
    if (!id) return;

    const foundCustomer = getCustomerById(id);

    if (foundCustomer) {
      // Check if reseller has access to this customer
      if (user?.resellerId && foundCustomer.resellerId !== user.resellerId) {
        // Reseller trying to access customer that's not theirs
        setCustomer(null);
        setLoading(false);
        return;
      }

      setCustomer(foundCustomer);
    }

    // Fetch contracts for this customer
    const customerContracts = getCustomerContracts(id);
    setContracts(customerContracts);

    // Fetch payment history for this customer
    const customerPayments = getCustomerPayments(id);
    setPayments(customerPayments);

    setLoading(false);
  }, [id, user]);

  // Function to reload notes from data store
  const reloadNotes = () => {
    if (!id) return;
    const customerNotes = getCustomerNotes(id);
    setNotes(customerNotes);
  };

  // Function to reload contracts from data store
  const reloadContracts = () => {
    if (!id) return;
    const customerContracts = getCustomerContracts(id);
    setContracts(customerContracts);
  };

  // Function to reload payments from data store
  const reloadPayments = () => {
    if (!id) return;
    const customerPayments = getCustomerPayments(id);
    setPayments(customerPayments);
  };

  // Load notes initially
  useEffect(() => {
    reloadNotes();
  }, [id]);

  // Load contracts and payments when modal closes
  useEffect(() => {
    if (prevContractModalOpen.current && !contractModalOpen) {
      // Modal just closed (was true, now false), reload data
      reloadContracts();
      reloadPayments();
    }
    prevContractModalOpen.current = contractModalOpen;
  }, [contractModalOpen]);

  // Reload data when page becomes visible (e.g., when navigating back to this page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        reloadNotes();
        reloadContracts();
        reloadPayments();
      }
    };

    const handleFocus = () => {
      reloadNotes();
      reloadContracts();
      reloadPayments();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [id]);

  // Calculate days left until contract end date
  const calculateDaysLeft = (endDate: string): number | null => {
    if (!endDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    const end = new Date(endDate.replace(/\.\s/g, '-'));
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const handleBack = () => {
    navigate('/customers');
  };

  const handleDelete = () => {
    if (!customer) return;

    const contractCount = contracts.length;

    if (contractCount > 0) {
      setDeleteCustomerError(true);
    } else {
      setDeleteCustomerConfirm(true);
    }
  };

  const confirmDeleteCustomer = () => {
    if (!customer) return;

    deleteCustomer(customer.id);

    setDeleteCustomerConfirm(false);

    toast({
      title: t('customerDetail.customerDeleted'),
      description: t('customerDetail.customerDeletedDesc', { name: customer.companyName }),
    });

    // Navigate back to customers list
    navigate('/customers');
  };

  const handleSaveCustomer = (updatedCustomer: Customer) => {
    // Update customer in state
    setCustomer(updatedCustomer);

    // Save customer using data store
    saveCustomer(updatedCustomer);

    toast({
      title: t('customerDetail.customerUpdated'),
      description: t('customerDetail.customerUpdatedDesc', { name: updatedCustomer.companyName }),
    });
  };

  const handleAddContract = () => {
    setContractModalOpen(true);
  };

  const handleCopyInvoiceNo = (invoiceNo: string) => {
    navigator.clipboard.writeText(invoiceNo);
    toast({
      title: t('common.copied'),
      description: t('common.invoiceCopiedDesc'),
    });
  };

  const handleAddNote = (content: string) => {
    if (!customer) return;

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}. ${month}. ${day}`;

    const newNote: CustomerNote = {
      id: `note-${Date.now()}`,
      customerId: customer.id,
      content,
      author: user?.name || 'Unknown',
      createdAt: formattedDate,
    };

    // Save note using data store
    saveCustomerNote(newNote);

    // Reload notes to show the new one
    reloadNotes();

    toast({
      title: t('note.noteAdded'),
      description: t('note.noteAddedDesc'),
    });
  };

  const handleEditNote = (content: string) => {
    if (!editingNote) return;

    const updatedNote = { ...editingNote, content };

    // Save updated note using data store
    saveCustomerNote(updatedNote);

    // Reload notes to show the updated one
    reloadNotes();

    setEditingNote(null);
    toast({
      title: t('note.noteUpdated'),
      description: t('note.noteUpdatedDesc'),
    });
  };

  const handleOpenEditNote = (note: CustomerNote) => {
    setEditingNote(note);
    setNoteModalOpen(true);
  };

  const handleDeleteClick = (note: CustomerNote) => {
    setNoteToDelete(note);
    setDeleteNoteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!noteToDelete) return;

    // Delete note using data store
    deleteCustomerNote(noteToDelete.id);

    // Reload notes
    reloadNotes();

    setDeleteNoteDialogOpen(false);
    setNoteToDelete(null);

    toast({
      title: t('note.noteDeleted'),
      description: t('note.noteDeletedDesc'),
    });
  };

  const handleDeleteCancel = () => {
    setDeleteNoteDialogOpen(false);
    setNoteToDelete(null);
  };

  // Notes are displayed without pagination (Apple Notes style)

  // Calculate pagination for payments
  const totalPaymentPages = Math.ceil(payments.length / paymentsPerPage);
  const currentPayments = payments.slice(
    currentPaymentPage * paymentsPerPage,
    (currentPaymentPage + 1) * paymentsPerPage
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'unpaid':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'expired':
        return 'outline';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">{t('common.loading')}...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-foreground text-lg font-semibold">{t('customerDetail.customerNotFound')}</div>
        <Button onClick={handleBack}>{t('customerDetail.backToCustomers')}</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <Header
        onToggleSidebar={onToggleSidebar}
        onOpenNotifications={onOpenNotifications}
      />

      {/* Page Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6 min-h-[40px]">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handleBack}
              className="h-7 w-7 shrink-0 bg-background"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold leading-7">{customer.companyName}</h1>
          </div>
          {user?.role === 'wm_admin' && (
            <Button
              variant="ghost"
              onClick={handleDelete}
              className="gap-2 px-4 py-2 text-sm font-medium"
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
              {t('common.delete')}
            </Button>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Company Info Section */}
          <div className="border border-border rounded-xl bg-card">
            <div className="flex items-center justify-between px-6 py-6 min-h-[68px]">
              <h2 className="text-base font-semibold leading-none">{t('customerDetail.companyInfo')}</h2>
              {user?.role !== 'wm_viewer' && user?.role !== 'reseller_viewer' && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 px-3 gap-2 text-xs font-medium"
                  onClick={() => setEditCustomerModalOpen(true)}
                >
                  <PenLine className="h-4 w-4" />
                  {t('common.edit')}
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-[14px] px-6 pb-6">
              <div className="flex items-center justify-between text-sm leading-5">
                <div className="text-muted-foreground">{t('common.companyName')}</div>
                <div className="text-card-foreground">{customer.companyName}</div>
              </div>
              <div className="flex items-center justify-between text-sm leading-5">
                <div className="text-muted-foreground">{t('customerDetail.companyId')}</div>
                <div className="text-card-foreground">{customer.companyId}</div>
              </div>
              <div className="flex items-center justify-between text-sm leading-5">
                <div className="text-muted-foreground">{t('common.country')}</div>
                <div className="text-card-foreground">{customer.country}</div>
              </div>
              <div className="flex items-center justify-between text-sm leading-5">
                <div className="text-muted-foreground">{t('common.businessRegNo')}</div>
                <div className="text-card-foreground">{customer.businessRegNo}</div>
              </div>
              <div className="flex items-center justify-between text-sm leading-5">
                <div className="text-muted-foreground">{t('common.contactPerson')}</div>
                <div className="text-card-foreground">{customer.contactPerson}</div>
              </div>
              <div className="flex items-center justify-between text-sm leading-5">
                <div className="text-muted-foreground">{t('common.contactPersonEmail')}</div>
                <div className="text-card-foreground">{customer.email}</div>
              </div>
              <div className="flex items-center justify-between text-sm leading-5">
                <div className="text-muted-foreground">{t('common.createdAt')}</div>
                <div className="text-card-foreground">{customer.createdAt}</div>
              </div>
            </div>
          </div>

          {/* Note Section */}
          <div className="border border-border rounded-xl bg-card flex flex-col min-h-0 max-h-[500px]">
            <div className="flex items-center justify-between px-6 py-6 shrink-0 min-h-[68px]">
              <h2 className="text-base font-semibold leading-none">
                {t('note.title')} {notes.length > 0 && `(${notes.length})`}
              </h2>
              {user?.role !== 'wm_viewer' && user?.role !== 'reseller_viewer' && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 px-3 gap-2 text-xs font-medium"
                  onClick={() => {
                    setEditingNote(null);
                    setNoteModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  {t('note.addNote')}
                </Button>
              )}
            </div>
            {notes.length === 0 ? (
              <div className="h-[364px] flex items-center justify-center px-6 pt-8">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <StickyNote className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-medium">{t('customerDetail.noNotesYet')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('customerDetail.noNotesDesc')}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-y-auto h-[364px]">
                <div className="flex flex-col">
                  {notes.map((note, index) => (
                    <div key={note.id}>
                      <div className="px-6 py-4">
                        <div className="flex gap-4 items-start">
                          <div className="flex-1 flex flex-col gap-3 min-w-0">
                            <p className="text-sm leading-5 break-words whitespace-pre-wrap">{note.content}</p>
                            <p className="text-xs text-muted-foreground shrink-0">{note.createdAt}</p>
                          </div>
                          {user?.role !== 'wm_viewer' && user?.role !== 'reseller_viewer' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-accent shrink-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenEditNote(note)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  {t('common.edit')}
                                </DropdownMenuItem>
                                {(user?.role === 'wm_admin' || user?.role === 'reseller_admin') && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem variant="destructive" onClick={() => handleDeleteClick(note)}>
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      {t('common.delete')}
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                      {index < notes.length - 1 && <div className="h-px bg-border mx-6" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contracts Section */}
        <div className="border border-border rounded-xl bg-card mb-6">
          <div className="flex items-center justify-between px-6 py-6 min-h-[68px]">
            <h2 className="text-base font-semibold leading-none">{t('customers.contracts')}</h2>
            {user?.role !== 'wm_viewer' && user?.role !== 'reseller_viewer' && (
              <Button
                variant="secondary"
                size="sm"
                className="h-8 px-3 gap-2 text-xs font-medium"
                onClick={handleAddContract}
              >
                <Plus className="h-4 w-4" />
                {t('contracts.addContract')}
              </Button>
            )}
          </div>
          {contracts.length === 0 ? (
            <div className="flex items-center justify-center px-6 pb-16 pt-8">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <FilePenLine className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-medium">{t('customerDetail.noContractsYet')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('customerDetail.noContractsDesc')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-6 pb-6 space-y-4">
              {/* Table with horizontal scroll */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-sm font-medium text-foreground h-10 px-2">{t('customers.contracts')}</th>
                      <th className="text-left text-sm font-medium text-foreground h-10 px-2 w-[110px]">{t('customerDetail.daysLeft')}</th>
                      <th className="text-right text-sm font-medium text-foreground h-10 px-2 w-[140px]">{t('resellerDetail.contractAmount')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.filter((contract) => {
                      // Filter out expired contracts if showExpired is false
                      if (!showExpired) {
                        const daysLeft = calculateDaysLeft(contract.endDate);
                        if (daysLeft !== null && daysLeft < 0) {
                          return false; // Hide expired contracts
                        }
                      }
                      return true; // Show all other contracts
                    }).map((contract) => {
                      const contractId = contract.id.replace('contract-', 'C-').padStart(5, '0');
                      const isPayAsYouGo = contract.pricingModel === 'Pay-as-you-go';

                      // Calculate days left
                      const daysLeft = calculateDaysLeft(contract.endDate);

                      // Build contract details string
                      const periodText = contract.endDate
                        ? `${contract.startDate} - ${contract.endDate}`
                        : `${contract.startDate} - ${t('common.noEndDate')}`;

                      // Build pricing details
                      let pricingDetails = '';
                      if (isPayAsYouGo) {
                        // Pay-as-you-go: show unit price
                        const vcpuPrice = contract.details.split(',')[0]?.trim() || '';
                        pricingDetails = `${contract.pricingModel} (${vcpuPrice})`;
                      } else {
                        // Fixed Rate: show amount and period
                        const startYear = contract.startDate.split('.')[0].trim();
                        const endYear = contract.endDate ? contract.endDate.split('.')[0].trim() : '';
                        const yearDiff = endYear ? parseInt(endYear) - parseInt(startYear) : 0;
                        const periodLabel = yearDiff > 0 ? `${yearDiff} year${yearDiff > 1 ? 's' : ''}` : '1 year';
                        pricingDetails = `${contract.pricingModel} (${contract.amount} / ${periodLabel})`;
                      }

                      // Determine reseller info
                      const isReseller = user?.role === 'reseller_admin' || user?.role === 'reseller_viewer';
                      const resellerText = !isReseller && contract.reseller && contract.reseller !== 'N/A'
                        ? ` · Reseller: ${contract.reseller}`
                        : ' · Direct';

                      const contractDetails = `${contractId} · ${periodText} · ${pricingDetails}${resellerText}`;

                      // Format days left display
                      let daysLeftDisplay;
                      if (daysLeft === null) {
                        daysLeftDisplay = t('common.noEndDate');
                      } else if (daysLeft < 0) {
                        daysLeftDisplay = t('status.expired');
                      } else {
                        daysLeftDisplay = formatDaysLeft(daysLeft, t);
                      }

                      // Calculate amount to display
                      const amountDisplay = isPayAsYouGo ? '-' : contract.amount;

                      return (
                        <tr
                          key={contract.id}
                          className="border-b border-border last:border-0 h-[72px] cursor-pointer hover:bg-accent transition-colors"
                          onClick={() => navigate(`/contracts/${contract.id}`)}
                        >
                          <td className="px-2">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-semibold leading-5">{contract.serviceName}</span>
                              <span className="text-sm text-muted-foreground leading-5">{contractDetails}</span>
                            </div>
                          </td>
                          <td className="px-2 text-sm">
                            {daysLeft !== null && daysLeft < 0 ? (
                              <span className="text-destructive">{daysLeftDisplay}</span>
                            ) : daysLeft !== null && daysLeft < 30 ? (
                              <span className="text-orange-600 font-medium">{daysLeftDisplay}</span>
                            ) : (
                              daysLeftDisplay
                            )}
                          </td>
                          <td className="px-2 text-sm text-right">{amountDisplay}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Show expired checkbox */}
              {contracts.length > 0 && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="showExpired"
                    checked={showExpired}
                    onCheckedChange={(checked) => setShowExpired(checked as boolean)}
                  />
                  <label
                    htmlFor="showExpired"
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    {t('customerDetail.showExpiredContracts')}
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Payment History Section - Only for WM Admin/Viewer */}
        {(user?.role === 'wm_admin' || user?.role === 'wm_viewer') && (
        <div className="border border-border rounded-xl bg-card">
          <div className="px-6 py-6 space-y-2">
            <div className="flex items-center justify-between pb-2.5">
              <h2 className="text-base font-semibold leading-6">{t('contracts.paymentHistory')}</h2>
              {payments.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 px-3 gap-2 text-xs font-medium"
                  onClick={() => navigate(`/payments?customer=${customer.id}&search=${encodeURIComponent(customer.companyName)}`)}
                >
                  {t('customerDetail.viewDetailedPaymentHistory')}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            {payments.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-medium">{t('customerDetail.noPaymentsYet')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('customerDetail.noPaymentsDesc')}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-sm font-medium text-foreground h-10 px-2">{t('common.invoiceNo')}</th>
                        <th className="text-left text-sm font-medium text-foreground h-10 px-2">{t('common.period')}</th>
                        <th className="text-left text-sm font-medium text-foreground h-10 px-2">{t('common.date')}</th>
                        <th className="text-left text-sm font-medium text-foreground h-10 px-2">{t('common.service')}</th>
                        <th className="text-left text-sm font-medium text-foreground h-10 px-2">{t('common.status')}</th>
                        <th className="text-left text-sm font-medium text-foreground h-10 px-2">{t('common.paidAmount')}</th>
                        <th className="text-left text-sm font-medium text-foreground h-10 px-2">{t('common.difference')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPayments.map((payment) => {
                        const getStatusBadge = (status: string) => {
                          if (status === 'paid') {
                            return (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-100 border border-emerald-200">
                                <Check className="h-3 w-3" />
                                <span className="text-xs font-semibold">{t('status.paid')}</span>
                              </div>
                            );
                          } else if (status === 'unpaid') {
                            return (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border border-border">
                                <Loader className="h-3 w-3" />
                                <span className="text-xs font-semibold">{t('status.pending')}</span>
                              </div>
                            );
                          } else if (status === 'overdue') {
                            return (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-100 border border-orange-200">
                                <Minus className="h-3 w-3" />
                                <span className="text-xs font-semibold">{t('status.partial')}</span>
                              </div>
                            );
                          }
                        };

                        return (
                          <tr key={payment.id} className="border-b border-border last:border-0">
                            <td className="h-[52px] p-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{payment.invoiceNo}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyInvoiceNo(payment.invoiceNo);
                                  }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                            <td className="h-[52px] p-2 text-sm">{payment.period}</td>
                            <td className="h-[52px] p-2 text-sm">{payment.date}</td>
                            <td className="h-[52px] px-2 py-4">
                              <Badge variant="outline" className="font-semibold">
                                {payment.service}
                              </Badge>
                            </td>
                            <td className="h-[52px] p-2">
                              {getStatusBadge(payment.status)}
                            </td>
                            <td className="h-[52px] p-2 text-sm">{payment.paidAmount}</td>
                            <td className="h-[52px] p-2 text-sm">
                              <span className={payment.difference !== '$0.00' && payment.difference !== '$0' ? 'text-red-500' : ''}>
                                {payment.difference}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    {t('customerDetail.resellerContractsNote')}
                  </div>

                  {totalPaymentPages > 1 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPaymentPage(Math.max(0, currentPaymentPage - 1))}
                        disabled={currentPaymentPage === 0}
                        className="h-9 gap-1 pl-2.5 pr-4 text-sm font-medium disabled:opacity-50"
                      >
                        <ChevronLeftIcon className="h-4 w-4" />
                        {t('common.previous')}
                      </Button>
                      <span className="text-sm text-muted-foreground px-2">
                        {currentPaymentPage + 1} / {totalPaymentPages}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPaymentPage(Math.min(totalPaymentPages - 1, currentPaymentPage + 1))}
                        disabled={currentPaymentPage === totalPaymentPages - 1}
                        className="h-9 gap-1 pl-4 pr-2.5 text-sm font-medium disabled:opacity-50"
                      >
                        {t('common.next')}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Add Contract Modal */}
      <AddContractModal
        open={contractModalOpen}
        onOpenChange={setContractModalOpen}
        customers={getAllCustomers()}
        onAddCustomer={() => {}}
        initialCustomerId={customer.id}
        initialStep={3}
      />

      {/* Add Note Modal */}
      <AddNoteModal
        open={noteModalOpen}
        onOpenChange={(open) => {
          setNoteModalOpen(open);
          if (!open) {
            // Clear editing state after animation completes
            setTimeout(() => {
              setEditingNote(null);
            }, 200);
          }
        }}
        onAddNote={handleAddNote}
        editMode={!!editingNote}
        initialContent={editingNote?.content}
        onEditNote={handleEditNote}
      />

      {/* Edit Customer Modal */}
      <EditCustomerModal
        open={editCustomerModalOpen}
        onOpenChange={setEditCustomerModalOpen}
        customer={customer}
        onSave={handleSaveCustomer}
      />

      {/* Delete Note Confirmation Dialog */}
      <AlertDialog open={deleteNoteDialogOpen} onOpenChange={setDeleteNoteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('note.deleteNote')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('note.confirmDelete')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-white hover:bg-destructive/90">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Customer Error Dialog (Has Contracts) */}
      <AlertDialog open={deleteCustomerError} onOpenChange={setDeleteCustomerError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('customerDetail.cannotDeleteCustomer')}</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{customer?.companyName}</strong> {t('customerDetail.hasActiveContracts', { count: contracts.length })}
              <br /><br />
              {t('customerDetail.deleteContractsFirst')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setDeleteCustomerError(false)}>
              {t('common.ok')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Customer Confirmation Dialog (No Contracts) */}
      <AlertDialog open={deleteCustomerConfirm} onOpenChange={setDeleteCustomerConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('customers.deleteCustomer')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('customerDetail.deleteCustomerConfirm', { name: customer?.companyName })}
              <br /><br />
              {t('note.deleteDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCustomer} className="bg-destructive text-white hover:bg-destructive/90">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
