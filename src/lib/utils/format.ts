// Format numbers with thousand separators
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

// Format currency with $ sign
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Format percentage with + or - sign
export const formatPercentage = (value: number): string => {
  return `${value > 0 ? '+' : ''}${value}%`;
};

// Format days left as D-day
export const formatDaysLeft = (days: number): string => {
  return `D-${days}`;
};

// Generate contract ID: YYMMDD-CUSTOMERCODE-SEQUENCE
export const generateContractId = (
  date: Date,
  customerId: string,
  sequence: number
): string => {
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const seq = String(sequence).padStart(2, '0');
  return `${year}${month}${day}-${customerId}-${seq}`;
};

// Get initials from name (first 2 letters of first 2 words)
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
};
