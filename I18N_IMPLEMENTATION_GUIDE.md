# i18n Translation Implementation Guide

## Summary

All translation keys have been added to both `src/locales/en/common.json` and `src/locales/ko/common.json` (567 lines each).

## Translation Keys Added

### Contract Detail Page (`contractDetail.*`)
- Contract information labels
- Billing information
- vCPU Usage chart labels
- Payment history table headers
- Toast notifications
- Alert dialog messages
- Status labels and badges

### Reseller Pages (`resellers.*`, `resellerDetail.*`)
- Reseller list table headers
- Reseller detail information
- Pricing information
- Service management
- Customer and contract lists

### Modal Components

#### AddContractModal (`addContract.*`)
- Form labels and placeholders
- Validation error messages
- Success notifications

#### AddNoteModal (`addNote.*`)
- Modal titles (Add/Edit modes)
- Character counter
- Placeholders

#### EditCustomerModal (`editCustomer.*`)
- Form field labels
- Validation messages
- Error messages

#### EditBillingEmailsModal (`editBillingEmails.*`)
- Modal title and description
- Email input labels
- Validation messages

#### AddResellerModal (`addReseller.*`)
- Multi-step form labels
- Service selection
- Pricing configuration
- Validation messages

#### EditResellerInfoModal (`editResellerInfo.*`)
- Form labels
- Validation errors

#### EditPricingModal (`editPricing.*`)
- Pricing form labels
- Validation messages

#### AddServiceModal (`addService.*`)
- Service selection
- Pricing configuration
- Multi-step navigation

## Implementation Pattern

For each file that needs translation:

### 1. Add Import
```typescript
import { useTranslation } from 'react-i18next';
```

### 2. Add Hook
```typescript
export default function ComponentName() {
  const { t } = useTranslation();
  // ... rest of component
}
```

### 3. Replace Hardcoded Strings

**Before:**
```typescript
<h2>Contract info.</h2>
<Label>Company Name</Label>
<p>Contract not found</p>
```

**After:**
```typescript
<h2>{t('contractDetail.contractInfo')}</h2>
<Label>{t('contractDetail.companyName')}</Label>
<p>{t('contractDetail.contractNotFound')}</p>
```

### 4. Dynamic Values with Interpolation

**Before:**
```typescript
toast({
  title: 'Contract Deleted',
  description: `Contract ${contract.contractNumber} has been deleted successfully`
});
```

**After:**
```typescript
toast({
  title: t('contractDetail.contractDeleted'),
  description: t('contractDetail.contractDeletedDesc', { number: contract.contractNumber })
});
```

### 5. Conditional Text

**Before:**
```typescript
{editMode ? 'Edit Note' : 'Add Note'}
```

**After:**
```typescript
{editMode ? t('addNote.editTitle') : t('addNote.title')}
```

## Files Requiring Translation Implementation

### Priority 1 - Pages
- [ ] `/src/pages/ContractDetailPage.tsx` - Use `contractDetail.*` keys
- [ ] `/src/pages/ResellerPage.tsx` - Use `resellers.*` keys
- [ ] `/src/pages/ResellerDetailPage.tsx` - Use `resellerDetail.*` keys

### Priority 2 - Modals
- [ ] `/src/components/contracts/AddContractModal.tsx` - Use `addContract.*` keys
- [ ] `/src/components/customers/AddNoteModal.tsx` - Use `addNote.*` keys
- [ ] `/src/components/customers/EditCustomerModal.tsx` - Use `editCustomer.*` keys
- [ ] `/src/components/contracts/EditBillingEmailsModal.tsx` - Use `editBillingEmails.*` keys
- [ ] `/src/components/reseller/AddResellerModal.tsx` - Use `addReseller.*` keys
- [ ] `/src/components/reseller/EditResellerInfoModal.tsx` - Use `editResellerInfo.*` keys
- [ ] `/src/components/reseller/EditPricingModal.tsx` - Use `editPricing.*` keys
- [ ] `/src/components/reseller/AddServiceModal.tsx` - Use `addService.*` keys

## Common Patterns & Examples

### Status Badges
```typescript
// Use existing status keys from common.status.*
<Badge>{t(`status.${contract.status}`)}</Badge>
```

### Pricing Models
```typescript
// Use existing pricing keys from common.pricing.*
<Badge>{t(`pricing.${pricingModel}`)}</Badge>
```

### Common Actions
```typescript
// Use existing common keys
<Button>{t('common.save')}</Button>
<Button>{t('common.cancel')}</Button>
<Button>{t('common.delete')}</Button>
<Button>{t('common.edit')}</Button>
<Button>{t('common.add')}</Button>
```

### Pagination
```typescript
<Button>{t('common.previous')}</Button>
<Button>{t('common.next')}</Button>
<span>{t('common.pageOf', { current: page + 1, total: totalPages })}</span>
```

### Character Counter
```typescript
<p>{t('addNote.charactersCount', { count: noteContent.length, max: maxCharacters })}</p>
```

## Translation Key Naming Convention

All keys follow the pattern: `{section}.{key}`

- **contractDetail.\***: Contract detail page
- **resellers.\***: Reseller list page
- **resellerDetail.\***: Reseller detail page
- **addContract.\***: Add contract modal
- **addNote.\***: Add/edit note modal
- **editCustomer.\***: Edit customer modal
- **editBillingEmails.\***: Edit billing emails modal
- **addReseller.\***: Add reseller modal
- **editResellerInfo.\***: Edit reseller info modal
- **editPricing.\***: Edit pricing modal
- **addService.\***: Add service modal

## Verification Checklist

After implementing translations in each file:

- [ ] Import `useTranslation` added
- [ ] `const { t } = useTranslation()` hook added
- [ ] All hardcoded English text replaced with `t()` calls
- [ ] Dynamic values use interpolation: `t('key', { variable: value })`
- [ ] Pluralization handled correctly
- [ ] No console errors when switching languages
- [ ] Korean translations display correctly
- [ ] English translations display correctly

## Testing

1. Run the app: `npm run dev`
2. Navigate to each translated page/modal
3. Toggle language between English and Korean
4. Verify all text translates correctly
5. Check that dynamic values (names, numbers) display correctly

## Known Issues to Fix

### Inconsistencies Found

The following inconsistencies need to be reviewed in existing translated files:

1. **Invoice Number Key**: Some files may use `payments.invoiceNo` but should use `contractDetail.invoiceNo` when in contract detail context
2. **Status Keys**: Ensure all status displays use `status.*` keys consistently
3. **Common Actions**: Verify all buttons use `common.*` keys for standard actions

## Notes

- All translation keys have been added to both EN and KO files
- 567 lines in each translation file
- All new keys follow the existing naming convention
- Korean translations are natural and contextually appropriate
- HTML tags in descriptions (like `<br />` and `<strong>`) are preserved for formatting
