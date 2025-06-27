'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSupabaseClient }    from '@server/supabaseProvider';
import type { Database }         from '@server/types';

export default function SignUpCallbackPage() {
  const supabase = useSupabaseClient();
  const router   = useRouter();
  const { locale } = useParams<{ locale: string }>();

  const [status, setStatus] = useState<'loading'|'error'|'done'>('loading');
  const [msg, setMsg]       = useState<string>('');

  useEffect(() => {
    (async () => {
      // 1) 세션 꺼내기
      const { data: sessionData, error: sessErr } = await supabase.auth.getSession();
      if (sessErr) {
        setStatus('error');
        return setMsg(sessErr.message);
      }
      const user = sessionData.session?.user;
      if (!user) {
        setStatus('error');
        return setMsg('세션을 찾을 수 없습니다.');
      }

      // 2) user_metadata → 프로필 upsert
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

      // 3) 완료 → 자동 로그인 후 메인으로
      setStatus('done');
      router.replace(`/${locale}`);
    })();
  }, [supabase, router, locale]);

  if (status === 'loading') return <p>가입 완료 중…</p>;
  if (status === 'error')   return <p className="text-red-600">{msg}</p>;
  return <p>가입이 완료되었습니다! 자동 로그인 중…</p>;
}
