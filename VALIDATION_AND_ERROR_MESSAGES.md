# 검증 및 오류 메시지 종합 문서

## 목차
1. [인증 (Authentication)](#1-인증-authentication)
2. [설정 (Settings)](#2-설정-settings)
3. [고객사 (Customers)](#3-고객사-customers)
4. [리셀러 (Resellers)](#4-리셀러-resellers)
5. [계약 (Contracts)](#5-계약-contracts)
6. [공통 검증 (Common Validation)](#6-공통-검증-common-validation)
7. [일반 오류 (General Errors)](#7-일반-오류-general-errors)

---

## 1. 인증 (Authentication)

### 1.1 로그인 (Login)

| 케이스 | 조건 | 영문 메시지 | 한글 메시지 | 위치 |
|--------|------|------------|------------|------|
| 이메일 미입력 | 이메일 필드 비어있음 | Email is required | 이메일은 필수입니다 | LoginForm.tsx:44 |
| 이메일 형식 오류 | 유효하지 않은 이메일 형식 | Invalid email address | 올바른 이메일 주소를 입력해 주세요 | LoginForm.tsx:45 |
| 비밀번호 미입력 | 비밀번호 필드 비어있음 | Password is required | 비밀번호는 필수입니다 | LoginForm.tsx:47 |
| 비밀번호 길이 부족 | 8자 미만 | Password must be at least 8 characters | 비밀번호는 최소 8자 이상이어야 합니다 | LoginForm.tsx:48 |
| 인증 실패 | 이메일/비밀번호 불일치 | Invalid email or password | 이메일 또는 비밀번호가 일치하지 않습니다 | auth.ts:13,18 |
| 일반 로그인 실패 | 기타 오류 | Login failed. Please try again. | 로그인에 실패했습니다. 다시 시도해주세요. | LoginForm.tsx:66 |

### 1.2 비밀번호 찾기 (Forgot Password)

| 케이스 | 영문 메시지 | 한글 메시지 |
|--------|------------|------------|
| 계정 없음 | No account found with this email address. | 해당 이메일 주소로 등록된 계정이 없습니다. |
| 전송 실패 | Failed to send verification code. Please try again. | 인증 코드 전송에 실패했습니다. 다시 시도해 주세요. |

### 1.3 인증 코드 확인 (Verify Code)

| 케이스 | 영문 메시지 | 한글 메시지 |
|--------|------------|------------|
| 유효하지 않은 코드 | Invalid verification code. Please try again. | 유효하지 않은 인증 코드입니다. 다시 시도해 주세요. |

### 1.4 비밀번호 재설정 (Reset Password)

| 케이스 | 영문 메시지 | 한글 메시지 |
|--------|------------|------------|
| 비밀번호 불일치 | Passwords don't match | 비밀번호가 일치하지 않습니다 |
| 비밀번호 길이 부족 | Must be at least 8 characters long. | 최소 8자 이상이어야 합니다. |
| 재설정 실패 | Failed to reset password. Please try again. | 비밀번호 재설정에 실패했습니다. 다시 시도해주세요. |

### 1.5 회원가입 (Signup)

| 필드 | 케이스 | 영문 메시지 | 한글 메시지 |
|------|--------|------------|------------|
| 이름 | 미입력 | Full name is required | 이름은 필수입니다 |
| 담당자 | 미입력 | Contact person is required | 담당자는 필수입니다 |
| 국가 | 미선택 | Country is required | 국가는 필수입니다 |
| 사업자등록번호 | 미입력 | Business registration number is required | 사업자등록번호는 필수입니다 |
| 사업자등록번호 | 형식 오류 | Invalid business registration number format for selected country | 선택한 국가에 대한 사업자등록번호 형식이 올바르지 않습니다 |
| 초대 링크 | 유효하지 않음 | Invalid invitation link | 유효하지 않은 초대 링크 |

---

## 2. 설정 (Settings)

### 2.1 계정 생성 (Create Account)

| 필드 | 케이스 | 영문 메시지 | 한글 메시지 | 위치 |
|------|--------|------------|------------|------|
| 이메일 | 미입력 | Email is required | 이메일은 필수입니다 | CreateAccountModal.tsx:159 |
| 이메일 | 형식 오류 | Invalid email format | 올바른 이메일 형식이 아닙니다 | CreateAccountModal.tsx:161 |
| 이메일 | 중복 | This email is already registered | 이미 등록된 이메일입니다 | CreateAccountModal.tsx:168 |
| 이름 | 미입력 | Name is required | 이름은 필수입니다 | CreateAccountModal.tsx:173 |

### 2.2 계정 수정 (Edit Account)

| 필드 | 케이스 | 영문 메시지 | 한글 메시지 | 위치 |
|------|--------|------------|------------|------|
| 이름 | 미입력 | Name is required | 이름은 필수입니다 | EditAccountModal.tsx:154 |

### 2.3 권한 유형 (Permission Types)

| 권한 | 영문 | 한글 | 설명 (영문) | 설명 (한글) |
|------|-----|------|------------|------------|
| Administrator | Administrator | 관리자 | Administrators have access and editing permissions for all menus. | 관리자는 모든 메뉴에 대한 접근 및 편집 권한이 있습니다. |
| Editor | Editor | 편집자 | Editors have access and editing permissions to all menus except for the account management menu. | 편집자는 계정 관리 메뉴를 제외한 모든 메뉴에 대한 접근 및 편집 권한이 있습니다. |
| Viewer | Viewer | 조회자 | Viewers cannot access the account management menu, but they have permission to view the rest of the menus. | 조회자는 계정 관리 메뉴에 접근할 수 없지만, 나머지 메뉴에 대한 조회 권한이 있습니다. |

### 2.4 계정 삭제 (Delete Account)

| 케이스 | 영문 메시지 | 한글 메시지 |
|--------|------------|------------|
| 삭제 확인 | Are you sure you want to delete | 삭제하시겠습니까 |
| 삭제 경고 | This action cannot be undone. | 이 작업은 취소할 수 없습니다. |

### 2.5 초대 관리 (Invitation Management)

| 액션 | 영문 | 한글 |
|------|-----|------|
| 초대 재전송 | Resend Invitation | 초대 재전송 |
| 초대 취소 | Cancel Invitation | 초대 취소 |
| 권한 위임 | Delegate Authority | 권한 위임 |

---

## 3. 고객사 (Customers)

### 3.1 고객사 추가/수정

| 필드 | 케이스 | 영문 메시지 | 한글 메시지 |
|------|--------|------------|------------|
| 회사명 | 미입력 | Company name is required | 회사명을 입력해주세요 |
| 회사명 | 2자 미만 | Company name must be at least 2 characters | 회사명은 최소 2자 이상이어야 합니다 |
| 회사명 | 중복 | Company name already exists | 이미 존재하는 회사명입니다 |
| 국가 | 미선택 | Country is required | 국가를 선택해주세요 |
| 사업자등록번호 | 미입력 | Business registration number is required | 사업자 등록번호를 입력해주세요 |
| 담당자 | 미입력 | Contact person is required | 담당자를 입력해주세요 |
| 담당자 이메일 | 미입력 | Email is required | 이메일을 입력해주세요 |
| 담당자 이메일 | 형식 오류 | Invalid email format | 올바른 이메일 형식이 아닙니다 |
| 이름 | 2자 미만 | Name must be at least 2 characters | 이름은 최소 2자 이상이어야 합니다 |

### 3.2 고객사 삭제

| 케이스 | 영문 메시지 | 한글 메시지 |
|--------|------------|------------|
| 활성 계약 있음 | This customer has {count} active contract(s). Please remove or reassign all contracts before deleting this customer. | 이 고객사는 {count}개의 활성 계약이 있습니다. 고객사를 삭제하기 전에 모든 계약을 제거하거나 재할당해주세요. |

### 3.3 고객사 내보내기

| 케이스 | 영문 메시지 | 한글 메시지 |
|--------|------------|------------|
| 데이터 없음 | There are no customers to export. | 내보낼 고객사가 없습니다. |

---

## 4. 리셀러 (Resellers)

### 4.1 리셀러 추가/수정

| 필드 | 케이스 | 영문 메시지 | 한글 메시지 |
|------|--------|------------|------------|
| 리셀러명 | 미입력 | Reseller name is required | 리셀러명을 입력해주세요 |
| 리셀러명 | 2자 미만 | Reseller name must be at least 2 characters | 리셀러명은 최소 2자 이상이어야 합니다 |
| 리셀러명 | 중복 | Reseller name already exists | 이미 존재하는 리셀러명입니다 |
| 국가 | 미선택 | Country is required | 국가를 선택해주세요 |
| 사업자등록번호 | 미입력 | Business registration number is required | 사업자 등록번호를 입력해주세요 |
| 담당자 | 미입력 | Contact person is required | 담당자를 입력해주세요 |
| 이메일 | 미입력 | Email is required | 이메일을 입력해주세요 |
| 이메일 | 형식 오류 | Invalid email format | 올바른 이메일 형식이 아닙니다 |
| 서비스 선택 | 미선택 | At least one service is required | 최소 1개의 서비스를 선택해주세요 |

---

## 5. 계약 (Contracts)

### 5.1 계약 추가 - 기본 정보

| 필드 | 케이스 | 영문 메시지 | 한글 메시지 |
|------|--------|------------|------------|
| 리셀러 | 미선택 | Reseller is required | 리셀러를 선택해주세요 |
| 고객사 | 미선택 | Customer is required | 고객사를 선택해주세요 |
| 서비스 | 미선택 | Service is required | 서비스를 선택해주세요 |
| 요금제 | 미선택 | Pricing model is required | 요금제를 선택해주세요 |

### 5.2 계약 추가 - Fixed Rate

| 필드 | 케이스 | 영문 메시지 | 한글 메시지 |
|------|--------|------------|------------|
| 포함된 할당량 | 미입력 | Included allocation is required | 포함된 할당량을 입력해주세요 |
| 계약 기간 | 미선택 | Contract period is required | 계약 기간을 선택해주세요 |
| 계약 금액 | 미입력 | Contract amount is required | 계약 금액을 입력해주세요 |
| 숫자 | 유효하지 않음 | Please enter a valid number greater than 0 | 0보다 큰 유효한 숫자를 입력하세요 |
| 종료일 | 시작일 이전 | End date must be after start date | 종료일은 시작일 이후여야 합니다 |

### 5.3 계약 추가 - Pay As You Go

| 필드 | 케이스 | 영문 메시지 | 한글 메시지 |
|------|--------|------------|------------|
| 요금 | 미입력 | Rate is required | 요금을 입력해주세요 |
| 최소 청구 금액 | 미입력 | Minimum charge is required | 최소 청구 금액을 입력해주세요 |

### 5.4 계약 추가 - Trial

| 필드 | 케이스 | 영문 메시지 | 한글 메시지 |
|------|--------|------------|------------|
| 체험판 할당량 | 미입력 | Trial allocation is required | 체험판 할당량을 입력해주세요 |
| 체험판 기간 | 미선택 | Trial period is required | 체험판 기간을 선택해주세요 |

### 5.5 청구서 이메일

| 케이스 | 영문 메시지 | 한글 메시지 |
|--------|------------|------------|
| 이메일 미입력 | Email address is required | 이메일 주소를 입력해주세요 |
| 이메일 형식 오류 | Invalid email format | 올바른 이메일 형식이 아닙니다 |
| 이메일 중복 | This email has already been added | 이미 추가된 이메일입니다 |
| 최소 1개 필요 | At least one billing email is required | 최소 1개의 청구서 이메일이 필요합니다 |

---

## 6. 공통 검증 (Common Validation)

### 6.1 필수 입력 검증

| 검증 규칙 | 영문 메시지 | 한글 메시지 |
|----------|------------|------------|
| 필수 필드 | This field is required | 필수 입력 항목입니다 |
| 이메일 필수 | Email is required | 이메일은 필수입니다 |
| 이름 필수 | Name is required | 이름은 필수입니다 |
| 국가 필수 | Country is required | 국가는 필수입니다 |

### 6.2 형식 검증

| 검증 규칙 | 영문 메시지 | 한글 메시지 |
|----------|------------|------------|
| 이메일 형식 | Invalid email format | 올바른 이메일 형식이 아닙니다 |
| 최소 길이 (2자) | Must be at least 2 characters | 최소 2자 이상이어야 합니다 |
| 최소 길이 (8자) | Must be at least 8 characters long | 최소 8자 이상이어야 합니다 |
| 양수 필수 | Must be a valid positive number | 유효한 양수를 입력해주세요 |

### 6.3 사업자등록번호 검증

각 국가별로 다른 형식이 적용됩니다:

| 국가 | 형식 | 예시 |
|------|------|------|
| 대한민국 (KR) | XXX-XX-XXXXX (10자리) | 123-45-67890 |
| 일본 (JP) | XXXXXXXXXXXX (12자리) | 123456789012 |
| 미국 (US) | XX-XXXXXXX (9자리) | 12-3456789 |
| 중국 (CN) | XXXXXXXXXXXXXXXXXX (18자리) | 123456789012345678 |

**오류 메시지**: "Invalid business registration number format for selected country" / "선택한 국가에 대한 사업자등록번호 형식이 올바르지 않습니다"

---

## 7. 일반 오류 (General Errors)

### 7.1 검증 오류

| 케이스 | 영문 메시지 | 한글 메시지 |
|--------|------------|------------|
| 검증 실패 | Validation Error | 검증 오류 |
| 저장 전 수정 필요 | Please fix the errors before saving | 저장하기 전에 오류를 수정해주세요 |
| 계속하기 전 수정 필요 | Please fix the errors before continuing | 계속하기 전에 오류를 수정해주세요 |

### 7.2 페이지 오류

| 케이스 | 영문 메시지 | 한글 메시지 |
|--------|------------|------------|
| 404 - 페이지 없음 | 404 - Not Found | 404 - 페이지를 찾을 수 없음 |
| 404 설명 | The page you're looking for doesn't exist or may have been removed. This might be due to an incorrect URL or a removed item. | 찾으시는 페이지가 존재하지 않거나 삭제되었을 수 있습니다. 잘못된 URL이거나 삭제된 항목일 수 있습니다. |

### 7.3 일반 오류

| 케이스 | 영문 메시지 | 한글 메시지 |
|--------|------------|------------|
| 일반 오류 | Error | 오류 |
| 선택 필요 | Please select at least one | 최소 1개를 선택해주세요 |

---

## 8. 구현 위치 참조

### 8.1 번역 파일
- **영어**: `/src/locales/en/common.json`
- **한국어**: `/src/locales/ko/common.json`

### 8.2 검증 로직
- **로그인**: `/src/components/features/auth/LoginForm.tsx`
- **인증 API**: `/src/lib/api/auth.ts`
- **사업자등록번호 검증**: `/src/lib/utils/validation.ts`

### 8.3 주요 컴포넌트
- **설정**: `/src/pages/SettingsPage.tsx`, `/src/components/settings/`
- **고객사**: `/src/pages/CustomersPage.tsx`, `/src/components/customers/`
- **리셀러**: `/src/pages/ResellerPage.tsx`, `/src/components/reseller/`
- **계약**: `/src/components/contracts/AddContractModal.tsx`

---

## 9. 메시지 사용 예시

### 9.1 React Hook Form 사용
```typescript
const schema = z.object({
  email: z
    .string()
    .min(1, t('auth.login.emailRequired'))
    .email(t('auth.login.invalidEmail')),
});
```

### 9.2 직접 검증
```typescript
if (!value.trim()) {
  return t('validation.companyNameRequired');
}
if (value.trim().length < 2) {
  return t('validation.companyNameMinLength');
}
```

### 9.3 에러 표시
```typescript
{error && (
  <div className="text-sm text-destructive">
    {error}
  </div>
)}
```

---

## 10. 번역 키 네이밍 규칙

### 10.1 구조
```
[섹션].[하위섹션].[메시지키]
```

### 10.2 예시
- `auth.login.emailRequired` - 인증 > 로그인 > 이메일 필수
- `validation.companyNameMinLength` - 검증 > 회사명 최소 길이
- `errors.validationError` - 오류 > 검증 오류

### 10.3 접미사 규칙
- `Required` - 필수 입력
- `Invalid` - 유효하지 않음
- `MinLength` - 최소 길이
- `Failed` - 실패
- `Error` - 오류

---

**마지막 업데이트**: 2025-11-14
**버전**: 1.0.0
