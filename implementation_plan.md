# Implementation Plan — "취향"

> 경로는 프로젝트 루트(`취향분석/`) 기준. `src/` 디렉토리 없음.

---

## Phase 1. 프로젝트 초기 설정 ✅

- [x] Next.js 16 + Tailwind CSS 4 + shadcn/ui (radix-lyra) 생성
- [x] 기본 컴포넌트: button, theme-provider, utils
- [x] Supabase CLI 초기화 (`supabase init`, project_id 설정)
- [x] GitHub 저장소 생성 + 초기 커밋

---

## Phase 2. 패키지 설치 + 환경변수

### 2.1 shadcn/ui 컴포넌트 추가
- [ ] `pnpm dlx shadcn@latest add input dialog badge tabs switch card avatar progress sonner`

### 2.2 핵심 패키지
- [ ] `pnpm add @supabase/supabase-js @supabase/ssr`
- [ ] `pnpm add @prisma/client @anthropic-ai/sdk`
- [ ] `pnpm add react-hook-form zod @hookform/resolvers`
- [ ] `pnpm add -D prisma`

### 2.3 환경변수
- [ ] `.env.local` 생성
```env
NEXT_PUBLIC_SUPABASE_URL=https://ijhhxqyhcfaxoqsryylp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
TMDB_API_KEY=
GOOGLE_BOOKS_API_KEY=
ANTHROPIC_API_KEY=
```

**완료 기준:** `pnpm dev` 정상 + 모든 import 에러 없음

---

## Phase 3. DB + Supabase Auth 설정

### 3.1 Prisma 스키마
- [ ] `prisma/schema.prisma` 작성 (User, Review, TasteProfile, Friendship)
- [ ] `pnpm dlx prisma db push`

### 3.2 Supabase Auth
- [ ] Google OAuth Provider 활성화 (Google Cloud Console → Supabase 대시보드)
- [ ] Redirect URL: `http://localhost:3000/api/auth/callback`

