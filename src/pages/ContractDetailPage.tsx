import { useEffect, useState } from 'react';
import { useNavigate, useParams, useOutletContext, Navigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, PenLine, Plus, Trash2, MoreVertical, Pencil, StickyNote, Copy, Check, Loader, Minus, DollarSign, ChevronLeft as ChevronLeftIcon, BarChart4 } from 'lucide-react';
import { formatDaysLeft } from '@/lib/utils/format';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import ResellerContractDetailPage from './ResellerContractDetailPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  ContractDetail,
  BillingInfoFixedRate,
  BillingInfoPayAsYouGo,
  BillingInfoTrial,
  UsageCostData,
} from '@/lib/mock/contractDetails';
import {
  getContractDetailById,
  getContractNotes,
  saveContractNote,
  deleteContractNote,
  deleteContract,
  getContractPayments,
  saveContract,
  ContractNote,
} from '@/lib/data-store';
import { AddNoteModal } from '@/components/customers/AddNoteModal';
import { EditBillingEmailsModal } from '@/components/contracts/EditBillingEmailsModal';
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

export default function ContractDetailPage() {
  const navigate = useNavigate();
  const { contractId } = useParams<{ contractId: string }>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { onToggleSidebar, onOpenNotifications } = useOutletContext<DashboardLayoutContext>();

  // If user is reseller, show reseller view
  if (user?.role === 'reseller_admin' || user?.role === 'reseller_viewer') {
    return <ResellerContractDetailPage />;
  }

  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ContractNote | null>(null);
  const [deleteNoteDialogOpen, setDeleteNoteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<ContractNote | null>(null);
  const [editBillingEmailsOpen, setEditBillingEmailsOpen] = useState(false);
  const [deleteContractDialogOpen, setDeleteContractDialogOpen] = useState(false);

  // Notes
  const [notes, setNotes] = useState<ContractNote[]>([]);

  // {t('contractDetail.paymentHistory')} pagination
  const [currentPaymentPage, setCurrentPaymentPage] = useState(0);
  const paymentsPerPage = 5;

  useEffect(() => {
    if (contractId) {
      const contractDetail = getContractDetailById(contractId);
      if (contractDetail) {
        setContract(contractDetail);
      }
    }
  }, [contractId]);

  // Function to reload notes from data store
  const reloadNotes = () => {
    if (!contractId) return;
    const contractNotes = getContractNotes(contractId);
    setNotes(contractNotes);
  };

  // Function to format contract period with duration
  const formatContractPeriodWithDuration = (periodString: string) => {
    // Parse the period string (e.g., "2025. 11. 09 - 2026. 11. 09")
    const parts = periodString.split(' - ');
    if (parts.length !== 2) return periodString;

    const [startStr, endStr] = parts;

    // Parse dates (format: YYYY. MM. DD)
    const parseDate = (dateStr: string) => {
      const [year, month, day] = dateStr.split('. ').map(str => parseInt(str.trim()));
      return new Date(year, month - 1, day);
    };

    const startDate = parseDate(startStr);
    const endDate = parseDate(endStr);

    // Calculate difference in years and months
    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    const days = endDate.getDate() - startDate.getDate();

    // Adjust if days are negative
    if (days < 0) {
      months -= 1;
    }

    // Adjust if months are negative
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Format duration
    let duration = '';
    if (years > 0) {
      duration = `${years} year${years > 1 ? 's' : ''}`;
      if (months > 0) {
        duration += ` ${months} month${months > 1 ? 's' : ''}`;
      }
    } else if (months > 0) {
      duration = `${months} month${months > 1 ? 's' : ''}`;
    }

    return duration ? `${periodString} (${duration})` : periodString;
  };

  // Load notes initially
  useEffect(() => {
    reloadNotes();
  }, [contractId]);

  // Reload data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        reloadNotes();
      }
    };

    const handleFocus = () => {
      reloadNotes();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [contractId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDelete = () => {
    setDeleteContractDialogOpen(true);
  };

  const confirmDeleteContract = () => {
    if (!contractId) return;

    deleteContract(contractId);

    setDeleteContractDialogOpen(false);

    toast({
      title: t('contractDetail.contractDeleted'),
      description: t('contractDetail.contractDeletedDesc', { contractNumber: contract?.contractNumber || contractId }),
    });

    // Navigate back to contracts list
    navigate('/contracts');
  };

  const handleStatusToggle = (checked: boolean) => {
    if (!contract) return;

    const newStatus = checked ? 'active' : 'inactive';

    // Update contract status
    const updatedContract = {
      ...contract,
      status: newStatus,
    };

    saveContract(updatedContract);
    setContract(updatedContract);

    toast({
      title: newStatus === 'active' ? t('contractDetail.contractActivated') : t('contractDetail.contractDeactivated'),
      description: t('contractDetail.contractStatusChanged', { contractNumber: contract.contractNumber || contractId, status: newStatus }),
    });
  };

  const handleAddNote = (content: string) => {
    if (!contractId) return;

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}. ${month}. ${day}`;

    const newNote: ContractNote = {
      id: `note-${Date.now()}`,
      contractId: contractId,
      content,
      author: user?.name || 'Unknown',
      createdAt: formattedDate,
    };

    saveContractNote(newNote);
    reloadNotes();

    toast({
      title: t('contractDetail.noteAdded'),
      description: t('contractDetail.noteAddedDesc'),
    });
  };

  const handleEditNote = (content: string) => {
    if (!editingNote) return;

    const updatedNote: ContractNote = {
      ...editingNote,
      content,
    };

    saveContractNote(updatedNote);
    reloadNotes();

    setEditingNote(null);
    toast({
      title: t('contractDetail.noteUpdated'),
      description: t('contractDetail.noteUpdatedDesc'),
    });
  };

  const handleOpenEditNote = (note: ContractNote) => {
    setEditingNote(note);
    setNoteModalOpen(true);
  };

  const handleDeleteClick = (note: ContractNote) => {
    setNoteToDelete(note);
    setDeleteNoteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!noteToDelete) return;

    deleteContractNote(noteToDelete.id);
    reloadNotes();

    setDeleteNoteDialogOpen(false);
    setNoteToDelete(null);

    toast({
      title: t('contractDetail.noteDeleted'),
      description: t('contractDetail.noteDeletedDesc'),
    });
  };

  const handleDeleteCancel = () => {
    setDeleteNoteDialogOpen(false);
    setNoteToDelete(null);
  };

  const handleCopyInvoiceNo = (invoiceNo: string) => {
    navigator.clipboard.writeText(invoiceNo);
    toast({
      title: t('common.copied'),
      description: t('contractDetail.invoiceNumberCopied'),
    });
  };

  const handleSaveBillingEmails = (emails: string[]) => {
    if (!contractId) return;

    // Update contract details with new billing emails
    const existingContractDetails = JSON.parse(
      localStorage.getItem('contractDetails') || '{}'
    );

    if (existingContractDetails[contractId]) {
      existingContractDetails[contractId].billingEmails = emails;
      localStorage.setItem('contractDetails', JSON.stringify(existingContractDetails));

      // Reload contract
      const updatedContract = getContractDetailById(contractId);
      if (updatedContract) {
        setContract(updatedContract);
      }

      toast({
        title: t('contractDetail.billingEmailsUpdated'),
        description: t('contractDetail.billingEmailsUpdatedDesc'),
      });
    }
  };

  // Notes are displayed without pagination (Apple Notes style)

  // Calculate pagination for payments
  const payments = contractId ? getContractPayments(contractId) : [];
  const totalPaymentPages = Math.ceil(payments.length / paymentsPerPage);
  const currentPayments = payments.slice(
    currentPaymentPage * paymentsPerPage,
    (currentPaymentPage + 1) * paymentsPerPage
  );

  if (!contract) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{t('contractDetail.contractNotFound')}</p>
      </div>
    );
  }

  const isFixedRate = contract.pricingModel === 'Fixed Rate';
  const isTrial = contract.pricingModel === 'Trial';
  const billingInfo = contract.billingInfo;

  // Calculate days left
  const calculateDaysLeft = (endDate: string): number | null => {
    if (!endDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date(endDate.replace(/\.\s/g, '-'));
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const daysLeft = calculateDaysLeft(contract.endDate);
  let daysLeftDisplay: string;
  let daysLeftVariant: "default" | "secondary" | "destructive" | "outline" = "outline";

  if (daysLeft === null) {
    daysLeftDisplay = t('common.noEndDate');
  } else if (daysLeft < 0) {
    daysLeftDisplay = t('status.expired');
    daysLeftVariant = "destructive";
  } else {
    daysLeftDisplay = formatDaysLeft(daysLeft, t);
    if (daysLeft < 30) {
      daysLeftVariant = "secondary";
    }
  }

  // Format chart data with "Included vCPU" label on the limit value
  const formatChartData = () => {
    if (!contract.vcpuUsage) return [];
    return contract.vcpuUsage.map((data) => ({
      month: data.month,
      value: data.used,
      limit: data.limit,
    }));
  };

  // Format usage cost chart data for Pay-as-you-go
  const formatUsageCostData = () => {
    if (!contract.usageCostData) return [];
    return contract.usageCostData.map((data) => ({
      month: data.month,
      cost: data.cost,
      minimumCharge: data.minimumCharge,
    }));
  };

  // Calculate average vCPU usage
  const calculateAverageVCPU = () => {
    const data = formatUsageCostData();
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + item.cost, 0);
    return Math.round(sum / data.length);
  };

  return (
    <>
      <Header
        onToggleSidebar={onToggleSidebar}
        onOpenNotifications={onOpenNotifications}
      />
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
            <h1 className="text-xl font-semibold leading-7">{contract.contractId || contract.contractNumber || 'N/A'}</h1>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs bg-card font-semibold">
                {daysLeftDisplay}
              </Badge>
              <Badge variant="outline" className="text-xs bg-card font-semibold">
                {contract.service}
              </Badge>
              <Badge variant="outline" className="text-xs bg-card font-semibold">
                {contract.pricingModel === 'Pay-as-you-go' ? t('pricing.payAsYouGo') :
                 contract.pricingModel === 'Fixed Rate' ? t('pricing.fixedRate') :
                 contract.pricingModel === 'Trial' ? t('pricing.trial') :
                 contract.pricingModel}
              </Badge>
            </div>
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
            {/* Contract Info Section */}
            <div className="border border-border rounded-xl bg-card">
              <div className="flex items-center justify-between px-6 py-6 min-h-[68px]">
                <h2 className="text-base font-semibold leading-none">{t('contractDetail.contractInfo')}</h2>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 px-3 gap-2 text-xs font-medium"
                  onClick={() => navigate(`/customers/${contract.customerId}`)}
                >
                  {t('contractDetail.viewCompanyDetails')}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-col gap-[14px] px-6 pb-6">
                <div className="flex items-center justify-between text-sm leading-5">
                  <div className="text-muted-foreground">{t('contractDetail.contractId')}</div>
                  <div className="text-card-foreground">{contract.contractId || contract.contractNumber || 'N/A'}</div>
                </div>
                <div className="flex items-center justify-between text-sm leading-5">
                  <div className="text-muted-foreground">{t('common.reseller')}</div>
                  <div className="text-card-foreground">{contract.reseller}</div>
                </div>
                <div className="flex items-center justify-between text-sm leading-5">
                  <div className="text-muted-foreground">{t('common.service')}</div>
                  <div className="text-card-foreground">{contract.service}</div>
                </div>
                <div className="flex items-center justify-between text-sm leading-5">
                  <div className="text-muted-foreground">{t('contractDetail.status')}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-card-foreground text-sm capitalize">{t(`status.${contract.status}`)}</span>
                    {user?.role !== 'wm_viewer' && user?.role !== 'reseller_viewer' && (
                      <Switch
                        checked={contract.status === 'active'}
                        onCheckedChange={handleStatusToggle}
                      />
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm leading-5">
                  <div className="text-muted-foreground">{t('common.companyName')}</div>
                  <div className="text-card-foreground">{contract.companyName}</div>
                </div>
                <div className="flex items-center justify-between text-sm leading-5">
                  <div className="text-muted-foreground">{t('common.contactPerson')}</div>
                  <div className="text-card-foreground">{contract.contactPerson.name}</div>
                </div>
                <div className="flex items-center justify-between text-sm leading-5">
                  <div className="text-muted-foreground">{t('common.contactPersonEmail')}</div>
                  <div className="text-card-foreground">{contract.contactPerson.email}</div>
                </div>
                <div className="flex items-center justify-between text-sm leading-5">
                  <div className="text-muted-foreground">{t('common.createdAt')}</div>
                  <div className="text-card-foreground">{contract.createdAt}</div>
                </div>
              </div>
            </div>

            {/* Note Section */}
            <div className="border border-border rounded-xl bg-card flex flex-col min-h-0 max-h-[500px]">
              <div className="flex items-center justify-between px-6 py-6 shrink-0 min-h-[68px]">
                <h2 className="text-base font-semibold leading-none">
                  {t('contractDetail.note')} {notes.length > 0 && `(${notes.length})`}
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
                    {t('contractDetail.addNote')}
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
                      <h3 className="text-lg font-medium">{t('contractDetail.noNotesYet')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('contractDetail.noNotesDesc')}
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

          {/* Billing Info and {t('common.vcpuUsage')} Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Billing Info Section */}
            <div className="border border-border rounded-xl bg-card">
              <div className="flex items-center justify-between px-6 py-6 min-h-[68px]">
                <h2 className="text-base font-semibold leading-none">{t('contractDetail.billingInfo')}</h2>
              </div>
              <div className="flex flex-col px-6 pb-6">
                <div className="flex flex-col gap-[14px]">
                  {isTrial ? (
                    <>
                      <div className="flex items-center justify-between text-sm leading-5">
                        <div className="text-muted-foreground">{t('common.pricingModel')}</div>
                        <div className="text-card-foreground">Trial</div>
                      </div>
                      <div className="flex items-center justify-between text-sm leading-5">
                        <div className="text-muted-foreground">{t('contractDetail.trialAllocation')}</div>
                        <div className="text-card-foreground">{(billingInfo as BillingInfoTrial).trialAllocation} vCPU</div>
                      </div>
                      <div className="flex items-center justify-between text-sm leading-5">
                        <div className="text-muted-foreground">{t('contractDetail.trialPeriod')}</div>
                        <div className="text-card-foreground">{(billingInfo as BillingInfoTrial).trialPeriod}</div>
                      </div>
                      {(billingInfo as BillingInfoTrial).note && (
                        <div className="flex flex-col gap-2 text-sm">
                          <div className="text-muted-foreground">Note</div>
                          <div className="text-card-foreground bg-muted/50 p-3 rounded-md border border-border">
                            {(billingInfo as BillingInfoTrial).note}
                          </div>
                        </div>
                      )}
                    </>
                  ) : isFixedRate ? (
                    <>
                      <div className="flex items-center justify-between text-sm leading-5">
                        <div className="text-muted-foreground">{t('common.pricingModel')}</div>
                        <div className="text-card-foreground">{t('pricing.fixedRate')}</div>
                      </div>
                      <div className="flex items-center justify-between text-sm leading-5">
                        <div className="text-muted-foreground">{t('contractDetail.includedAllocation')}</div>
                        <div className="text-card-foreground">{(billingInfo as BillingInfoFixedRate).includedAllocation} vCPU</div>
                      </div>
                      <div className="flex items-center justify-between text-sm leading-5">
                        <div className="text-muted-foreground">{t('contractDetail.contractPeriod')}</div>
                        <div className="text-card-foreground">{formatContractPeriodWithDuration((billingInfo as BillingInfoFixedRate).contractPeriod)}</div>
                      </div>
                      <div className="flex items-center justify-between text-sm leading-5">
                        <div className="text-muted-foreground">{t('contractDetail.contractAmount')}</div>
                        <div className="text-card-foreground">{(billingInfo as BillingInfoFixedRate).contractAmount}</div>
                      </div>
                      <div className="flex items-center justify-between text-sm leading-5">
                        <div className="text-muted-foreground">{t('contractDetail.taxIncluded')}</div>
                        <div className="text-card-foreground">{(billingInfo as BillingInfoFixedRate).taxIncluded ? 'Y' : 'N'}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-sm leading-5">
                        <div className="text-muted-foreground">{t('common.pricingModel')}</div>
                        <div className="text-card-foreground">{t('pricing.payAsYouGo')}</div>
                      </div>
                      <div className="flex items-center justify-between text-sm leading-5">
                        <div className="text-muted-foreground">{t('contractDetail.rate')}</div>
                        <div className="text-card-foreground">{(billingInfo as BillingInfoPayAsYouGo).rate}</div>
                      </div>
                      <div className="flex items-center justify-between text-sm leading-5">
                        <div className="text-muted-foreground">{t('contractDetail.contractPeriod')}</div>
                        <div className="text-card-foreground">{formatContractPeriodWithDuration((billingInfo as BillingInfoPayAsYouGo).contractPeriod)}</div>
                      </div>
                      <div className="flex items-center justify-between text-sm leading-5">
                        <div className="text-muted-foreground">{t('contractDetail.minimumCharge')}</div>
                        <div className="text-card-foreground">{(billingInfo as BillingInfoPayAsYouGo).minimumCharge}</div>
                      </div>
                      <div className="flex items-center justify-between text-sm leading-5">
                        <div className="text-muted-foreground">{t('contractDetail.taxIncluded')}</div>
                        <div className="text-card-foreground">{(billingInfo as BillingInfoPayAsYouGo).taxIncluded ? 'Y' : 'N'}</div>
                      </div>
                    </>
                  )}

                  {/* Separator */}
                  <div className="flex flex-col items-start justify-between py-2 h-4 w-full">
                    <div className="h-0 w-full border-t border-border" />
                  </div>

                  {/* Billing email address section */}
                  {contract.reseller === 'N/A' ? (
                    // WM's customers - show emails with edit button
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-5">{t('contractDetail.billingEmailAddress')} ({contract.billingEmails?.length || 0})</p>
                        {user?.role !== 'wm_viewer' && user?.role !== 'reseller_viewer' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 px-3 gap-2 text-xs font-medium"
                            onClick={() => setEditBillingEmailsOpen(true)}
                          >
                            <PenLine className="h-4 w-4" />
                            {t('common.edit')}
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {contract.billingEmails?.map((email, index) => (
                          <div
                            key={index}
                            className="bg-background border border-input h-9 px-3 py-1 rounded-md flex items-center text-sm text-foreground"
                          >
                            {email}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Reseller customers - show managed by reseller message
                    <div className="flex flex-col gap-3">
                      <p className="text-sm font-medium leading-5">{t('contractDetail.billingEmailAddress')}</p>
                      <div className="bg-background border border-input h-9 px-3 py-1 rounded-md flex items-center text-sm text-muted-foreground">
                        {t('contractDetail.managedByReseller')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* {t('common.vcpuUsage')} Chart - Only for Fixed Rate */}
            {isFixedRate && (
              <div className="border border-border rounded-xl bg-card">
                <div className="flex items-center justify-between px-6 py-6 min-h-[68px]">
                  <h2 className="text-base font-semibold leading-none">{t('common.vcpuUsage')}</h2>
                </div>
                <div className="px-6 pb-6">
                  {contract.vcpuUsage && contract.vcpuUsage.length > 0 ? (
                    <ChartContainer
                      config={{
                        value: {
                          label: "{t('common.vcpuUsage')}",
                          color: "#facc15",
                        },
                      }}
                      className="h-[300px] w-full"
                    >
                      <BarChart data={formatChartData()} barSize={40}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          domain={[0, 400]}
                          ticks={[0, 100, 200, 300, 400]}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ReferenceLine
                          y={(billingInfo as BillingInfoFixedRate).includedAllocation}
                          stroke="#f59e0b"
                          strokeDasharray="5 5"
                          strokeWidth={2}
                          label={{
                            value: `Included vCPU: ${(billingInfo as BillingInfoFixedRate).includedAllocation}`,
                            position: 'top',
                            fill: 'hsl(var(--muted-foreground))',
                            fontSize: 12,
                          }}
                        />
                        <Bar
                          dataKey="value"
                          fill="var(--color-value)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px]">
                      <div className="flex flex-col items-center gap-6 w-full max-w-[321px]">
                        <div className="flex flex-col items-center gap-4 w-full">
                          <div className="flex items-center justify-center size-10 bg-muted rounded-lg shrink-0">
                            <BarChart4 className="size-6 text-muted-foreground" />
                          </div>
                          <div className="flex flex-col gap-2 items-center w-full text-center">
                            <p className="text-lg font-medium leading-7">
                              {t('contractDetail.noDataAvailable')}
                            </p>
                            <p className="text-sm text-muted-foreground leading-[1.625]">
                              {t('contractDetail.noDataDesc')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Empty state for Trial - no chart */}
            {isTrial && (
              <div className="border border-border rounded-xl bg-card">
                <div className="flex items-center justify-between px-6 py-6 min-h-[68px]">
                  <h2 className="text-base font-semibold leading-none">{t('common.vcpuUsage')}</h2>
                </div>
                <div className="px-6 pb-6">
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="flex flex-col items-center gap-6 w-full max-w-[321px]">
                      <div className="flex flex-col items-center gap-4 w-full">
                        <div className="flex items-center justify-center size-10 bg-muted rounded-lg shrink-0">
                          <BarChart4 className="size-6 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col gap-2 items-center w-full text-center">
                          <p className="text-lg font-medium leading-7">
                            {t('contractDetail.trialPeriod')}
                          </p>
                          <p className="text-sm text-muted-foreground leading-[1.625]">
                            {t('contractDetail.trialPeriodDesc')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* {t('common.vcpuUsage')} Chart - Only for Pay-as-you-go */}
            {!isFixedRate && !isTrial && (
              <div className="border border-border rounded-xl bg-card">
                <div className="flex items-center justify-between px-6 py-6 min-h-[68px]">
                  <h2 className="text-base font-semibold leading-none">{t('common.vcpuUsage')}</h2>
                </div>
                <div className="px-6 pb-6">
                  {contract.usageCostData && contract.usageCostData.length > 0 ? (
                    <ChartContainer
                      config={{
                        cost: {
                          label: "{t('common.vcpuUsage')}",
                          color: "#facc15",
                        },
                      }}
                      className="h-[300px] w-full"
                    >
                      <BarChart data={formatUsageCostData()} barSize={40}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.3)]}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="cost"
                          fill="var(--color-cost)"
                          radius={[4, 4, 0, 0]}
                        />
                        <ReferenceLine
                          y={calculateAverageVCPU()}
                          stroke="#ef4444"
                          strokeDasharray="5 5"
                          strokeWidth={2}
                          label={{
                            value: `Average vCPU: ${calculateAverageVCPU()}`,
                            position: 'top',
                            fill: 'hsl(var(--muted-foreground))',
                            fontSize: 12,
                          }}
                        />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px]">
                      <div className="flex flex-col items-center gap-6 w-full max-w-[321px]">
                        <div className="flex flex-col items-center gap-4 w-full">
                          <div className="flex items-center justify-center size-10 bg-muted rounded-lg shrink-0">
                            <BarChart4 className="size-6 text-muted-foreground" />
                          </div>
                          <div className="flex flex-col gap-2 items-center w-full text-center">
                            <p className="text-lg font-medium leading-7">
                              {t('contractDetail.noDataAvailable')}
                            </p>
                            <p className="text-sm text-muted-foreground leading-[1.625]">
                              {t('contractDetail.noDataDesc')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* {t('contractDetail.paymentHistory')} Section */}
          <div className="border border-border rounded-xl bg-card mb-6">
            <div className="px-6 py-6 space-y-2">
              <div className="flex items-center justify-between pb-2.5">
                <h2 className="text-base font-semibold leading-6">{t('contractDetail.paymentHistory')}</h2>
                {payments.length > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 px-3 gap-2 text-xs font-medium"
                    onClick={() => navigate(`/payments?contract=${contractId}&search=${encodeURIComponent(contract.companyName)}&service=${encodeURIComponent(contract.service)}`)}
                  >
                    {t('contractDetail.viewDetailedPaymentHistory')}
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
                      <h3 className="text-lg font-medium">{t('contractDetail.noPaymentsYet')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('contractDetail.noPaymentsDesc')}
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
                          <th className="text-left text-sm font-medium text-foreground h-10 px-2">                          {t('common.invoiceNo')}</th>
                          <th className="text-left text-sm font-medium text-foreground h-10 px-2">                          {t('common.period')}</th>
                          <th className="text-left text-sm font-medium text-foreground h-10 px-2">                          {t('common.date')}</th>
                          <th className="text-left text-sm font-medium text-foreground h-10 px-2">                          {t('contractDetail.status')}</th>
                          <th className="text-left text-sm font-medium text-foreground h-10 px-2">                          {t('common.paidAmount')}</th>
                          <th className="text-left text-sm font-medium text-foreground h-10 px-2">                          {t('common.difference')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentPayments.map((payment) => {
                          const getStatusBadge = (status: string) => {
                            if (status === 'Paid' || status === 'paid') {
                              return (
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-100 border border-emerald-200">
                                  <Check className="h-3 w-3" />
                                  <span className="text-xs font-semibold">{t('contractDetail.paid')}</span>
                                </div>
                              );
                            } else if (status === 'Pending' || status === 'unpaid') {
                              return (
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border border-border">
                                  <Loader className="h-3 w-3" />
                                  <span className="text-xs font-semibold">{t('contractDetail.pending')}</span>
                                </div>
                              );
                            } else if (status === 'Partial' || status === 'overdue') {
                              return (
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-100 border border-orange-200">
                                  <Minus className="h-3 w-3" />
                                  <span className="text-xs font-semibold">{t('contractDetail.partial')}</span>
                                </div>
                              );
                            }
                          };

                          return (
                            <tr key={payment.id} className="border-b border-border last:border-0">
                              <td className="h-[52px] p-2 w-[220px]">
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

                  {totalPaymentPages > 1 && (
                    <div className="flex items-center justify-end gap-2 pt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentPaymentPage(Math.max(0, currentPaymentPage - 1))}
                          disabled={currentPaymentPage === 0}
                          className="h-9 gap-1 pl-2.5 pr-4 text-sm font-medium disabled:opacity-50"
                        >
                          <ChevronLeftIcon className="h-4 w-4" />
                          Previous
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
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
      </div>

      {/* Add Note Modal */}
      <AddNoteModal
        open={noteModalOpen}
        onOpenChange={(open) => {
          setNoteModalOpen(open);
          if (!open) {
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

      {/* {t('contractDetail.deleteNote')} Confirmation Dialog */}
      <AlertDialog open={deleteNoteDialogOpen} onOpenChange={setDeleteNoteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('contractDetail.deleteNote')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('contractDetail.deleteNoteDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>            {t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-white hover:bg-destructive/90">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Billing Emails Modal */}
      <EditBillingEmailsModal
        open={editBillingEmailsOpen}
        onOpenChange={setEditBillingEmailsOpen}
        emails={contract?.billingEmails || []}
        onSave={handleSaveBillingEmails}
      />

      {/* Delete Contract Confirmation Dialog */}
      <AlertDialog open={deleteContractDialogOpen} onOpenChange={setDeleteContractDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('contractDetail.deleteContractTitle')}</AlertDialogTitle>
            <AlertDialogDescription
              dangerouslySetInnerHTML={{
                __html: t('contractDetail.deleteContractDesc', { number: contract?.contractNumber || contractId })
              }}
            />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>            {t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteContract} className="bg-destructive text-white hover:bg-destructive/90">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
