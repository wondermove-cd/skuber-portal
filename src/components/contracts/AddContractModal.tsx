import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, ChevronRight, Calendar as CalendarIcon, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Customer } from '@/lib/mock/customers';
import { Contract } from '@/lib/mock/contracts';
import { COUNTRIES } from '@/lib/constants/countries';
import { validateBusinessRegNo } from '@/lib/utils/validators';
import { saveCustomer, getAllCustomers } from '@/lib/data-store';
import { mockResellers } from '@/lib/mock/resellers';

interface AddContractModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'services' | 'resellerId'>) => void;
  initialCustomerId?: string;
  initialStep?: 1 | 2 | 3 | 4 | 5;
  onContractAdded?: (deleteRejected: boolean) => void;
  rejectedContractId?: string;
}

export function AddContractModal({
  open,
  onOpenChange,
  customers,
  onAddCustomer,
  initialCustomerId,
  initialStep = 1,
  onContractAdded,
  rejectedContractId
}: AddContractModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [firstStep, setFirstStep] = useState<1 | 2 | 3 | 4 | 5>(1); // Track the first step to prevent going back before it
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [newlyAddedCustomerName, setNewlyAddedCustomerName] = useState<string>('');

  // Customer form data for step 2
  const [customerFormData, setCustomerFormData] = useState({
    countryCode: 'KR',
    companyName: '',
    businessRegNo: '',
    ceoName: '',
    contactPerson: '',
    contactEmail: '',
    note: '',
  });

  const [formErrors, setFormErrors] = useState<{
    countryCode?: string;
    companyName?: string;
    businessRegNo?: string;
    ceoName?: string;
    contactPerson?: string;
    contactEmail?: string;
  }>({});

  // Contract form data for step 3
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedPricingModel, setSelectedPricingModel] = useState<string>('');

  // Fixed Rate contract data for step 4
  const [contractTerm, setContractTerm] = useState<1 | 3 | 5>(1);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    const today = new Date();
    const oneYearLater = new Date(today);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    return oneYearLater;
  });
  const [contractAmount, setContractAmount] = useState<string>('');
  const [includedAllocation, setIncludedAllocation] = useState<string>('');
  const [taxIncluded, setTaxIncluded] = useState<boolean>(true);
  const [contractAmountError, setContractAmountError] = useState<string>('');
  const [includedAllocationError, setIncludedAllocationError] = useState<string>('');

  // Pay-as-you-go contract data for step 4
  const [paygStartDate, setPaygStartDate] = useState<Date | undefined>(new Date());
  const [setEndDateEnabled, setSetEndDateEnabled] = useState<boolean>(false);
  const [paygEndDate, setPaygEndDate] = useState<Date | undefined>(undefined);
  const [vcpuUnitPrice, setVcpuUnitPrice] = useState<string>('');
  const [minimumCharge, setMinimumCharge] = useState<string>('');
  const [vcpuUnitPriceError, setVcpuUnitPriceError] = useState<string>('');
  const [minimumChargeError, setMinimumChargeError] = useState<string>('');
  const [paygTaxIncluded, setPaygTaxIncluded] = useState<boolean>(true);
  const [paygDateError, setPaygDateError] = useState<string>('');

  // Trial contract data for step 4
  const [trialPeriod, setTrialPeriod] = useState<7 | 14 | 30 | null>(7);
  const [trialStartDate, setTrialStartDate] = useState<Date | undefined>(new Date());
  const [trialEndDate, setTrialEndDate] = useState<Date | undefined>(() => {
    const today = new Date();
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    return sevenDaysLater;
  });
  const [usageLimit, setUsageLimit] = useState<string>('');
  const [usageLimitError, setUsageLimitError] = useState<string>('');
  const [trialDateError, setTrialDateError] = useState<string>('');

  // Step 5: Additional information
  const [billingEmails, setBillingEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [newEmailError, setNewEmailError] = useState<string>('');
  const [deleteRejectedContract, setDeleteRejectedContract] = useState<boolean>(false);

  const selectedCountry = COUNTRIES.find((c) => c.code === customerFormData.countryCode);

  // Check if user is reseller admin or editor
  const isResellerUser = user?.role === 'reseller_admin' || user?.role === 'reseller_editor';

  // Get reseller's available services based on pricing configuration
  const resellerAvailableServices = (() => {
    if (!isResellerUser || !user?.resellerId) {
      return null; // WM users can access all services
    }

    const reseller = mockResellers.find(r => r.id === user.resellerId);
    if (!reseller?.pricing) {
      return []; // No pricing configured, no services available
    }

    // Map pricing keys to service codes
    const serviceMap: Record<string, string> = {
      'Skuber⁺ Management': 'management',
      'Skuber⁺ Observability': 'observability',
      'Skuber⁺ Optimization': 'optimization',
    };

    return Object.keys(reseller.pricing)
      .map(serviceName => serviceMap[serviceName])
      .filter(Boolean);
  })();

  // Check if a service is available for the current user
  const isServiceAvailable = (serviceCode: string) => {
    if (resellerAvailableServices === null) {
      return true; // WM users can access all services
    }
    return resellerAvailableServices.includes(serviceCode);
  };

  // Initialize with props when modal opens
  useEffect(() => {
    if (open) {
      if (initialCustomerId) {
        setSelectedCustomerId(initialCustomerId);
      }
      if (initialStep) {
        setStep(initialStep);
        setFirstStep(initialStep);
      }
    }
  }, [open, initialCustomerId, initialStep]);

  // Filter customers based on search query
  const filteredCustomers = customers.filter((customer) =>
    customer.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.businessRegNo.includes(searchQuery) ||
    customer.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected customer name
  const getSelectedCustomerName = () => {
    if (newlyAddedCustomerName) {
      return newlyAddedCustomerName;
    }
    const customer = customers.find((c) => c.id === selectedCustomerId);
    return customer?.companyName || '';
  };

  // Get selected service display name
  const getServiceName = () => {
    switch (selectedService) {
      case 'management':
        return 'Skuber⁺ Management';
      case 'observability':
        return 'Skuber⁺ Observability';
      case 'optimization':
        return 'Skuber⁺ Optimazation';
      default:
        return '';
    }
  };

  // Handle Contract Term change
  const handleTermChange = (term: 1 | 3 | 5) => {
    setContractTerm(term);
    // Recalculate end date if start date exists
    if (startDate) {
      const newEndDate = calculateEndDate(startDate, term);
      setEndDate(newEndDate);
    }
  };

  // Handle Start Date change
  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    // Calculate end date automatically
    if (date) {
      const newEndDate = calculateEndDate(date, contractTerm);
      setEndDate(newEndDate);
    }
  };

  // Handle End Date change
  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    // Calculate start date automatically
    if (date) {
      const newStartDate = new Date(date);
      newStartDate.setFullYear(newStartDate.getFullYear() - contractTerm);
      setStartDate(newStartDate);
    }
  };

  // Handle Pay-as-you-go Start Date change
  const handlePaygStartDateChange = (date: Date | undefined) => {
    setPaygStartDate(date);
    // Validate date range
    const error = validatePaygDateRange(date, paygEndDate, setEndDateEnabled);
    setPaygDateError(error);
  };

  // Handle Pay-as-you-go End Date change
  const handlePaygEndDateChange = (date: Date | undefined) => {
    setPaygEndDate(date);
    // Validate date range
    const error = validatePaygDateRange(paygStartDate, date, setEndDateEnabled);
    setPaygDateError(error);
  };

  // Handle Trial Period change
  const handleTrialPeriodChange = (period: 7 | 14 | 30 | null) => {
    setTrialPeriod(period);
    if (period && trialStartDate) {
      const newEndDate = new Date(trialStartDate);
      newEndDate.setDate(newEndDate.getDate() + period);
      setTrialEndDate(newEndDate);
    }
  };

  // Handle Trial Start Date change
  const handleTrialStartDateChange = (date: Date | undefined) => {
    setTrialStartDate(date);

    // Validate date range
    if (date && trialEndDate) {
      if (trialEndDate <= date) {
        setTrialDateError(t('addContract.endDateAfterStart'));
      } else {
        setTrialDateError('');
      }
    }

    if (date && trialPeriod) {
      const newEndDate = new Date(date);
      newEndDate.setDate(newEndDate.getDate() + trialPeriod);
      setTrialEndDate(newEndDate);
      setTrialDateError('');
    }
  };

  // Handle Trial End Date change
  const handleTrialEndDateChange = (date: Date | undefined) => {
    setTrialEndDate(date);

    // Validate date range
    if (date && trialStartDate) {
      if (date <= trialStartDate) {
        setTrialDateError(t('addContract.endDateAfterStart'));
      } else {
        setTrialDateError('');
      }

      const diffTime = date.getTime() - trialStartDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // If the difference doesn't match any preset (7, 14, 30), deselect all toggles
      if (diffDays !== 7 && diffDays !== 14 && diffDays !== 30) {
        setTrialPeriod(null);
      } else {
        setTrialPeriod(diffDays as 7 | 14 | 30);
      }
    }
  };

  // Format date for display (YYYY.MM.DD)
  const formatDateForDisplay = (date: Date | undefined) => {
    if (!date) return '';
    return format(date, 'yyyy.MM.dd');
  };

  // Format number with commas
  const formatNumberWithCommas = (value: string) => {
    if (!value) return '';
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Format decimal number with commas (for prices with decimals)
  const formatDecimalWithCommas = (value: string) => {
    if (!value) return '';
    const parts = value.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  // Validate numeric input
  const validateNumericInput = (value: string): string => {
    if (!value) return t('addContract.fieldRequired');
    const numValue = parseInt(value, 10);
    if (numValue === 0 || isNaN(numValue)) return t('addContract.validNumberRequired');
    return '';
  };

  // Validate price input (allows decimals)
  const validatePriceInput = (value: string): string => {
    if (!value) return t('addContract.fieldRequired');
    const numValue = parseFloat(value);
    if (numValue === 0 || isNaN(numValue)) return t('addContract.validNumberRequired');
    return '';
  };

  // Validate Pay-as-you-go date range
  const validatePaygDateRange = (start: Date | undefined, end: Date | undefined, enabled: boolean): string => {
    if (!enabled || !end || !start) return '';
    if (end < start) return t('addContract.endDateAfterStart');
    return '';
  };

  // Validate email
  const validateEmail = (email: string): string => {
    if (!email.trim()) return t('addContract.emailRequired');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t('addContract.invalidEmailFormat');
    if (billingEmails.includes(email)) return t('addContract.emailAlreadyAdded');
    return '';
  };

  // Handle add email
  const handleAddEmail = () => {
    const error = validateEmail(newEmail);
    if (error) {
      setNewEmailError(error);
      return;
    }
    setBillingEmails([...billingEmails, newEmail]);
    setNewEmail('');
    setNewEmailError('');
  };

  // Handle remove email
  const handleRemoveEmail = (emailToRemove: string) => {
    // Prevent removing the last email
    if (billingEmails.length <= 1) {
      setNewEmailError(t('addContract.atLeastOneEmail'));
      return;
    }
    setBillingEmails(billingEmails.filter(email => email !== emailToRemove));
  };

  const validateField = (field: keyof typeof customerFormData, value: string): string | undefined => {
    switch (field) {
      case 'countryCode':
        if (!value) return t('addContract.countryRequired');
        return undefined;

      case 'companyName':
        if (!value.trim()) return t('addContract.companyNameRequired');
        if (value.trim().length < 2) return t('addContract.companyNameMinLength');
        return undefined;

      case 'businessRegNo':
        const validation = validateBusinessRegNo(customerFormData.countryCode, value);
        return validation.error;

      case 'ceoName':
        if (!value.trim()) return t('addContract.ceoRequired');
        if (value.trim().length < 2) return t('addContract.nameMinLength');
        return undefined;

      case 'contactPerson':
        if (!value.trim()) return t('addContract.contactPersonRequired');
        if (value.trim().length < 2) return t('addContract.nameMinLength');
        return undefined;

      case 'contactEmail':
        if (!value.trim()) return t('addContract.emailRequired');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('addContract.invalidEmailFormat');
        return undefined;

      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof formErrors = {};

    Object.keys(customerFormData).forEach((key) => {
      const field = key as keyof typeof customerFormData;
      const error = validateField(field, customerFormData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof typeof formErrors];
        return newErrors;
      });
    }
  };

  const handleFieldBlur = (field: keyof typeof customerFormData) => {
    const error = validateField(field, customerFormData[field]);
    if (error) {
      setFormErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const isFormValid = () => {
    return (
      customerFormData.countryCode !== '' &&
      customerFormData.companyName.trim() !== '' &&
      customerFormData.businessRegNo.trim() !== '' &&
      customerFormData.ceoName.trim() !== '' &&
      customerFormData.contactPerson.trim() !== '' &&
      customerFormData.contactEmail.trim() !== '' &&
      Object.keys(formErrors).length === 0
    );
  };

  const calculateEndDate = (start: Date, term: 1 | 3 | 5): Date => {
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + term);
    return end;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!selectedCustomerId) return;
      setStep(3);
    } else if (step === 2) {
      if (!validateForm()) {
        return;
      }

      // Generate unique ID for new customer
      const newCustomerId = `customer-${Date.now()}`;
      const isResellerUser = user?.role.startsWith('reseller_');

      // Create and save customer
      const newCustomer: Customer = {
        id: newCustomerId,
        companyName: customerFormData.companyName,
        businessRegNo: customerFormData.businessRegNo,
        services: [],
        contactPerson: customerFormData.contactPerson,
        email: customerFormData.contactEmail,
        country: selectedCountry?.name || customerFormData.countryCode,
        ceo: customerFormData.ceoName,
        createdAt: new Date().toISOString().split('T')[0],
        createdAtTimestamp: Date.now(),
        resellerId: isResellerUser ? user?.resellerId : undefined,
      };

      // Save to localStorage
      saveCustomer(newCustomer);

      // Call onAddCustomer for parent component to refresh (but we don't need return value)
      onAddCustomer({
        companyName: customerFormData.companyName,
        businessRegNo: customerFormData.businessRegNo,
        contactPerson: customerFormData.contactPerson,
        email: customerFormData.contactEmail,
        country: selectedCountry?.name || customerFormData.countryCode,
        ceo: customerFormData.ceoName,
        createdAtTimestamp: Date.now(),
      });

      // Set the new customer as selected
      setSelectedCustomerId(newCustomerId);

      // Store the newly added customer name
      setNewlyAddedCustomerName(customerFormData.companyName);
      setStep(3);
    } else if (step === 3) {
      if (!selectedService || !selectedPricingModel) return;
      // Move to step 4 for both Fixed Rate and Pay-as-you-go
      setStep(4);
    } else if (step === 4) {
      // Move to step 5
      setStep(5);
    } else if (step === 5) {
      // Get existing contracts from localStorage
      const existingContracts: Contract[] = JSON.parse(
        localStorage.getItem('contracts') || '[]'
      );

      // Get customer info - refresh from all customers including newly added ones
      const allCustomers = getAllCustomers();
      const customer = allCustomers.find((c) => c.id === selectedCustomerId);
      const companyName = customer?.companyName || getSelectedCustomerName();

      // Get reseller info based on user role
      const isResellerUser = user?.role.startsWith('reseller_');
      const reseller = isResellerUser ? (user?.resellerName || 'Reseller') : 'N/A';
      const resellerId = isResellerUser ? user?.resellerId : undefined;

      // Create service name mapping
      const serviceNameMap: Record<string, string> = {
        'management': 'Management',
        'observability': 'Observability',
        'optimization': 'Optimization',
      };
      const serviceName = serviceNameMap[selectedService] || selectedService;

      // Create pricing model mapping
      const pricingModelMap: Record<string, string> = {
        'fixed': 'Fixed Rate',
        'payg': 'Pay-as-you-go',
        'trial': 'Trial',
      };
      const pricingModelName = pricingModelMap[selectedPricingModel] || selectedPricingModel;

      // Format dates to 'YYYY. MM. DD'
      const formatDate = (date: Date | undefined) => {
        if (!date) return '';
        return format(date, 'yyyy. MM. dd');
      };

      // Generate unique ID using timestamp
      const newContractId = `contract-${Date.now()}`;

      // Generate contract number (CT-YYYYMMDD-XXXX)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const dateStr = `${year}${month}${day}`;

      // Count contracts created today to generate sequence number
      const todayContracts = existingContracts.filter((c: any) => {
        return c.contractNumber && c.contractNumber.startsWith(`CT-${dateStr}`);
      });
      const sequenceNumber = String(todayContracts.length + 1).padStart(4, '0');
      const contractNumber = `CT-${dateStr}-${sequenceNumber}`;

      // Create new contract
      const newContract: any = {
        id: newContractId,
        contractNumber: contractNumber,
        contractId: contractNumber,
        customerId: selectedCustomerId,
        companyName,
        reseller,
        resellerId,
        service: serviceName,
        serviceName: serviceName,
        pricingModel: pricingModelName,
        startDate: selectedPricingModel === 'fixed'
          ? formatDate(startDate)
          : selectedPricingModel === 'payg'
          ? formatDate(paygStartDate)
          : formatDate(trialStartDate),
        endDate: selectedPricingModel === 'fixed'
          ? formatDate(endDate)
          : selectedPricingModel === 'payg'
          ? (setEndDateEnabled ? formatDate(paygEndDate) : '')
          : formatDate(trialEndDate),
        status: 'inactive',
        approvalStatus: 'pending',
        submittedDate: formatDate(now),
        amount: selectedPricingModel === 'fixed'
          ? '$' + formatNumberWithCommas(contractAmount)
          : selectedPricingModel === 'payg'
          ? 'Variable'
          : 'Free',
        details: selectedPricingModel === 'fixed'
          ? `${formatNumberWithCommas(includedAllocation)} vCPU included, Tax ${taxIncluded ? 'included' : 'excluded'}`
          : selectedPricingModel === 'payg'
          ? `$${formatDecimalWithCommas(vcpuUnitPrice)}/hour per vCPU${minimumCharge ? `, Min: $${formatDecimalWithCommas(minimumCharge)}/month` : ''}, Tax ${paygTaxIncluded ? 'included' : 'excluded'}`
          : trialPeriod
            ? `${trialPeriod} days trial period, ${formatNumberWithCommas(usageLimit)} vCPU-hours limit`
            : `Custom trial period, ${formatNumberWithCommas(usageLimit)} vCPU-hours limit`,
        createdAtTimestamp: Date.now(), // Add timestamp for "New" badge
      };

      // Add new contract to the list
      const updatedContracts = [newContract, ...existingContracts];
      localStorage.setItem('contracts', JSON.stringify(updatedContracts));

      // Create contract details for detail page
      const contractDetail: any = {
        ...newContract,
        contactPerson: customer
          ? {
              name: customer.contactPerson,
              email: customer.email || customer.contactPerson,
            }
          : {
              name: 'Unknown',
              email: 'Unknown',
            },
        createdAt: new Date().toISOString().split('T')[0].replace(/-/g, '. '),
        billingInfo: selectedPricingModel === 'fixed'
          ? {
              contractAmount: '$' + formatNumberWithCommas(contractAmount),
              includedAllocation: parseInt(includedAllocation, 10),
              contractPeriod: `${formatDate(startDate)} - ${formatDate(endDate)}`,
              taxIncluded: taxIncluded,
            }
          : selectedPricingModel === 'payg'
          ? {
              rate: '$' + formatDecimalWithCommas(vcpuUnitPrice) + '/hour per vCPU',
              vcpuUnitPrice: '$' + formatDecimalWithCommas(vcpuUnitPrice) + '/hour',
              minimumCharge: minimumCharge ? '$' + formatDecimalWithCommas(minimumCharge) + '/month' : 'None',
              contractPeriod: setEndDateEnabled
                ? `${formatDate(paygStartDate)} - ${formatDate(paygEndDate)}`
                : `${formatDate(paygStartDate)} - Ongoing`,
              taxIncluded: paygTaxIncluded,
            }
          : {
              trialPeriod: trialPeriod ? `${trialPeriod} days` : 'Custom period',
              contractPeriod: `${formatDate(trialStartDate)} - ${formatDate(trialEndDate)}`,
              usageLimit: `${formatNumberWithCommas(usageLimit)} vCPU-hours`,
            },
        wholesalePricing: selectedPricingModel === 'fixed'
          ? {
              contractAmount: '$' + formatNumberWithCommas(contractAmount),
              includedAllocation: parseInt(includedAllocation, 10),
              contractPeriod: `${formatDate(startDate)} - ${formatDate(endDate)}`,
              taxIncluded: taxIncluded,
            }
          : selectedPricingModel === 'payg'
          ? {
              rate: '$' + formatDecimalWithCommas(vcpuUnitPrice) + '/hour per vCPU',
              vcpuUnitPrice: parseFloat(vcpuUnitPrice),
              minimumCharge: minimumCharge ? parseFloat(minimumCharge) : undefined,
              contractPeriod: setEndDateEnabled
                ? `${formatDate(paygStartDate)} - ${formatDate(paygEndDate)}`
                : `${formatDate(paygStartDate)} - Ongoing`,
              taxIncluded: paygTaxIncluded,
            }
          : {
              trialPeriod: trialPeriod ? parseInt(trialPeriod) : undefined,
              contractPeriod: `${formatDate(trialStartDate)} - ${formatDate(trialEndDate)}`,
              usageLimit: parseInt(usageLimit, 10),
            },
        billingEmails: billingEmails.length > 0 ? billingEmails : undefined,
        note: note || undefined,
        paymentHistory: [
          {
            id: `pay-${newContractId}-1`,
            invoiceNo: `INV-${year}${month}-${sequenceNumber}`,
            period: `${year}.${month}`,
            date: formatDate(now),
            status: 'Pending',
            paidAmount: '$0',
            difference: selectedPricingModel === 'fixed'
              ? '$' + formatNumberWithCommas(contractAmount)
              : selectedPricingModel === 'payg'
              ? 'TBD'
              : '$0',
          },
        ],
      };

      // Save contract details
      const existingContractDetails = JSON.parse(
        localStorage.getItem('contractDetails') || '{}'
      );
      existingContractDetails[newContractId] = contractDetail;
      localStorage.setItem('contractDetails', JSON.stringify(existingContractDetails));

      // Update customer's services array
      const existingCustomers: Customer[] = JSON.parse(
        localStorage.getItem('customers') || '[]'
      );

      const customerIndex = existingCustomers.findIndex((c) => c.id === selectedCustomerId);
      if (customerIndex !== -1) {
        // Add service to customer's services array if not already present
        if (!existingCustomers[customerIndex].services.includes(serviceName)) {
          existingCustomers[customerIndex].services.push(serviceName);
          localStorage.setItem('customers', JSON.stringify(existingCustomers));
        }
      }

      // Show success toast
      toast({
        title: t('addContract.contractSubmitted'),
        description: t('addContract.contractCreated', { companyName }),
      });

      // Trigger page reload to update the contracts list
      window.dispatchEvent(new Event('storage'));

      // Call onContractAdded callback if provided
      if (onContractAdded) {
        onContractAdded(deleteRejectedContract);
      }

      // Close modal after submission
      handleOpenChange(false);
    }
  };

  const handlePrev = () => {
    // Don't go back if we're at the first step
    if (step <= firstStep) {
      return;
    }

    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      // If came from adding customer (step 2), go back to step 2
      // Otherwise go back to step 1
      setStep(newlyAddedCustomerName ? 2 : 1);
    } else if (step === 4) {
      setStep(3);
    } else if (step === 5) {
      setStep(4);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset all state when modal closes
      setStep(1);
      setFirstStep(1);
      setSearchQuery('');
      setSelectedCustomerId('');
      setNewlyAddedCustomerName('');
      setSelectedService('');
      setSelectedPricingModel('');
      setCustomerFormData({
        countryCode: 'KR',
        companyName: '',
        businessRegNo: '',
        ceoName: '',
        contactPerson: '',
        contactEmail: '',
        note: '',
      });
      setFormErrors({});
      // Reset Fixed Rate step 4 state
      setContractTerm(1);
      const today = new Date();
      setStartDate(today);
      const oneYearLater = new Date(today);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      setEndDate(oneYearLater);
      setContractAmount('');
      setIncludedAllocation('');
      setTaxIncluded(true);
      setContractAmountError('');
      setIncludedAllocationError('');
      // Reset Pay-as-you-go step 4 state
      setPaygStartDate(today);
      setSetEndDateEnabled(false);
      setPaygEndDate(undefined);
      setVcpuUnitPrice('');
      setMinimumCharge('');
      setVcpuUnitPriceError('');
      setMinimumChargeError('');
      setPaygTaxIncluded(true);
      setPaygDateError('');
      // Reset Trial step 4 state
      setTrialPeriod(7);
      setTrialStartDate(today);
      const sevenDaysLater = new Date(today);
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
      setTrialEndDate(sevenDaysLater);
      setUsageLimit('');
      setUsageLimitError('');
      setTrialDateError('');
      // Reset Step 5 state
      setBillingEmails([]);
      setNewEmail('');
      setNote('');
      setNewEmailError('');
    }
    onOpenChange(newOpen);
  };

  const handleCancel = () => {
    handleOpenChange(false);
  };

  const handleAddCustomerClick = () => {
    setStep(2);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg p-6" showCloseButton={false}>
        <div className="flex flex-col">
        {/* Header */}
        <div className={`flex flex-col gap-1.5 ${initialStep === 3 ? 'mb-4' : 'mb-6'}`}>
          <h2 className="text-lg font-semibold leading-none">
            {step === 2 ? t('customers.addCustomer') : t('addContract.title')}
          </h2>
          {step === 1 && (
            <p className="text-sm text-muted-foreground leading-5">
              {t('addContract.selectCustomerPrompt')}
            </p>
          )}
          {step === 3 && (
            <p className="text-sm text-muted-foreground leading-5">
              {t('addContract.selectServicePrompt')}
            </p>
          )}
          {step === 4 && (
            <p className="text-sm text-muted-foreground leading-5">
              {t('addContract.enterPricingDetailsPrompt')}
            </p>
          )}
          {step === 5 && (
            <p className="text-sm text-muted-foreground leading-5">
              {isResellerUser
                ? t('addContract.enterNotesPrompt')
                : t('addContract.enterBillingEmailPrompt')}
            </p>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleCancel}
          className="absolute right-4 top-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">{t('common.close')}</span>
        </button>

        {/* Content wrapper */}
        {step === 1 ? (
          <div className="flex flex-col gap-6 pb-4">
            {/* Search */}
            <div className="flex items-center w-full h-9 border border-input rounded-md bg-card">
              <Input
                placeholder={`${t('common.search')}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 rounded-l-md h-full focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <button
                type="button"
                className="flex items-center justify-center h-full w-9 shrink-0 hover:bg-accent transition-colors rounded-r-md"
              >
                <Search className="w-4 h-4 text-foreground" />
              </button>
            </div>

            {/* Customer List */}
            <div className="border border-border rounded-md h-[288px]">
              {filteredCustomers.length > 0 ? (
                <div className="h-full overflow-y-auto">
                  <RadioGroup
                    value={selectedCustomerId}
                    onValueChange={setSelectedCustomerId}
                    className="p-4 gap-0"
                  >
                    {filteredCustomers.map((customer, index) => (
                      <div key={customer.id}>
                        <div className="flex items-center gap-3 py-5">
                          <RadioGroupItem value={customer.id} id={customer.id} />
                          <Label
                            htmlFor={customer.id}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex flex-col gap-1">
                              <span className="font-medium text-sm leading-none">
                                {customer.companyName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {customer.businessRegNo}
                              </span>
                            </div>
                          </Label>
                        </div>
                        {index < filteredCustomers.length - 1 && (
                          <Separator className="my-0" />
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ) : (
                /* Empty state */
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-6 w-full max-w-[321px]">
                    <div className="flex flex-col items-center gap-4 w-full text-center">
                      {/* Icon */}
                      <div className="flex items-center justify-center size-10 bg-muted rounded-lg shrink-0">
                        <Search className="size-6" />
                      </div>
                      {/* Text */}
                      <div className="flex flex-col gap-2 items-center w-full">
                        <p className="text-lg font-medium leading-7">
                          {t('addContract.noResultsFound')}
                        </p>
                        <p className="text-sm text-muted-foreground leading-[1.625]">
                          {t('addContract.noResultsFoundDescription')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Add Customer Card */}
            <div className="border border-border rounded-md p-4">
              <div className="flex gap-4 items-start">
                <div className="flex-1 flex flex-col gap-1 justify-center min-w-0">
                  <p className="font-medium text-sm leading-4 text-foreground">
                    {t('addContract.cantFindCustomer')}
                  </p>
                  <p className="text-sm text-muted-foreground leading-5">
                    {t('addContract.addCustomerFirst')}
                  </p>
                </div>
                <div className="flex items-center justify-end self-stretch shrink-0">
                  <Button
                    variant="outline"
                    className="h-9 px-4 text-sm gap-2"
                    onClick={handleAddCustomerClick}
                  >
                    {t('customers.addCustomer')}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : step === 2 ? (
          <div className="flex flex-col gap-5 pb-4">{/* Step 2: Add Customer Form */}
            {/* Company Name */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="companyName" className="text-sm font-medium">
                {t('common.companyName')}
              </Label>
              <Input
                id="companyName"
                value={customerFormData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                onBlur={() => handleFieldBlur('companyName')}
                className="h-9"
                placeholder={t('customers.enterCompanyName')}
                aria-invalid={!!formErrors.companyName}
              />
              {formErrors.companyName && (
                <p className="text-sm text-destructive -mt-1">{formErrors.companyName}</p>
              )}
            </div>

            {/* Country */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="country" className="text-sm font-medium">
                {t('common.country')}
              </Label>
              <Select
                value={customerFormData.countryCode}
                onValueChange={(value) => {
                  setCustomerFormData((prev) => ({
                    ...prev,
                    countryCode: value,
                    businessRegNo: '',
                  }));
                  if (formErrors.businessRegNo) {
                    setFormErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.businessRegNo;
                      return newErrors;
                    });
                  }
                }}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder={t('customers.selectCountry')} />
                </SelectTrigger>
                <SelectContent className="max-h-[240px]">
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.countryCode && (
                <p className="text-sm text-destructive -mt-1">{formErrors.countryCode}</p>
              )}
            </div>

            {/* Business Reg. No. */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="businessRegNo" className="text-sm font-medium">
                {selectedCountry?.businessRegNoLabel || t('common.businessRegNo')}
              </Label>
              <Input
                id="businessRegNo"
                value={customerFormData.businessRegNo}
                onChange={(e) => handleInputChange('businessRegNo', e.target.value)}
                onBlur={() => handleFieldBlur('businessRegNo')}
                className="h-9"
                placeholder={selectedCountry?.businessRegNoFormat || ''}
                aria-invalid={!!formErrors.businessRegNo}
              />
              {formErrors.businessRegNo && (
                <p className="text-sm text-destructive -mt-1">{formErrors.businessRegNo}</p>
              )}
            </div>

            {/* CEO / Representative */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="ceoName" className="text-sm font-medium">
                {t('common.ceo')}
              </Label>
              <Input
                id="ceoName"
                value={customerFormData.ceoName}
                onChange={(e) => handleInputChange('ceoName', e.target.value)}
                onBlur={() => handleFieldBlur('ceoName')}
                className="h-9"
                placeholder={t('customers.enterCeo')}
                aria-invalid={!!formErrors.ceoName}
              />
              {formErrors.ceoName && (
                <p className="text-sm text-destructive -mt-1">{formErrors.ceoName}</p>
              )}
            </div>

            {/* Contact Person */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="contactPerson" className="text-sm font-medium">
                {t('common.contactPerson')}
              </Label>
              <Input
                id="contactPerson"
                value={customerFormData.contactPerson}
                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                onBlur={() => handleFieldBlur('contactPerson')}
                className="h-9"
                placeholder={t('customers.enterContactPerson')}
                aria-invalid={!!formErrors.contactPerson}
              />
              {formErrors.contactPerson && (
                <p className="text-sm text-destructive -mt-1">{formErrors.contactPerson}</p>
              )}
            </div>

            {/* Contact Person Email */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="contactEmail" className="text-sm font-medium">
                {t('common.contactPersonEmail')}
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={customerFormData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                onBlur={() => handleFieldBlur('contactEmail')}
                className="h-9"
                placeholder={t('customers.enterEmail')}
                aria-invalid={!!formErrors.contactEmail}
              />
              {formErrors.contactEmail && (
                <p className="text-sm text-destructive -mt-1">{formErrors.contactEmail}</p>
              )}
            </div>

            {/* Note Field */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="note" className="text-sm font-medium">
                {t('customers.note')}
              </Label>
              <div className="relative border border-input rounded-md bg-background">
                <Textarea
                  id="note"
                  value={customerFormData.note}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 280) {
                      handleInputChange('note', value);
                    }
                  }}
                  className="min-h-[120px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 pb-10"
                  placeholder={t('customers.enterNote')}
                />
                <div className="absolute bottom-0 left-0 right-0 px-3 py-3 text-sm text-muted-foreground">
                  {customerFormData.note.length}/280 {t('customers.characters')}
                </div>
              </div>
            </div>
          </div>
        ) : step === 3 ? (
          <div className="flex flex-col px-0 pt-0 pb-4 gap-6">{/* Step 3: Service and Pricing Model Selection */}
            {/* Company Name Blockquote */}
            <div className="w-full flex items-end justify-center">
              <div className="flex-1 flex flex-col items-start min-h-px min-w-px pb-0 pt-0 px-0">
                <div className="border-l-2 border-border pl-6 w-full flex gap-2 items-center">
                  <p className="flex-1 text-base font-normal leading-6 min-h-px min-w-px">{getSelectedCustomerName()}</p>
                </div>
              </div>
            </div>

            {/* Service Selection */}
            <div className="flex flex-col gap-4">
              <p className="text-sm font-medium leading-5">{t('addContract.service')}</p>
              <RadioGroup
                value={selectedService}
                onValueChange={setSelectedService}
                className="flex flex-col gap-3 cursor-pointer"
              >
                {isServiceAvailable('management') && (
                  <div
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer ${
                      selectedService === 'management'
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                    onClick={() => setSelectedService('management')}
                  >
                    <RadioGroupItem value="management" id="management" />
                    <div className="flex-1 flex flex-col gap-1.5 items-start justify-center min-h-px min-w-px pb-0 pt-px px-0">
                      <div className="flex flex-col font-medium justify-center leading-[0] text-sm w-full">
                        <p className="leading-none">Skuber⁺ Management</p>
                      </div>
                    </div>
                  </div>
                )}
                {isServiceAvailable('observability') && (
                  <div
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer ${
                      selectedService === 'observability'
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                    onClick={() => setSelectedService('observability')}
                  >
                    <RadioGroupItem value="observability" id="observability" />
                    <div className="flex-1 flex flex-col gap-1.5 items-start justify-center min-h-px min-w-px pb-0 pt-px px-0">
                      <div className="flex flex-col font-medium justify-center leading-[0] text-sm w-full">
                        <p className="leading-none">Skuber⁺ Observability</p>
                      </div>
                    </div>
                  </div>
                )}
                {isServiceAvailable('optimization') && (
                  <div
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer ${
                      selectedService === 'optimization'
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                    onClick={() => setSelectedService('optimization')}
                  >
                    <RadioGroupItem value="optimization" id="optimization" />
                    <div className="flex-1 flex flex-col gap-1.5 items-start justify-center min-h-px min-w-px pb-0 pt-px px-0">
                      <div className="flex flex-col font-medium justify-center leading-[0] text-sm w-full">
                        <p className="leading-none">Skuber⁺ Optimazation</p>
                      </div>
                    </div>
                  </div>
                )}
              </RadioGroup>
            </div>

            {/* Pricing Model Selection */}
            <div className="flex flex-col gap-4">
              <p className="text-sm font-medium leading-5">{t('addContract.pricingModel')}</p>
              <RadioGroup
                value={selectedPricingModel}
                onValueChange={setSelectedPricingModel}
                className="flex flex-col gap-3 cursor-pointer"
              >
                <div
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer ${
                    selectedPricingModel === 'fixed'
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                  onClick={() => setSelectedPricingModel('fixed')}
                >
                  <RadioGroupItem value="fixed" id="fixed" />
                  <div className="flex-1 flex flex-col gap-1.5 items-start justify-center min-h-px min-w-px pb-0 pt-px px-0">
                    <div className="flex flex-col font-medium justify-center leading-[0] text-sm w-full">
                      <p className="leading-none">{t('pricing.fixedRate')}</p>
                    </div>
                  </div>
                </div>
                <div
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer ${
                    selectedPricingModel === 'payg'
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                  onClick={() => setSelectedPricingModel('payg')}
                >
                  <RadioGroupItem value="payg" id="payg" />
                  <div className="flex-1 flex flex-col gap-1.5 items-start justify-center min-h-px min-w-px pb-0 pt-px px-0">
                    <div className="flex flex-col font-medium justify-center leading-[0] text-sm w-full">
                      <p className="leading-none">{t('pricing.payAsYouGo')}</p>
                    </div>
                  </div>
                </div>
                <div
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer ${
                    selectedPricingModel === 'trial'
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                  onClick={() => setSelectedPricingModel('trial')}
                >
                  <RadioGroupItem value="trial" id="trial" />
                  <div className="flex-1 flex flex-col gap-1.5 items-start justify-center min-h-px min-w-px pb-0 pt-px px-0">
                    <div className="flex flex-col font-medium justify-center leading-[0] text-sm w-full">
                      <p className="leading-none">{t('addContract.trial')}</p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        ) : step === 4 && selectedPricingModel === 'fixed' ? (
          <div className="flex flex-col px-0 pt-0 pb-4 gap-6">{/* Step 4: Fixed Rate Contract Details */}
            {/* Service Name + Fixed Rate Badge */}
            <div className="w-full flex items-end justify-center">
              <div className="flex-1 flex flex-col items-start min-h-px min-w-px pb-0 pt-0 px-0">
                <div className="border-l-2 border-border pl-6 w-full flex gap-2 items-center">
                  <p className="flex-1 text-base font-normal leading-6 min-h-px min-w-px">{getServiceName()}</p>
                </div>
              </div>
              <Badge className="bg-primary text-primary-foreground border-transparent text-xs font-semibold px-2 py-0.5 rounded-md">
                {t('pricing.fixedRate')}
              </Badge>
            </div>

            {/* Contract Term */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium leading-5">{t('addContract.contractTerm')}</p>
              <RadioGroup
                value={String(contractTerm)}
                onValueChange={(value) => handleTermChange(Number(value) as 1 | 3 | 5)}
                className="flex flex-col gap-3 cursor-pointer"
              >
                <div
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer ${
                    contractTerm === 1
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                  onClick={() => handleTermChange(1)}
                >
                  <RadioGroupItem value="1" id="term-1" />
                  <div className="flex-1 flex flex-col gap-1.5 items-start justify-center min-h-px min-w-px pb-0 pt-px px-0">
                    <div className="flex flex-col font-medium justify-center leading-[0] text-sm w-full">
                      <p className="leading-none">{t('pricing.oneYear')}</p>
                    </div>
                  </div>
                </div>
                <div
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer ${
                    contractTerm === 3
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                  onClick={() => handleTermChange(3)}
                >
                  <RadioGroupItem value="3" id="term-3" />
                  <div className="flex-1 flex flex-col gap-1.5 items-start justify-center min-h-px min-w-px pb-0 pt-px px-0">
                    <div className="flex flex-col font-medium justify-center leading-[0] text-sm w-full">
                      <p className="leading-none">{t('pricing.threeYear')}</p>
                    </div>
                  </div>
                </div>
                <div
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer ${
                    contractTerm === 5
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                  onClick={() => handleTermChange(5)}
                >
                  <RadioGroupItem value="5" id="term-5" />
                  <div className="flex-1 flex flex-col gap-1.5 items-start justify-center min-h-px min-w-px pb-0 pt-px px-0">
                    <div className="flex flex-col font-medium justify-center leading-[0] text-sm w-full">
                      <p className="leading-none">{t('pricing.fiveYear')}</p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Contract Period */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium leading-5 min-w-full w-min">{t('addContract.contractPeriod')}</p>
              <div className="flex gap-3 items-start w-full">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex-1 bg-card border border-input flex gap-2 items-center px-3 py-2 rounded-md">
                      <CalendarIcon className="size-4 shrink-0" />
                      <p className="basis-0 grow font-medium leading-5 text-sm text-foreground text-left overflow-hidden text-ellipsis whitespace-nowrap min-h-px min-w-px">
                        {startDate ? formatDateForDisplay(startDate) : '2025.10.11'}
                      </p>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={handleStartDateChange}
                      captionLayout="dropdown"
                      fromYear={2020}
                      toYear={2040}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex flex-col font-medium justify-center leading-[0] self-stretch shrink-0 text-sm w-1.5">
                  <p className="leading-5">-</p>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex-1 bg-card border border-input flex gap-2 items-center px-3 py-2 rounded-md">
                      <CalendarIcon className="size-4 shrink-0" />
                      <p className="basis-0 grow font-medium leading-5 text-sm text-foreground text-left overflow-hidden text-ellipsis whitespace-nowrap min-h-px min-w-px">
                        {endDate ? formatDateForDisplay(endDate) : '2025.10.11'}
                      </p>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={handleEndDateChange}
                      captionLayout="dropdown"
                      fromYear={2020}
                      toYear={2040}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Contract Amount */}
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium leading-5 min-w-full w-min">{t('addContract.contractAmount')}</p>
              <div className={`bg-card border flex gap-2 h-9 items-center px-3 py-1 rounded-md w-full ${contractAmountError ? 'border-destructive' : 'border-input'}`}>
                <div className="flex gap-2 items-center justify-center shrink-0">
                  <p className="font-medium leading-5 text-sm text-muted-foreground whitespace-pre">$</p>
                </div>
                <input
                  type="text"
                  value={formatNumberWithCommas(contractAmount)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    if (value !== contractAmount) {
                      setContractAmount(value);
                      const error = validateNumericInput(value);
                      setContractAmountError(error);
                    }
                  }}
                  onBlur={() => {
                    const error = validateNumericInput(contractAmount);
                    setContractAmountError(error);
                  }}
                  placeholder={t('addContract.enterAmount')}
                  className="basis-0 grow bg-transparent border-0 font-normal leading-5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-px min-w-px overflow-hidden text-ellipsis whitespace-nowrap"
                />
                <div className="flex gap-2 items-center justify-center shrink-0">
                  <p className="font-medium leading-5 text-sm text-muted-foreground whitespace-pre">
                    /{contractTerm} year{contractTerm > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              {contractAmountError && (
                <p className="text-sm text-destructive -mt-1">{contractAmountError}</p>
              )}
            </div>

            {/* Included Allocation */}
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium leading-5 min-w-full w-min">{t('addContract.includedAllocation')}</p>
              <div className={`bg-card border flex gap-2 h-9 items-center px-3 py-1 rounded-md w-full ${includedAllocationError ? 'border-destructive' : 'border-input'}`}>
                <input
                  type="text"
                  value={formatNumberWithCommas(includedAllocation)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    if (value !== includedAllocation) {
                      setIncludedAllocation(value);
                      const error = validateNumericInput(value);
                      setIncludedAllocationError(error);
                    }
                  }}
                  onBlur={() => {
                    const error = validateNumericInput(includedAllocation);
                    setIncludedAllocationError(error);
                  }}
                  placeholder={t('addContract.enterVcpuAllocation')}
                  className="basis-0 grow bg-transparent border-0 font-normal leading-5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-px min-w-px overflow-hidden text-ellipsis whitespace-nowrap"
                />
                <div className="flex gap-2 items-center justify-center shrink-0">
                  <p className="font-medium leading-5 text-sm text-muted-foreground whitespace-pre">vCPU</p>
                </div>
              </div>
              {includedAllocationError && (
                <p className="text-sm text-destructive -mt-1">{includedAllocationError}</p>
              )}
            </div>

            {/* Tax Included */}
            <div className="flex gap-2 items-start pt-1">
              <Checkbox
                id="tax-included"
                checked={taxIncluded}
                onCheckedChange={(checked) => setTaxIncluded(checked as boolean)}
                className="size-4"
              />
              <div className="flex flex-col gap-1.5 items-start shrink-0">
                <label
                  htmlFor="tax-included"
                  className="font-medium leading-none text-sm text-foreground cursor-pointer"
                >
                  {t('addContract.taxIncluded')}
                </label>
              </div>
            </div>
          </div>
        ) : step === 4 && selectedPricingModel === 'payg' ? (
          <div className="flex flex-col px-0 pt-0 pb-4 gap-6">{/* Step 4: Pay-as-you-go Contract Details */}
            {/* Service Name + Pay-as-you-go Badge */}
            <div className="w-full flex items-end justify-center">
              <div className="flex-1 flex flex-col items-start min-h-px min-w-px pb-0 pt-0 px-0">
                <div className="border-l-2 border-border pl-6 w-full flex gap-2 items-center">
                  <p className="flex-1 text-base font-normal leading-6 min-h-px min-w-px">{getServiceName()}</p>
                </div>
              </div>
              <Badge className="bg-primary text-primary-foreground border-transparent text-xs font-semibold px-2 py-0.5 rounded-md">
                {t('pricing.payAsYouGo')}
              </Badge>
            </div>

            {/* Contract Period */}
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium leading-5 min-w-full w-min">{t('addContract.contractPeriod')}</p>
              <div className={`flex gap-3 items-start w-full ${paygDateError ? 'mb-0' : ''}`}>
                {/* Start Date */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={`flex-1 bg-card border flex gap-2 items-center px-3 py-2 rounded-md ${paygDateError ? 'border-destructive' : 'border-input'}`}>
                      <CalendarIcon className="size-4 shrink-0" />
                      <p className="basis-0 grow font-medium leading-5 text-sm text-foreground text-left overflow-hidden text-ellipsis whitespace-nowrap min-h-px min-w-px">
                        {paygStartDate ? formatDateForDisplay(paygStartDate) : '2025.10.11'}
                      </p>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={paygStartDate}
                      onSelect={handlePaygStartDateChange}
                      captionLayout="dropdown"
                      fromYear={2020}
                      toYear={2040}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* Separator */}
                <div className="flex flex-col font-medium justify-center leading-[0] self-stretch shrink-0 text-sm w-1.5">
                  <p className="leading-5">-</p>
                </div>

                {/* End Date */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      disabled={!setEndDateEnabled}
                      className={`flex-1 bg-card border flex gap-2 items-center px-3 py-2 rounded-md ${!setEndDateEnabled ? 'opacity-50 cursor-not-allowed' : ''} ${paygDateError ? 'border-destructive' : 'border-input'}`}
                    >
                      <CalendarIcon className="size-4 shrink-0" />
                      <p className={`basis-0 grow font-medium leading-5 text-sm text-left overflow-hidden text-ellipsis whitespace-nowrap min-h-px min-w-px ${!setEndDateEnabled || !paygEndDate ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {setEndDateEnabled && paygEndDate ? formatDateForDisplay(paygEndDate) : t('addContract.pickEndDate')}
                      </p>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={paygEndDate}
                      onSelect={handlePaygEndDateChange}
                      captionLayout="dropdown"
                      fromYear={2020}
                      toYear={2040}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {paygDateError && (
                <p className="text-sm text-destructive -mt-1">{paygDateError}</p>
              )}

              {/* Set End Date Checkbox */}
              <div className="flex gap-2 items-start pt-1">
                <Checkbox
                  id="set-end-date"
                  checked={setEndDateEnabled}
                  onCheckedChange={(checked) => {
                    setSetEndDateEnabled(checked as boolean);
                    // Validate when checkbox changes
                    if (checked) {
                      const error = validatePaygDateRange(paygStartDate, paygEndDate, checked as boolean);
                      setPaygDateError(error);
                    } else {
                      setPaygDateError('');
                    }
                  }}
                  className="size-4"
                />
                <div className="flex flex-col gap-1.5 items-start shrink-0">
                  <label
                    htmlFor="set-end-date"
                    className="font-medium leading-none text-sm text-foreground cursor-pointer"
                  >
                    {t('addContract.setEndDate')}
                  </label>
                </div>
              </div>
            </div>

            {/* vCPU Unit Price */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium leading-5 min-w-full w-min">{t('addContract.vcpuUnitPrice')}</p>
              <div className={`bg-card border flex gap-2 h-9 items-center px-3 py-1 rounded-md w-full ${vcpuUnitPriceError ? 'border-destructive' : 'border-input'}`}>
                <div className="flex gap-2 items-center justify-center shrink-0">
                  <p className="font-medium leading-5 text-sm text-muted-foreground whitespace-pre">$</p>
                </div>
                <input
                  type="text"
                  value={formatDecimalWithCommas(vcpuUnitPrice)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    // Ensure only one decimal point and max 2 decimal places
                    const parts = value.split('.');
                    let formattedValue = value;
                    if (parts.length > 2) {
                      formattedValue = parts[0] + '.' + parts.slice(1).join('');
                    } else if (parts.length === 2 && parts[1].length > 2) {
                      formattedValue = parts[0] + '.' + parts[1].substring(0, 2);
                    }
                    if (formattedValue !== vcpuUnitPrice) {
                      setVcpuUnitPrice(formattedValue);
                      const error = validatePriceInput(formattedValue);
                      setVcpuUnitPriceError(error);
                    }
                  }}
                  onBlur={() => {
                    const error = validatePriceInput(vcpuUnitPrice);
                    setVcpuUnitPriceError(error);
                  }}
                  placeholder={t('addContract.enterAmount')}
                  className="basis-0 grow bg-transparent border-0 font-normal leading-5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-px min-w-px overflow-hidden text-ellipsis whitespace-nowrap"
                />
                <div className="flex gap-2 items-center justify-center shrink-0">
                  <p className="font-medium leading-5 text-sm text-muted-foreground whitespace-pre">/{t('addContract.hour')}</p>
                </div>
              </div>
              {vcpuUnitPriceError && (
                <p className="text-sm text-destructive -mt-1">{vcpuUnitPriceError}</p>
              )}
            </div>

            {/* Minimum Charge */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium leading-5 min-w-full w-min">{t('addContract.minimumCharge')}</p>
              <div className={`bg-card border flex gap-2 h-9 items-center px-3 py-1 rounded-md w-full ${minimumChargeError ? 'border-destructive' : 'border-input'}`}>
                <div className="flex gap-2 items-center justify-center shrink-0">
                  <p className="font-medium leading-5 text-sm text-muted-foreground whitespace-pre">$</p>
                </div>
                <input
                  type="text"
                  value={formatDecimalWithCommas(minimumCharge)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    // Ensure only one decimal point and max 2 decimal places
                    const parts = value.split('.');
                    let formattedValue = value;
                    if (parts.length > 2) {
                      formattedValue = parts[0] + '.' + parts.slice(1).join('');
                    } else if (parts.length === 2 && parts[1].length > 2) {
                      formattedValue = parts[0] + '.' + parts[1].substring(0, 2);
                    }
                    if (formattedValue !== minimumCharge) {
                      setMinimumCharge(formattedValue);
                      const error = validatePriceInput(formattedValue);
                      setMinimumChargeError(error);
                    }
                  }}
                  onBlur={() => {
                    const error = validatePriceInput(minimumCharge);
                    setMinimumChargeError(error);
                  }}
                  placeholder={t('addContract.enterAmount')}
                  className="basis-0 grow bg-transparent border-0 font-normal leading-5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-px min-w-px overflow-hidden text-ellipsis whitespace-nowrap"
                />
                <div className="flex gap-2 items-center justify-center shrink-0">
                  <p className="font-medium leading-5 text-sm text-muted-foreground whitespace-pre">/{t('addContract.month')}</p>
                </div>
              </div>
              {minimumChargeError && (
                <p className="text-sm text-destructive -mt-1">{minimumChargeError}</p>
              )}
            </div>

            {/* Tax Included */}
            <div className="flex gap-2 items-start pt-1">
              <Checkbox
                id="payg-tax-included"
                checked={paygTaxIncluded}
                onCheckedChange={(checked) => setPaygTaxIncluded(checked as boolean)}
                className="size-4"
              />
              <div className="flex flex-col gap-1.5 items-start shrink-0">
                <label
                  htmlFor="payg-tax-included"
                  className="font-medium leading-none text-sm text-foreground cursor-pointer"
                >
                  {t('addContract.taxIncluded')}
                </label>
              </div>
            </div>
          </div>
        ) : step === 4 && selectedPricingModel === 'trial' ? (
          <div className="flex flex-col px-0 pt-0 pb-4 gap-6">{/* Step 4: Trial Contract Details */}
            {/* Service Name + Trial Badge */}
            <div className="w-full flex items-end justify-center">
              <div className="flex-1 flex flex-col items-start min-h-px min-w-px pb-0 pt-0 px-0">
                <div className="border-l-2 border-border pl-6 w-full flex gap-2 items-center">
                  <p className="flex-1 text-base font-normal leading-6 min-h-px min-w-px">{getServiceName()}</p>
                </div>
              </div>
              <Badge className="bg-primary text-primary-foreground border-transparent text-xs font-semibold px-2 py-0.5 rounded-md">
                {t('addContract.trial')}
              </Badge>
            </div>

            {/* Trial Period */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <Label className="text-sm font-medium leading-5">{t('addContract.trialPeriod')}</Label>

                {/* Date Range */}
                <div className="flex gap-3 items-center w-full">
                {/* Start Date */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 justify-start text-left font-normal h-9 px-3 gap-2"
                    >
                      <CalendarIcon className="h-4 w-4" />
                      <span className="flex-1 text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                        {trialStartDate ? formatDateForDisplay(trialStartDate) : t('addContract.pickDate')}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={trialStartDate}
                      onSelect={handleTrialStartDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* Separator */}
                <div className="flex flex-col font-medium justify-center leading-[0] self-stretch text-sm text-foreground w-[6px]">
                  <p className="leading-5">-</p>
                </div>

                {/* End Date */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 justify-start text-left font-normal h-9 px-3 gap-2"
                    >
                      <CalendarIcon className="h-4 w-4" />
                      <span className="flex-1 text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                        {trialEndDate ? formatDateForDisplay(trialEndDate) : t('addContract.pickDate')}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={trialEndDate}
                      onSelect={handleTrialEndDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                </div>

                {/* Date Error Message */}
                {trialDateError && (
                  <p className="text-sm text-destructive -mt-2">{trialDateError}</p>
                )}
              </div>

              {/* Toggle Group for Period Selection */}
              <div className="pt-1 flex items-center">
                <button
                  type="button"
                  onClick={() => handleTrialPeriodChange(7)}
                  className={`h-9 px-2 py-2.5 flex items-center justify-center gap-2 border border-input rounded-l-md cursor-pointer ${
                    trialPeriod === 7 ? 'bg-accent' : 'bg-background'
                  }`}
                >
                  <p className="text-sm font-medium leading-5 whitespace-pre">{t('addContract.sevenDays')}</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleTrialPeriodChange(14)}
                  className={`h-9 px-2 py-2.5 flex items-center justify-center gap-2 border-t border-r border-b border-input ${
                    trialPeriod === 14 ? 'bg-accent' : 'bg-background'
                  }`}
                >
                  <p className="text-sm font-medium leading-5 whitespace-pre">{t('addContract.fourteenDays')}</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleTrialPeriodChange(30)}
                  className={`h-9 px-2 py-2.5 flex items-center justify-center gap-2 border-t border-r border-b border-input rounded-r-md ${
                    trialPeriod === 30 ? 'bg-accent' : 'bg-background'
                  }`}
                >
                  <p className="text-sm font-medium leading-5 whitespace-pre">{t('addContract.oneMonth')}</p>
                </button>
              </div>
            </div>

            {/* Usage Limit */}
            <div className="flex flex-col gap-3">
              <Label className="text-sm font-medium leading-5">{t('addContract.usageLimit')}</Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder={t('addContract.enterTotalVcpuHours')}
                  value={formatNumberWithCommas(usageLimit)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setUsageLimit(value);
                    setUsageLimitError(value ? '' : t('addContract.fieldRequired'));
                  }}
                  className="h-9 px-3 pr-[110px]"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <p className="text-sm font-medium text-muted-foreground">{t('addContract.vcpuHour')}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-5">
                {t('addContract.totalCreditDuringTrial')}
              </p>
            </div>
          </div>
        ) : step === 5 ? (
          <div className="flex flex-col px-0 pt-0 pb-4 gap-6">{/* Step 5: Additional Information */}
            {/* Service Name + Pricing Model Badge */}
            <div className="w-full flex items-center">
              <div className="flex-1 flex flex-col items-start min-h-px min-w-px pb-0 pt-0 px-0">
                <div className="border-l-2 border-border pl-6 w-full flex gap-2 items-center">
                  <p className="flex-1 text-base font-normal leading-6 min-h-px min-w-px">{getServiceName()}</p>
                </div>
              </div>
              <Badge className="bg-primary text-primary-foreground border-transparent text-xs font-semibold px-2 py-0.5 rounded-md">
                {selectedPricingModel === 'fixed' ? t('pricing.fixedRate') : selectedPricingModel === 'payg' ? t('pricing.payAsYouGo') : t('addContract.trial')}
              </Badge>
            </div>

            {/* Billing Email Address - Only for WM users */}
            {!isResellerUser && (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium leading-5 min-w-full w-min">{t('addContract.billingEmailAddress')}</p>

                {/* Existing emails list */}
                {billingEmails.map((email, index) => (
                  <div key={index} className="bg-card border border-input flex gap-2 h-9 items-center px-3 py-1 rounded-md w-full">
                    <p className="basis-0 grow font-normal leading-5 text-sm text-foreground overflow-hidden text-ellipsis whitespace-nowrap min-h-px min-w-px">
                      {email}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      className="flex items-center justify-center shrink-0 size-6 hover:bg-secondary rounded-sm transition-colors"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}

                {/* Add new email input */}
                <div className="flex flex-col gap-2">
                  <div className={`bg-card border flex gap-2 h-9 items-center px-3 py-1 rounded-md w-full ${newEmailError ? 'border-destructive' : 'border-input'}`}>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => {
                        setNewEmail(e.target.value);
                        if (newEmailError) setNewEmailError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddEmail();
                        }
                      }}
                      placeholder={t('customers.enterEmail')}
                      className="basis-0 grow bg-transparent border-0 font-normal leading-5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-px min-w-px overflow-hidden text-ellipsis whitespace-nowrap"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleAddEmail}
                      className="h-6 px-2 py-0 text-sm shrink-0"
                    >
                      {t('addContract.add')}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground leading-5">{t('addContract.pressEnterToAdd')}</p>
                  {newEmailError && (
                    <p className="text-sm text-destructive -mt-1">{newEmailError}</p>
                  )}
                </div>

                {/* Add new email button - only show after at least one email is added */}
                {billingEmails.length > 0 && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-9 px-4 text-sm gap-2 w-fit"
                    onClick={() => {
                      // Focus on the input field
                      const input = document.querySelector('input[type="email"]') as HTMLInputElement;
                      if (input) input.focus();
                    }}
                  >
                    <Plus className="size-4" />
                    {t('addContract.addNewEmail')}
                  </Button>
                )}
              </div>
            )}

            {/* Note */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium leading-5 min-w-full w-min">{t('addContract.note')}</p>
              <div className="border border-input rounded-md bg-background flex flex-col">
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value.slice(0, 280))}
                  placeholder={t('addContract.enterNotesPlaceholder')}
                  className="h-[120px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-3 text-sm overflow-auto shadow-none"
                />
                <div className="flex items-center justify-between px-3 pb-3 pt-1.5">
                  <p className="text-sm text-muted-foreground font-medium leading-5">
                    {t('addContract.charactersCount', { count: note.length })}
                  </p>
                </div>
              </div>
            </div>

            {/* Delete Rejected Contract Checkbox - Only show if there's a rejected contract */}
            {rejectedContractId && (
              <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-md">
                <Checkbox
                  id="delete-rejected"
                  checked={deleteRejectedContract}
                  onCheckedChange={(checked) => setDeleteRejectedContract(checked as boolean)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="delete-rejected"
                  className="text-sm leading-5 cursor-pointer select-none flex-1"
                >
                  {t('addContract.deleteRejectedContract')}
                </label>
              </div>
            )}
          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" className="h-9 px-4 text-sm" onClick={handleCancel}>
            {t('common.cancel')}
          </Button>
          <div className="flex items-center gap-2 shrink-0">
            {(step === 2 || step === 3 || step === 4 || step === 5) && (
              <Button
                variant="outline"
                className="h-9 px-4 text-sm"
                onClick={handlePrev}
                disabled={step <= firstStep}
              >
                {t('common.prev')}
              </Button>
            )}
            <Button
              className="h-9 px-4 text-sm"
              onClick={handleNext}
              disabled={
                step === 1
                  ? !selectedCustomerId
                  : step === 2
                  ? !isFormValid()
                  : step === 3
                  ? !selectedService || !selectedPricingModel
                  : step === 4
                  ? selectedPricingModel === 'fixed'
                    ? !contractAmount || !includedAllocation || !startDate || !endDate || !!contractAmountError || !!includedAllocationError
                    : selectedPricingModel === 'payg'
                    ? !vcpuUnitPrice || !minimumCharge || !paygStartDate || !!vcpuUnitPriceError || !!minimumChargeError || !!paygDateError
                    : selectedPricingModel === 'trial'
                    ? !trialStartDate || !trialEndDate || !usageLimit || !!usageLimitError || !!trialDateError
                    : false
                  : step === 5
                  ? !isResellerUser && billingEmails.length === 0
                  : false
              }
            >
              {step === 5 ? t('addContract.submit') : t('common.next')}
            </Button>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
