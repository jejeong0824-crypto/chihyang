# Frontend Architecture — "취향"

---

## 1. 기술 스택

| 항목 | 선택 | 사유 |
|------|------|------|
| 프레임워크 | Next.js 16 (App Router, Turbopack) | SSR/SSG, 파일 기반 라우팅, API Routes |
| 언어 | TypeScript 5 | 타입 안전성 |
| 스타일링 | Tailwind CSS 4 (@tailwindcss/postcss) | 유틸리티 기반, 빠른 프로토타이핑 |
| UI 컴포넌트 | shadcn/ui (radix-lyra 스타일) | Radix UI 기반, CVA 변형 관리 |
| 아이콘 | Lucide React | shadcn/ui 기본 아이콘 |
| 다크모드 | next-themes | 라이트/다크 테마 전환 |
| 인증 | Supabase Auth | Google OAuth, 세션 관리, Supabase 통합 |
| 데이터 페칭 | Server Actions + fetch | Next.js 내장, 별도 라이브러리 불필요 |
| 폼 관리 | React Hook Form + Zod | 유효성 검증 |
| 토스트 | sonner | shadcn/ui 호환 토스트 |

---

## 2. 디렉토리 구조

```
취향분석/                            # 루트 (src/ 없음)
│
├── app/                             # Next.js App Router
│   ├── globals.css                  # Tailwind CSS 4 + CSS 변수 (다크모드)
│   ├── layout.tsx                   # 루트 레이아웃 (ThemeProvider, Geist/Roboto 폰트)
│   ├── page.tsx                     # / — 랜딩 or 홈 피드
│   ├── favicon.ico
│   ├── login/
│   │   └── page.tsx                 # /login
│   ├── review/
│   │   ├── new/
│   │   │   └── page.tsx             # /review/new
│   │   └── [id]/
│   │       └── page.tsx             # /review/[id]
│   ├── my/
│   │   └── page.tsx                 # /my
│   ├── friends/
│   │   ├── page.tsx                 # /friends
│   │   └── [id]/
│   │       └── page.tsx             # /friends/[id]
│   └── api/                         # API Route Handlers
│       ├── auth/
│       │   └── callback/
│       │       └── route.ts         # Supabase OAuth 콜백 핸들러
│       ├── reviews/
│       │   └── route.ts             # 감상평 CRUD
│       ├── taste/
│       │   └── route.ts             # 취향 분석 (Claude API)
│       ├── friends/
│       │   └── route.ts             # 친구 요청/수락/거절
│       └── search/
│           └── route.ts             # 영화/책 검색 (TMDB, Google Books)
│
├── components/
│   ├── theme-provider.tsx           # 다크모드 ThemeProvider (next-themes)
│   ├── ui/                          # shadcn/ui 컴포넌트 (radix-lyra 스타일)
│   │   ├── button.tsx               # ✅ 설치됨
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── badge.tsx
│   │   ├── tabs.tsx
│   │   ├── switch.tsx
│   │   ├── card.tsx
│   │   ├── avatar.tsx
│   │   └── progress.tsx
│   │
│   ├── layout/                      # 레이아웃 컴포넌트
│   │   ├── navbar.tsx               # 상단 네비게이션 바
│   │   └── fab.tsx                  # 플로팅 액션 버튼 (감상평 쓰기)
│   │
│   ├── review/                      # 감상평 관련
│   │   ├── review-card.tsx          # 감상평 카드 (피드/목록용)
│   │   ├── review-detail.tsx        # 감상평 상세 뷰
│   │   ├── review-form.tsx          # 감상평 작성/수정 폼
│   │   ├── content-search.tsx       # 영화/책 검색 (Step 1)
│   │   ├── content-search-item.tsx  # 검색 결과 아이템
│   │   └── tag-input.tsx            # 태그 입력 컴포넌트
│   │
│   ├── taste/                       # 취향 분석 관련
│   │   ├── taste-profile-card.tsx   # 취향 프로필 카드
│   │   ├── taste-compare.tsx        # 취향 비교 뷰
│   │   ├── taste-match-bar.tsx      # 일치도 프로그레스 바
│   │   └── taste-pending.tsx        # 분석 전 안내 (n개 더 작성)
│   │
│   ├── friend/                      # 친구 관련
│   │   ├── friend-card.tsx          # 친구 카드 (목록용)
│   │   ├── friend-request-card.tsx  # 받은 요청 카드
│   │   ├── friend-code-input.tsx    # 친구 코드 입력
│   │   └── friend-code-copy.tsx     # 내 코드 복사 버튼
│   │
│   ├── auth/                        # 인증 관련
│   │   ├── login-button.tsx         # Google 로그인 버튼 (Supabase Auth)
│   │   └── nickname-modal.tsx       # 닉네임 설정 모달
│   │
│   └── shared/                      # 공통
│       ├── empty-state.tsx          # 빈 상태 안내
│       └── confirm-modal.tsx        # 확인 모달 (삭제 등)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # 브라우저용 Supabase 클라이언트
│   │   ├── server.ts                # 서버용 Supabase 클라이언트
│   │   └── middleware.ts            # 미들웨어용 Supabase 클라이언트
│   ├── validations.ts               # Zod 스키마 (감상평, 닉네임 등)
│   ├── claude.ts                    # Claude API 호출 유틸
│   └── utils.ts                     # ✅ cn() (clsx + tailwind-merge)
│
├── hooks/                           # 커스텀 React Hooks
│
├── actions/                         # Server Actions
│   ├── review.ts                    # 감상평 생성/수정/삭제
│   ├── taste.ts                     # 취향 분석 트리거
│   ├── friend.ts                    # 친구 요청/수락/거절
│   └── user.ts                      # 닉네임 설정
│
├── types/
│   └── index.ts                     # 공통 타입 정의
│
├── supabase/                        # Supabase 로컬 설정
│   └── config.toml                  # 로컬 개발 설정 (API, DB, Studio 포트)
│
├── supabase/
│   ├── config.toml                  # Supabase 로컬 설정
│   └── migrations/
│       └── 00001_init.sql           # DB 스키마 + RLS + 트리거
│
├── middleware.ts                     # Supabase 세션 체크
├── package.json                     # pnpm, Turbopack
├── pnpm-lock.yaml
├── tsconfig.json                    # baseUrl: ".", paths: @/* → ./*
├── postcss.config.mjs               # @tailwindcss/postcss
├── next.config.mjs
├── eslint.config.mjs                # Next.js vitals + TypeScript
├── components.json                  # shadcn/ui 설정 (radix-lyra, mist)
├── .prettierrc                      # Prettier + tailwindcss 플러그인
├── .prettierignore
└── .gitignore
```

