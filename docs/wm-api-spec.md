# WM API Specification
# WM Sales Portal - WM 도메인 API 명세

**문서 버전:** 2.0
**최종 업데이트:** 2025-01-16
**작성자:** Product Team

---

## 📑 목차

1. [WM 도메인 개요](#1-wm-도메인-개요)
2. [WM Dashboard](#2-wm-dashboard)
3. [Customers Page](#3-customers-page)
4. [Customer Detail Page](#4-customer-detail-page)
5. [Reseller Page](#5-reseller-page)
6. [Reseller Detail Page](#6-reseller-detail-page)
7. [Payments Page](#7-payments-page)

**📌 참고 문서:**
- **공통 페이지** (인증, Settings 등): `common-api-spec.md` 참조
  - Login, Forgot Password, Verify Code, Reset Password, Expired Code
  - Reseller Signup, User Signup
  - Contracts, Contract Detail
  - Settings

---

## 1. WM 도메인 개요

### 1.1 접근 권한

**WM 도메인 페이지는 WM 사용자만 접근 가능합니다.**

| 페이지 | wm_admin | wm_editor | wm_viewer |
|--------|----------|-----------|-----------|
| Dashboard | ✅ | ✅ | ✅ |
| Customers | ✅ | ✅ | ✅ |
| Customer Detail | ✅ | ✅ | ✅ |
| Reseller | ✅ | ✅ | ✅ |
| Reseller Detail | ✅ | ✅ | ✅ |
| Payments | ✅ | ✅ | ✅ |

### 1.2 데이터 접근 범위

**WM 사용자는 Direct 고객/계약만 조회 및 관리합니다.**

| 데이터 타입 | 접근 범위 | SQL 필터링 조건 |
|------------|----------|----------------|
| 고객(Customer) | Direct 고객만 | `WHERE resellerId IS NULL` |
| 계약(Contract) | Direct 계약만 | `WHERE resellerId IS NULL` |
| 결제(Payment) | Direct 결제만 | `WHERE resellerId IS NULL` |
| Reseller | 모든 Reseller | - |

**⚠️ 중요:** WM은 Reseller 고객/계약 데이터를 조회할 수 없습니다. 완전히 격리됩니다.

**예외:**
- **계약 승인 워크플로우**: WM은 Reseller가 등록한 계약(`status === 'pending'`)을 승인/거절할 수 있습니다.
- 승인 대기 계약은 WM Dashboard의 "Contract Pending Approval" 섹션에만 표시됩니다.

### 1.3 공통 기능

- **데이터 범위**: Direct 고객/계약/결제만 (`resellerId === null`)
- **필터링**: 백엔드에서 모든 API에 `WHERE resellerId IS NULL` 조건 자동 적용
- **승인 기능**: Reseller 계약 승인/거절 (별도 API)
- **생성/수정/삭제 권한**: 역할별로 상이 (권한 매트릭스 참고)

---

## 2. WM Dashboard

**경로:** `/dashboard`
**접근 권한:** `wm_admin`, `wm_editor`, `wm_viewer`

### 📐 페이지 구조

#### 섹션 1: 페이지 헤더
**기능:**
- 대시보드 제목 표시 ("Dashboard")

**조건/규칙:**
- 항상 표시

---

#### 섹션 2: 통계 카드 (4개)
**기능:**
- Total Customers, Active Contracts, Monthly Charge, Resellers 통계 표시
- 각 카드마다 전월 대비 변화율(%) 표시

**인터랙션:**
- 카드 클릭: 없음 (정적 표시)

**조건/규칙:**
- **Total Customers**: Direct 고객 수만 (`resellerId === null`)
- **Active Contracts**: Direct 활성 계약 수만 (`status === 'active' AND resellerId === null`)
- **Monthly Charge**: 이번 달 Direct 계약 총 청구 금액 (`resellerId === null`)
- **Resellers**: 총 리셀러 수

**데이터 요구사항:**

| 필드 | 타입 | 설명 |
|------|------|------|
| totalCustomers | number | 전체 고객 수 |
| totalCustomersChange | number | 전월 대비 변화율 (%) |
| totalCustomersChangeType | 'increase' \| 'decrease' | 증가/감소 |
| activeContracts | number | 활성 계약 수 |
| activeContractsChange | number | 전월 대비 변화율 (%) |
| activeContractsChangeType | 'increase' \| 'decrease' | 증가/감소 |
| monthlyCharge | number | 이번 달 총 청구 금액 (USD) |
| monthlyChargeChange | number | 전월 대비 변화율 (%) |
| monthlyChargeChangeType | 'increase' \| 'decrease' | 증가/감소 |
| resellers | number | 총 리셀러 수 |
| resellersChange | number | 전월 대비 변화율 (%) |
| resellersChangeType | 'increase' \| 'decrease' | 증가/감소 |

---

#### 섹션 3: Pending Payments 목록
**기능:**
- Direct 고객 미납 결제 목록 표시 (최대 5개)
- 각 행: 고객명, 기간, 금액, "View All" 링크

**인터랙션:**
- 행 클릭: Customer Detail 페이지로 이동
- "View All" 클릭: Payments 페이지로 이동 (미납 필터 적용)

**조건/규칙:**
- **표시 조건**: (status === 'pending' OR status === 'partial') AND resellerId === null
- **정렬**: 마감일 임박 순 (dueDate asc)
- **최대 표시**: 5개

**데이터 요구사항:**

| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 결제 ID |
| customerId | string | 고객 ID |
| companyName | string | 고객 회사명 |
| period | string | 청구 기간 (예: "2025. 10") |
| amount | number | 청구 금액 (USD) |
| dueDate | string | 마감일 (YYYY. MM. DD) |

---

#### 섹션 4: Expiring Contracts 목록
**기능:**
- Direct 계약 만료 임박 목록 표시 (최대 5개)
- 각 행: 계약 ID, 고객명, 서비스, 남은 일수, "View All" 링크

**인터랙션:**
- 행 클릭: Contract Detail 페이지로 이동
- "View All" 클릭: Contracts 페이지로 이동

**조건/규칙:**
- **표시 조건**: 만료일까지 남은 일수 <= 30일 AND resellerId === null
- **정렬**: 남은 일수 오름차순
- **최대 표시**: 5개

**데이터 요구사항:**

| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 계약 ID |
| contractNo | string | 계약 번호 (예: "C-001") |
| customerId | string | 고객 ID |
| companyName | string | 고객 회사명 |
| service | string | 서비스명 (Observability, Management, Optimization) |
| endDate | string | 계약 종료일 (YYYY. MM. DD) |
| daysLeft | number | 남은 일수 |

---

#### 섹션 5: Contract Pending Approval 목록
**기능:**
- 승인 대기 중인 계약 목록 표시
- 각 행: Reseller, Customer, Service, 금액, Pricing Model, Approve/Reject 버튼

**인터랙션:**
- "Approve" 버튼 클릭: 계약 승인 (status → 'approved')
- "Reject" 버튼 클릭: Reject Contract Modal 열기

**조건/규칙:**
- **표시 조건**: status === 'pending'
- **권한**:
  - `wm_admin`, `wm_editor`: Approve/Reject 버튼 표시
  - `wm_viewer`: 버튼 숨김
- **정렬**: 최신 순 (createdAt desc)

**데이터 요구사항:**

| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 계약 ID |
| resellerId | string | Reseller ID |
| resellerName | string | Reseller 회사명 |
| customerId | string | 고객 ID |
| customerName | string | 고객 회사명 |
| service | string | 서비스명 |
| pricingModel | 'Pay-as-you-go' \| 'Fixed Rate' | 가격 모델 |
| amount | number \| null | 계약 금액 (Fixed Rate만, USD) |
| vcpuUnitPrice | number \| null | vCPU 단가 (Pay-as-you-go만, USD/hour) |
| minimumCharge | number \| null | 최소 청구 금액 (Pay-as-you-go만, USD/month) |
| createdAt | string | 생성일 (YYYY. MM. DD) |

---

### 🔄 페이지 네비게이션

| 출발지 | 목적지 | 조건 |
|--------|--------|------|
| Pending Payments 행 클릭 | `/customers/{customerId}` | - |
| "View All" (Payments) | `/payments?showUnpaid=true` | - |
| Expiring Contracts 행 클릭 | `/contracts/{contractId}` | - |
| "View All" (Contracts) | `/contracts` | - |
| Contract Pending Approval 행 클릭 | `/contracts/{contractId}` | - |

---

### 💾 데이터 요구사항 (전체)

**API Endpoint:** `GET /api/wm/dashboard`

**응답 필드:**
- `stats`: 통계 카드 데이터
- `pendingPayments`: 미납 결제 목록
- `expiringContracts`: 만료 임박 계약 목록
- `pendingContracts`: 승인 대기 계약 목록

---

### 📊 계약 거절 모달

**트리거:** Contract Pending Approval에서 "Reject" 버튼 클릭
**접근 권한:** `wm_admin`, `wm_editor`

**📄 전체 상세 명세**: [common-api-spec.md - Section 4.6](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/common-api-spec.md#46-reject-contract-modal-계약-거절-모달)

#### 빠른 참조

**표시 정보:**
- 계약 정보: Reseller → Customer, Service, Pricing Model, Contract Period
- Pay-as-you-go: vCPU Unit Price, Minimum Charge
- Fixed Rate: Amount to WM, Included Allocation

**필수 입력:**
- Rejection Reason (Textarea, 최대 280자, 실시간 글자 수 표시)

**API**: `POST /api/contracts/{contractId}/reject`

**Submit 동작:**
- 계약 status를 'rejected'로 변경
- Toast 알림 표시
- 대시보드 데이터 새로고침

---

### 🎯 Detailed Button Actions & Interactions (Dashboard)

#### Statistics Cards
- **Type**: Read-only display cards
- **Action**: None (purely informational)
- **Refresh**: Automatically on page load
- **API Call**: `GET /api/wm/dashboard` (fetches all stats together)

#### Pending Payments Row Click
- **Action**: Navigates to Customer Detail page
- **Target**: `/customers/{customerId}`
- **Purpose**: View customer details to address pending payment

#### View All Button (Pending Payments)
- **Action**: Navigates to Payments page with filter applied
- **Target**: `/payments?showUnpaid=true`
- **Filter**: Automatically filters to show only unpaid/partial invoices

#### Expiring Contracts Row Click
- **Action**: Navigates to Contract Detail page
- **Target**: `/contracts/{contractId}`
- **Purpose**: View contract details to prepare for renewal

#### View All Button (Expiring Contracts)
- **Action**: Navigates to Contracts page
- **Target**: `/contracts`
- **Note**: No automatic filter applied

#### Approve Button (Contract Pending Approval)
**Visibility**: `wm_admin`, `wm_editor` only

**Click Flow**:
1. Show loading state on button
2. API Call: `POST /api/contracts/{contractId}/approve`
3. On success:
   - Remove row from Pending Approval list
   - Show toast: "Contract approved successfully"
   - Update Active Contracts stat (+1)
4. On error:
   - Show error toast
   - Revert to original state

**Permissions**:
- wm_admin, wm_editor: Can approve
- wm_viewer: Button hidden (entire action column hidden)

#### Reject Button (Contract Pending Approval)
**Visibility**: `wm_admin`, `wm_editor` only

**Click Flow**:
1. Opens Reject Contract Modal
2. Modal displays contract details
3. User enters rejection reason (required, max 280 chars)
4. On Submit:
   - API Call: `POST /api/contracts/{contractId}/reject` with { reason }
   - Remove row from Pending Approval list
   - Show toast: "Contract rejected"
   - Optionally notify reseller (backend handling)

**Permissions**: Same as Approve button

---

### 📋 Form Validations (Dashboard - Reject Contract Modal)

| Field | Validation Rule | Error Message (EN) | Error Message (KO) | Trigger |
|-------|----------------|-------------------|-------------------|---------|
| Rejection Reason | Required | Rejection reason is required | 거절 사유는 필수입니다 | onBlur |
| Rejection Reason | Min 10 chars | Must be at least 10 characters | 최소 10자 이상 입력해주세요 | onChange |
| Rejection Reason | Max 280 chars | Max 280 characters | 최대 280자 | onChange |

---

### 🔄 State Management (Dashboard)

```typescript
// Statistics
const [stats, setStats] = useState({
  totalCustomers: 0,
  totalCustomersChange: 0,
  totalCustomersChangeType: 'increase' as 'increase' | 'decrease',
  activeContracts: 0,
  activeContractsChange: 0,
  activeContractsChangeType: 'increase' as 'increase' | 'decrease',
  monthlyCharge: 0,
  monthlyChargeChange: 0,
  monthlyChargeChangeType: 'increase' as 'increase' | 'decrease',
  resellers: 0,
  resellersChange: 0,
  resellersChangeType: 'increase' as 'increase' | 'decrease',
});

// Lists
const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
const [expiringContracts, setExpiringContracts] = useState<Contract[]>([]);
const [pendingContracts, setPendingContracts] = useState<Contract[]>([]);

// Approval Actions
const [approvingContractId, setApprovingContractId] = useState<string | null>(null);
const [rejectingContract, setRejectingContract] = useState<Contract | null>(null);
const [rejectionReason, setRejectionReason] = useState('');
const [rejectionError, setRejectionError] = useState('');
```

**State Update Patterns:**
1. **Page Load**: Fetch all dashboard data → Update stats and lists
2. **Approve Contract**:
   - Set `approvingContractId` → show loading
   - POST to API
   - On success: Remove from `pendingContracts`, update stats
3. **Reject Contract**:
   - Set `rejectingContract` → open modal
   - On submit: POST to API, remove from list, close modal

---

### 🎨 Conditional Rendering (Dashboard)

| Element | Condition | Display |
|---------|-----------|---------|
| Approve/Reject Buttons | `user.role === 'wm_admin' \|\| user.role === 'wm_editor'` | Visible |
| Action Column (Pending Contracts) | `user.role !== 'wm_viewer'` | Visible |
| Pending Payments Section | `pendingPayments.length > 0` | Visible |
| Expiring Contracts Section | `expiringContracts.length > 0` | Visible |
| Pending Approval Section | `pendingContracts.length > 0` | Visible |
| Empty State (each section) | `list.length === 0` | Show "No {items} found" |
| Trend Arrows | Always | Up/Down arrows with % |
| Days Left Color (Expiring) | `daysLeft < 7`: red, `< 30`: orange, else: default | Text color |

---

### 🚨 Error Handling (Dashboard)

**Approval Failed:**
- Show error toast: "Failed to approve contract. Please try again."
- Revert button to original state
- Keep row in list

**Rejection Failed:**
- Show error toast: "Failed to reject contract. Please try again."
- Keep modal open
- Allow retry

**Dashboard Load Failed:**
- Show error message in page center
- Provide "Retry" button
- Log error for debugging

---

### 📊 Data Flow (Dashboard)

**Page Load Flow:**
```
1. Component mounts
2. API Call: GET /api/wm/dashboard
3. Response includes:
   - stats (4 cards data)
   - pendingPayments (max 5 items)
   - expiringContracts (max 5 items)
   - pendingContracts (all pending approvals)
4. Update all state
5. Render sections
```

**Approve Contract Flow:**
```
1. User clicks "Approve" button
2. Set approvingContractId (show loading on button)
3. POST /api/contracts/{contractId}/approve
4. On success:
   - Remove contract from pendingContracts list
   - Update activeContracts stat (+1)
   - Show toast: "Contract approved successfully"
   - Clear approvingContractId
5. On error:
   - Show error toast
   - Clear approvingContractId
   - Row remains in list
```

**Reject Contract Flow:**
```
1. User clicks "Reject" button
2. Set rejectingContract → Opens modal with contract details
3. User types rejection reason
4. Real-time validation:
   - Min 10 chars
   - Max 280 chars
   - Update character counter
5. User clicks "Submit":
   - Validate reason
   - POST /api/contracts/{contractId}/reject with { reason }
   - On success:
     - Remove from pendingContracts list
     - Show toast: "Contract rejected"
     - Close modal
     - Clear rejectionReason and rejectingContract
   - On error:
     - Show error toast
     - Keep modal open
```

**Navigation Flows:**
- Pending Payment row → `/customers/{customerId}`
- View All (Payments) → `/payments?showUnpaid=true`
- Expiring Contract row → `/contracts/{contractId}`
- View All (Contracts) → `/contracts`
- Pending Approval row → `/contracts/{contractId}` (view only for viewers)

---

## 3. Customers Page

**경로:** `/customers`
**접근 권한:** `wm_admin`, `wm_editor`, `wm_viewer`

### 📐 페이지 구조

#### 섹션 1: 페이지 헤더
**기능:**
- "Customers" 제목 표시

---

#### 섹션 2: 검색 및 필터 바
**기능:**
- 검색: 회사명, 사업자등록번호, 담당자명으로 검색
- Filter 버튼: Service 필터 다이얼로그 열기
- Export to Excel: 필터링된 고객 목록 엑셀 다운로드
- Add Customer: 고객 추가 다이얼로그 열기

**인터랙션:**
- 검색 입력: 실시간 필터링
- Filter 버튼 클릭: Filter Dialog 열기
- Export to Excel 클릭: 엑셀 다운로드
- Add Customer 클릭: Add Customer Dialog 열기

**조건/규칙:**
- **Filter 버튼**: 필터 적용 시 배지 표시 (필터 개수)
- **Add Customer 버튼**: `wm_admin`, `wm_editor`만 표시
- **Export to Excel**: 모든 역할 표시

---

#### 섹션 3: 고객 테이블
**기능:**
- 고객 목록 표시
- 컬럼: Company Name, Business Reg. No., Service, Contact Person, Created At, Actions
- 정렬: Company Name, Created At 클릭 시 오름차순/내림차순 토글
- 페이지네이션

**인터랙션:**
- 행 클릭: Customer Detail 페이지로 이동
- 정렬 아이콘 클릭: 정렬 토글
- Actions 드롭다운:
  - Add Contract: 계약 추가 모달 열기
  - Add Note: 노트 추가 모달 열기
  - Delete: 고객 삭제 (계약 없을 때만)

**조건/규칙:**
- **New 배지**: 생성일로부터 7일 이내 고객에게 "N" 배지 표시
- **Actions 컬럼**:
  - `wm_viewer`: 숨김
  - `wm_admin`, `wm_editor`: 표시
- **Add Contract**: `wm_admin`, `wm_editor`만
- **Add Note**: `wm_admin`, `wm_editor`만
- **Delete**: `wm_admin`만
- **Empty State**: 고객 없을 때 "No customers yet" 메시지 + Add Customer 버튼

**데이터 요구사항:**

**API Endpoint:** `GET /api/customers`

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| search | string | 검색어 (회사명, 사업자번호, 담당자명) |
| services | string[] | 서비스 필터 (Observability, Management, Optimization) |
| sortBy | 'companyName' \| 'createdAt' | 정렬 기준 |
| sortOrder | 'asc' \| 'desc' | 정렬 순서 |
| page | number | 페이지 번호 |
| limit | number | 페이지당 행 수 (5, 10, 20, 50) |

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 고객 ID |
| companyName | string | 회사명 |
| businessRegNo | string | 사업자등록번호 |
| services | string[] | 서비스 목록 |
| contactPerson | string | 담당자명 |
| createdAt | string | 생성일 (YYYY. MM. DD) |
| createdAtTimestamp | number | 생성 타임스탬프 (밀리초) |

---

### 📊 필터 다이얼로그

**트리거:** Filter 버튼 클릭

#### 다이얼로그 구조

**섹션 1: 제목**
- "Filter"

**섹션 2: Service 필터**
- 체크박스: Observability, Management, Optimization
- 선택된 항목은 배경색 accent로 표시

**인터랙션:**
- 체크박스 클릭: 선택/해제
- Reset 버튼: 모든 필터 초기화
- Cancel 버튼: 다이얼로그 닫기 (변경사항 미적용)
- Apply 버튼: 필터 적용 → 다이얼로그 닫기

**조건/규칙:**
- **Apply 버튼**: 항상 활성화

---

### 📊 고객 추가 다이얼로그

**트리거:** Add Customer 버튼 클릭

**📄 전체 상세 명세**: [common-api-spec.md - Section 4.14](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/common-api-spec.md#414-add-customer-dialog)

#### 빠른 참조

**필수 입력:**
- Company Name (최소 2자)
- Country (드롭다운, 기본값: KR)
- Business Reg. No. (국가별 형식 검증)
- Contact Person (최소 2자)
- Contact Email (이메일 형식)

**선택 입력:**
- Note (최대 280자)
- "Add contract after saving" 체크박스 (기본 체크됨)

**API**: `POST /api/customers`

**Submit 동작**:
- 유효성 검증 통과 시 고객 생성
- 체크박스 체크 시 Add Contract Modal 자동 열림

---

### 🔄 페이지 네비게이션

| 출발지 | 목적지 | 조건 |
|--------|--------|------|
| 테이블 행 클릭 | `/customers/{customerId}` | - |
| Add Contract (드롭다운) | Add Contract Modal 열기 | - |
| Add Note (드롭다운) | Add Note Modal 열기 | - |

---

## 4. Customer Detail Page

**경로:** `/customers/{customerId}`
**접근 권한:** `wm_admin`, `wm_editor`, `wm_viewer`

### 📐 페이지 구조

#### 섹션 1: 페이지 헤더
**기능:**
- 뒤로가기 버튼 + 고객 회사명 표시
- Delete 버튼 (wm_admin만)

**인터랙션:**
- 뒤로가기 버튼 클릭: `/customers` 페이지로 이동
- Delete 버튼 클릭: 고객 삭제 확인 다이얼로그 열기

**조건/규칙:**
- **Delete 버튼**: `wm_admin`만 표시
- **계약 있을 때 Delete 클릭**: 에러 다이얼로그 표시 ("Cannot delete customer - has active contracts")

---

#### 섹션 2: Company Info 카드
**기능:**
- 고객 정보 표시
- Edit 버튼

**표시 정보:**
- Company Name, Company ID, Country, Business Reg. No., Contact Person, Contact Person Email, Created At

**인터랙션:**
- Edit 버튼 클릭: Edit Customer Modal 열기

**조건/규칙:**
- **Edit 버튼**: `wm_admin`, `wm_editor`만 표시

### 📊 고객사 수정 모달

**트리거:** Edit 버튼 클릭
**접근 권한:** `wm_admin`, `wm_editor` (Reseller는 불가)

**📄 전체 상세 명세**: [common-api-spec.md - Section 4.8](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/common-api-spec.md#48-edit-customer-modal-고객사-수정-모달)

#### 빠른 참조

**수정 가능 필드:**
- Company Name (최소 2자, 중복 체크)
- Country (드롭다운 선택)
- Business Reg. No. (국가별 형식 검증)
- Contact Person (필수)
- Contact Person Email (이메일 형식)

**API**: `PUT /api/customers/{id}`

**Submit 동작:** 고객 정보 업데이트 후 모달 닫기, 페이지 데이터 새로고침

---

**데이터 요구사항:**

**API Endpoint:** `GET /api/customers/{customerId}`

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 고객 ID |
| companyName | string | 회사명 |
| companyId | string | 고객 ID (UI 표시용) |
| country | string | 국가명 |
| businessRegNo | string | 사업자등록번호 |
| contactPerson | string | 담당자명 |
| email | string | 담당자 이메일 |
| createdAt | string | 생성일 (YYYY. MM. DD) |

---

#### 섹션 3: Note 카드
**기능:**
- 고객 노트 목록 표시 (스크롤 가능, 최대 높이 500px)
- Add Note 버튼

**인터랙션:**
- Add Note 버튼 클릭: Add Note Modal 열기
- 노트 Actions (드롭다운):
  - Edit: Edit Note Modal 열기
  - Delete: Delete Note 확인 다이얼로그 열기

**조건/규칙:**
- **Add Note 버튼**: `wm_admin`, `wm_editor`만 표시
- **Edit**: `wm_admin`, `wm_editor`만 표시
- **Delete**: `wm_admin`만 표시
- **Empty State**: 노트 없을 때 "No notes yet" 메시지

**데이터 요구사항:**

**API Endpoint:** `GET /api/customers/{customerId}/notes`

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 노트 ID |
| customerId | string | 고객 ID |
| content | string | 노트 내용 |
| author | string | 작성자명 |
| createdAt | string | 작성일 (YYYY. MM. DD) |

---

#### 섹션 4: Contracts 카드
**기능:**
- 고객 계약 목록 표시
- Add Contract 버튼
- "Show expired contracts" 체크박스

**표시 정보 (테이블):**
- Service Name, Contract Details, Days Left, Amount

**인터랙션:**
- 행 클릭: Contract Detail 페이지로 이동
- Add Contract 버튼 클릭: Add Contract Modal 열기
- "Show expired contracts" 체크박스: 만료된 계약 표시/숨김

**조건/규칙:**
- **Add Contract 버튼**: `wm_admin`, `wm_editor`만 표시
- **만료된 계약**: 체크박스 해제 시 숨김 (endDate < today)
- **Days Left 색상**:
  - 만료: 빨간색
  - 30일 미만: 주황색
  - 30일 이상: 기본색
- **Empty State**: 계약 없을 때 "No contracts yet" 메시지

### 📊 계약 추가 모달

**트리거:** Add Contract 버튼 클릭
**접근 권한:** WM - `wm_admin`, `wm_editor` | Reseller - `reseller_admin`, `reseller_editor`

**📄 전체 상세 명세**: [common-api-spec.md - Section 4.10](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/common-api-spec.md#410-add-contract-modal-계약-추가-모달)

#### 빠른 참조

**구조:** 멀티스텝 모달 (최대 5단계)

**단계별 흐름:**
1. **고객 선택**: 기존 고객 검색 및 선택 (현재 페이지에서는 자동 스킵)
2. **새 고객 추가** (옵션): "Add Customer First" 링크 클릭 시
3. **서비스 & 가격 모델**: Service 선택, Pricing Model 선택
4. **가격 설정**: Fixed Rate/PAYG별 가격 입력
5. **검토 & 생성**: 입력 정보 확인 후 생성

**주요 기능:**
- Reseller 사용자: 가격 정책이 설정된 서비스만 선택 가능
- Fixed Rate: 계약 기간, 월 금액, vCPU 단가 입력
- Pay-as-you-go: vCPU 단가만 입력
- Trial: 체험판 기간 선택 (1개월/3개월/6개월)

**API**: `POST /api/contracts`

---

**데이터 요구사항:**

**API Endpoint:** `GET /api/customers/{customerId}/contracts`

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 계약 ID |
| serviceName | string | 서비스명 |
| pricingModel | 'Pay-as-you-go' \| 'Fixed Rate' | 가격 모델 |
| startDate | string | 시작일 (YYYY. MM. DD) |
| endDate | string \| null | 종료일 (YYYY. MM. DD, null이면 "no end date") |
| amount | number \| null | 계약 금액 (Fixed Rate만) |
| resellerId | string \| null | Reseller ID (Direct는 null) |
| resellerName | string \| null | Reseller명 |
| details | string | 가격 상세 정보 (vCPU 단가 등) |

---

#### 섹션 5: Payment History 카드 (wm_admin, wm_viewer만)
**기능:**
- 결제 내역 표시 (페이지네이션: 5개/페이지)
- "View detailed payment history" 버튼

**표시 정보 (테이블):**
- Invoice No., Period, Date, Service, Status, Paid Amount, Difference

**인터랙션:**
- Invoice No. 옆 복사 아이콘 클릭: 클립보드에 복사
- "View detailed payment history" 버튼 클릭: Payments 페이지로 이동 (해당 고객 필터 적용)
- 페이지네이션: Previous/Next 버튼

**조건/규칙:**
- **표시**: `wm_admin`, `wm_viewer`만 (Reseller 계약은 여기서 제외)
- **Status 배지**:
  - Paid: 초록색
  - Pending: 회색
  - Partial: 주황색
- **Empty State**: 결제 없을 때 "No payments yet" 메시지

**데이터 요구사항:**

**API Endpoint:** `GET /api/customers/{customerId}/payments`

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| page | number | 페이지 번호 |
| limit | number | 페이지당 행 수 (기본: 5) |

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 결제 ID |
| invoiceNo | string | 청구서 번호 |
| period | string | 청구 기간 (예: "2025. 10") |
| date | string | 청구일 (MM. DD) |
| service | string | 서비스명 |
| status | 'paid' \| 'pending' \| 'partial' | 결제 상태 |
| paidAmount | number | 납부 금액 (USD) |
| difference | number | 차액 (USD) |

---

### 🔄 페이지 네비게이션

| 출발지 | 목적지 | 조건 |
|--------|--------|------|
| 뒤로가기 버튼 | `/customers` | - |
| Contract 행 클릭 | `/contracts/{contractId}` | - |
| "View detailed payment history" | `/payments?customer={customerId}&search={companyName}` | - |

---

## 5. Reseller Page

**경로:** `/reseller`
**접근 권한:** `wm_admin`, `wm_editor`, `wm_viewer`

### 📐 페이지 구조

#### 섹션 1: 페이지 헤더
**기능:**
- "Resellers" 제목 표시

---

#### 섹션 2: 검색 및 필터 바
**기능:**
- 검색: Reseller명, Contact Person, Contact Email로 검색
- Filter 버튼: Invitation Status 필터 다이얼로그 열기
- Export to Excel: 필터링된 Reseller 목록 엑셀 다운로드
- Add Reseller: Reseller 추가 모달 열기

**인터랙션:**
- 검색 입력: 실시간 필터링
- Filter 버튼 클릭: Filter Dialog 열기
- Export to Excel 클릭: 엑셀 다운로드
- Add Reseller 클릭: Add Reseller Modal 열기

**조건/규칙:**
- **Filter 버튼**: 필터 적용 시 배지 표시 (1)
- **Add Reseller 버튼**: `wm_admin`, `wm_editor`만 표시
- **Export to Excel**: 모든 역할 표시

### 📊 리셀러 추가 모달

**트리거:** Add Reseller 버튼 클릭
**접근 권한:** `wm_admin`, `wm_editor`

**📄 전체 상세 명세**: [common-api-spec.md - Section 4.5](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/common-api-spec.md#45-add-reseller-modal-리셀러-추가-모달)

#### 빠른 참조

**필수 입력:**
- Company Name (최소 2자)
- Country (드롭다운, 기본값: KR)
- Business Reg. No. (국가별 형식 검증)
- Contact Person (최소 2자)
- Contact Person Email (이메일 형식)

**선택 입력:**
- Note (최대 280자)

**API**: `POST /api/resellers`

**Submit 동작:**
1. Reseller 생성
2. 초대 이메일 자동 발송 (Contact Person Email로)
3. invitationStatus: 'Pending'으로 설정
4. Toast 알림 표시

---

#### 섹션 3: Reseller 테이블
**기능:**
- Reseller 목록 표시
- 컬럼: Reseller Name, Customer Count, Contract Count, Invitation Status, Contact Person, Contact Person Email, Note, Actions
- 정렬: Reseller Name, Customer Count, Contract Count, Invitation Status 클릭 시 정렬 토글
- 페이지네이션

**인터랙션:**
- 행 클릭: Reseller Detail 페이지로 이동
- 정렬 아이콘 클릭: 정렬 토글
- Actions 드롭다운:
  - Resend Invitation: 초대 이메일 재전송 (Expired, Pending, Canceled 상태만)
  - Cancel Invitation: 초대 취소 (Pending 상태만)
  - Add Note: 노트 추가 모달 열기
  - Delete: Reseller 삭제

**조건/규칙:**
- **Invitation Status 계산**:
  - Canceled: 그대로
  - invitationSentAt 없음: 저장된 status
  - invitationSentAt > 7일 전: Expired
  - 그 외: Pending
- **Actions 컬럼**: `wm_viewer`는 숨김
- **Resend Invitation**: `wm_admin`, `wm_editor`만, status === 'Expired' OR 'Pending' OR 'Canceled'
- **Cancel Invitation**: `wm_admin`, `wm_editor`만, status === 'Pending'
- **Add Note**: `wm_admin`, `wm_editor`만
- **Delete**: `wm_admin`만
- **Empty State**: Reseller 없을 때 "No results found" 메시지

**데이터 요구사항:**

**API Endpoint:** `GET /api/resellers`

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| search | string | 검색어 (Reseller명, Contact Person, Contact Email) |
| invitationStatus | string | 초대 상태 필터 (all, accepted, pending, expired, canceled, n/a) |
| sortBy | string | 정렬 기준 |
| sortOrder | 'asc' \| 'desc' | 정렬 순서 |
| page | number | 페이지 번호 |
| limit | number | 페이지당 행 수 (5, 10, 20, 50) |

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | Reseller ID |
| name | string | Reseller 회사명 |
| customerCount | number | 고객 수 |
| contractCount | number | 계약 수 |
| invitationStatus | string | 초대 상태 |
| invitationSentAt | string \| null | 초대 발송일 (YYYY. MM. DD) |
| contactPerson | string | 담당자명 |
| contactEmail | string | 담당자 이메일 |
| note | string \| null | 노트 |

---

### 📊 필터 다이얼로그

**트리거:** Filter 버튼 클릭

#### 다이얼로그 구조

**섹션 1: 제목**
- "Filter"

**섹션 2: Invitation Status 필터**
- 드롭다운: All, Accepted, Pending, Expired, Canceled, N/A

**인터랙션:**
- 드롭다운 선택: 상태 선택
- Reset 버튼: 필터 초기화 (All)
- Cancel 버튼: 다이얼로그 닫기
- Apply 버튼: 필터 적용

---

### 📊 Add Reseller Modal

**트리거:** Add Reseller 버튼 클릭

#### 모달 구조

**섹션 1: 제목**
- "Add Reseller"

**섹션 2: 스텝 인디케이터**
- Step 1: Reseller Info
- Step 2: Service & Pricing
- Step 3: Billing Emails & Notes

**1단계: Reseller Info**
- Reseller Name (필수)
- Contact Person Email (필수)

**2단계: Service & Pricing**
- 서비스 선택: Observability, Management, Optimization
- 각 서비스별 Pricing Model 선택 (Pay-as-you-go / Fixed Rate)
- Pay-as-you-go: vCPU Unit Price, Minimum Charge
- Fixed Rate: 1 Year, 3 Year, 5 Year 각각 금액 입력

**3단계: Billing Emails & Notes**
- Billing Emails (최대 5개)
- Note (선택, 최대 280자)

**인터랙션:**
- Next 버튼: 다음 스텝으로 이동
- Back 버튼: 이전 스텝으로 이동
- Submit 버튼: Reseller 생성 + 초대 이메일 발송

**조건/규칙:**
- **Next 버튼 활성화**: 현재 스텝 필수 필드 모두 입력
- **Submit 버튼**: Step 3에서만 표시

**유효성 검증:**

| 필드 | 규칙 | 에러 메시지 (EN) | 에러 메시지 (KO) |
|------|------|------------------|------------------|
| name | 필수 | Reseller name is required | Reseller 이름은 필수입니다 |
| contactEmail | 필수 | Email is required | 이메일은 필수입니다 |
| contactEmail | 이메일 형식 | Invalid email format | 이메일 형식이 올바르지 않습니다 |
| services | 최소 1개 | Select at least one service | 최소 1개 서비스 선택 |
| billingEmails | 이메일 형식 | Invalid email format | 이메일 형식이 올바르지 않습니다 |
| note | 최대 280자 | Max 280 characters | 최대 280자 |

**데이터 요구사항 (제출):**

**API Endpoint:** `POST /api/resellers`

**요청 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| name | string | Reseller 회사명 |
| contactEmail | string | 담당자 이메일 |
| services | string[] | 서비스 목록 |
| pricing | object | 서비스별 가격 정보 |
| billingEmails | string[] | 청구서 이메일 목록 |
| note | string \| null | 노트 |

---

### 🔄 페이지 네비게이션

| 출발지 | 목적지 | 조건 |
|--------|--------|------|
| 테이블 행 클릭 | `/reseller/{resellerId}` | - |

---

## 6. Reseller Detail Page

**경로:** `/reseller/{resellerId}`
**접근 권한:** `wm_admin`, `wm_editor`, `wm_viewer`

### 📐 페이지 구조

#### 섹션 1: 페이지 헤더
**기능:**
- 뒤로가기 버튼 + Reseller 회사명 표시
- Delete 버튼 (wm_admin만)

**인터랙션:**
- 뒤로가기 버튼 클릭: `/reseller` 페이지로 이동
- Delete 버튼 클릭: Reseller 삭제 확인 다이얼로그 열기

**조건/규칙:**
- **Delete 버튼**: `wm_admin`만 표시

---

#### 섹션 2: Reseller Info 카드
**기능:**
- Reseller 정보 표시
- Edit 버튼
- Billing Email Address 목록

**표시 정보:**
- Reseller Name, Reseller ID, Country, Business Reg. No., Contact Person, Contact Person Email, Created At
- Billing Email Address (개수 표시)

**인터랙션:**
- Edit 버튼 (Info): Edit Reseller Info Modal 열기
- Edit 버튼 (Billing Emails): Edit Billing Emails Modal 열기

**조건/규칙:**
- **Edit 버튼**: `wm_admin`, `wm_editor`만 표시

### 📊 리셀러 정보 수정 모달

**트리거:** Edit 버튼 (Info) 클릭
**접근 권한:** `wm_admin`, `wm_editor`

**📄 전체 상세 명세**: [common-api-spec.md - Section 4.9](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/common-api-spec.md#49-edit-reseller-info-modal-리셀러-정보-수정-모달)

#### 빠른 참조

**수정 가능 필드:**
- Company Name (최소 2자, 중복 체크)
- Country (드롭다운 선택)
- Business Reg. No. (국가별 형식 검증)
- Contact Person (필수)
- Contact Person Email (이메일 형식)

**API**: `PUT /api/resellers/{id}`

**Submit 동작:** Reseller 정보 업데이트 후 모달 닫기, 페이지 데이터 새로고침

---

### 📊 청구서 이메일 수정 모달

**트리거:** Edit 버튼 (Billing Emails) 클릭
**접근 권한:** `wm_admin`, `wm_editor`

**📄 전체 상세 명세**: [common-api-spec.md - Section 4.2](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/common-api-spec.md#42-edit-billing-emails-modal-청구서-이메일-수정-모달)

#### 빠른 참조

**기능:**
- 기존 이메일 목록 표시
- 새 이메일 추가 (+ Add Email)
- 이메일 삭제 (X 아이콘)

**유효성 검증:**
- 이메일 형식 검증
- 중복 방지
- 최소 1개 이메일 필수

**API**: `PUT /api/resellers/{id}/billing-emails`

**Submit 동작:** 청구서 이메일 목록 업데이트 후 모달 닫기

---

**데이터 요구사항:**

**API Endpoint:** `GET /api/resellers/{resellerId}`

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | Reseller ID |
| name | string | Reseller 회사명 |
| resellerId | string | Reseller ID (UI 표시용) |
| country | string | 국가명 |
| businessRegNo | string | 사업자등록번호 |
| contactPerson | string | 담당자명 |
| contactEmail | string | 담당자 이메일 |
| createdAt | string | 생성일 (YYYY. MM. DD) |
| billingEmails | string[] | 청구서 이메일 목록 |

---

#### 섹션 3: Note 카드
**기능:**
- Reseller 노트 목록 표시
- Add Note 버튼

**인터랙션:**
- Add Note 버튼 클릭: Add Note Modal 열기
- 노트 Actions (드롭다운):
  - Edit: Edit Note Modal 열기
  - Delete: Delete Note 확인 다이얼로그 열기

**조건/규칙:**
- **Add Note 버튼**: `wm_admin`, `wm_editor`만 표시
- **Edit**: `wm_admin`, `wm_editor`만 표시
- **Delete**: `wm_admin`만 표시
- **Empty State**: 노트 없을 때 "No notes yet" 메시지

**데이터 요구사항:**

**API Endpoint:** `GET /api/resellers/{resellerId}/notes`

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 노트 ID |
| resellerId | string | Reseller ID |
| content | string | 노트 내용 |
| author | string | 작성자명 |
| createdAt | string | 작성일 (YYYY. MM. DD) |

---

#### 섹션 4: Contracts 섹션
**기능:**
- 통계 카드 4개: Contracts, Pending Review, Approved, Rejected
- 계약 테이블 (가로 스크롤, 고정 컬럼)
- 페이지네이션 (5개/페이지)

**통계 카드:**
- Contracts: 총 계약 수
- Pending Review: 승인 대기 계약 수
- Approved: 승인된 계약 수
- Rejected: 거절된 계약 수

**계약 테이블 컬럼:**
- **고정 왼쪽**: Contract No., Company Name
- **스크롤 영역**: Service, Pricing Model, vCPU Unit Price, Minimum Charge, Contract Amount, Included Allocation, Submitted
- **고정 오른쪽**: Status, Actions (Approval/Rejection 버튼)

**인터랙션:**
- 행 클릭: Contract Detail 페이지로 이동
- Submitted 컬럼 헤더 클릭: 정렬 토글
- Approval 버튼: 계약 승인
- Rejection 버튼: Reject Contract Modal 열기

**조건/규칙:**
- **Actions**:
  - Pending: Approval/Rejection 버튼 활성화
  - Approved/Rejected: 버튼 비활성화
- **Approval/Rejection 버튼**:
  - `wm_admin`, `wm_editor`: 버튼 표시 및 활성화
  - `wm_viewer`: 버튼 숨김 (조회 전용)

**데이터 요구사항:**

**API Endpoint:** `GET /api/resellers/{resellerId}/contracts`

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| page | number | 페이지 번호 |
| limit | number | 페이지당 행 수 (기본: 5) |
| sortOrder | 'asc' \| 'desc' | Submitted 정렬 순서 |

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 계약 ID |
| contractNo | string | 계약 번호 |
| companyName | string | 고객 회사명 |
| service | string | 서비스명 |
| pricingModel | string | 가격 모델 |
| vcpuUnitPrice | string \| null | vCPU 단가 |
| minimumCharge | string \| null | 최소 청구 |
| contractAmount | string \| null | 계약 금액 |
| includedAllocation | string \| null | 포함 할당량 |
| submitted | string | 제출일 (YYYY. MM. DD) |
| status | 'Pending' \| 'Approved' \| 'Rejected' | 상태 |

**통계 데이터:**
| 필드 | 타입 | 설명 |
|------|------|------|
| totalContracts | number | 총 계약 수 |
| pendingContracts | number | 승인 대기 계약 수 |
| approvedContracts | number | 승인된 계약 수 |
| rejectedContracts | number | 거절된 계약 수 |

---

#### 섹션 5: Payment History 섹션
**기능:**
- 결제 내역 표시 (페이지네이션: 5개/페이지)
- "View detailed payment history" 버튼

**표시 정보 (테이블):**
- Invoice No., Period, Date, Status, Paid Amount, Difference

**인터랙션:**
- Invoice No. 옆 복사 아이콘 클릭: 클립보드에 복사
- "View detailed payment history" 버튼 클릭: Payments 페이지로 이동
- 페이지네이션: Previous/Next 버튼

**조건/규칙:**
- **Status 배지**: Paid (초록색), Pending (회색), Partial (주황색)
- **Empty State**: 결제 없을 때 "No payments yet" 메시지

**데이터 요구사항:**

**API Endpoint:** `GET /api/resellers/{resellerId}/payments`

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| page | number | 페이지 번호 |
| limit | number | 페이지당 행 수 (기본: 5) |

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 결제 ID |
| period | string | 청구 기간 (예: "2025. 10") |
| date | string | 청구일 (MM. DD) |
| status | 'paid' \| 'pending' \| 'partial' | 결제 상태 |
| paidAmount | number | 납부 금액 (USD) |
| difference | number | 차액 (USD) |

---

### 🔄 페이지 네비게이션

| 출발지 | 목적지 | 조건 |
|--------|--------|------|
| 뒤로가기 버튼 | `/reseller` | - |
| Contract 행 클릭 | `/contracts/{contractId}` | - |
| "View detailed payment history" | `/payments?reseller={resellerId}&period=all` | - |

---

## 7. Payments Page

**경로:** `/payments`
**접근 권한:** `wm_admin`, `wm_editor`, `wm_viewer`

### 📐 페이지 구조

#### 섹션 1: 페이지 헤더
**기능:**
- "Payments" 제목 표시
- Period 선택 드롭다운

**인터랙션:**
- Period 드롭다운: 기간 선택 (All Periods, 2025. 10, 2025. 09, ...)

**조건/규칙:**
- **기본값**: 현재 월 (예: 2025. 10)

---

#### 섹션 2: 통계 카드 (4개)
**기능:**
- Total Billed Amount, Total Paid Amount, Total Difference, Unpaid Invoices
- 각 카드마다 전월 대비 변화율(%) 표시

**조건/규칙:**
- **데이터 범위**: Direct 결제만 (`resellerId === null`)
- **All Periods 선택 시**: 변화율 숨김

**데이터 요구사항:**

**API Endpoint:** `GET /api/payments/stats?period={period}`

**자동 필터링:** `WHERE resellerId IS NULL`

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| totalBilledAmount | number | 총 청구 금액 (USD) |
| totalPaidAmount | number | 총 납부 금액 (USD) |
| totalDifference | number | 총 차액 (USD) |
| unpaidInvoices | number | 미납 청구서 수 |
| billedTrend | object | 청구 금액 변화율 |
| paidTrend | object | 납부 금액 변화율 |
| differenceTrend | object | 차액 변화율 |
| unpaidTrend | object | 미납 수 변화 |

---

#### 섹션 3: 검색 및 필터 바
**기능:**
- 검색: Invoice No., 회사명, 서비스, 사업자번호 등으로 검색
- "Show only with difference" 토글: 차액 있는 청구서만 표시
- Filter 버튼: Contract Type, Tax, Status 필터 다이얼로그 열기
- Export to Excel: 엑셀 다운로드
- Go to Prix: Prix 시스템으로 이동 (wm_admin만)

**인터랙션:**
- 검색 입력: 실시간 필터링
- Toggle 스위치: 차액 있는 청구서만 표시/전체 표시
- Filter 버튼 클릭: Filter Dialog 열기
- Export to Excel 클릭: 엑셀 다운로드
- Go to Prix 클릭: 외부 시스템 연결

**조건/규칙:**
- **Filter 버튼**: 필터 적용 시 배지 표시 (필터 개수)
- **Export to Excel**: `wm_admin`, `wm_editor`, `wm_viewer` 모두 표시
- **Go to Prix**: `wm_admin`만 표시

---

#### 섹션 4: 청구서 테이블 (하이브리드 스크롤)
**기능:**
- 청구서 목록 표시 (고정 컬럼 + 스크롤 영역)
- 컬럼 정렬: Date, Billed Amount, Status, Difference
- 페이지네이션

**테이블 컬럼:**
- **고정 왼쪽**: Invoice No.
- **스크롤 영역**: Service, Company Name, Contract Type, Business Reg. No., Period, Date, Billed Amount, Tax, vCPU Usage, Contact Person, Contact Person Email
- **고정 오른쪽**: Status, Deposit Date, Paid Amount, Difference

**인터랙션:**
- Invoice No. 옆 복사 아이콘 클릭: 클립보드에 복사
- 정렬 가능 컬럼 클릭: 정렬 토글
- Deposit Date (Pending): 날짜 선택 → Save 버튼
- Deposit Date (Paid/Partial): Edit 버튼 → 날짜 선택 → Save 버튼
- Paid Amount (Pending): 금액 입력 → Save 버튼 (status 자동 변경)
- Paid Amount (Paid/Partial): Edit 버튼 → 금액 수정 → Save 버튼

**조건/규칙:**
- **Status === 'pending'**:
  - Deposit Date: 날짜 선택기 표시 (기본값: 오늘)
  - Paid Amount: 입력 필드 표시 (기본값: Billed Amount)
  - Save 버튼 클릭: Deposit Date + Paid Amount 저장 → Status 자동 계산
    - Paid Amount === 0: status = 'pending'
    - Paid Amount >= Billed Amount: status = 'paid'
    - 그 외: status = 'partial'
- **Status === 'paid' OR 'partial'**:
  - Deposit Date: 텍스트 표시 + Edit 버튼 (hover 시 표시)
  - Paid Amount: 텍스트 표시 + Edit 버튼 (hover 시 표시)
- **Difference > 0**: 빨간색 표시
- **권한**:
  - `wm_admin`, `wm_editor`: 수정 가능
  - `wm_viewer`: 읽기 전용
- **Empty State**: 청구서 없을 때 "No invoices found" 메시지

**데이터 요구사항:**

**API Endpoint:** `GET /api/payments`

**자동 필터링:** `WHERE resellerId IS NULL`

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| period | string | 기간 (all, 2025. 10, ...) |
| search | string | 검색어 |
| showUnpaid | boolean | 차액 있는 청구서만 표시 |
| tax | string | Tax 필터 (all, Y, N) |
| status | string | Status 필터 (all, pending, partial, paid) |
| sortBy | string | 정렬 기준 (date, billedAmount, status, difference) |
| sortOrder | 'asc' \| 'desc' | 정렬 순서 |
| page | number | 페이지 번호 |
| limit | number | 페이지당 행 수 (5, 10, 20, 50) |

**⚠️ 중요:** Contract Type 필터는 제거됩니다. WM은 Direct 결제만 조회하므로 불필요합니다.

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 청구서 ID |
| invoiceNo | string | 청구서 번호 |
| service | string | 서비스명 |
| companyName | string | 회사명 |
| contractType | 'Direct' \| 'Reseller' | 계약 타입 |
| businessRegNo | string | 사업자등록번호 |
| period | string | 청구 기간 |
| issueDate | string | 발행일 (YYYY. MM. DD) |
| billedAmount | number | 청구 금액 (USD) |
| tax | 'Y' \| 'N' | 세금 포함 여부 |
| vcpuUsage | string | vCPU 사용량 |
| contactPerson | string | 담당자명 |
| contactPersonEmail | string | 담당자 이메일 |
| status | 'pending' \| 'partial' \| 'paid' | 결제 상태 |
| depositDate | string \| null | 입금일 (YYYY. MM. DD) |
| paidAmount | number | 납부 금액 (USD) |
| difference | number | 차액 (USD) |

---

### 📊 필터 다이얼로그

**트리거:** Filter 버튼 클릭

#### 다이얼로그 구조

**섹션 1: 제목**
- "Filter"

**섹션 2: 필터 옵션**
- Contract Type: All, Direct, Reseller
- Tax: All, Y, N
- Status: All, Pending, Partial, Paid
- (URL에서 전달된 경우) Contract ID, Service 필터 표시 + Clear 버튼

**인터랙션:**
- 드롭다운 선택: 필터 값 선택
- Reset 버튼: 모든 필터 초기화
- Cancel 버튼: 다이얼로그 닫기
- Apply 버튼: 필터 적용

---

### 💾 데이터 수정 API

**Deposit Date 변경:**

**API Endpoint:** `PATCH /api/payments/{invoiceId}/deposit-date`

**요청 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| depositDate | string | 입금일 (YYYY. MM. DD) |

---

**Paid Amount 변경:**

**API Endpoint:** `PATCH /api/payments/{invoiceId}/paid-amount`

**요청 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| paidAmount | number | 납부 금액 (USD) |

**응답:**
- 업데이트된 청구서 데이터 (status, difference 자동 계산됨)

---


---

### 🎯 Detailed Button Actions & Interactions (Payments Page)

#### Period Selector Dropdown
- **Location**: Page header, top-left
- **Options**: All Periods, 2025. 10, 2025. 09, 2025. 08, ...
- **Default**: Current month (e.g., "2025. 10")
- **Action**: Changes period filter → refetches statistics and invoice list
- **API Call**: `GET /api/payments/stats?period={period}` + `GET /api/payments?period={period}`

#### Show Only With Difference Toggle
- **Type**: Switch toggle
- **Default**: Off (show all)
- **Label**: "Show only with difference"
- **Action**: Filters table to show only invoices where `difference !== 0`
- **Client-side**: Filters locally without API call

#### Filter Button
- **Action**: Opens PaymentFilterDialog
- **Filter Options**:
  - Period Range: From (YYYY. MM) - To (YYYY. MM)
  - Status: ALL, Paid, Pending, Partial, Unpaid
- **Validation**: From date must be ≤ To date (shows error, disables Apply)
- **Apply**: Filters table, shows badge with filter count
- **Reset**: Clears all filters, hides badge

#### Export to Excel
- **Visibility**: All roles (wm_admin, wm_editor, wm_viewer)
- **Action**: Downloads filtered invoices as .xlsx
- **Filename**: `payments_YYYY-MM-DD.xlsx`
- **Includes**: All visible rows after filters

#### Go to Prix Button
- **Visibility**: wm_admin only
- **Action**: Opens Prix system in new tab
- **URL**: External link to Prix platform

#### Search Input
- **Trigger**: onChange (real-time)
- **Search Fields**: invoiceNo, companyName, service, businessRegNo, contactPerson
- **Logic**: Client-side filtering with OR condition

#### Copy Invoice Number
- **Icon**: Copy icon next to Invoice No (leftmost column)
- **Action**: Copies invoice number to clipboard
- **Toast**: "Copied!" with description "Invoice number copied to clipboard"

#### Sort Headers
- **Sortable Columns**: Date, Billed Amount, Difference, Status
- **Click Action**: Toggle sort direction (asc → desc → none)
- **Visual**: Arrow icon shows direction

#### Inline Editing - Paid Amount (Pending Invoices)
**Trigger**: Invoice status === "pending"

**View Mode**:
- Shows current paid amount (default: $0.00)
- Hover: Shows edit icon

**Edit Mode**:
- Click on value → Input field appears
- Input type: number
- Validation: Must be ≥ 0
- Auto-calculation:
  - If paidAmount = 0 → status: "pending"
  - If 0 < paidAmount < billedAmount → status: "partial"
  - If paidAmount ≥ billedAmount → status: "paid"
- Save Trigger: onBlur or Enter key
- Cancel: Esc key (reverts to original value)
- API Call: `PUT /api/payments/{id}` with { paidAmount }
- Toast: "Invoice updated successfully"

**Permissions**:
- Edit: wm_admin, wm_editor only
- View: All roles

#### Inline Editing - Deposit Date (Pending Invoices)
**Trigger**: Invoice status === "pending"

**View Mode**:
- Shows "Select date" placeholder
- Hover: Shows calendar icon

**Edit Mode**:
- Click → Date picker opens
- Component: Calendar date picker
- Validation: Must be valid date
- Save: Immediately on date selection
- API Call: `PUT /api/payments/{id}` with { depositDate }
- Toast: "Deposit date updated successfully"

**Permissions**:
- Edit: wm_admin, wm_editor only
- View: All roles

#### Edit Buttons (Paid/Partial Invoices)
**Trigger**: Invoice status === "paid" or "partial"

**Paid Amount Edit Button**:
- Visibility: Hover on paid amount cell
- Click: Opens inline input (same as pending)
- Permissions: wm_admin, wm_editor

#### Pagination Controls
- **Rows Per Page**: 5, 10, 20, 50 (default: 20)
- **Buttons**: First, Previous, Page X of Y, Next, Last
- **Behavior**: Same as Customers Page

---

### 📋 Form Validations (Payments Page)

| Field | Validation Rule | Error Message (EN) | Error Message (KO) | Trigger |
|-------|----------------|-------------------|-------------------|---------|
| Paid Amount | Must be ≥ 0 | "Amount must be 0 or greater" | "금액은 0 이상이어야 합니다" | onChange |
| Paid Amount | Must be number | "Invalid amount" | "유효하지 않은 금액입니다" | onChange |
| Deposit Date | Must be valid date | "Invalid date" | "유효하지 않은 날짜입니다" | onSelect |
| Period Range (Filter) | From ≤ To | "From date must be earlier than or equal to To date" | "시작일은 종료일보다 이전이거나 같아야 합니다" | onChange |

---

### 🔄 State Management (Payments Page)

```typescript
// Period & Filter
const [selectedPeriod, setSelectedPeriod] = useState('2025. 10');
const [searchQuery, setSearchQuery] = useState('');
const [showOnlyUnpaid, setShowOnlyUnpaid] = useState(false);
const [filterContractType, setFilterContractType] = useState('all');
const [filterTax, setFilterTax] = useState('all');
const [filterStatus, setFilterStatus] = useState('all');

// Table
const [currentPage, setCurrentPage] = useState(1);
const [rowsPerPage, setRowsPerPage] = useState(20);
const [sortColumn, setSortColumn] = useState<string | null>(null);
const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

// Inline Editing State
const [pendingPaidAmounts, setPendingPaidAmounts] = useState<Record<string, number>>({});
const [pendingDepositDates, setPendingDepositDates] = useState<Record<string, string>>({});
const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
const [editingDepositDateId, setEditingDepositDateId] = useState<string | null>(null);

// Statistics
const [stats, setStats] = useState({
  totalBilledAmount: 0,
  totalPaidAmount: 0,
  totalDifference: 0,
  unpaidInvoices: 0,
  billedTrend: { value: 0, direction: 'up' | 'down' | 'neutral' },
  paidTrend: { value: 0, direction: 'up' | 'down' | 'neutral' },
  differenceTrend: { value: 0, direction: 'up' | 'down' | 'neutral' },
  unpaidTrend: { value: 0, direction: 'up' | 'down' | 'neutral' },
});
```

**State Update Patterns:**
1. **Period Change**: 
   - Updates `selectedPeriod`
   - Fetches new stats and invoices
   - Resets pagination to page 1
   
2. **Inline Edit (Paid Amount)**:
   - On input: Updates `pendingPaidAmounts[invoiceId]`
   - On blur/enter: 
     - Validates amount
     - PUT `/api/payments/{id}`
     - Updates invoice in table
     - Clears `pendingPaidAmounts[invoiceId]`
     - Shows toast
   
3. **Inline Edit (Deposit Date)**:
   - On date select:
     - Updates `pendingDepositDates[invoiceId]`
     - PUT `/api/payments/{id}`
     - Updates invoice in table
     - Clears `pendingDepositDates[invoiceId]`
     - Shows toast

4. **Toggle "Show only unpaid"**:
   - Updates `showOnlyUnpaid`
   - Filters table client-side
   - Resets pagination to page 1

---

### 🎨 Conditional Rendering (Payments Page)

| Element | Condition | Display |
|---------|-----------|---------|
| Go to Prix Button | `user.role === 'wm_admin'` | Visible |
| Edit Paid Amount | `user.role === 'wm_admin' \|\| user.role === 'wm_editor'` | Editable |
| Edit Deposit Date | `user.role === 'wm_admin' \|\| user.role === 'wm_editor'` | Editable |
| Paid Amount Input | `invoice.status === 'pending'` | Show inline input |
| Paid Amount Edit Button | `invoice.status === 'paid' \|\| invoice.status === 'partial'` | Show on hover |
| Deposit Date Picker | `invoice.status === 'pending'` | Show date picker |
| Trend Indicators | `selectedPeriod !== 'All Periods'` | Show % change |
| Statistics Cards | Always | Visible |
| Empty State | `filteredInvoices.length === 0` | Show "No invoices found" |

---

### 🚨 Error Handling (Payments Page)

**Invalid Paid Amount:**
- Show validation message inline
- Prevent submission
- Keep original value

**Network Error (Update Failed):**
- Show error toast
- Revert to original value
- Allow retry

**Period Range Validation (Filter):**
- Red border on both dropdowns
- Error message below
- Disable Apply button

**Empty State:**
- Message: "No invoices found"
- Sub-message: "Try adjusting your filters or period selection"

---

### 📊 Data Flow (Payments Page)

**Page Load Flow:**
```
1. Component mounts
2. Fetch statistics: GET /api/payments/stats?period={currentMonth}
3. Fetch invoices: GET /api/payments?period={currentMonth}&page=1&limit=20
4. Calculate derived values (difference, status badges)
5. Render table
```

**Inline Edit Flow (Paid Amount):**
```
1. User clicks on paid amount cell (pending invoice)
2. Input field appears with current value
3. User types new amount
4. On blur or Enter:
   - Validate: amount >= 0
   - If invalid: Show error, keep in edit mode
   - If valid:
     - PUT /api/payments/{id} with { paidAmount: newValue }
     - Backend calculates new difference and status
     - Response: updated invoice data
     - Update local state
     - Show toast: "Invoice updated successfully"
     - Exit edit mode
5. On Esc: Revert to original value, exit edit mode
```

**Status Calculation Logic (Backend):**
```typescript
// Auto-calculated based on paidAmount vs billedAmount
if (paidAmount === 0) {
  status = 'pending';
} else if (paidAmount < billedAmount) {
  status = 'partial';
} else if (paidAmount >= billedAmount) {
  status = 'paid';
}
difference = billedAmount - paidAmount;
```

**Period Change Flow:**
```
1. User selects new period from dropdown
2. Update selectedPeriod state
3. Parallel API calls:
   - GET /api/payments/stats?period={newPeriod}
   - GET /api/payments?period={newPeriod}&page=1&limit=20
4. Update statistics cards with trend calculations
5. Update table with new invoices
6. Reset pagination to page 1
```

**Filter Flow:**
```
1. User clicks Filter button
2. PaymentFilterDialog opens
3. User selects period range and status
4. User clicks Apply:
   - Validate period range (from <= to)
   - If valid:
     - Apply filters
     - Show badge with filter count
     - Filter table client-side
     - Reset pagination
   - If invalid:
     - Show error message
     - Disable Apply button
5. User clicks Reset:
   - Clear all filters
   - Hide badge
   - Show all invoices
```

---

### 🔢 Table Layout (Payments Page)

**Fixed Columns:**
- **Left**: Invoice No. (with copy button) - Always visible, sticky left
- **Right**: Status, Deposit Date, Paid Amount, Difference - Sticky right

**Scrollable Middle Columns:**
- Service, Company, Contract Type, Business Reg., Period, Date, Billed Amount, Tax, vCPU, Contact

**Column Widths:**
- Invoice No.: 140px
- Others: Auto-sized based on content
- Minimum total width: ~1800px (horizontal scroll on smaller screens)

**Row Height:**
- Standard: 56px
- With edit controls: 56px (same, controls appear inline)

---

## 8. Contracts Page

**경로:** `/contracts`
**접근 권한:** `wm_admin`, `wm_editor`, `wm_viewer`

### 📐 페이지 구조

#### 섹션 1: 페이지 헤더
**기능:**
- "Contracts" 제목 표시

**조건/규칙:**
- 항상 표시

---

#### 섹션 2: 검색 및 필터 바
**기능:**
- 검색: 고객명, 서비스명으로 검색
- Filter 버튼: Filter Dialog 열기
- Export to Excel: 엑셀 다운로드 (wm_admin, wm_editor, wm_viewer)
- Add Contract: 계약 추가 (wm_admin, wm_editor)

**인터랙션:**
- 검색 입력: 실시간 필터링
- Filter 버튼 클릭: Filter Dialog 열기
- Export to Excel 클릭: 엑셀 다운로드
- Add Contract 클릭: Add Contract Modal 열기

**조건/규칙:**
- **Add Contract 버튼**: `wm_admin`, `wm_editor`만 표시
- **Export to Excel**: 모든 역할 표시

### 📊 계약 추가 모달

**트리거:** Add Contract 버튼 클릭
**접근 권한:** `wm_admin`, `wm_editor`

**📄 전체 상세 명세**: [common-api-spec.md - Section 4.10](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/common-api-spec.md#410-add-contract-modal-계약-추가-모달)

#### 빠른 참조

**구조:** 멀티스텝 모달 (최대 5단계)

**단계별 흐름:**
1. **고객 선택**: 기존 고객 검색 및 선택, "Add Customer First" 링크로 신규 고객 추가 가능
2. **새 고객 추가** (옵션): "Add Customer First" 링크 클릭 시
3. **서비스 & 가격 모델**: Service 선택, Pricing Model 선택 (Fixed Rate / Pay-as-you-go / Trial)
4. **가격 설정**: 가격 모델별 가격 입력 (월 금액, vCPU 단가 등)
5. **검토 & 생성**: 입력 정보 확인 후 생성

**주요 필드:**
- Service: Skuber⁺ Management / Observability / Optimization
- Pricing Model: Fixed Rate / Pay-as-you-go / Trial
- Fixed Rate: 계약 기간, 월 금액 (USD), vCPU 단가
- Pay-as-you-go: vCPU 단가만
- Trial: 체험 기간 (1/3/6개월)

**API**: `POST /api/contracts`

**Submit 동작:** 계약 생성 후 Contract Detail 페이지로 이동

---

#### 섹션 3: Status Tabs
**기능:**
- 상태별 계약 필터링

**표시 정보:**
- Tab 목록: "All", "Pending", "Approved", "Rejected"

**인터랙션:**
- Tab 클릭: 해당 상태 계약만 표시

**조건/규칙:**
- **선택된 Tab**: 하단 밑줄 표시
- **기본 선택**: "All" Tab

---

#### 섹션 4: Contracts Table
**기능:**
- Direct 계약 목록 표시
- 계약 상세로 이동

**표시 컬럼:**
- Customer: 고객사 이름
- Service: 서비스 이름
- Pricing: 가격 모델 (Fixed Rate / Pay-as-you-go / Trial)
- Period: 계약 기간
- Amount: 계약 금액
- Status: 승인 상태 (뱃지)
- Actions: 드롭다운 메뉴 (wm_admin, wm_editor)

**인터랙션:**
- 행 클릭: Contract Detail 페이지로 이동
- Actions 드롭다운:
  - Add Note: 노트 추가 모달 열기
  - Delete: 계약 삭제 (wm_admin만)

**조건/규칙:**
- **데이터 범위**: Direct 계약만 (`resellerId === null`)
- **Amount 표시 규칙:**
  - Fixed Rate: 금액 표시 (예: "$10,000")
  - Pay-as-you-go: "-" 표시
  - Trial: "Free" 표시
- **Status 뱃지 색상:**
  - Pending: 주황색
  - Approved: 녹색
  - Rejected: 빨강색
- **Actions 컬럼**: `wm_viewer`는 숨김
- **Delete**: `wm_admin`만 가능
- **Empty State**: 계약 없을 때 "No contracts found" 메시지

**데이터 요구사항:**

**API Endpoint:** `GET /api/contracts`

**자동 필터링:** `WHERE resellerId IS NULL`

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| search | string | 검색어 (고객명, 서비스명) |
| status | string | 상태 필터 (all, pending, approved, rejected) |
| pricingModel | string | 가격 모델 필터 (all, Fixed Rate, Pay-as-you-go, Trial) |
| sortBy | string | 정렬 기준 |
| sortOrder | 'asc' \| 'desc' | 정렬 순서 |
| page | number | 페이지 번호 |
| limit | number | 페이지당 행 수 |

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 계약 ID |
| customerId | string | 고객 ID |
| customerName | string | 고객명 |
| service | string | 서비스명 |
| pricingModel | 'Fixed Rate' \| 'Pay-as-you-go' \| 'Trial' | 가격 모델 |
| startDate | string | 시작일 (YYYY. MM. DD) |
| endDate | string \| null | 종료일 (YYYY. MM. DD, null = no end date) |
| amount | number \| null | 계약 금액 (Fixed Rate만) |
| approvalStatus | 'pending' \| 'approved' \| 'rejected' | 승인 상태 |

---

### 📊 필터 다이얼로그

**트리거:** Filter 버튼 클릭

#### 다이얼로그 구조

**섹션 1: 제목**
- "Filter"

**섹션 2: 필터 옵션**
- Status: All, Pending, Approved, Rejected
- Pricing Model: All, Fixed Rate, Pay-as-you-go, Trial

**인터랙션:**
- 드롭다운 선택: 필터 값 선택
- Reset 버튼: 모든 필터 초기화
- Cancel 버튼: 다이얼로그 닫기
- Apply 버튼: 필터 적용

---

### 🎯 Detailed Button Actions & Interactions (Contracts Page)

#### Search Input
- **Trigger**: onChange (real-time)
- **Search Fields**: customerName, service
- **Logic**: Client-side filtering with OR condition
- **Debounce**: None (instant filtering)

#### Status Tabs
- **Tabs**: All, Pending, Approved, Rejected
- **Default**: "All" selected
- **Click Action**: Filters contracts by approval status
- **Visual**: Selected tab shows underline indicator
- **Client-side**: Filters locally without API call

#### Filter Button
- **Action**: Opens ContractFilterDialog
- **Filter Options**:
  - Status: All, Pending, Approved, Rejected
  - Pricing Model: All, Fixed Rate, Pay-as-you-go, Trial
- **Apply**: Filters table, shows badge with filter count
- **Reset**: Clears all filters, hides badge
- **Badge**: Shows number of active filters

#### Export to Excel
- **Visibility**: All roles (wm_admin, wm_editor, wm_viewer)
- **Action**: Downloads filtered contracts as .xlsx
- **Filename**: `contracts_YYYY-MM-DD.xlsx`
- **Includes**: All visible rows after filters and search
- **Columns**: Customer, Service, Pricing Model, Period, Amount, Status

#### Add Contract Button
- **Visibility**: wm_admin, wm_editor only
- **Action**: Opens Add Contract Modal (5-step wizard)
- **Step 1**: Select service
- **Step 2**: Choose pricing model
- **Step 3**: Select customer (existing or create new)
- **Step 4**: Enter pricing details
- **Step 5**: Set contract period and billing info

#### Table Row Click
- **Action**: Navigates to Contract Detail page
- **Target**: `/contracts/{contractId}`
- **Cursor**: Pointer (indicates clickable)
- **Hover**: Light background color change

#### Actions Dropdown - Add Note
- **Visibility**: wm_admin, wm_editor only
- **Action**: Opens Add Note Modal
- **Form Fields**: Note content (max 280 chars)
- **Submit**: POST /api/contracts/{contractId}/notes
- **Toast**: "Note added successfully"

#### Actions Dropdown - Delete
- **Visibility**: wm_admin only
- **Condition**: Can delete any contract (including approved ones)
- **Click Flow**:
  1. Show confirmation dialog
  2. Dialog shows: "Are you sure you want to delete this contract?"
  3. Contract details displayed (customer, service, amount)
  4. On confirm: DELETE /api/contracts/{id}
  5. Toast: "Contract deleted successfully"
  6. Remove from table
  7. Update pagination if needed

**Warning Dialog**:
```
Title: "Delete Contract"
Description: "Are you sure you want to delete the contract for {customerName}? This action cannot be undone."
Buttons: "Cancel", "Delete" (destructive)
```

#### Sort Headers
- **Sortable Columns**: Customer, Service, Period (start date), Amount
- **Click Action**: Toggle sort direction (asc → desc → none)
- **Visual**: Arrow icon shows direction
- **Client-side**: Sorts locally without API call

#### Pagination Controls
- **Rows Per Page**: 5, 10, 20, 50 (default: 20)
- **Buttons**: First, Previous, Page X of Y, Next, Last
- **Behavior**: Same as Customers Page

---

### 📋 Form Validations (Contracts Page - Add Contract Modal)

Refer to `common-api-spec.md` Section 4 for full Add Contract Modal validation details.

---

### 🔄 State Management (Contracts Page)

```typescript
// Filters & Search
const [searchQuery, setSearchQuery] = useState('');
const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
const [filterStatus, setFilterStatus] = useState<string>('all');
const [filterPricingModel, setFilterPricingModel] = useState<string>('all');
const [appliedFilters, setAppliedFilters] = useState({
  status: 'all',
  pricingModel: 'all',
});

// Table
const [contracts, setContracts] = useState<Contract[]>([]);
const [currentPage, setCurrentPage] = useState(1);
const [rowsPerPage, setRowsPerPage] = useState(20);
const [sortColumn, setSortColumn] = useState<string | null>(null);
const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

// Modals
const [addContractOpen, setAddContractOpen] = useState(false);
const [addNoteContract, setAddNoteContract] = useState<Contract | null>(null);
const [deleteConfirm, setDeleteConfirm] = useState<{
  open: boolean;
  contractId: string;
  customerName: string;
} | null>(null);
```

**State Update Patterns:**
1. **Tab Change**: Updates `selectedTab` → filters contracts by status
2. **Search**: Updates `searchQuery` → triggers client-side filter
3. **Filter Apply**: Copies filter selections to `appliedFilters` → triggers filter
4. **Sort**: Updates `sortColumn` and `sortDirection` → triggers sort
5. **Delete**: Shows confirmation → on confirm, API call → update contracts list

---

### 🎨 Conditional Rendering (Contracts Page)

| Element | Condition | Display |
|---------|-----------|---------|
| Add Contract Button | `user.role === 'wm_admin' \|\| user.role === 'wm_editor'` | Visible |
| Actions Column | `user.role !== 'wm_viewer'` | Visible |
| Add Note Menu Item | `user.role === 'wm_admin' \|\| user.role === 'wm_editor'` | Visible |
| Delete Menu Item | `user.role === 'wm_admin'` | Visible |
| Filter Badge | `appliedFilters.status !== 'all' \|\| appliedFilters.pricingModel !== 'all'` | Show count |
| Empty State | `filteredContracts.length === 0` | Show "No contracts found" |
| Amount Column | `pricingModel === 'Fixed Rate'`: show amount, else: "-" or "Free" | Conditional |
| Status Badge Color | `pending`: orange, `approved`: green, `rejected`: red | Badge color |
| Tab Indicator | `selectedTab === tabName` | Show underline |
| Pagination | `totalPages > 1` | Visible |

---

### 🚨 Error Handling (Contracts Page)

**Delete Failed:**
- Show error toast: "Failed to delete contract. Please try again."
- Keep contract in table
- Allow retry

**Network Error (Load Failed):**
- Show error message in page center
- Provide "Retry" button
- Log error for debugging

**Empty State:**
- Message: "No contracts found"
- Sub-message: "Try adjusting your filters or search query"
- If no contracts at all: "No contracts yet. Add your first contract to get started."

---

### 📊 Data Flow (Contracts Page)

**Page Load Flow:**
```
1. Component mounts
2. API Call: GET /api/contracts?resellerId=null&page=1&limit=20
3. Response: { contracts: [], total: 0, page: 1, limit: 20 }
4. Set contracts state
5. Render table
```

**Filter Flow:**
```
1. User clicks Filter button
2. ContractFilterDialog opens with current filters
3. User selects status and/or pricing model
4. User clicks "Apply":
   - Copy filter values to appliedFilters
   - Close dialog
   - Filter table client-side
   - Show badge with filter count (e.g., "2")
   - Reset pagination to page 1
5. User clicks "Reset":
   - Clear all filters
   - Hide badge
   - Show all contracts
```

**Tab Filter Flow:**
```
1. User clicks status tab (e.g., "Pending")
2. Update selectedTab state
3. Filter contracts where approvalStatus === 'pending'
4. Reset pagination to page 1
5. Update URL query param: ?status=pending
```

**Contract Deletion Flow:**
```
1. User clicks Delete in actions dropdown
2. Show confirmation dialog with contract details
3. User clicks "Delete":
   - DELETE /api/contracts/{id}
   - On success:
     - Remove contract from table
     - Show toast: "Contract deleted successfully"
     - Update pagination if current page becomes empty
   - On error:
     - Show error toast
     - Keep contract in table
```

**Search Flow:**
```
1. User types in search input
2. Update searchQuery state (onChange)
3. Filter contracts locally:
   - Match customerName OR service
   - Case-insensitive partial match
4. Reset pagination to page 1
5. Re-render filtered results
```

**Sort Flow:**
```
1. User clicks sortable column header
2. If column not sorted: sort ascending
3. If sorted ascending: sort descending
4. If sorted descending: clear sort (return to default)
5. Update sortColumn and sortDirection
6. Re-render sorted table
```

**Add Contract Flow:**
```
1. User clicks "Add Contract" button
2. Add Contract Modal opens (5-step wizard)
3. User completes all 5 steps
4. On final submit:
   - POST /api/contracts with all form data
   - On success:
     - Close modal
     - Add new contract to table (prepend to list)
     - Show toast: "Contract created successfully"
     - Optionally navigate to contract detail page
   - On error:
     - Show error message in modal
     - Allow user to retry
```

**Export to Excel Flow:**
```
1. User clicks "Export to Excel"
2. Gather all filtered and searched contracts
3. Convert to Excel format with columns:
   - Customer, Service, Pricing Model, Period, Amount, Status
4. Trigger download: contracts_2025-01-16.xlsx
5. Show toast: "Exported successfully"
```

---

## 9. Contract Detail Page

**경로:** `/contracts/{contractId}`
**접근 권한:** `wm_admin`, `wm_editor`, `wm_viewer`

### 📐 페이지 구조

#### 섹션 1: 페이지 헤더
**기능:**
- 계약 ID 표시
- 뒤로가기 버튼

**인터랙션:**
- 뒤로가기 버튼 클릭: `/contracts` 페이지로 이동

**조건/규칙:**
- 항상 표시

---

#### 섹션 2: Contract Info Card
**기능:**
- 계약 기본 정보 표시

**표시 정보:**
- 고객사 이름
- 서비스 이름
- 계약 ID
- 계약 유형: "Direct"
- 가격 모델 (Fixed Rate / Pay-as-you-go / Trial)
- 계약 기간
- 계약 금액 (Fixed Rate만)

**조건/규칙:**
- **Amount 표시**: Fixed Rate만 표시, Pay-as-you-go/Trial은 표시 안 함
- **endDate === null**: "No end date" 표시

---

#### 섹션 3: Billing Info Card
**기능:**
- 결제 상세 정보 표시
- Billing Emails 표시 및 수정

**표시 정보 (Fixed Rate):**
- Amount: 계약 금액
- Tax Included: Yes / No
- Billing Cycle: Monthly, Annually
- Billing Emails: 이메일 목록

**표시 정보 (Pay-as-you-go):**
- vCPU Unit Price: "$100 / vCPU / hour"
- Minimum Charge: "$1000 / month"
- Tax Included: Yes / No
- Billing Cycle: Monthly
- Billing Emails: 이메일 목록

**표시 정보 (Trial):**
- Trial Allocation: "50 vCPU"
- Trial Period: "2025.11.01 - 2025.12.01 (1 month)"
- Note: "Free trial period. No charges will apply during this period."
- Billing Emails: 이메일 목록

**인터랙션:**
- "Edit Billing Emails" 버튼 클릭: Edit Billing Emails Modal 열림

**조건/규칙:**
- **Edit Billing Emails 버튼**: `approvalStatus === 'approved'`일 때만 표시
- **권한**: `wm_admin`, `wm_editor`만 수정 가능

---

#### 섹션 4: Status Card
**기능:**
- 승인 상태 표시

**approvalStatus === 'pending':**
- 상태 뱃지: 주황색 "Pending Approval"
- 표시 정보: "This contract is waiting for approval"
- 액션 버튼: 없음 (WM은 Direct 계약 승인 불필요)

**approvalStatus === 'approved':**
- 상태 뱃지: 녹색 "Approved"
- 표시 정보: "This contract has been approved"

**approvalStatus === 'rejected':**
- 상태 뱃지: 빨강색 "Rejected"
- 거절 사유 표시
- 표시 정보: rejection reason

**데이터 요구사항:**

**API Endpoint:** `GET /api/contracts/{contractId}`

**자동 필터링:** `WHERE resellerId IS NULL`

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 계약 ID |
| customerId | string | 고객 ID |
| customerName | string | 고객명 |
| service | string | 서비스명 |
| pricingModel | 'Fixed Rate' \| 'Pay-as-you-go' \| 'Trial' | 가격 모델 |
| startDate | string | 시작일 |
| endDate | string \| null | 종료일 |
| approvalStatus | 'pending' \| 'approved' \| 'rejected' | 승인 상태 |
| billingInfo | object | 가격 모델별 청구 정보 |
| billingEmails | string[] | 청구 이메일 목록 |
| rejectedReason | string \| null | 거절 사유 (rejected일 때만) |

---

## 10. Settings Page

**경로:** `/settings`
**접근 권한:** `wm_admin`, `wm_editor`, `wm_viewer`

### 📐 페이지 구조

#### 섹션 1: 페이지 헤더
**기능:**
- "Settings" 제목 표시
- Create Account 버튼

**인터랙션:**
- Create Account 버튼 클릭: Create Account Modal 열기

**조건/규칙:**
- **Create Account 버튼**: `wm_admin`만 표시

### 📊 계정 생성 모달

**트리거:** Create Account 버튼 클릭
**접근 권한:** `wm_admin`만 (WM) | `reseller_admin`만 (Reseller)

**📄 전체 상세 명세**: [common-api-spec.md - Section 4.7](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/common-api-spec.md#47-create-account-modal-계정-생성-모달)

#### 빠른 참조

**필수 입력:**
- Email (이메일 형식, 중복 체크)
- Name (최소 2자)
- Permission Type (Radio 선택: Admin / Editor / Viewer)

**역할별 권한:**
- **Administrator**: 모든 메뉴 접근 및 편집
- **Editor**: 계정 관리 메뉴 제외, 나머지 접근 및 편집
- **Viewer**: 계정 관리 메뉴 제외, 나머지 조회만

**API**: `POST /api/settings/accounts`

**Submit 동작:**
1. 계정 생성
2. 임시 비밀번호 생성
3. Temporary Password Dialog 표시 (복사 가능)

---

#### 섹션 2: Accounts Table
**기능:**
- WM 조직 내 계정 목록 표시
- 계정 수정

**표시 컬럼:**
- Email: 이메일 주소
- Name: 사용자 이름
- Permission Type: 역할 (Admin, Editor, Viewer)
- Created At: 생성일
- Actions: Edit 버튼

**인터랙션:**
- Edit 버튼 클릭: Edit Account Modal 열기

**조건/규칙:**
- **데이터 범위**: `user.role.startsWith('wm_')`인 계정만
- **Edit 버튼 표시 조건:**
  - `wm_admin`: 모든 계정에 표시
  - `wm_editor`: 자신의 계정에만 표시
  - `wm_viewer`: 버튼 숨김 (조회 전용)
- **Empty State**: 계정 없을 때 "No accounts found" 메시지

### 📊 계정 수정 모달

**트리거:** Edit 버튼 클릭
**접근 권한:**
- WM: `wm_admin` (모든 계정), `wm_editor` (자신만)
- Reseller: `reseller_admin` (모든 계정), `reseller_editor` (자신만)

**📄 전체 상세 명세**: [common-api-spec.md - Section 4.9](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/common-api-spec.md#49-edit-account-modal-계정-수정-모달)

#### 빠른 참조

**수정 가능 필드:**
- **Admin이 다른 계정 수정**: Name, Permission Type
- **자신의 계정 수정**: Name만 (Permission Type 변경 불가)

**Email:** 읽기 전용 (수정 불가)

**API**: `PUT /api/settings/accounts/{id}`

**Submit 동작:** 계정 정보 업데이트 후 모달 닫기, 테이블 새로고침

---

**데이터 요구사항:**

**API Endpoint:** `GET /api/settings/accounts`

**자동 필터링:** `WHERE role LIKE 'wm_%'`

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 계정 ID |
| email | string | 이메일 |
| name | string | 사용자 이름 |
| role | 'wm_admin' \| 'wm_editor' \| 'wm_viewer' | 역할 |
| createdAt | string | 생성일 (YYYY. MM. DD) |

---

#### 섹션 3: Logout 버튼
**기능:**
- 로그아웃

**인터랙션:**
- Logout 버튼 클릭: 로그아웃 → `/login` 페이지로 이동

**조건/규칙:**
- 항상 표시

---

### 🎯 Detailed Button Actions & Interactions (Settings Page)

#### Create Account Button
- **Visibility**: wm_admin only
- **Action**: Opens Create Account Modal
- **Form Fields**:
  - Email (required, email format, unique check)
  - Name (required, min 2 chars)
  - Permission Type (required, dropdown: Admin, Editor, Viewer)
  - Password (auto-generated, displayed after creation)
- **Submit Flow**:
  1. Validate email (format + uniqueness)
  2. Validate name (min 2 chars)
  3. POST /api/settings/accounts
  4. Response includes: { id, email, name, role, tempPassword }
  5. Show success dialog with temporary password
  6. User must copy password (one-time display)
  7. Close modal
  8. Add new account to table
  9. Show toast: "Account created successfully"

**Password Display Dialog**:
```
Title: "Account Created"
Description: "Account for {email} has been created. Please copy the temporary password below."
Password: [Copy button] ••••••••••••
Note: "The user will be required to change this password on first login."
Button: "Done" (closes dialog)
```

#### Edit Button (per account row)
- **Visibility**:
  - wm_admin: All rows
  - wm_editor: Only own account row
  - wm_viewer: Hidden
- **Action**: Opens Edit Account Modal
- **Editable Fields**:
  - For wm_admin editing others: Name, Permission Type
  - For wm_admin editing self: Name only (cannot change own permission)
  - For wm_editor editing self: Name only
- **Submit**: PUT /api/settings/accounts/{id}
- **Toast**: "Account updated successfully"

**Business Rules**:
- Admin cannot demote themselves (must have another admin)
- Admin can change other users' permissions
- Editor can only edit their own name
- Viewer has read-only access

#### Delete Account (Future Feature)
Currently not implemented in UI, but API should support:
- DELETE /api/settings/accounts/{id}
- Cannot delete own account
- Cannot delete last admin account

---

### 📋 Form Validations (Settings Page)

#### Create Account Modal

| Field | Validation Rule | Error Message (EN) | Error Message (KO) | Trigger |
|-------|----------------|-------------------|-------------------|---------|
| Email | Required | Email is required | 이메일은 필수입니다 | onBlur |
| Email | Email format | Invalid email format | 이메일 형식이 올바르지 않습니다 | onChange |
| Email | Unique | This email is already in use | 이미 사용 중인 이메일입니다 | onBlur (API check) |
| Name | Required | Name is required | 이름은 필수입니다 | onBlur |
| Name | Min 2 chars | Must be at least 2 characters | 최소 2자 이상 입력해주세요 | onChange |
| Permission Type | Required | Permission type is required | 권한 유형은 필수입니다 | onChange |

#### Edit Account Modal

| Field | Validation Rule | Error Message (EN) | Error Message (KO) | Trigger |
|-------|----------------|-------------------|-------------------|---------|
| Name | Required | Name is required | 이름은 필수입니다 | onBlur |
| Name | Min 2 chars | Must be at least 2 characters | 최소 2자 이상 입력해주세요 | onChange |
| Permission Type | Cannot remove last admin | Cannot remove the last admin | 마지막 관리자는 제거할 수 없습니다 | onChange |
| Permission Type | Cannot change own permission | Admins cannot change their own permission | 관리자는 자신의 권한을 변경할 수 없습니다 | onChange |

---

### 🔄 State Management (Settings Page)

```typescript
// Accounts
const [accounts, setAccounts] = useState<Account[]>([]);

// Modals
const [createAccountOpen, setCreateAccountOpen] = useState(false);
const [editAccountId, setEditAccountId] = useState<string | null>(null);
const [tempPasswordDialog, setTempPasswordDialog] = useState<{
  open: boolean;
  email: string;
  password: string;
} | null>(null);

// Create Form
const [createForm, setCreateForm] = useState({
  email: '',
  name: '',
  role: 'wm_viewer' as 'wm_admin' | 'wm_editor' | 'wm_viewer',
});
const [createFormErrors, setCreateFormErrors] = useState<Record<string, string>>({});

// Edit Form
const [editForm, setEditForm] = useState({
  name: '',
  role: 'wm_viewer' as 'wm_admin' | 'wm_editor' | 'wm_viewer',
});
const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});

// Current User (for permission checks)
const { user } = useAuth();
```

**State Update Patterns:**
1. **Page Load**: GET /api/settings/accounts → Update accounts list
2. **Create Account**:
   - Fill form → validate → POST → Show temp password dialog → Update accounts list
3. **Edit Account**:
   - Click Edit → Load account data into form → Update → PUT → Update accounts list

---

### 🎨 Conditional Rendering (Settings Page)

| Element | Condition | Display |
|---------|-----------|---------|
| Create Account Button | `user.role === 'wm_admin'` | Visible |
| Edit Button (all rows) | `user.role === 'wm_admin'` | Visible |
| Edit Button (own row) | `user.role === 'wm_editor' && account.id === user.id` | Visible |
| Edit Button | `user.role === 'wm_viewer'` | Hidden (all rows) |
| Permission Type Field (Edit) | `user.role === 'wm_admin' && account.id !== user.id` | Editable |
| Permission Type Field (Edit) | `account.id === user.id` | Disabled (cannot edit own) |
| Empty State | `accounts.length === 0` | Show "No accounts found" |

---

### 🚨 Error Handling (Settings Page)

**Email Already Exists:**
- Error appears below email field: "This email is already in use"
- Submit button remains disabled
- User must change email

**Cannot Change Own Permission:**
- When admin tries to edit their own account, Permission Type field is disabled
- Help text: "You cannot change your own permission level"

**Cannot Remove Last Admin:**
- When trying to change last admin to editor/viewer
- Show error dialog: "Cannot remove the last admin. Please promote another user to admin first."
- Permission change blocked

**Network Error:**
- Show error toast: "Failed to {action}. Please try again."
- Keep form data intact
- Allow retry

---

### 📊 Data Flow (Settings Page)

**Page Load Flow:**
```
1. Component mounts
2. API Call: GET /api/settings/accounts?role=wm_%
3. Response: [{ id, email, name, role, createdAt }, ...]
4. Set accounts state
5. Render table
```

**Create Account Flow:**
```
1. Admin clicks "Create Account"
2. CreateAccountModal opens
3. Admin fills: email, name, permission type
4. Real-time validation on each field
5. On submit:
   - Validate all fields
   - Check email uniqueness: GET /api/settings/check-email?email={email}
   - If valid:
     - POST /api/settings/accounts with { email, name, role }
     - Backend generates temporary password
     - Response: { id, email, name, role, tempPassword }
     - Close Create Modal
     - Open Temporary Password Dialog
     - Display password with copy button
     - Admin copies password
     - Admin clicks "Done"
     - Add new account to table
     - Show toast: "Account created successfully"
   - If invalid:
     - Show field-specific errors
     - Keep modal open
```

**Edit Account Flow:**
```
1. User clicks Edit button on row
2. EditAccountModal opens with current data pre-filled
3. User modifies name and/or permission type
4. Real-time validation
5. On submit:
   - Validate changes
   - Check business rules:
     - If changing own account: name only
     - If last admin: prevent permission downgrade
   - PUT /api/settings/accounts/{id} with changes
   - On success:
     - Update account in table
     - Show toast: "Account updated successfully"
     - Close modal
   - On error:
     - Show error message
     - Keep modal open
```

**Logout Flow:**
```
1. User clicks Logout (in sidebar, not Settings page)
2. POST /api/auth/logout
3. Clear session/token
4. Redirect to /login
5. Show toast: "Logged out successfully"
```

---

## 문서 종료

이 문서는 WM 도메인의 모든 페이지에 대한 백엔드 API 명세를 포함합니다.

**관련 문서:**
- `common-api-spec.md` - 공통 인증 및 데이터 모델
- `reseller-api-spec.md` - Reseller 도메인 페이지

---

**작성 완료일:** 2025-01-16
