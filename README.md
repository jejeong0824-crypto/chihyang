# 취향 — 감상평 기반 영화/책 취향 분석

별점 없이, 글로 발견하는 내 취향.

---

## 소개

영화나 책에 대한 자유로운 감상평을 남기면, AI가 글을 분석하여 나만의 취향 프로필을 만들어주는 서비스입니다. 친구와 취향을 비교하고, 서로의 감상평을 탐색할 수 있습니다.

---

## 핵심 기능

- **감상평 작성** — 영화/책을 검색하고 자유롭게 감상평을 남김 (별점 없음)
- **AI 취향 분석** — 감상평 3개 이상 시 취향 키워드, 요약, 유형 자동 생성 (Claude API)
- **친구 추가** — 고유 코드로 친구를 추가하고 취향을 비교
- **취향 비교** — 겹치는 키워드, 일치도(%)를 시각적으로 확인

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router, Turbopack) |
| 스타일링 | Tailwind CSS 4 + shadcn/ui (radix-lyra) |
| 다크모드 | next-themes |
| 인증 | Supabase Auth (Google OAuth) |
| DB | Supabase (PostgreSQL) + Prisma |
| AI | Claude API (@anthropic-ai/sdk) |
| 외부 API | TMDB (영화), Google Books (책) |
| 패키지 매니저 | pnpm |

---

## Repository Structure

```
취향분석/
│
├── app/                           # Next.js App Router
│   ├── globals.css                # Tailwind CSS 4 + CSS 변수
│   ├── layout.tsx                 # 루트 레이아웃 (ThemeProvider, 폰트)
│   ├── page.tsx                   # / — 홈 피드
│   └── favicon.ico
│
├── components/
│   ├── theme-provider.tsx         # 다크모드 (next-themes)
│   └── ui/
│       └── button.tsx             # shadcn/ui Button
│
├── lib/
│   └── utils.ts                   # cn() (clsx + tailwind-merge)
│
├── hooks/                         # 커스텀 React Hooks
├── public/                        # 정적 파일
│
├── supabase/
│   └── config.toml                # Supabase 로컬 개발 설정
│
├── prd.md                         # MVP 제품 요구사항 정의서
├── user-flow.md                   # 시나리오별 사용자 플로우 (9개)
├── screens.md                     # 화면 와이어프레임 (7개 페이지)
├── frontend_architecture.md       # 프론트엔드 아키텍처
├── backend_architecture.md        # 백엔드 아키텍처
├── implementation_plan.md         # 구현 계획 (11 Phase)
│
├── package.json                   # pnpm, Turbopack
├── pnpm-lock.yaml
├── tsconfig.json                  # paths: @/* → ./*
├── postcss.config.mjs             # @tailwindcss/postcss
├── next.config.mjs
├── eslint.config.mjs
├── components.json                # shadcn/ui (radix-lyra, mist)
├── .prettierrc
└── .gitignore
```

---

## 기획 문서

| 문서 | 설명 |
|------|------|
| [prd.md](prd.md) | MVP 범위, 핵심 기능 정의, 데이터 모델, 페이지 구조 |
| [user-flow.md](user-flow.md) | 첫 가입, 감상평 작성, 취향 비교 등 9개 시나리오별 흐름 |
| [screens.md](screens.md) | 로그인, 홈, 감상평 작성/상세, 마이페이지, 친구 와이어프레임 |
| [frontend_architecture.md](frontend_architecture.md) | 디렉토리 구조, 컴포넌트 트리, 데이터 흐름, 라이브러리 |
| [backend_architecture.md](backend_architecture.md) | Prisma 스키마, API 엔드포인트, Claude 프롬프트, 에러 처리 |
| [implementation_plan.md](implementation_plan.md) | 11단계 구현 계획, 의존 관계, 완료 기준 |

---

## 환경변수

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
TMDB_API_KEY=
GOOGLE_BOOKS_API_KEY=
ANTHROPIC_API_KEY=
```

---

## 시작하기

```bash
# 1. 패키지 설치
pnpm install

# 2. 환경변수 설정
cp .env.example .env.local

# 3. DB 스키마 반영
pnpm dlx prisma db push

# 4. 개발 서버 실행
pnpm dev
```

---

## 스크립트

```bash
pnpm dev          # 개발 서버 (Turbopack)
pnpm build        # 프로덕션 빌드
pnpm start        # 프로덕션 서버
pnpm lint         # ESLint
pnpm format       # Prettier 포맷
pnpm typecheck    # TypeScript 타입 체크
```
