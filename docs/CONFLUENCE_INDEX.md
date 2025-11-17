# Frontend API 명세 - 빠른 참조 가이드

> ⚠️ **이 문서는 전체를 읽는 것이 아니라 필요한 부분만 찾아보는 레퍼런스입니다.**

## 📚 문서 개요

**총 문서 크기**: 약 11,500줄
**읽기 방법**: 전체 읽기 ❌ / 필요한 부분만 검색 ✅

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

| 페이지 | 문서 위치 | Figma | 주요 API |
|--------|----------|-------|---------|
| **Dashboard** | [wm-api-spec.md - Section 2](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/wm-api-spec.md#2-wm-dashboard) | [Figma 링크 추가] | `GET /api/wm/dashboard`<br>`POST /api/contracts/{id}/approve` |
| **Customers** | [wm-api-spec.md - Section 3](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/wm-api-spec.md#3-customers-page) | [Figma 링크 추가] | `GET /api/customers`<br>`POST /api/customers` |
| **Customer Detail** | [wm-api-spec.md - Section 4](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/wm-api-spec.md#4-customer-detail-page) | [Figma 링크 추가] | `GET /api/customers/{id}` |
| **Reseller** | [wm-api-spec.md - Section 5](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/wm-api-spec.md#5-reseller-page) | [Figma 링크 추가] | `GET /api/resellers` |
| **Reseller Detail** | [wm-api-spec.md - Section 6](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/wm-api-spec.md#6-reseller-detail-page) | [Figma 링크 추가] | `GET /api/resellers/{id}` |
| **Payments** | [wm-api-spec.md - Section 7](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/wm-api-spec.md#7-payments-page) | [Figma 링크 추가] | `GET /api/payments`<br>`PUT /api/payments/{id}` |
| **Contracts** | [wm-api-spec.md - Section 8](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/wm-api-spec.md#8-contracts-page) | [Figma 링크 추가] | `GET /api/contracts`<br>`POST /api/contracts` |
| **Contract Detail** | [wm-api-spec.md - Section 9](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/wm-api-spec.md#9-contract-detail-page) | [Figma 링크 추가] | `GET /api/contracts/{id}` |
| **Settings** | [wm-api-spec.md - Section 10](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/wm-api-spec.md#10-settings-page) | [Figma 링크 추가] | `GET /api/settings/accounts`<br>`POST /api/settings/accounts` |

---

## 🏪 Reseller 도메인 페이지별 바로가기

| 페이지 | 문서 위치 | Figma | 주요 API |
|--------|----------|-------|---------|
| **Dashboard** | [reseller-api-spec.md - Section 2](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/reseller-api-spec.md#2-reseller-dashboard) | [Figma 링크 추가] | `GET /api/reseller/dashboard` |
| **My Payments** | [reseller-api-spec.md - Section 3](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/reseller-api-spec.md#3-my-payments-page) | [Figma 링크 추가] | `GET /api/reseller/payments` |
| **Contracts** | [reseller-api-spec.md - Section 4](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/reseller-api-spec.md#4-contracts-page) | [Figma 링크 추가] | `GET /api/reseller/contracts`<br>`POST /api/reseller/contracts` |
| **Contract Detail** | [reseller-api-spec.md - Section 5](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/reseller-api-spec.md#5-contract-detail-page) | [Figma 링크 추가] | `GET /api/reseller/contracts/{id}` |
| **Settings** | [reseller-api-spec.md - Section 6](https://github.com/wondermove-cd/skuber-portal/blob/main/docs/reseller-api-spec.md#6-settings-page) | [Figma 링크 추가] | `GET /api/reseller/settings/accounts` |

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

**최종 업데이트**: 2025-01-16
**문서 버전**: 2.0
