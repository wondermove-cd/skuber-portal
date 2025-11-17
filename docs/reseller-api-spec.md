# Reseller API Specification
# WM Sales Portal - Reseller 도메인 API 명세

**문서 버전:** 2.0
**최종 업데이트:** 2025-01-16
**작성자:** Product Team

---

## 📑 목차

1. [Reseller 도메인 개요](#1-reseller-도메인-개요)
2. [Reseller Dashboard](#2-reseller-dashboard)
3. [My Payments Page](#3-my-payments-page)
4. [Contracts Page](#4-contracts-page)
5. [Contract Detail Page](#5-contract-detail-page)
6. [Settings Page](#6-settings-page)

**📌 참고 문서:**
- **공통 페이지** (인증 등): `common-api-spec.md` 참조
  - Login, Forgot Password, Verify Code, Reset Password, Expired Code
  - Reseller Signup, User Signup
  - Customers, Customer Detail

---

## 1. Reseller 도메인 개요

### 1.1 접근 권한

**Reseller 도메인 페이지는 Reseller 사용자만 접근 가능합니다.**

| 페이지 | reseller_admin | reseller_editor | reseller_viewer |
|--------|----------------|-----------------|-----------------|
| Dashboard | ✅ | ✅ | ✅ |
| Customers (공통) | ✅ | ✅ | ✅ |
| Customer Detail (공통) | ✅ | ✅ | ✅ |
| Contracts | ✅ | ✅ | ✅ |
| Contract Detail | ✅ | ✅ | ✅ |
| My Payments | ✅ | ✅ | ✅ |
| Settings | ✅ | ✅ | ✅ |

### 1.2 데이터 접근 범위

**Reseller 사용자는 자사가 생성한 데이터만 접근 가능합니다.**

| 데이터 타입 | 접근 범위 |
|------------|----------|
| 고객(Customer) | `customer.resellerId === user.resellerId`인 고객만 |
| 계약(Contract) | `contract.resellerId === user.resellerId`인 계약만 |
| 결제(Payment) | `payment.resellerId === user.resellerId`인 결제만 |

**⚠️ 중요:** Direct 고객/계약/결제 (`resellerId === null`)는 절대 노출되지 않습니다.

### 1.3 공통 기능

- **데이터 범위**: Reseller 사용자는 자사(`resellerId`) 데이터만 조회 가능
- **필터링**: 백엔드에서 반드시 `resellerId` 기반 필터링 적용
- **생성/수정/삭제 권한**: 역할별로 상이 (권한 매트릭스 참고)

### 1.4 데이터 격리 원칙

**중요:** 모든 API 응답에서 Reseller는 자사 데이터만 접근 가능합니다.

**백엔드 필수 구현사항:**
1. **인증 확인**: JWT 토큰에서 `user.resellerId` 추출
2. **자동 필터링**: 모든 쿼리에 `WHERE resellerId = {user.resellerId}` 조건 강제 적용
3. **권한 검증**: Reseller 역할 사용자만 접근 허용
4. **데이터 격리**:
   - Direct 데이터 (`resellerId === null`) 절대 노출 금지
   - 다른 Reseller 데이터 절대 노출 금지

**필터링 예시:**
- **고객(Customer)**: `WHERE resellerId = {user.resellerId}`
- **계약(Contract)**: `WHERE resellerId = {user.resellerId}`
- **결제(Payment)**: `WHERE resellerId = {user.resellerId}`

---

## 2. Reseller Dashboard

**경로:** `/dashboard`
**접근 권한:** `reseller_admin`, `reseller_editor`, `reseller_viewer`

### 📐 페이지 구조

#### 섹션 1: 페이지 헤더
**기능:**
- 대시보드 제목 표시 ("Dashboard")

**조건/규칙:**
- 항상 표시

---

#### 섹션 2: 통계 카드 (4개)
**기능:**
- Total Customers, Active Contracts, Monthly Settlement, Monthly Expirations 통계 표시
- 각 카드마다 전월 대비 변화 표시

**인터랙션:**
- 카드 클릭: 없음 (정적 표시)

**조건/규칙:**
- **Total Customers**: 자사 고객 수 (`resellerId` 일치)
- **Active Contracts**: 자사 활성 계약 수 (status === 'active')
- **Monthly Settlement**: 이번 달 예상 정산 금액 (자사 계약 합산)
- **Monthly Expirations**: 이번 달 만료 예정 계약 수

**데이터 요구사항:**

**API Endpoint:** `GET /api/reseller/dashboard`

**자동 필터링:** `resellerId === user.resellerId`

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| totalCustomers | number | 자사 고객 수 |
| totalCustomersChange | number | 전월 대비 변화 |
| totalCustomersChangeType | 'increase' \| 'decrease' | 증가/감소 |
| activeContracts | number | 자사 활성 계약 수 |
| activeContractsChange | number | 전월 대비 변화 |
| activeContractsChangeType | 'increase' \| 'decrease' | 증가/감소 |
| monthlySettlement | number | 이번 달 예상 정산 금액 (USD) |
| monthlySettlementChange | number | 전월 대비 변화율 (%) |
| monthlySettlementChangeType | 'increase' \| 'decrease' | 증가/감소 |
| monthlyExpirations | number | 이번 달 만료 예정 계약 수 |
| monthlyExpirationsChange | number | 전월 대비 변화 |
| monthlyExpirationsChangeType | 'increase' \| 'decrease' | 증가/감소 |

---

#### 섹션 3: Next Settlement Notice
**기능:**
- 다음 정산 금액 및 정산일 표시
- 안내 메시지: "Your next settlement is scheduled."

**표시 정보:**
- Settlement Amount (USD)
- Due Date (예: "November 5, 2025")

**인터랙션:**
- 없음 (정적 표시)

**조건/규칙:**
- 항상 표시

**데이터 요구사항:**

**API Endpoint:** `GET /api/reseller/next-settlement`

**자동 필터링:** `resellerId === user.resellerId`

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| amount | number | 정산 금액 (USD) |
| dueDate | string | 정산 예정일 (예: "November 5, 2025") |

---

#### 섹션 4: Expiring Contracts 목록
**기능:**
- 만료 임박 계약 목록 표시 (최대 5개)
- 각 행: 고객명, 이메일, 남은 일수

**인터랙션:**
- 행 클릭: Customer Detail 페이지로 이동

**조건/규칙:**
- **표시 조건**: 만료일까지 남은 일수 <= 30일 AND `resellerId === user.resellerId`
- **정렬**: 남은 일수 오름차순
- **최대 표시**: 5개
- **남은 일수 색상**:
  - 10일 이하: 빨간색
  - 30일 이하: 주황색

**데이터 요구사항:**

**API Endpoint:** `GET /api/reseller/expiring-contracts`

**자동 필터링:** `resellerId === user.resellerId`

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| limit | number | 최대 개수 (기본: 5) |

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 계약 ID |
| customerId | string | 고객 ID |
| customerName | string | 고객명 |
| email | string | 고객 이메일 |
| daysLeft | number | 남은 일수 |

---

#### 섹션 5: New Customers 목록
**기능:**
- 신규 고객 목록 표시 (최대 5개)
- 각 행: 고객명, 이메일

**인터랙션:**
- 행 클릭: Customer Detail 페이지로 이동

**조건/규칙:**
- **표시 조건**: 생성일로부터 7일 이내 AND `resellerId === user.resellerId`
- **정렬**: 최신 순 (createdAt desc)
- **최대 표시**: 5개

**데이터 요구사항:**

**API Endpoint:** `GET /api/reseller/new-customers`

**자동 필터링:** `resellerId === user.resellerId`

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| limit | number | 최대 개수 (기본: 5) |

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 고객 ID |
| name | string | 고객명 |
| email | string | 고객 이메일 |

---

### 🔄 페이지 네비게이션

| 출발지 | 목적지 | 조건 |
|--------|--------|------|
| Expiring Contracts 행 클릭 | `/customers/{customerId}` | - |
| New Customers 행 클릭 | `/customers/{customerId}` | - |

---

### 🎯 Detailed Button Actions & Interactions (Reseller Dashboard)

#### Statistics Cards
- **Type**: Read-only display cards
- **Action**: None (purely informational)
- **Refresh**: Automatically on page load
- **API Call**: `GET /api/reseller/dashboard` (fetches all stats together)
- **Data Scope**: Only data where `resellerId === user.resellerId`

#### Expiring Contracts Row Click
- **Action**: Navigates to Customer Detail page
- **Target**: `/customers/{customerId}`
- **Purpose**: View customer details to prepare for contract renewal
- **Data Scope**: Only contracts belonging to this reseller

#### New Customers Row Click
- **Action**: Navigates to Customer Detail page
- **Target**: `/customers/{customerId}`
- **Purpose**: View newly added customer details

---

### 🔄 State Management (Reseller Dashboard)

```typescript
// Statistics
const [stats, setStats] = useState({
  totalCustomers: 0,
  totalCustomersChange: 0,
  totalCustomersChangeType: 'increase' as 'increase' | 'decrease',
  activeContracts: 0,
  activeContractsChange: 0,
  activeContractsChangeType: 'increase' as 'increase' | 'decrease',
  monthlySettlement: 0,
  monthlySettlementChange: 0,
  monthlySettlementChangeType: 'increase' as 'increase' | 'decrease',
  monthlyExpirations: 0,
  monthlyExpirationsChange: 0,
  monthlyExpirationsChangeType: 'increase' as 'increase' | 'decrease',
});

// Next Settlement
const [nextSettlement, setNextSettlement] = useState({
  amount: 0,
  dueDate: '',
});

// Lists
const [expiringContracts, setExpiringContracts] = useState<Contract[]>([]);
const [newCustomers, setNewCustomers] = useState<Customer[]>([]);
```

**State Update Patterns:**
1. **Page Load**: Fetch dashboard data → Update all stats and lists
2. **No user interactions**: Dashboard is read-only for resellers

---

### 🎨 Conditional Rendering (Reseller Dashboard)

| Element | Condition | Display |
|---------|-----------|---------|
| Statistics Cards | Always | Visible |
| Next Settlement Notice | Always | Visible |
| Expiring Contracts Section | `expiringContracts.length > 0` | Visible |
| New Customers Section | `newCustomers.length > 0` | Visible |
| Empty State (Expiring) | `expiringContracts.length === 0` | Show "No expiring contracts" |
| Empty State (New Customers) | `newCustomers.length === 0` | Show "No new customers" |
| Days Left Color (Expiring) | `daysLeft <= 10`: red, `<= 30`: orange, else: default | Text color |
| Trend Arrows | Always | Up/Down arrows with % or count |

---

### 🚨 Error Handling (Reseller Dashboard)

**Dashboard Load Failed:**
- Show error message in page center
- Provide "Retry" button
- Log error for debugging

**Empty States:**
- Expiring Contracts: "No contracts expiring soon"
- New Customers: "No new customers this week"

---

### 📊 Data Flow (Reseller Dashboard)

**Page Load Flow:**
```
1. Component mounts
2. Parallel API Calls:
   - GET /api/reseller/dashboard (stats)
   - GET /api/reseller/next-settlement
   - GET /api/reseller/expiring-contracts?limit=5
   - GET /api/reseller/new-customers?limit=5
3. All APIs automatically filter by resellerId
4. Update all state
5. Render sections
```

**Navigation Flows:**
- Expiring Contract row → `/customers/{customerId}`
- New Customer row → `/customers/{customerId}`

---

## 3. My Payments Page

**경로:** `/my-payments`
**접근 권한:** `reseller_admin`, `reseller_editor`, `reseller_viewer`

### 📐 페이지 구조

#### 섹션 1: 페이지 헤더
**기능:**
- "My Payments" 제목 표시

**조건/규칙:**
- 항상 표시

---

#### 섹션 2: Payment Notice 알림
**기능:**
- 결제 안내 메시지 표시
- Contact 정보 표시: sales@wondermove.com
- 이메일 아이콘 버튼

**인터랙션:**
- 이메일 아이콘 버튼 클릭: sales@wondermove.com으로 메일 클라이언트 열기

**조건/규칙:**
- 항상 표시

**표시 메시지:**
- EN: "For any payment inquiries, please contact our sales team."
- KO: "결제 관련 문의사항은 영업팀에 문의해주세요."

---

#### 섹션 3: 검색 및 필터 바
**기능:**
- 검색: Period, Date, 금액으로 검색
- Filter 버튼: Status, Period Range 필터 다이얼로그 열기
- Export to Excel: 필터링된 결제 목록 엑셀 다운로드

**인터랙션:**
- 검색 입력: 실시간 필터링
- Filter 버튼 클릭: Filter Dialog 열기
- Export to Excel 클릭: 엑셀 다운로드

**조건/규칙:**
- **Filter 버튼**: 필터 적용 시 배지 표시 (필터 개수)
- **Export to Excel**: 모든 역할 표시

---

#### 섹션 4: 결제 테이블
**기능:**
- 자사 결제 내역 표시
- 컬럼: Period, Date, Billed Amount, Paid Amount, Difference, Status
- 정렬: 모든 컬럼 클릭 시 정렬 토글
- 페이지네이션

**인터랙션:**
- 정렬 아이콘 클릭: 정렬 토글
- 페이지네이션: 페이지 변경

**조건/규칙:**
- **데이터 범위**: `resellerId === user.resellerId`만 표시
- **Status 배지**:
  - Paid: 초록색
  - Pending: 회색
  - Partial: 주황색
  - Unpaid: 빨간색
- **Difference > 0**: 빨간색 표시
- **Empty State**: 결제 없을 때 "No results found" 메시지

**데이터 요구사항:**

**API Endpoint:** `GET /api/reseller/payments`

**자동 필터링:** `resellerId === user.resellerId`

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| search | string | 검색어 (period, date, 금액) |
| status | string | Status 필터 (all, paid, pending, partial, unpaid) |
| periodFrom | string | 시작 기간 (YYYY. MM) |
| periodTo | string | 종료 기간 (YYYY. MM) |
| sortBy | string | 정렬 기준 (period, date, billedAmount, paidAmount, difference) |
| sortOrder | 'asc' \| 'desc' | 정렬 순서 |
| page | number | 페이지 번호 |
| limit | number | 페이지당 행 수 (5, 10, 20, 50) |

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 결제 ID |
| resellerId | string | Reseller ID (백엔드 필터링용, 프론트엔드 미사용) |
| period | string | 청구 기간 (예: "2025. 10") |
| date | string | 청구일 (MM. DD) |
| billedAmount | number | 청구 금액 (USD) |
| paidAmount | number | 납부 금액 (USD) |
| difference | number | 차액 (USD) |
| status | 'paid' \| 'pending' \| 'partial' \| 'unpaid' | 결제 상태 |

---

### 📊 Filter Dialog

**트리거:** Filter 버튼 클릭

#### 다이얼로그 구조

**섹션 1: 제목**
- "Filter"

**섹션 2: 필터 옵션**
- Status: All, Paid, Pending, Partial, Unpaid
- Period From: 드롭다운 (YYYY. MM 형식)
- Period To: 드롭다운 (YYYY. MM 형식)

**인터랙션:**
- 드롭다운 선택: 필터 값 선택
- Period From/To 옆 X 버튼: 해당 필터 초기화
- Reset 버튼: 모든 필터 초기화
- Cancel 버튼: 다이얼로그 닫기
- Apply 버튼: 필터 적용

**조건/규칙:**
- **Period From/To**: 기간 선택 시 "Clear" 버튼 표시
- **Apply 버튼**: 항상 활성화

---

### 💾 데이터 보안

**중요:** My Payments 페이지는 Reseller 사용자가 자사 결제 정보만 조회하는 페이지입니다.

**백엔드 필수 구현사항:**
1. **인증 확인**: JWT 토큰에서 `user.resellerId` 추출
2. **자동 필터링**: 모든 쿼리에 `WHERE resellerId = {user.resellerId}` 조건 강제 적용
3. **권한 검증**: Reseller 역할 사용자만 접근 허용
4. **데이터 격리**: 다른 Reseller 데이터 절대 노출 금지

---

### 🔄 페이지 네비게이션

| 출발지 | 목적지 | 조건 |
|--------|--------|------|
| 없음 | - | 이 페이지는 단독 페이지 |

---

### 🎯 Detailed Button Actions & Interactions (My Payments Page)

#### Contact Sales Email Button
- **Icon**: Mail icon
- **Action**: Opens default email client with `mailto:sales@wondermove.com`
- **Subject**: Auto-populated with "Payment Inquiry from [Reseller Name]"
- **Visibility**: All roles

#### Search Input
- **Trigger**: onChange (real-time)
- **Search Fields**: period, date, billedAmount, paidAmount
- **Logic**: Client-side filtering with OR condition
- **Debounce**: None (instant filtering)

#### Filter Button
- **Action**: Opens PaymentFilterDialog
- **Filter Options**:
  - Status: All, Paid, Pending, Partial, Unpaid
  - Period Range: From (YYYY. MM) - To (YYYY. MM)
- **Validation**: From date must be ≤ To date
- **Apply**: Filters table, shows badge with filter count
- **Reset**: Clears all filters, hides badge

#### Export to Excel
- **Visibility**: All roles (reseller_admin, reseller_editor, reseller_viewer)
- **Action**: Downloads filtered payments as .xlsx
- **Filename**: `my_payments_YYYY-MM-DD.xlsx`
- **Includes**: All visible rows after filters
- **Columns**: Period, Date, Billed Amount, Paid Amount, Difference, Status

#### Sort Headers
- **Sortable Columns**: Period, Date, Billed Amount, Paid Amount, Difference
- **Click Action**: Toggle sort direction (asc → desc → none)
- **Visual**: Arrow icon shows direction
- **Client-side**: Sorts locally without API call

#### Pagination Controls
- **Rows Per Page**: 5, 10, 20, 50 (default: 20)
- **Buttons**: First, Previous, Page X of Y, Next, Last
- **Behavior**: Same as WM Payments Page

---

### 🔄 State Management (My Payments Page)

```typescript
// Search & Filter
const [searchQuery, setSearchQuery] = useState('');
const [filterStatus, setFilterStatus] = useState<string>('all');
const [filterPeriodFrom, setFilterPeriodFrom] = useState<string | null>(null);
const [filterPeriodTo, setFilterPeriodTo] = useState<string | null>(null);
const [appliedFilters, setAppliedFilters] = useState({
  status: 'all',
  periodFrom: null as string | null,
  periodTo: null as string | null,
});

// Table
const [payments, setPayments] = useState<Payment[]>([]);
const [currentPage, setCurrentPage] = useState(1);
const [rowsPerPage, setRowsPerPage] = useState(20);
const [sortColumn, setSortColumn] = useState<string | null>(null);
const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
```

**State Update Patterns:**
1. **Search**: Updates `searchQuery` → triggers client-side filter
2. **Filter Apply**: Copies filter selections to `appliedFilters` → triggers filter
3. **Sort**: Updates `sortColumn` and `sortDirection` → triggers sort
4. **Pagination**: Updates `currentPage` or `rowsPerPage` → re-renders table slice

---

### 🎨 Conditional Rendering (My Payments Page)

| Element | Condition | Display |
|---------|-----------|---------|
| Filter Badge | `appliedFilters.status !== 'all' \|\| appliedFilters.periodFrom !== null` | Show count |
| Empty State | `filteredPayments.length === 0` | Show "No results found" |
| Difference (red) | `difference > 0` | Text color red |
| Status Badge Color | `paid`: green, `pending`: gray, `partial`: orange, `unpaid`: red | Badge color |
| Pagination | `totalPages > 1` | Visible |

---

### 🚨 Error Handling (My Payments Page)

**Period Range Validation (Filter):**
- Red border on both dropdowns
- Error message: "From period must be earlier than or equal to To period"
- Disable Apply button

**Network Error (Load Failed):**
- Show error message in page center
- Provide "Retry" button
- Log error for debugging

**Empty State:**
- Message: "No results found"
- Sub-message: "Try adjusting your filters or search query"

---

### 📊 Data Flow (My Payments Page)

**Page Load Flow:**
```
1. Component mounts
2. API Call: GET /api/reseller/payments?page=1&limit=20
3. Backend filters: WHERE resellerId = user.resellerId
4. Response: { payments: [], total: 0, page: 1, limit: 20 }
5. Set payments state
6. Render table
```

**Filter Flow:**
```
1. User clicks Filter button
2. PaymentFilterDialog opens with current filters
3. User selects status and/or period range
4. User clicks "Apply":
   - Validate period range (from <= to)
   - If valid:
     - Copy filter values to appliedFilters
     - Close dialog
     - Filter table client-side
     - Show badge with filter count
     - Reset pagination to page 1
   - If invalid:
     - Show error message
     - Disable Apply button
5. User clicks "Reset":
   - Clear all filters
   - Hide badge
   - Show all payments
```

**Search Flow:**
```
1. User types in search input
2. Update searchQuery state (onChange)
3. Filter payments locally:
   - Match period OR date OR billedAmount OR paidAmount
   - Case-insensitive partial match
4. Reset pagination to page 1
5. Re-render filtered results
```

**Export to Excel Flow:**
```
1. User clicks "Export to Excel"
2. Gather all filtered and searched payments
3. Convert to Excel format with columns
4. Trigger download: my_payments_2025-01-16.xlsx
5. Show toast: "Exported successfully"
```

---

## 4. Contracts Page

**경로:** `/contracts`
**접근 권한:** `reseller_admin`, `reseller_editor`, `reseller_viewer`

### 📐 페이지 구조

#### 섹션 1: 페이지 헤더
**기능:**
- "Contracts" 제목 표시
- "+ Create Contract" 버튼

**인터랙션:**
- "+ Create Contract" 버튼 클릭: Create Contract Dialog 열기

**조건/규칙:**
- **Create Contract 버튼**:
  - `reseller_admin`: 표시
  - `reseller_editor`: 표시
  - `reseller_viewer`: 숨김

---

#### 섹션 2: Status Tabs
**기능:**
- 계약 상태별 탭 (All, Pending, Approved, Rejected)
- 각 탭 옆 계약 수 표시

**인터랙션:**
- 탭 클릭: 해당 상태의 계약 목록 표시

**조건/규칙:**
- **데이터 범위**: `resellerId === user.resellerId`만 카운트
- **Status 정의**:
  - All: 모든 계약
  - Pending: Approval Pending 계약
  - Approved: Active, Expiring Soon, Expired 계약
  - Rejected: Rejected 계약

**데이터 요구사항:**

**API Endpoint:** `GET /api/reseller/contracts/count`

**자동 필터링:** `resellerId === user.resellerId`

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| all | number | 전체 계약 수 |
| pending | number | Approval Pending 계약 수 |
| approved | number | Active + Expiring Soon + Expired 계약 수 |
| rejected | number | Rejected 계약 수 |

---

#### 섹션 3: 검색 및 필터 바
**기능:**
- 검색: 고객명, 이메일, 계약 ID 검색
- Filter 버튼: Status, Pricing Model, Contract Type, Period Range 필터 다이얼로그 열기
- Export to Excel: 필터링된 계약 목록 엑셀 다운로드

**인터랙션:**
- 검색 입력: 실시간 필터링
- Filter 버튼 클릭: Filter Dialog 열기
- Export to Excel 클릭: 엑셀 다운로드

**조건/규칙:**
- **Filter 버튼**: 필터 적용 시 배지 표시 (필터 개수)
- **Export to Excel**: 모든 역할 표시

---

#### 섹션 4: 계약 테이블
**기능:**
- 자사 계약 목록 표시
- 컬럼: Customer Name, Email, Contract ID, Amount, Period, Status
- 정렬: 모든 컬럼 클릭 시 정렬 토글
- 페이지네이션

**인터랙션:**
- 행 클릭: Contract Detail 페이지로 이동 (`/contracts/{contractId}`)
- 정렬 아이콘 클릭: 정렬 토글
- 페이지네이션: 페이지 변경

**조건/규칙:**
- **데이터 범위**: `resellerId === user.resellerId`만 표시
- **Amount 표시**:
  - Fixed Rate: "$XX,XXX/month"
  - Pay-as-you-go: "Pay-as-you-go"
  - Trial: "Free"
- **Status 배지**:
  - Active: 초록색
  - Expiring Soon: 주황색
  - Expired: 회색
  - Approval Pending: 파란색
  - Rejected: 빨간색
- **Empty State**: 계약 없을 때 "No results found" 메시지

**데이터 요구사항:**

**API Endpoint:** `GET /api/reseller/contracts`

**자동 필터링:** `resellerId === user.resellerId`

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| search | string | 검색어 (고객명, 이메일, 계약 ID) |
| tab | 'all' \| 'pending' \| 'approved' \| 'rejected' | Status 탭 |
| status | string | Status 필터 (all, active, expiring_soon, expired, approval_pending, rejected) |
| pricingModel | string | Pricing Model 필터 (all, fixed_rate, payg, trial) |
| contractType | string | Contract Type 필터 (all, new, renewal, upgrade) |
| periodFrom | string | 시작 기간 (YYYY-MM-DD) |
| periodTo | string | 종료 기간 (YYYY-MM-DD) |
| sortBy | string | 정렬 기준 (customerName, email, contractId, amount, period, status) |
| sortOrder | 'asc' \| 'desc' | 정렬 순서 |
| page | number | 페이지 번호 |
| limit | number | 페이지당 행 수 (5, 10, 20, 50) |

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 계약 ID |
| customerId | string | 고객 ID |
| customerName | string | 고객명 |
| email | string | 고객 이메일 |
| contractId | string | 계약 ID (표시용) |
| amount | string | 금액 표시 (예: "$2,000/month", "Pay-as-you-go", "Free") |
| period | string | 계약 기간 (예: "2025.11.01 - 2026.11.01 (1 year)") |
| status | 'active' \| 'expiring_soon' \| 'expired' \| 'approval_pending' \| 'rejected' | 계약 상태 |

---

### 📊 Filter Dialog

**트리거:** Filter 버튼 클릭

#### 다이얼로그 구조

**섹션 1: 제목**
- "Filter"

**섹션 2: 필터 옵션**
- Status: All, Active, Expiring Soon, Expired, Approval Pending, Rejected
- Pricing Model: All, Fixed Rate, Pay-as-you-go, Trial
- Contract Type: All, New, Renewal, Upgrade
- Period From: 날짜 선택기
- Period To: 날짜 선택기

**인터랙션:**
- 드롭다운 선택: 필터 값 선택
- 날짜 선택기: 기간 선택
- Reset 버튼: 모든 필터 초기화
- Cancel 버튼: 다이얼로그 닫기
- Apply 버튼: 필터 적용

**조건/규칙:**
- **Apply 버튼**: 항상 활성화

---

### ➕ Create Contract Dialog

**트리거:** "+ Create Contract" 버튼 클릭

**접근 권한:** `reseller_admin`, `reseller_editor`

#### 다이얼로그 구조

**섹션 1: 제목**
- "Create Contract"

**섹션 2: 입력 필드**

**1단계: Customer Selection**
- Customer: 드롭다운 (자사 고객 목록)
  - **데이터 범위**: `resellerId === user.resellerId`
  - **API**: `GET /api/reseller/customers?status=active`

**2단계: Contract Details**
- Contract Type: New, Renewal, Upgrade
- Pricing Model: Fixed Rate, Pay-as-you-go, Trial
- Start Date: 날짜 선택기
- End Date: 날짜 선택기

**3단계: Pricing Details (조건부)**
- **고정 요금:**
  - Monthly Fee (USD): 숫자 입력
  - vCPU Allocation: 숫자 입력
- **종량제:**
  - Price per vCPU (USD): 숫자 입력
- **평가판:**
  - Trial Allocation (vCPU): 숫자 입력

**4단계: Billing Information**
- Billing Email(s): 이메일 주소 (여러 개 입력 가능, 콤마로 구분)

**인터랙션:**
- Next 버튼: 다음 단계로 이동
- Back 버튼: 이전 단계로 이동
- Cancel 버튼: 다이얼로그 닫기
- Create 버튼: 계약 생성

**조건/규칙:**
- **유효성 검증**:
  - 모든 필수 필드 입력 필요
  - End Date > Start Date
  - 이메일 형식 검증
- **Create 버튼**: 모든 필드 유효할 때만 활성화

**데이터 요구사항:**

**API Endpoint:** `POST /api/reseller/contracts`

**자동 필드 추가:** `resellerId = user.resellerId`

**요청 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| customerId | string | 고객 ID |
| contractType | 'new' \| 'renewal' \| 'upgrade' | 계약 유형 |
| pricingModel | 'fixed_rate' \| 'payg' \| 'trial' | 가격 모델 |
| startDate | string | 시작일 (YYYY-MM-DD) |
| endDate | string | 종료일 (YYYY-MM-DD) |
| billingInfo | object | 가격 모델별 청구 정보 |
| billingEmails | string[] | 청구 이메일 목록 |

**billingInfo 구조 (가격 모델별):**

**고정 요금:**
```typescript
{
  type: 'Fixed Rate',
  monthlyFee: number,
  vcpuAllocation: number
}
```

**종량제:**
```typescript
{
  type: 'Pay-as-you-go',
  pricePerVcpu: number
}
```

**평가판:**
```typescript
{
  type: 'Trial',
  trialAllocation: number
}
```

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 생성된 계약 ID |
| status | string | 계약 상태 (자동으로 'approval_pending' 설정) |

**성공 시:**
- 다이얼로그 닫기
- 계약 목록 새로고침
- 성공 토스트 메시지: "Contract created successfully and sent for approval."

---

### 🔄 페이지 네비게이션

| 출발지 | 목적지 | 조건 |
|--------|--------|------|
| 계약 테이블 행 클릭 | `/contracts/{contractId}` | - |

---

### 🎯 Detailed Button Actions & Interactions (Contracts Page)

#### Create Contract Button
- **Visibility**: reseller_admin, reseller_editor only
- **Action**: Opens Create Contract Dialog (4-step wizard)
- **Step 1**: Select customer from dropdown (only reseller's customers)
- **Step 2**: Choose contract type, pricing model, dates
- **Step 3**: Enter pricing details (based on model selected)
- **Step 4**: Add billing emails
- **Submit**: POST /api/reseller/contracts → status: "approval_pending"
- **Toast**: "Contract created successfully and sent for approval"

#### Status Tabs
- **Tabs**: All, Pending, Approved, Rejected
- **Badge**: Shows count for each tab
- **Click Action**: Filters contracts by approval status
- **Visual**: Selected tab shows underline indicator
- **Client-side**: Filters locally without API call

#### Search Input
- **Trigger**: onChange (real-time)
- **Search Fields**: customerName, email, contractId
- **Logic**: Client-side filtering with OR condition

#### Filter Button
- **Action**: Opens ContractFilterDialog
- **Filter Options**:
  - Status, Pricing Model, Contract Type, Period Range
- **Apply**: Filters table, shows badge
- **Reset**: Clears filters

#### Export to Excel
- **Visibility**: All roles
- **Action**: Downloads filtered contracts as .xlsx
- **Filename**: `contracts_YYYY-MM-DD.xlsx`

#### Table Row Click
- **Action**: Navigates to Contract Detail page
- **Target**: `/contracts/{contractId}`
- **Data Scope**: Only reseller's own contracts

#### Sort Headers
- **Sortable Columns**: Customer Name, Email, Contract ID, Amount, Period, Status
- **Click Action**: Toggle sort direction
- **Client-side**: Sorts locally

---

### 🔄 State Management (Contracts Page)

```typescript
// Search & Filter
const [searchQuery, setSearchQuery] = useState('');
const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
const [appliedFilters, setAppliedFilters] = useState({
  status: 'all',
  pricingModel: 'all',
  contractType: 'all',
  periodFrom: null,
  periodTo: null,
});

// Table
const [contracts, setContracts] = useState<Contract[]>([]);
const [tabCounts, setTabCounts] = useState({
  all: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
});
const [currentPage, setCurrentPage] = useState(1);
const [rowsPerPage, setRowsPerPage] = useState(20);
const [sortColumn, setSortColumn] = useState<string | null>(null);
const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

// Modal
const [createContractOpen, setCreateContractOpen] = useState(false);
```

---

### 🎨 Conditional Rendering (Contracts Page)

| Element | Condition | Display |
|---------|-----------|---------|
| Create Contract Button | `user.role !== 'reseller_viewer'` | Visible |
| Tab Badges | Always | Show count |
| Filter Badge | `hasActiveFilters` | Show count |
| Empty State | `filteredContracts.length === 0` | Show message |
| Status Badge Color | `active`: green, `pending`: blue, `rejected`: red, etc. | Badge color |
| Amount Display | `pricingModel`: different formats | Conditional text |

---

### 📊 Data Flow (Contracts Page)

**Page Load Flow:**
```
1. Component mounts
2. Parallel API Calls:
   - GET /api/reseller/contracts?page=1&limit=20
   - GET /api/reseller/contracts/count
3. Backend filters: WHERE resellerId = user.resellerId
4. Update contracts and tabCounts state
5. Render table
```

**Create Contract Flow:**
```
1. User clicks "Create Contract"
2. Dialog opens (4-step wizard)
3. Step 1: Select customer (from reseller's customers)
4. Step 2: Enter contract details
5. Step 3: Enter pricing details
6. Step 4: Add billing emails
7. On submit:
   - Validate all fields
   - POST /api/reseller/contracts
   - Backend sets: resellerId, status: 'approval_pending'
   - Close dialog
   - Refresh contracts list
   - Show toast: "Contract created and sent for approval"
```

---

## 5. Contract Detail Page

**경로:** `/contracts/{contractId}`
**접근 권한:** `reseller_admin`, `reseller_editor`, `reseller_viewer`

### 📐 페이지 구조

#### 섹션 1: 페이지 헤더
**기능:**
- 뒤로가기 버튼
- "Contract Details" 제목
- Status 배지
- Edit 버튼

**인터랙션:**
- 뒤로가기 버튼 클릭: `/contracts` 페이지로 이동
- Edit 버튼 클릭: Edit Contract Dialog 열기

**조건/규칙:**
- **데이터 범위**: `resellerId === user.resellerId`인 계약만 접근 가능
- **Status 배지**:
  - Active: 초록색
  - Expiring Soon: 주황색
  - Expired: 회색
  - Approval Pending: 파란색
  - Rejected: 빨간색
- **Edit 버튼**:
  - `reseller_admin`: 모든 상태에서 표시
  - `reseller_editor`: 모든 상태에서 표시
  - `reseller_viewer`: 숨김
  - **Approval Pending**: Edit 버튼 비활성화 (승인 대기 중에는 수정 불가)
  - **Rejected**: Edit 버튼 활성화 (재제출 가능)

**데이터 요구사항:**

**API Endpoint:** `GET /api/reseller/contracts/{contractId}`

**자동 필터링:** `resellerId === user.resellerId`

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 계약 ID |
| customerId | string | 고객 ID |
| customerName | string | 고객명 |
| email | string | 고객 이메일 |
| contractType | 'new' \| 'renewal' \| 'upgrade' | 계약 유형 |
| pricingModel | 'fixed_rate' \| 'payg' \| 'trial' | 가격 모델 |
| status | 'active' \| 'expiring_soon' \| 'expired' \| 'approval_pending' \| 'rejected' | 계약 상태 |
| startDate | string | 시작일 (YYYY-MM-DD) |
| endDate | string | 종료일 (YYYY-MM-DD) |
| billingInfo | object | 청구 정보 |
| createdAt | string | 생성일 (YYYY-MM-DD) |
| approvedAt | string \| null | 승인일 (YYYY-MM-DD) |
| rejectedAt | string \| null | 거절일 (YYYY-MM-DD) |
| rejectionReason | string \| null | 거절 사유 |

---

#### 섹션 2: Contract Information
**기능:**
- 계약 기본 정보 표시

**표시 정보:**
- Customer Name: 고객명
- Email: 고객 이메일
- Contract Type: New, Renewal, Upgrade
- Pricing Model: Fixed Rate, Pay-as-you-go, Trial
- Contract Period: "YYYY.MM.DD - YYYY.MM.DD (X year/month)"
- Created Date: "YYYY.MM.DD"

**조건/규칙:**
- **Contract Type 배지**:
  - New: 파란색
  - Renewal: 초록색
  - Upgrade: 보라색
- **Pricing Model 배지**:
  - Fixed Rate: 파란색
  - Pay-as-you-go: 주황색
  - Trial: 회색

---

#### 섹션 3: Billing Information
**기능:**
- 가격 모델별 청구 정보 표시

**표시 정보 (Fixed Rate):**
- Monthly Fee: "$X,XXX"
- vCPU Allocation: "XX vCPU"
- Billing Emails: 이메일 목록

**표시 정보 (Pay-as-you-go):**
- Price per vCPU: "$X.XX"
- Billing Emails: 이메일 목록

**표시 정보 (Trial):**
- Trial Allocation: "XX vCPU"
- Trial Period: "YYYY.MM.DD - YYYY.MM.DD (X month)"
- Note: "Free trial period. No charges will apply during this period."
- Billing Emails: 이메일 목록

**조건/규칙:**
- **Billing Emails**: 여러 개일 경우 콤마로 구분하여 표시

---

#### 섹션 4: Approval Information (조건부)
**기능:**
- 승인/거절 정보 표시

**표시 조건:**
- Status가 'approved', 'active', 'expiring_soon', 'expired'인 경우 승인 정보 표시
- Status가 'rejected'인 경우 거절 정보 표시

**표시 정보 (승인됨):**
- Approved Date: "YYYY.MM.DD"

**표시 정보 (거절됨):**
- Rejected Date: "YYYY.MM.DD"
- Rejection Reason: 거절 사유

**조건/규칙:**
- **Rejection Reason**: 빨간색 배경의 경고 박스로 표시

---

### ✏️ Edit Contract Dialog

**트리거:** Edit 버튼 클릭

**접근 권한:** `reseller_admin`, `reseller_editor`

#### 다이얼로그 구조

**섹션 1: 제목**
- "Edit Contract"

**섹션 2: 입력 필드**

**기본 정보 (읽기 전용):**
- Customer: 고객명 (변경 불가)
- Contract Type: New, Renewal, Upgrade (변경 불가)

**수정 가능 정보:**
- Pricing Model: Fixed Rate, Pay-as-you-go, Trial
- Start Date: 날짜 선택기
- End Date: 날짜 선택기

**Pricing Details (조건부):**
- **고정 요금:**
  - Monthly Fee (USD): 숫자 입력
  - vCPU Allocation: 숫자 입력
- **종량제:**
  - Price per vCPU (USD): 숫자 입력
- **평가판:**
  - Trial Allocation (vCPU): 숫자 입력

**Billing Information:**
- Billing Email(s): 이메일 주소 (여러 개 입력 가능, 콤마로 구분)

**인터랙션:**
- Cancel 버튼: 다이얼로그 닫기
- Save 버튼: 변경사항 저장

**조건/규칙:**
- **유효성 검증**:
  - 모든 필수 필드 입력 필요
  - End Date > Start Date
  - 이메일 형식 검증
- **Save 버튼**: 모든 필드 유효할 때만 활성화
- **Approval Pending 상태**: 수정 불가 (Edit 버튼 비활성화)
- **Rejected 상태**: 수정 후 다시 승인 요청 (status를 'approval_pending'으로 변경)

**데이터 요구사항:**

**API Endpoint:** `PUT /api/reseller/contracts/{contractId}`

**자동 필터링:** `resellerId === user.resellerId`

**요청 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| pricingModel | 'fixed_rate' \| 'payg' \| 'trial' | 가격 모델 |
| startDate | string | 시작일 (YYYY-MM-DD) |
| endDate | string | 종료일 (YYYY-MM-DD) |
| billingInfo | object | 가격 모델별 청구 정보 |
| billingEmails | string[] | 청구 이메일 목록 |

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 계약 ID |
| status | string | 업데이트된 계약 상태 |

**성공 시:**
- 다이얼로그 닫기
- 계약 상세 페이지 새로고침
- 성공 토스트 메시지:
  - Rejected → Approval Pending: "Contract updated and re-submitted for approval."
  - 기타: "Contract updated successfully."

---

### 🔄 페이지 네비게이션

| 출발지 | 목적지 | 조건 |
|--------|--------|------|
| 뒤로가기 버튼 클릭 | `/contracts` | - |

---

## 6. Settings Page

**경로:** `/settings`
**접근 권한:** `reseller_admin`, `reseller_editor`, `reseller_viewer`

### 📐 페이지 구조

#### 섹션 1: 페이지 헤더
**기능:**
- "Settings" 제목 표시
- "+ Create Account" 버튼

**인터랙션:**
- "+ Create Account" 버튼 클릭: Create Account Dialog 열기

**조건/규칙:**
- **Create Account 버튼**:
  - `reseller_admin`: 표시
  - `reseller_editor`: 숨김
  - `reseller_viewer`: 숨김

---

#### 섹션 2: Organization Accounts 테이블
**기능:**
- 자사 조직 계정 목록 표시
- 컬럼: Name, Email, Role
- 각 행 우측에 Edit 버튼

**인터랙션:**
- Edit 버튼 클릭: Edit Account Dialog 열기

**조건/규칙:**
- **데이터 범위**: `resellerId === user.resellerId` AND `role LIKE 'reseller_%'`
- **Role 배지**:
  - reseller_admin: 보라색
  - reseller_editor: 파란색
  - reseller_viewer: 회색
- **Edit 버튼**:
  - `reseller_admin`: 모든 계정에 표시 (자신 포함)
  - `reseller_editor`: 숨김
  - `reseller_viewer`: 숨김
- **자기 자신 계정**: "You" 배지 표시

**데이터 요구사항:**

**API Endpoint:** `GET /api/reseller/settings/accounts`

**자동 필터링:** `resellerId === user.resellerId` AND `role LIKE 'reseller_%'`

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 사용자 ID |
| name | string | 사용자명 |
| email | string | 이메일 |
| role | 'reseller_admin' \| 'reseller_editor' \| 'reseller_viewer' | 역할 |

---

### ➕ Create Account Dialog

**트리거:** "+ Create Account" 버튼 클릭

**접근 권한:** `reseller_admin`

#### 다이얼로그 구조

**섹션 1: 제목**
- "Create Account"

**섹션 2: 입력 필드**
- Email: 이메일 입력
- Role: 드롭다운 (reseller_admin, reseller_editor, reseller_viewer)

**인터랙션:**
- Cancel 버튼: 다이얼로그 닫기
- Send Invite 버튼: 초대 이메일 발송

**조건/규칙:**
- **유효성 검증**:
  - 이메일 형식 검증
  - 이메일 중복 확인
  - Role 선택 필수
- **Send Invite 버튼**: 모든 필드 유효할 때만 활성화

**데이터 요구사항:**

**API Endpoint:** `POST /api/reseller/settings/accounts`

**자동 필드 추가:** `resellerId = user.resellerId`

**요청 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| email | string | 초대할 이메일 |
| role | 'reseller_admin' \| 'reseller_editor' \| 'reseller_viewer' | 역할 |

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 생성된 초대 ID |
| email | string | 초대된 이메일 |
| inviteUrl | string | 초대 URL (이메일로 발송) |

**성공 시:**
- 다이얼로그 닫기
- 성공 토스트 메시지: "Invitation sent successfully to {email}."

---

### ✏️ Edit Account Dialog

**트리거:** Edit 버튼 클릭

**접근 권한:** `reseller_admin`

#### 다이얼로그 구조

**섹션 1: 제목**
- "Edit Account"

**섹션 2: 입력 필드**
- Email: 이메일 (읽기 전용)
- Role: 드롭다운 (reseller_admin, reseller_editor, reseller_viewer)

**섹션 3: 위험 구역 (자기 자신이 아닌 경우만 표시)**
- Delete Account 버튼

**인터랙션:**
- Cancel 버튼: 다이얼로그 닫기
- Save 버튼: 변경사항 저장
- Delete Account 버튼 클릭: Delete Account Confirmation Dialog 열기

**조건/규칙:**
- **Role 변경**: 자기 자신의 역할 변경 가능 (주의 필요)
- **Delete Account 버튼**: 자기 자신 계정은 삭제 불가 (숨김)
- **Save 버튼**: Role이 변경되었을 때만 활성화

**데이터 요구사항:**

**API Endpoint:** `PUT /api/reseller/settings/accounts/{accountId}`

**자동 필터링:** `resellerId === user.resellerId`

**요청 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| role | 'reseller_admin' \| 'reseller_editor' \| 'reseller_viewer' | 역할 |

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 사용자 ID |
| role | string | 업데이트된 역할 |

**성공 시:**
- 다이얼로그 닫기
- 계정 목록 새로고침
- 성공 토스트 메시지: "Account updated successfully."

---

### ❌ Delete Account Confirmation Dialog

**트리거:** Delete Account 버튼 클릭

**접근 권한:** `reseller_admin`

#### 다이얼로그 구조

**섹션 1: 제목**
- "Delete Account"

**섹션 2: 경고 메시지**
- EN: "Are you sure you want to delete this account? This action cannot be undone."
- KO: "이 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."

**섹션 3: 계정 정보**
- Email: {email}
- Role: {role}

**인터랙션:**
- Cancel 버튼: 다이얼로그 닫기
- Delete 버튼: 계정 삭제

**조건/규칙:**
- **Delete 버튼**: 빨간색 강조 표시

**데이터 요구사항:**

**API Endpoint:** `DELETE /api/reseller/settings/accounts/{accountId}`

**자동 필터링:** `resellerId === user.resellerId`

**성공 시:**
- 다이얼로그 닫기
- Edit Account Dialog 닫기
- 계정 목록 새로고침
- 성공 토스트 메시지: "Account deleted successfully."

---

### 🔄 페이지 네비게이션

| 출발지 | 목적지 | 조건 |
|--------|--------|------|
| 없음 | - | 이 페이지는 단독 페이지 |

---

### 🎯 Detailed Button Actions & Interactions (Settings Page)

#### Create Account Button
- **Visibility**: reseller_admin only
- **Action**: Opens Create Account Dialog
- **Form Fields**:
  - Email (required, email format, unique check)
  - Role (required, dropdown: Admin, Editor, Viewer)
- **Submit Flow**:
  1. Validate email and role
  2. POST /api/reseller/settings/accounts
  3. Backend sends invitation email
  4. Response includes invitation status
  5. Close modal
  6. Add new pending account to table
  7. Show toast: "Invitation sent successfully"

#### Edit Button (per account row)
- **Visibility**: reseller_admin only
- **Action**: Opens Edit Account Dialog
- **Editable Fields**:
  - For other accounts: Name, Role
  - For own account: Name only (cannot change own role)
- **Submit**: PUT /api/reseller/settings/accounts/{id}
- **Toast**: "Account updated successfully"

**Business Rules**:
- Admin cannot demote themselves (must have another admin)
- Admin can change other users' roles
- Only admin can edit accounts

#### Delete Account
- **Visibility**: reseller_admin only (in Edit Account Dialog)
- **Condition**: Cannot delete own account
- **Cannot delete last admin**
- **Click Flow**:
  1. Show confirmation dialog
  2. Warn about access removal
  3. On confirm: DELETE /api/reseller/settings/accounts/{id}
  4. Toast: "Account deleted successfully"
  5. Remove from table

---

### 🔄 State Management (Settings Page)

```typescript
// Accounts
const [accounts, setAccounts] = useState<Account[]>([]);

// Modals
const [createAccountOpen, setCreateAccountOpen] = useState(false);
const [editAccountId, setEditAccountId] = useState<string | null>(null);

// Forms
const [createForm, setCreateForm] = useState({
  email: '',
  role: 'reseller_viewer' as 'reseller_admin' | 'reseller_editor' | 'reseller_viewer',
});
const [editForm, setEditForm] = useState({
  name: '',
  role: 'reseller_viewer' as 'reseller_admin' | 'reseller_editor' | 'reseller_viewer',
});

// Current User (for permission checks)
const { user } = useAuth();
```

---

### 🎨 Conditional Rendering (Settings Page)

| Element | Condition | Display |
|---------|-----------|---------|
| Create Account Button | `user.role === 'reseller_admin'` | Visible |
| Edit Button (all rows) | `user.role === 'reseller_admin'` | Visible |
| Delete Button (in Edit Modal) | `user.role === 'reseller_admin' && account.id !== user.id` | Visible |
| Role Field (Edit) | `account.id === user.id` | Disabled (cannot edit own) |
| "You" Badge | `account.id === user.id` | Visible |
| Empty State | `accounts.length === 0` | Show "No accounts found" |

---

### 📊 Data Flow (Settings Page)

**Page Load Flow:**
```
1. Component mounts
2. API Call: GET /api/reseller/settings/accounts
3. Backend filters: WHERE resellerId = user.resellerId AND role LIKE 'reseller_%'
4. Set accounts state
5. Render table
```

**Create Account Flow:**
```
1. Admin clicks "Create Account"
2. CreateAccountDialog opens
3. Admin fills: email, role
4. Real-time validation
5. On submit:
   - Validate fields
   - POST /api/reseller/settings/accounts with { email, role }
   - Backend sends invitation email
   - Response: { id, email, role, invitationSent: true }
   - Close modal
   - Add to table (status: "Pending invitation")
   - Show toast: "Invitation sent to {email}"
```

**Edit Account Flow:**
```
1. Admin clicks Edit button on row
2. EditAccountDialog opens with current data
3. Admin modifies name and/or role
4. On submit:
   - Validate changes
   - Check business rules (last admin, own role)
   - PUT /api/reseller/settings/accounts/{id}
   - On success:
     - Update account in table
     - Show toast: "Account updated successfully"
     - Close modal
```

**Delete Account Flow:**
```
1. Admin clicks Delete in Edit Modal
2. Confirm dialog shows warning
3. On confirm:
   - DELETE /api/reseller/settings/accounts/{id}
   - On success:
     - Remove from table
     - Show toast: "Account deleted successfully"
     - Close modal
```

---

## 문서 종료

이 문서는 Reseller 도메인의 모든 페이지에 대한 백엔드 API 명세를 포함합니다.

**관련 문서:**
- `common-api-spec.md` - 공통 페이지 (인증, Customers, Customer Detail)
- `wm-api-spec.md` - WM 도메인 페이지

---

**작성 완료일:** 2025-01-16
