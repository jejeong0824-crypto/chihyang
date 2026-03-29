# Implementation Plan — "취향"

---

## Phase 1. 프로젝트 초기 설정

### 1.1 Next.js + shadcn/ui 프로젝트 생성 ✅
- [x] `shadcn init --preset --template next` (Next.js 16, Turbopack, Tailwind 4, radix-lyra)
- [x] 기본 컴포넌트: button, theme-provider, utils
- [x] Supabase CLI 초기화 (`supabase init`)

### 1.2 추가 shadcn/ui 컴포넌트 설치
- [ ] `pnpm dlx shadcn@latest add input dialog badge tabs switch card avatar progress`
- [ ] sonner (토스트) 설치: `pnpm dlx shadcn@latest add sonner`

### 1.3 핵심 패키지 설치
- [ ] `pnpm add @supabase/supabase-js @supabase/ssr`
- [ ] `pnpm add @prisma/client @anthropic-ai/sdk`
- [ ] `pnpm add react-hook-form zod @hookform/resolvers`
- [ ] `pnpm add -D prisma`

### 1.4 환경변수 설정
- [ ] `.env.local` 생성
- [ ] `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `DATABASE_URL`
- [ ] `TMDB_API_KEY`, `GOOGLE_BOOKS_API_KEY`, `ANTHROPIC_API_KEY`

**완료 기준:** `pnpm dev`로 기본 페이지 정상 표시됨

---

## Phase 2. Supabase + DB 설정

### 2.1 Supabase 프로젝트 생성
- [ ] Supabase 대시보드에서 프로젝트 생성
- [ ] Google OAuth Provider 활성화 (Google Cloud Console에서 Client ID/Secret 발급 → Supabase에 등록)
- [ ] Redirect URL 설정: `http://localhost:3000/api/auth/callback`

### 2.2 Prisma 스키마 작성
- [ ] `prisma/schema.prisma` — User, Review, TasteProfile, Friendship, enum 정의
- [ ] `npx prisma db push`로 스키마 반영

### 2.3 DB 트리거 생성
- [ ] Supabase SQL Editor에서 `handle_new_user()` 함수 + 트리거 생성
- [ ] `auth.users` INSERT 시 → `public.users`에 id, email, profile_image 자동 삽입

### 2.4 Supabase 클라이언트 설정
- [ ] `src/lib/supabase/client.ts` — 브라우저용 클라이언트
- [ ] `src/lib/supabase/server.ts` — 서버용 클라이언트
- [ ] `src/lib/supabase/middleware.ts` — 미들웨어용 클라이언트
- [ ] `src/lib/prisma.ts` — Prisma 싱글턴 인스턴스

**완료 기준:** Supabase 대시보드에서 테이블 4개 확인, 트리거 동작 확인

---

## Phase 3. 인증

### 3.1 미들웨어
- [ ] `middleware.ts` — Supabase 세션 체크
- [ ] 비로그인 시 `/login` 리다이렉트
- [ ] 로그인 상태에서 `/login` 접근 시 `/` 리다이렉트

### 3.2 OAuth 콜백
- [ ] `src/app/api/auth/callback/route.ts` — code exchange 처리

### 3.3 로그인 페이지
- [ ] `src/app/login/page.tsx` — 로고 + 소개 + Google 로그인 버튼
- [ ] `src/components/auth/login-button.tsx` — `supabase.auth.signInWithOAuth`

### 3.4 닉네임 설정
- [ ] `src/components/auth/nickname-modal.tsx` — 첫 가입 시 닉네임 입력 모달
- [ ] `src/actions/user.ts` — `setNickname` Server Action
- [ ] 홈 페이지에서 nickname === null 감지 → 모달 표시

**완료 기준:** Google 로그인 → 닉네임 설정 → 홈 진입까지 전체 흐름 동작

---

## Phase 4. 레이아웃 + 공통 컴포넌트

### 4.1 루트 레이아웃
- [ ] `src/app/layout.tsx` — 폰트, Toaster, 글로벌 Provider

### 4.2 네비게이션
- [ ] `src/components/layout/navbar.tsx` — 홈, 작성, 친구, 마이페이지 링크
- [ ] 현재 경로 활성화 표시

