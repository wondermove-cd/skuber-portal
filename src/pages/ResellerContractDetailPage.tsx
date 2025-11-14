import { useEffect, useState } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, MoreVertical, Pencil, StickyNote, Trash2, Info, CircleCheck, CircleX, Loader, BarChart4, Check, Ban, X } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ContractDetail,
  BillingInfoFixedRate,
  BillingInfoPayAsYouGo,
} from '@/lib/mock/contractDetails';
import {
  getContractDetailById,
  getContractNotes,
  saveContractNote,
  deleteContractNote,
  ContractNote,
  getAllResellers,
  getAllCustomers,
} from '@/lib/data-store';
import { AddNoteModal } from '@/components/customers/AddNoteModal';
import { AddContractModal } from '@/components/contracts/AddContractModal';
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface DashboardLayoutContext {
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
}

export default function ResellerContractDetailPage() {
  const navigate = useNavigate();
  const { contractId } = useParams<{ contractId: string }>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { onToggleSidebar, onOpenNotifications } = useOutletContext<DashboardLayoutContext>();

  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ContractNote | null>(null);
  const [deleteNoteDialogOpen, setDeleteNoteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<ContractNote | null>(null);
  const [deleteContractDialogOpen, setDeleteContractDialogOpen] = useState(false);
  const [addContractModalOpen, setAddContractModalOpen] = useState(false);
  const [cancelSubmissionDialogOpen, setCancelSubmissionDialogOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [wholesaleTerms, setWholesaleTerms] = useState<any>(null);

  // Notes
  const [notes, setNotes] = useState<ContractNote[]>([]);

  useEffect(() => {
    if (contractId) {
      const contractDetail = getContractDetailById(contractId);
      if (contractDetail) {
        // Check if reseller has access to this contract
        if (user?.resellerId && contractDetail.resellerId !== user.resellerId) {
          // Reseller trying to access contract that's not theirs
          setContract(null);
          return;
        }
        setContract(contractDetail);
        setIsActive(contractDetail.status === 'active');

        // Get reseller's wholesale pricing for this service
        if (contractDetail.reseller && contractDetail.reseller !== 'N/A') {
          // Find reseller by name (since contract stores reseller name, not ID)
          const allResellers = getAllResellers();
          const reseller = allResellers.find((r: any) => r.name === contractDetail.reseller);

          if (reseller && reseller.pricing) {
            // Map service names
            const serviceMap: Record<string, string> = {
              'Optimization': 'Skuber⁺ Optimization',
              'Observability': 'Skuber⁺ Observability',
              'Management': 'Skuber⁺ Management',
            };
            const serviceName = serviceMap[contractDetail.service] || contractDetail.service;
            setWholesaleTerms(reseller.pricing[serviceName]);
          }
        }
      }
    }
  }, [contractId, user]);

  // Function to reload notes from data store
  const reloadNotes = () => {
    if (!contractId) return;
    const contractNotes = getContractNotes(contractId);
    setNotes(contractNotes);
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
      title: t('note.noteAdded'),
      description: t('note.noteAddedDesc'),
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
      title: t('note.noteUpdated'),
      description: t('note.noteUpdatedDesc'),
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
      title: t('note.noteDeleted'),
      description: t('note.noteDeletedDesc'),
    });
  };

  const handleDeleteCancel = () => {
    setDeleteNoteDialogOpen(false);
    setNoteToDelete(null);
  };

  // Format chart data for vCPU Usage (Fixed Rate)
  const formatChartData = () => {
    if (!contract?.vcpuUsage) return [];
    return contract.vcpuUsage.map((data) => ({
      month: data.month,
      value: data.used,
      limit: data.limit,
    }));
  };

  // Format usage cost chart data for Pay-as-you-go
  const formatUsageCostData = () => {
    if (!contract?.usageCostData) return [];
    return contract.usageCostData.map((data) => ({
      month: data.month,
      cost: data.cost,
      minimumCharge: data.minimumCharge,
    }));
  };

  // Calculate average vCPU usage for Pay-as-you-go
  const calculateAverageVCPU = () => {
    if (!contract?.usageCostData || contract.usageCostData.length === 0) return 0;
    const total = contract.usageCostData.reduce((sum, data) => sum + data.cost, 0);
    return Math.round(total / contract.usageCostData.length);
  };

  const handleStatusChange = (checked: boolean) => {
    setIsActive(checked);
    if (contract) {
      const updatedContract = { ...contract, status: checked ? 'active' : 'inactive' };
      setContract(updatedContract);
      // Here you would typically save to backend
      toast({
        title: 'Status Updated',
        description: `Contract status changed to ${checked ? 'Active' : 'Inactive'}`,
      });
    }
  };

  const handleDeleteContractClick = () => {
    setDeleteContractDialogOpen(true);
  };

  const handleDeleteContractConfirm = () => {
    if (!contractId) return;

    // Delete from contracts list
    const contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
    const updatedContracts = contracts.filter((c: any) => c.id !== contractId);
    localStorage.setItem('contracts', JSON.stringify(updatedContracts));

    // Delete from contract details
    const contractDetails = JSON.parse(localStorage.getItem('contractDetails') || '{}');
    delete contractDetails[contractId];
    localStorage.setItem('contractDetails', JSON.stringify(contractDetails));

    setDeleteContractDialogOpen(false);

    toast({
      title: t('contractDetail.contractDeleted'),
      description: t('contractDetail.contractDeletedDesc'),
    });

    // Navigate back to contracts page
    navigate('/dashboard/contracts');
  };

  const handleDeleteContractCancel = () => {
    setDeleteContractDialogOpen(false);
  };

  const handleRegisterNewContract = () => {
    // Open the Add Contract modal with pre-filled customer info
    setAddContractModalOpen(true);
  };

  const handleContractAdded = (deleteRejected: boolean) => {
    // If user checked the box to delete rejected contract
    if (deleteRejected && contractId) {
      // Delete the rejected contract
      const contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
      const updatedContracts = contracts.filter((c: any) => c.id !== contractId);
      localStorage.setItem('contracts', JSON.stringify(updatedContracts));

      const contractDetails = JSON.parse(localStorage.getItem('contractDetails') || '{}');
      delete contractDetails[contractId];
      localStorage.setItem('contractDetails', JSON.stringify(contractDetails));

      toast({
        title: t('contractDetail.rejectedContractDeleted'),
        description: t('contractDetail.rejectedContractDeletedDesc'),
      });
    }

    // Navigate to contracts page
    navigate('/dashboard/contracts');
  };

  const handleCancelSubmissionClick = () => {
    setCancelSubmissionDialogOpen(true);
  };

  const handleCancelSubmissionConfirm = () => {
    if (!contractId) return;

    // Update contract approval status to 'cancelled'
    const contractDetails = JSON.parse(localStorage.getItem('contractDetails') || '{}');
    if (contractDetails[contractId]) {
      contractDetails[contractId].approvalStatus = 'cancelled';
      localStorage.setItem('contractDetails', JSON.stringify(contractDetails));
    }

    // Update in contracts list as well
    const contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
    const contractIndex = contracts.findIndex((c: any) => c.id === contractId);
    if (contractIndex !== -1) {
      contracts[contractIndex].approvalStatus = 'cancelled';
      localStorage.setItem('contracts', JSON.stringify(contracts));
    }

    setCancelSubmissionDialogOpen(false);

    toast({
      title: t('contractDetail.submissionCancelled'),
      description: t('contractDetail.submissionCancelledDesc'),
    });

    // Refresh the page to show updated status
    window.location.reload();
  };

  const handleCancelSubmissionCancel = () => {
    setCancelSubmissionDialogOpen(false);
  };

  if (!contract) {
    return (
      <>
        <Header
          onToggleSidebar={onToggleSidebar}
          onOpenNotifications={onOpenNotifications}
        />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">{t('contractDetail.contractNotFound')}</p>
          </div>
        </div>
      </>
    );
  }

  const billingInfo = contract.billingInfo;
  const isFixedRate = billingInfo?.type === 'Fixed Rate';
  const isPayAsYouGo = billingInfo?.type === 'Pay-as-you-go';

  return (
    <>
      <Header
        onToggleSidebar={onToggleSidebar}
        onOpenNotifications={onOpenNotifications}
      />
      <div className="flex-1 overflow-auto p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6 min-h-[36px]">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handleBack}
              className="h-7 w-7 shrink-0 bg-background"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold leading-7">{contract.contractId || contract.id}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-5 px-2 text-xs font-semibold">
                {contract.service}
              </Badge>
              <Badge variant="outline" className="h-5 px-2 text-xs font-semibold">
                {contract.pricingModel}
              </Badge>
            </div>
          </div>
          {/* Delete button for pending/rejected contracts */}
          {(contract.approvalStatus === 'pending' || contract.approvalStatus === 'rejected') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteContractClick}
              className="h-9 gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="h-4 w-4" />
              {t('common.delete')}
            </Button>
          )}
        </div>

        {/* Alert for Pending Status */}
        {contract.approvalStatus === 'pending' && (
          <Alert className="mb-6 bg-card border-border">
            <Info className="h-4 w-4 text-foreground" />
            <AlertDescription className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-foreground">{t('contractDetail.pendingApprovalTitle')}</p>
                <p className="text-sm text-muted-foreground">{t('contractDetail.pendingApprovalDesc')}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-4 shrink-0"
                onClick={handleCancelSubmissionClick}
              >
                {t('contractDetail.confirmCancel')}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Alert for Rejected Status */}
        {contract.approvalStatus === 'rejected' && (
          <Alert className="mb-6 bg-card border-border">
            <CircleX className="h-4 w-4 text-destructive" />
            <AlertDescription className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-foreground">{t('contractDetail.rejectedTitle')}</p>
                <p className="text-sm text-muted-foreground">{t('contractDetail.rejectedDesc')}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-4 shrink-0"
                onClick={handleRegisterNewContract}
              >
                {t('contractDetail.registerNewContract')}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Alert for Approved Status */}
        {(contract.approvalStatus === 'approved' || !contract.approvalStatus) && contract.status !== 'active' && (
          <Alert className="mb-6 bg-card border-border">
            <Info className="h-4 w-4 text-foreground" />
            <AlertDescription className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-foreground">{t('contractDetail.approvedTitle')}</p>
                <p className="text-sm text-muted-foreground">{t('contractDetail.approvedDesc')}</p>
              </div>
              <Button
                variant="default"
                size="sm"
                className="ml-4 shrink-0"
                onClick={() => handleStatusChange(true)}
              >
                {t('contractDetail.activateContract')}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Contract Info Card */}
          <div className="border border-border rounded-xl bg-card">
            <div className="flex items-center justify-between px-6 py-6 min-h-[68px]">
              <h2 className="text-base font-semibold leading-none">Contract info.</h2>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 px-3 gap-2 text-xs font-medium"
                onClick={() => navigate(`/customers/${contract.customerId || contract.companyName}`)}
              >
                View Company Details
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="px-6 pb-6">
              <div className="flex flex-col gap-[14px]">
                <div className="flex items-center justify-between text-sm leading-5">
                  <div className="text-muted-foreground">{t('contractDetail.contractId')}</div>
                  <div className="text-card-foreground">{contract.contractId || contract.id}</div>
                </div>
                <div className="flex items-center justify-between text-sm leading-5">
                  <div className="text-muted-foreground">{t('contractDetail.reseller')}</div>
                  <div className="text-card-foreground">{contract.reseller}</div>
                </div>
                <div className="flex items-center justify-between text-sm leading-5">
                  <div className="text-muted-foreground">{t('contractDetail.service')}</div>
                  <div className="text-card-foreground">{contract.service}</div>
                </div>
                <div className="flex items-center justify-between text-sm leading-5">
                  <div className="text-muted-foreground">{t('contractDetail.status')}</div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={isActive}
                      onCheckedChange={handleStatusChange}
                      disabled={contract.approvalStatus === 'pending' || contract.approvalStatus === 'rejected' || contract.approvalStatus === 'cancelled'}
                    />
                    <span className="text-card-foreground text-sm">
                      {isActive ? t('common.active') : t('common.inactive')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm leading-5">
                  <div className="text-muted-foreground">{t('contractDetail.companyName')}</div>
                  <div className="text-card-foreground">{contract.companyName}</div>
                </div>
                {contract.contactPerson && (
                  <>
                    <div className="flex items-center justify-between text-sm leading-5">
                      <div className="text-muted-foreground">{t('contractDetail.contactPerson')}</div>
                      <div className="text-card-foreground">{contract.contactPerson.name}</div>
                    </div>
                    <div className="flex items-center justify-between text-sm leading-5">
                      <div className="text-muted-foreground">{t('contractDetail.contactPersonEmail')}</div>
                      <div className="text-card-foreground">{contract.contactPerson.email}</div>
                    </div>
                  </>
                )}
                {contract.createdAt && (
                  <div className="flex items-center justify-between text-sm leading-5">
                    <div className="text-muted-foreground">{t('contractDetail.createdAt')}</div>
                    <div className="text-card-foreground">{contract.createdAt}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Note Card */}
          <div className="border border-border rounded-xl bg-card">
            <div className="flex items-center justify-between px-6 py-6">
              <h2 className="text-base font-semibold leading-none">
                {t('note.title')} {notes.length > 0 && `(${notes.length})`}
              </h2>
              {user?.role !== 'reseller_viewer' && (
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
              <div className="h-[364px] flex items-center justify-center px-6">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <StickyNote className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-medium">{t('note.noNotes')}</h3>
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
                          {user?.role !== 'reseller_viewer' && (
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
                                {user?.role === 'reseller_admin' && (
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

        {/* Second Row */}
        <div className="grid grid-cols-2 gap-6">
          {/* Wholesale Terms Card */}
          <div className="border border-border rounded-xl bg-card">
            <div className="flex items-center justify-between px-6 py-6 min-h-[68px]">
              <h2 className="text-base font-semibold leading-none">{t('contractDetail.wholesaleTerms')}</h2>
            </div>
            <div className="flex flex-col gap-4 px-6 pb-6">
              {!contract.wholesalePricing ? (
                <div className="flex items-center justify-center h-[258px]">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Info className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-medium">{t('contractDetail.noWholesaleTerms')}</h3>
                      <p className="text-sm text-muted-foreground">
                        Wholesale pricing is not configured for this service.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Pricing Details */}
                  <div className="flex flex-col gap-[14px]">
                    <div className="flex items-center justify-between text-sm leading-5">
                      <div className="text-muted-foreground">{t('contractDetail.pricingModel')}</div>
                      <div className="text-card-foreground">{contract.pricingModel}</div>
                    </div>

                    <div className="flex items-center justify-between text-sm leading-5">
                      <div className="text-muted-foreground">{t('contractDetail.contractPeriod')}</div>
                      <div className="text-card-foreground">
                        {contract.startDate} - {contract.endDate || t('contractDetail.noEndDate')}
                        {contract.endDate && contract.startDate && (() => {
                          const start = new Date(contract.startDate.replace(/\.\s/g, '-'));
                          const end = new Date(contract.endDate.replace(/\.\s/g, '-'));
                          const years = Math.round((end.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                          return ` (${years} year${years > 1 ? 's' : ''})`;
                        })()}
                      </div>
                    </div>

                    {contract.pricingModel === 'Fixed Rate' && contract.wholesalePricing && (
                      <>
                        {contract.endDate && contract.startDate && (() => {
                          const start = new Date(contract.startDate.replace(/\.\s/g, '-'));
                          const end = new Date(contract.endDate.replace(/\.\s/g, '-'));
                          const years = Math.round((end.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

                          return (
                            <>
                              <div className="flex items-center justify-between text-sm leading-5">
                                <div className="text-muted-foreground">{t('contractDetail.contractAmount')}</div>
                                <div className="text-card-foreground">{contract.wholesalePricing.contractAmount} / {years} year{years > 1 ? 's' : ''}</div>
                              </div>
                              <div className="flex items-center justify-between text-sm leading-5">
                                <div className="text-muted-foreground">{t('contractDetail.includedAllocation')}</div>
                                <div className="text-card-foreground">{contract.wholesalePricing.includedAllocation} vCPU</div>
                              </div>
                            </>
                          );
                        })()}
                      </>
                    )}

                    {contract.pricingModel === 'Pay-as-you-go' && contract.wholesalePricing && (
                      <>
                        <div className="flex items-center justify-between text-sm leading-5">
                          <div className="text-muted-foreground">{t('contractDetail.contractAmount')}</div>
                          <div className="text-card-foreground">${contract.wholesalePricing.vcpuUnitPrice} / hour</div>
                        </div>
                        {contract.wholesalePricing.minimumCharge && (
                          <div className="flex items-center justify-between text-sm leading-5">
                            <div className="text-muted-foreground">{t('contractDetail.minimumCharge')}</div>
                            <div className="text-card-foreground">${contract.wholesalePricing.minimumCharge} / month</div>
                          </div>
                        )}
                      </>
                    )}

                    {contract.pricingModel === 'Trial' && contract.wholesalePricing && (
                      <>
                        <div className="flex items-center justify-between text-sm leading-5">
                          <div className="text-muted-foreground">{t('contractDetail.contractAmount')}</div>
                          <div className="text-card-foreground">Free</div>
                        </div>
                        <div className="flex items-center justify-between text-sm leading-5">
                          <div className="text-muted-foreground">{t('contractDetail.usageLimit')}</div>
                          <div className="text-card-foreground">{contract.wholesalePricing.usageLimit} vCPU-hour</div>
                        </div>
                        {contract.wholesalePricing.trialPeriod && (
                          <div className="flex items-center justify-between text-sm leading-5">
                            <div className="text-muted-foreground">{t('contractDetail.trialPeriod')}</div>
                            <div className="text-card-foreground">{contract.wholesalePricing.trialPeriod} days</div>
                          </div>
                        )}
                      </>
                    )}

                    {(contract.pricingModel === 'Fixed Rate' || contract.pricingModel === 'Pay-as-you-go') && contract.wholesalePricing && (
                      <div className="flex items-center justify-between text-sm leading-5">
                        <div className="text-muted-foreground">{t('contractDetail.taxIncluded')}</div>
                        <div className="text-card-foreground">{contract.wholesalePricing.taxIncluded ? 'Y' : 'N'}</div>
                      </div>
                    )}
                  </div>

                  {/* Separator */}
                  <div className="flex items-start justify-between py-2 h-4">
                    <div className="h-px w-full bg-border" />
                  </div>

                  {/* Approval Status Section */}
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-medium leading-5">{t('contractDetail.approvalStatus')}</p>
                      </div>

                      <div className="flex flex-col gap-[14px]">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground leading-5">{t('contractDetail.status')}</p>
                          <div>
                            {contract.approvalStatus === 'pending' && (
                              <Badge variant="outline" className="gap-1">
                                <Loader className="h-3 w-3" />
                                {t('contracts.pending')}
                              </Badge>
                            )}
                            {(contract.approvalStatus === 'approved' || !contract.approvalStatus) && (
                              <Badge variant="outline" className="gap-1 bg-green-100 border-green-200">
                                <Check className="h-3 w-3" />
                                {t('contracts.approved')}
                              </Badge>
                            )}
                            {contract.approvalStatus === 'rejected' && (
                              <Badge variant="outline" className="gap-1 bg-red-100 border-red-200">
                                <Ban className="h-3 w-3" />
                                {t('contracts.rejected')}
                              </Badge>
                            )}
                            {contract.approvalStatus === 'cancelled' && (
                              <Badge variant="outline" className="gap-1 bg-orange-100 border-orange-200">
                                <X className="h-3 w-3" />
                                {t('contracts.cancelled')}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {contract.submittedDate && (
                          <div className="flex items-center justify-between text-sm leading-5">
                            <div className="text-muted-foreground">{t('common.submitted')}</div>
                            <div className="text-card-foreground">{contract.submittedDate}</div>
                          </div>
                        )}

                        {contract.approvalStatus === 'rejected' && contract.rejectionReason && (
                          <div className="flex flex-col gap-2">
                            <p className="text-sm text-muted-foreground leading-5">{t('contractDetail.wmNote')}</p>
                            <div className="bg-background border border-border rounded-md px-4 py-2 w-full">
                              <p className="text-sm text-card-foreground leading-5">
                                {contract.rejectionReason}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Review Time Caption */}
                  <div className="flex items-center h-9">
                    <p className="text-sm text-muted-foreground leading-5">{t('contractDetail.reviewTime')}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* vCPU Usage Card */}
          <div className="border border-border rounded-xl bg-card flex flex-col">
            <div className="flex items-center justify-between px-6 py-6 min-h-[68px]">
              <h2 className="text-base font-semibold leading-none">vCPU Usage</h2>
            </div>
            {/* Fixed Rate - vCPU Usage Chart */}
            {contract.vcpuUsage && contract.vcpuUsage.length > 0 && contract.pricingModel === 'Fixed Rate' ? (
              <div className="px-6 pb-6">
                <ChartContainer
                  config={{
                    value: {
                      label: "vCPU Usage",
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
                      domain={[0, Math.ceil(((contract.wholesalePricing as any)?.includedAllocation || 400) * 1.2)]}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {contract.wholesalePricing && (contract.wholesalePricing as any).includedAllocation && (
                      <ReferenceLine
                        y={(contract.wholesalePricing as any).includedAllocation}
                        stroke="#f59e0b"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        label={{
                          value: `Included vCPU: ${(contract.wholesalePricing as any).includedAllocation}`,
                          position: 'top',
                          fill: 'hsl(var(--muted-foreground))',
                          fontSize: 12,
                        }}
                      />
                    )}
                    <Bar
                      dataKey="value"
                      fill="var(--color-value)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            ) : contract.usageCostData && contract.usageCostData.length > 0 && contract.pricingModel === 'Pay-as-you-go' ? (
              /* Pay-as-you-go - Usage Cost Chart */
              <div className="px-6 pb-6">
                <ChartContainer
                  config={{
                    cost: {
                      label: "Usage Cost",
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
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center px-6">
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

      {/* Delete Note Confirmation Dialog */}
      <AlertDialog open={deleteNoteDialogOpen} onOpenChange={setDeleteNoteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('note.deleteNote')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('note.confirmDelete')} {t('note.deleteDesc')}
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

      {/* Delete Contract Confirmation Dialog */}
      <AlertDialog open={deleteContractDialogOpen} onOpenChange={setDeleteContractDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('contractDetail.deleteContract')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('contractDetail.confirmDeleteContract')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteContractCancel}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContractConfirm} className="bg-destructive text-white hover:bg-destructive/90">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Submission Confirmation Dialog */}
      <AlertDialog open={cancelSubmissionDialogOpen} onOpenChange={setCancelSubmissionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('contractDetail.cancelSubmission')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('contractDetail.confirmCancelSubmission')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelSubmissionCancel}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelSubmissionConfirm}>
              {t('contractDetail.confirmCancel')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Contract Modal */}
      <AddContractModal
        open={addContractModalOpen}
        onOpenChange={setAddContractModalOpen}
        customers={getAllCustomers()}
        onAddCustomer={() => {}}
        initialCustomerId={contract?.customerId}
        initialStep={3}
        onContractAdded={handleContractAdded}
        rejectedContractId={contract?.approvalStatus === 'rejected' ? contractId : undefined}
      />
    </>
  );
}
