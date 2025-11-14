# 계약 승인/거절 프로세스 흐름

## 전체 흐름
```
[리셀러] 계약 생성 (Customer 상세 페이지)
   ↓
[자동] Pending 상태로 저장 (submittedDate 자동 생성)
   ↓
[WM] Dashboard에서 승인 or 거절
   ↓
[리셀러] 결과 확인 및 조치
```

---

## 1️⃣ 계약 생성 (리셀러)

### 화면: Customer 상세 페이지 → [Add Contract] 클릭
**구현 위치:** `src/components/customers/AddContractModal.tsx` (아직 미구현)

### 입력 정보
- Company Name (자동 입력됨)
- Service: Optimization / Observability / Management
- Pricing Model: Fixed Rate / Pay-as-you-go / Trial
- Contract Period: Start Date ~ End Date
- Contract Amount (Pricing Model에 따라 다름)
- Contact Person
- Contact Email

### [Submit] 클릭 시 동작
1. 계약 데이터 생성
2. **자동 설정 값:**
   - `approvalStatus: 'pending'`
   - `submittedDate: 현재 날짜` (예: '2025. 01. 15')
   - `status: 'inactive'`
3. 계약 저장

### 결과
- **리셀러 Contracts 페이지:** "Pending WM" 상태로 표시
- **리셀러 Contract 상세:** Pending 배너 표시
- **WM Dashboard:** Pending 리스트에 새 계약 나타남

**현재 데이터 구조:**
```typescript
{
  id: 'C-1001',
  contractId: 'C-1001',
  companyName: 'Leadingpoint',
  reseller: 'Megazone',
  resellerId: 'reseller-megazone',
  service: 'Optimization',
  pricingModel: 'Fixed Rate',
  startDate: '2024. 12. 31',
  endDate: '2025. 12. 31',
  status: 'inactive',
  approvalStatus: 'pending',  // 자동 생성
  submittedDate: '2025. 01. 15',  // 자동 생성
}
```

---

## 2️⃣ 승인 프로세스 (WM Admin)

### 화면: WM Dashboard - Pending Contracts 섹션
**구현 위치:** `src/pages/DashboardMainPage.tsx` (아직 미구현)

### UI 구성
- Pending 계약 리스트 테이블
- 각 행마다 [✓] [✕] 버튼

### [✓ Approve] 클릭 시
1. **즉시 승인 (모달 없음)**
2. 상태 업데이트:
   - `approvalStatus: 'pending'` → `'approved'`
   - `status: 'inactive'` 유지 (리셀러가 활성화할 때까지)

### 결과
- **WM Dashboard:** 해당 계약이 Pending 리스트에서 사라짐
- **리셀러 Contracts 페이지:**
  - 상태: "Pending WM" → "Inactive"
  - 토글 활성화 가능
- **리셀러 Contract 상세:**
  - "Approved" 배너 표시
  - Wholesale Terms 카드에 "Approved" 배지 + 초록색 배경
  - Status 토글 활성화 (OFF 상태)

---

## 3️⃣ 거절 프로세스 (WM Admin)

### 화면: WM Dashboard - Pending Contracts 섹션 → [✕ Reject] 클릭
**구현 위치:** `src/components/contracts/RejectContractModal.tsx` (아직 미구현)

### Reject Modal
- **제목:** "Reject Contract"
- **입력 필드:**
  - WM Note (필수, textarea)
  - 최대 280자
- **버튼:** [Cancel] [Submit]

### [Submit] 클릭 시
1. 거절 사유 저장
2. 상태 업데이트:
   - `approvalStatus: 'pending'` → `'rejected'`
   - `rejectionReason: '입력한 사유'`
   - `status: 'inactive'` 유지

### 결과
- **WM Dashboard:** 해당 계약이 Pending 리스트에서 사라짐
- **리셀러 Contracts 페이지:**
  - 상태: "Pending WM" → "Rejected"
  - 빨간색 ❌ 아이콘
- **리셀러 Contract 상세:**
  - 상단 Alert: "Contract Rejected" + 거절 사유
  - Wholesale Terms 카드에 "Rejected" 배지 + 빨간색 배경
  - "WM note" 섹션에 거절 사유 표시
  - Status 토글 비활성화

**현재 데이터 구조:**
```typescript
{
  id: 'C-1001',
  approvalStatus: 'rejected',
  rejectionReason: 'The contract amount does not match our wholesale pricing. Please review and resubmit.',
  status: 'inactive',
}
```

---

## 4️⃣ 활성화 (리셀러)

### 화면: Reseller Contract 상세 - Approved 계약
**구현 위치:** `src/pages/ResellerContractDetailPage.tsx` ✅ 구현됨

### Status 토글 [○] → [●] 클릭
**현재 구현:** 즉시 활성화 (확인 모달 없음)

**향후 개선안 (Optional):**
- 확인 모달: "Activate this contract?"
- [Cancel] [Activate] 버튼

### 활성화 시 동작
1. 상태 업데이트:
   - `status: 'inactive'` → `'active'`
2. 사용량 집계 시작 (백엔드)

### 결과
- **토글:** [○] → [●]
- **리셀러 Contracts 페이지:** "Inactive" → "Active"
- **Contract 상세:**
  - vCPU Usage 섹션에 차트 표시 시작
  - Payment History 시작

---

## 📊 상태별 화면 정리

### A. WM Dashboard

| 상태 | Pending 리스트 표시 | 액션 |
|------|------------------|------|
| Pending | ✅ 표시 | [✓] [✕] 버튼 |
| Approved | ❌ 안 보임 | - |
| Rejected | ❌ 안 보임 | - |
| Active | ❌ 안 보임 | - |

