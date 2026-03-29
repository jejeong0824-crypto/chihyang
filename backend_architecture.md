# Backend Architecture — "취향"

---

## 1. 기술 스택

| 항목 | 선택 | 사유 |
|------|------|------|
| 런타임 | Next.js 16 API Routes (Route Handlers) | 프론트엔드와 단일 배포, Turbopack |
| 언어 | TypeScript | 프론트엔드와 타입 공유 |
| ORM | Prisma 6 | 타입 안전 쿼리, 마이그레이션 관리 |
| DB | Supabase (PostgreSQL) | 무료 티어, 실시간 기능, Auth 연동 가능 |
| 인증 | Supabase Auth | Google OAuth, 쿠키 기반 세션, RLS 연동 |
| AI | @anthropic-ai/sdk | Claude API로 취향 분석 |
| 외부 API | TMDB, Google Books | 영화/책 검색 |
| 유효성 검증 | Zod | 요청 데이터 검증, 프론트엔드와 스키마 공유 |

---

## 2. 데이터베이스 스키마 (Prisma)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// User.id는 Supabase auth.users.id (UUID)를 그대로 사용
model User {
  id            String    @id @db.Uuid
  email         String    @unique
  nickname      String?
  profileImage  String?
  friendCode    String    @unique @default(cuid())
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  reviews       Review[]
  tasteProfile  TasteProfile?

  sentRequests      Friendship[] @relation("requester")
  receivedRequests  Friendship[] @relation("receiver")

  @@map("users")
}

model Review {
  id            String   @id @default(cuid())
  userId        String
  contentType   ContentType
  contentId     String
  contentTitle  String
  contentImage  String?
  body          String
  tags          String[]
  isPublic      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, contentType])
  @@map("reviews")
}

model TasteProfile {
  id        String   @id @default(cuid())
  userId    String   @unique
  keywords  String[]
  summary   String
  type      String
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("taste_profiles")
}

model Friendship {
  id          String           @id @default(cuid())
  requesterId String
  receiverId  String
  status      FriendshipStatus @default(PENDING)
  createdAt   DateTime         @default(now())

  requester User @relation("requester", fields: [requesterId], references: [id], onDelete: Cascade)
  receiver  User @relation("receiver", fields: [receiverId], references: [id], onDelete: Cascade)

  @@unique([requesterId, receiverId])
  @@map("friendships")
}

enum ContentType {
  MOVIE
  BOOK
}

enum FriendshipStatus {
  PENDING
  ACCEPTED
  REJECTED
}
```

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

**DB 트리거 (Supabase SQL):**
```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, profile_image)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
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
| `getReview` | 감상평 상세 조회 | `{ id }` |
| `getMyReviews` | 내 감상평 목록 | `{ contentType?: "MOVIE" \| "BOOK" }` |
| `getFriendFeed` | 친구 공개 감상평 피드 | `{ cursor?: string }` |

### 3.4 취향 분석 — Server Action `actions/taste.ts`

| 액션 | 설명 | 입력 |
|------|------|------|
| `analyzeTaste` | 취향 분석 생성/업데이트 | 없음 (세션에서 userId 추출) |
| `getMyTaste` | 내 취향 프로필 조회 | 없음 |
| `compareTaste` | 취향 비교 | `{ friendId: string }` |

### 3.5 친구 — Server Action `actions/friend.ts`

| 액션 | 설명 | 입력 |
|------|------|------|
| `sendFriendRequest` | 친구 요청 | `{ friendCode: string }` |
| `acceptFriendRequest` | 요청 수락 | `{ friendshipId: string }` |
| `rejectFriendRequest` | 요청 거절 | `{ friendshipId: string }` |
| `getFriends` | 친구 목록 | 없음 |
| `getPendingRequests` | 받은 요청 목록 | 없음 |
| `getFriendProfile` | 친구 프로필 + 공개 감상평 | `{ friendId: string }` |

### 3.6 검색 — API Route `/api/search`

| 메서드 | 설명 | 파라미터 |
|--------|------|----------|
| `GET /api/search?type=movie&q=인셉션` | 영화 검색 (TMDB) | `type`, `q` |
| `GET /api/search?type=book&q=데미안` | 책 검색 (Google Books) | `type`, `q` |

외부 API 키를 숨기기 위해 API Route로 프록시.

---

## 4. 핵심 비즈니스 로직

### 4.1 취향 분석 (Claude API)

```
[트리거] 감상평 생성/수정/삭제 시 → 감상평 수 >= 3이면 실행

1. 해당 사용자의 모든 감상평 조회
2. Claude API 호출
   - 시스템 프롬프트: 취향 분석가 역할
   - 사용자 메시지: 감상평 전체 텍스트
   - 응답 형식: JSON { keywords[], summary, type }
3. TasteProfile upsert (생성 or 업데이트)
```

**Claude 프롬프트 구조:**

