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
    (async () => {
      // 1) URL 해시에서 토큰 파싱
      const hash = window.location.hash.substring(1); // e.g. "access_token=…&refresh_token=…"
      const params = new URLSearchParams(hash);
      const access_token  = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (!access_token || !refresh_token) {
        setError('No auth tokens in URL');
        return;
      }

      // 2) Supabase 클라이언트에 세션 저장
      const { error: setErr } = await supabase.auth.setSession({
        access_token,
        refresh_token
      });
      if (setErr) {
        setError(setErr.message);
        return;
      }

      // 3) getUser()로 실제 유저 정보 획득
      const {
        data: { user },
        error: userErr
      } = await supabase.auth.getUser();
      if (userErr || !user) {
        setError(userErr?.message ?? 'No user after setting session');
        return;
      }

      // 4) user_metadata에서 폼 데이터 꺼내기
      const meta = user.user_metadata as {
        full_name: string;
        user_nickname: string;
        birthdate?: string;
        phone?: string;
      };

      // 5) user_profiles 테이블에 INSERT
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

      // 6) 완료 후 홈으로 리다이렉트
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
