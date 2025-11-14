/**
 * Centralized data store helper functions
 * Merges localStorage data with mock data
 */

import {
  Customer,
  CustomerNote,
  CustomerContract,
  PaymentHistory,
  mockCustomers,
  mockCustomerNotes,
  mockCustomerContractsDetailed,
  mockPaymentHistory,
} from './mock/customers';
import { mockContracts } from './mock/contracts';
import { mockContractDetails } from './mock/contractDetails';

// ============================================
// CUSTOMERS
// ============================================

export function getAllCustomers(): Customer[] {
  const stored = localStorage.getItem('customers');
  const storedCustomers: Customer[] = stored ? JSON.parse(stored) : [];

  // Merge with mock data (localStorage takes precedence for same IDs)
  const allCustomers = [...storedCustomers, ...mockCustomers];

  // Remove duplicates based on ID (localStorage entries take precedence)
  const uniqueCustomers = Array.from(
    new Map(allCustomers.map(customer => [customer.id, customer])).values()
  );

  return uniqueCustomers;
}

export function getCustomerById(id: string): Customer | null {
  const customers = getAllCustomers();
  return customers.find(c => c.id === id) || null;
}

export function saveCustomer(customer: Customer): void {
  const stored = localStorage.getItem('customers');
  const customers: Customer[] = stored ? JSON.parse(stored) : [];

  const existingIndex = customers.findIndex(c => c.id === customer.id);

  if (existingIndex !== -1) {
    customers[existingIndex] = customer;
  } else {
    customers.push(customer);
  }

  localStorage.setItem('customers', JSON.stringify(customers));
}

export function deleteCustomer(id: string): void {
  const stored = localStorage.getItem('customers');
  const customers: Customer[] = stored ? JSON.parse(stored) : [];

  const updated = customers.filter(c => c.id !== id);
  localStorage.setItem('customers', JSON.stringify(updated));
}

// ============================================
// CUSTOMER NOTES
// ============================================

export function getCustomerNotes(customerId: string): CustomerNote[] {
  const stored = localStorage.getItem('customerNotes');
  const storedNotes: CustomerNote[] = stored ? JSON.parse(stored) : [];

  // Merge with mock data
  const allNotes = [...storedNotes, ...mockCustomerNotes];

  // Filter by customer and sort by date (newest first)
  return allNotes
    .filter(note => note.customerId === customerId)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt.replace(/\.\s/g, '-'));
      const dateB = new Date(b.createdAt.replace(/\.\s/g, '-'));
      return dateB.getTime() - dateA.getTime();
    });
}

export function saveCustomerNote(note: CustomerNote): void {
  const stored = localStorage.getItem('customerNotes');
  const notes: CustomerNote[] = stored ? JSON.parse(stored) : [];

  const existingIndex = notes.findIndex(n => n.id === note.id);

  if (existingIndex !== -1) {
    notes[existingIndex] = note;
  } else {
    notes.unshift(note); // Add to beginning
  }

  localStorage.setItem('customerNotes', JSON.stringify(notes));
}

export function deleteCustomerNote(id: string): void {
  const stored = localStorage.getItem('customerNotes');
  const notes: CustomerNote[] = stored ? JSON.parse(stored) : [];

  const updated = notes.filter(n => n.id !== id);
  localStorage.setItem('customerNotes', JSON.stringify(updated));
}

// ============================================
// CONTRACTS
// ============================================

export function getAllContracts() {
  const stored = localStorage.getItem('contracts');
  const storedContracts = stored ? JSON.parse(stored) : [];

  // Merge with mock data
  const allContracts = [...storedContracts, ...mockContracts];

  // Remove duplicates based on ID
  const uniqueContracts = Array.from(
    new Map(allContracts.map(contract => [contract.id, contract])).values()
  );

  return uniqueContracts;
}

export function getContractById(id: string) {
  const stored = localStorage.getItem('contracts');
  const storedContracts = stored ? JSON.parse(stored) : [];

  // Check localStorage first
  const storedContract = storedContracts.find((c: any) => c.id === id);
  if (storedContract) return storedContract;

  // Fallback to mock data
  return mockContracts.find(c => c.id === id) || null;
}

