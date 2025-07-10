/*
================================================================================
  3. 메인 페이지 (수정)
  파일 경로: app/[locale]/login/page.tsx
  (UI 레이아웃을 수정했습니다.)
================================================================================
*/
import { createServerSupabase } from '@server/supabaseServerClient';
import { redirect } from 'next/navigation';
import LoginForm from './login-form.client';
import type { Metadata } from 'next';
import { Suspense } from 'react';

// SEO 메타데이터 생성 (로그인 페이지는 검색 결과에서 제외)
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Login',
    robots: {
      index: false,
      follow: false,
    },
  };
}

// 로딩 UI 컴포넌트
function Loading() {
    return <div className="h-full w-full flex items-center justify-center bg-gray-50">Loading...</div>;
}

export default async function LoginPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  // 이미 로그인한 사용자는 홈페이지로 리디렉션
  if (user) {
    redirect(`/${locale}`);
  }

  const redirectUrl = typeof searchParams.redirect === 'string' ? searchParams.redirect : null;

  return (
    // [수정] main 대신 div를 사용하고, h-full로 부모(root layout의 main)의 전체 높이를 차지하도록 합니다.
    // 이렇게 하면 페이지 전체 배경색이 회색으로 통일되고, 불필요한 하단 여백이 사라집니다.
    <div className="h-full w-full flex justify-center pt-12 sm:pt-16 px-4">
        <Suspense fallback={<Loading />}>
          <LoginForm locale={locale} redirectUrl={redirectUrl} />
        </Suspense>
    </div>
  );
}
