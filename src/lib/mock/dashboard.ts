import { generateContractId } from '@/lib/utils/format';

// Dashboard statistics data
export const mockDashboardStats = {
  totalCustomers: {
    value: 516,
    change: 1,
    changeType: 'increase' as const,
    label: 'from last month',
  },
  activeContracts: {
    value: 700,
    change: 1,
    changeType: 'increase' as const,
    label: 'from last month',
  },
  monthlyCharge: {
    value: 9896.66,
    change: 19,
    changeType: 'percentage' as const,
    label: 'from last month',
  },
  resellers: {
    value: 5,
    change: 1,
    changeType: 'increase' as const,
    label: 'from last month',
  },
};

// Pending payments list data
export const mockPendingPayments = [
  {
    id: '1',
    contractName: 'Alex Buckmaster',
    contractId: generateContractId(new Date('2024-01-15'), 'CUST001', 1),
    contractType: 'Direct' as const,
    amount: 4024.92,
  },
  {
    id: '2',
    contractName: 'TechPartners Solutions',
    contractId: 'WMRES-001',
    contractType: 'Reseller' as const,
    amount: 9952.52,
  },
  {
    id: '3',
    contractName: 'Lorri Warf',
    contractId: generateContractId(new Date('2024-03-10'), 'CUST003', 2),
    contractType: 'Direct' as const,
    amount: 3153.64,
  },
  {
    id: '4',
    contractName: 'James Hall',
    contractId: generateContractId(new Date('2024-04-05'), 'CUST004', 1),
    contractType: 'Direct' as const,
    amount: 7369.55,
  },
  {
    id: '5',
    contractName: 'Chris Glasser',
    contractId: generateContractId(new Date('2024-05-12'), 'CUST005', 3),
    contractType: 'Direct' as const,
    amount: 2192.86,
  },
];

// Contracts expiring soon data
export const mockExpiringContracts = [
  {
    id: '1',
    name: 'Stephanie Nicol',
    email: 'steph56@gmail.com',
    daysLeft: 10,
  },
  {
    id: '2',
    name: 'John Dukes',
    email: 'johnd@gmail.com',
    daysLeft: 13,
  },
  {
    id: '3',
    name: 'Judith Rodriguez',
    email: 'judith@gmail.com',
    daysLeft: 13,
  },
  {
    id: '4',
    name: 'Rodger Struck',
    email: 'roger@gmail.com',
    daysLeft: 13,
  },
  {
    id: '5',
    name: 'Alex Buckmaster',
    email: 'alexb23@gmail.com',
    daysLeft: 13,
  },
];

// Contract pending approval data
export const mockPendingContracts = [
  {
    id: '1',
    reseller: 'Megazone',
    customer: '삼성전자',
    service: 'Observability',
    model: 'Fixed Rate (1 Year)',
    minimumCharge: '-',
    contractAmount: '$5,000.00 /year',
    vcpuUnitPrice: '-',
    includedAllocation: '1,000 vCPU',
    submitted: '2025.12.31',
  },
  {
    id: '2',
    reseller: 'TechPart',
    customer: '현대차',
    service: 'Observability',
    model: 'Fixed Rate (3 Year)',
    minimumCharge: '-',
    contractAmount: '$5,000.00 /year',
    vcpuUnitPrice: '-',
    includedAllocation: '1,500 vCPU',
    submitted: '2025.11.31',
  },
  {
    id: '3',
    reseller: 'LG CNS',
    customer: 'LG 전자',
    service: 'Observability',
    model: 'Pay-as-you-go',
    minimumCharge: '$50.00 /month',
    contractAmount: '-',
    vcpuUnitPrice: '$0.10 /hour',
    includedAllocation: '-',
    submitted: '2025.10.31',
  },
  {
    id: '4',
    reseller: 'Megazone',
    customer: 'AAA',
    service: 'Observability',
    model: 'Pay-as-you-go',
    minimumCharge: '$50.00 /month',
    contractAmount: '-',
    vcpuUnitPrice: '$0.10 /hour',
    includedAllocation: '-',
    submitted: '2025.09.31',
  },
  {
    id: '5',
    reseller: 'TechPart',
    customer: 'cmc',
    service: 'Observability',
    model: 'Pay-as-you-go',
    minimumCharge: '$50.00 /month',
    contractAmount: '-',
    vcpuUnitPrice: '$0.10 /hour',
    includedAllocation: '-',
    submitted: '2025.08.31',
  },
];
