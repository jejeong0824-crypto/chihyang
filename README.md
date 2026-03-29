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
| DB | Supabase (PostgreSQL) |
| DB 쿼리 | Supabase Client (@supabase/supabase-js) |
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
│   ├── layout.tsx                 # 루트 레이아웃 (ThemeProvider, Toaster)
│   ├── page.tsx                   # / — 홈 피드
│   ├── login/page.tsx             # /login
│   ├── review/
│   │   ├── new/page.tsx           # /review/new — 감상평 작성
│   │   └── [id]/page.tsx          # /review/[id] — 감상평 상세
│   ├── my/page.tsx                # /my — 마이페이지
│   ├── friends/
│   │   ├── page.tsx               # /friends — 친구 목록
│   │   └── [id]/page.tsx          # /friends/[id] — 취향 비교
│   └── api/
│       ├── auth/callback/         # Supabase OAuth 콜백
│       └── search/                # 영화/책 검색 프록시
│
├── components/
│   ├── ui/                        # shadcn/ui (10개 컴포넌트)
│   ├── layout/                    # Navbar, FAB
│   ├── review/                    # 감상평 카드, 폼, 검색, 태그
│   ├── taste/                     # 취향 프로필, 비교, 대기
│   ├── friend/                    # 친구 카드, 요청, 코드
│   ├── auth/                      # 로그인 버튼, 닉네임 모달
│   └── shared/                    # 빈 상태, 확인 모달
│
├── actions/                       # Server Actions
│   ├── review.ts                  # 감상평 CRUD
│   ├── taste.ts                   # 취향 분석/비교
│   ├── friend.ts                  # 친구 요청/수락/거절
│   └── user.ts                    # 닉네임 설정
│
├── lib/
│   ├── supabase/                  # Supabase 클라이언트 (client, server, middleware)
│   ├── claude.ts                  # Claude API 유틸
│   ├── validations.ts             # Zod 스키마
│   └── utils.ts                   # cn()
│
├── types/
│   ├── index.ts                   # 공통 타입
│   └── database.ts                # DB 테이블 타입
│
├── supabase/
│   ├── config.toml                # Supabase 로컬 설정
│   └── migrations/
│       └── 00001_init.sql         # DB 스키마 + RLS + 트리거
│
├── middleware.ts                   # Supabase 세션 체크
├── package.json
└── .env.local                     # 환경변수 (git 제외)
```

---

## 환경변수

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
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

# 3. Supabase 마이그레이션 (대시보드 SQL Editor에서 실행)
# supabase/migrations/00001_init.sql 내용 복사 → 실행

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
