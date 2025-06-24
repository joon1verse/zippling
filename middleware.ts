// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1) 루트('/') 접근 시 기본 로케일 '/en' 으로 리디렉트
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/en', request.url));
  }

  // 2) '/{locale}/hot-deal/write' 접근 시 로그인 검사
  //    Supabase Auth가 발급한 쿠키(sb-access-token)가 없으면 '/{locale}/signin' 으로 리다이렉트
  const writePageMatch = /^\/[^\/]+\/hot-deal\/write\/?$/.test(pathname);
  if (writePageMatch) {
    const token = request.cookies.get('sb-access-token')?.value;
    if (!token) {
      const locale = pathname.split('/')[1];  // 예: 'en', 'ko'
      return NextResponse.redirect(new URL(`/${locale}/signin`, request.url));
    }
  }

  // 그 외 경로는 평상시 흐름
  return NextResponse.next();
}

export const config = {
  // 이 matcher에 걸린 경로에만 middleware 실행
  matcher: [
    '/',                   // 루트 리디렉트
    '/:locale/hot-deal/write' // 글쓰기 페이지 보호
  ]
};
