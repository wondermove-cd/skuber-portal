import { useState } from 'react';
import { Users, FileText, DollarSign, Handshake } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { PendingPaymentsList } from '@/components/dashboard/PendingPaymentsList';
import { ExpiringContractsList } from '@/components/dashboard/ExpiringContractsList';
import { ContractPendingApprovalList } from '@/components/dashboard/ContractPendingApprovalList';
import { RejectContractModal } from '@/components/dashboard/RejectContractModal';
import {
  mockDashboardStats,
  mockPendingPayments,
  mockExpiringContracts,
  mockPendingContracts,
} from '@/lib/mock/dashboard';

interface DashboardLayoutContext {
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
}

export function DashboardMainPage() {
  const { onToggleSidebar, onOpenNotifications, unreadCount } = useOutletContext<DashboardLayoutContext>();
  const { t } = useTranslation();
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);

  const handleReject = (id: string) => {
    // Find contract from mockPendingContracts
    const contract = mockPendingContracts.find(c => c.id === id);
    if (contract) {
      // Determine contract details based on pricing model
      const isPayAsYouGo = contract.model === 'Pay-as-you-go';

      if (isPayAsYouGo) {
        setSelectedContract({
          reseller: contract.reseller,
          customer: contract.customer,
          contractId: `C-${id.padStart(3, '0')}`,
          service: contract.service,
          pricingModel: 'Pay-as-you-go',
          contractPeriod: '2024.12.31 - no end date',
          vcpuUnitPrice: contract.vcpuUnitPrice,
          minimumCharge: contract.minimumCharge,
          taxIncluded: 'Y',
        });
      } else {
        setSelectedContract({
          reseller: contract.reseller,
          customer: contract.customer,
          contractId: `C-${id.padStart(3, '0')}`,
          service: contract.service,
          pricingModel: 'Fixed Rate',
          contractPeriod: '2024.12.31 - 2025.12.31 (1 year)',
          amount: contract.contractAmount,
          includedAllocation: contract.includedAllocation,
          taxIncluded: 'Y',
        });
      }
      setRejectModalOpen(true);
    }
  };

  const handleRejectSubmit = (reason: string) => {
    console.log('Reject contract with reason:', reason);
    // Handle rejection logic here
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <Header
        onToggleSidebar={onToggleSidebar}
        onOpenNotifications={onOpenNotifications}
        unreadCount={unreadCount}
      />
      <div className="flex-1 p-8 bg-background flex flex-col gap-6">
        {/* Dashboard Title */}
        <h1 className="text-2xl font-semibold text-foreground">{t('dashboard.title')}</h1>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-4 gap-6">
          <StatsCard
            title={t('dashboard.totalCustomers')}
            value={mockDashboardStats.totalCustomers.value}
            change={mockDashboardStats.totalCustomers.change}
            changeType={mockDashboardStats.totalCustomers.changeType}
            changeLabel={t('dashboard.fromLastMonth')}
            icon={Users}
          />
          <StatsCard
            title={t('dashboard.activeContracts')}
            value={mockDashboardStats.activeContracts.value}
            change={mockDashboardStats.activeContracts.change}
            changeType={mockDashboardStats.activeContracts.changeType}
            changeLabel={t('dashboard.fromLastMonth')}
            icon={FileText}
          />
          <StatsCard
            title={t('dashboard.monthlyCharge')}
            value={mockDashboardStats.monthlyCharge.value}
            change={mockDashboardStats.monthlyCharge.change}
            changeType={mockDashboardStats.monthlyCharge.changeType}
            changeLabel={t('dashboard.fromLastMonth')}
            isCurrency
            icon={DollarSign}
          />
          <StatsCard
            title={t('dashboard.resellers')}
            value={mockDashboardStats.resellers.value}
            change={mockDashboardStats.resellers.change}
            changeType={mockDashboardStats.resellers.changeType}
            changeLabel={t('dashboard.fromLastMonth')}
            icon={Handshake}
          />
        </div>

        {/* Two Column Layout for Lists */}
        <div className="grid grid-cols-2 gap-6">
          <PendingPaymentsList payments={mockPendingPayments} />
          <ExpiringContractsList contracts={mockExpiringContracts} />
        </div>

        {/* Contract Pending Approval */}
        <ContractPendingApprovalList
          contracts={mockPendingContracts}
          onApprove={(id) => console.log('Approve contract:', id)}
          onReject={handleReject}
        />
      </div>

      {/* Reject Contract Modal */}
      <RejectContractModal
        open={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
        contract={selectedContract}
        onSubmit={handleRejectSubmit}
      />
    </div>
  );
}
