import { Users, FileText, DollarSign, Handshake } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { PendingPaymentsList } from '@/components/dashboard/PendingPaymentsList';
import { ExpiringContractsList } from '@/components/dashboard/ExpiringContractsList';
import {
  mockDashboardStats,
  mockPendingPayments,
  mockExpiringContracts,
} from '@/lib/mock/dashboard';

interface DashboardLayoutContext {
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
}

export function DashboardMainPage() {
  const { onToggleSidebar, onOpenNotifications } = useOutletContext<DashboardLayoutContext>();

  return (
    <div className="flex flex-col h-full bg-background">
      <Header
        onToggleSidebar={onToggleSidebar}
        onOpenNotifications={onOpenNotifications}
      />
      <div className="flex-1 p-8 bg-background flex flex-col gap-6">
        {/* Dashboard Title */}
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-4 gap-6">
          <StatsCard
            title="Total Customers"
            value={mockDashboardStats.totalCustomers.value}
            change={mockDashboardStats.totalCustomers.change}
            changeType={mockDashboardStats.totalCustomers.changeType}
            changeLabel={mockDashboardStats.totalCustomers.label}
            icon={Users}
          />
          <StatsCard
            title="Active Contracts"
            value={mockDashboardStats.activeContracts.value}
            change={mockDashboardStats.activeContracts.change}
            changeType={mockDashboardStats.activeContracts.changeType}
            changeLabel={mockDashboardStats.activeContracts.label}
            icon={FileText}
          />
          <StatsCard
            title="Monthly Charge"
            value={mockDashboardStats.monthlyCharge.value}
            change={mockDashboardStats.monthlyCharge.change}
            changeType={mockDashboardStats.monthlyCharge.changeType}
            changeLabel={mockDashboardStats.monthlyCharge.label}
            isCurrency
            icon={DollarSign}
          />
          <StatsCard
            title="Resellers"
            value={mockDashboardStats.resellers.value}
            change={mockDashboardStats.resellers.change}
            changeType={mockDashboardStats.resellers.changeType}
            changeLabel={mockDashboardStats.resellers.label}
            icon={Handshake}
          />
        </div>

        {/* Two Column Layout for Lists */}
        <div className="grid grid-cols-2 gap-6">
          <PendingPaymentsList payments={mockPendingPayments} />
          <ExpiringContractsList contracts={mockExpiringContracts} />
        </div>
      </div>
    </div>
  );
}
