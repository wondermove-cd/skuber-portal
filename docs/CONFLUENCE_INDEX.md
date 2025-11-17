# Frontend API 명세 - 빠른 참조 가이드

> ⚠️ **이 문서는 전체를 읽는 것이 아니라 필요한 부분만 찾아보는 레퍼런스입니다.**

## 📚 문서 개요

**총 문서 크기**: 약 11,500줄
**읽기 방법**: 전체 읽기 ❌ / 필요한 부분만 검색 ✅

### 🌐 실제 사이트 접속 방법

**배포 URL**: `https://skuber-portal.vercel.app`

**자동 로그인 링크** (클릭하면 바로 로그인된 상태로 대시보드 이동):
- **WM Admin**: [🔗 WM Admin으로 접속](https://skuber-portal.vercel.app?role=wm_admin)
- **WM Editor**: [🔗 WM Editor로 접속](https://skuber-portal.vercel.app?role=wm_editor)
- **WM Viewer**: [🔗 WM Viewer로 접속](https://skuber-portal.vercel.app?role=wm_viewer)
- **Reseller Admin**: [🔗 Reseller Admin으로 접속](https://skuber-portal.vercel.app?role=reseller_admin)
- **Reseller Editor**: [🔗 Reseller Editor로 접속](https://skuber-portal.vercel.app?role=reseller_editor)
- **Reseller Viewer**: [🔗 Reseller Viewer로 접속](https://skuber-portal.vercel.app?role=reseller_viewer)

> 💡 **Tip**: 위 링크를 클릭하면 로그인 없이 바로 해당 역할로 사이트를 체험할 수 있습니다.

---

## 🎯 빠른 시작 (5분)

1. **README.md 읽기** (필독) - 문서 구조 이해
2. **본인이 개발할 페이지 섹션만 보기**
3. **필요한 API 엔드포인트 검색** (Ctrl/Cmd + F)

---

## 📖 문서 목록

| 문서 | 용도 | 크기 | 링크 |
|------|------|------|------|
| **README.md** | 문서 읽기 가이드 ⭐ 필독 | 1페이지 | [GitHub](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/README.md) |
| **common-api-spec.md** | 공통 컴포넌트, 모달, Toast | 3,900줄 | [GitHub](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/common-api-spec.md) |
| **wm-api-spec.md** | WM 도메인 페이지 | 2,600줄 | [GitHub](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/wm-api-spec.md) |
| **reseller-api-spec.md** | Reseller 도메인 페이지 | 1,600줄 | [GitHub](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/reseller-api-spec.md) |
| **global-structure-spec.md** | 전역 구조, 권한, 라우팅 | 900줄 | [GitHub](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/global-structure-spec.md) |

---

## 🗺️ WM 도메인 페이지별 바로가기

| 페이지 | 실제 페이지 | 문서 위치 | Figma | 설명 |
|--------|------------|----------|-------|------|
| **Dashboard** | [🔗 /dashboard](https://skuber-portal.vercel.app/dashboard?role=wm_admin) | [📄 Spec](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/wm-api-spec.md#2-wm-dashboard) | [🎨 Design](#) | 승인 대기 계약, 최근 결제 현황 |
| **Customers** | [🔗 /customers](https://skuber-portal.vercel.app/customers?role=wm_admin) | [📄 Spec](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/wm-api-spec.md#3-customers-page) | [🎨 Design](#) | Direct 고객 목록 및 관리 |
| **Customer Detail** | [🔗 /customers/:id](https://skuber-portal.vercel.app/customers/example-id?role=wm_admin) | [📄 Spec](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/wm-api-spec.md#4-customer-detail-page) | [🎨 Design](#) | 고객 상세 정보, 계약, 결제 이력 |
| **Reseller** | [🔗 /reseller](https://skuber-portal.vercel.app/reseller?role=wm_admin) | [📄 Spec](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/wm-api-spec.md#5-reseller-page) | [🎨 Design](#) | Reseller 목록 및 초대 관리 |
| **Reseller Detail** | [🔗 /reseller/:id](https://skuber-portal.vercel.app/reseller/example-id?role=wm_admin) | [📄 Spec](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/wm-api-spec.md#6-reseller-detail-page) | [🎨 Design](#) | Reseller 상세 정보, 고객, 계약 |
| **Payments** | [🔗 /payments](https://skuber-portal.vercel.app/payments?role=wm_admin) | [📄 Spec](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/wm-api-spec.md#7-payments-page) | [🎨 Design](#) | 전체 결제 내역 조회 및 관리 |
| **Contracts** | [🔗 /contracts](https://skuber-portal.vercel.app/contracts?role=wm_admin) | [📄 Spec](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/wm-api-spec.md#8-contracts-page) | [🎨 Design](#) | Direct 계약 목록 및 생성 |
| **Contract Detail** | [🔗 /contracts/:id](https://skuber-portal.vercel.app/contracts/example-id?role=wm_admin) | [📄 Spec](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/wm-api-spec.md#9-contract-detail-page) | [🎨 Design](#) | 계약 상세 정보 및 가격 정책 |
| **Settings** | [🔗 /settings](https://skuber-portal.vercel.app/settings?role=wm_admin) | [📄 Spec](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/wm-api-spec.md#10-settings-page) | [🎨 Design](#) | WM 계정 관리 |

---

## 🏪 Reseller 도메인 페이지별 바로가기

| 페이지 | 실제 페이지 | 문서 위치 | Figma | 설명 |
|--------|------------|----------|-------|------|
| **Dashboard** | [🔗 /dashboard](https://skuber-portal.vercel.app/dashboard?role=reseller_admin) | [📄 Spec](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/reseller-api-spec.md#2-reseller-dashboard) | [🎨 Design](#) | 자사 고객, 계약, 결제 현황 |
| **Customers** | [🔗 /customers](https://skuber-portal.vercel.app/customers?role=reseller_admin) | [📄 Spec](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/wm-api-spec.md#3-customers-page) | [🎨 Design](#) | 자사 고객 목록 및 관리 |
| **Customer Detail** | [🔗 /customers/:id](https://skuber-portal.vercel.app/customers/example-id?role=reseller_admin) | [📄 Spec](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/wm-api-spec.md#4-customer-detail-page) | [🎨 Design](#) | 고객 상세 정보, 계약, 결제 이력 |
| **My Payments** | [🔗 /my-payments](https://skuber-portal.vercel.app/my-payments?role=reseller_admin) | [📄 Spec](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/reseller-api-spec.md#3-my-payments-page) | [🎨 Design](#) | 자사 결제 내역 조회 |
| **Contracts** | [🔗 /contracts](https://skuber-portal.vercel.app/contracts?role=reseller_admin) | [📄 Spec](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/reseller-api-spec.md#4-contracts-page) | [🎨 Design](#) | 자사 계약 목록 및 생성 |
| **Contract Detail** | [🔗 /contracts/:id](https://skuber-portal.vercel.app/contracts/example-id?role=reseller_admin) | [📄 Spec](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/reseller-api-spec.md#5-contract-detail-page) | [🎨 Design](#) | 계약 상세 정보 및 수정 |
| **Settings** | [🔗 /settings](https://skuber-portal.vercel.app/settings?role=reseller_admin) | [📄 Spec](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/reseller-api-spec.md#6-settings-page) | [🎨 Design](#) | Reseller 계정 관리 |

---

## 🔐 인증 & 에러 페이지

| 페이지 | 실제 페이지 | 설명 |
|--------|------------|------|
| **Login** | [🔗 /login](https://skuber-portal.vercel.app/login) | 로그인 페이지 |
| **Forgot Password** | [🔗 /forgot-password](https://skuber-portal.vercel.app/forgot-password) | 비밀번호 찾기 |
| **Verify Code** | [🔗 /verify-code](https://skuber-portal.vercel.app/verify-code) | 인증 코드 확인 |
| **Reset Password** | [🔗 /reset-password](https://skuber-portal.vercel.app/reset-password) | 비밀번호 재설정 |
| **Expired Code** | [🔗 /expired-code](https://skuber-portal.vercel.app/expired-code) | 인증 코드 만료 |
| **Reseller Signup** | [🔗 /reseller-signup](https://skuber-portal.vercel.app/reseller-signup) | Reseller 회원가입 |
| **User Signup** | [🔗 /user-signup](https://skuber-portal.vercel.app/user-signup) | 사용자 회원가입 |
| **403 Forbidden** | [🔗 /403](https://skuber-portal.vercel.app/403) | 접근 권한 없음 |
| **404 Not Found** | [🔗 /not-found](https://skuber-portal.vercel.app/not-found) | 페이지를 찾을 수 없음 |

---

## 🔍 자주 찾는 항목

### 모달/다이얼로그
모든 모달은 [common-api-spec.md - Section 4](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/common-api-spec.md#4-modals--dialogs)에 상세 명세가 있습니다.

| 모달 | 용도 | 링크 |
|------|------|------|
| Add Customer Dialog | 고객 추가 | [4.14](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/common-api-spec.md#414-add-customer-dialog) |
| Add Contract Modal | 계약 추가 (5단계) | [4.10](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/common-api-spec.md#410-add-contract-modal) |
| Edit Customer Modal | 고객 정보 수정 | [4.8](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/common-api-spec.md#48-edit-customer-modal) |
| Create Account Modal | 계정 생성 | [4.7](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/common-api-spec.md#47-create-account-modal) |
| Payment Filter Dialog | 결제 필터 | [4.13](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/common-api-spec.md#413-payment-filter-dialog) |

### Toast 메시지
전체 Toast 메시지 목록: [common-api-spec.md - Section 5](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/common-api-spec.md#5-toast-notifications)

**카테고리별:**
- Authentication (로그인, 로그아웃 등)
- Customer Management (고객 생성, 수정, 삭제)
- Contract Management (계약 생성, 승인, 거절)
- Payment Processing (결제 처리, 업데이트)
- Account Management (계정 생성, 수정)
- Reseller Management (리셀러 관리)
- Settings & Configuration (설정 변경)
- Validation & Errors (유효성 검증 실패)
- General Actions (복사, 내보내기 등)

---

## 💡 사용 팁

### ✅ DO (이렇게 하세요)
- ✅ GitHub에서 Ctrl/Cmd + F로 검색해서 필요한 부분만 보기
- ✅ API 엔드포인트 이름으로 검색 (예: "GET /api/customers")
- ✅ Figma 화면 보면서 문서 참고
- ✅ 모달 상세는 common-api-spec.md에서 찾기
- ✅ 불명확한 부분은 프론트엔드 팀에 문의

### ❌ DON'T (하지 마세요)
- ❌ 문서를 처음부터 끝까지 읽으려고 하지 마세요
- ❌ 모든 내용을 암기하려고 하지 마세요
- ❌ 로컬에 복사해서 보지 마세요 (GitHub이 항상 최신입니다)

---

## 🔑 핵심 개념

### 역할 기반 권한 (RBAC)
```
WM Users:
- wm_admin: 모든 권한
- wm_editor: 조회 + 생성/수정
- wm_viewer: 조회만

Reseller Users:
- reseller_admin: 모든 권한 (자사 데이터만)
- reseller_editor: 조회 + 생성/수정 (자사 데이터만)
- reseller_viewer: 조회만 (자사 데이터만)
```

### 데이터 격리
- **WM**: `resellerId IS NULL` (Direct 고객만)
- **Reseller**: `resellerId = {user.resellerId}` (자사 데이터만)

**⚠️ 중요**: 모든 API는 백엔드에서 자동으로 데이터 필터링 필수!

---

## 📞 문의

**프론트엔드 팀**: [팀 연락처 추가]

**문서 업데이트**: 이 문서는 GitHub main 브랜치와 동기화됩니다.
최신 버전: https://github.com/wondermove-cd/skuber-portal/tree/main/docs

---

## 🔐 실제 사이트 접속 정보

### 배포 환경

**Production URL**: `https://skuber-portal.vercel.app`

### 테스트 계정 정보

#### WM 도메인 계정

| 역할 | 이메일 | 비밀번호 | 권한 |
|------|--------|---------|------|
| **WM Admin** | [이메일 추가] | [비밀번호 추가] | 모든 페이지 접근 + 편집 + 계정 관리 |
| **WM Editor** | [이메일 추가] | [비밀번호 추가] | 모든 페이지 접근 + 편집 (계정 관리 제외) |
| **WM Viewer** | [이메일 추가] | [비밀번호 추가] | 모든 페이지 조회만 |

#### Reseller 도메인 계정

| 역할 | 이메일 | 비밀번호 | 권한 |
|------|--------|---------|------|
| **Reseller Admin** | [이메일 추가] | [비밀번호 추가] | Reseller 페이지 모든 권한 (자사 데이터만) |
| **Reseller Editor** | [이메일 추가] | [비밀번호 추가] | Reseller 페이지 조회 + 편집 (자사 데이터만) |
| **Reseller Viewer** | [이메일 추가] | [비밀번호 추가] | Reseller 페이지 조회만 (자사 데이터만) |

### 로그인 방법

1. **로그인 페이지 접속**: `https://skuber-portal.vercel.app/login`
2. **계정 선택**: 테스트하려는 역할에 맞는 계정 선택
3. **이메일/비밀번호 입력**
4. **로그인 버튼 클릭**

### 페이지 직접 접근

위 표의 "실제 페이지" 링크를 클릭하면 해당 페이지로 바로 이동합니다.
- 예: Dashboard → `https://skuber-portal.vercel.app/dashboard`
- 예: Customers → `https://skuber-portal.vercel.app/customers`

---

**최종 업데이트**: 2025-01-17
**문서 버전**: 2.1
