// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { updateSession } from '@server/supabaseMiddleware';
import { createServerSupabase } from '@server/supabaseServerClient';

// next-intl 미들웨어 설정
const intlMiddleware = createMiddleware({
  locales: ['en', 'ko', 'ja'],
  defaultLocale: 'ko',
  localePrefix: 'always'
});

export async function middleware(request: NextRequest) {
  // 1. 먼저 next-intl 미들웨어를 실행하여 국제화 라우팅을 처리합니다.
  const intlResponse = intlMiddleware(request);

  // 2. Supabase 세션을 업데이트합니다. (쿠키 갱신)
  //    updateSession은 내부적으로 NextResponse.next()를 호출하므로,
  //    여기서는 헤더만 복사해오는 방식으로 통합합니다.
  const sessionResponse = await updateSession(request);

  // intl이 생성한 응답에 Supabase가 갱신한 세션 쿠키를 설정합니다.
  sessionResponse.headers.forEach((value, key) => {
    if (key === 'Set-Cookie') {
      intlResponse.headers.append(key, value);
    }
  });

  // 3. 보호된 경로(/hot-deal/write)에 대한 접근 제어 로직
  const { pathname } = request.nextUrl;
  const isWritePage = /^\/[^\/]+\/hot-deal\/write(\/)?$/.test(pathname);

  if (isWritePage) {
    const supabase = createServerSupabase();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      const locale = pathname.split('/')[1] || 'ko'; // 현재 locale 추출
      // 로그인 페이지로 리디렉션
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  // 4. 최종적으로 통합된 응답을 반환합니다.
  return intlResponse;
}

export const config = {
  matcher: [
    // '/(ko|en|ja)?/:path*' 형식의 경로를 제외한 모든 경로를 제외합니다.
    // api, _next/static, _next/image, public 폴더의 파일(images, ico, png, txt) 등은
    // 미들웨어가 실행되지 않도록 설정합니다.
    '/((?!api|_next/static|_next/image|images|favicon.ico|og-image.png|robots.txt).*)'
  ]
};