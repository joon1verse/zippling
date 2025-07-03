// app/[locale]/signup/success/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function SignUpSuccessPage() {
  // 이 페이지 전용 번역 키를 사용하도록 수정
  const t = useTranslations('signup.success');
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();

  // 3초 후에 홈페이지로 자동 이동
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(`/${locale}`);
    }, 3000); // 5초 -> 3초로 수정
    return () => clearTimeout(timer);
  }, [router, locale]);

  return (
    // [수정됨] 페이지 전체를 감싸는 최상위 div를 main으로 변경하여 시맨틱 의미를 강화합니다.
    <main className="pt-12 px-4 flex justify-center">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-teal-600 mb-4">
          {t('title')} {/* 예: "🎉 Welcome Aboard!" */}
        </h1>
        <p className="text-gray-700 mb-6 leading-relaxed">
          {t('description')} {/* 예: "Your account has been created successfully." */}
        </p>
        <p className="text-sm text-gray-500">
          {t('redirecting')} {/* 예: "Redirecting to the homepage in 3 seconds…" */}
        </p>
      </div>
    </main>
  );
}
