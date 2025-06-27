'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSupabaseClient } from '@server/supabaseProvider';

export default function SignUpCallbackPage() {
  const supabase = useSupabaseClient();
  const router   = useRouter();
  const { locale } = useParams() as { locale: string };
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    (async () => {
      // 1) 해시 파싱
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const access_token  = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (!access_token || !refresh_token) {
        setError('No auth tokens in URL');
        return;
      }

      // 2) 세션 저장
      const { error: sessErr } = await supabase.auth.setSession({
        access_token,
        refresh_token
      });
      if (sessErr) {
        setError(sessErr.message);
        return;
      }

      // 3) 메타데이터 꺼내기
      const raw = window.localStorage.getItem('pending_user_metadata');
      if (!raw) {
        setError('No user metadata found');
        return;
      }
      const meta = JSON.parse(raw) as {
        full_name: string;
        user_nickname: string;
        birthdate?: string;
        phone?: string;
      };

      // 4) 프로필 INSERT
      const {
        data: { user },
        error: userErr
      } = await supabase.auth.getUser();
      if (userErr || !user) {
        setError(userErr?.message ?? 'No user after login');
        return;
      }

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

      // 5) 로컬스토리지 정리 & 홈으로
      window.localStorage.removeItem('pending_user_metadata');
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
