import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ESM 방식
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 루트 경로('/')로 접근했을 때 자동으로 '/ko'로 리디렉션
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/en', request.url));
  }
}

// 필요한 경로에만 middleware가 동작하도록 matcher 설정
export const config = {
  matcher: ['/']
};
