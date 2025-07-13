import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

// next-intl 설정은 그대로 유지
const handleI18nRouting = createIntlMiddleware({
  locales: ['en', 'ko', 'ja'],
  defaultLocale: 'ko',
  localePrefix: 'always'
});

export async function middleware(request: NextRequest) {
  // 1. next-intl 미들웨어를 먼저 실행
  let response = handleI18nRouting(request);

  // 2. @supabase/ssr의 공식 패턴으로 클라이언트 생성 및 세션 관리
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // next-intl이 만든 응답에 쿠키를 설정합니다.
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // 3. 세션을 최신으로 유지합니다. 이것이 F5 문제 해결의 핵심입니다.
  const { data: { session } } = await supabase.auth.getSession();

  // 4. 보호된 경로 접근 제어 로직 (기존과 동일)
  const { pathname } = request.nextUrl;
  const isWritePage = /^\/[^\/]+\/hot-deal\/write(\/)?$/.test(pathname);

  if (isWritePage && !session) {
    const locale = pathname.split('/')[1] || 'ko';
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|images|favicon.ico|og-image.png|robots.txt).*)'
  ]
};