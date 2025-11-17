# WM Sales Portal - Frontend Implementation Reference

**문서 작성일:** 2025-01-17
**버전:** 1.0
**대상:** 백엔드 개발팀, 기획팀, QA팀

---

## ⚠️ 문서의 목적

이 문서는 **WM Sales Portal 프론트엔드의 현재 구현 상태를 있는 그대로 기술한 참고 자료**입니다.

### 📌 이 문서는:
- ✅ 프론트엔드가 현재 어떻게 작동하는지 이해하기 위한 참고 문서
- ✅ 백엔드 API 개발 시 프론트엔드 요구사항을 파악하기 위한 레퍼런스
- ✅ UI/UX 동작 방식을 이해하기 위한 가이드
- ✅ 데이터 구조, 필드 정의, Validation 규칙을 확인하기 위한 자료

### ❌ 이 문서는 아닙니다:
- ❌ 공식 개발 가이드라인이나 API 명세서가 아닙니다
- ❌ 백엔드 API가 반드시 따라야 하는 강제 규격이 아닙니다
- ❌ 최종 확정된 사양서가 아닙니다 (구현은 변경될 수 있음)

### 🎯 활용 방법:
- 프론트엔드 동작을 이해하고, 백엔드 API 설계에 참고
- 실제 API 명세는 백엔드팀과 협의하여 별도로 정의
- 문서와 실제 구현이 다를 경우, 실제 코드를 우선으로 확인

---

## 📖 문서 읽는 순서 (권장)

### 1단계: 전역 구조 이해
**📄 `global-structure-spec.md`** (26KB)
- 사용자 역할 및 권한 체계 (6가지 역할)
- 라우팅 구조 및 접근 제어
- 인증 플로우 (로그인, 비밀번호 재설정, 초대 가입)
- 에러 처리 및 권한 체크
- NotificationSheet 구조

**읽는 이유:** 전체 시스템의 기본 구조와 권한 체계를 이해해야 각 페이지의 API 요구사항을 정확히 파악할 수 있습니다.

### 2단계: 공통 컴포넌트 이해
**📄 `common-api-spec.md`** (136KB) ⭐ 가장 중요
- **Section 1-3**: 공통 컴포넌트 (로그인, 회원가입 등)
- **Section 4**: 모달/다이얼로그 (15개)
  - 각 모달의 데이터 구조, validation 규칙, API 엔드포인트
  - 예: Add Contract Modal (5단계), Edit Customer Modal, Filter Dialogs 등
- **Section 5**: Toast 알림 메시지 (55+ 개)
  - 카테고리별 분류 (Customer, Contract, Payment, Note 등)
  - 성공/실패 케이스별 메시지
  - 필요한 i18n 키 목록
- **Section 6**: 레이아웃 컴포넌트
  - Header (네비게이션 버튼, 알림)
  - Sidebar (메뉴, 사용자 프로필)

**읽는 이유:** 모든 페이지에서 재사용되는 컴포넌트의 API 요구사항을 파악할 수 있습니다.

### 3단계: 도메인별 페이지 상세
**📄 `wm-api-spec.md`** (46KB) - WM 사용자용 페이지
- Dashboard
- Customers (목록, 상세)
- Contracts (목록, 상세)
- Payments (목록)
- Resellers (목록, 상세)
- Settings

**📄 `reseller-api-spec.md`** (30KB) - Reseller 사용자용 페이지
- Dashboard
- Customers (목록)
- Contracts (목록, 상세)
- My Payments (목록)
- Settings

**읽는 이유:** 각 페이지별 API 엔드포인트, 필터링 규칙, 정렬 로직, 권한별 데이터 필터링을 이해할 수 있습니다.

---

## 🗂️ 문서 구조

```
docs/
├── README.md (이 파일)
├── global-structure-spec.md
├── common-api-spec.md
├── wm-api-spec.md
└── reseller-api-spec.md
```

---

## 🎯 각 문서의 주요 내용

### 📄 global-structure-spec.md

| 섹션 | 내용 |
|------|------|
| 1. 사용자 역할 | 6가지 역할 정의 (wm_admin, wm_editor, wm_viewer, reseller_admin, reseller_editor, reseller_viewer) |
| 2. 권한 체계 | CRUD 작업별 권한 매트릭스 |
| 3. 인증 플로우 | 로그인, 비밀번호 재설정, 초대 가입 API |
| 4. 라우팅 | 전체 라우트 맵 및 접근 제어 규칙 |
| 5. 네비게이션 | Sidebar, Header 구조 |
| 6. 에러 처리 | 403, 404, 500 에러 처리 방식 |

### 📄 common-api-spec.md (⭐ 가장 중요)