### 4.3 공통 컴포넌트
- [ ] `src/components/shared/empty-state.tsx` — 빈 상태 안내 (아이콘 + 메시지 + 선택적 CTA)
- [ ] `src/components/shared/confirm-modal.tsx` — 삭제 확인 모달
- [ ] `src/components/layout/fab.tsx` — 플로팅 "감상평 쓰기" 버튼

**완료 기준:** 네비게이션으로 빈 페이지들 간 이동 가능

---

## Phase 5. 감상평 기능

### 5.1 검색 API
- [ ] `src/app/api/search/route.ts` — TMDB / Google Books 프록시
- [ ] TMDB 응답 → `{ contentId, contentTitle, contentImage, year }` 매핑
- [ ] Google Books 응답 → `{ contentId, contentTitle, contentImage, author }` 매핑

### 5.2 감상평 작성
- [ ] `src/components/review/content-search.tsx` — 영화/책 탭 + 검색
- [ ] `src/components/review/content-search-item.tsx` — 검색 결과 아이템
- [ ] `src/components/review/tag-input.tsx` — 태그 입력 (엔터로 추가, ✕로 삭제)
- [ ] `src/components/review/review-form.tsx` — 감상평 폼 (텍스트 + 태그 + 공개/비공개)
- [ ] `src/app/review/new/page.tsx` — Step 1 검색 → Step 2 작성 페이지
- [ ] `src/actions/review.ts` — `createReview` Server Action

### 5.3 감상평 상세
- [ ] `src/components/review/review-detail.tsx` — 감상평 상세 뷰
- [ ] `src/app/review/[id]/page.tsx` — 상세 페이지 (수정/삭제 버튼)
- [ ] `src/actions/review.ts` — `updateReview`, `deleteReview`
- [ ] 인라인 수정 모드 + 삭제 확인 모달 연동

### 5.4 감상평 카드
- [ ] `src/components/review/review-card.tsx` — 피드/목록용 카드 (포스터 + 제목 + 본문 미리보기 + 태그)

**완료 기준:** 영화/책 검색 → 감상평 작성 → 상세 보기 → 수정/삭제 전체 흐름 동작

---

## Phase 6. AI 취향 분석

### 6.1 Claude API 연동
- [ ] `src/lib/claude.ts` — Claude API 호출 유틸 (시스템 프롬프트, JSON 파싱)

### 6.2 취향 분석 로직
- [ ] `src/actions/taste.ts` — `analyzeTaste`
  - 사용자 감상평 전체 조회 → Claude API → TasteProfile upsert
- [ ] 감상평 생성/수정/삭제 시 자동 트리거 (감상평 >= 3개)

### 6.3 취향 프로필 카드
- [ ] `src/components/taste/taste-profile-card.tsx` — 유형 뱃지 + 키워드 태그 + 요약
- [ ] `src/components/taste/taste-pending.tsx` — 분석 전 안내 (n개 더 작성)

**완료 기준:** 감상평 3개 작성 → 취향 분석 자동 생성 → 마이페이지에서 확인

---

## Phase 7. 마이페이지

### 7.1 마이페이지
- [ ] `src/app/my/page.tsx`
  - 프로필 영역 (아바타 + 닉네임 + 친구 코드)
  - 취향 프로필 카드 또는 분석 전 안내
  - 내 감상평 목록 (전체/영화/책 탭 필터)
- [ ] `src/components/friend/friend-code-copy.tsx` — 코드 복사 버튼
- [ ] `src/actions/review.ts` — `getMyReviews` (contentType 필터)

**완료 기준:** 마이페이지에서 프로필 + 취향 + 감상평 목록 전체 표시

---

## Phase 8. 친구 기능

### 8.1 친구 요청/수락/거절
- [ ] `src/actions/friend.ts` — `sendFriendRequest`, `acceptFriendRequest`, `rejectFriendRequest`
- [ ] `src/components/friend/friend-code-input.tsx` — 친구 코드 입력 + 요청 보내기
- [ ] `src/components/friend/friend-request-card.tsx` — 받은 요청 (수락/거절 버튼)

