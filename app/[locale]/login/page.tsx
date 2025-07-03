// app/[locale]/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation'; // useSearchParams 추가
import { useTranslations } from 'next-intl';
import { createBrowserSupabase } from '@server/supabaseBrowserClient'; // Supabase 클라이언트 import 경로 수정

export default function SignInPage() {
  const t = useTranslations('signin');
  const { locale } = useParams<{ locale: string }>();
  const supabase = createBrowserSupabase();
  const router = useRouter();
  const searchParams = useSearchParams(); // 리다이렉트 URL을 가져오기 위해 추가

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authErr) return setError(authErr.message);

    // 이메일 인증 확인
    if (!data.user?.email_confirmed_at) {
      await supabase.auth.signOut();
      return setError(t('mustConfirmEmail'));
    }

    // 리다이렉트 URL이 있으면 해당 경로로, 없으면 홈페이지로 이동
    const redirectUrl = searchParams.get('redirect');
    router.push(redirectUrl || `/${locale}`);
  };

  return (
    // [수정됨] 페이지 전체를 감싸는 최상위 div를 main으로 변경하여 시맨틱 의미를 강화합니다.
    <main className="min-h-screen bg-gray-50 pt-2 flex items-start justify-center">
      <div className="w-full px-12 flex justify-center">
        <div className="mt-8 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* 헤더 그라데이션 */}
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-center py-4">
            <h1 className="text-2xl font-bold">{t('title')}</h1>
          </div>

          {/* 폼 */}
          <div className="px-8 py-4 space-y-4">
            {error && (
              <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg">
                {error}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1 font-medium text-base">
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="
                    w-full pl-4 pr-14 py-2 text-base
                    border border-gray-300 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-teal-300
                    transition
                  "
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1 font-medium text-base">
                  {t('password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="
                    w-full pl-4 pr-14 py-2 text-base
                    border border-gray-300 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-teal-300
                    transition
                  "
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 mt-6 mb-3 text-white font-semibold rounded-lg"
              >
                {loading ? t('loggingIn') : t('loginButton')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