> **참고:** `src/` 디렉토리를 사용하지 않음. 모든 import는 `@/*` 경로 별칭으로 루트 기준 참조.

---

## 3. 페이지별 컴포넌트 매핑

### `/login`
```
LoginPage
├── 서비스 로고 + 소개 텍스트
├── LoginButton
└── NicknameModal (첫 가입 시)
```

### `/` (홈)
```
HomePage
├── Navbar
├── [로그인 상태 분기]
│   ├── 피드 있음 → ReviewCard[] (친구 감상평 리스트)
│   └── 피드 없음 → EmptyState ("친구를 추가하고...")
└── FAB (감상평 쓰기)
```

### `/review/new`
```
ReviewNewPage
├── [Step 1] ContentSearch
│   ├── Tabs (영화 / 책)
│   ├── Input (검색창)
│   └── ContentSearchItem[]
└── [Step 2] ReviewForm
    ├── 선택한 콘텐츠 정보
    ├── Textarea (감상평)
    ├── TagInput
    ├── Switch (공개/비공개)
    └── Button (저장)
```

### `/review/[id]`
```
ReviewDetailPage
├── ReviewDetail
│   ├── 콘텐츠 정보 (포스터 + 제목)
│   ├── 감상평 본문
│   ├── Badge[] (태그)
│   └── 작성자 + 작성일
├── [본인일 때] Button (수정) / Button (삭제)
└── ConfirmModal (삭제 확인)
```

