/*
================================================================================
  3. 메인 페이지 (수정)
  파일 경로: app/[locale]/signup/page.tsx
  (기존 파일의 내용을 아래 코드로 교체해주세요.)
================================================================================
*/
import { createServerSupabase } from '@server/supabaseServerClient';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import SignUpForm from './signup-form.client';

// SEO 메타데이터 생성 (검색 엔진 제외)
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Sign Up',
    robots: {
      index: false,
      follow: false,
    },
  };
}

// 로딩 UI 컴포넌트
function Loading() {
    return <div className="h-full w-full flex items-center justify-center">Loading...</div>;
}

export default async function SignUpPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  // 이미 로그인한 사용자는 홈페이지로 리디렉션
  if (user) {
    redirect(`/${locale}`);
  }

  return (
    // [수정] 배경색을 제거하고, 상단 여백을 주어 레이아웃을 조정합니다.
    <div className="w-full flex justify-center pt-8 sm:pt-12 px-4 pb-12">
        <Suspense fallback={<Loading />}>
          <SignUpForm locale={locale} />
        </Suspense>
    </div>
  );
}
