// app/[locale]/signup/callback/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSupabaseClient } from '@server/supabaseProvider';
// 1단계에서 만든 서버 액션을 가져옵니다.
import { saveUserProfile } from './actions';

export default function SignUpCallbackPage() {
  const t        = useTranslations('signup.callback');
  const supabase = useSupabaseClient();
  const router   = useRouter();
  const { locale } = useParams<{ locale: string }>();

  const [status, setStatus] = useState<'loading'|'error'|'done'>('loading');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    // onAuthStateChange를 사용하여 인증 상태 변경(SIGNED_IN)을 감지합니다.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      
      // 사용자가 성공적으로 로그인하면(SIGNED_IN) 서버 액션을 호출합니다.
      if (event === 'SIGNED_IN' && session) {
        // DB 저장을 서버 액션에 안전하게 위임합니다.
        const result = await saveUserProfile();

        if (result.error) {
          console.error("Failed to save user profile via server action:", result.error);
          setStatus('error');
          setErrorMsg(t('dbError')); // 예: "프로필 저장 중 오류가 발생했습니다."
        } else {
          // 성공적으로 DB에 저장되면 'done' 상태로 변경합니다.
          setStatus('done');
        }
        
        // 한 번 실행된 후에는 리스너를 정리하여 중복 실행을 방지합니다.
        subscription.unsubscribe();
      }
    });

    // 만약 10초 내에 인증이 완료되지 않으면 타임아웃 처리합니다.
    const timeout = setTimeout(() => {
        if (status === 'loading') {
            setStatus('error');
            setErrorMsg(t('timeoutError')); // 예: "인증 시간이 초과되었습니다."
            subscription.unsubscribe();
        }
    }, 10000);

    // 컴포넌트가 언마운트될 때 리스너와 타이머를 모두 정리합니다.
    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 이 useEffect는 컴포넌트가 처음 마운트될 때 한 번만 실행되어야 합니다.


  // 'done' 상태가 되면 3초 후 홈페이지로 리디렉션합니다.
  useEffect(() => {
    if (status !== 'done') return;
    const timer = setTimeout(() => {
      router.replace(`/${locale}`);
    }, 3000);
    return () => clearTimeout(timer);
  }, [status, router, locale]);

  // 상태에 따라 다른 UI를 렌더링합니다.
  if (status === 'loading') {
    return <p className="text-center pt-12">{t('loading')}</p>;
  }
  if (status === 'error') {
    return <p className="text-center pt-12 text-red-600">{errorMsg}</p>;
  }

  // status === 'done'
  return (
    <div className="pt-12 px-4 flex justify-center">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-teal-600 mb-4">
          {t('title')}
        </h1>
        <p className="text-gray-700 mb-6 leading-relaxed">
          {t('description')}
        </p>
        <p className="text-sm text-gray-500">
          {t('redirecting')}
        </p>
      </div>
    </div>
  );
}
