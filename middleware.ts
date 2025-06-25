// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@server/supabaseMiddleware';
import { createServerSupabase } from '@server/supabaseServerClient';

export async function middleware(request: NextRequest) {
  // 0) 토큰 만료 시 자동으로 refresh → sb-access-token / sb-refresh-token 쿠키 갱신
  const response = await updateSession(request);

  const { pathname } = request.nextUrl;

  // 1) 루트('/')로 들어오면 언어 기본값(/en)으로 리디렉트
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/en', request.url));
  }

  // 2) '/{locale}/hot-deal/write' 경로는 로그인(세션)이 필요하므로 보호
  const isWritePage = /^\/[^\/]+\/hot-deal\/write(\/)?$/.test(pathname);
  if (isWritePage) {
    // 여기서는 갱신된 쿠키를 함께 보내기 위해 미리 만들어 둔 response 사용
    // 추가로 세션이 진짜 있는지 한번 더 체크
    const supabase = createServerSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const locale = pathname.split('/')[1];
      return NextResponse.redirect(new URL(`/${locale}/signin`, request.url));
    }

    // 세션이 유효하면 갱신된 쿠키가 담긴 response 그대로 리턴
    return response;
  }

  // 3) 그 외의 경로는 토큰만 갱신한 뒤 그대로 통과
  return response;
}

export const config = {
  matcher: ['/', '/:locale/hot-deal/write'],
};
