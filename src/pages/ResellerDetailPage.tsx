import { useEffect, useState } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { ChevronLeft, ChevronRight, PenLine, Plus, Trash2, MoreVertical, Pencil, StickyNote, Tag, DollarSign, Copy, Check, Loader, Minus, ChevronLeft as ChevronLeftIcon, CircleCheck, CircleX, CircleAlert, LoaderCircle, Ban, X, ArrowUpDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  getResellerById,
  getResellerNotes,
  saveResellerNote,
  deleteResellerNote,
  deleteReseller,
  saveReseller,
  ResellerNote,
} from '@/lib/data-store';
import { mockResellerPayments } from '@/lib/mock/payments';
import { PricingData } from '@/lib/mock/resellers';
import { AddNoteModal } from '@/components/customers/AddNoteModal';
import { EditBillingEmailsModal } from '@/components/contracts/EditBillingEmailsModal';
import { EditResellerInfoModal } from '@/components/reseller/EditResellerInfoModal';
import { EditPricingModal } from '@/components/reseller/EditPricingModal';
import { AddServiceModal } from '@/components/reseller/AddServiceModal';
import { RejectContractModal } from '@/components/dashboard/RejectContractModal';
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

export default function ResellerDetailPage() {
  const navigate = useNavigate();
  const { resellerId } = useParams<{ resellerId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { onToggleSidebar, onOpenNotifications } = useOutletContext<DashboardLayoutContext>();
  const [reseller, setReseller] = useState<any>(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ResellerNote | null>(null);
  const [deleteNoteDialogOpen, setDeleteNoteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<ResellerNote | null>(null);
  const [editBillingEmailsOpen, setEditBillingEmailsOpen] = useState(false);
  const [editResellerInfoOpen, setEditResellerInfoOpen] = useState(false);
  const [deleteResellerDialogOpen, setDeleteResellerDialogOpen] = useState(false);
  const [editPricingOpen, setEditPricingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);

  // Calculate days left utility function
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

  // Notes
  const [notes, setNotes] = useState<ResellerNote[]>([]);

  // Payment pagination
  const [currentPaymentPage, setCurrentPaymentPage] = useState(0);
  const paymentsPerPage = 5;

  // Contract pagination
  const [currentContractPage, setCurrentContractPage] = useState(1);
  const contractsPerPage = 5;

  // Sorting state for contracts table
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Mock contracts data
  const mockContracts = [
    { contractNo: 'C-2025-001', companyName: '삼성전자', service: 'Observability', pricingModel: 'Pay-as-you-go', vcpuUnitPrice: '$0.30 /hour', minimumCharge: '$50.00 /month', contractAmount: '-', includedAllocation: '-', submitted: '2025. 01. 15', status: 'Pending' },
    { contractNo: 'C-2025-002', companyName: '카카오엔터', service: 'Observability', pricingModel: 'Fixed Rate (1 Year)', vcpuUnitPrice: '-', minimumCharge: '-', contractAmount: '$5,000.00 /year', includedAllocation: '800 vCPU', submitted: '2025. 01. 14', status: 'Approved' },
    { contractNo: 'C-2025-003', companyName: 'LG', service: 'Observability', pricingModel: 'Fixed Rate (3 Year)', vcpuUnitPrice: '-', minimumCharge: '-', contractAmount: '$6,000.00 /year', includedAllocation: '900 vCPU', submitted: '2025. 01. 13', status: 'Approved' },
    { contractNo: 'C-2025-004', companyName: 'LG', service: 'Observability', pricingModel: 'Fixed Rate (5 Year)', vcpuUnitPrice: '-', minimumCharge: '-', contractAmount: '$6,000.00 /year', includedAllocation: '900 vCPU', submitted: '2025. 01. 12', status: 'Rejected' },
    { contractNo: 'C-2025-005', companyName: 'LG', service: 'Observability', pricingModel: 'Fixed Rate (5 Year)', vcpuUnitPrice: '-', minimumCharge: '-', contractAmount: '$6,000.00 /year', includedAllocation: '900 vCPU', submitted: '2025. 01. 11', status: 'Approved' },
  ];

  // Sort contracts by submitted date
  const sortedContracts = [...mockContracts].sort((a, b) => {
    const dateA = new Date(a.submitted.replace(/\.\s/g, '-')).getTime();
    const dateB = new Date(b.submitted.replace(/\.\s/g, '-')).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const handleSortToggle = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  const handleRejectContract = (contract: any) => {
    const isPayAsYouGo = contract.pricingModel === 'Pay-as-you-go';

    if (isPayAsYouGo) {
      setSelectedContract({
        reseller: reseller?.name || 'Reseller',
        customer: contract.companyName,
        contractId: contract.contractNo,
        service: contract.service,
        pricingModel: 'Pay-as-you-go',
        contractPeriod: '2024.12.31 - no end date',
        vcpuUnitPrice: contract.vcpuUnitPrice,
        minimumCharge: contract.minimumCharge,
        taxIncluded: 'Y',
      });
    } else {
      setSelectedContract({
        reseller: reseller?.name || 'Reseller',
        customer: contract.companyName,
        contractId: contract.contractNo,
        service: contract.service,
        pricingModel: 'Fixed Rate',
        contractPeriod: '2024.12.31 - 2025.12.31 (1 year)',
        amount: contract.contractAmount,
        includedAllocation: contract.includedAllocation,
        taxIncluded: 'Y',
      });
    }
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = (reason: string) => {
    console.log('Reject contract with reason:', reason);
    toast({
      title: 'Contract Rejected',
      description: 'The contract has been rejected successfully.',
    });
  };

  // Contract pagination
  const totalContractPages = Math.ceil(sortedContracts.length / contractsPerPage);
  const startContractIndex = (currentContractPage - 1) * contractsPerPage;
  const endContractIndex = startContractIndex + contractsPerPage;
  const currentContracts = sortedContracts.slice(startContractIndex, endContractIndex);

  useEffect(() => {
    if (resellerId) {
      const resellerData = getResellerById(resellerId);
      if (resellerData) {
        setReseller(resellerData);
      }
    }
  }, [resellerId]);

  // Function to reload notes from data store
  const reloadNotes = () => {
    if (!resellerId) return;
    const resellerNotes = getResellerNotes(resellerId);
    setNotes(resellerNotes);
  };

  // Load notes initially
  useEffect(() => {
    reloadNotes();
  }, [resellerId]);

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
  }, [resellerId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDelete = () => {
    setDeleteResellerDialogOpen(true);
  };

  const handleCopyInvoiceNo = (invoiceNo: string) => {
    navigator.clipboard.writeText(invoiceNo);
    toast({
      title: t('common.copied'),
      description: t('common.invoiceCopiedDesc'),
    });
  };

  const confirmDeleteReseller = () => {
    if (!resellerId) return;

    deleteReseller(resellerId);

    setDeleteResellerDialogOpen(false);

    toast({
      title: t('resellerDetail.resellerDeleted'),
      description: t('resellerDetail.resellerDeletedDesc', { name: reseller?.name || resellerId }),
    });

    // Navigate back to resellers list
    navigate('/reseller');
  };

  const handleAddNote = (content: string) => {
    if (!resellerId) return;

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}. ${month}. ${day}`;

    const newNote: ResellerNote = {
      id: `note-${Date.now()}`,
      resellerId: resellerId,
      content,
      author: user?.name || 'Unknown',
      createdAt: formattedDate,
    };

    saveResellerNote(newNote);
    reloadNotes();

    toast({
      title: t('note.noteAdded'),
      description: t('note.noteAddedDesc'),
    });
  };

  const handleEditNote = (content: string) => {
    if (!editingNote) return;

    const updatedNote: ResellerNote = {
      ...editingNote,
      content,
    };

    saveResellerNote(updatedNote);
    reloadNotes();

    setEditingNote(null);
    toast({
      title: t('note.noteUpdated'),
      description: t('note.noteUpdatedDesc'),
    });
  };

  const handleOpenEditNote = (note: ResellerNote) => {
    setEditingNote(note);
    setNoteModalOpen(true);
  };

  const handleDeleteClick = (note: ResellerNote) => {
    setNoteToDelete(note);
    setDeleteNoteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!noteToDelete) return;

    deleteResellerNote(noteToDelete.id);
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

  const handleSaveBillingEmails = (emails: string[]) => {
    if (!resellerId) return;

    // Update reseller with new billing emails
    const updatedReseller = { ...reseller, billingEmails: emails };

    const stored = localStorage.getItem('resellers');
    const resellers = stored ? JSON.parse(stored) : [];
    const index = resellers.findIndex((r: any) => r.id === resellerId);

    if (index !== -1) {
      resellers[index] = updatedReseller;
      localStorage.setItem('resellers', JSON.stringify(resellers));
      setReseller(updatedReseller);

      toast({
        title: t('resellerDetail.billingEmailsUpdated'),
        description: t('resellerDetail.billingEmailsUpdatedDesc'),
      });
    }
  };

  const handleSaveResellerInfo = (updatedReseller: any) => {
    if (!resellerId) return;

    saveReseller(updatedReseller);
    setReseller(updatedReseller);

    toast({
      title: t('resellerDetail.resellerUpdated'),
      description: t('resellerDetail.resellerUpdatedDesc', { name: updatedReseller.name }),
    });
  };

  const handleEditPricing = (serviceName: string) => {
    setSelectedService(serviceName);
    setEditPricingOpen(true);
  };

  const handleSavePricing = (serviceName: string, pricingData: PricingData) => {
    if (!resellerId) return;

    // Update reseller pricing
    const updatedPricing = {
      ...reseller.pricing,
      [serviceName]: pricingData,
    };

    const updatedReseller = {
      ...reseller,
      pricing: updatedPricing,
    };

    saveReseller(updatedReseller);
    setReseller(updatedReseller);

    toast({
      title: t('resellerDetail.pricingUpdated'),
      description: t('resellerDetail.pricingUpdatedDesc', { service: serviceName }),
    });
  };

  const handleAddService = (serviceName: string, pricingData: PricingData) => {
    if (!resellerId) return;

    // Add new service to pricing
    const updatedPricing = {
      ...reseller.pricing,
      [serviceName]: pricingData,
    };

    const updatedReseller = {
      ...reseller,
      pricing: updatedPricing,
    };

    saveReseller(updatedReseller);
    setReseller(updatedReseller);

    toast({
      title: t('resellerDetail.serviceAdded'),
      description: t('resellerDetail.serviceAddedDesc', { service: serviceName }),
    });
  };

  // Notes are displayed without pagination (Apple Notes style)

  // Get payment history for this reseller
  const resellerPayments = mockResellerPayments.filter((payment: any) => payment.resellerId === resellerId);

  if (!reseller) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{t('resellerDetail.resellerNotFound')}</p>
      </div>
    );
  }

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
            <h1 className="text-xl font-semibold leading-7">{reseller.name}</h1>
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
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Reseller Info Section */}
          <div className="border border-border rounded-xl bg-card">
            <div className="flex items-center justify-between px-6 py-6 min-h-[68px]">
              <h2 className="text-base font-semibold leading-none">{t('resellerDetail.resellerInfo')}</h2>
              {user?.role !== 'wm_viewer' && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 px-3 gap-2 text-xs font-medium"
                  onClick={() => setEditResellerInfoOpen(true)}
                >
                  <PenLine className="h-4 w-4" />
                  {t('common.edit')}
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-[14px] px-6 pb-6">
              <div className="flex items-center justify-between text-sm leading-5">
                <div className="text-muted-foreground">{t('resellerDetail.resellerName')}</div>
                <div className="text-card-foreground">{reseller.name}</div>
              </div>
              <div className="flex items-center justify-between text-sm leading-5">
                <div className="text-muted-foreground">{t('resellerDetail.resellerId')}</div>
                <div className="text-card-foreground">{reseller.resellerId}</div>
              </div>
              <div className="flex items-center justify-between text-sm leading-5">
                <div className="text-muted-foreground">{t('common.country')}</div>
                <div className="text-card-foreground">{reseller.country}</div>
              </div>
              <div className="flex items-center justify-between text-sm leading-5">
                <div className="text-muted-foreground">{t('common.businessRegNo')}</div>
                <div className="text-card-foreground">{reseller.businessRegNo}</div>
              </div>
              <div className="flex items-center justify-between text-sm leading-5">
                <div className="text-muted-foreground">{t('resellerDetail.ceoRepresentative')}</div>
                <div className="text-card-foreground">{reseller.ceo}</div>
              </div>
              <div className="flex items-center justify-between text-sm leading-5">
                <div className="text-muted-foreground">{t('common.contactPerson')}</div>
                <div className="text-card-foreground">{reseller.contactPerson}</div>
              </div>
              <div className="flex items-center justify-between text-sm leading-5">
                <div className="text-muted-foreground">{t('common.contactPersonEmail')}</div>
                <div className="text-card-foreground">{reseller.contactEmail}</div>
              </div>
              <div className="flex items-center justify-between text-sm leading-5">
                <div className="text-muted-foreground">{t('common.createdAt')}</div>
                <div className="text-card-foreground">{reseller.createdAt}</div>
              </div>

              {/* Separator */}
              <div className="flex flex-col items-start justify-between py-2 h-4">
                <div className="h-px w-full bg-border" />
              </div>

              {/* Billing email address section */}
              {reseller.billingEmails && reseller.billingEmails.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-5">{t('resellerDetail.billingEmailAddress')} ({reseller.billingEmails.length})</p>
                    {user?.role !== 'wm_viewer' && (
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
                    {reseller.billingEmails.map((email: string, index: number) => (
                      <div
                        key={index}
                        className="bg-background border border-input h-9 px-3 py-1 rounded-md flex items-center text-sm text-foreground"
                      >
                        {email}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Note Section */}
          <div className="border border-border rounded-xl bg-card flex flex-col min-h-0 max-h-[500px]">
            <div className="flex items-center justify-between px-6 py-6 shrink-0 min-h-[68px]">
              <h2 className="text-base font-semibold leading-none">
                {t('note.title')} {notes.length > 0 && `(${notes.length})`}
              </h2>
              {user?.role !== 'wm_viewer' && (
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
                    <h3 className="text-lg font-medium">{t('resellerDetail.noNotesYet')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('resellerDetail.noNotesDesc')}
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
                          {user?.role !== 'wm_viewer' && (
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
                                {user?.role === 'wm_admin' && (
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
          <div className="px-6 py-6 space-y-2">
            <div className="flex items-center justify-between pb-2.5">
              <h2 className="text-base font-semibold leading-6">Contracts</h2>
            </div>

            <div className="space-y-8">
              {/* Statistics Cards */}
              <div className="grid grid-cols-4 gap-6">
                <div className="border border-border rounded-lg bg-card p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Contracts</span>
                  </div>
                  <div className="text-3xl font-bold">12</div>
                </div>
                <div className="border border-border rounded-lg bg-card p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Pending Review</span>
                  </div>
                  <div className="text-3xl font-bold">3</div>
                </div>
                <div className="border border-border rounded-lg bg-card p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Approved</span>
                  </div>
                  <div className="text-3xl font-bold">7</div>
                </div>
                <div className="border border-border rounded-lg bg-card p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Rejected</span>
                  </div>
                  <div className="text-3xl font-bold">2</div>
                </div>
              </div>

              {/* Table with Fixed Columns - scroll container wraps entire table */}
              <div className="flex flex-col">
                <div className="flex">
                  {/* Fixed Left Columns - Contract No & Company Name */}
                  <div className="w-[350px] shrink-0 border-r border-border">
                    <div className="flex h-10 border-b border-border">
                      <div className="w-[130px] px-2 flex items-center text-sm font-medium text-foreground">{t('common.contractNo')}</div>
                      <div className="w-[220px] px-2 flex items-center text-sm font-medium text-foreground">{t('common.companyName')}</div>
                    </div>
                    {currentContracts.map((contract, index) => (
                      <div key={contract.contractNo} className={`flex h-[52px] hover:bg-muted/50 cursor-pointer transition-colors ${index < currentContracts.length - 1 ? 'border-b border-border' : ''}`} onClick={() => navigate(`/contract/${contract.contractNo}`)}>
                        <div className="w-[130px] px-2 flex items-center text-sm">{contract.contractNo}</div>
                        <div className="w-[220px] px-2 flex items-center text-sm">{contract.companyName}</div>
                      </div>
                    ))}
                  </div>

                  {/* Scrollable Middle Columns */}
                  <div className="flex-1 overflow-x-auto">
                    <div className="min-w-[1040px]">
                      {/* Header */}
                      <div className="flex h-10 border-b border-border">
                        <div className="w-[140px] px-2 flex items-center text-sm font-medium text-foreground">{t('common.service')}</div>
                        <div className="w-[158px] px-2 flex items-center text-sm font-medium text-foreground">{t('common.pricingModel')}</div>
                        <div className="w-[158px] px-2 flex items-center text-sm font-medium text-foreground">{t('resellerDetail.vcpuUnitPrice')}</div>
                        <div className="w-[158px] px-2 flex items-center text-sm font-medium text-foreground">{t('resellerDetail.minimumCharge')}</div>
                        <div className="w-[158px] px-2 flex items-center text-sm font-medium text-foreground">{t('resellerDetail.contractAmount')}</div>
                        <div className="w-[158px] px-2 flex items-center text-sm font-medium text-foreground">{t('resellerDetail.includedAllocation')}</div>
                        <button
                          onClick={handleSortToggle}
                          className="w-[120px] px-2 flex items-center gap-1 text-sm font-medium text-foreground hover:text-foreground/80"
                        >
                          {t('common.submitted')}
                          <ArrowUpDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {/* Rows */}
                      {currentContracts.map((contract, index) => (
                        <div key={`middle-${contract.contractNo}`} className={`flex h-[52px] items-center hover:bg-muted/50 cursor-pointer transition-colors ${index < currentContracts.length - 1 ? 'border-b border-border' : ''}`} onClick={() => navigate(`/contract/${contract.contractNo}`)}>
                          <div className="w-[140px] px-2 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border border-border">
                              <span className="text-xs font-semibold text-foreground">{contract.service}</span>
                            </span>
                          </div>
                          <div className="w-[158px] px-2 flex items-center text-sm">{contract.pricingModel}</div>
                          <div className="w-[158px] px-2 flex items-center text-sm">{contract.vcpuUnitPrice}</div>
                          <div className="w-[158px] px-2 flex items-center text-sm">{contract.minimumCharge}</div>
                          <div className="w-[158px] px-2 flex items-center text-sm">{contract.contractAmount}</div>
                          <div className="w-[158px] px-2 flex items-center text-sm">{contract.includedAllocation}</div>
                          <div className="w-[120px] px-2 flex items-center text-sm">{contract.submitted}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fixed Right Columns - Status & Actions */}
                  <div className="w-[313px] shrink-0 border-l border-border">
                    {/* Header */}
                    <div className="flex h-10 border-b border-border">
                      <div className="w-[140px] px-2 flex items-center text-sm font-medium text-foreground">{t('contractDetail.status')}</div>
                      <div className="w-[173px] px-2"></div>
                    </div>
                    {/* Rows */}
                    {currentContracts.map((contract, index) => {
                      const status = contract.status;
                      const isPending = status === 'Pending';
                      const isApproved = status === 'Approved';
                      const isRejected = status === 'Rejected';

                      return (
                        <div key={`status-${contract.contractNo}`} className={`flex h-[52px] items-center hover:bg-muted/50 cursor-pointer transition-colors ${index < currentContracts.length - 1 ? 'border-b border-border' : ''}`} onClick={() => navigate(`/contract/${contract.contractNo}`)}>
                          <div className="w-[140px] px-2 flex items-center">
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border border-border">
                                <Loader className="h-3 w-3 text-foreground" />
                                <span className="text-xs font-semibold text-foreground">Pending</span>
                              </span>
                            )}
                            {isApproved && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-100 border border-green-200">
                                <Check className="h-3 w-3 text-foreground" />
                                <span className="text-xs font-semibold text-foreground">Approved</span>
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 border border-red-200">
                                <Ban className="h-3 w-3 text-foreground" />
                                <span className="text-xs font-semibold text-foreground">Rejected</span>
                              </span>
                            )}
                          </div>
                          <div className="w-[173px] px-2 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            {isPending ? (
                              <>
                                <Button size="sm" className="h-8 px-3 text-xs bg-foreground hover:bg-foreground/90 text-background">Approval</Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-3 text-xs"
                                  onClick={() => handleRejectContract(contract)}
                                >
                                  Rejection
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button size="sm" className="h-8 px-3 text-xs bg-muted text-muted-foreground cursor-not-allowed" disabled>Approval</Button>
                                <Button variant="outline" size="sm" className="h-8 px-3 text-xs opacity-50 cursor-not-allowed" disabled>Rejection</Button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-end pt-4">
                {totalContractPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentContractPage(Math.max(1, currentContractPage - 1))}
                      disabled={currentContractPage === 1}
                      className="h-9 gap-1 pl-2.5 pr-4 text-sm font-medium disabled:opacity-50"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                      {t('common.previous')}
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      {currentContractPage} / {totalContractPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentContractPage(Math.min(totalContractPages, currentContractPage + 1))}
                      disabled={currentContractPage === totalContractPages}
                      className="h-9 gap-1 pl-4 pr-2.5 text-sm font-medium disabled:opacity-50"
                    >
                      {t('common.next')}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment History Section */}
        <div className="border border-border rounded-xl bg-card mb-6">
          <div className="px-6 py-6 space-y-2">
            <div className="flex items-center justify-between pb-2.5">
              <h2 className="text-base font-semibold leading-6">{t('resellerDetail.paymentHistory')}</h2>
              {resellerPayments.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 px-3 gap-2 text-xs font-medium"
                  onClick={() => navigate(`/payments?reseller=${resellerId}&period=all`)}
                >
                  {t('resellerDetail.viewDetailedPaymentHistory')}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            {resellerPayments.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-medium">{t('resellerDetail.noPaymentsYet')}</h3>
                    <p className="text-sm text-muted-foreground">{t('resellerDetail.noPaymentsDesc')}</p>
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
                        <th className="text-left text-sm font-medium text-foreground h-10 px-2">{t('common.status')}</th>
                        <th className="text-left text-sm font-medium text-foreground h-10 px-2">{t('common.paidAmount')}</th>
                        <th className="text-left text-sm font-medium text-foreground h-10 px-2">{t('common.difference')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resellerPayments.slice(currentPaymentPage * paymentsPerPage, (currentPaymentPage + 1) * paymentsPerPage).map((payment: any) => {
                        const getStatusBadge = (status: string) => {
                          const statusLower = status.toLowerCase();
                          if (statusLower === 'paid') {
                            return (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-100 border border-emerald-200">
                                <Check className="h-3 w-3" />
                                <span className="text-xs font-semibold">{t('status.paid')}</span>
                              </div>
                            );
                          } else if (statusLower === 'pending' || statusLower === 'unpaid') {
                            return (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border border-border">
                                <Loader className="h-3 w-3" />
                                <span className="text-xs font-semibold">{t('status.pending')}</span>
                              </div>
                            );
                          } else if (statusLower === 'partial' || statusLower === 'overdue') {
                            return (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-100 border border-orange-200">
                                <Minus className="h-3 w-3" />
                                <span className="text-xs font-semibold">{t('status.partial')}</span>
                              </div>
                            );
                          }
                        };

                        // Generate invoice number from period (e.g., "2025. 10" -> "INV-2025-10")
                        const invoiceNo = `INV-${payment.period.replace('. ', '-')}`;

                        // Format amounts with commas
                        const formatAmount = (amount: number) => {
                          return `$${amount.toLocaleString('en-US')}`;
                        };

                        // Format date with year from period (e.g., period: "2025. 10", date: "10. 05" -> "2025. 10. 05")
                        const year = payment.period.split('. ')[0];
                        const fullDate = `${year}. ${payment.date}`;

                        return (
                          <tr key={payment.id} className="border-b border-border last:border-0">
                            <td className="h-[52px] p-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{invoiceNo}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyInvoiceNo(invoiceNo);
                                  }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                            <td className="h-[52px] p-2 text-sm">{payment.period}</td>
                            <td className="h-[52px] p-2 text-sm">{fullDate}</td>
                            <td className="h-[52px] p-2">
                              {getStatusBadge(payment.status)}
                            </td>
                            <td className="h-[52px] p-2 text-sm">{formatAmount(payment.paidAmount)}</td>
                            <td className="h-[52px] p-2 text-sm">
                              <span className={payment.difference !== 0 ? 'text-red-500' : ''}>
                                {formatAmount(payment.difference)}
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
                    {t('resellerDetail.paymentHistoryDesc')}
                  </div>

                  {Math.ceil(resellerPayments.length / paymentsPerPage) > 1 && (
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
                        {currentPaymentPage + 1} / {Math.ceil(resellerPayments.length / paymentsPerPage)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPaymentPage(Math.min(Math.ceil(resellerPayments.length / paymentsPerPage) - 1, currentPaymentPage + 1))}
                        disabled={currentPaymentPage === Math.ceil(resellerPayments.length / paymentsPerPage) - 1}
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

      {/* Edit Billing Emails Modal */}
      <EditBillingEmailsModal
        open={editBillingEmailsOpen}
        onOpenChange={setEditBillingEmailsOpen}
        emails={reseller?.billingEmails || []}
        onSave={handleSaveBillingEmails}
      />

      {/* Edit Reseller Info Modal */}
      <EditResellerInfoModal
        open={editResellerInfoOpen}
        onOpenChange={setEditResellerInfoOpen}
        reseller={reseller}
        onSave={handleSaveResellerInfo}
      />

      {/* Edit Pricing Modal */}
      <EditPricingModal
        open={editPricingOpen}
        onOpenChange={setEditPricingOpen}
        reseller={reseller}
        serviceName={selectedService}
        onSave={handleSavePricing}
      />

      {/* Add Service Modal */}
      <AddServiceModal
        open={addServiceOpen}
        onOpenChange={setAddServiceOpen}
        existingServices={reseller?.pricing ? Object.keys(reseller.pricing) : []}
        onSave={handleAddService}
      />

      {/* Delete Reseller Confirmation Dialog */}
      <AlertDialog open={deleteResellerDialogOpen} onOpenChange={setDeleteResellerDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('resellerDetail.deleteReseller')}</AlertDialogTitle>
            <AlertDialogDescription
              dangerouslySetInnerHTML={{
                __html: t('resellerDetail.deleteResellerDesc', { name: reseller?.name || resellerId })
              }}
            />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteReseller} className="bg-destructive text-white hover:bg-destructive/90">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Contract Modal */}
      <RejectContractModal
        open={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
        contract={selectedContract}
        onSubmit={handleRejectSubmit}
      />
    </>
  );
}