| 섹션 | 내용 | 문서화 항목 수 |
|------|------|---------------|
| Section 1-3 | 로그인, 회원가입 등 공통 기능 | 3개 |
| Section 4 | 모달/다이얼로그 | 15개 |
| Section 5 | Toast 알림 메시지 | 55+ 개 (9개 카테고리) |
| Section 6 | 레이아웃 컴포넌트 | Header + Sidebar |

**Section 4 모달 목록:**
1. Add Note Modal
2. Edit Billing Emails Modal
3. Edit Pricing Modal
4. Add Service Modal
5. Add Reseller Modal
6. Reject Contract Modal
7. Create Account Modal
8. Edit Customer Modal
9. Edit Reseller Info Modal
10. Add Contract Modal (5단계 복잡 모달)
11. Edit Account Modal
12. Contract Filter Dialog
13. Payment Filter Dialog
14. Add Customer Dialog
15. Notification Sheet

각 모달 문서 포함 사항:
- Trigger (트리거 조건)
- Permissions (접근 권한)
- Modal Structure (섹션별 구조)
- Form Fields (필드 타입, validation)
- Validation Rules (영/한 에러 메시지)
- Props Interface (TypeScript)
- User Interactions (사용자 동작)
- Backend Requirements (API 엔드포인트, 요청/응답 구조)
- i18n Translation Keys

**Section 5 Toast 카테고리:**
1. Customer Management (3개)
2. Contract Management (8개)
3. Note Management (3개)
4. Reseller Management (8개)
5. Account & User Management (8개)
6. Payment & Invoice Management (4개)
7. Authentication & Password (5개)
8. Form Validation Errors (2개)
9. Language & Preferences (1개)

### 📄 wm-api-spec.md

WM 사용자를 위한 10개 페이지:
1. WM Dashboard - 통계, 차트, 대시보드
2. Customers Page - 고객사 목록 (검색, 필터, 정렬, 페이징)
3. Customer Detail Page - 고객사 상세 (계약, 결제, 노트)
4. Reseller Page - 리셀러 목록
5. Reseller Detail Page - 리셀러 상세 (서비스, 가격, 계약)
6. Payments Page - 결제 목록 (복잡한 테이블, 인라인 편집)
7. Contracts Page - 계약 목록
8. Contract Detail Page - 계약 상세 (사용량 차트, 결제 내역)
9. Settings Page - 계정 관리 (탭 구조)
10. Dashboard Page

### 📄 reseller-api-spec.md

Reseller 사용자를 위한 6개 페이지:
1. Reseller Dashboard
2. Customers Page (Reseller 소유만 필터링)
3. Contracts Page (Reseller 소유만 필터링, 승인 상태 포함)
4. Contract Detail Page (Reseller용 특수 뷰)
5. My Payments Page (Reseller 결제 내역)
6. Settings Page

---

## 🔑 주요 개념

### 1. 권한 기반 데이터 필터링

**모든 API는 자동으로 사용자 역할에 따라 데이터를 필터링해야 합니다:**

- **WM 사용자**:
  - Customers: `WHERE resellerId IS NULL` (Direct 고객만)
  - Contracts: `WHERE resellerId IS NULL` (Direct 계약만)
  - Payments: 모든 결제 (제한 없음)
  - Resellers: 모든 리셀러

- **Reseller 사용자**:
  - Customers: `WHERE resellerId = {user.resellerId}`
  - Contracts: `WHERE resellerId = {user.resellerId}`
  - Payments: `WHERE resellerId = {user.resellerId}`
  - Resellers: 접근 불가 (403)

### 2. CRUD 권한 체계

| 작업 | Admin | Editor | Viewer |
|------|-------|--------|--------|
| Create | ✅ | ✅ | ❌ |
| Read | ✅ | ✅ | ✅ |
| Update | ✅ | ✅ | ❌ |
| Delete | ✅ | ❌ | ❌ |

### 3. Validation 규칙

모든 폼 필드에 대한 validation 규칙은 각 모달 문서의 "Validation Rules" 섹션에 상세히 기술되어 있습니다.

예: Add Customer Dialog
- Company Name: Required, 최소 2자
- Email: Required, 이메일 형식 검증
- Business Reg. No.: 국가별 형식 검증 (한국: 10자리, 미국: EIN 형식 등)

### 4. Toast 메시지

모든 CRUD 작업 후 적절한 Toast 메시지를 표시합니다. Section 5에 55개 이상의 모든 케이스가 문서화되어 있습니다.

---

## 📊 API 엔드포인트 요약

