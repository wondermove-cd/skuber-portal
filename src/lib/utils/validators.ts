import { COUNTRIES } from '@/lib/constants/countries';

/**
 * Validates a business registration number based on the country code
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @param businessRegNo - Business registration number to validate
 * @returns Object with isValid boolean and optional error message
 */
export function validateBusinessRegNo(
  countryCode: string,
  businessRegNo: string
): { isValid: boolean; error?: string } {
  if (!businessRegNo.trim()) {
    return { isValid: false, error: 'Business registration number is required' };
  }

  const country = COUNTRIES.find((c) => c.code === countryCode);

  if (!country) {
    return { isValid: false, error: 'Invalid country selected' };
  }

  const isValid = country.businessRegNoPattern.test(businessRegNo);

  if (!isValid) {
    return {
      isValid: false,
      error: `Invalid format (e.g., ${country.businessRegNoFormat})`,
    };
  }

  return { isValid: true };
}