### B. 리셀러 Contracts 페이지

| approvalStatus | status | 표시 상태 | 아이콘 |
|---------------|--------|---------|-------|
| pending | inactive | Pending WM | ⏱️ |
| approved | inactive | Inactive | ⏸️ |
| approved | active | Active | ✅ |
| rejected | inactive | Rejected | ❌ |

### C. 리셀러 Contract 상세 페이지

| approvalStatus | status | Alert 배너 | Wholesale Terms 배지 | Status 토글 |
|---------------|--------|-----------|-------------------|-----------|
| pending | inactive | 🔵 Pending | Pending (회색) | 비활성화 |
| approved | inactive | 🟢 Approved | Approved (초록) | OFF (클릭 가능) |
| approved | active | 🟢 Approved | Approved (초록) | ON (클릭 가능) |
| rejected | inactive | 🔴 Rejected + 사유 | Rejected (빨강) | 비활성화 |

---

## 💾 데이터 구조

### ContractDetail Interface
```typescript
export interface ContractDetail extends Contract {
  // 승인 관련 필드
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  submittedDate?: string;  // 자동 생성 (예: '2025. 01. 15')
  rejectionReason?: string;  // 거절 시에만 존재

  // 계약 상태
  status: 'active' | 'inactive' | 'expired';

  // ... 기타 필드
}
```

### 예시 데이터

**Pending 상태:**
```typescript
{
  id: 'C-1004',
  approvalStatus: 'pending',
  submittedDate: '2025. 01. 25',
  status: 'inactive',
}
```

**Approved 상태:**
```typescript
{
  id: 'C-1002',
  approvalStatus: 'approved',
  submittedDate: '2024. 12. 31',
  status: 'active',  // 리셀러가 활성화함
}
```

**Rejected 상태:**
```typescript
{
  id: 'C-1001',
  approvalStatus: 'rejected',
  submittedDate: '2025. 01. 15',
  rejectionReason: 'The contract amount does not match our wholesale pricing.',
  status: 'inactive',
}
```

---

## 🔧 구현 현황

### ✅ 완료
- `ResellerContractDetailPage.tsx` - 모든 승인 상태 UI
- `contractDetails.ts` - 데이터 구조 및 Mock 데이터
- Wholesale Terms 카드 - 모든 pricing model 지원
- Approval Status 배지 및 Alert

### 🚧 미구현 (백엔드 확인 필요)
1. **AddContractModal.tsx**
   - 계약 생성 UI
   - submittedDate 자동 생성 로직
   - approvalStatus 자동 'pending' 설정

2. **WM Dashboard - Pending Contracts**
   - Pending 리스트 테이블
   - [✓] Approve 버튼 → 즉시 승인
   - [✕] Reject 버튼 → 모달 오픈

3. **RejectContractModal.tsx**
   - 거절 사유 입력 (280자)
   - rejectionReason 저장

4. **ContractsPage.tsx (리셀러용)**
   - approvalStatus 기반 상태 표시
   - 아이콘 및 색상 구분

---

## 💬 백엔드 확인 필요 사항

### 1. 계약 생성 시 자동 필드
**현재 프론트엔드 가정:**
- `submittedDate`: 생성 시점의 현재 날짜 자동 입력
- `approvalStatus`: 무조건 'pending'으로 생성
- `status`: 'inactive'로 생성

**확인 필요:**
- ✅ 백엔드에서 자동 생성하나요?
- ❌ 프론트엔드에서 보내야 하나요?

### 2. 거절 사유
**현재 필드:**
- `rejectionReason: string`
- 최대 280자

**확인 필요:**
- ✅ 현재 저장 가능한가요?
- ❌ 추가 개발 필요한가요?

### 3. 승인 시 WM 메모
**현재:** 승인 시 메모 없음 (즉시 승인)

**확인 필요:**
- 승인 시에도 메모가 필요한가요?
- 아니면 거절 시에만 필요한가요?

### 4. 활성화 상태 변경
**현재 동작:**
- 리셀러가 토글로 active/inactive 변경 가능
- approved 상태일 때만 토글 가능

**확인 필요:**
- ✅ 이 로직이 맞나요?
- ❌ 승인되면 자동 활성화되나요?

### 5. 사용량 집계
**확인 필요:**
- active 상태가 되면 사용량 집계가 시작되나요?
- 어떤 트리거로 집계가 시작되나요?

---

## 📋 구현 우선순위 제안

### Phase 1 (필수)
1. `AddContractModal` - 계약 생성 UI
2. WM Dashboard - Pending 리스트 + 승인/거절 버튼
3. `RejectContractModal` - 거절 사유 입력

### Phase 2 (개선)
1. 리셀러 Contracts 페이지 - 상태별 아이콘/색상
2. 활성화 시 확인 모달
3. 알림 시스템 (승인/거절 시 리셀러에게 알림)

### Phase 3 (추가 기능)
1. 승인 히스토리 (누가 언제 승인/거절했는지)
2. 재제출 기능 (거절된 계약 수정 후 재제출)
3. 대량 승인 기능

---

## 🎨 Figma 참고

### 리셀러 화면
- Customer 상세 → Add Contract Modal
- Contracts 페이지 (상태별 표시)
- Contract 상세 - Pending 상태
- Contract 상세 - Approved 상태 (토글 OFF)
- Contract 상세 - Approved 상태 (토글 ON)
- Contract 상세 - Rejected 상태

### WM 화면
- Dashboard - Pending Contracts 리스트
- Reject Contract Modal

---

**작성일:** 2025. 01. 13
**작성자:** Claude Code
**최종 업데이트:** ResellerContractDetailPage 구현 완료
