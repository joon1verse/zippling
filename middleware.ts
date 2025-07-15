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
  // 이 부분은 next-intl이 URL에 '/ko'와 같은 로케일을 붙여주는 역할을 합니다.
  let response = handleI18nRouting(request);

  // 2. @supabase/ssr의 공식 패턴으로 클라이언트 생성 및 세션 관리
  // next-intl이 변경한 응답(response) 객체를 기반으로 Supabase 클라이언트를 설정합니다.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // 3. 세션을 최신으로 유지합니다.
  const { data: { session } } = await supabase.auth.getSession();

  // 4. 보호된 경로 접근 제어 로직 (기존과 동일)
  const { pathname } = request.nextUrl;
  const isWritePage = /^\/[^\/]+\/(hot-deal|vancouver\/community)\/write(\/)?$/.test(pathname);

  if (isWritePage && !session) {
    const locale = pathname.split('/')[1] || 'ko';
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }
  
  return response;
}

// 🚦 여기가 핵심 수정 포인트입니다!
export const config = {
  matcher: [
    /*
     * 아래 경로들을 제외한 모든 요청 경로와 일치시킵니다:
     * - api (API 라우트)
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 파일)
     * - images (이미지 폴더)
     * - favicon.ico (파비콘)
     * - og-image.png (OG 이미지)
     * - robots.txt (로봇 설정)
     * - sitemap.xml (사이트맵) <--- ✨ 이 부분이 추가되었습니다!
     */
    '/((?!api|_next/static|_next/image|images|favicon.ico|og-image.png|robots.txt|sitemap.xml).*)'
  ]
};