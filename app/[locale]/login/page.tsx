// app/[locale]/signin/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSupabaseClient } from '@server/supabaseProvider';

export default function SignInPage() {
  const t        = useTranslations('signin');
  const { locale } = useParams() as { locale: string };
  const router  = useRouter();
  const supabase= useSupabaseClient();

  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string|null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1) 로그인 시도
    const { data, error: authErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (authErr) {
      setError(authErr.message);
      return;
    }

    // 2) 이메일 미확인 차단
    if (!data.user?.email_confirmed_at) {
      await supabase.auth.signOut();
      setError(t('mustConfirmEmail'));
      return;
    }

    // 3) 인증된 사용자 → 메인 페이지
    router.push(`/${locale}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-2 flex items-start justify-center">
      <div className="w-full px-12 flex justify-center">
        <div className="mt-8 w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
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
    </div>
  );
}