export function getContractDetailById(contractId: string) {
  // Check localStorage for custom contract details
  const stored = localStorage.getItem('contractDetails');
  const storedDetails = stored ? JSON.parse(stored) : {};

  if (storedDetails[contractId]) {
    return storedDetails[contractId];
  }

  // Fallback to mock data
  return mockContractDetails[contractId] || null;
}

export function saveContract(contract: any): void {
  const stored = localStorage.getItem('contracts');
  const contracts = stored ? JSON.parse(stored) : [];

  const existingIndex = contracts.findIndex((c: any) => c.id === contract.id);

  if (existingIndex !== -1) {
    contracts[existingIndex] = contract;
  } else {
    contracts.push(contract);
  }

  localStorage.setItem('contracts', JSON.stringify(contracts));
}

export function deleteContract(id: string): void {
  // Delete from contracts list
  const stored = localStorage.getItem('contracts');
  const contracts = stored ? JSON.parse(stored) : [];
  const updatedContracts = contracts.filter((c: any) => c.id !== id);
  localStorage.setItem('contracts', JSON.stringify(updatedContracts));

  // Delete from contract details
  const detailsStored = localStorage.getItem('contractDetails');
  const contractDetails = detailsStored ? JSON.parse(detailsStored) : {};
  delete contractDetails[id];
  localStorage.setItem('contractDetails', JSON.stringify(contractDetails));

  // Delete associated contract notes
  const notesStored = localStorage.getItem('contractNotes');
  const notes: ContractNote[] = notesStored ? JSON.parse(notesStored) : [];
  const updatedNotes = notes.filter(note => note.contractId !== id);
  localStorage.setItem('contractNotes', JSON.stringify(updatedNotes));
}

// ============================================
// CONTRACT NOTES
// ============================================

export interface ContractNote {
  id: string;
  contractId: string;
  content: string;
  author: string;
  createdAt: string;
}

export function getContractNotes(contractId: string): ContractNote[] {
  const stored = localStorage.getItem('contractNotes');
  const notes: ContractNote[] = stored ? JSON.parse(stored) : [];

  // Filter by contract and sort by date (newest first)
  return notes
    .filter(note => note.contractId === contractId)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt.replace(/\.\s/g, '-'));
      const dateB = new Date(b.createdAt.replace(/\.\s/g, '-'));
      return dateB.getTime() - dateA.getTime();
    });
}

export function saveContractNote(note: ContractNote): void {
  const stored = localStorage.getItem('contractNotes');
  const notes: ContractNote[] = stored ? JSON.parse(stored) : [];

  const existingIndex = notes.findIndex(n => n.id === note.id);

  if (existingIndex !== -1) {
    notes[existingIndex] = note;
  } else {
    notes.unshift(note); // Add to beginning
  }

  localStorage.setItem('contractNotes', JSON.stringify(notes));
}

export function deleteContractNote(id: string): void {
  const stored = localStorage.getItem('contractNotes');
  const notes: ContractNote[] = stored ? JSON.parse(stored) : [];

  const updated = notes.filter(n => n.id !== id);
  localStorage.setItem('contractNotes', JSON.stringify(updated));
}

// ============================================
// CUSTOMER CONTRACTS
// ============================================

export function getCustomerContracts(customerId: string): CustomerContract[] {
  const stored = localStorage.getItem('contracts');
  const storedContracts = stored ? JSON.parse(stored) : [];

  // Merge with mock data
  const allContracts = [...storedContracts, ...mockCustomerContractsDetailed];

  return allContracts.filter((c: any) => c.customerId === customerId);
}

// ============================================
// PAYMENT HISTORY
// ============================================

export function getCustomerPayments(customerId: string): PaymentHistory[] {
  const stored = localStorage.getItem('payments');
  const storedPayments: PaymentHistory[] = stored ? JSON.parse(stored) : [];

  // Merge with mock data
  const allPayments = [...storedPayments, ...mockPaymentHistory];

  // Filter by customer and sort by date (newest first)
  return allPayments
    .filter(payment => payment.customerId === customerId)
    .sort((a, b) => {
      const dateA = new Date(a.date.replace(/\.\s/g, '-'));
      const dateB = new Date(b.date.replace(/\.\s/g, '-'));
      return dateB.getTime() - dateA.getTime();
    });
}

