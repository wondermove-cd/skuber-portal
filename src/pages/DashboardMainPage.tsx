import { Users, FileText, DollarSign, Store } from 'lucide-react';
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
    <div className="flex flex-col h-full bg-black">
      <Header title="Dashboard" />
      <div className="flex-1 p-8 bg-black">
        {/* Stats Cards Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total customers"
            value={mockDashboardStats.totalCustomers.value}
            change={mockDashboardStats.totalCustomers.change}
            changeType={mockDashboardStats.totalCustomers.changeType}
            changeLabel={mockDashboardStats.totalCustomers.label}
            icon={Users}
          />
          <StatsCard
            title="Active contracts"
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
            icon={Store}
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
