# Common API Specification
# WM Sales Portal - 공통 API 명세

**문서 버전:** 2.0
**최종 업데이트:** 2025-01-16
**작성자:** Product Team

---

## 📑 목차

1. [시스템 개요](#1-시스템-개요)
2. [권한 및 역할 정의](#2-권한-및-역할-정의)
3. [공통 데이터 모델](#3-공통-데이터-모델)
4. [인증 페이지](#4-인증-페이지)
5. [공통 페이지](#5-공통-페이지)
6. [다국어 지원 (i18n)](#6-다국어-지원-i18n)

**📌 참고 문서:**
- **전역 구조**: `global-structure-spec.md` - 네비게이션, 알림, 404 페이지 등
- **WM 도메인**: `wm-api-spec.md` - WM 전용 페이지
- **Reseller 도메인**: `reseller-api-spec.md` - Reseller 전용 페이지

---

## 1. 시스템 개요

### 1.1 프로젝트 소개

**WM Sales Portal**은 WM(WonderMove)과 Reseller 파트너사가 고객 계약 및 결제를 관리하는 B2B 플랫폼입니다.

**주요 사용자:**
- **WM 직원**: 고객 관리, 리셀러 관리, 계약 승인, 결제 관리
- **Reseller 직원**: 자사 고객 관리, 계약 등록, 결제 확인

**핵심 기능:**
- 고객(Customer) 관리
- 계약(Contract) 관리 및 승인 워크플로우
- 결제(Payment) 내역 관리
- 리셀러(Reseller) 관리 (WM 전용)
- 역할 기반 접근 제어 (RBAC)

### 1.2 도메인 구조

향후 WM 도메인과 Reseller 도메인이 분리될 예정입니다.

**현재:**
- 단일 애플리케이션
- 역할 기반 화면/기능 분기

**향후 (계획):**
- `wm.salesportal.com` - WM 전용 도메인
- `reseller.salesportal.com` - Reseller 전용 도메인
- 공통 리소스 (인증, 일부 공통 페이지) 공유

**문서 구조:**
- `common-api-spec.md` (본 문서) - 공통 인증, 공통 페이지
- `wm-api-spec.md` - WM 도메인 전용 페이지
- `reseller-api-spec.md` - Reseller 도메인 전용 페이지

---

## 2. 권한 및 역할 정의

### 2.1 역할 (Roles)

#### 2.1.1 WM 역할

| 역할 | 코드 | 설명 |
|------|------|------|
| **WM Admin** | `wm_admin` | 모든 기능 접근 가능, 삭제 권한 포함 |
| **WM Editor** | `wm_editor` | 생성/수정 가능, 삭제 불가 |
| **WM Viewer** | `wm_viewer` | 조회만 가능 (읽기 전용) |

#### 2.1.2 Reseller 역할

| 역할 | 코드 | 설명 |
|------|------|------|
| **Reseller Admin** | `reseller_admin` | 자사 고객/계약 관리, 계정 생성 |
| **Reseller Editor** | `reseller_editor` | 자사 고객/계약 생성/수정 |
| **Reseller Viewer** | `reseller_viewer` | 자사 데이터 조회만 가능 |

### 2.2 권한 매트릭스

| 기능 | wm_admin | wm_editor | wm_viewer | reseller_admin | reseller_editor | reseller_viewer |
|------|----------|-----------|-----------|----------------|-----------------|-----------------|
| **Dashboard 조회** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **고객 조회** | ✅ | ✅ | ✅ | ✅ (자사만) | ✅ (자사만) | ✅ (자사만) |
| **고객 추가** | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| **고객 수정** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **고객 삭제** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **계약 조회** | ✅ | ✅ | ✅ | ✅ (자사만) | ✅ (자사만) | ✅ (자사만) |
| **계약 추가** | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| **계약 승인/거절** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **노트 추가/수정** | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| **노트 삭제** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **리셀러 관리** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **결제 내역 조회** | ✅ (전체) | ❌ | ✅ (전체) | ✅ (자사만) | ✅ (자사만) | ✅ (자사만) |
| **계정 생성** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **계정 수정** | ✅ | ❌ | ❌ | ✅ (자사만) | ❌ | ❌ |

### 2.3 데이터 접근 범위

#### WM 사용자
- ✅ **조회/관리**: Direct 고객 (`resellerId === null`)만
- ✅ **조회/관리**: Direct 계약 (`resellerId === null`)만
- ✅ **조회/관리**: Direct 결제만
- ✅ **조회/관리**: 모든 리셀러 데이터
- ✅ **승인/거절**: Reseller가 등록한 계약 승인/거절
- ❌ **제한**: Reseller 고객/계약 조회 불가

#### Reseller 사용자
- ✅ **조회/관리**: 자사 고객만 (`customer.resellerId === user.resellerId`)
- ✅ **조회/관리**: 자사 계약만 (`contract.resellerId === user.resellerId`)
- ✅ **조회**: 자사 결제만 (`payment.resellerId === user.resellerId`)
- ❌ **제한**: Direct 데이터 접근 불가 (`resellerId === null`)
- ❌ **제한**: 타 Reseller 데이터 접근 불가
- ❌ **제한**: 리셀러 목록 조회 불가

**백엔드 필터링 필수:**
- **WM 사용자**: 모든 조회 API에 `WHERE resellerId IS NULL` 조건 자동 적용
- **Reseller 사용자**: 모든 조회 API에 `WHERE resellerId = {user.resellerId}` 조건 자동 적용
- 잘못된 접근 시도 시 `403 Forbidden` 또는 빈 결과 반환

**데이터 격리 원칙 요약:**

| 사용자 타입 | 조회/관리 범위 | SQL 필터링 조건 |
|------------|---------------|----------------|
| **WM** | Direct 데이터만 (`resellerId === null`) | `WHERE resellerId IS NULL` |
| **Reseller** | 자사 데이터만 (`resellerId === user.resellerId`) | `WHERE resellerId = {user.resellerId}` |

**⚠️ 중요:** WM과 Reseller는 완전히 격리된 데이터를 관리합니다. 서로의 고객/계약 데이터를 조회할 수 없습니다.

---

## 3. 공통 데이터 모델

### 3.1 User (사용자)

**설명:** 시스템 사용자 (WM 직원 또는 Reseller 직원)

**필수 필드:**
- `id` (string): 사용자 고유 ID
- `email` (string): 이메일 (로그인 ID)
- `name` (string): 사용자 이름
- `role` (UserRole): 역할
- `resellerId` (string, optional): Reseller 사용자인 경우 리셀러 ID
- `resellerName` (string, optional): Reseller 사용자인 경우 리셀러 이름

**UserRole 값:**
- `wm_admin`, `wm_editor`, `wm_viewer`
- `reseller_admin`, `reseller_editor`, `reseller_viewer`

---

### 3.2 Customer (고객)

**설명:** 서비스를 이용하는 고객사

**필수 필드:**
- `id` (string): 고객 고유 ID
- `companyName` (string): 회사명
- `companyId` (string): 고객사 ID (예: "CP-2025-001")
- `businessRegNo` (string): 사업자등록번호
- `country` (string): 국가
- `contactPerson` (string): 담당자 이름
- `email` (string): 담당자 이메일
- `createdAt` (string): 생성일 (형식: "YYYY. MM. DD")
- `resellerId` (string, optional): 리셀러 ID
  - `null` 또는 없음: WM 직접 고객 (Direct)
  - 값 있음: Reseller를 통한 고객
- `services` (string[]): 이용 서비스 목록

**선택 필드:**
- `createdAtTimestamp` (number): 생성일 타임스탬프 ("New" 뱃지 표시 용도)

---

### 3.3 Contract (계약)

**설명:** 고객과 체결한 서비스 계약

**필수 필드:**
- `id` (string): 계약 고유 ID
- `customerId` (string): 고객 ID
- `contractType` (string): 계약 유형 (`"reseller"` | `"direct"`)
- `resellerId` (string, optional): Reseller 계약인 경우 리셀러 ID
- `reseller` (string): Reseller 이름 (Direct인 경우 "N/A")
- `serviceName` (string): 서비스 이름
- `pricingModel` (string): 가격 모델
  - `"Fixed Rate"`: 고정 금액
  - `"Pay-as-you-go"`: 종량제
  - `"Trial"`: 평가판
- `startDate` (string): 계약 시작일 (형식: "YYYY. MM. DD")
- `endDate` (string | null): 계약 종료일
  - `null`: 종료일 없음
  - 형식: "YYYY. MM. DD"
- `amount` (string): 계약 금액 (형식: "$X,XXX")
- `billingCycle` (string): 결제 주기 (예: "Monthly", "Annually")
- `billingInfo` (object): 결제 상세 정보 (가격 모델에 따라 다름)
- `status` (string): 계약 상태
  - `"active"`: 활성
  - `"inactive"`: 비활성
  - `"expired"`: 만료
- `approvalStatus` (string): 승인 상태
  - `"pending"`: 승인 대기
  - `"approved"`: 승인됨
  - `"rejected"`: 거절됨
  - `"cancelled"`: 취소됨
- `details` (string): 계약 상세 정보

**선택 필드:**
- `billingEmails` (string[]): Billing 이메일 목록
- `rejectedReason` (string): 거절 사유 (rejected 상태일 때만)
- `createdAt` (string): 생성일
- `updatedAt` (string): 수정일

**billingInfo 구조 (가격 모델별):**

**고정 요금:**
- `amount` (number): 계약 금액
- `taxIncluded` (boolean): 세금 포함 여부

**종량제:**
- `vcpuUnitPrice` (string): vCPU 단가 (형식: "$100 / vCPU / hour")
- `minimumCharge` (string): 최소 청구 금액 (형식: "$1000 / month")
- `taxIncluded` (boolean): 세금 포함 여부

**계약 ID 표시 형식:**
- 저장: `"contract-1"`, `"contract-2"`
- 화면 표시: `"C-00001"`, `"C-00002"` (프론트엔드에서 변환)

**ApprovalStatus 상태 전환:**
```
pending → approved  (WM이 승인)
pending → rejected  (WM이 거절)
pending → cancelled (Reseller가 제출 취소)
rejected → pending  (Reseller가 재등록)
```

---

### 3.4 Payment (결제)

**설명:** 고객의 결제 내역

**필수 필드:**
- `id` (string): 결제 고유 ID
- `customerId` (string): 고객 ID
- `invoiceNo` (string): 인보이스 번호
- `period` (string): 결제 기간 (형식: "YYYY. MM - YYYY. MM")
- `date` (string): 결제일 (형식: "YYYY. MM. DD")
- `service` (string): 서비스 이름
- `status` (string): 결제 상태
  - `"paid"`: 완납
  - `"unpaid"`: 미납 (화면에서 "Pending"으로 표시)
  - `"overdue"`: 부분 납부 (화면에서 "Partial"로 표시)
- `paidAmount` (string): 지불 금액 (형식: "$X,XXX")
- `difference` (string): 차액 (형식: "$X,XXX" 또는 "$0")

**화면 표시 규칙:**
- `difference`가 "$0" 또는 "$0.00"이 아니면 빨강색으로 강조

---

### 3.5 Note (노트)

**설명:** 고객에 대한 메모

**필수 필드:**
- `id` (string): 노트 고유 ID
- `customerId` (string): 고객 ID
- `content` (string): 노트 내용
- `author` (string): 작성자 이름
- `createdAt` (string): 작성일 (형식: "YYYY. MM. DD")

---

### 3.6 Reseller (리셀러)

**설명:** 파트너 리셀러 회사

**필수 필드:**
- `id` (string): 리셀러 고유 ID
- `companyName` (string): 회사명
- `businessRegNo` (string): 사업자등록번호
- `country` (string): 국가
- `contactPerson` (string): 담당자 이름
- `email` (string): 담당자 이메일
- `createdAt` (string): 등록일 (형식: "YYYY. MM. DD")
- `services` (Service[]): 제공 서비스 목록

**Service 모델:**
- `id` (string): 서비스 고유 ID
- `name` (string): 서비스 이름
- `pricing` (number): 가격

---

## 4. 인증 페이지

---

## 🔐 4.1 Login

**URL:** `/login`
**접근:** Public (인증 불필요)

### 🎯 주요 기능
- 이메일/비밀번호로 로그인
- 역할에 따라 적절한 Dashboard로 리다이렉트
- JWT 토큰 발급 및 localStorage에 저장

### 📐 페이지 구조

#### 섹션 1: Logo
**기능:**
- Skuber 로고 + "Sales Portal" 텍스트 표시

**조건/규칙:**
- 항상 표시

#### 섹션 2: Login Form Card
**기능:**
- 이메일/비밀번호 입력 폼
- 로그인 버튼
- Forgot Password 링크

**표시 정보:**
- Card Title: "Login to your account"
- Card Description: "Enter your email below to login to your account"
- Email 입력 필드
- Password 입력 필드
- Login 버튼
- "Forgot your password?" 링크

**인터랙션:**
- Email 입력: 텍스트 입력
- Password 입력: 텍스트 입력 (마스킹)
- Enter 키: Login 버튼과 동일 동작
- "Login" 버튼 클릭: 로그인 시도
- "Forgot your password?" 링크 클릭: `/forgot-password` 페이지로 이동

**조건/규칙:**
- **Login 버튼 활성화:** 항상 활성화 (Validation은 클릭 시)
- **Login 버튼 비활성화:** 로딩 중 (`isLoading === true`)
- **로딩 상태:**
  - 버튼 텍스트: "Logging in..."
  - Spinner 아이콘 표시
  - 입력 필드 비활성화

### 📝 입력 필드

| 필드명 | 타입 | 필수 | Placeholder |
|--------|------|------|-------------|
| email | string | ✅ | Enter email |
| password | string | ✅ | Enter password |

### ✅ Validation

| 필드 | 규칙 | 에러 메시지 (EN) | 에러 메시지 (KO) |
|------|------|------------------|------------------|
| email | Required | Email is required | 이메일은 필수입니다 |
| email | Email format | Invalid email address | 올바른 이메일 주소를 입력해 주세요 |
| password | Required | Password is required | 비밀번호는 필수입니다 |
| password | Min 8 chars | Password must be at least 8 characters | 비밀번호는 최소 8자 이상이어야 합니다 |

### 📊 필요한 데이터

**요청 데이터:**
- email
- password

**응답 데이터 (성공):**
- JWT 토큰
- User 정보 ([3.1 User 모델](#31-user-사용자) 참조)

**응답 데이터 (실패):**
- 에러 코드: `INVALID_CREDENTIALS`
- 에러 메시지: "Invalid email or password"

### 🔄 동작 흐름

1. 사용자가 이메일/비밀번호 입력
2. "Login" 버튼 클릭 (또는 Enter 키)
3. **프론트엔드 Validation:**
   - 이메일 형식 체크
   - 비밀번호 최소 길이 체크
   - 실패 시 해당 필드 아래에 에러 메시지 표시, API 호출 안 함
4. Validation 통과 시 로딩 상태 표시
5. 로그인 API 호출
6. **성공 시:**
   - localStorage에 `token`, `user` 저장
   - **WM 사용자 (`user.role.startsWith('wm_')`):** `/dashboard`로 이동 (WM Dashboard)
   - **Reseller 사용자 (`user.role.startsWith('reseller_')`):** `/dashboard`로 이동 (Reseller Dashboard)
7. **실패 시:**
   - 에러 메시지 폼 하단에 표시
   - 입력 필드 초기화 안 함 (이메일 유지)
   - 로딩 상태 해제

### ➡️ 페이지 이동

| 액션 | 조건 | 이동 URL |
|------|------|----------|
| Login 성공 (WM) | user.role.startsWith('wm_') | `/dashboard` (WM Dashboard) |
| Login 성공 (Reseller) | user.role.startsWith('reseller_') | `/dashboard` (Reseller Dashboard) |
| Login 실패 | - | 현재 페이지 유지 |
| "Forgot Password" 링크 | - | `/forgot-password` |

### 💾 저장 데이터

**localStorage:**
- `token`: JWT 토큰 (string)
- `user`: User 정보 (JSON string)

---

## 🔐 4.2 Forgot Password

**URL:** `/forgot-password`
**접근:** Public

### 🎯 주요 기능
- 등록된 이메일로 비밀번호 재설정 인증 코드 전송
- 다음 단계(Verify Code)로 진행

### 📐 페이지 구조

#### 섹션 1: Logo
**기능:**
- Skuber 로고 + "Sales Portal" 텍스트 표시

**조건/규칙:**
- 항상 표시

#### 섹션 2: Forgot Password Form Card
**기능:**
- 이메일 입력 폼
- Find Password 버튼
- Back to sign-in 링크

**표시 정보:**
- Card Title: "Finding Password"
- Card Description: "Enter your email below to find your password"
- Email 입력 필드
- "Find Password" 버튼
- 하단 텍스트:
  - 첫 줄: "Do you want to sign in again?"
  - 둘째 줄 (링크): "Back to sign-in" (밑줄)

**인터랙션:**
- Email 입력: 텍스트 입력
- Enter 키: Find Password 버튼과 동일 동작
- "Find Password" 버튼 클릭: 인증 코드 전송 시도
- "Back to sign-in" 링크 클릭: `/login` 페이지로 이동

**조건/규칙:**
- **Find Password 버튼 활성화:** 항상 활성화
- **Find Password 버튼 비활성화:** 로딩 중
- **로딩 상태:**
  - 버튼 텍스트: "Sending..."
  - Spinner 아이콘 표시
  - 입력 필드 비활성화

### 📝 입력 필드

| 필드명 | 타입 | 필수 | Placeholder |
|--------|------|------|-------------|
| email | string | ✅ | Enter email |

### ✅ Validation

| 필드 | 규칙 | 에러 메시지 (EN) | 에러 메시지 (KO) |
|------|------|------------------|------------------|
| email | Required | Email is required | 이메일은 필수입니다 |
| email | Email format | Invalid email address | 올바른 이메일 주소를 입력해 주세요 |

### 📊 필요한 데이터

**요청 데이터:**
- email

**응답 데이터 (성공):**
- 성공 메시지

**응답 데이터 (실패 - 계정 없음):**
- 에러 코드: `ACCOUNT_NOT_FOUND`
- 에러 메시지: "No account found with this email address"

**백엔드 처리:**
- 이메일 존재 여부 확인 **필수**
- 존재하면: 6자리 인증 코드 생성 및 이메일 발송
- 존재하지 않으면: 에러 반환

### 🔄 동작 흐름

1. 사용자가 이메일 입력
2. "Find Password" 버튼 클릭
3. **프론트엔드 Validation:**
   - 이메일 형식 체크
   - 실패 시 에러 메시지 표시, API 호출 안 함
4. Validation 통과 시 로딩 상태 표시
5. 인증 코드 전송 API 호출
6. **성공 시:**
   - sessionStorage에 `resetPasswordEmail` 저장
   - `/verify-code` 페이지로 즉시 이동
7. **실패 시 (계정 없음):**
   - 에러 메시지 폼 하단에 표시: "No account found with this email address" / "해당 이메일로 등록된 계정을 찾을 수 없습니다"
   - 로딩 상태 해제
   - 현재 페이지 유지

### ➡️ 페이지 이동

| 액션 | 조건 | 이동 URL |
|------|------|----------|
| Find Password 성공 | - | `/verify-code` |
| Find Password 실패 | - | 현재 페이지 유지 |
| "Back to sign-in" 링크 | - | `/login` |

### 💾 저장 데이터

**sessionStorage:**
- `resetPasswordEmail`: 입력한 이메일 (다음 단계에서 재사용)

---

## 🔐 4.3 Verify Code

**URL:** `/verify-code`
**접근:** Public

### 🎯 주요 기능
- 이메일로 받은 6자리 인증 코드 검증
- 인증 성공 시 비밀번호 재설정 페이지로 이동
- 코드 재전송 기능

### 📐 페이지 구조

#### 섹션 1: Logo
**기능:**
- Skuber 로고 + "Sales Portal" 텍스트 표시

**조건/규칙:**
- 항상 표시

#### 섹션 2: Verify Code Form Card
**기능:**
- 6자리 코드 입력 필드 (6개의 개별 입력 칸)
- Verify 버튼
- Resend 링크
- Back to previous page 링크

**표시 정보:**
- Card Title: "Enter verification code"
- Card Description: "We sent a 6-digit code to your email."
- 입력 안내: "Enter the 6-digit code sent to your email."
- 6개의 코드 입력 칸
- "Verify" 버튼
- 하단 텍스트:
  - "Didn't receive the code?"
  - "Resend" 링크
  - "or"
  - "Back to previous page" 링크

**인터랙션:**
- 코드 입력:
  - 각 칸에 숫자 1자리 입력
  - 자동 포커스 이동 (다음 칸으로)
  - Backspace 시 이전 칸으로 포커스 이동
- 6자리 입력 완료 시: 자동 검증 (또는 Verify 버튼 클릭)
- "Verify" 버튼 클릭: 코드 검증 시도
- "Resend" 링크 클릭: 새 코드 전송
- "Back to previous page" 링크 클릭: `/forgot-password` 페이지로 이동

**조건/규칙:**
- **Verify 버튼 활성화:** 6자리 모두 입력 완료
- **Verify 버튼 비활성화:** 6자리 미만 입력 또는 로딩 중
- **Resend 링크 활성화:** 항상 활성화
- **로딩 상태:**
  - 버튼 텍스트: "Verifying..."
  - Spinner 아이콘 표시
  - 입력 필드 비활성화

### 📝 입력 필드

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| code | string | ✅ | 6자리 인증 코드 (숫자만) |

### ✅ Validation

| 필드 | 규칙 | 에러 메시지 (EN) | 에러 메시지 (KO) |
|------|------|------------------|------------------|
| code | Required | Verification code is required | 인증 코드를 입력해 주세요 |
| code | 6 digits | Code must be 6 digits | 인증 코드는 6자리여야 합니다 |
| code | Numeric only | Code must contain only numbers | 인증 코드는 숫자만 입력 가능합니다 |

### 📊 필요한 데이터

**인증 코드 검증 요청:**
- email (sessionStorage에서 가져옴)
- code (6자리)

**응답 데이터 (성공):**
- 임시 리셋 토큰 (비밀번호 재설정 단계에서 사용)

**응답 데이터 (실패):**
- 에러 코드: `INVALID_CODE`
- 에러 메시지: "Invalid verification code. Please try again."

**코드 재전송 요청:**
- email (sessionStorage에서 가져옴)

**응답 데이터 (재전송 성공):**
- 성공 메시지

### 🔄 동작 흐름

**코드 입력 및 검증:**
1. 6자리 코드 입력
2. 각 입력 칸에 숫자 1자리씩 자동 포커스 이동
3. 6자리 입력 완료 시 "Verify" 버튼 활성화
4. "Verify" 버튼 클릭 (또는 6자리 입력 완료 시 자동 검증)
5. 로딩 상태 표시
6. 코드 검증 API 호출
7. **성공 시:**
   - sessionStorage에 `resetToken` 저장
   - `/reset-password` 페이지로 이동
8. **실패 시:**
   - 에러 메시지 표시: "Invalid verification code. Please try again." / "유효하지 않은 인증 코드입니다. 다시 시도해 주세요"
   - 코드 입력 초기화
   - 첫 번째 입력 칸에 포커스

**코드 재전송:**
1. "Resend" 링크 클릭
2. 재전송 API 호출
3. **성공 시:**
   - Toast 메시지 표시: "Verification code resent to your email" / "인증 코드가 이메일로 재전송되었습니다"
4. **실패 시:**
   - Toast 에러 메시지 표시

### ➡️ 페이지 이동

| 액션 | 조건 | 이동 URL |
|------|------|----------|
| Verify 성공 | - | `/reset-password` |
| Verify 실패 | - | 현재 페이지 유지 |
| "Back to previous page" 링크 | - | `/forgot-password` |

### 💾 저장 데이터

**sessionStorage:**
- `resetToken`: 임시 리셋 토큰 (비밀번호 재설정용)

---

## 🔐 4.4 Reset Password

**URL:** `/reset-password`
**접근:** Public (단, resetToken 필요)

### 🎯 주요 기능
- 새 비밀번호 입력 및 확인
- 비밀번호 재설정 완료 후 로그인 페이지로 이동
- 비밀번호 표시/숨김 토글

### 📐 페이지 구조

#### 섹션 1: Logo
**기능:**
- Skuber 로고 + "Sales Portal" 텍스트 표시

**조건/규칙:**
- 항상 표시

#### 섹션 2: Reset Password Form Card
**기능:**
- 새 비밀번호 입력 폼
- 비밀번호 확인 입력 폼
- Apply New Password 버튼
- Back to sign-in 링크

**표시 정보:**
- Card Title: "New password"
- Card Description: "Please enter a new password"
- New Password 입력 필드 (눈 아이콘 포함)
- Confirm New Password 입력 필드 (눈 아이콘 포함)
- "Apply New Password" 버튼
- 하단 텍스트:
  - 첫 줄: "Do you want to sign in again?"
  - 둘째 줄 (링크): "Back to sign-in" (밑줄)

**인터랙션:**
- New Password 입력: 텍스트 입력 (마스킹)
- Confirm New Password 입력: 텍스트 입력 (마스킹)
- 눈 아이콘 클릭: 비밀번호 표시/숨김 토글
- Enter 키: Apply New Password 버튼과 동일 동작
- "Apply New Password" 버튼 클릭: 비밀번호 재설정 시도
- "Back to sign-in" 링크 클릭: `/login` 페이지로 이동

**조건/규칙:**
- **Apply 버튼 활성화:** 항상 활성화
- **Apply 버튼 비활성화:** 로딩 중
- **로딩 상태:**
  - 버튼 텍스트: "Applying..."
  - Spinner 아이콘 표시
  - 입력 필드 비활성화
- **비밀번호 표시/숨김:**
  - 기본: 마스킹 (type="password")
  - 눈 아이콘 클릭: type="text"로 변경

### 📝 입력 필드

| 필드명 | 타입 | 필수 | Placeholder |
|--------|------|------|-------------|
| password | string | ✅ | Enter new password |
| confirmPassword | string | ✅ | Enter new password again |

### ✅ Validation

| 필드 | 규칙 | 에러 메시지 (EN) | 에러 메시지 (KO) |
|------|------|------------------|------------------|
| password | Required | Password is required | 비밀번호는 필수입니다 |
| password | Min 8 chars | Password must be at least 8 characters | 비밀번호는 최소 8자 이상이어야 합니다 |
| confirmPassword | Required | Confirm password is required | 비밀번호 확인은 필수입니다 |
| confirmPassword | Match | Passwords don't match | 비밀번호가 일치하지 않습니다 |

### 📊 필요한 데이터

**요청 데이터:**
- resetToken (sessionStorage에서 가져옴)
- password (새 비밀번호)

**응답 데이터 (성공):**
- 성공 메시지

**응답 데이터 (실패 - 토큰 만료):**
- 에러 코드: `TOKEN_EXPIRED`
- 에러 메시지

### 🔄 동작 흐름

1. 새 비밀번호 및 확인 입력
2. 눈 아이콘으로 비밀번호 표시/숨김 토글 가능
3. "Apply New Password" 버튼 클릭
4. **프론트엔드 Validation:**
   - 비밀번호 최소 길이 체크
   - 비밀번호 일치 여부 체크
   - 실패 시 해당 필드 아래 에러 메시지 표시
5. Validation 통과 시 로딩 상태 표시
6. 비밀번호 재설정 API 호출
7. **성공 시:**
   - sessionStorage 초기화 (`resetPasswordEmail`, `resetToken` 삭제)
   - Toast 메시지 표시: "Password reset successful" / "비밀번호 재설정 완료"
   - 1초 후 `/login` 페이지로 이동
8. **실패 시 (토큰 만료):**
   - 에러 메시지 표시
   - 로딩 상태 해제

### ➡️ 페이지 이동

| 액션 | 조건 | 이동 URL |
|------|------|----------|
| Apply 성공 | - | `/login` (1초 딜레이 후) |
| Apply 실패 | - | 현재 페이지 유지 |
| "Back to sign-in" 링크 | - | `/login` |

### 💾 저장 데이터

**sessionStorage 초기화:**
- `resetPasswordEmail` 삭제
- `resetToken` 삭제

---

## 🔐 4.5 Expired Code

**URL:** `/expired-code`
**접근:** Public

### 🎯 주요 기능
- 인증 코드 만료 시 표시되는 페이지
- 새 코드 재전송 요청
- 로그인 페이지로 돌아가기

### 📐 페이지 구조

#### 섹션 1: Logo
**기능:**
- Skuber 로고 + "Sales Portal" 텍스트 표시

**조건/규칙:**
- 항상 표시

#### 섹션 2: Expired Code Card
**기능:**
- 만료 안내 메시지
- Send New Code 버튼
- Back to sign-in 링크

**표시 정보:**
- Card Title: "Verification Code Expired"
- Card Description: "This reset link has expired. Please request a new code to continue."
- "Send New Code" 버튼
- 하단 텍스트:
  - 첫 줄: "Want to sign in instead?"
  - 둘째 줄 (링크): "Back to sign-in" (밑줄)

**인터랙션:**
- "Send New Code" 버튼 클릭: 새 코드 전송 시도
- "Back to sign-in" 링크 클릭: `/login` 페이지로 이동

**조건/규칙:**
- **페이지 로드 시:**
  - sessionStorage에서 `resetPasswordEmail` 확인
  - 없으면: `/forgot-password`로 즉시 리다이렉트
- **Send New Code 버튼 활성화:** 항상 활성화
- **Send New Code 버튼 비활성화:** 로딩 중
- **로딩 상태:**
  - 버튼 텍스트: "Sending..."
  - Spinner 아이콘 표시

### 📊 필요한 데이터

**새 코드 전송 요청:**
- email (sessionStorage에서 가져옴)

**응답 데이터 (성공):**
- 성공 메시지

### 🔄 동작 흐름

**페이지 로드:**
1. sessionStorage에서 `resetPasswordEmail` 확인
2. **이메일 없으면:** `/forgot-password`로 리다이렉트
3. **이메일 있으면:** 페이지 정상 표시

**새 코드 전송:**
1. "Send New Code" 버튼 클릭
2. 로딩 상태 표시
3. 저장된 이메일로 새 코드 전송 API 호출
4. **성공 시:**
   - Toast 메시지 표시: "New code sent" / "새 코드 전송됨"
   - `/verify-code` 페이지로 이동
5. **실패 시:**
   - Toast 에러 메시지 표시

**Back to sign-in:**
1. "Back to sign-in" 링크 클릭
2. sessionStorage 초기화 (`resetPasswordEmail` 삭제)
3. `/login` 페이지로 이동

### ➡️ 페이지 이동

| 액션 | 조건 | 이동 URL |
|------|------|----------|
| 페이지 로드 시 이메일 없음 | sessionStorage에 email 없음 | `/forgot-password` |
| Send New Code 성공 | - | `/verify-code` |
| "Back to sign-in" 링크 | - | `/login` |

### 💾 저장 데이터

**sessionStorage 유지:**
- `resetPasswordEmail`: 기존 저장된 이메일 (Send New Code에 사용)

**sessionStorage 삭제 (Back to sign-in 시):**
- `resetPasswordEmail` 삭제

---

## 🔐 4.6 Reseller Signup

**URL:** `/reseller-signup`
**접근:** Public (초대 링크 통해서만 접근)

### 🎯 주요 기능
- 리셀러 초대 링크로 새 계정 생성
- 리셀러 정보 자동 연결
- 역할은 `reseller_admin`으로 고정

### 📐 페이지 구조

#### 섹션 1: Logo
**기능:**
- Skuber 로고 + "Sales Portal" 텍스트 표시

**조건/규칙:**
- 항상 표시

#### 섹션 2: Reseller Signup Form Card
**기능:**
- 계정 생성 폼
- Create Account 버튼
- Sign in 링크

**표시 정보:**
- Card Title: "Create your account"
- Card Description: "Enter your email below to create your account"
- Full Name 입력 필드
- Email 입력 필드
- Password 입력 필드
- Confirm Password 입력 필드
- "Create Account" 버튼
- 하단 텍스트: "Already have an account?" + "Sign in" 링크

**인터랙션:**
- Name 입력: 텍스트 입력
- Email 입력: 텍스트 입력
- Password 입력: 텍스트 입력 (마스킹)
- Confirm Password 입력: 텍스트 입력 (마스킹)
- "Create Account" 버튼 클릭: 계정 생성 시도
- "Sign in" 링크 클릭: `/login` 페이지로 이동

**조건/규칙:**
- **페이지 로드 시:**
  - URL에서 `inviteToken` 파라미터 추출
  - 토큰 없으면: 에러 페이지 또는 로그인으로 리다이렉트
- **Create Account 버튼 활성화:** 항상 활성화
- **Create Account 버튼 비활성화:** 로딩 중
- **로딩 상태:**
  - 버튼 텍스트: "Creating..."
  - Spinner 아이콘 표시
  - 입력 필드 비활성화

### 📝 입력 필드

| 필드명 | 타입 | 필수 | Placeholder |
|--------|------|------|-------------|
| name | string | ✅ | Enter full name |
| email | string | ✅ | Enter email |
| password | string | ✅ | Enter password |
| confirmPassword | string | ✅ | Confirm password |

### ✅ Validation

| 필드 | 규칙 | 에러 메시지 (EN) | 에러 메시지 (KO) |
|------|------|------------------|------------------|
| name | Required | Name is required | 이름은 필수입니다 |
| email | Required | Email is required | 이메일은 필수입니다 |
| email | Email format | Invalid email address | 올바른 이메일 주소를 입력해 주세요 |
| password | Required | Password is required | 비밀번호는 필수입니다 |
| password | Min 8 chars | Password must be at least 8 characters | 비밀번호는 최소 8자 이상이어야 합니다 |
| confirmPassword | Match | Passwords don't match | 비밀번호가 일치하지 않습니다 |

### 📊 필요한 데이터

**요청 데이터:**
- inviteToken (URL 파라미터에서 추출)
- name
- email
- password

**응답 데이터 (성공):**
- 성공 메시지
- User 정보 (선택)

**응답 데이터 (실패 - 잘못된 초대 링크):**
- 에러 코드: `INVALID_INVITE_TOKEN`
- 에러 메시지: "Invalid invitation link. Please use the link from your invitation email."

### 🔄 동작 흐름

1. 초대 링크 클릭 시 페이지 로드
2. URL에서 `inviteToken` 파라미터 추출
3. **토큰 없으면:** 에러 메시지 표시
4. 사용자 정보 입력
5. "Create Account" 버튼 클릭
6. **프론트엔드 Validation:**
   - 모든 필드 체크
   - 비밀번호 일치 확인
   - 실패 시 해당 필드 아래 에러 메시지 표시
7. Validation 통과 시 로딩 상태 표시
8. 계정 생성 API 호출
9. **성공 시:**
   - Toast 메시지 표시: "Account created successfully" / "계정이 생성되었습니다"
   - `/login` 페이지로 이동
10. **실패 시 (잘못된 토큰):**
    - 에러 메시지 표시: "Invalid invitation link..." / "유효하지 않은 초대 링크..."

### ➡️ 페이지 이동

| 액션 | 조건 | 이동 URL |
|------|------|----------|
| Create Account 성공 | - | `/login` |
| Create Account 실패 | - | 현재 페이지 유지 |
| "Sign in" 링크 | - | `/login` |

---

## 🔐 4.7 User Signup

**URL:** `/user-signup`
**접근:** Public (초대 링크 통해서만 접근)

### 🎯 주요 기능
- WM 또는 Reseller 조직 내 사용자 초대 링크로 계정 생성
- 역할이 초대 링크에 포함됨 (Admin, Editor, Viewer 등)

**참고:** Reseller Signup과 동일하지만, 역할이 Admin이 아닐 수 있음

### 📐 페이지 구조

Reseller Signup과 동일

### 📝 입력 필드

Reseller Signup과 동일

### ✅ Validation

Reseller Signup과 동일

### 📊 필요한 데이터

**요청 데이터:**
- inviteToken (역할 정보 포함)
- name
- email
- password

**응답 데이터:**
Reseller Signup과 동일

### 🔄 동작 흐름

Reseller Signup과 동일

### ➡️ 페이지 이동

Reseller Signup과 동일

---

## 5. 페이지별 API 명세

**📌 중요:** 모든 페이지는 WM과 Reseller가 다른 데이터를 조회하므로, 각 도메인 문서를 참조하세요:

- **WM 페이지**: `wm-api-spec.md` 참조
  - WM Dashboard, Customers, Customer Detail, Reseller, Reseller Detail, Payments
  - Contracts, Contract Detail, Settings

- **Reseller 페이지**: `reseller-api-spec.md` 참조
  - Reseller Dashboard, My Payments
  - Customers, Customer Detail (자사만)
  - Contracts, Contract Detail (자사만), Settings (자사만)

---

## 6. 다국어 지원 (i18n)

### 6.1 지원 언어

WM Sales Portal은 **English (EN)**와 **한국어 (KO)** 두 가지 언어를 지원합니다.

| 언어 | 코드 | 표시 |
|------|------|------|
| English | en | EN |
| 한국어 | ko | KO |

### 6.2 번역 파일 위치

**번역 파일:**
- `/src/locales/en/common.json` - 영어 번역
- `/src/locales/ko/common.json` - 한국어 번역

**구조:**
```json
{
  "auth": {
    "login": { ... },
    "forgotPassword": { ... },
    "resetPassword": { ... },
    "verifyCode": { ... },
    "expiredCode": { ... },
    "signup": { ... }
  },
  "nav": { ... },
  "dashboard": { ... },
  "customers": { ... },
  "contracts": { ... },
  "payments": { ... },
  "settings": { ... }
}
```

### 6.3 인증 페이지 번역 키

#### Login Page

| 화면 요소 | 영어 (EN) | 한국어 (KO) | Translation Key |
|----------|-----------|------------|-----------------|
| 제목 | Login to your account | 계정에 로그인 | `auth.login.title` |
| 설명 | Enter your email below to login to your account | 아래에 이메일을 입력하여 계정에 로그인하세요 | `auth.login.description` |
| 이메일 레이블 | Email | 이메일 | `auth.login.emailLabel` |
| 이메일 플레이스홀더 | Enter email | 이메일 입력 | `auth.login.emailPlaceholder` |
| 비밀번호 레이블 | Password | 비밀번호 | `auth.login.passwordLabel` |
| 비밀번호 플레이스홀더 | Enter password | 비밀번호 입력 | `auth.login.passwordPlaceholder` |
| 비밀번호 찾기 링크 | Forgot your password? | 비밀번호를 잊으셨나요? | `auth.login.forgotPassword` |
| 로그인 버튼 | Login | 로그인 | `auth.login.loginButton` |
| 로그인 중 | Logging in... | 로그인 중... | `auth.login.loggingIn` |
| 로그인 실패 | Login failed. Please try again. | 로그인에 실패했습니다. 다시 시도해 주세요. | `auth.login.loginFailed` |
| 이메일 필수 | Email is required | 이메일은 필수입니다 | `auth.login.emailRequired` |
| 이메일 형식 오류 | Invalid email address | 올바른 이메일 주소를 입력해 주세요 | `auth.login.invalidEmail` |
| 비밀번호 필수 | Password is required | 비밀번호는 필수입니다 | `auth.login.passwordRequired` |
| 비밀번호 최소 길이 | Password must be at least 8 characters | 비밀번호는 최소 8자 이상이어야 합니다 | `auth.login.passwordMinLength` |

#### Forgot Password Page

| 화면 요소 | 영어 (EN) | 한국어 (KO) | Translation Key |
|----------|-----------|------------|-----------------|
| 제목 | Finding Password | 비밀번호 찾기 | `auth.forgotPassword.title` |
| 설명 | Enter your email below to find your password | 아래에 이메일을 입력하여 비밀번호를 찾으세요 | `auth.forgotPassword.description` |
| 전송 버튼 | Find Password | 비밀번호 찾기 | `auth.forgotPassword.sendButton` |
| 전송 중 | Sending... | 전송 중... | `auth.forgotPassword.sending` |
| 계정 없음 | No account found with this email address. | 해당 이메일로 등록된 계정을 찾을 수 없습니다. | `auth.forgotPassword.noAccountFound` |
| 전송 실패 | Failed to send verification code. Please try again. | 인증 코드 전송에 실패했습니다. 다시 시도해 주세요. | `auth.forgotPassword.failedToSend` |
| 로그인 링크 | Back to sign-in | 로그인으로 돌아가기 | `auth.forgotPassword.backToLogin` |
| 로그인 안내 | Do you want to sign in again? | 다시 로그인하시겠습니까? | `auth.forgotPassword.doYouWantToSignIn` |

#### Verify Code Page

| 화면 요소 | 영어 (EN) | 한국어 (KO) | Translation Key |
|----------|-----------|------------|-----------------|
| 제목 | Enter verification code | 인증 코드 입력 | `auth.verifyCode.title` |
| 설명 | We sent a 6-digit code to your email. | 이메일로 6자리 코드를 전송했습니다. | `auth.verifyCode.description` |
| 입력 안내 | Enter the 6-digit code sent to your email. | 이메일로 전송된 6자리 코드를 입력하세요. | `auth.verifyCode.inputDescription` |
| 인증 버튼 | Verify | 인증 | `auth.verifyCode.verifyButton` |
| 인증 중 | Verifying... | 인증 중... | `auth.verifyCode.verifying` |
| 코드 오류 | Invalid verification code. Please try again. | 유효하지 않은 인증 코드입니다. 다시 시도해 주세요. | `auth.verifyCode.invalidCode` |
| 코드 재전송 완료 | Verification code resent to your email. | 인증 코드가 이메일로 재전송되었습니다. | `auth.verifyCode.codeResent` |
| 코드 미수신 | Didn't receive the code? | 코드를 받지 못하셨나요? | `auth.verifyCode.didntReceive` |
| 재전송 | Resend | 재전송 | `auth.verifyCode.resend` |
| 또는 | or | 또는 | `auth.verifyCode.or` |
| 뒤로 가기 | Back to previous page | 이전 페이지로 돌아가기 | `auth.verifyCode.backToLogin` |

#### Reset Password Page

| 화면 요소 | 영어 (EN) | 한국어 (KO) | Translation Key |
|----------|-----------|------------|-----------------|
| 제목 | New password | 새 비밀번호 | `auth.resetPassword.title` |
| 설명 | Please enter a new password | 새 비밀번호를 입력해 주세요 | `auth.resetPassword.description` |
| 새 비밀번호 레이블 | New Password | 새 비밀번호 | `auth.resetPassword.newPasswordLabel` |
| 새 비밀번호 플레이스홀더 | Enter new password | 새 비밀번호 입력 | `auth.resetPassword.newPasswordPlaceholder` |
| 비밀번호 확인 레이블 | Confirm New Password | 새 비밀번호 확인 | `auth.resetPassword.confirmPasswordLabel` |
| 비밀번호 확인 플레이스홀더 | Enter new password again | 새 비밀번호 재입력 | `auth.resetPassword.confirmPasswordPlaceholder` |
| 적용 버튼 | Apply New Password | 새 비밀번호 적용 | `auth.resetPassword.applyButton` |
| 적용 중 | Applying... | 적용 중... | `auth.resetPassword.applying` |
| 비밀번호 불일치 | Passwords don't match | 비밀번호가 일치하지 않습니다 | `auth.resetPassword.passwordsDontMatch` |
| 재설정 성공 제목 | Password reset successful | 비밀번호 재설정 완료 | `auth.resetPassword.resetSuccessful` |
| 재설정 성공 설명 | Your password has been changed successfully. | 비밀번호가 성공적으로 변경되었습니다. | `auth.resetPassword.resetSuccessfulDesc` |
| 재설정 실패 제목 | Error | 오류 | `auth.resetPassword.resetFailed` |
| 재설정 실패 설명 | Failed to reset password. Please try again. | 비밀번호 재설정에 실패했습니다. 다시 시도해 주세요. | `auth.resetPassword.resetFailedDesc` |
| 로그인 링크 | Back to sign-in | 로그인으로 돌아가기 | `auth.resetPassword.backToLogin` |

#### Expired Code Page

| 화면 요소 | 영어 (EN) | 한국어 (KO) | Translation Key |
|----------|-----------|------------|-----------------|
| 제목 | Verification Code Expired | 인증 코드 만료 | `auth.expiredCode.title` |
| 설명 | This reset link has expired. Please request a new code to continue. | 재설정 링크가 만료되었습니다. 계속하려면 새 코드를 요청하세요. | `auth.expiredCode.description` |
| 새 코드 전송 버튼 | Send New Code | 새 코드 전송 | `auth.expiredCode.sendNewCode` |
| 로그인 안내 | Want to sign in instead? | 대신 로그인하시겠습니까? | `auth.expiredCode.wantToSignIn` |
| 로그인 링크 | Back to sign-in | 로그인으로 돌아가기 | `auth.expiredCode.backToLogin` |
| 새 코드 전송 완료 제목 | New code sent | 새 코드 전송됨 | `auth.expiredCode.newCodeSent` |
| 새 코드 전송 완료 설명 | A new verification code has been sent to your email. | 새 인증 코드가 이메일로 전송되었습니다. | `auth.expiredCode.newCodeSentDesc` |

#### Signup Pages (Reseller & User)

| 화면 요소 | 영어 (EN) | 한국어 (KO) | Translation Key |
|----------|-----------|------------|-----------------|
| 제목 | Create your account | 계정 만들기 | `auth.signup.title` |
| 설명 | Enter your email below to create your account | 아래에 이메일을 입력하여 계정을 만드세요 | `auth.signup.description` |
| 이름 레이블 | Full Name | 이름 | `auth.signup.fullNameLabel` |
| 이름 플레이스홀더 | Enter full name | 이름 입력 | `auth.signup.fullNamePlaceholder` |
| 이름 필수 | Full name is required | 이름은 필수입니다 | `auth.signup.fullNameRequired` |
| 담당자 레이블 | Contact Person | 담당자 | `auth.signup.contactPersonLabel` |
| 담당자 플레이스홀더 | Enter contact person | 담당자 입력 | `auth.signup.contactPersonPlaceholder` |
| 담당자 필수 | Contact person is required | 담당자는 필수입니다 | `auth.signup.contactPersonRequired` |
| 국가 레이블 | Country | 국가 | `auth.signup.countryLabel` |
| 국가 플레이스홀더 | Select country | 국가 선택 | `auth.signup.countryPlaceholder` |
| 국가 필수 | Country is required | 국가는 필수입니다 | `auth.signup.countryRequired` |
| 사업자등록번호 레이블 | Business Registration No. | 사업자등록번호 | `auth.signup.businessRegNoLabel` |
| 사업자등록번호 플레이스홀더 | Enter business registration number | 사업자등록번호 입력 | `auth.signup.businessRegNoPlaceholder` |
| 사업자등록번호 필수 | Business registration number is required | 사업자등록번호는 필수입니다 | `auth.signup.businessRegNoRequired` |
| 사업자등록번호 형식 오류 | Invalid business registration number format for selected country | 선택한 국가에 대한 사업자등록번호 형식이 올바르지 않습니다 | `auth.signup.invalidBusinessRegNo` |
| 계정 생성 버튼 | Create Account | 계정 만들기 | `auth.signup.createAccountButton` |
| 생성 중 | Creating... | 생성 중... | `auth.signup.creating` |
| 로그인 링크 | Already have an account? | 이미 계정이 있으신가요? | `auth.signup.alreadyHaveAccount` |
| 로그인 | Sign in | 로그인 | `auth.signup.signIn` |
| 비밀번호 최소 길이 | Must be at least 8 characters long. | 최소 8자 이상이어야 합니다. | `auth.signup.passwordMinLength` |
| 가입 성공 제목 | Registration successful | 가입 완료 | `auth.signup.registrationSuccessful` |
| 가입 성공 설명 | Your account has been created. Please log in. | 계정이 생성되었습니다. 로그인해 주세요. | `auth.signup.registrationSuccessfulDesc` |
| 가입 실패 제목 | Registration failed | 가입 실패 | `auth.signup.registrationFailed` |
| 가입 실패 설명 | Failed to create your account. Please try again. | 계정 생성에 실패했습니다. 다시 시도해 주세요. | `auth.signup.registrationFailedDesc` |
| 초대 무효 제목 | Invalid invitation link | 유효하지 않은 초대 링크 | `auth.signup.invalidInvitation` |
| 초대 무효 설명 | Please use the link from your invitation email. | 초대 이메일의 링크를 사용해 주세요. | `auth.signup.invalidInvitationDesc` |
| 약관 동의 | By clicking continue, you agree to our Terms of Service and Privacy Policy | 계속 진행하시면 서비스 약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다 | `auth.signup.termsAndPrivacy` |

### 6.4 사용 방법

#### 프론트엔드 구현

**React 컴포넌트에서 사용:**
```typescript
import { useTranslation } from 'react-i18next';

function LoginForm() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('auth.login.title')}</h1>
      <p>{t('auth.login.description')}</p>
      <Button>{t('auth.login.loginButton')}</Button>
    </div>
  );
}
```

**변수 삽입:**
```typescript
// 영어: "Welcome, {name}!"
// 한국어: "{name}님, 환영합니다!"
t('common.welcome', { name: userName })
```

#### 언어 전환

**Language Switcher 컴포넌트:**
```typescript
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: 'en' | 'ko') => {
    i18n.changeLanguage(lang);
  };

  return (
    <select
      value={i18n.language}
      onChange={(e) => changeLanguage(e.target.value as 'en' | 'ko')}
    >
      <option value="en">EN</option>
      <option value="ko">KO</option>
    </select>
  );
}
```

### 6.5 번역 추가 가이드

**새 번역 키 추가 시:**

1. `/src/locales/en/common.json`에 영어 번역 추가
2. `/src/locales/ko/common.json`에 한국어 번역 추가
3. TypeScript 타입 안정성을 위해 두 파일의 키 구조를 동일하게 유지

**예시:**
```json
// en/common.json
{
  "contracts": {
    "createDialog": {
      "title": "Create Contract",
      "submitButton": "Create"
    }
  }
}

// ko/common.json
{
  "contracts": {
    "createDialog": {
      "title": "계약 생성",
      "submitButton": "생성"
    }
  }
}
```

### 6.6 번역 범위

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
- ✅ 404 페이지

**번역하지 않는 항목:**
- ❌ API 엔드포인트
- ❌ 데이터베이스 값 (상태값, 역할명 등)
- ❌ 로그 메시지
- ❌ 기술 문서

---

**문서 종료일:** 2025-01-16
## Section 4: Common Modals (공통 모달)

이 섹션에서는 애플리케이션 전반에서 사용되는 공통 모달 컴포넌트들을 정의합니다.

---

### 4.1 Add Note Modal (노트 추가 모달)

**트리거:** Customer Detail Page, Contract Detail Page의 "Add Note" 버튼
**접근 권한:**
- WM: `wm_admin`, `wm_editor`
- Reseller: `reseller_admin`, `reseller_editor`

#### 모달 구조

**섹션 1: 제목**
- **Add Mode Title (EN):** "Add Note"
- **Add Mode Title (KO):** "노트 추가"
- **Edit Mode Title (EN):** "Edit Note"
- **Edit Mode Title (KO):** "노트 수정"

**섹션 2: 폼 필드**

| 필드명 | 타입 | 레이블 (EN/KO) | Placeholder (EN/KO) | 필수 | 최대 길이 |
|--------|------|----------------|---------------------|------|----------|
| noteContent | textarea | Note / 노트 | Please enter notes regarding the customer / 고객에 관한 메모를 입력하세요 | ✅ | 280자 |

**섹션 3: 버튼 영역**
- **Cancel 버튼:** 항상 활성화
- **Submit 버튼:**
  - Add Mode: "Add" / "추가"
  - Edit Mode: "Save" / "저장"
  - 활성화 조건: `noteContent.trim()` 길이 > 0
  - 비활성화 조건: 입력 내용이 비어있음

**인터랙션:**
- Note textarea 입력 시: 실시간 문자 수 카운터 표시 (예: "25/280 characters" / "25/280 자")
- 280자 초과 입력 방지: 자동으로 최대 280자까지만 입력 가능
- Cancel 버튼 클릭: 모달 닫기, 입력 내용 초기화
- Submit 버튼 클릭:
  - `noteContent.trim()` 실행
  - `onAddNote()` 또는 `onEditNote()` 콜백 호출
  - 모달 닫기

**조건/규칙:**
- Edit Mode 진입 시: `initialContent`로 textarea 초기화
- 모달 닫을 때: 입력 내용 초기화하여 재오픈 시 깨끗한 상태 유지

**유효성 검증:**

| 필드 | 규칙 | 에러 메시지 (EN) | 에러 메시지 (KO) |
|------|------|------------------|------------------|
| noteContent | Required (trim 후) | (Submit 버튼 비활성화로 처리) | (Submit 버튼 비활성화로 처리) |
| noteContent | Max 280 chars | (자동 제한) | (자동 제한) |

**데이터 요구사항:**

**Props:**
- `open` (boolean): 모달 오픈 상태
- `onOpenChange` (function): 모달 닫기 콜백
- `onAddNote` (function): 노트 추가 콜백 `(content: string) => void`
- `editMode` (boolean, optional): 수정 모드 여부
- `initialContent` (string, optional): 수정 시 초기 내용
- `onEditNote` (function, optional): 노트 수정 콜백 `(content: string) => void`

**i18n 번역 키:**
- `addNoteModal.addNote`: "Add Note" / "노트 추가"
- `addNoteModal.editNote`: "Edit Note" / "노트 수정"
- `addNoteModal.note`: "Note" / "노트"
- `addNoteModal.placeholder`: "Please enter notes regarding the customer" / "고객에 관한 메모를 입력하세요"
- `addNoteModal.characters`: "{{count}}/{{max}} characters" / "{{count}}/{{max}} 자"
- `common.cancel`: "Cancel" / "취소"
- `common.add`: "Add" / "추가"
- `common.save`: "Save" / "저장"

---

### 4.2 Edit Billing Emails Modal (청구서 이메일 수정 모달)

**트리거:** Contract Detail Page의 "Edit" 버튼 (Billing Email 섹션)
**접근 권한:**
- WM: `wm_admin`, `wm_editor`
- Reseller: `reseller_admin`, `reseller_editor`

#### 모달 구조

**섹션 1: 제목 및 설명**
- **Title (EN):** "Edit Billing Emails"
- **Title (KO):** "청구서 이메일 수정"
- **Description (EN):** "Manage the email addresses that will receive billing invoices."
- **Description (KO):** "청구서를 받을 이메일 주소를 관리합니다."

**섹션 2: 이메일 목록**
- 기존 이메일 주소 목록 (각 항목에 X 삭제 버튼)
- 각 이메일: 회색 배경의 카드 형태
- 삭제 버튼: X 아이콘 (hover 시 배경색 변경)

**섹션 3: 새 이메일 추가**
- 이메일 입력 필드 + "Add" 버튼 (인라인)
- 입력 필드 placeholder: "Enter email address" / "이메일 주소를 입력하세요"
- Helper text: "Press Enter to add" / "Enter를 눌러 추가하세요"
- 에러 메시지 영역 (입력 필드 아래, 빨강색)

**섹션 4: 버튼 영역**
- **Close 버튼:** 항상 활성화
- **Save 버튼:** 항상 활성화

**인터랙션:**
- 이메일 입력 필드에 입력 후 Enter 키: `handleAdd()` 실행
- "Add" 버튼 클릭: `handleAdd()` 실행
- 이메일 항목의 X 버튼 클릭: `handleRemove(index)` 실행
- Close 버튼 클릭: 변경 사항 취소하고 모달 닫기 (원래 이메일로 복원)
- Save 버튼 클릭: `onSave(emailList)` 콜백 호출 후 모달 닫기

**조건/규칙:**
- 최소 1개 이메일 필수: 마지막 이메일 삭제 시도 시 에러 메시지 표시
- 중복 이메일 방지: 이미 존재하는 이메일 추가 시도 시 에러
- 모달 오픈 시: 전달받은 `emails` prop으로 `emailList` 초기화
- 모달 닫기 (Close) 시: 원래 `emails`로 복원

**유효성 검증:**

| 필드 | 규칙 | 에러 메시지 (EN) | 에러 메시지 (KO) |
|------|------|------------------|------------------|
| newEmail | Required | Email address is required | 이메일 주소는 필수입니다 |
| newEmail | Email format | Invalid email format | 유효하지 않은 이메일 형식입니다 |
| newEmail | Not duplicate | This email has already been added | 이미 추가된 이메일입니다 |
| emailList | Min 1 email | At least one email address is required | 최소 1개의 이메일 주소가 필요합니다 |

**데이터 요구사항:**

**Props:**
- `open` (boolean): 모달 오픈 상태
- `onOpenChange` (function): 모달 닫기 콜백
- `emails` (string[]): 기존 이메일 목록
- `onSave` (function): 저장 콜백 `(emails: string[]) => void`

**i18n 번역 키:**
- `editBillingEmailsModal.title`: "Edit Billing Emails" / "청구서 이메일 수정"
- `editBillingEmailsModal.description`: "Manage the email addresses that will receive billing invoices." / "청구서를 받을 이메일 주소를 관리합니다."
- `editBillingEmailsModal.billingEmailAddress`: "Billing email address" / "청구서 이메일 주소"
- `editBillingEmailsModal.enterEmail`: "Enter email address" / "이메일 주소를 입력하세요"
- `editBillingEmailsModal.pressEnter`: "Press Enter to add" / "Enter를 눌러 추가하세요"
- `editBillingEmailsModal.emailRequired`: "Email address is required" / "이메일 주소는 필수입니다"
- `editBillingEmailsModal.invalidEmailFormat`: "Invalid email format" / "유효하지 않은 이메일 형식입니다"
- `editBillingEmailsModal.emailAlreadyAdded`: "This email has already been added" / "이미 추가된 이메일입니다"
- `editBillingEmailsModal.atLeastOneEmailRequired`: "At least one email address is required" / "최소 1개의 이메일 주소가 필요합니다"
- `common.add`: "Add" / "추가"
- `common.close`: "Close" / "닫기"
- `common.save`: "Save" / "저장"

---

### 4.3 Edit Pricing Modal (가격 수정 모달)

**트리거:** Reseller Detail Page의 서비스 카드 "Edit Pricing" 버튼
**접근 권한:** WM: `wm_admin`, `wm_editor`

#### 모달 구조

**섹션 1: 제목**
- **Title:** "Edit Pricing" (고정, 번역 없음)

**섹션 2: Pay-as-you-go 가격 정보**
- 서비스 이름 표시 (좌측 경계선 포함)
- "Pay-as-you-go" 뱃지
- 필드:
  - vCPU Unit Price ($ 접두사, /hour 접미사)
  - Minimum Charge ($ 접두사, /Month 접미사)

**섹션 3: 구분선 (Separator)**

**섹션 4: Fixed Rate 가격 정보**
- 서비스 이름 표시
- "Fixed Rate" 뱃지
- **1 Year:**
  - Contract Amount ($ 접두사, /1 year 접미사)
  - Included Allocation (vCPU 접미사)
- **3 Year:**
  - Contract Amount ($ 접두사, /3 years 접미사)
  - Included Allocation (vCPU 접미사)
- **5 Year:**
  - Contract Amount ($ 접두사, /5 years 접미사)
  - Included Allocation (vCPU 접미사)

**섹션 5: 버튼 영역**
- **Cancel 버튼:** 항상 활성화
- **Save 버튼:** 항상 활성화

**인터랙션:**
- 숫자 입력 필드 변경 시: 실시간 validation
- Cancel 버튼 클릭: 변경 사항 취소하고 모달 닫기
- Save 버튼 클릭:
  - 모든 필드 validation 실행
  - 에러 있으면 Toast 메시지 표시
  - 에러 없으면 `onSave(serviceName, formData)` 호출 후 모달 닫기

**조건/규칙:**
- 모든 필드는 선택적 (빈 값 허용)
- 입력된 값은 반드시 양수여야 함 (0 또는 음수 불허)
- 모달 오픈 시: 기존 가격 정보로 폼 초기화
- 가격 정보 없으면: 빈 폼으로 시작

**유효성 검증:**

| 필드 | 규칙 | 에러 메시지 (EN) | 에러 메시지 (KO) |
|------|------|------------------|------------------|
| All price fields | Optional | - | - |
| All price fields | Must be positive number | Must be a valid positive number | 유효한 양수를 입력해주세요 |

**데이터 요구사항:**

**Props:**
- `open` (boolean): 모달 오픈 상태
- `onOpenChange` (function): 모달 닫기 콜백
- `reseller` (Reseller): 리셀러 객체
- `serviceName` (string): 서비스 이름
- `onSave` (function): 저장 콜백 `(serviceName: string, pricingData: PricingData) => void`

**PricingData 타입:**
```typescript
interface PricingData {
  payAsYouGo: {
    vcpuUnitPrice: string;
    minimumCharge: string;
  };
  fixedRate: {
    oneYear: {
      contractAmount: string;
      includedAllocation: string;
    };
    threeYear: {
      contractAmount: string;
      includedAllocation: string;
    };
    fiveYear: {
      contractAmount: string;
      includedAllocation: string;
    };
  };
}
```

**i18n 번역 키:**
- `editPricing.title`: "Edit Pricing" / "가격 정보 수정"
- `editPricing.validationError`: "Validation Error" / "검증 오류"
- `editPricing.fixErrors`: "Please fix the errors before saving" / "저장하기 전에 오류를 수정해주세요"
- `editPricing.mustBePositive`: "Must be a valid positive number" / "유효한 양수를 입력해주세요"
- `editPricing.enterAmount`: "Enter amount" / "금액을 입력하세요"
- `common.cancel`: "Cancel" / "취소"
- `common.save`: "Save" / "저장"

---

### 4.4 Add Service Modal (서비스 추가 모달)

**트리거:** Reseller Detail Page의 "Add Service" 버튼
**접근 권한:** WM: `wm_admin`, `wm_editor`

#### 모달 구조 (Multi-step)

**1단계: 서비스 선택**

**섹션 1: 제목**
- **Title:** "Add Service" (고정)

**섹션 2: 안내 문구**
- "Which services are you planning to add to this reseller?" (고정)

**섹션 3: 서비스 체크박스 목록**
- 이미 추가된 서비스 제외
- 사용 가능한 서비스:
  - Skuber⁺ Management
  - Skuber⁺ Observability
  - Skuber⁺ Optimization
- 각 서비스: 체크박스 + 서비스 이름
- 선택된 서비스: 배경색 변경 (primary/5) + 테두리 (primary)

**섹션 4: 버튼 영역**
- Cancel 버튼
- Next 버튼 (선택된 서비스 없으면 비활성화)

---

**2단계: 가격 정보 입력**

**섹션 1: 진행 상태 표시**
- "Service {current} of {total}" (여러 서비스 선택 시만 표시)

**섹션 2~4:** Edit Pricing Modal과 동일한 구조
- Pay-as-you-go 섹션
- Separator
- Fixed Rate 섹션

**섹션 5: "Apply to all" 체크박스**
- 첫 번째 서비스 & 여러 서비스 선택 시만 표시
- "Apply to all remaining services"
- 체크 시: 현재 입력한 가격을 모든 서비스에 적용

**섹션 6: 버튼 영역**
- Cancel 버튼
- Prev 버튼
- Next/Add Service 버튼:
  - 마지막 서비스: "Add Service"
  - 중간 서비스: "Next"
  - 활성화 조건: 최소 1개 필드 입력

**인터랙션:**
- Step 1에서 Next 클릭:
  - 선택된 서비스 없으면 Toast 에러
  - 있으면 Step 2로 이동
- Step 2에서 Prev 클릭:
  - 현재 입력 저장
  - 이전 서비스로 이동 (첫 서비스면 Step 1로)
- Step 2에서 Next 클릭:
  - Validation 실행
  - 에러 있으면 Toast 메시지
  - "Apply to all" 체크 시: 모든 서비스에 적용 후 완료
  - 다음 서비스 있으면: 다음 서비스로 이동
  - 마지막 서비스면: 모든 서비스 저장 후 모달 닫기

**조건/규칙:**
- 모든 서비스가 이미 추가된 경우: "All services have already been added to this reseller." 메시지 표시
- 가격 필드는 모두 선택적
- 입력된 값은 반드시 양수여야 함

**유효성 검증:**

Edit Pricing Modal과 동일

**데이터 요구사항:**

**Props:**
- `open` (boolean): 모달 오픈 상태
- `onOpenChange` (function): 모달 닫기 콜백
- `existingServices` (string[]): 이미 추가된 서비스 목록
- `onSave` (function): 저장 콜백 `(serviceName: string, pricingData: PricingData) => void`

**i18n 번역 키:**
- `addService.title`: "Add Service" / "서비스 추가"
- `addService.selectServices`: "Which services are you planning to add to this reseller?" / "이 리셀러에 추가할 서비스를 선택하세요"
- `addService.allServicesAdded`: "All services have already been added to this reseller." / "모든 서비스가 이미 이 리셀러에 추가되었습니다."
- `addService.serviceOf`: "Service {{current}} of {{total}}" / "서비스 {{current}} / {{total}}"
- `addService.applyToAll`: "Apply to all remaining services" / "나머지 모든 서비스에 적용"
- `addService.validationError`: "Validation Error" / "검증 오류"
- `addService.selectAtLeastOne`: "Please select at least one service" / "최소 1개의 서비스를 선택해주세요"
- `addService.fixErrors`: "Please fix the errors before continuing" / "계속하기 전에 오류를 수정해주세요"
- `addService.prev`: "Prev" / "이전"
- `addService.next`: "Next" / "다음"
- `addService.addService`: "Add Service" / "서비스 추가"
- `common.cancel`: "Cancel" / "취소"

---

### 4.5 Add Reseller Modal (리셀러 추가 모달)

**트리거:** Resellers Page의 "Add Reseller" 버튼
**접근 권한:** WM: `wm_admin`, `wm_editor`

#### 모달 구조 (Multi-step)

**1단계: 리셀러 정보 입력**

**섹션 1: 제목**
- **Title (EN):** "Add Reseller"
- **Title (KO):** "리셀러 추가"

**섹션 2: 폼 필드**

| 필드명 | 타입 | 레이블 (EN/KO) | Placeholder (EN/KO) | 필수 | Validation |
|--------|------|----------------|---------------------|------|-----------|
| name | text | Reseller Name / 리셀러명 | Enter reseller name / 리셀러명을 입력하세요 | ✅ | Min 2 chars |
| contactEmail | email | Contact Person Email / 담당자 이메일 | Enter email / 이메일을 입력하세요 | ✅ | Email format |

**섹션 3: 버튼 영역**
- Cancel 버튼
- Next 버튼 (폼 유효하지 않으면 비활성화)

---

**2단계: 서비스 선택**

**섹션 1: 안내 문구**
- "Which services will this reseller offer to customers?"

**섹션 2: 서비스 체크박스 목록**
- Skuber⁺ Management
- Skuber⁺ Observability
- Skuber⁺ Optimization

**섹션 3: 버튼 영역**
- Cancel 버튼
- Prev 버튼
- Next 버튼

---

**3단계: 청구서 이메일 & 노트**

**섹션 1: Billing Email Address**
- 이메일 목록 (삭제 가능)
- 새 이메일 추가 필드 + Add 버튼
- "Press Enter ↵ to add" helper text

**섹션 2: Note**
- Textarea (280자 제한)
- 문자 수 카운터

**섹션 3: 버튼 영역**
- Cancel 버튼
- Prev 버튼
- Submit 버튼 (최소 1개 이메일 필요, 없으면 비활성화)

**인터랙션:**
- Step 1 Next: Form validation 후 Step 2로
- Step 2 Prev: Step 1로 이동
- Step 2 Next: 선택된 서비스 없어도 Step 3로 이동 가능
- Step 3 Prev: Step 2로 이동
- Step 3 Submit:
  - 최소 1개 이메일 필수
  - `onSubmit()` 호출 후 모달 닫기

**조건/규칙:**
- 리셀러 이름 중복 체크
- 이메일 중복 체크
- 서비스 선택은 선택사항 (나중에 추가 가능)
- 청구서 이메일 최소 1개 필수
- 노트는 선택사항

**유효성 검증:**

| 필드 | 규칙 | 에러 메시지 (EN) | 에러 메시지 (KO) |
|------|------|------------------|------------------|
| name | Required | Reseller name is required | 리셀러명을 입력해주세요 |
| name | Min 2 chars | Reseller name must be at least 2 characters | 리셀러명은 최소 2자 이상이어야 합니다 |
| contactEmail | Required | Email is required | 이메일을 입력해주세요 |
| contactEmail | Email format | Invalid email format | 올바른 이메일 형식이 아닙니다 |
| billingEmail | Required | Email is required | 이메일을 입력해주세요 |
| billingEmail | Email format | Invalid email format | 올바른 이메일 형식이 아닙니다 |
| billingEmail | Not duplicate | This email is already added | 이미 추가된 이메일입니다 |
| billingEmails | Min 1 email | (Submit 버튼 비활성화) | (Submit 버튼 비활성화) |
| note | Max 280 chars | (자동 제한) | (자동 제한) |

**데이터 요구사항:**

**Props:**
- `open` (boolean): 모달 오픈 상태
- `onOpenChange` (function): 모달 닫기 콜백
- `onSubmit` (function): 제출 콜백

**Submit 데이터:**
```typescript
{
  name: string;
  contactEmail: string;
  services: string[];
  pricing: Record<string, PricingData>; // 빈 객체
  billingEmails: string[];
  note: string;
}
```

**i18n 번역 키:**
- `addReseller.title`: "Add Reseller" / "리셀러 추가"
- `addReseller.resellerName`: "Reseller Name" / "리셀러명"
- `addReseller.resellerNamePlaceholder`: "Enter reseller name" / "리셀러명을 입력하세요"
- `addReseller.contactPersonEmail`: "Contact Person Email" / "담당자 이메일"
- `addReseller.emailPlaceholder`: "Enter email" / "이메일을 입력하세요"
- `addReseller.selectServices`: "Which services will this reseller offer to customers?" / "이 리셀러가 고객에게 제공할 서비스를 선택하세요"
- `addReseller.billingEmailAddress`: "Billing email address" / "청구서 이메일 주소"
- `addReseller.note`: "Note" / "노트"
- `addReseller.notePlaceholder`: "Please enter notes regarding the contract" / "해당 리셀러에 대한 메모를 입력해주세요"
- `addReseller.charactersCount`: "{{count}}/280 characters" / "{{count}}/280자"
- `addReseller.resellerNameRequired`: "Reseller name is required" / "리셀러명을 입력해주세요"
- `addReseller.resellerNameMinLength`: "Reseller name must be at least 2 characters" / "리셀러명은 최소 2자 이상이어야 합니다"
- `addReseller.emailRequired`: "Email is required" / "이메일을 입력해주세요"
- `addReseller.invalidEmailFormat`: "Invalid email format" / "올바른 이메일 형식이 아닙니다"
- `addReseller.emailAlreadyAdded`: "This email is already added" / "이미 추가된 이메일입니다"
- `addReseller.prev`: "Prev" / "이전"
- `addReseller.next`: "Next" / "다음"
- `addReseller.submit`: "Submit" / "제출"
- `addReseller.enterEmail`: "Enter email" / "이메일 입력"
- `addReseller.add`: "Add" / "추가"
- `addReseller.pressEnter`: "Press Enter ↵ to add" / "Enter ↵를 눌러 추가"
- `common.cancel`: "Cancel" / "취소"

---

### 4.6 Reject Contract Modal (계약 거절 모달)

**트리거:** Contract Detail Page (WM) - Pending 상태 계약의 "Reject" 버튼
**접근 권한:** WM: `wm_admin`, `wm_editor`

#### 모달 구조

**섹션 1: 제목**
- **Title:** "Reject Contract" (고정)

**섹션 2: 계약 정보 표시**
- **Reseller → Customer:** 좌측 경계선 포함
- 계약 상세 정보 (2-column layout):
  - Contract ID
  - Service
  - Pricing Model
  - Contract Period
  - vCPU Unit Price (Pay-as-you-go만)
  - Minimum Charge (Pay-as-you-go만)
  - Amount to WM (Fixed Rate만)
  - Included Allocation (Fixed Rate만)
  - Tax Included

**섹션 3: 구분선 (Separator)**

**섹션 4: Rejection Reason**
- Label: "Rejection Reason"
- Textarea (120px 높이, resize 불가)
- Placeholder: "Please enter notes regarding the contract"
- 문자 수 카운터 (0/280 characters) - Textarea 내부 하단 좌측

**섹션 5: 버튼 영역**
- Cancel 버튼
- Submit 버튼 (reason.trim() 비어있으면 비활성화)

**인터랙션:**
- Textarea 입력: 최대 280자 제한
- Cancel 버튼: reason 초기화 후 모달 닫기
- Submit 버튼:
  - `onSubmit(reason)` 호출
  - reason 초기화
  - 모달 닫기

**조건/규칙:**
- reason은 필수 입력 (최소 1자 이상, trim 후)
- 최대 280자 제한

**유효성 검증:**

| 필드 | 규칙 | 에러 메시지 (EN) | 에러 메시지 (KO) |
|------|------|------------------|------------------|
| reason | Required (trim 후) | (Submit 버튼 비활성화) | (Submit 버튼 비활성화) |
| reason | Max 280 chars | (자동 제한) | (자동 제한) |

**데이터 요구사항:**

**Props:**
- `open` (boolean): 모달 오픈 상태
- `onOpenChange` (function): 모달 닫기 콜백
- `contract` (ContractDetails): 계약 상세 정보
- `onSubmit` (function): 제출 콜백 `(reason: string) => void`

**ContractDetails 타입:**
```typescript
interface ContractDetails {
  reseller: string;
  customer: string;
  contractId: string;
  service: string;
  pricingModel: string;
  contractPeriod: string;
  vcpuUnitPrice?: string;
  minimumCharge?: string;
  amount?: string;
  includedAllocation?: string;
  taxIncluded: string;
}
```

**i18n 번역 키:**
- (이 모달은 번역 파일을 사용하지 않고 하드코딩된 문자열 사용)
- 모든 텍스트 영어로만 표시

---

### 4.7 Create Account Modal (계정 생성 모달)

**트리거:** Settings Page의 "Create New Account" 버튼
**접근 권한:**
- WM: `wm_admin`
- Reseller: `reseller_admin`

#### 모달 구조

**섹션 1: 제목**
- **Title (EN):** "Create New Account"
- **Title (KO):** "새 계정 만들기"

**섹션 2: 폼 필드**

| 필드명 | 타입 | 레이블 (EN/KO) | Placeholder (EN/KO) | 필수 |
|--------|------|----------------|---------------------|------|
| email | email | Email / 이메일 | Enter email / 이메일 입력 | ✅ |
| name | text | Name / 이름 | Enter name / 이름 입력 | ✅ |

**섹션 3: Permission Type (역할 선택)**
- Label: "Permission Type" / "권한 유형"
- Radio group (3개 옵션):

**WM Admin이 보는 옵션:**
1. **Administrator** / "관리자"
   - Description: "Administrators have access and editing permissions for all menus." / "관리자는 모든 메뉴에 대한 접근 및 편집 권한이 있습니다."
   - Value: `wm_admin`

2. **Editor** / "편집자"
   - Description: "Editors have access and editing permissions to all menus except for the account management menu." / "편집자는 계정 관리 메뉴를 제외한 모든 메뉴에 대한 접근 및 편집 권한이 있습니다."
   - Value: `wm_editor`

3. **Viewer** / "조회자"
   - Description: "Viewers cannot access the account management menu, but they have permission to view the rest of the menus." / "조회자는 계정 관리 메뉴에 접근할 수 없지만, 나머지 메뉴에 대한 조회 권한이 있습니다."
   - Value: `wm_viewer`

**Reseller Admin이 보는 옵션:**
- 동일한 3개 옵션이지만 value가 다름:
  - `reseller_admin`
  - `reseller_editor`
  - `reseller_viewer`

**섹션 4: 버튼 영역**
- Cancel 버튼
- Complete 버튼

**인터랙션:**
- Email 입력: 실시간 validation (이메일 형식, 중복 체크)
- Name 입력: blur 시 validation
- Role 선택: Radio button 클릭 시 배경색 변경
- Cancel 버튼: 폼 초기화 후 모달 닫기
- Complete 버튼: validation 후 `onSave()` 호출

**조건/규칙:**
- 이메일 중복 체크 (실시간): `existingEmails` prop과 비교
- Role 기본값: WM은 `wm_admin`, Reseller는 `reseller_admin`
- Reseller Admin이 생성하는 계정: 자동으로 `resellerId`와 `resellerName` 포함

**유효성 검증:**

| 필드 | 규칙 | 에러 메시지 (EN) | 에러 메시지 (KO) |
|------|------|------------------|------------------|
| email | Required | Email is required | 이메일은 필수입니다 |
| email | Email format | Invalid email format | 올바른 이메일 형식이 아닙니다 |
| email | Not duplicate | This email is already registered | 이미 등록된 이메일입니다 |
| name | Required | Name is required | 이름은 필수입니다 |

**데이터 요구사항:**

**Props:**
- `open` (boolean): 모달 오픈 상태
- `onOpenChange` (function): 모달 닫기 콜백
- `onSave` (function): 저장 콜백
- `existingEmails` (string[]): 기존 이메일 목록 (중복 체크용)

**onSave 파라미터:**
```typescript
{
  email: string;
  name: string;
  role: UserRole;
  resellerId?: string; // Reseller Admin이 생성 시만
  resellerName?: string; // Reseller Admin이 생성 시만
}
```

**i18n 번역 키:**
- `settings.createNewAccount`: "Create New Account" / "새 계정 만들기"
- `settings.email`: "Email" / "이메일"
- `settings.enterEmail`: "Enter email" / "이메일 입력"
- `settings.name`: "Name" / "이름"
- `settings.enterName`: "Enter name" / "이름 입력"
- `settings.permissionType`: "Permission Type" / "권한 유형"
- `settings.administrator`: "Administrator" / "관리자"
- `settings.editor`: "Editor" / "편집자"
- `settings.viewer`: "Viewer" / "조회자"
- `settings.adminDesc`: "Administrators have access and editing permissions for all menus." / "관리자는 모든 메뉴에 대한 접근 및 편집 권한이 있습니다."
- `settings.editorDesc`: "Editors have access and editing permissions to all menus except for the account management menu." / "편집자는 계정 관리 메뉴를 제외한 모든 메뉴에 대한 접근 및 편집 권한이 있습니다."
- `settings.viewerDesc`: "Viewers cannot access the account management menu, but they have permission to view the rest of the menus." / "조회자는 계정 관리 메뉴에 접근할 수 없지만, 나머지 메뉴에 대한 조회 권한이 있습니다."
- `settings.complete`: "Complete" / "완료"
- `settings.emailRequired`: "Email is required" / "이메일은 필수입니다"
- `settings.invalidEmailFormat`: "Invalid email format" / "올바른 이메일 형식이 아닙니다"
- `settings.emailAlreadyRegistered`: "This email is already registered" / "이미 등록된 이메일입니다"
- `settings.nameRequired`: "Name is required" / "이름은 필수입니다"
- `common.cancel`: "Cancel" / "취소"

---

### 4.8 Edit Customer Modal (고객사 수정 모달)

**트리거:** Customer Detail Page의 "Edit" 버튼
**접근 권한:**
- WM: `wm_admin`, `wm_editor`
- Reseller: 불가 (자사 고객도 수정 불가)

#### 모달 구조

**섹션 1: 제목**
- **Title (EN):** "Edit Customer"
- **Title (KO):** "고객사 수정"

**섹션 2: 폼 필드**

| 필드명 | 타입 | 레이블 (EN/KO) | Placeholder | 필수 | Validation |
|--------|------|----------------|-------------|------|-----------|
| companyName | text | Company Name / 회사명 | - | ✅ | Min 2 chars, 중복 체크 |
| country | select | Country / 국가 | Select country / 국가 선택 | ✅ | - |
| businessRegNo | text | Business Reg. No. / 사업자 등록번호 | - | ✅ | 국가별 형식 검증 |
| contactPerson | text | Contact Person / 담당자 | - | ✅ | - |
| email | email | Contact Person Email / 담당자 이메일 | - | ✅ | Email format |

**섹션 3: 버튼 영역**
- Cancel 버튼
- Save 버튼

**인터랙션:**
- 모달 오픈 시: 기존 고객 정보로 폼 초기화
- Company Name 입력: 중복 체크 (다른 고객과 비교)
- Country 변경: 사업자등록번호 형식 재검증
- Business Reg No 입력: 국가별 형식 실시간 검증
- Cancel 버튼: 변경 사항 취소, 모달 닫기
- Save 버튼: validation 후 `onSave()` 호출

**조건/규칙:**
- Company Name 중복 체크: 현재 고객 제외하고 다른 고객과 비교
- Country 변경 시: 기존 사업자등록번호 재검증
- 모든 필드 필수

**유효성 검증:**

| 필드 | 규칙 | 에러 메시지 (EN) | 에러 메시지 (KO) |
|------|------|------------------|------------------|
| companyName | Required | Company name is required | 회사명을 입력해주세요 |
| companyName | Not duplicate | This company name already exists | 이미 존재하는 회사명입니다 |
| country | Required | Country is required | 국가를 선택해주세요 |
| businessRegNo | Required | Business registration number is required | 사업자 등록번호를 입력해주세요 |
| businessRegNo | Country format | (국가별 다름) | (국가별 다름) |
| contactPerson | Required | Contact person is required | 담당자를 입력해주세요 |
| email | Required | Email is required | 이메일을 입력해주세요 |
| email | Email format | Invalid email format | 올바른 이메일 형식이 아닙니다 |

**데이터 요구사항:**

**Props:**
- `open` (boolean): 모달 오픈 상태
- `onOpenChange` (function): 모달 닫기 콜백
- `customer` (Customer): 기존 고객 정보
- `onSave` (function): 저장 콜백 `(updatedCustomer: Customer) => void`

**i18n 번역 키:**
- `editCustomerModal.title`: "Edit Customer" / "고객사 수정"
- `editCustomerModal.companyName`: "Company Name" / "회사명"
- `editCustomerModal.country`: "Country" / "국가"
- `editCustomerModal.selectCountry`: "Select country" / "국가 선택"
- `editCustomerModal.businessRegNo`: "Business Reg. No." / "사업자 등록번호"
- `editCustomerModal.contactPerson`: "Contact Person" / "담당자"
- `editCustomerModal.contactPersonEmail`: "Contact Person Email" / "담당자 이메일"
- `editCustomerModal.companyNameRequired`: "Company name is required" / "회사명을 입력해주세요"
- `editCustomerModal.companyNameExists`: "This company name already exists" / "이미 존재하는 회사명입니다"
- `editCustomerModal.countryRequired`: "Country is required" / "국가를 선택해주세요"
- `editCustomerModal.businessRegNoRequired`: "Business registration number is required" / "사업자 등록번호를 입력해주세요"
- `editCustomerModal.contactPersonRequired`: "Contact person is required" / "담당자를 입력해주세요"
- `editCustomerModal.emailRequired`: "Email is required" / "이메일을 입력해주세요"
- `editCustomerModal.invalidEmailFormat`: "Invalid email format" / "올바른 이메일 형식이 아닙니다"
- `common.cancel`: "Cancel" / "취소"
- `common.save`: "Save" / "저장"

---

### 4.9 Edit Reseller Info Modal (리셀러 정보 수정 모달)

**트리거:** Reseller Detail Page의 "Edit" 버튼
**접근 권한:** WM: `wm_admin`, `wm_editor`

#### 모달 구조

**섹션 1: 제목**
- **Title (EN):** "Edit Reseller info."
- **Title (KO):** "리셀러 정보 수정"

**섹션 2: 폼 필드**

| 필드명 | 타입 | 레이블 (EN/KO) | Placeholder | 필수 | Validation |
|--------|------|----------------|-------------|------|-----------|
| name | text | Reseller Name / 리셀러명 | - | ✅ | 중복 체크 |
| country | select | Country / 국가 | Select country / 국가를 선택하세요 | ✅ | - |
| businessRegNo | text | Business Reg. No. / 사업자 등록번호 | - | ✅ | 국가별 형식 검증 |
| contactPerson | text | Contact Person / 담당자 | - | ✅ | - |
| contactEmail | email | Contact Person Email / 담당자 이메일 | - | ✅ | Email format |

**섹션 3: 버튼 영역**
- Cancel 버튼
- Save 버튼

**인터랙션 & 조건/규칙:**
Edit Customer Modal과 동일 (리셀러 버전)

**유효성 검증:**

| 필드 | 규칙 | 에러 메시지 (EN) | 에러 메시지 (KO) |
|------|------|------------------|------------------|
| name | Required | Reseller name is required | 리셀러명을 입력해주세요 |
| name | Not duplicate | Reseller name already exists | 이미 존재하는 리셀러명입니다 |
| country | Required | Country is required | 국가를 선택해주세요 |
| businessRegNo | Required | Business registration number is required | 사업자 등록번호를 입력해주세요 |
| businessRegNo | Country format | (국가별 다름) | (국가별 다름) |
| contactPerson | Required | Contact person is required | 담당자를 입력해주세요 |
| contactEmail | Required | Email is required | 이메일을 입력해주세요 |
| contactEmail | Email format | Invalid email format | 올바른 이메일 형식이 아닙니다 |

**데이터 요구사항:**

**Props:**
- `open` (boolean): 모달 오픈 상태
- `onOpenChange` (function): 모달 닫기 콜백
- `reseller` (Reseller): 기존 리셀러 정보
- `onSave` (function): 저장 콜백 `(updatedReseller: Reseller) => void`

**i18n 번역 키:**
- `editResellerInfo.title`: "Edit Reseller info." / "리셀러 정보 수정"
- `editResellerInfo.resellerName`: "Reseller Name" / "리셀러명"
- `editResellerInfo.country`: "Country" / "국가"
- `editResellerInfo.countryPlaceholder`: "Select country" / "국가를 선택하세요"
- `editResellerInfo.businessRegNo`: "Business Reg. No." / "사업자 등록번호"
- `editResellerInfo.contactPerson`: "Contact Person" / "담당자"
- `editResellerInfo.contactPersonEmail`: "Contact Person Email" / "담당자 이메일"
- `editResellerInfo.resellerNameRequired`: "Reseller name is required" / "리셀러명을 입력해주세요"
- `editResellerInfo.resellerNameExists`: "Reseller name already exists" / "이미 존재하는 리셀러명입니다"
- `editResellerInfo.countryRequired`: "Country is required" / "국가를 선택해주세요"
- `editResellerInfo.businessRegNoRequired`: "Business registration number is required" / "사업자 등록번호를 입력해주세요"
- `editResellerInfo.contactPersonRequired`: "Contact person is required" / "담당자를 입력해주세요"
- `editResellerInfo.emailRequired`: "Email is required" / "이메일을 입력해주세요"
- `editResellerInfo.invalidEmailFormat`: "Invalid email format" / "올바른 이메일 형식이 아닙니다"
- `common.cancel`: "Cancel" / "취소"
- `common.save`: "Save" / "저장"

---

### 4.10 Add Contract Modal (계약 추가 모달)

**트리거:**
- Customers Page의 "Add Contract" 버튼
- Customer Detail Page의 "Add Contract" 버튼

**접근 권한:**
- WM: `wm_admin`, `wm_editor`
- Reseller: `reseller_admin`, `reseller_editor`

#### 모달 구조 (Multi-step, 최대 5 Steps)

이 모달은 매우 복잡한 멀티스텝 폼으로, 선택에 따라 다른 흐름을 가집니다.

---

**1단계: 고객 선택**

**섹션 1: 제목**
- **Title (EN):** "Add Contract"
- **Title (KO):** "계약 추가"

**섹션 2: 안내 문구**
- "Please select a customer to create a contract for"

**섹션 3: 검색 필드**
- Search icon + Input
- Placeholder: 검색어 입력

**섹션 4: 고객 목록**
- 각 고객: Radio 버튼 + 회사명 + 사업자등록번호
- 선택된 고객: 배경색 변경

**섹션 5: 하단 링크**
- "Can't find the customer?"
- "Add Customer First" 링크 (underline)
- 클릭 시: Step 2 (고객 추가)로 이동

**섹션 6: 버튼 영역**
- Cancel 버튼
- Next 버튼 (고객 선택 안 하면 비활성화)

---

**2단계: 새 고객 추가 (옵션)**

**섹션 1: 안내 문구**
- (표시 안 함, 바로 폼)

**섹션 2: 폼 필드**

| 필드명 | 타입 | 레이블 (EN/KO) | 필수 |
|--------|------|----------------|------|
| countryCode | select | Country / 국가 | ✅ |
| companyName | text | Company Name / 회사명 | ✅ |
| businessRegNo | text | Business Reg. No. / 사업자 등록번호 | ✅ |
| contactPerson | text | Contact Person / 담당자 | ✅ |
| contactEmail | email | Contact Person Email / 담당자 이메일 | ✅ |

**섹션 3: 버튼 영역**
- Cancel 버튼
- Next 버튼 (폼 유효하지 않으면 비활성화)

**인터랙션:**
- Next 클릭:
  - 고객 생성 (localStorage 저장)
  - 새 고객 자동 선택
  - Step 3로 이동

---

**3단계: 서비스 & 가격 모델 선택**

**섹션 1: 안내 문구**
- "Select a service and set the price to pay WM"

**섹션 2: 선택된 고객 표시**
- 좌측 경계선 + 회사명

**섹션 3: Service 선택**
- Label: "Service"
- Select dropdown:
  - Skuber⁺ Management
  - Skuber⁺ Observability
  - Skuber⁺ Optimization
- **Reseller 사용자:** 가격 정책이 설정된 서비스만 선택 가능

**섹션 4: Pricing Model 선택**
- Label: "Pricing Model"
- Select dropdown:
  - Fixed Rate (정액제)
  - Pay-as-you-go (종량제)
  - Trial (체험판)

**섹션 5: 버튼 영역**
- Cancel 버튼
- Prev 버튼
- Next 버튼 (서비스 & 가격 모델 선택 안 하면 비활성화)

---

**4단계: 가격 상세 정보 입력**

이 단계는 선택한 가격 모델에 따라 다른 폼을 표시합니다.

---

**Step 4A: Fixed Rate (정액제)**

**섹션 1: 안내 문구**
- "Please enter the pricing details for the contract"

**섹션 2: 선택된 고객 & 서비스 표시**
- 고객명 (좌측 경계선)
- 서비스명 + "Fixed Rate" 뱃지

**섹션 3: Contract Term 선택**
- Label: "Contract Term"
- 3개 토글 버튼:
  - 1 Year
  - 3 Year
  - 5 Year

**섹션 4: Contract Period**
- Start Date picker
- End Date picker
- 자동 계산: Term 또는 Date 변경 시 상호 업데이트

**섹션 5: Contract Amount**
- Label: "Contract Amount"
- Input (number)
- $ 접두사, 숫자 3자리마다 쉼표

**섹션 6: Included Allocation**
- Label: "Included Allocation"
- Input (number)
- "vCPU" 접미사

**섹션 7: Tax Included**
- Checkbox: "Tax Included"
- 기본값: 체크됨

**섹션 8: 버튼 영역**
- Cancel 버튼
- Prev 버튼
- Next 버튼

---

**Step 4B: Pay-as-you-go (종량제)**

**섹션 1~2:** Fixed Rate와 동일

**섹션 3: Contract Period**
- Start Date picker
- "Set end date" checkbox
- End Date picker (checkbox 체크 시만 활성화)

**섹션 4: vCPU Unit Price**
- Label: "vCPU Unit Price"
- Input (number, decimal 허용)
- $ 접두사, "/hour" 접미사

**섹션 5: Minimum Charge**
- Label: "Minimum Charge"
- Input (number, decimal 허용)
- $ 접두사, "/month" 접미사

**섹션 6: Tax Included**
- Checkbox: "Tax Included"

**섹션 7: 버튼 영역**
- Cancel, Prev, Next 버튼

---

**Step 4C: Trial (체험판)**

**섹션 1~2:** 동일

**섹션 3: Trial Period 선택**
- Label: "Trial Period"
- 3개 토글 버튼:
  - 7 Days
  - 14 Days
  - 1 Month (30일)

**섹션 4: Trial Period Dates**
- Start Date picker
- End Date picker
- 자동 계산: Period 또는 Date 변경 시 상호 업데이트

**섹션 5: Usage Limit**
- Label: "Usage Limit"
- Input (number)
- "vCPU hours" 접미사
- Helper text: "Total credit during trial period"

**섹션 6: 버튼 영역**
- Cancel, Prev, Next 버튼

---

**5단계: 추가 정보 (청구서 이메일 & 노트)**

**섹션 1: 안내 문구**
- "Add billing email addresses for invoice delivery"

**섹션 2: Billing Email Address**
- 이메일 목록 (삭제 가능)
- 새 이메일 추가 필드 + Add 버튼
- "Press Enter ↵ to add" helper text

**섹션 3: Note (선택사항)**
- Label: "Note"
- Textarea (280자 제한)
- 문자 수 카운터

**섹션 4: Delete Rejected Contract (조건부 표시)**
- Reseller가 재등록 시만 표시
- Checkbox: "Delete the previous rejected contract after submission"

**섹션 5: 버튼 영역**
- Cancel 버튼
- Prev 버튼
- Submit 버튼 (최소 1개 이메일 필요)

**인터랙션:**
- Submit 클릭:
  - 계약 생성 (localStorage 저장)
  - Reseller 계약: `approvalStatus = "pending"`으로 설정
  - WM 계약: `approvalStatus = "approved"`, `status = "active"`
  - Toast 메시지 표시
  - 모달 닫기
  - Contract Detail 페이지로 이동 (optional)

---

**유효성 검증:**

| 필드 | 규칙 | 에러 메시지 (EN) | 에러 메시지 (KO) |
|------|------|------------------|------------------|
| All numeric fields | Required | This field is required | 필수 입력 항목입니다 |
| All numeric fields | > 0 | Please enter a valid number greater than 0 | 0보다 큰 유효한 숫자를 입력하세요 |
| endDate | > startDate | End date must be after start date | 종료일은 시작일 이후여야 합니다 |
| billingEmails | Min 1 email | At least one billing email is required | 최소 1개의 청구서 이메일이 필요합니다 |

**데이터 요구사항:**

**Props:**
- `open` (boolean)
- `onOpenChange` (function)
- `customers` (Customer[])
- `onAddCustomer` (function)
- `initialCustomerId` (string, optional): 특정 고객으로 초기화
- `initialStep` (1|2|3|4|5, optional): 특정 Step으로 시작
- `onContractAdded` (function, optional)
- `rejectedContractId` (string, optional): 거절된 계약 재등록 시
- `editMode` (boolean, optional): 수정 모드 여부
- `existingContract` (any, optional): 수정할 기존 계약

**i18n 번역 키:** (주요 항목만)
- `addContract.title`: "Add Contract" / "계약 추가"
- `addContract.selectCustomerPrompt`: "Please select a customer to create a contract for" / "계약을 생성할 고객사를 선택하세요"
- `addContract.selectServicePrompt`: "Select a service and set the price to pay WM" / "서비스를 선택하고 WM에게 지불할 가격을 설정하세요"
- `addContract.enterPricingDetailsPrompt`: "Please enter the pricing details for the contract" / "계약의 가격 세부 정보를 입력하세요"
- `addContract.enterBillingEmailPrompt`: "Add billing email addresses for invoice delivery" / "청구서를 받을 이메일 주소를 추가하세요"
- `addContract.cantFindCustomer`: "Can't find the customer?" / "고객사를 찾을 수 없나요?"
- `addContract.addCustomerFirst`: "Add Customer First" / "먼저 고객사 추가"
- `addContract.service`: "Service" / "서비스"
- `addContract.pricingModel`: "Pricing Model" / "가격 모델"
- `addContract.contractTerm`: "Contract Term" / "계약 기간"
- `addContract.contractAmount`: "Contract Amount" / "계약 금액"
- `addContract.includedAllocation`: "Included Allocation" / "포함된 할당량"
- `addContract.taxIncluded`: "Tax Included" / "세금 포함"
- `addContract.vcpuUnitPrice`: "vCPU Unit Price" / "vCPU 단가"
- `addContract.minimumCharge`: "Minimum Charge" / "최소 청구 금액"
- `addContract.trialPeriod`: "Trial Period" / "체험판 기간"
- `addContract.usageLimit`: "Usage Limit" / "사용량 제한"
- `addContract.billingEmailAddress`: "Billing Email Address" / "청구서 이메일 주소"
- `addContract.note`: "Note" / "노트"
- `addContract.deleteRejectedContract`: "Delete the previous rejected contract after submission" / "제출 후 이전에 거절된 계약 삭제"
- `addContract.submit`: "Submit" / "제출"
- (더 많은 키 생략...)

---

### 4.11 Edit Account Modal (계정 수정 모달)

**트리거:** Settings Page의 계정 목록에서 "Edit" 아이콘 클릭
**접근 권한:**
- WM: `wm_admin`
- Reseller: `reseller_admin`

#### 모달 구조

**섹션 1: 제목**
- **Title (EN):** "Edit Account"
- **Title (KO):** "계정 수정" (정확히는 "수정 계정")

**섹션 2: 폼 필드**

| 필드명 | 타입 | 레이블 (EN/KO) | 상태 |
|--------|------|----------------|------|
| email | email | Email / 이메일 | 읽기 전용 (비활성화) |
| name | text | Name / 이름 | 편집 가능 |

**섹션 3: Permission Type (역할 선택)**
- Create Account Modal과 동일한 Radio group
- 기존 역할로 초기화

**섹션 4: 버튼 영역**
- Cancel 버튼
- Complete 버튼

**인터랙션:**
- Email 필드: 비활성화 (변경 불가)
- Name 필드: 편집 가능
- Role 선택: Radio button
- Cancel: 변경 사항 취소, 모달 닫기
- Complete: validation 후 `onSave()` 호출

**조건/규칙:**
- Email은 변경 불가
- Name과 Role만 수정 가능

**유효성 검증:**

| 필드 | 규칙 | 에러 메시지 (EN) | 에러 메시지 (KO) |
|------|------|------------------|------------------|
| name | Required | Name is required | 이름은 필수입니다 |

**데이터 요구사항:**

**Props:**
- `open` (boolean)
- `onOpenChange` (function)
- `onSave` (function): 저장 콜백
- `account` (object): 기존 계정 정보

**onSave 파라미터:**
```typescript
{
  id: string;
  name: string;
  role: UserRole;
}
```

**i18n 번역 키:**
- `common.edit`: "Edit" / "수정"
- `settings.account`: "Account" / "계정"
- `settings.email`: "Email" / "이메일"
- `settings.name`: "Name" / "이름"
- `settings.enterName`: "Enter name" / "이름 입력"
- `settings.permissionType`: "Permission Type" / "권한 유형"
- `settings.complete`: "Complete" / "완료"
- `settings.nameRequired`: "Name is required" / "이름은 필수입니다"
- (Role options: Create Account Modal과 동일)
- `common.cancel`: "Cancel" / "취소"

---

## 요약

이 문서는 WM Sales Portal의 모든 공통 모달 컴포넌트를 정의합니다:

1. **Add Note Modal** - 노트 추가/수정
2. **Edit Billing Emails Modal** - 청구서 이메일 관리
3. **Edit Pricing Modal** - 리셀러 서비스 가격 수정
4. **Add Service Modal** - 리셀러에 서비스 추가
5. **Add Reseller Modal** - 새 리셀러 등록
6. **Reject Contract Modal** - 계약 거절 (WM)
7. **Create Account Modal** - 새 계정 생성
8. **Edit Customer Modal** - 고객사 정보 수정
9. **Edit Reseller Info Modal** - 리셀러 정보 수정
10. **Add Contract Modal** - 새 계약 추가 (복잡한 멀티스텝)
11. **Edit Account Modal** - 계정 정보 수정
12. **Contract Filter Dialog** - 계약 필터링 (권한별 조건부 필드)
13. **Payment Filter Dialog** - 결제 필터링 (기간 범위 검증)
14. **Add Customer Dialog** - 새 고객사 추가
15. **Notification Sheet** - 알림 패널 (우측 슬라이드)

각 모달은 다음 정보를 포함합니다:
- 트리거 조건
- 접근 권한
- 모달 구조 (섹션별 상세)
- 폼 필드 정의
- 인터랙션
- 조건/규칙
- Validation 규칙
- 데이터 요구사항 (Props, API)
- i18n 번역 키

---

## 4.12 Contract Filter Dialog

### Trigger
- **Location**: Contracts Page (WM & Reseller users)
- **Trigger**: User clicks "Filter" button in the page toolbar
- **Component**: `FilterDialog.tsx`

### Permissions
- **Accessible to**: All user roles (wm_admin, wm_editor, wm_viewer, reseller_admin, reseller_editor, reseller_viewer)
- **Special Behavior**:
  - WM users see "Reseller" filter field (`showResellerFilter: true`)
  - Reseller users see "Approval Status" filter field (`showApprovalStatusFilter: true`)

### Modal Structure

**Header**
- Title: "Filter" (i18n: `common.filter`)
- Close button (X icon)

**Body**
Contains 4-5 filter fields depending on user role:

**1. Reseller Filter** (WM users only, conditional: `showResellerFilter`)
- Label: "Reseller" (i18n: `contracts.reseller`)
- Component: Searchable combobox (Popover + Command)
- Options: ALL, N/A, Megazone, Bespin Global, Samsung SDS, LG CNS, SK C&C, Kakao Enterprise, Naver Cloud, KT Cloud, NHN Cloud, Gabia, Hostway, aaa, vdfghj, Cafe24, Douzone, Samsungfire, Hyundai AutoEver, Posco ICT
- Search placeholder: i18n `contracts.searchReseller`
- Empty state: i18n `contracts.noResellerFound`

**2. Service Filter**
- Label: "Service" (i18n: `contracts.service`)
- Component: Multi-select checkboxes
- Options:
  - Observability
  - Management
  - Optimization
- Behavior: Multiple selection allowed, selected items show with accent background

**3. Pricing Model Filter**
- Label: "Pricing Model" (i18n: `contracts.pricingModel`)
- Component: Single-select dropdown
- Options:
  - ALL (i18n: `common.all`)
  - Fixed Rate (i18n: `pricing.fixedRate`)
  - Pay-as-you-go (i18n: `pricing.payAsYouGo`)

**4. Status Filter**
- Label: "Status" (i18n: `common.status`)
- Component: Single-select dropdown
- Options:
  - ALL (i18n: `common.all`)
  - Active (i18n: `status.active`)
  - Inactive (i18n: `status.inactive`)
  - Expired (i18n: `status.expired`)

**5. Approval Status Filter** (Reseller users only, conditional: `showApprovalStatusFilter`)
- Label: "Approval Status" (i18n: `contracts.approvalStatus`)
- Component: Single-select dropdown
- Options:
  - ALL (i18n: `common.all`)
  - Pending (i18n: `contracts.pending`)
  - Approved (i18n: `contracts.approved`)
  - Rejected (i18n: `contracts.rejected`)
  - Cancelled (i18n: `contracts.canceled`)

**Footer**
- Reset button: "Reset" (i18n: `common.reset`) - Variant: outline, left-aligned
- Cancel button: "Cancel" (i18n: `common.cancel`) - Variant: outline
- Apply button: "Apply" (i18n: `common.apply`) - Variant: default (primary)

### Props Interface

```typescript
interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedServices: string[];
  onServicesChange: (services: string[]) => void;
  selectedPricingModel: string;
  onPricingModelChange: (model: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedReseller: string;
  onResellerChange: (reseller: string) => void;
  showResellerFilter: boolean;
  selectedApprovalStatus?: string;
  onApprovalStatusChange?: (status: string) => void;
  showApprovalStatusFilter?: boolean;
  onReset: () => void;
  onApply: () => void;
}
```

### User Interactions

1. **Service Selection**: User can check/uncheck multiple service checkboxes. Selected items show with accent background color.

2. **Reseller Search** (WM only): User opens combobox, types to search, selects from filtered list. Selection closes dropdown.

3. **Dropdown Selections**: User opens dropdown, selects one option. Selection closes dropdown.

4. **Reset**: Clears all filter selections, resets to defaults, closes modal.

5. **Cancel**: Discards any changes made in the modal, closes without applying.

6. **Apply**: Applies selected filters to the contracts table, closes modal.

### Conditional Logic

- `showResellerFilter = true` → Show Reseller filter field (WM users)
- `showResellerFilter = false` → Hide Reseller filter field (Reseller users)
- `showApprovalStatusFilter = true` → Show Approval Status filter field (Reseller users)
- `showApprovalStatusFilter = false` → Hide Approval Status filter field (WM users)

### Validation Rules

No validation rules - all filters are optional selections.

### i18n Translation Keys

```json
{
  "common": {
    "filter": "Filter",
    "all": "ALL",
    "close": "Close",
    "reset": "Reset",
    "cancel": "Cancel",
    "apply": "Apply",
    "status": "Status"
  },
  "contracts": {
    "reseller": "Reseller",
    "searchReseller": "Search reseller...",
    "noResellerFound": "No reseller found.",
    "service": "Service",
    "pricingModel": "Pricing Model",
    "approvalStatus": "Approval Status",
    "pending": "Pending",
    "approved": "Approved",
    "rejected": "Rejected",
    "canceled": "Cancelled"
  },
  "pricing": {
    "fixedRate": "Fixed Rate",
    "payAsYouGo": "Pay-as-you-go"
  },
  "status": {
    "active": "Active",
    "inactive": "Inactive",
    "expired": "Expired"
  }
}
```

### Backend Requirements

No direct API call - filters are applied client-side on the contracts table data.

---

## 4.13 Payment Filter Dialog

### Trigger
- **Location**: Payments Page (WM & Reseller users)
- **Trigger**: User clicks "Filter" button in the page toolbar
- **Component**: `PaymentFilterDialog.tsx`

### Permissions
- **Accessible to**: All user roles (wm_admin, wm_editor, wm_viewer, reseller_admin, reseller_editor, reseller_viewer)

### Modal Structure

**Header**
- Title: "Filter"
- Close button (X icon)

**Body**
Contains 2 filter fields:

**1. Period Filter**
- Label: "Period"
- Component: Two dropdowns (From - To date range)
- Format: "YYYY. MM"
- Options:
  - ALL (special value: `__CLEAR__`)
  - 2025. 10
  - 2025. 09
  - 2025. 08
  - 2025. 07
  - 2025. 06
  - 2025. 05
  - 2025. 04
  - 2025. 03
  - 2025. 02
  - 2025. 01
  - 2024. 12
  - 2024. 11
  - 2024. 10
  - 2024. 09
  - 2024. 08
- Validation: From date must be ≤ To date
- Error border: Red border on both dropdowns when validation fails
- Error message: "From date must be earlier than or equal to To date" (shown below dropdowns)

**2. Status Filter**
- Label: "Status"
- Component: Single-select dropdown
- Options:
  - ALL
  - Paid
  - Pending
  - Partial
  - Unpaid

**Footer**
- Reset button: "Reset" - Variant: outline, left-aligned
- Cancel button: "Cancel" - Variant: outline
- Apply button: "Apply" - Variant: default (primary), **disabled** when period validation fails

### Props Interface

```typescript
interface PaymentFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedPeriodFrom: string;
  onPeriodFromChange: (date: string) => void;
  selectedPeriodTo: string;
  onPeriodToChange: (date: string) => void;
  onReset: () => void;
  onApply: () => void;
}
```

### User Interactions

1. **Period Selection**: User selects From and To dates from dropdowns. Special value "__CLEAR__" clears the selection.

2. **Status Selection**: User opens dropdown, selects one status option.

3. **Reset**: Clears all filter selections (period and status), resets to defaults, closes modal.

4. **Cancel**: Discards any changes made in the modal, closes without applying.

5. **Apply**: Applies selected filters to the payments table, closes modal. Disabled if period validation fails.

### Validation Rules

| Field | Rule | Error Message (EN) | Error Message (KO) |
|-------|------|-------------------|-------------------|
| Period Range | From date ≤ To date | "From date must be earlier than or equal to To date" | "시작일은 종료일보다 이전이거나 같아야 합니다" |

**유효성 검증 동작**:
- 검사: `selectedPeriodFrom > selectedPeriodTo`
- 유효하지 않은 경우:
  - From과 To 드롭다운 모두 빨간색 테두리 (`border-destructive`)
  - 드롭다운 아래에 에러 메시지 표시
  - Apply 버튼 비활성화
- 유효하거나 둘 중 하나가 비어있는 경우:
  - 일반 테두리
  - 에러 메시지 없음
  - Apply 버튼 활성화

### i18n Translation Keys

**Note**: Current implementation uses hardcoded English strings. These should be internationalized:

```json
{
  "payments": {
    "filter": "Filter",
    "period": "Period",
    "periodFrom": "From",
    "periodTo": "To",
    "periodPlaceholder": "YYYY. MM",
    "periodValidationError": "From date must be earlier than or equal to To date",
    "status": "Status",
    "statusAll": "ALL",
    "statusPaid": "Paid",
    "statusPending": "Pending",
    "statusPartial": "Partial",
    "statusUnpaid": "Unpaid"
  },
  "common": {
    "close": "Close",
    "reset": "Reset",
    "cancel": "Cancel",
    "apply": "Apply"
  }
}
```

### Backend Requirements

No direct API call - filters are applied client-side on the payments table data.

---

## 4.14 Add Customer Dialog

### Trigger
- **Location**: Customers Page (WM & Reseller users)
- **Trigger**: User clicks "Add Customer" button in the page toolbar
- **Component**: `AddCustomerDialog.tsx`

### Permissions
- **Accessible to**:
  - WM: `wm_admin`, `wm_editor`
  - Reseller: `reseller_admin`, `reseller_editor`

### Modal Structure

**Header**
- Title: "Add Customer" (i18n: `customers.addCustomer`)
- Close button (X icon)

**Body** (Scrollable area with max-height: calc(100vh-280px))

Contains 6 form fields:

**1. Company Name** (Required)
- Label: i18n `customers.companyName`
- Component: Text input
- Placeholder: i18n `customers.enterCompanyName`
- Max height: 36px (h-9)
- Validation:
  - Required (cannot be empty after trim)
  - Minimum length: 2 characters (after trim)
- Error messages:
  - Empty: i18n `validation.companyNameRequired`
  - Too short: i18n `validation.companyNameMinLength`

**2. Country** (Required)
- Label: i18n `customers.country`
- Component: Single-select dropdown
- Default value: `'KR'` (Korea)
- Options: All countries from `COUNTRIES` constant
- Placeholder: i18n `common.selectCountry`
- Max height dropdown: 240px
- Note: Changing country resets Business Reg. No. field and clears its validation error

**3. Business Reg. No.** (Required)
- Label: i18n `customers.businessRegNo`
- Component: Text input
- Placeholder: Dynamic based on selected country (e.g., `selectedCountry.businessRegNoFormat`)
- Validation: Country-specific format validation via `validateBusinessRegNo()` utility
- Error message: Dynamic based on validation result

**4. Contact Person** (Required)
- Label: i18n `customers.contactPerson`
- Component: Text input
- Placeholder: i18n `customers.enterContactPerson`
- Validation:
  - Required (cannot be empty after trim)
  - Minimum length: 2 characters (after trim)
- Error messages:
  - Empty: i18n `validation.contactPersonRequired`
  - Too short: i18n `validation.nameMinLength`

**5. Contact Email** (Required)
- Label: i18n `customers.contactEmail`
- Component: Email input (type="email")
- Placeholder: i18n `customers.enterEmail`
- Validation:
  - Required (cannot be empty after trim)
  - Must match email format: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Error messages:
  - Empty: i18n `validation.emailRequired`
  - Invalid format: i18n `validation.invalidEmailFormat`

**6. Note** (Optional)
- Label: i18n `customers.note`
- Component: Textarea (non-resizable)
- Placeholder: i18n `customers.enterNote`
- Min height: 64px
- Max length: 280 characters (enforced on input)
- Character counter: Shows `{count}/280 {i18n:customers.characters}` below textarea

**7. Add Contract Checkbox** (Conditional)
- Shown when: `showAddContractCheckbox = true` (prop)
- Label: i18n `common.addContractAfterSaving`
- Default value: `true` (checked)
- Behavior: If checked, opens Add Contract Modal after successful customer creation

**Footer**
- Cancel button: i18n `common.cancel` - Variant: outline
- Submit button: i18n `common.submit` - Variant: default (primary)
  - Disabled when: Form is invalid (any required field empty or has validation error)

### Props Interface

```typescript
interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (customer: Omit<Customer, 'id' | 'createdAt' | 'services' | 'resellerId'>) => void;
  showAddContractCheckbox?: boolean; // Default: true
}
```

### User Interactions

1. **Field Input**: User types in form fields. On input change, any existing error for that field is cleared.

2. **Field Blur**: When user leaves a field, validation runs and shows error if invalid.

3. **Country Selection**: Changes country, resets Business Reg. No. to empty string, clears Business Reg. No. validation error.

4. **Note Input**: Character count updates in real-time. Input is blocked at 280 characters (cannot type more).

5. **Add Contract Checkbox**: User can toggle to control whether Add Contract Modal opens after submission.

6. **Cancel**: Resets all form fields to defaults, clears errors, closes modal.

7. **Submit**:
   - Validates entire form
   - If invalid, shows all validation errors and prevents submission
   - If valid, calls `onSubmit()` with customer data
   - Resets form and closes modal

### Validation Rules

| Field | Rule | Error Message (EN) | Error Message (KO) |
|-------|------|-------------------|-------------------|
| Company Name | Required | i18n: `validation.companyNameRequired` | "회사명을 입력해주세요" |
| Company Name | Min length: 2 | i18n: `validation.companyNameMinLength` | "회사명은 최소 2자 이상이어야 합니다" |
| Country | Required | i18n: `validation.countryRequired` | "국가를 선택해주세요" |
| Business Reg. No. | Country-specific format | Dynamic from `validateBusinessRegNo()` | Dynamic based on country |
| Contact Person | Required | i18n: `validation.contactPersonRequired` | "담당자명을 입력해주세요" |
| Contact Person | Min length: 2 | i18n: `validation.nameMinLength` | "이름은 최소 2자 이상이어야 합니다" |
| Contact Email | Required | i18n: `validation.emailRequired` | "이메일을 입력해주세요" |
| Contact Email | Email format | i18n: `validation.invalidEmailFormat` | "유효한 이메일 형식이 아닙니다" |

**유효성 검증 동작**:
- **입력 시 (On Input)**: 해당 필드의 기존 에러 제거
- **포커스 아웃 시 (On Blur)**: 필드 유효성 검사 후 유효하지 않으면 에러 표시
- **제출 시 (On Submit)**: 모든 필수 필드 검증, 모든 에러 표시, 에러 있으면 제출 방지
- **제출 버튼**: 필수 필드가 비어있거나 검증 에러가 있으면 비활성화

### 폼 상태

**초기 상태**:
```typescript
{
  countryCode: 'KR',
  companyName: '',
  businessRegNo: '',
  contactPerson: '',
  contactEmail: '',
  note: '',
}
```

**계약 추가 체크박스 상태**: `true` (기본 체크됨)

### i18n Translation Keys

```json
{
  "customers": {
    "addCustomer": "Add Customer",
    "companyName": "Company Name",
    "enterCompanyName": "Enter company name",
    "country": "Country",
    "businessRegNo": "Business Reg. No.",
    "contactPerson": "Contact Person",
    "enterContactPerson": "Enter contact person",
    "contactEmail": "Contact Email",
    "enterEmail": "Enter email address",
    "note": "Note",
    "enterNote": "Enter note",
    "characters": "characters"
  },
  "common": {
    "selectCountry": "Select country",
    "addContractAfterSaving": "Add contract after saving customer",
    "close": "Close",
    "cancel": "Cancel",
    "submit": "Submit"
  },
  "validation": {
    "companyNameRequired": "Company name is required",
    "companyNameMinLength": "Company name must be at least 2 characters",
    "countryRequired": "Country is required",
    "contactPersonRequired": "Contact person is required",
    "nameMinLength": "Name must be at least 2 characters",
    "emailRequired": "Email is required",
    "invalidEmailFormat": "Invalid email format"
  }
}
```

### Backend Requirements

**API Endpoint**: `POST /api/customers`

**요청 본문**:
```typescript
{
  companyName: string;
  businessRegNo: string;
  contactPerson: string;
  // Additional fields from form state:
  countryCode: string;
  contactEmail: string;
  note?: string;
}
```

**Response**:
```typescript
{
  id: string;
  companyName: string;
  businessRegNo: string;
  contactPerson: string;
  createdAt: string;
  services: [];
  resellerId?: string;
}
```

**Post-Submit Behavior**:
- If `addContractAfter` checkbox is checked, open Add Contract Modal with the newly created customer pre-selected

---

## 4.15 Notification Sheet

### Trigger
- **Location**: Available on all pages via top navigation bar
- **Trigger**: User clicks the bell icon (notification button) in the top-right navigation bar
- **Component**: `NotificationSheet.tsx`

### Permissions
- **Accessible to**: All user roles (wm_admin, wm_editor, wm_viewer, reseller_admin, reseller_editor, reseller_viewer)

### Sheet Structure

**Type**: Right-side slide-in sheet (not a centered modal)
- Width: 384px
- Height: Full viewport height
- Animation: Slides in from right

**Header**
- Title: "Notifications" (i18n: `notifications.title`)
- No close button in header (user can click outside or press ESC)

**탭 섹션**
- Component: Tabs with 2 options
- Style: Muted background with pill-style active state
- Tab 1: "All" (i18n: `notifications.all`) - Shows all notifications
- Tab 2: "Unread" (i18n: `notifications.unread`) - Shows only unread notifications

**콘텐츠 영역** (Scrollable)

**When notifications exist:**
- List of notification items
- Separator between each item

**When no notifications:**
- Empty state centered vertically and horizontally:
  - Bell icon in muted background circle (40x40px)
  - Title: "No notifications" (i18n: `notifications.noNotifications`)
  - Description line 1: "You're all caught up!" (i18n: `notifications.allCaughtUp`)
  - Description line 2: "New notifications will appear here" (i18n: `notifications.newWillAppearHere`)
  - Refresh button with icon (outlined variant)

### Notification Item Structure

Each notification item contains:

**1. Unread Indicator** (left side, 20px width)
- Yellow dot (8px diameter, `bg-yellow-400`) if unread
- Empty space if read

**2. Content Area**
- **Message**: Notification type translated with interpolated data
  - Format: `t('notifications.types.{type}', relatedData)`
  - Example: "New contract approval request from {resellerName}. Please review and approve the contract."
- **Action Link**: Button styled as link
  - Text: "Go to {pageName} page" (i18n: `notifications.goTo`)
  - Underlines on hover
  - Clickable to navigate to related page
- **Timestamp**: Small muted text
  - Format: "32 minute ago · 2023.02.21 11:19:22 (GMT +9)"

### Notification Data Structure

```typescript
interface Notification {
  id: string;
  type: string; // Translation key for notification message
  relatedData?: Record<string, string | number>; // Dynamic data for interpolation
  pageName: string; // Translation key for page name (e.g., 'nav.contracts')
  timestamp: string;
  isRead: boolean;
}
```

### Notification Types

| Type | Description | Related Data | Target Page |
|------|-------------|--------------|-------------|
| `contract_approval_request` | New contract needs WM approval | `resellerName` | Contracts |
| `contract_expiring_soon` | Contract expiring in N days | `customerName`, `days` | Contracts |
| `contract_expiring_urgent` | Urgent: Contract expiring soon | `customerName`, `days` | Contracts |
| `payment_overdue` | Payment is overdue | `customerName` | Payments |
| `new_reseller_signup` | New reseller registered | `resellerName` | Resellers |
| `user_account_created` | New user account created | `email` | Settings |
| `contract_approved` | Contract approved by WM | `contractId`, `customerName` | Contracts |
| `contract_rejected` | Contract rejected by WM | `contractId`, `customerName` | Contracts |
| `payment_due_soon` | Payment due in N days | `amount`, `days`, `period` | Payments |
| `payment_due_urgent` | Urgent: Payment due soon | `amount`, `days` | Payments |
| `payment_processed` | Payment successfully processed | `customerName`, `contractId`, `amount` | Payments |
| `user_invitation_sent` | User invitation sent | `email` | Settings |
| `user_invitation_accepted` | User accepted invitation | `email` | Settings |

### User Interactions

1. **Open Sheet**: User clicks bell icon in top navigation, sheet slides in from right.

2. **Switch Tabs**: User clicks "All" or "Unread" tab to filter notifications.

3. **Click Notification Action**:
   - Marks notification as read if it was unread
   - Closes the notification sheet
   - Navigates to related page (currently navigates to /404 as placeholder)

4. **Refresh Notifications** (empty state only):
   - User clicks refresh button
   - Triggers notification refresh (currently logs to console)

5. **Close Sheet**: User clicks outside sheet or presses ESC key.

### State Management

**로컬 상태**:
```typescript
const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
const [notifications, setNotifications] = useState(mockNotifications);
```

**Mark as Read Logic**:
```typescript
const handleMarkAsRead = (notificationId: string) => {
  setNotifications(prev =>
    prev.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    )
  );
};
```

### Props Interface

```typescript
interface NotificationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

### i18n Translation Keys

```json
{
  "notifications": {
    "title": "Notifications",
    "all": "All",
    "unread": "Unread",
    "noNotifications": "No notifications",
    "allCaughtUp": "You're all caught up!",
    "newWillAppearHere": "New notifications will appear here",
    "refresh": "Refresh",
    "goTo": "Go to {{pageName}} page",
    "types": {
      "contract_approval_request": "New contract approval request from {{resellerName}}. Please review and approve the contract.",
      "contract_expiring_soon": "Your contract with {{customerName}} is expiring in {{days}} days. Please review and renew the contract.",
      "contract_expiring_urgent": "Urgent: Your contract with {{customerName}} is expiring in {{days}} days. Immediate action required.",
      "payment_overdue": "Payment is overdue for {{customerName}}. Please contact them immediately.",
      "new_reseller_signup": "New reseller {{resellerName}} has signed up. Please review their information.",
      "user_account_created": "New account has been created for {{email}}.",
      "contract_approved": "Your contract #{{contractId}} with {{customerName}} has been approved by WonderMove.",
      "contract_rejected": "Your contract #{{contractId}} with {{customerName}} has been rejected by WonderMove. Please review the feedback.",
      "payment_due_soon": "Payment of ${{amount}} is due in {{days}} days for the period {{period}}.",
      "payment_due_urgent": "Urgent: Payment of ${{amount}} is due in {{days}} days. Please process immediately.",
      "payment_processed": "New payment received from {{customerName}} for contract {{contractId}}. The total amount is ${{amount}} and has been successfully processed.",
      "user_invitation_sent": "Invitation has been sent to {{email}}.",
      "user_invitation_accepted": "{{email}} has accepted your invitation and joined the team."
    }
  }
}
```

Korean translations follow the same structure with Korean messages.

### Mock Data Example

```typescript
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'contract_approval_request',
    relatedData: { resellerName: 'TechPartners Solutions' },
    pageName: 'nav.contracts',
    timestamp: '32 minute ago · 2023.02.21 11:19:22 (GMT +9)',
    isRead: false,
  },
  {
    id: '2',
    type: 'contract_expiring_soon',
    relatedData: { customerName: 'TechPartners Solutions', days: 10 },
    pageName: 'nav.contracts',
    timestamp: '1 hour ago · 2023.02.21 10:45:30 (GMT +9)',
    isRead: false,
  },
  {
    id: '3',
    type: 'payment_processed',
    relatedData: {
      customerName: 'Alex Buckmaster',
      contractId: '240115-CUST001-01',
      amount: '4024.92'
    },
    pageName: 'nav.payments',
    timestamp: '2 hours ago · 2023.02.21 09:30:15 (GMT +9)',
    isRead: true,
  },
  {
    id: '4',
    type: 'new_reseller_signup',
    relatedData: { resellerName: 'Global Tech Inc' },
    pageName: 'nav.resellers',
    timestamp: '32 minute ago · 2023.02.21 11:19:22 (GMT +9)',
    isRead: true,
  },
];
```

### Backend Requirements

**API Endpoint**: `GET /api/notifications`

**쿼리 파라미터**:
- `filter`: 'all' | 'unread'

**Response**:
```typescript
{
  notifications: Array<{
    id: string;
    type: string;
    relatedData?: Record<string, string | number>;
    pageName: string;
    timestamp: string;
    isRead: boolean;
  }>;
}
```

**Mark as Read Endpoint**: `PUT /api/notifications/{id}/read`

**새로고침 엔드포인트**: `GET /api/notifications/refresh`

### UX Notes

- **Unread Badge**: The bell icon in the top navigation should show a badge count of unread notifications
- **Real-time Updates**: Consider WebSocket or polling for real-time notification updates
- **Navigation**: Currently navigates to `/404` as placeholder - needs implementation for actual page routing based on `pageName`
- **Responsive**: Sheet width is fixed at 384px, works well on desktop and tablets

---

**문서 작성일:** 2025-01-17
# Section 5: Toast Notifications (토스트 알림)

이 섹션에서는 WM Sales Portal에서 사용되는 모든 토스트 메시지를 정의합니다.

---

## 5.1 Toast System Configuration

### Technical Setup

**Hook**: `useToast` from `/hooks/use-toast.ts`
**UI Component**: `Toaster` in `/components/ui/toaster.tsx`

### Configuration
- **TOAST_LIMIT**: 1 (한 번에 하나의 토스트만 표시)
- **AUTO_DISMISS_DELAY**: 3000ms (3초 후 자동 사라짐)
- **Position**: Bottom-right of screen

### Toast Variants

| Variant | Usage | Visual Style |
|---------|-------|-------------|
| `success` (default) | Successful operations | Green background, checkmark icon |
| `destructive` | Errors and failures | Red background, alert icon |

### Toast Structure

```typescript
toast({
  title: string;          // Main message (required)
  description?: string;   // Additional details (optional)
  variant?: 'success' | 'destructive';  // Default: 'success'
})
```

---

## 5.2 Toast Messages by Category

### 5.2.1 Customer Management

| Trigger | Type | Title (EN) | Title (KO) | Description | i18n Key |
|---------|------|-----------|-----------|-------------|----------|
| Customer created | Success | "Customer created successfully" | "고객사 생성 완료" | - | `toast.customerCreated` |
| Customer updated | Success | "Customer updated successfully" | "고객사 수정 완료" | - | `customerDetail.customerUpdated` ✅ |
| Customer deleted | Success | "Customer deleted successfully" | "고객사 삭제 완료" | - | `customerDetail.customerDeleted` ✅ |

**Files**: `CustomersPage.tsx`, `CustomerDetailPage.tsx`, `ContractsPage.tsx`

---

### 5.2.2 Contract Management

| Trigger | Type | Title (EN) | Title (KO) | Description | i18n Key |
|---------|------|-----------|-----------|-------------|----------|
| Contract submitted (new) | Success | "Contract submitted successfully" | "계약 제출 완료" | - | `addContract.contractSubmitted` ✅ |
| Contract updated | Success | "Contract updated successfully" | "계약 수정 완료" | - | `addContract.contractUpdated` ✅ |
| Contract deleted | Success | "Contract deleted" | "계약 삭제됨" | {companyName} contract has been deleted | `contractDetail.contractDeleted` ✅ |
| Contract activated | Success | "Contract activated" | "계약 활성화됨" | - | `contractDetail.contractActivated` ✅ |
| Contract deactivated | Success | "Contract deactivated" | "계약 비활성화됨" | - | `contractDetail.contractDeactivated` ✅ |
| Contract rejected | Success | "Contract rejected" | "계약 거절됨" | - | `toast.contractRejected` |
| Rejected contract deleted | Success | "Rejected contract deleted" | "거절된 계약 삭제됨" | - | `contractDetail.rejectedContractDeleted` ✅ |
| Submission cancelled | Success | "Submission cancelled" | "제출 취소됨" | - | `contractDetail.submissionCancelled` ✅ |

**Files**: `ContractsPage.tsx`, `ContractDetailPage.tsx`, `ResellerContractDetailPage.tsx`, `ResellerDetailPage.tsx`

---

### 5.2.3 Note Management

| Trigger | Type | Title (EN) | Title (KO) | Description | i18n Key |
|---------|------|-----------|-----------|-------------|----------|
| Note added | Success | "Note added" | "노트 추가됨" | - | `note.noteAdded` ✅ |
| Note updated | Success | "Note updated" | "노트 수정됨" | - | `note.noteUpdated` ✅ |
| Note deleted | Success | "Note deleted" | "노트 삭제됨" | - | `note.noteDeleted` ✅ |

**Files**: `CustomersPage.tsx`, `ContractsPage.tsx`, `CustomerDetailPage.tsx`, `ContractDetailPage.tsx`, `ResellerDetailPage.tsx`, `ResellerContractDetailPage.tsx`, `ResellerPage.tsx`

---

### 5.2.4 Reseller Management

| Trigger | Type | Title (EN) | Title (KO) | Description | i18n Key |
|---------|------|-----------|-----------|-------------|----------|
| Reseller created | Success | "Success" | "성공" | {resellerName} has been added successfully | `toast.success` ✅ |
| Reseller updated | Success | "Reseller updated successfully" | "리셀러 수정 완료" | - | `resellerDetail.resellerUpdated` ✅ |
| Reseller deleted | Success | "Deleted successfully" | "삭제되었습니다" | - | `toast.deleted` ✅ |
| Service added | Success | "Service added successfully" | "서비스 추가 완료" | - | `resellerDetail.serviceAdded` ✅ |
| Pricing updated | Success | "Pricing updated successfully" | "가격 정보 수정 완료" | - | `resellerDetail.pricingUpdated` ✅ |
| Billing emails updated | Success | "Billing emails updated" | "청구서 이메일 수정됨" | - | `resellerDetail.billingEmailsUpdated` ✅ |
| Invitation sent | Success | "Resend Invitation" | "초대 재전송" | {email} invitation has been resent | `settings.resendInvitation` ✅ |
| Invitation cancelled | Success | "Cancel Invitation" | "초대 취소" | {email} invitation has been canceled | `settings.cancelInvitation` ✅ |

**Files**: `ResellerPage.tsx`, `ResellerDetailPage.tsx`

---

### 5.2.5 Account & User Management

| Trigger | Type | Title (EN) | Title (KO) | Description | i18n Key |
|---------|------|-----------|-----------|-------------|----------|
| Account created | Success | "Account created successfully" | "계정 생성 완료" | - | `toast.accountCreated` |
| Account creation failed | Error | "Failed to create account" | "계정 생성 실패" | - | `toast.accountCreationFailed` |
| Account updated | Success | "Account updated successfully" | "계정 수정 완료" | - | `toast.accountUpdated` |
| Account update failed | Error | "Failed to update account" | "계정 수정 실패" | - | `toast.accountUpdateFailed` |
| Account deleted | Success | "Account deleted successfully" | "계정 삭제 완료" | - | `toast.accountDeleted` |
| User registration successful | Success | "Registration successful" | "가입 완료" | - | `auth.signup.registrationSuccessful` ✅ |
| User registration failed | Error | "Registration failed" | "가입 실패" | - | `auth.signup.registrationFailed` ✅ |
| Invalid invitation | Error | "Invalid invitation link" | "유효하지 않은 초대 링크" | - | `auth.signup.invalidInvitation` ✅ |

**Files**: `SettingsPage.tsx`, `UserSignupPage.tsx`, `ResellerSignupPage.tsx`

---

### 5.2.6 Payment & Invoice Management

| Trigger | Type | Title (EN) | Title (KO) | Description | i18n Key |
|---------|------|-----------|-----------|-------------|----------|
| Invoice number copied | Success | "Copied!" | "복사됨!" | Invoice number copied to clipboard | `common.copied` ✅ |
| Invoice updated | Success | "Invoice updated successfully" | "청구서 수정 완료" | - | `toast.invoiceUpdated` |
| Deposit date updated | Success | "Deposit date updated successfully" | "입금일 수정 완료" | - | `toast.depositDateUpdated` |
| Billing emails updated | Success | "Billing emails updated" | "청구서 이메일 수정됨" | - | `contractDetail.billingEmailsUpdated` ✅ |

**Files**: `PaymentsPage.tsx`, `CustomerDetailPage.tsx`, `ContractDetailPage.tsx`, `ResellerDetailPage.tsx`

---

### 5.2.7 Authentication & Password

| Trigger | Type | Title (EN) | Title (KO) | Description | i18n Key |
|---------|------|-----------|-----------|-------------|----------|
| Password reset successful | Success | "Password reset successful" | "비밀번호 재설정 완료" | - | `auth.resetPassword.resetSuccessful` ✅ |
| Password reset failed | Error | "Error" | "오류" | - | `auth.resetPassword.resetFailed` ✅ |
| New verification code sent | Success | "New code sent" | "새 코드 전송됨" | - | `auth.expiredCode.newCodeSent` ✅ |
| Failed to send code | Error | "Failed to send verification code" | "인증 코드 전송 실패" | Please try again | `auth.forgotPassword.failedToSend` ✅ |
| No account found | Error | "No account found" | "계정을 찾을 수 없음" | No account registered with this email | `auth.forgotPassword.noAccountFound` ✅ |

**Files**: `ResetPasswordForm.tsx`, `ExpiredCodeForm.tsx`

---

### 5.2.8 Form Validation Errors

| Trigger | Type | Title (EN) | Title (KO) | Description | i18n Key |
|---------|------|-----------|-----------|-------------|----------|
| No service selected | Error | "Validation Error" | "검증 오류" | Please select at least one service | `toast.validationError` |
| Form validation failed | Error | "Validation Error" | "검증 오류" | Please fix the errors before continuing | `toast.validationError` |

**Files**: `AddServiceModal.tsx`, `EditPricingModal.tsx`

---

### 5.2.9 Language & Preferences

| Trigger | Type | Title (EN) | Title (KO) | Description | i18n Key |
|---------|------|-----------|-----------|-------------|----------|
| Language changed | Success | "Success" | "성공" | Language changed to {language} | `toast.success` ✅ |

**Files**: `SettingsPage.tsx`

---

## 5.3 i18n Translation Keys

### Required New Keys (Currently Hardcoded)

These messages are currently hardcoded and need to be added to translation files:

```json
{
  "toast": {
    "success": "Success",
    "deleted": "Deleted successfully",
    "customerCreated": "Customer created successfully",
    "contractRejected": "Contract rejected",
    "accountCreated": "Account created successfully",
    "accountCreationFailed": "Failed to create account",
    "accountUpdated": "Account updated successfully",
    "accountUpdateFailed": "Failed to update account",
    "accountDeleted": "Account deleted successfully",
    "invoiceUpdated": "Invoice updated successfully",
    "depositDateUpdated": "Deposit date updated successfully",
    "validationError": "Validation Error"
  }
}
```

Korean:
```json
{
  "toast": {
    "success": "성공",
    "deleted": "삭제되었습니다",
    "customerCreated": "고객사 생성 완료",
    "contractRejected": "계약 거절됨",
    "accountCreated": "계정 생성 완료",
    "accountCreationFailed": "계정 생성 실패",
    "accountUpdated": "계정 수정 완료",
    "accountUpdateFailed": "계정 수정 실패",
    "accountDeleted": "계정 삭제 완료",
    "invoiceUpdated": "청구서 수정 완료",
    "depositDateUpdated": "입금일 수정 완료",
    "validationError": "검증 오류"
  }
}
```

---

## 5.4 Toast Usage Statistics

### Summary
- **Total Toast Usages**: 55+
- **Success Toasts**: ~45 (82%)
- **Error/Destructive Toasts**: ~10 (18%)
- **Files Using Toasts**: 15
- **i18n Integration**: 70% use translation keys
- **Hardcoded Messages**: 30% (need migration to i18n)

### Pages with Most Toast Usage
1. **ResellerDetailPage.tsx**: 10 toasts
2. **CustomerDetailPage.tsx**: 9 toasts
3. **ContractDetailPage.tsx**: 8 toasts
4. **ResellerContractDetailPage.tsx**: 7 toasts
5. **ResellerPage.tsx**: 5 toasts

---

## 5.5 Best Practices

### When to Use Toasts

✅ **DO Use Toasts For:**
- Successful CRUD operations (create, update, delete)
- Copy to clipboard confirmations
- Form submission success
- Background operation completion
- Status changes (activate/deactivate)

❌ **DON'T Use Toasts For:**
- Critical errors that require user action (use Dialog instead)
- Long error messages (use inline validation)
- Multiple sequential operations (use progress indicator)
- Permanent information (use inline messages)

### Toast Message Guidelines

1. **Keep it Short**: Title should be 2-5 words, description optional
2. **Be Specific**: "Customer created" instead of "Success"
3. **Use Action Verbs**: "Contract deleted", "Note added", "Email sent"
4. **Provide Context**: Include entity name in description when helpful
5. **Translate Everything**: Use i18n keys, avoid hardcoded strings

### Example Good Toast

```typescript
toast({
  title: t('toast.customerCreated'),
  description: `${customerName} has been added successfully`,
  variant: 'success',
});
```

### Example Poor Toast

```typescript
// ❌ Hardcoded, too generic
toast({
  title: "Success",
  description: "Operation completed",
});
```

---

**문서 작성일:** 2025-01-17

---

# Section 6: Layout Components (레이아웃 컴포넌트)

이 섹션에서는 애플리케이션의 레이아웃을 구성하는 공통 컴포넌트들을 정의합니다.

---

## 6.1 Header Component (상단 헤더)

### Component Path
`/src/components/layout/Header.tsx`

### Structure

**Position**: Sticky top (z-10), fixed at top of viewport
**Height**: 64px (h-16)
**Background**: Card background with bottom border

### Left Section - Navigation Controls

**1. Sidebar Toggle Button**
- **Icon**: PanelLeft (햄버거 메뉴)
- **Size**: 28x28px (h-7 w-7)
- **Action**: Toggles sidebar visibility (collapse/expand)
- **Callback**: `onToggleSidebar()`
- **Accessibility**: aria-label="Toggle sidebar"
- **Visual States**:
  - Default: Muted foreground color
  - Hover: Foreground color + accent background
  - Active: N/A (instant toggle)

**2. Back Button (뒤로 가기)**
- **Icon**: ArrowLeft (←)
- **Size**: 28x28px (h-7 w-7)
- **Action**: Navigate to previous page in history
- **Enabled When**: `canGoBack === true` (history index > 0)
- **Disabled When**: At the beginning of navigation history
- **Behavior**:
  - Uses custom navigation history tracker (global state)
  - Calls `navigate(-1)` (React Router)
  - Decrements `currentHistoryIndex`
- **Accessibility**: aria-label="Go back"
- **Visual States**:
  - Enabled: Muted foreground, hover shows foreground + accent
  - Disabled: 30% opacity, cursor not-allowed, no hover effect

**3. Forward Button (앞으로 가기)**
- **Icon**: ArrowRight (→)
- **Size**: 28x28px (h-7 w-7)
- **Action**: Navigate to next page in history
- **Enabled When**: `canGoForward === true` (history index < history length - 1)
- **Disabled When**: At the end of navigation history
- **Behavior**:
  - Uses custom navigation history tracker
  - Calls `navigate(1)` (React Router)
  - Increments `currentHistoryIndex`
- **Accessibility**: aria-label="Go forward"
- **Visual States**:
  - Enabled: Muted foreground, hover shows foreground + accent
  - Disabled: 30% opacity, cursor not-allowed, no hover effect

### Right Section - Notifications

**알림 버튼**
- **Icon**: Bell
- **Size**: 32x32px (h-8 w-8)
- **Action**: Opens NotificationSheet (right-side slide-in panel)
- **Callback**: `onOpenNotifications()`
- **Accessibility**: aria-label="Notifications"
- **Badge**:
  - **Position**: Absolute top-right (-top-1 -right-1)
  - **Size**: 16px height, minimum 16px width
  - **Background**: Red (bg-red-500)
  - **Text**: White, 10px font size
  - **Content**: 
    - Shows count if `unreadCount > 0`
    - Shows "9+" if count > 9
    - Hidden if `unreadCount === 0`

### Navigation History System

**전역 상태**:
```typescript
const navigationHistory: string[] = []; // Stores pathname + search
let currentHistoryIndex: number = -1;   // Current position in history
```

**히스토리 추적 로직**:
1. **On Location Change**:
   - If not navigating via back/forward buttons:
     - Remove all forward history (splice from current index + 1)
     - Add current path if different from last entry
     - Increment index
   - Update `canGoBack` and `canGoForward` states

2. **Back Button Click**:
   - Set `isNavigatingRef.current = true` (flag to prevent history addition)
   - Decrement `currentHistoryIndex`
   - Call `navigate(-1)`

3. **Forward Button Click**:
   - Set `isNavigatingRef.current = true`
   - Increment `currentHistoryIndex`
   - Call `navigate(1)`

### Props Interface

```typescript
interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenNotifications?: () => void;
  unreadCount?: number; // Default: 0
}
```

### i18n Translation Keys

Header buttons use aria-labels (not translated currently):
- "Toggle sidebar"
- "Go back"
- "Go forward"
- "Notifications"

---

## 6.2 Sidebar Component (좌측 사이드바)

### Component Path
`/src/components/layout/Sidebar.tsx`

### Structure

**Position**: Fixed left side
**Width**: 240px (w-60)
**Height**: Full viewport (h-screen)
**Background**: Card background with right border

### Section 1: Logo

**Container**:
- Height: 64px (h-16) - matches header height
- Padding: 24px horizontal (px-6)

**로고 이미지**:
- Source: `/src/asset/logo.svg`
- Alt text: "Skuber Partner Portal"
- Height: 32px (h-8)

### Section 2: Navigation Menu (Main)

**Container**:
- Flex: flex-1 (takes remaining space)
- Padding: 16px (p-4)

**Menu Items** (Role-based):

**WM Users Menu** (wm_admin, wm_editor, wm_viewer, wm_staff):
| Order | Icon | Translation Key | Route |
|-------|------|----------------|-------|
| 1 | LayoutDashboard | `nav.dashboard` | `/dashboard` |
| 2 | UsersRound | `nav.customers` | `/customers` |
| 3 | FilePenLine | `nav.contracts` | `/contracts` |
| 4 | DollarSign | `nav.payments` | `/payments` |
| 5 | Handshake | `nav.resellers` | `/reseller` |

**Reseller Users Menu** (reseller_admin, reseller_editor, reseller_viewer):
| Order | Icon | Translation Key | Route |
|-------|------|----------------|-------|
| 1 | LayoutDashboard | `nav.dashboard` | `/dashboard` |
| 2 | UsersRound | `nav.customers` | `/customers` |
| 3 | FilePenLine | `nav.contracts` | `/contracts` |
| 4 | DollarSign | `nav.myPayments` | `/my-payments` |

**메뉴 항목 스타일**:
- **Inactive State**:
  - Text: Muted foreground
  - Background: Transparent
  - Hover: Accent background + accent foreground text
- **Active State**:
  - Text: Secondary foreground
  - Background: Secondary
  - Determined by: `location.pathname === item.path || location.pathname.startsWith(item.path + '/')`

**메뉴 항목 구조**:
- Gap: 12px between icon and text
- Padding: 8px vertical, 12px horizontal
- Border radius: Medium (rounded-md)
- Icon size: 20x20px (w-5 h-5)
- Font size: Small (text-sm)

### Section 3: User Profile & Settings

**Container**:
- Padding: 16px (p-4)

**프로필 버튼** (Dropdown Trigger):
- **Avatar**:
  - Size: 32x32px (w-8 h-8)
  - Background: Muted
  - Text: User initials (via `getInitials()` utility)
  - Font size: Extra small (text-xs)
- **User Info**:
  - Name: text-sm font-medium
  - Email: text-xs muted-foreground, truncated
- **Hover State**: Accent background

**드롭다운 메뉴**:
- **Position**: Aligned to end (right), 16px offset from bottom
- **Width**: 224px (w-56)
- **Items**:

| Icon | Label | Action | Translation Key |
|------|-------|--------|----------------|
| Settings | "Settings" | Navigate to `/settings` | `nav.settings` |
| LogOut | "Logout" | Open logout confirmation dialog | (Hardcoded "Logout") |

### Logout Confirmation Dialog

**Type**: AlertDialog
**Trigger**: Click "Logout" in dropdown menu

**Content**:
- **Title**: i18n `common.logout` ("Logout")
- **Description**: i18n `common.logoutConfirm` ("Are you sure you want to logout?")
- **Buttons**:
  - Cancel: i18n `common.cancel` - Closes dialog
  - Logout: i18n `common.logout` - Calls `logout()` from AuthContext

**Styling**:
- Background: Card
- Border: Border color
- Padding: 24px (p-6)
- Border radius: Large (rounded-lg)
- Gap: 16px between sections

### Conditional Logic

**메뉴 항목**: 
- WM users: 5 menu items (includes Payments, Resellers)
- Reseller users: 4 menu items (My Payments instead of Payments, no Resellers)

**사용자 표시**:
- Returns `null` if `user` is not defined (not authenticated)
- Initials calculated from user name

### State Management

**로컬 상태**:
```typescript
const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
```

**Context 사용**:
- `user` from AuthContext (name, email, role)
- `logout` function from AuthContext

### i18n Translation Keys

```json
{
  "nav": {
    "dashboard": "Dashboard",
    "customers": "Customers",
    "contracts": "Contracts",
    "payments": "Payments",
    "myPayments": "My Payments",
    "resellers": "Resellers",
    "settings": "Settings"
  },
  "common": {
    "logout": "Logout",
    "logoutConfirm": "Are you sure you want to logout?",
    "cancel": "Cancel"
  }
}
```

### Accessibility

- Sidebar navigation uses semantic `<nav>` element
- Menu items use proper `<Link>` components for keyboard navigation
- Dropdown menu has proper focus management
- Avatar has fallback text for screen readers

---

## 6.3 Layout Integration

### Main Layout Structure

```
┌─────────────────────────────────────────┐
│ Header (64px fixed top)                 │
│ ┌─────┬──────┬──────┐     ┌──────┐     │
│ │Menu │  ←   │  →   │     │ Bell │     │
│ └─────┴──────┴──────┘     └──────┘     │
├─────────────────────────────────────────┤
│ Sidebar    │ Main Content Area          │
│ (240px)    │                            │
│            │                            │
│ - Logo     │  Page Content              │
│ - Nav      │  (scrollable)              │
│ - User     │                            │
│            │                            │
└────────────┴────────────────────────────┘
```

### Responsive Behavior

**사이드바 토글**:
- Desktop: Sidebar always visible by default
- Click PanelLeft button: Sidebar collapses/expands
- State managed by parent layout component

**Header**:
- Always visible (sticky)
- Navigation buttons always accessible
- Notification badge responsive to count

**Z-Index Layers**:
1. Header: z-10
2. NotificationSheet: z-50 (when open)
3. Modals/Dialogs: z-50+
4. Dropdown menus: Auto-managed by Radix UI

---

**문서 작성일:** 2025-01-17
