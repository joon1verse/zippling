// app/[locale]/signup/callback/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSupabaseClient }    from '@server/supabaseProvider';
import { useTranslations }       from 'next-intl';
import type { Database }         from '@server/types';

export default function SignUpCallbackPage() {
  const t        = useTranslations('signup.callback');
  const supabase = useSupabaseClient();
  const router   = useRouter();
  const { locale } = useParams<{ locale: string }>();

  const [status, setStatus] = useState<'loading'|'error'|'done'>('loading');
  const [msg,    setMsg]    = useState<string>('');

  // 1) 세션 → upsert 처리
  useEffect(() => {
    (async () => {
      const { data, error: sessErr } = await supabase.auth.getSession();
      if (sessErr) {
        setStatus('error');
        return setMsg(sessErr.message);
      }
      const user = data.session?.user;
      if (!user) {
        setStatus('error');
        return setMsg(t('noSession'));
      }

      const meta = user.user_metadata as {
        full_name:     string;
        user_nickname: string;
        phone?:        string;
        birthdate?:    string;
      };

      const { error: dbErr } = await supabase
        .from('user_profiles')
        .upsert({
          id:            user.id,
          email:         user.email!,
          full_name:     meta.full_name,
          user_nickname: meta.user_nickname,
          phone:         meta.phone   ?? null,
          birthdate:     meta.birthdate ?? null,
        });

      if (dbErr) {
        setStatus('error');
        return setMsg(dbErr.message);
      }

      setStatus('done');
    })();
  }, [supabase, t]);

  // 2) done 상태에서 5초 뒤 자동 리다이렉트
  useEffect(() => {
    if (status !== 'done') return;
    const timer = setTimeout(() => {
      // 자동 로그인 세션은 이미 supabase.auth.getSession()에서 확보되어 있습니다
      router.replace(`/${locale}`);
    }, 5000);
    return () => clearTimeout(timer);
  }, [status, router, locale]);

  // 3) 렌더링
  if (status === 'loading') {
    return <p className="text-center pt-12">{t('loading')}</p>;
  }
  if (status === 'error') {
    return <p className="text-center pt-12 text-red-600">{msg}</p>;
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
          {t('redirecting')} {/* e.g. "홈페이지로 이동합니다. 5초 후 자동 전환됩니다." */}
        </p>
      </div>
    </div>
  );
}
