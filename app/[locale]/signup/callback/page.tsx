// app/[locale]/signup/callback/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSupabaseClient } from '@server/supabaseProvider';

export default function SignUpCallbackPage() {
  const supabase = useSupabaseClient();
  const router   = useRouter();
  const { locale } = useParams() as { locale: string };
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 디버깅 로그
    console.log('📥 location.href   =', window.location.href);
    console.log('📥 location.hash   =', window.location.hash);
    console.log('📥 location.search =', window.location.search);

    (async () => {
      // 1) URL 쿼리에서 code 파싱
      const params = new URL(window.location.href).searchParams;
      const code = params.get('code');
      if (!code) {
        setError('No confirmation code in URL');
        return;
      }

      // 2) code → 세션 교환
      const { data, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeErr) {
        setError(exchangeErr.message);
        return;
      }
      const session = data.session;
      if (!session) {
        setError('Failed to exchange code for session');
        return;
      }

      // 3) user_metadata에서 폼 데이터 꺼내기
      const user = session.user;
      const meta = user.user_metadata as {
        full_name: string;
        user_nickname: string;
        birthdate?: string;
        phone?: string;
      };

      // 4) user_profiles 테이블에 INSERT
      const { error: profileErr } = await supabase
        .from('user_profiles')
        .insert({
          id:            user.id,
          full_name:     meta.full_name,
          user_nickname: meta.user_nickname,
          email:         user.email!,
          birthdate:     meta.birthdate ?? null,
          phone:         meta.phone     ?? null
        });
      if (profileErr) {
        setError(profileErr.message);
        return;
      }

      // 5) 모두 성공하면 홈으로 리다이렉트
      router.push(`/${locale}`);
    })();
  }, [supabase, router, locale]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {error
        ? <p className="text-red-600">{error}</p>
        : <p className="text-gray-700">Processing…</p>
      }
    </div>
  );
}
