import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { PendingPaymentsList } from '@/components/dashboard/PendingPaymentsList';
import { ExpiringContractsList } from '@/components/dashboard/ExpiringContractsList';
import {
  mockDashboardStats,
  mockPendingPayments,
  mockExpiringContracts,
} from '@/lib/mock/dashboard';

export function DashboardMainPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard" />

      <div className="flex-1 p-8">
        {/* Stats Cards Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Customers"
            value={mockDashboardStats.totalCustomers.value}
            change={mockDashboardStats.totalCustomers.change}
            changeType={mockDashboardStats.totalCustomers.changeType}
            changeLabel={mockDashboardStats.totalCustomers.label}
          />
          <StatsCard
            title="Active Contracts"
            value={mockDashboardStats.activeContracts.value}
            change={mockDashboardStats.activeContracts.change}
            changeType={mockDashboardStats.activeContracts.changeType}
            changeLabel={mockDashboardStats.activeContracts.label}
          />
          <StatsCard
            title="Monthly Charge"
            value={mockDashboardStats.monthlyCharge.value}
            change={mockDashboardStats.monthlyCharge.change}
            changeType={mockDashboardStats.monthlyCharge.changeType}
            changeLabel={mockDashboardStats.monthlyCharge.label}
            isCurrency
          />
          <StatsCard
            title="Resellers"
            value={mockDashboardStats.resellers.value}
            change={mockDashboardStats.resellers.change}
            changeType={mockDashboardStats.resellers.changeType}
            changeLabel={mockDashboardStats.resellers.label}
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
