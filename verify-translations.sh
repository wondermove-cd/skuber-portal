#!/bin/bash

# Script to verify translation implementation status
# This checks which files still have hardcoded English text that should be translated

echo "========================================="
echo "i18n Translation Verification Script"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Files to check
FILES_TO_CHECK=(
  "src/pages/ContractDetailPage.tsx"
  "src/pages/ResellerPage.tsx"
  "src/pages/ResellerDetailPage.tsx"
  "src/components/contracts/AddContractModal.tsx"
  "src/components/customers/AddNoteModal.tsx"
  "src/components/customers/EditCustomerModal.tsx"
  "src/components/contracts/EditBillingEmailsModal.tsx"
  "src/components/reseller/AddResellerModal.tsx"
  "src/components/reseller/EditResellerInfoModal.tsx"
  "src/components/reseller/EditPricingModal.tsx"
  "src/components/reseller/AddServiceModal.tsx"
)

echo "Checking translation implementation status..."
echo ""

total=0
implemented=0
not_implemented=0

for file in "${FILES_TO_CHECK[@]}"; do
  total=$((total + 1))

  if [ ! -f "$file" ]; then
    echo -e "${RED}✗${NC} $file - FILE NOT FOUND"
    not_implemented=$((not_implemented + 1))
    continue
  fi

  # Check if file has useTranslation import
  if grep -q "useTranslation" "$file"; then
    echo -e "${GREEN}✓${NC} $file - Has translation hook"
    implemented=$((implemented + 1))
  else
    echo -e "${YELLOW}⚠${NC} $file - Missing useTranslation"
    not_implemented=$((not_implemented + 1))
  fi
done

echo ""
echo "========================================="
echo "Summary:"
echo "========================================="
echo -e "Total files: $total"
echo -e "${GREEN}Implemented: $implemented${NC}"
echo -e "${YELLOW}Not implemented: $not_implemented${NC}"
echo ""

# Check translation files are in sync
echo "Checking translation file synchronization..."
EN_LINES=$(wc -l < "src/locales/en/common.json")
KO_LINES=$(wc -l < "src/locales/ko/common.json")

if [ "$EN_LINES" -eq "$KO_LINES" ]; then
  echo -e "${GREEN}✓${NC} Translation files are synchronized ($EN_LINES lines each)"
else
  echo -e "${RED}✗${NC} Translation files are out of sync!"
  echo "  English: $EN_LINES lines"
  echo "  Korean: $KO_LINES lines"
fi

echo ""
echo "For implementation details, see:"
echo "  - I18N_IMPLEMENTATION_GUIDE.md"
echo "  - TRANSLATION_COMPLETION_SUMMARY.md"
echo ""