### `/my`
```
MyPage
├── Navbar
├── 프로필 영역
│   ├── Avatar + 닉네임
│   └── FriendCodeCopy
├── [감상평 3개 이상] TasteProfileCard
├── [감상평 3개 미만] TastePending
├── Tabs (전체 / 영화 / 책)
└── ReviewCard[] (내 감상평)
```

### `/friends`
```
FriendsPage
├── Navbar
├── FriendCodeInput (친구 추가)
├── [받은 요청 있을 때] FriendRequestCard[]
├── [친구 있음] FriendCard[]
└── [친구 없음] EmptyState + FriendCodeCopy
```

### `/friends/[id]`
```
FriendProfilePage
├── Avatar + 닉네임 + 취향 유형 뱃지
├── [둘 다 분석 완료] TasteCompare
│   ├── TasteMatchBar (일치도 %)
│   ├── 나의 키워드 vs 친구 키워드
│   ├── 겹치는 키워드 강조
│   └── 나의 요약 vs 친구 요약
├── [분석 미완료] EmptyState
└── ReviewCard[] (친구 공개 감상평)
```

---

## 4. 데이터 흐름

### 인증
```
Google OAuth → Supabase Auth → 세션 쿠키
  → /api/auth/callback에서 code exchange
  → auth.users에 자동 생성
  → 첫 가입 감지 (public.users에 nickname === null)
  → NicknameModal → Server Action (user.ts)
  → / 리다이렉트
```

### 감상평 작성
```
ContentSearch (TMDB/Google Books API via API Route)
  → 콘텐츠 선택
  → ReviewForm 입력
  → Server Action (review.ts) → Prisma → DB 저장
  → [감상평 수 >= 3] → Server Action (taste.ts) → Claude API → TasteProfile 저장/업데이트
  → 리다이렉트 /review/[id]
```

### 친구 요청
```
FriendCodeInput → Server Action (friend.ts)
  → friendCode로 User 조회
  → Friendship 생성 (status: pending)

상대방 수락 → Server Action (friend.ts)
  → Friendship 업데이트 (status: accepted)
```

### 취향 비교
```
/friends/[id] 진입
  → 나의 TasteProfile + 친구 TasteProfile 조회
  → 클라이언트에서 키워드 교집합 계산
  → 일치도(%) = 겹치는 키워드 수 / 전체 고유 키워드 수
```

---

## 5. 인증 보호

| 경로 | 접근 권한 |
|------|----------|
| `/login` | 비로그인만 (로그인 시 `/` 리다이렉트) |
| `/` | 로그인 필수 |
| `/review/*` | 로그인 필수 |
| `/my` | 로그인 필수 |
| `/friends/*` | 로그인 필수 |

`middleware.ts`에서 Supabase 세션 체크 후 `/login`으로 리다이렉트 처리. `@supabase/ssr`의 `createServerClient`를 사용하여 쿠키 기반 세션 관리.

---

## 6. 주요 라이브러리

### 설치됨
```json
{
  "dependencies": {
    "next": "16.1.7",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "shadcn": "^4.1.1",
    "radix-ui": "^1.4.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.5.0",
    "tw-animate-css": "^1.4.0",
    "lucide-react": "^1.7.0",
    "next-themes": "^0.4.6"
  },
  "devDependencies": {
    "tailwindcss": "^4.2.1",
    "@tailwindcss/postcss": "^4.2.1",
    "typescript": "^5.9.3",
    "eslint": "^9.39.4",
    "eslint-config-next": "16.1.7",
    "prettier": "^3.8.1",
    "prettier-plugin-tailwindcss": "^0.7.2",
    "postcss": "^8"
  }
}
```

### 추가 설치 필요
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2",
    "@supabase/ssr": "^0",
    "@anthropic-ai/sdk": "^0.39",
    "react-hook-form": "^7",
    "zod": "^3",
    "@hookform/resolvers": "^3",
    "sonner": "^2"
  }
}
```
