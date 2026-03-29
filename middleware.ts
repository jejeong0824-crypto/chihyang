import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Supabase 세션 쿠키 존재 여부로 로그인 판단
  const hasSession = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));

  const { pathname } = request.nextUrl;

  // 비로그인 → /login 리다이렉트
  if (
    !hasSession &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/api/auth")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 로그인 상태에서 /login 접근 → 홈
  if (hasSession && pathname.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
