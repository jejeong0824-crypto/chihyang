# Backend Architecture — "취향"

---

## 1. 기술 스택

| 항목 | 선택 | 사유 |
|------|------|------|
| 런타임 | Next.js 16 API Routes (Route Handlers) | 프론트엔드와 단일 배포, Turbopack |
| 언어 | TypeScript | 프론트엔드와 타입 공유 |
| DB + 쿼리 | Supabase Client (@supabase/supabase-js) | RLS 연동, ORM 불필요, 직접 쿼리 |
| DB | Supabase (PostgreSQL) | 무료 티어, 실시간 기능, Auth 연동 |
| 인증 | Supabase Auth | Google OAuth, 쿠키 기반 세션, RLS 연동 |
| AI | @google/genai | Gemini API로 취향 분석 |
| 외부 API | TMDB, Google Books | 영화/책 검색 |
| 유효성 검증 | Zod | 요청 데이터 검증, 프론트엔드와 스키마 공유 |

---

## 2. 데이터베이스 스키마 (SQL)

`supabase/migrations/00001_init.sql`에 정의.

```sql
-- Users (auth.users 트리거로 자동 생성)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  nickname text,
  profile_image text,
  friend_code text unique not null default substr(md5(random()::text), 1, 8),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reviews
create table public.reviews (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references public.users(id) on delete cascade,
  content_type content_type not null,  -- enum: MOVIE, BOOK
  content_id text not null,
  content_title text not null,
  content_image text,
  body text not null,
  tags text[] not null default '{}',
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Taste Profiles
create table public.taste_profiles (
  id text primary key default gen_random_uuid()::text,
  user_id uuid unique not null references public.users(id) on delete cascade,
  keywords text[] not null default '{}',
  summary text not null,
  type text not null,
  updated_at timestamptz not null default now()
);

-- Friendships
create table public.friendships (
  id text primary key default gen_random_uuid()::text,
  requester_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  status friendship_status not null default 'PENDING',  -- enum: PENDING, ACCEPTED, REJECTED
  created_at timestamptz not null default now(),
  unique(requester_id, receiver_id)
);
```

RLS 정책, 트리거, 인덱스는 마이그레이션 파일에 포함.

---

## 3. API 엔드포인트

### 3.1 인증 — Supabase Auth

| 엔드포인트 | 설명 |
|-----------|------|
| `GET /api/auth/callback` | OAuth 콜백 — Supabase `exchangeCodeForSession` 처리 |

**인증 흐름:**
```
1. 클라이언트: supabase.auth.signInWithOAuth({ provider: 'google' })
2. Google 인증 완료 → /api/auth/callback?code=xxx 리다이렉트
3. 서버: code → session 교환 (쿠키에 세션 저장)
4. DB 트리거: auth.users INSERT → public.users 자동 생성
5. 클라이언트: / 리다이렉트 → nickname 없으면 모달 표시
```

### 3.2 사용자 — Server Action `actions/user.ts`

| 액션 | 설명 | 입력 |
|------|------|------|
| `setNickname` | 닉네임 설정 (첫 가입) | `{ nickname: string }` |

### 3.3 감상평 — Server Action `actions/review.ts`

| 액션 | 설명 | 입력 |
|------|------|------|
| `createReview` | 감상평 생성 | `{ contentType, contentId, contentTitle, contentImage?, body, tags[], isPublic }` |
| `updateReview` | 감상평 수정 | `{ id, body, tags[], isPublic }` |
| `deleteReview` | 감상평 삭제 | `{ id }` |

### 3.4 취향 분석 — Server Action `actions/taste.ts`

| 액션 | 설명 | 입력 |
|------|------|------|
| `analyzeTaste` | 취향 분석 생성/업데이트 | 없음 (세션에서 userId 추출) |
| `compareTaste` | 취향 비교 | `{ friendId: string }` |

### 3.5 친구 — Server Action `actions/friend.ts`

| 액션 | 설명 | 입력 |
|------|------|------|
| `sendFriendRequest` | 친구 요청 | `{ friendCode: string }` |
| `acceptFriendRequest` | 요청 수락 | `{ friendshipId: string }` |
| `rejectFriendRequest` | 요청 거절 | `{ friendshipId: string }` |

### 3.6 검색 — API Route `/api/search`

| 메서드 | 설명 | 파라미터 |
|--------|------|----------|
| `GET /api/search?type=movie&q=인셉션` | 영화 검색 (TMDB) | `type`, `q` |
| `GET /api/search?type=book&q=데미안` | 책 검색 (Google Books) | `type`, `q` |

---

## 4. 환경변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="sb_publishable_..."

# Google OAuth → Supabase 대시보드에서 설정 (환경변수 불필요)

# External APIs
TMDB_API_KEY="..."
GOOGLE_BOOKS_API_KEY="..."
GEMINI_API_KEY="..."
```

> `DATABASE_URL` 불필요 — Supabase Client가 URL + anon key로 직접 접근.

---

## 5. 데이터 접근 패턴

### 읽기 (Server Component에서 Supabase Client 직접 호출)

| 페이지 | 쿼리 |
|--------|------|
| `/` (홈 피드) | `supabase.from("reviews").select("*, users!inner(...)").in("user_id", friendIds)` |
| `/review/[id]` | `supabase.from("reviews").select("*, users!inner(...)").eq("id", id)` |
| `/my` | `supabase.from("users").select("*, taste_profiles(*)")` + `reviews` 조회 |
| `/friends` | `supabase.from("friendships").select("..., requester:users!..., receiver:users!...")` |
| `/friends/[id]` | 친구 프로필 + `taste_profiles` + 공개 감상평 |

### 쓰기 (Server Action에서 Supabase Client)

| 액션 | 후처리 |
|------|--------|
| 감상평 생성 | → 감상평 수 체크 → 취향 분석 트리거 → `revalidatePath` |
| 감상평 수정 | → 취향 분석 재트리거 → `revalidatePath` |
| 감상평 삭제 | → `revalidatePath` → `redirect` |
| 친구 요청/수락/거절 | → `revalidatePath` |
| 닉네임 설정 | → `revalidatePath` |

---

## 6. 에러 처리

| 상황 | 처리 |
|------|------|
| 미인증 요청 | `middleware.ts`에서 Supabase 세션 체크 → `/login` 리다이렉트 |
| Server Action 권한 위반 | `supabase.auth.getUser()` userId !== 리소스 소유자 → 에러 반환 |
| 외부 API 실패 (TMDB, Google Books) | 빈 결과 반환 + 토스트로 안내 |
| Gemini API 실패 | 취향 분석 건너뛰기 + 다음 감상평 작성 시 재시도 |
| Supabase 쿼리 에러 | 사용자 친화적 메시지 반환 |
| Zod 유효성 실패 | 필드별 에러 메시지 반환 |