### Authentication & User Management
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/verify-code
POST   /api/auth/resend-code
POST   /api/auth/signup (초대 기반)
GET    /api/auth/validate-invitation/:token
```

### Customers
```
GET    /api/customers (검색, 필터, 정렬, 페이징)
GET    /api/customers/:id
POST   /api/customers
PUT    /api/customers/:id
DELETE /api/customers/:id
GET    /api/customers/:id/contracts
GET    /api/customers/:id/payments
GET    /api/customers/:id/notes
```

### Contracts
```
GET    /api/contracts (검색, 필터, 정렬, 페이징)
GET    /api/contracts/:id
POST   /api/contracts
PUT    /api/contracts/:id
DELETE /api/contracts/:id
PUT    /api/contracts/:id/status (activate/deactivate)
PUT    /api/contracts/:id/approval (approve/reject - WM only)
GET    /api/contracts/:id/payments
GET    /api/contracts/:id/usage (vCPU 사용량)
```

### Payments
```
GET    /api/payments (검색, 필터, 정렬, 페이징)
GET    /api/payments/:id
PUT    /api/payments/:id (paid amount, deposit date 수정)
GET    /api/payments/statistics (기간별 통계)
```

### Resellers
```
GET    /api/resellers (검색, 필터, 정렬, 페이징)
GET    /api/resellers/:id
POST   /api/resellers
PUT    /api/resellers/:id
DELETE /api/resellers/:id
POST   /api/resellers/:id/invite
PUT    /api/resellers/:id/cancel-invitation
GET    /api/resellers/:id/contracts
GET    /api/resellers/:id/services
POST   /api/resellers/:id/services (Add Service)
PUT    /api/resellers/:id/services/:serviceId/pricing
```

### Notifications
```
GET    /api/notifications (filter: all/unread)
GET    /api/notifications/unread-count
PUT    /api/notifications/:id/read
GET    /api/notifications/refresh
```

### Notes
```
GET    /api/notes (customerid or contractId or resellerId)
POST   /api/notes
PUT    /api/notes/:id
DELETE /api/notes/:id
```

### Accounts (Settings)
```
GET    /api/accounts
POST   /api/accounts (초대 이메일 발송 포함)
PUT    /api/accounts/:id
DELETE /api/accounts/:id
POST   /api/accounts/:id/resend-invitation
PUT    /api/accounts/:id/cancel-invitation
```

---

## 🚀 백엔드 구현 시 참고사항

### 1. 페이징 표준
모든 목록 API는 다음 페이징 파라미터를 지원해야 합니다:
```
?page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

### 2. 검색 표준
검색은 여러 필드에 대해 OR 조건으로 동작:
```
?search=keyword
// Customers: companyName OR businessRegNo OR contactPerson
// Contracts: companyName OR reseller OR service
```

### 3. 필터 표준
필터는 AND 조건으로 동작:
```
?service=Observability,Management&status=active&pricingModel=Fixed Rate
```

### 4. 에러 응답 형식
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Company name is required",
  "field": "companyName",
  "code": 400
}
```

### 5. 성공 응답 형식
```json
{
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

## 📝 문서 사용 팁

### 빠른 검색
각 MD 파일은 텍스트 검색이 가능합니다:
- VS Code에서 `Cmd+F` (Mac) 또는 `Ctrl+F` (Windows)
- GitHub에서 파일 내 검색 지원
- Notion/Confluence에 업로드 시 전체 검색 가능

### API 엔드포인트 찾기
1. 특정 페이지의 API → 해당 페이지 문서의 "Data Requirements" 섹션
2. 특정 모달의 API → `common-api-spec.md` Section 4의 "Backend Requirements" 섹션
3. Toast 메시지 → `common-api-spec.md` Section 5

### Validation 규칙 찾기
1. 모달 폼 → `common-api-spec.md` Section 4의 "Validation Rules" 테이블
2. 페이지 폼 → 각 페이지 문서의 "Form Validations" 섹션

---

## 🔄 문서 버전 관리

**현재 버전:** 1.0 (2025-01-17)

이 문서는 프론트엔드 코드의 현재 상태를 반영합니다. 코드가 변경되면 문서도 업데이트될 수 있습니다.

**업데이트 이력:**
- v1.0 (2025-01-17): 초기 문서 작성
  - 모달 15개, Toast 55개, 페이지 16개 문서화
  - 레이아웃 컴포넌트, 권한 체계, 라우팅 정리

**향후 보완 예정:**
- [ ] 페이지별 상세 인터랙션 추가
- [ ] 누락된 i18n 키 정리
- [ ] 실제 API 응답 예시 추가 (백엔드 구현 후)

---

## ⚖️ 면책 조항

- 이 문서는 프론트엔드 참고 자료일 뿐, 공식 API 명세서가 아닙니다
- 실제 백엔드 API 구현은 백엔드팀과 협의하여 결정됩니다
- 문서의 내용은 실제 코드 구현과 다를 수 있으며, 코드가 우선입니다
- 비즈니스 로직은 기획팀과 재확인이 필요할 수 있습니다

---

## 📞 문의 및 피드백

문서 내용이나 프론트엔드 구현 관련 질문:
- 프론트엔드팀에 직접 문의
- GitHub Issues 또는 Slack 채널 활용
- 담당자: [이름/연락처]

---

**이 문서가 개발에 도움이 되기를 바랍니다! 📚**
