import { UsersRound, FileText, DollarSign, CircleCheckBig } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { NextSettlementNotice } from '@/components/dashboard/NextSettlementNotice';
import { ExpiringContractsList } from '@/components/dashboard/ExpiringContractsList';
import { NewCustomersList } from '@/components/dashboard/NewCustomersList';

interface DashboardLayoutContext {
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
}

// Mock data for Reseller Dashboard
const mockResellerStats = {
  totalCustomers: {
    value: 4,
    change: 1,
    changeType: 'increase' as const,
    label: 'from last month',
  },
  activeContracts: {
    value: 67,
    change: 1,
    changeType: 'increase' as const,
    label: 'from last month',
  },
  monthlySettlement: {
    value: 123400,
    change: 19,
    changeType: 'increase' as const,
    label: 'from last month',
  },
  monthlyExpirations: {
    value: 1,
    change: 1,
    changeType: 'increase' as const,
    label: 'from last month',
  },
};

const mockNextSettlement = {
  amount: 123400,
  dueDate: 'November 5, 2025',
};

const mockNewCustomers = [
  { id: '1', name: 'Leadingpoint', email: 'steph56@gmail.com' },
  { id: '2', name: 'MMM', email: 'johnd@gmail.com' },
  { id: '3', name: 'Lorri Warf', email: 'judith@gmail.com' },
  { id: '4', name: 'James Hall', email: 'roger@gmail.com' },
  { id: '5', name: 'Chris Glasser', email: 'alexb23@gmail.com' },
];

const mockExpiringContracts = [
  { id: '1', name: 'Stephanie Nicol', email: 'steph56@gmail.com', daysLeft: 10 },
  { id: '2', name: 'Kathy Pacheco', email: 'johnd@gmail.com', daysLeft: 13 },
  { id: '3', name: 'Lorri Warf', email: 'judith@gmail.com', daysLeft: 13 },
  { id: '4', name: 'James Hall', email: 'roger@gmail.com', daysLeft: 13 },
  { id: '5', name: 'Chris Glasser', email: 'alexb23@gmail.com', daysLeft: 30 },
];

export function ResellerDashboardPage() {
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
            value={mockResellerStats.totalCustomers.value}
            change={mockResellerStats.totalCustomers.change}
            changeType={mockResellerStats.totalCustomers.changeType}
            changeLabel={mockResellerStats.totalCustomers.label}
            icon={UsersRound}
          />
          <StatsCard
            title="Active Contracts"
            value={mockResellerStats.activeContracts.value}
            change={mockResellerStats.activeContracts.change}
            changeType={mockResellerStats.activeContracts.changeType}
            changeLabel={mockResellerStats.activeContracts.label}
            icon={FileText}
          />
          <StatsCard
            title="Monthly Settlement"
            value={mockResellerStats.monthlySettlement.value}
            change={mockResellerStats.monthlySettlement.change}
            changeType={mockResellerStats.monthlySettlement.changeType}
            changeLabel={mockResellerStats.monthlySettlement.label}
            isCurrency
            icon={DollarSign}
          />
          <StatsCard
            title="Monthly Expirations"
            value={mockResellerStats.monthlyExpirations.value}
            change={mockResellerStats.monthlyExpirations.change}
            changeType={mockResellerStats.monthlyExpirations.changeType}
            changeLabel={mockResellerStats.monthlyExpirations.label}
            icon={CircleCheckBig}
          />
        </div>

        {/* Next Settlement Notice */}
        <NextSettlementNotice
          amount={mockNextSettlement.amount}
          dueDate={mockNextSettlement.dueDate}
        />

        {/* Two Column Layout for Lists */}
        <div className="grid grid-cols-2 gap-6">
          <ExpiringContractsList contracts={mockExpiringContracts} />
          <NewCustomersList customers={mockNewCustomers} />
        </div>
      </div>
    </div>
  );
}