### 3.3 DB 트리거
- [ ] Supabase SQL Editor에서 실행:
```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, profile_image)
  values (new.id, new.email, new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 3.4 Supabase 클라이언트
- [ ] `lib/supabase/client.ts` — 브라우저용
- [ ] `lib/supabase/server.ts` — 서버용
- [ ] `lib/supabase/middleware.ts` — 미들웨어용
- [ ] `lib/prisma.ts` — Prisma 싱글턴

**완료 기준:** Supabase 대시보드에서 테이블 4개 + 트리거 확인

---

## Phase 4. 인증

### 4.1 미들웨어
- [ ] `middleware.ts` — Supabase 세션 체크, `/login` 리다이렉트

### 4.2 OAuth 콜백
- [ ] `app/api/auth/callback/route.ts` — code exchange

### 4.3 로그인 페이지
- [ ] `app/login/page.tsx` — 로고 + Google 로그인 버튼
- [ ] `components/auth/login-button.tsx`

### 4.4 닉네임 설정
- [ ] `components/auth/nickname-modal.tsx` — 첫 가입 시 모달
- [ ] `actions/user.ts` — `setNickname`

**완료 기준:** Google 로그인 → 닉네임 설정 → 홈 진입

---

## Phase 5. 레이아웃 + 공통 컴포넌트

### 5.1 레이아웃
- [ ] `app/layout.tsx` 수정 — Toaster(sonner) 추가
- [ ] `components/layout/navbar.tsx` — 홈, 작성, 친구, 마이페이지
- [ ] `components/layout/fab.tsx` — 플로팅 "감상평 쓰기" 버튼

### 5.2 공통
- [ ] `components/shared/empty-state.tsx` — 빈 상태 안내
- [ ] `components/shared/confirm-modal.tsx` — 삭제 확인

### 5.3 타입 + Zod 스키마
- [ ] `types/index.ts` — ContentType, Review, TasteProfile, Friendship
- [ ] `lib/validations.ts` — 감상평, 닉네임, 친구 코드 Zod 스키마

**완료 기준:** 네비게이션으로 빈 페이지들 간 이동 가능

---

## Phase 6. 감상평

### 6.1 검색 API
- [ ] `app/api/search/route.ts` — TMDB / Google Books 프록시

### 6.2 작성
- [ ] `components/review/content-search.tsx` — 영화/책 탭 + 검색
- [ ] `components/review/content-search-item.tsx` — 검색 결과 아이템
- [ ] `components/review/tag-input.tsx` — 태그 입력
- [ ] `components/review/review-form.tsx` — 감상평 폼
- [ ] `app/review/new/page.tsx` — Step 1 검색 → Step 2 작성
- [ ] `actions/review.ts` — `createReview`

### 6.3 상세 + 수정/삭제
- [ ] `components/review/review-detail.tsx` — 상세 뷰
- [ ] `app/review/[id]/page.tsx` — 상세 페이지
- [ ] `actions/review.ts` — `updateReview`, `deleteReview`

### 6.4 카드
- [ ] `components/review/review-card.tsx` — 피드/목록용 카드

**완료 기준:** 검색 → 작성 → 상세 → 수정/삭제 전체 동작

---

## Phase 7. AI 취향 분석

### 7.1 Claude API
- [ ] `lib/claude.ts` — Claude API 호출 유틸 (시스템 프롬프트 + JSON 파싱)

### 7.2 분석 로직
- [ ] `actions/taste.ts` — `analyzeTaste` (감상평 전체 → Claude → TasteProfile upsert)
- [ ] 감상평 생성/수정/삭제 시 자동 트리거 (>= 3개)

### 7.3 UI
- [ ] `components/taste/taste-profile-card.tsx` — 유형 뱃지 + 키워드 + 요약
- [ ] `components/taste/taste-pending.tsx` — "n개 더 작성하면 분석"

**완료 기준:** 감상평 3개 작성 → 취향 분석 자동 생성

---

## Phase 8. 마이페이지

- [ ] `app/my/page.tsx`
  - 프로필 (아바타 + 닉네임 + 친구 코드)
  - 취향 프로필 카드 또는 분석 전 안내
  - 내 감상평 목록 (전체/영화/책 탭)
- [ ] `components/friend/friend-code-copy.tsx` — 코드 복사 버튼
- [ ] `actions/review.ts` — `getMyReviews`

**완료 기준:** 프로필 + 취향 + 감상평 목록 표시

---

## Phase 9. 친구

### 9.1 요청/수락/거절
- [ ] `actions/friend.ts` — `sendFriendRequest`, `acceptFriendRequest`, `rejectFriendRequest`
- [ ] `components/friend/friend-code-input.tsx`
- [ ] `components/friend/friend-request-card.tsx`

### 9.2 친구 목록
- [ ] `app/friends/page.tsx` — 코드 입력 + 받은 요청 + 목록
- [ ] `components/friend/friend-card.tsx`
- [ ] `actions/friend.ts` — `getFriends`, `getPendingRequests`

### 9.3 취향 비교
- [ ] `components/taste/taste-compare.tsx` — 키워드 비교
- [ ] `components/taste/taste-match-bar.tsx` — 일치도 바
- [ ] `actions/taste.ts` — `compareTaste`

### 9.4 친구 프로필
- [ ] `app/friends/[id]/page.tsx` — 프로필 + 취향 비교 + 감상평
- [ ] `actions/friend.ts` — `getFriendProfile`

**완료 기준:** 코드로 요청 → 수락 → 취향 비교 동작

---

## Phase 10. 홈 피드

- [ ] `app/page.tsx` — 친구 감상평 피드 (최신순) 또는 빈 상태
- [ ] `actions/review.ts` — `getFriendFeed` (커서 페이지네이션)
- [ ] 카드 클릭 → `/review/[id]`, 닉네임 클릭 → `/friends/[id]`
- [ ] FAB 연동

**완료 기준:** 홈에서 친구 감상평 피드 확인

---

## Phase 11. 마무리 + 배포

### 11.1 에러 처리
- [ ] 외부 API 실패 → 빈 결과 + 토스트
- [ ] Claude API 실패 → 다음 작성 시 재시도
- [ ] 권한 없는 접근 → 에러 페이지

### 11.2 UI
- [ ] 로딩 스켈레톤
- [ ] 반응형 (모바일 우선)

### 11.3 배포
- [ ] Vercel 배포 + 환경변수
- [ ] Supabase Redirect URL에 프로덕션 도메인 추가

**완료 기준:** 프로덕션에서 전체 기능 동작

---

## 구현 순서

```
Phase 1  초기 설정 ✅
  ↓
Phase 2  패키지 + 환경변수
  ↓
Phase 3  DB + Supabase Auth
  ↓
Phase 4  인증 (로그인 + 닉네임)
  ↓
Phase 5  레이아웃 + 공통
  ↓
Phase 6  감상평 (검색 + CRUD)
  ↓
Phase 7  AI 취향 분석
  ↓
Phase 8  마이페이지
  ↓
Phase 9  친구 (요청 + 비교)
  ↓
Phase 10 홈 피드
  ↓
Phase 11 마무리 + 배포
```

## 의존 관계

```
Phase 2 → Phase 3 → Phase 4 → Phase 5 ─┐
                                         ├→ Phase 6 → Phase 7 → Phase 8
                                         │                        ↓
                                         └──────────────────→ Phase 9 → Phase 10 → Phase 11
```