export function getContractPayments(contractId: string): PaymentHistory[] {
  const stored = localStorage.getItem('payments');
  const storedPayments: PaymentHistory[] = stored ? JSON.parse(stored) : [];

  // Merge with mock data
  const allPayments = [...storedPayments, ...mockPaymentHistory];

  // Filter by contract and sort by date (newest first)
  return allPayments
    .filter((payment: any) => payment.contractId === contractId)
    .sort((a, b) => {
      const dateA = new Date(a.date.replace(/\.\s/g, '-'));
      const dateB = new Date(b.date.replace(/\.\s/g, '-'));
      return dateB.getTime() - dateA.getTime();
    });
}

export function savePayment(payment: PaymentHistory): void {
  const stored = localStorage.getItem('payments');
  const payments: PaymentHistory[] = stored ? JSON.parse(stored) : [];

  const existingIndex = payments.findIndex(p => p.id === payment.id);

  if (existingIndex !== -1) {
    payments[existingIndex] = payment;
  } else {
    payments.push(payment);
  }

  localStorage.setItem('payments', JSON.stringify(payments));
}

// ============================================
// RESELLER NOTES
// ============================================

export interface ResellerNote {
  id: string;
  resellerId: string;
  content: string;
  author: string;
  createdAt: string;
}

export function getResellerNotes(resellerId: string): ResellerNote[] {
  const stored = localStorage.getItem('resellerNotes');
  const notes: ResellerNote[] = stored ? JSON.parse(stored) : [];

  // Filter by reseller and sort by date (newest first)
  return notes
    .filter(note => note.resellerId === resellerId)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt.replace(/\.\s/g, '-'));
      const dateB = new Date(b.createdAt.replace(/\.\s/g, '-'));
      return dateB.getTime() - dateA.getTime();
    });
}

export function saveResellerNote(note: ResellerNote): void {
  const stored = localStorage.getItem('resellerNotes');
  const notes: ResellerNote[] = stored ? JSON.parse(stored) : [];

  const existingIndex = notes.findIndex(n => n.id === note.id);

  if (existingIndex !== -1) {
    notes[existingIndex] = note;
  } else {
    notes.unshift(note); // Add to beginning
  }

  localStorage.setItem('resellerNotes', JSON.stringify(notes));
}

export function deleteResellerNote(id: string): void {
  const stored = localStorage.getItem('resellerNotes');
  const notes: ResellerNote[] = stored ? JSON.parse(stored) : [];

  const updated = notes.filter(n => n.id !== id);
  localStorage.setItem('resellerNotes', JSON.stringify(updated));
}

// ============================================
// RESELLERS
// ============================================

export function getAllResellers() {
  const stored = localStorage.getItem('resellers');
  return stored ? JSON.parse(stored) : [];
}

export function getResellerById(id: string) {
  const resellers = getAllResellers();
  return resellers.find((r: any) => r.id === id) || null;
}

export function saveReseller(reseller: any): void {
  const stored = localStorage.getItem('resellers');
  const resellers = stored ? JSON.parse(stored) : [];

  const existingIndex = resellers.findIndex((r: any) => r.id === reseller.id);

  if (existingIndex !== -1) {
    resellers[existingIndex] = reseller;
  } else {
    resellers.push(reseller);
  }

  localStorage.setItem('resellers', JSON.stringify(resellers));
}

export function deleteReseller(id: string): void {
  const stored = localStorage.getItem('resellers');
  const resellers = stored ? JSON.parse(stored) : [];
  const updated = resellers.filter((r: any) => r.id !== id);
  localStorage.setItem('resellers', JSON.stringify(updated));

  // Delete associated reseller notes
  const notesStored = localStorage.getItem('resellerNotes');
  const notes: ResellerNote[] = notesStored ? JSON.parse(notesStored) : [];
  const updatedNotes = notes.filter(note => note.resellerId !== id);
  localStorage.setItem('resellerNotes', JSON.stringify(updatedNotes));
}
