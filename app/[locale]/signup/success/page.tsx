// app/[locale]/signup/success/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function SignUpSuccessPage() {
  const t = useTranslations('signup.callback'); // 기존 번역 파일을 재사용할 수 있습니다.
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();

  // 5초 후에 홈페이지로 자동 이동
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(`/${locale}`);
    }, 5000);
    return () => clearTimeout(timer);
  }, [router, locale]);

  return (
    <div className="pt-12 px-4 flex justify-center">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-teal-600 mb-4">
          {t('title')} {/* 예: "가입을 환영합니다!" */}
        </h1>
        <p className="text-gray-700 mb-6 leading-relaxed">
          {t('description')} {/* 예: "회원가입이 성공적으로 완료되었습니다." */}
        </p>
        <p className="text-sm text-gray-500">
          {t('redirecting')} {/* 예: "5초 후 홈페이지로 자동 이동합니다." */}
        </p>
      </div>
    </div>
  );
}