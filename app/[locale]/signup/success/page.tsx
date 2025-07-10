/*
================================================================================
  2. 메인 페이지 (수정)
  파일 경로: app/[locale]/signup/success/page.tsx
  (기존 파일의 내용을 아래 코드로 교체해주세요.)
================================================================================
*/
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import RedirectHandler from './redirect-handler.client'; // 방금 만든 클라이언트 컴포넌트 import

// SEO 메타데이터 생성 (검색 엔진 제외)
export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  // 이 페이지는 일회성이므로 검색 결과에 노출될 필요가 없습니다.
  const t = await getTranslations({ locale, namespace: 'AuthPage.SignUpPage.success' });
  return {
    title: t('title'),
    robots: {
      index: false,
      follow: false,
    },
  };
}

// 회원가입 성공 페이지 (서버 컴포넌트)
export default async function SignUpSuccessPage({ params: { locale } }: { params: { locale: string } }) {
  // [수정] 번역 네임스페이스를 'signup.success' -> 'SignUpPage.success'로 변경
  const t = await getTranslations('AuthPage.SignUpPage.success');

  return (
    // 요청하신 대로 bg-gray-50를 제거하고, 상단 여백으로 레이아웃을 조정합니다.
    <div className="w-full flex justify-center pt-12 sm:pt-16 px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-teal-600 mb-4">
          {t('title')}
        </h1>
        <p className="text-gray-700 mb-6 leading-relaxed">
          {t('description')}
        </p>
        <p className="text-sm text-gray-500">
          {t('redirecting')}
        </p>
        
        {/* 리디렉션 로직을 담당하는 클라이언트 컴포넌트 렌더링 */}
        <RedirectHandler locale={locale} />
      </div>
    </div>
  );
}
