# Global Structure Specification
# WM Sales Portal - 전역 구조 API 명세

**문서 버전:** 1.0
**최종 업데이트:** 2025-01-16
**작성자:** Product Team

---

## 📑 목차

1. [전역 구조 개요](#1-전역-구조-개요)
2. [Navigation - 좌측 사이드바 & 상단 바](#2-navigation---좌측-사이드바--상단-바)
3. [Notifications - 알림 시스템](#3-notifications---알림-시스템)
4. [404 Page - 페이지를 찾을 수 없음](#4-404-page---페이지를-찾을-수-없음)
5. [403 Page - 접근 권한 없음](#5-403-page---접근-권한-없음)
6. [Global Modals](#6-global-modals)
7. [Language Switcher - Settings 페이지 내](#7-language-switcher---settings-페이지-내)

**📌 참고 문서:**
- `common-api-spec.md` - 공통 인증 페이지
- `wm-api-spec.md` - WM 도메인 페이지
- `reseller-api-spec.md` - Reseller 도메인 페이지

---

## 1. 전역 구조 개요

### 1.1 애플리케이션 아키텍처

WM Sales Portal은 다음과 같은 전역 구조를 가집니다:

```
┌──────────────┬────────────────────────────────────────────────┐
│              │ Top Bar (우측 상단)                             │
│              │ - Notifications (알림)                          │
│              ├────────────────────────────────────────────────┤
│              │                                                │
│  Left Sidebar│                                                │
│  (좌측)       │                                                │
│              │ Main Content Area (우측 하단)                   │
│  - Logo      │ (각 페이지 컨텐츠)                                │
│  - Dashboard │                                                │
│  - Customers │                                                │
│  - Contracts │                                                │
│  - Payments  │                                                │
│  - Settings  │                                                │
│              │                                                │
│  ─────────── │                                                │
│  Profile     │                                                │
│  (하단 고정)   │                                                │
└──────────────┴────────────────────────────────────────────────┘
```

**레이아웃 구성:**
- **좌측 사이드바 (Left Sidebar)**: 고정, 로고, 메인 메뉴, 프로필 (하단)
- **우측 상단 (Top Bar)**: 알림
- **우측 하단 (Main Content)**: 페이지별 컨텐츠
- **Settings 페이지 내**: 언어 선택 옵션

### 1.2 도메인별 구조

**미래 구조 (도메인 분리):**
- WM 도메인: `wm.salesportal.com`
- Reseller 도메인: `reseller.salesportal.com`

**현재 구조 (단일 도메인):**
- 단일 도메인에서 역할(role)에 따라 라우팅 및 네비게이션 표시

### 1.3 접근 권한 체계

**역할 기반 접근 제어 (RBAC):**
- WM 역할: `wm_admin`, `wm_editor`, `wm_viewer`
- Reseller 역할: `reseller_admin`, `reseller_editor`, `reseller_viewer`

**데이터 격리:**
- WM 사용자: Direct 데이터만 (`resellerId IS NULL`)
- Reseller 사용자: 자사 데이터만 (`resellerId = user.resellerId`)

---

## 2. Navigation - 좌측 사이드바 & 상단 바

**위치:** 모든 페이지 좌측 및 우측 상단
**접근 권한:** 로그인한 모든 사용자

### 📐 A. Left Sidebar (좌측 사이드바)

**위치:** 화면 좌측 고정
**너비:** 약 240px (고정)

#### 섹션 1: Logo 및 브랜드
**기능:**
- WonderMove 로고
- 클릭 시 대시보드로 이동

**인터랙션:**
- 로고 클릭: `/dashboard` 페이지로 이동

**조건/규칙:**
- 항상 표시
- 사이드바 최상단 위치

---

#### 섹션 2: 메인 메뉴 항목
**기능:**
- 역할별 메뉴 표시
- 현재 페이지 하이라이트
- 아이콘 + 텍스트 조합

**WM 사용자 메뉴:**
| 메뉴 항목 | 아이콘 | 경로 | 접근 권한 |
|----------|--------|------|-----------|
| Dashboard | 📊 | `/dashboard` | wm_admin, wm_editor, wm_viewer |
| Customers | 👥 | `/customers` | wm_admin, wm_editor, wm_viewer |
| Resellers | 🏢 | `/resellers` | wm_admin, wm_editor, wm_viewer |
| Contracts | 📄 | `/contracts` | wm_admin, wm_editor, wm_viewer |
| Payments | 💰 | `/payments` | wm_admin, wm_editor, wm_viewer |
| Settings | ⚙️ | `/settings` | wm_admin, wm_editor, wm_viewer |

**Reseller 사용자 메뉴:**
| 메뉴 항목 | 아이콘 | 경로 | 접근 권한 |
|----------|--------|------|-----------|
| Dashboard | 📊 | `/dashboard` | reseller_admin, reseller_editor, reseller_viewer |
| Customers | 👥 | `/customers` | reseller_admin, reseller_editor, reseller_viewer |
| Contracts | 📄 | `/contracts` | reseller_admin, reseller_editor, reseller_viewer |
| My Payments | 💰 | `/my-payments` | reseller_admin, reseller_editor, reseller_viewer |
| Settings | ⚙️ | `/settings` | reseller_admin, reseller_editor, reseller_viewer |

**인터랙션:**
- 메뉴 항목 클릭: 해당 페이지로 이동
- Hover: 배경색 밝게 변경
- Active: 진한 배경색 + 좌측 강조선

**조건/규칙:**
- **현재 페이지**: 해당 메뉴 항목 하이라이트 (진한 배경색 + 좌측 파란색 바)
- **역할별 표시**: 사용자 역할에 따라 메뉴 항목 필터링
- **Settings 위치**: 메뉴 최하단에 배치 (구분선으로 분리)

**스타일:**
```css
/* Active Menu Item */
background: #f0f4ff;
border-left: 4px solid #3b82f6;
font-weight: 600;
```

---

#### 섹션 3: Profile Area (프로필 영역)
**위치:** 좌측 사이드바 최하단 (고정)

**기능:**
- 사용자 프로필 아바타
- 사용자명 표시
- 역할 배지 표시
- Logout 버튼

**인터랙션:**
- Logout 버튼 클릭: 로그아웃 및 `/login` 페이지로 리다이렉트

**조건/규칙:**
- **사용자명**: JWT 토큰에서 추출한 `user.name` 표시
- **역할 배지**:
  - WM Admin: 보라색
  - WM Editor: 파란색
  - WM Viewer: 회색
  - Reseller Admin: 초록색
  - Reseller Editor: 파란색
  - Reseller Viewer: 회색
- **아바타**: 사용자명의 첫 글자로 생성 (예: "John Doe" → "JD")
- **위치**: 사이드바 하단에 고정 (스크롤과 무관)

**표시 형식:**
```
┌────────────────────┐
│ [JD]               │
│ John Doe           │
│ WM Admin           │
│                    │
│ [Logout 버튼]       │
└────────────────────┘
```

**스타일:**
```css
/* Profile Area */
padding: 16px 24px;
border-top: 1px solid #e5e7eb;
background: #f9fafb;
```

---

### 📐 B. Top Bar (우측 상단 바)

**위치:** 화면 우측 상단 (좌측 사이드바 옆)
**높이:** 약 64px (고정)

#### 섹션 1: Notifications (알림)
**위치:** Top Bar 우측

**기능:**
- 알림 아이콘 (종 모양)
- 읽지 않은 알림 개수 배지
- 드롭다운 메뉴

**인터랙션:**
- 알림 아이콘 클릭: NotificationSheet 열기 (우측에서 슬라이드)

**조건/규칙:**
- **읽지 않은 알림**: 빨간색 배지 표시 (예: "3")
- **모든 알림 읽음**: 배지 숨김

**데이터 요구사항:**

**API Endpoint:** `GET /api/notifications/unread-count`

**자동 필터링:**
- WM: `WHERE resellerId IS NULL`
- Reseller: `WHERE resellerId = {user.resellerId}`

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| count | number | 읽지 않은 알림 개수 |

---

### 🎨 네비게이션 스타일 가이드

**좌측 사이드바:**
- **배경색**: `#ffffff` (흰색)
- **테두리**: 우측에 `1px solid #e5e7eb` (회색 경계선)
- **너비**: `240px` (고정)
- **로고 영역**: 패딩 `24px`
- **메뉴 항목**: 패딩 `12px 24px`
- **프로필 영역**: 하단 고정, 패딩 `16px 24px`

**우측 상단 바:**
- **배경색**: `#ffffff` (흰색)
- **테두리**: 하단에 `1px solid #e5e7eb` (회색 경계선)
- **높이**: `64px` (고정)
- **우측 패딩**: `24px`

---

### 🔔 NotificationSheet (알림 패널)

**트리거:** 알림 아이콘 클릭

**타입:** Right-side slide-in sheet (우측에서 슬라이드)

#### Sheet 구조

**섹션 1: 헤더**
- "Notifications" 제목

**섹션 2: 탭**
- "All" 탭: 모든 알림
- "Unread" 탭: 읽지 않은 알림만

**섹션 3: 알림 목록**
- 각 알림: 메시지, "Go to {pageName} page" 링크, 타임스탬프
- 읽지 않은 알림: 노란색 점 표시 (왼쪽)
- Empty state: 알림 없을 때 표시

**섹션 4: Refresh Button** (Empty state에서만)
- "Refresh" 버튼: 알림 새로고침

**인터랙션:**
- 알림 클릭: 읽음 처리 + Sheet 닫기 + 관련 페이지로 이동
- 탭 전환: All ↔ Unread 필터링
- Sheet 외부 클릭 또는 ESC: Sheet 닫기
- Refresh 버튼: 알림 새로고침 (Empty state에서만)

**조건/규칙:**
- **Empty State**: 알림 없을 때 "No notifications" 메시지
- **시간 표시**: 상대 시간 (예: "5 minutes ago", "2 hours ago", "Yesterday")

**데이터 요구사항:**

**API Endpoint:** `GET /api/notifications`

**자동 필터링:**
- WM: `WHERE resellerId IS NULL`
- Reseller: `WHERE resellerId = {user.resellerId}`

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| limit | number | 최대 개수 (기본: 5) |

**응답 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 알림 ID |
| title | string | 알림 제목 |
| description | string | 알림 설명 |
| type | string | 알림 타입 (contract_approval, contract_expiring, payment_due 등) |
| read | boolean | 읽음 여부 |
| createdAt | string | 생성 시간 (ISO 8601) |
| relatedId | string \| null | 관련 리소스 ID (예: contractId) |
| relatedType | string \| null | 관련 리소스 타입 (예: "contract") |

**알림 타입별 예시:**

**WM 사용자:**
- `contract_approval`: "New contract approval request from Reseller ABC"
- `contract_expiring`: "Contract #12345 expiring in 10 days"
- `payment_overdue`: "Payment overdue for Customer XYZ"

**Reseller 사용자:**
- `contract_approved`: "Your contract #12345 has been approved"
- `contract_rejected`: "Your contract #12345 has been rejected"
- `contract_expiring`: "Contract #12345 expiring in 10 days"
- `payment_due`: "Payment due for period 2025.10"

**Mark All as Read API:**

**API Endpoint:** `PUT /api/notifications/mark-all-read`

**자동 필터링:**
- WM: `WHERE resellerId IS NULL`
- Reseller: `WHERE resellerId = {user.resellerId}`

**성공 시:**
- 알림 배지 제거
- 모든 알림의 파란색 점 제거

---

## 3. Notifications - 알림 시스템

**개요:** 실시간 알림 및 토스트 메시지 시스템

### 3.1 Toast Notifications (토스트 메시지)

**위치:** 화면 우측 하단
**지속 시간:** 3-5초 (타입별 상이)

**Toast 타입:**

**Success (성공):**
- **색상**: 초록색
- **아이콘**: 체크 마크
- **예시**: "Contract created successfully."

**Error (오류):**
- **색상**: 빨간색
- **아이콘**: X 마크
- **예시**: "Failed to create contract. Please try again."

**Warning (경고):**
- **색상**: 주황색
- **아이콘**: 느낌표
- **예시**: "Contract will expire in 5 days."

**Info (정보):**
- **색상**: 파란색
- **아이콘**: 정보 아이콘
- **예시**: "Verification code sent to your email."

**인터랙션:**
- 자동으로 3-5초 후 사라짐
- 우측 X 버튼 클릭: 즉시 닫기

---

### 3.2 In-App Notifications (인앱 알림)

**알림 발생 조건 및 권한별 상세:**

#### A. WM 사용자 알림

**wm_admin, wm_editor, wm_viewer 모두 수신:**

| 알림 타입 | 발생 조건 | 제목 (EN) | 제목 (KO) | 관련 페이지 |
|----------|----------|-----------|-----------|------------|
| `contract_approval_request` | Reseller가 새 계약 생성 시 | New contract approval request from {resellerName} | {resellerName}의 새 계약 승인 요청 | Contract Detail |
| `contract_expiring_soon` | Direct 계약이 30일 이내 만료 예정 | Contract #{contractId} expiring in {days} days | 계약 #{contractId}이(가) {days}일 후 만료 예정 | Contract Detail |
| `contract_expiring_urgent` | Direct 계약이 7일 이내 만료 예정 | Urgent: Contract #{contractId} expiring in {days} days | 긴급: 계약 #{contractId}이(가) {days}일 후 만료 예정 | Contract Detail |
| `payment_overdue` | Direct 고객 결제 연체 시 | Payment overdue for {customerName} | {customerName}의 결제 연체 | Customer Detail |
| `new_reseller_signup` | 새 Reseller 회원가입 시 | New reseller signup: {resellerName} | 새 리셀러 가입: {resellerName} | Reseller Detail |

**wm_admin만 수신:**

| 알림 타입 | 발생 조건 | 제목 (EN) | 제목 (KO) | 관련 페이지 |
|----------|----------|-----------|-----------|------------|
| `user_account_created` | 새 WM 계정 생성 시 | New account created for {email} | {email}의 새 계정 생성됨 | Settings |

---

#### B. Reseller 사용자 알림

**reseller_admin, reseller_editor, reseller_viewer 모두 수신:**

| 알림 타입 | 발생 조건 | 제목 (EN) | 제목 (KO) | 관련 페이지 |
|----------|----------|-----------|-----------|------------|
| `contract_approved` | WM이 계약 승인 시 | Your contract #{contractId} has been approved | 계약 #{contractId}이(가) 승인되었습니다 | Contract Detail |
| `contract_rejected` | WM이 계약 거절 시 | Your contract #{contractId} has been rejected | 계약 #{contractId}이(가) 거절되었습니다 | Contract Detail |
| `contract_expiring_soon` | 자사 계약이 30일 이내 만료 예정 | Contract #{contractId} expiring in {days} days | 계약 #{contractId}이(가) {days}일 후 만료 예정 | Contract Detail |
| `contract_expiring_urgent` | 자사 계약이 7일 이내 만료 예정 | Urgent: Contract #{contractId} expiring in {days} days | 긴급: 계약 #{contractId}이(가) {days}일 후 만료 예정 | Contract Detail |
| `payment_due_soon` | 다음 정산일 7일 전 | Payment due in {days} days: ${amount} | {days}일 후 결제 예정: ${amount} | My Payments |
| `payment_due_urgent` | 다음 정산일 3일 전 | Urgent: Payment due in {days} days | 긴급: {days}일 후 결제 예정 | My Payments |
| `payment_processed` | 정산 처리 완료 시 | Payment of ${amount} has been processed | ${amount} 결제가 처리되었습니다 | My Payments |

**reseller_admin만 수신:**

| 알림 타입 | 발생 조건 | 제목 (EN) | 제목 (KO) | 관련 페이지 |
|----------|----------|-----------|-----------|------------|
| `user_account_created` | 새 Reseller 계정 생성 시 | New account created for {email} | {email}의 새 계정 생성됨 | Settings |
| `user_invitation_sent` | 계정 초대 전송 시 | Invitation sent to {email} | {email}로 초대 전송됨 | Settings |
| `user_invitation_accepted` | 초대 수락 시 | {email} accepted your invitation | {email}님이 초대를 수락했습니다 | Settings |

---

### 3.3 알림 생성 API

**API Endpoint:** `POST /api/notifications`

**요청 필드:**
| 필드 | 타입 | 설명 |
|------|------|------|
| userId | string | 수신 사용자 ID (특정 사용자에게만) |
| resellerId | string \| null | Reseller ID (null for WM users) |
| broadcastToRole | string \| null | 특정 역할 모두에게 전송 (예: "wm_admin") |
| title | string | 알림 제목 |
| description | string | 알림 설명 |
| type | string | 알림 타입 (위 표 참조) |
| relatedId | string \| null | 관련 리소스 ID |
| relatedType | string \| null | 관련 리소스 타입 (contract, customer, payment 등) |

**알림 전송 로직:**

**특정 사용자에게 전송:**
```json
{
  "userId": "user-123",
  "title": "Contract approved",
  "type": "contract_approved",
  "relatedId": "contract-456",
  "relatedType": "contract"
}
```

**특정 역할의 모든 사용자에게 브로드캐스트:**
```json
{
  "resellerId": "reseller-789",
  "broadcastToRole": "reseller_admin",
  "title": "New account created",
  "type": "user_account_created"
}
```

**WM 전체에게 브로드캐스트:**
```json
{
  "resellerId": null,
  "broadcastToRole": "wm_admin",
  "title": "New reseller signup",
  "type": "new_reseller_signup"
}
```

---

### 3.4 알림 우선순위 및 스타일

**긴급 알림 (Urgent):**
- **조건**: 만료 7일 이내, 결제 3일 이내
- **배지 색상**: 빨간색
- **아이콘**: ⚠️
- **알림음**: 있음 (선택사항)

**중요 알림 (Important):**
- **조건**: 승인 요청, 거절, 승인
- **배지 색상**: 주황색
- **아이콘**: 📌

**일반 알림 (Normal):**
- **조건**: 만료 30일 이내, 결제 7일 전
- **배지 색상**: 파란색
- **아이콘**: 📄

**정보 알림 (Info):**
- **조건**: 계정 생성, 초대 수락
- **배지 색상**: 회색
- **아이콘**: ℹ️

---

## 4. 404 Page - 페이지를 찾을 수 없음

**경로:** 존재하지 않는 모든 경로
**접근 권한:** 모든 사용자

### 📐 페이지 구조

#### 섹션 1: 오류 메시지
**기능:**
- 큰 "404" 텍스트
- "Page Not Found" 제목
- 설명 메시지

**표시 정보:**
- **Title (EN)**: "Page Not Found"
- **Title (KO)**: "페이지를 찾을 수 없습니다"
- **Description (EN)**: "The page you are looking for doesn't exist or has been moved."
- **Description (KO)**: "찾으시는 페이지가 존재하지 않거나 이동되었습니다."

---

#### 섹션 2: 액션 버튼
**기능:**
- "Back to Dashboard" 버튼
- "Go Back" 버튼

**인터랙션:**
- "Back to Dashboard" 클릭: `/dashboard` 페이지로 이동
- "Go Back" 클릭: 브라우저 히스토리에서 이전 페이지로 이동

**조건/규칙:**
- 항상 표시

---

## 5. 403 Page - 접근 권한 없음

**경로:** 권한이 없는 페이지 접근 시
**접근 권한:** 로그인한 모든 사용자 (권한 부족 시)

### 📐 페이지 구조

#### 섹션 1: 오류 메시지
**기능:**
- 큰 "403" 텍스트
- "Access Denied" 제목
- 설명 메시지

**표시 정보:**
- **Title (EN)**: "Access Denied"
- **Title (KO)**: "접근 권한 없음"
- **Description (EN)**: "You don't have permission to access this page."
- **Description (KO)**: "이 페이지에 접근할 권한이 없습니다."

**추가 정보 (선택사항):**
- **Required Role (EN)**: "This page requires {role} permission."
- **Required Role (KO)**: "이 페이지는 {role} 권한이 필요합니다."

---

#### 섹션 2: 액션 버튼
**기능:**
- "Back to Dashboard" 버튼
- "Contact Support" 버튼 (선택사항)

**인터랙션:**
- "Back to Dashboard" 클릭: `/dashboard` 페이지로 이동
- "Contact Support" 클릭: `mailto:sales@wondermove.com` 이메일 클라이언트 열기

**조건/규칙:**
- 항상 표시

---

### 🔐 403 발생 시나리오

**시나리오 1: 역할 부족**
- **예시**: `viewer` 역할이 생성/수정 기능 시도
- **처리**: 403 페이지 표시 또는 Toast 메시지

**시나리오 2: 도메인 접근 제한**
- **예시**: Reseller 사용자가 WM 전용 페이지 (`/resellers`) 접근
- **처리**: 403 페이지 표시

**시나리오 3: 데이터 접근 제한**
- **예시**: Reseller가 다른 Reseller의 고객 정보 접근
- **처리**: 403 페이지 또는 404 페이지 (보안상 404 권장)

**백엔드 응답:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to access this resource",
    "requiredRole": "wm_admin" // 선택사항
  }
}
```

---

## 6. Global Modals

### 6.1 Confirmation Dialog (확인 다이얼로그)

**용도:** 위험한 작업 전 확인

**구조:**
- 제목: 작업 이름
- 메시지: 경고 내용
- Cancel 버튼
- Confirm 버튼 (빨간색)

**예시:**
- 계약 삭제 확인
- 계정 삭제 확인
- 고객 삭제 확인

**메시지 템플릿:**
- **EN**: "Are you sure you want to delete this {resource}? This action cannot be undone."
- **KO**: "이 {resource}을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."

---

### 6.2 Loading Overlay (로딩 오버레이)

**용도:** 비동기 작업 진행 중 표시

**구조:**
- 전체 화면 반투명 배경
- 중앙에 스피너 아이콘
- 로딩 메시지 (선택사항)

**표시 조건:**
- API 요청 진행 중
- 파일 업로드 중
- 대용량 데이터 처리 중

---

### 6.3 Error Dialog (오류 다이얼로그)

**용도:** 중요한 오류 발생 시 표시

**구조:**
- 제목: "Error" / "오류"
- 오류 메시지
- OK 버튼

**표시 조건:**
- API 오류 발생 시 (500, 503 등)
- 인증 실패 시
- 권한 부족 시

**메시지 예시:**
- **EN**: "An unexpected error occurred. Please try again later."
- **KO**: "예기치 않은 오류가 발생했습니다. 나중에 다시 시도해 주세요."

---

## 7. 데이터 보안 및 인증

### 7.1 JWT 토큰 관리

**저장 위치:** localStorage
**키 이름:** `authToken`

**토큰 구조:**
```json
{
  "userId": "string",
  "email": "string",
  "name": "string",
  "role": "wm_admin" | "wm_editor" | "wm_viewer" | "reseller_admin" | "reseller_editor" | "reseller_viewer",
  "resellerId": "string | null",
  "exp": "number"
}
```

**토큰 만료 처리:**
1. 토큰 만료 시 자동 로그아웃
2. 로그인 페이지로 리다이렉트
3. localStorage에서 토큰 제거

---

### 7.2 인증 실패 처리

**401 Unauthorized:**
- 자동 로그아웃
- 로그인 페이지로 리다이렉트
- Toast 메시지: "Your session has expired. Please log in again."

**403 Forbidden:**
- 권한 없음 메시지 표시
- Toast 메시지: "You don't have permission to access this resource."

---

### 7.3 CORS 및 보안 헤더

**필수 보안 헤더:**
```
Authorization: Bearer {token}
Content-Type: application/json
X-Requested-With: XMLHttpRequest
```

**CORS 정책:**
- 프로덕션: 특정 도메인만 허용
- 개발: localhost 허용

---

## 8. API 공통 응답 형식

### 8.1 성공 응답

**HTTP 200 OK:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message (optional)"
}
```

**HTTP 201 Created:**
```json
{
  "success": true,
  "data": {
    "id": "created-resource-id",
    ...
  },
  "message": "Resource created successfully"
}
```

---

### 8.2 오류 응답

**HTTP 400 Bad Request:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

**HTTP 401 Unauthorized:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

**HTTP 403 Forbidden:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to access this resource"
  }
}
```

**HTTP 404 Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

**HTTP 500 Internal Server Error:**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

---

## 9. 페이지 로딩 및 성능

### 9.1 Lazy Loading

**구현 대상:**
- 각 페이지 컴포넌트
- 큰 다이얼로그 컴포넌트
- 차트 라이브러리

**예시:**
```typescript
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const ContractsPage = lazy(() => import('./pages/ContractsPage'));
```

---

### 9.2 Skeleton Screens

**표시 조건:**
- 데이터 로딩 중
- 페이지 전환 중

**구현 위치:**
- 테이블 로딩
- 카드 로딩
- 차트 로딩

---

## 7. Language Switcher - Settings 페이지 내

**위치:** Settings 페이지 내부
**접근 권한:** 로그인한 모든 사용자

### 7.1 지원 언어

| 언어 | 코드 | 표시명 |
|------|------|--------|
| English | en | EN |
| 한국어 | ko | KO |

### 7.2 Settings 페이지 내 구현

**위치:** Settings 페이지의 "Preferences" 섹션

**구조:**
- **Label**: "Language" / "언어"
- **Dropdown**: 언어 선택 드롭다운
- **Current Language**: 현재 선택된 언어 표시

**인터랙션:**
- 언어 선택: 드롭다운에서 언어 선택
- 변경 즉시: 전체 애플리케이션 언어 변경 (저장 버튼 불필요)

**데이터 저장:**
- **LocalStorage Key**: `i18nextLng`
- **변경 시 동작**:
  1. localStorage에 언어 코드 저장
  2. i18next를 통해 전체 UI 즉시 변경
  3. 페이지 새로고침 없음

**구현 예시:**
```typescript
import { useTranslation } from 'react-i18next';

function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: 'en' | 'ko') => {
    i18n.changeLanguage(lang);
    // localStorage에 자동 저장됨
  };

  return (
    <Select value={i18n.language} onValueChange={changeLanguage}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="ko">한국어</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

### 7.3 번역 범위

**전체 애플리케이션 번역:**
- ✅ 모든 페이지 제목 및 설명
- ✅ 버튼 텍스트
- ✅ 폼 레이블 및 플레이스홀더
- ✅ 오류 메시지
- ✅ 성공/실패 토스트 메시지
- ✅ 테이블 헤더
- ✅ 다이얼로그 제목 및 내용
- ✅ 알림 메시지
- ✅ Navigation 메뉴
- ✅ 404/403 페이지

**번역 파일 위치:**
- `/src/locales/en/common.json`
- `/src/locales/ko/common.json`

**번역 키 구조:**
```json
{
  "auth": { ... },
  "nav": { ... },
  "dashboard": { ... },
  "customers": { ... },
  "contracts": { ... },
  "payments": { ... },
  "settings": { ... },
  "notifications": { ... },
  "common": { ... }
}
```

**상세 번역 키는 `common-api-spec.md` Section 6 참조**

---

## 문서 종료

이 문서는 WM Sales Portal의 전역 구조 및 공통 기능에 대한 명세를 포함합니다.

**관련 문서:**
- `common-api-spec.md` - 공통 인증 페이지 및 i18n 번역 키
- `wm-api-spec.md` - WM 도메인 페이지
- `reseller-api-spec.md` - Reseller 도메인 페이지

---

**작성 완료일:** 2025-01-16
