# Claude Code 자동 설치 가이드

이 문서는 Claude Code가 shadcn/ui Storybook Registry의 모든 컴포넌트를 자동으로 설치할 수 있도록 하는 완전 자동화 가이드입니다.

## 🎯 사용 방법

작업자가 Claude Code에게 다음과 같이 요청하세요:

```
이 문서를 참고해서 컴포넌트를 세팅해줘
```

Claude Code는 이 문서를 읽고 자동으로 모든 단계를 수행합니다.

## 📋 자동 설치 체크리스트

### Phase 1: 프로젝트 기본 설정
- [ ] 프로젝트 디렉토리 확인 및 이동
- [ ] package.json 존재 확인
- [ ] shadcn/ui 초기화: `npx shadcn@latest init`
- [ ] components.json 생성 확인

### Phase 2: Registry 서버 확인
- [ ] Registry 서버 실행 상태 확인 (http://localhost:3000)
- [ ] Registry 엔드포인트 테스트
- [ ] 필요시 Registry 서버 시작

### Phase 3: 전체 컴포넌트 설치 (46개)

#### 3-1. Core UI Components (기본 UI)
```bash
npx shadcn@latest add http://localhost:3000/v2/r/button-story.json
npx shadcn@latest add http://localhost:3000/v2/r/input-story.json
npx shadcn@latest add http://localhost:3000/v2/r/label-story.json
npx shadcn@latest add http://localhost:3000/v2/r/textarea-story.json
npx shadcn@latest add http://localhost:3000/v2/r/select-story.json
npx shadcn@latest add http://localhost:3000/v2/r/checkbox-story.json
npx shadcn@latest add http://localhost:3000/v2/r/radio-group-story.json
npx shadcn@latest add http://localhost:3000/v2/r/switch-story.json
npx shadcn@latest add http://localhost:3000/v2/r/slider-story.json
```

#### 3-2. Layout & Navigation
```bash
npx shadcn@latest add http://localhost:3000/v2/r/card-story.json
npx shadcn@latest add http://localhost:3000/v2/r/separator-story.json
npx shadcn@latest add http://localhost:3000/v2/r/tabs-story.json
npx shadcn@latest add http://localhost:3000/v2/r/accordion-story.json
npx shadcn@latest add http://localhost:3000/v2/r/collapsible-story.json
npx shadcn@latest add http://localhost:3000/v2/r/navigation-menu-story.json
npx shadcn@latest add http://localhost:3000/v2/r/menubar-story.json
npx shadcn@latest add http://localhost:3000/v2/r/breadcrumb-story.json
npx shadcn@latest add http://localhost:3000/v2/r/pagination-story.json
npx shadcn@latest add http://localhost:3000/v2/r/sidebar-story.json
```

#### 3-3. Overlays & Modals
```bash
npx shadcn@latest add http://localhost:3000/v2/r/dialog-story.json
npx shadcn@latest add http://localhost:3000/v2/r/sheet-story.json
npx shadcn@latest add http://localhost:3000/v2/r/drawer-story.json
npx shadcn@latest add http://localhost:3000/v2/r/alert-dialog-story.json
npx shadcn@latest add http://localhost:3000/v2/r/popover-story.json
npx shadcn@latest add http://localhost:3000/v2/r/hover-card-story.json
npx shadcn@latest add http://localhost:3000/v2/r/tooltip-story.json
npx shadcn@latest add http://localhost:3000/v2/r/dropdown-menu-story.json
npx shadcn@latest add http://localhost:3000/v2/r/context-menu-story.json
```

#### 3-4. Feedback & Status
```bash
npx shadcn@latest add http://localhost:3000/v2/r/alert-story.json
npx shadcn@latest add http://localhost:3000/v2/r/badge-story.json
npx shadcn@latest add http://localhost:3000/v2/r/progress-story.json
npx shadcn@latest add http://localhost:3000/v2/r/skeleton-story.json
npx shadcn@latest add http://localhost:3000/v2/r/sonner-story.json
npx shadcn@latest add http://localhost:3000/v2/r/toggle-story.json
npx shadcn@latest add http://localhost:3000/v2/r/toggle-group-story.json
```

#### 3-5. Data Display
```bash
npx shadcn@latest add http://localhost:3000/v2/r/table-story.json
npx shadcn@latest add http://localhost:3000/v2/r/avatar-story.json
npx shadcn@latest add http://localhost:3000/v2/r/aspect-ratio-story.json
npx shadcn@latest add http://localhost:3000/v2/r/scroll-area-story.json
npx shadcn@latest add http://localhost:3000/v2/r/resizable-story.json
```

#### 3-6. Form & Input Advanced
```bash
npx shadcn@latest add http://localhost:3000/v2/r/form-story.json
npx shadcn@latest add http://localhost:3000/v2/r/combobox-story.json
npx shadcn@latest add http://localhost:3000/v2/r/command-story.json
npx shadcn@latest add http://localhost:3000/v2/r/input-otp-story.json
npx shadcn@latest add http://localhost:3000/v2/r/date-picker-story.json
npx shadcn@latest add http://localhost:3000/v2/r/calendar-story.json
```

#### 3-7. Data Visualization
```bash
npx shadcn@latest add http://localhost:3000/v2/r/chart-story.json
npx shadcn@latest add http://localhost:3000/v2/r/carousel-story.json
```

### Phase 4: Design Tokens (디자인 시스템)
```bash
npx shadcn@latest add http://localhost:3000/v2/r/color-story.json
npx shadcn@latest add http://localhost:3000/v2/r/typography-story.json
npx shadcn@latest add http://localhost:3000/v2/r/spacing-story.json
npx shadcn@latest add http://localhost:3000/v2/r/shadow-story.json
npx shadcn@latest add http://localhost:3000/v2/r/radius-story.json
```

### Phase 5: 검증 및 완료
- [ ] 설치된 컴포넌트 개수 확인 (46개)
- [ ] src/components/ui/ 디렉토리 확인
- [ ] src/registry/ 디렉토리 확인
- [ ] Storybook 실행 테스트: `npm run storybook`
- [ ] 모든 스토리가 정상 로드되는지 확인

## 🛠️ 설치 스크립트 (자동화)

Claude Code는 다음 스크립트를 실행할 수 있습니다:

### 전체 설치 스크립트
```bash
#!/bin/bash
echo "🚀 shadcn/ui Storybook Registry 전체 설치 시작..."

# Registry 서버 확인
if ! curl -s http://localhost:3000/v2/r/ > /dev/null; then
    echo "❌ Registry 서버가 실행되지 않았습니다."
    echo "🔧 Registry 서버를 먼저 시작해주세요: npm run registry:dev"
    exit 1
fi

echo "✅ Registry 서버 확인 완료"

# 모든 컴포넌트 설치
components=(
    "button-story"
    "input-story"
    "label-story"
    "textarea-story"
    "select-story"
    "checkbox-story"
    "radio-group-story"
    "switch-story"
    "slider-story"
    "card-story"
    "separator-story"
    "tabs-story"
    "accordion-story"
    "collapsible-story"
    "navigation-menu-story"
    "menubar-story"
    "breadcrumb-story"
    "pagination-story"
    "sidebar-story"
    "dialog-story"
    "sheet-story"
    "drawer-story"
    "alert-dialog-story"
    "popover-story"
    "hover-card-story"
    "tooltip-story"
    "dropdown-menu-story"
    "context-menu-story"
    "alert-story"
    "badge-story"
    "progress-story"
    "skeleton-story"
    "sonner-story"
    "toggle-story"
    "toggle-group-story"
    "table-story"
    "avatar-story"
    "aspect-ratio-story"
    "scroll-area-story"
    "resizable-story"
    "form-story"
    "combobox-story"
    "command-story"
    "input-otp-story"
    "date-picker-story"
    "calendar-story"
    "chart-story"
    "carousel-story"
    "color-story"
    "typography-story"
    "spacing-story"
    "shadow-story"
    "radius-story"
)

total=${#components[@]}
current=0

for component in "${components[@]}"; do
    current=$((current + 1))
    echo "📦 [$current/$total] Installing $component..."
    
    if npx shadcn@latest add "http://localhost:3000/v2/r/${component}.json" --yes; then
        echo "✅ $component 설치 완료"
    else
        echo "❌ $component 설치 실패"
    fi
    
    # 설치 간격 (서버 부하 방지)
    sleep 1
done

echo ""
echo "🎉 모든 컴포넌트 설치 완료!"
echo "📊 총 $total개 컴포넌트가 설치되었습니다."
echo ""
echo "🚀 다음 단계:"
echo "   npm run storybook  # Storybook 실행"
echo ""
```

## 🔍 문제 해결

### Registry 서버가 실행되지 않은 경우
```bash
# Registry 서버 시작
npm run registry:dev

# 또는 Storybook 서버 시작
npm run storybook
```

### 특정 컴포넌트 설치 실패 시
```bash
# 개별 재설치
npx shadcn@latest add http://localhost:3000/v2/r/[컴포넌트명]-story.json --force
```

### 의존성 충돌 시
```bash
# 패키지 재설치
rm -rf node_modules package-lock.json
npm install
```

## 📊 설치 확인

### 설치 완료 후 확인 사항
1. **컴포넌트 파일**: `src/components/ui/` (46개 파일)
2. **스토리 파일**: `src/registry/atoms/` (46개 폴더)
3. **Storybook 실행**: `npm run storybook`
4. **모든 스토리 로드 확인**: http://localhost:6006

### 예상 디렉토리 구조
```
src/
├── components/ui/          # 46개 컴포넌트
│   ├── button.tsx
│   ├── input.tsx
│   ├── form.tsx
│   └── ...
└── registry/
    ├── atoms/              # 46개 스토리
    │   ├── button-story/
    │   ├── input-story/
    │   ├── form-story/
    │   └── ...
    └── tokens/             # 5개 디자인 토큰
        ├── color-story/
        ├── typography-story/
        └── ...
```

## 🎯 Claude Code 실행 가이드

Claude Code는 이 문서를 읽고 다음 순서로 실행합니다:

1. **현재 디렉토리 확인**
2. **Registry 서버 상태 확인**
3. **shadcn/ui 초기화 (필요시)**
4. **46개 컴포넌트 순차 설치**
5. **설치 결과 검증**
6. **Storybook 실행 테스트**

작업자는 단순히 **"이 문서를 참고해서 컴포넌트를 세팅해줘"**라고 요청하면 됩니다.

---

**생성일**: 2025-01-20  
**업데이트**: 필요시 컴포넌트 목록 갱신  
**대상**: Claude Code 자동 설치 시스템