```
시스템: 당신은 영화/책 취향 분석 전문가입니다.
사용자의 감상평들을 읽고 취향을 분석해주세요.

응답 형식 (JSON):
{
  "keywords": ["키워드1", "키워드2", ...],  // 5~8개
  "summary": "취향 요약 1~2문장",
  "type": "취향 유형명"  // 예: "서사 몰입형"
}

---
사용자 감상평:

[영화] 인셉션: "꿈 속의 꿈이라는 구조가..."
[책] 데미안: "싱클레어의 여정이..."
[영화] 기생충: "계단이라는 공간이..."
```

### 4.2 취향 비교 로직

```typescript
function compareTaste(myProfile, friendProfile) {
  const mySet = new Set(myProfile.keywords)
  const friendSet = new Set(friendProfile.keywords)
  const allKeywords = new Set([...mySet, ...friendSet])
  const overlap = [...mySet].filter(k => friendSet.has(k))

  return {
    myKeywords: myProfile.keywords,
    friendKeywords: friendProfile.keywords,
    overlapping: overlap,
    matchRate: Math.round((overlap.length / allKeywords.size) * 100)
  }
}
```

### 4.3 친구 코드 생성

```
User 생성 시 cuid()로 자동 생성 → 6자리 대문자 영숫자로 변환하여 표시
```

---

## 5. 외부 API 연동

### 5.1 TMDB (영화 검색)

| 항목 | 값 |
|------|-----|
| 엔드포인트 | `GET https://api.themoviedb.org/3/search/movie` |
| 파라미터 | `query`, `language=ko-KR` |
| 응답 매핑 | `id` → contentId, `title` → contentTitle, `poster_path` → contentImage, `release_date` → 연도 |
| 인증 | Bearer 토큰 (환경변수 `TMDB_API_KEY`) |

### 5.2 Google Books (책 검색)

| 항목 | 값 |
|------|-----|
| 엔드포인트 | `GET https://www.googleapis.com/books/v1/volumes` |
| 파라미터 | `q`, `langRestrict=ko` |
| 응답 매핑 | `id` → contentId, `volumeInfo.title` → contentTitle, `volumeInfo.imageLinks.thumbnail` → contentImage, `volumeInfo.authors` → 저자 |
| 인증 | API 키 (환경변수 `GOOGLE_BOOKS_API_KEY`) |

### 5.3 Claude API (취향 분석)

| 항목 | 값 |
|------|-----|
| SDK | `@anthropic-ai/sdk` |
| 모델 | `claude-sonnet-4-6` |
| 인증 | 환경변수 `ANTHROPIC_API_KEY` |
| max_tokens | 1024 |
| 응답 | JSON 파싱 후 TasteProfile에 저장 |

---

## 6. 환경변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres"

# Google OAuth → Supabase 대시보드에서 설정 (환경변수 불필요)

# External APIs
TMDB_API_KEY="..."
GOOGLE_BOOKS_API_KEY="..."
ANTHROPIC_API_KEY="..."
```

---

## 7. 데이터 접근 패턴

### 읽기 (Server Component에서 직접 Prisma 호출)

| 페이지 | 쿼리 |
|--------|------|
| `/` (홈 피드) | 내 친구들의 공개 감상평, 최신순, 커서 페이지네이션 |
| `/review/[id]` | 감상평 1건 + 작성자 정보 |
| `/my` | 내 감상평 목록 + TasteProfile |
| `/friends` | 친구 목록 (accepted) + 받은 요청 (pending) + 각 친구의 TasteProfile |
| `/friends/[id]` | 친구 프로필 + TasteProfile + 공개 감상평 목록 |

### 쓰기 (Server Action)

| 액션 | 후처리 |
|------|--------|
| 감상평 생성 | → 감상평 수 체크 → 취향 분석 트리거 → `revalidatePath` |
| 감상평 수정 | → 취향 분석 재트리거 → `revalidatePath` |
| 감상평 삭제 | → 감상평 수 체크 → 취향 분석 재트리거 또는 삭제 → `revalidatePath` |
| 친구 요청/수락 | → `revalidatePath` |
| 닉네임 설정 | → 세션 업데이트 → `revalidatePath` |

---

## 8. 에러 처리

| 상황 | 처리 |
|------|------|
| 미인증 요청 | `middleware.ts`에서 Supabase 세션 체크 → `/login` 리다이렉트 |
| Server Action 권한 위반 | `supabase.auth.getUser()` userId !== 리소스 소유자 → throw Error |
| 외부 API 실패 (TMDB, Google Books) | 빈 결과 반환 + 토스트로 안내 |
| Claude API 실패 | 취향 분석 건너뛰기 + 다음 감상평 작성 시 재시도 |
| Prisma 에러 | 유니크 제약 등 → 사용자 친화적 메시지 변환 |
| Zod 유효성 실패 | 필드별 에러 메시지 반환 |