### 8.2 친구 목록 페이지
- [ ] `src/app/friends/page.tsx` — 코드 입력 + 받은 요청 + 친구 목록
- [ ] `src/components/friend/friend-card.tsx` — 친구 카드 (아바타 + 닉네임 + 취향 유형)
- [ ] `src/actions/friend.ts` — `getFriends`, `getPendingRequests`
- [ ] 빈 상태 처리 (친구 없음 + 내 코드 표시)

### 8.3 취향 비교
- [ ] `src/components/taste/taste-compare.tsx` — 키워드 비교 + 겹치는 키워드 강조
- [ ] `src/components/taste/taste-match-bar.tsx` — 일치도 프로그레스 바
- [ ] `src/actions/taste.ts` — `compareTaste`

### 8.4 친구 프로필 페이지
- [ ] `src/app/friends/[id]/page.tsx` — 친구 프로필 + 취향 비교 + 공개 감상평
- [ ] `src/actions/friend.ts` — `getFriendProfile`

**완료 기준:** 친구 코드로 요청 → 수락 → 취향 비교 전체 흐름 동작

---

## Phase 9. 홈 피드

### 9.1 홈 페이지
- [ ] `src/app/page.tsx` — 로그인 상태 분기
  - 친구 감상평 피드 (최신순) 또는 빈 상태
- [ ] `src/actions/review.ts` — `getFriendFeed` (커서 페이지네이션)
- [ ] 감상평 카드 클릭 → `/review/[id]`, 닉네임 클릭 → `/friends/[id]`
- [ ] FAB (감상평 쓰기) 연동

**완료 기준:** 홈에서 친구 감상평 피드 확인 가능

---

## Phase 10. 타입 + 유효성 검증

### 10.1 공통 타입
- [ ] `src/types/index.ts` — ContentType, Review, TasteProfile, Friendship 등 타입 정의

### 10.2 Zod 스키마
- [ ] 감상평 작성/수정 입력 검증
- [ ] 닉네임 검증 (길이, 특수문자)
- [ ] 친구 코드 검증

**완료 기준:** 잘못된 입력 시 에러 메시지 표시

---

## Phase 11. 마무리

### 11.1 에러 처리
- [ ] 외부 API 실패 시 빈 결과 + 토스트
- [ ] Claude API 실패 시 취향 분석 건너뛰기
- [ ] 권한 없는 접근 시 에러 페이지

### 11.2 UI 다듬기
- [ ] 로딩 상태 (스켈레톤 또는 스피너)
- [ ] 반응형 레이아웃 (모바일 우선)
- [ ] 페이지 전환 시 부드러운 UX

### 11.3 배포
- [ ] Vercel 배포
- [ ] 환경변수 설정
- [ ] Supabase Redirect URL에 프로덕션 도메인 추가

**완료 기준:** 프로덕션 URL에서 전체 기능 동작

---

## 구현 순서 요약

```
Phase 1  프로젝트 초기 설정
  ↓
Phase 2  Supabase + DB 설정
  ↓
Phase 3  인증 (Google 로그인 + 닉네임)
  ↓
Phase 4  레이아웃 + 공통 컴포넌트
  ↓
Phase 5  감상평 (검색 + 작성 + 상세 + 수정/삭제)
  ↓
Phase 6  AI 취향 분석 (Claude API)
  ↓
Phase 7  마이페이지
  ↓
Phase 8  친구 (요청 + 비교)
  ↓
Phase 9  홈 피드
  ↓
Phase 10 타입 + 유효성 검증
  ↓
Phase 11 마무리 + 배포
```

---

## 의존 관계

```
Phase 1 ─→ Phase 2 ─→ Phase 3 ─→ Phase 4 ─┐
                                             ├─→ Phase 5 ─→ Phase 6 ─→ Phase 7
                                             │                            ↓
                                             └─────────────────────→ Phase 8 ─→ Phase 9
                                                                                  ↓
                                                                        Phase 10 ─→ Phase 11
```

- Phase 5 (감상평)이 완료되어야 Phase 6 (취향 분석) 진행 가능
- Phase 6 (취향 분석)이 완료되어야 Phase 8 (친구 취향 비교) 진행 가능
- Phase 8 (친구)이 완료되어야 Phase 9 (홈 피드) 진행 가능
