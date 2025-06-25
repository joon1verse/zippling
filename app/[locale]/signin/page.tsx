// app/[locale]/signin/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSupabaseClient } from '@server/supabaseProvider';

export default function SignInPage() {
  const t = useTranslations('signin');
  const { locale } = useParams() as { locale: string };
  const router = useRouter();
  const supabase = useSupabaseClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      router.push(`/${locale}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 flex items-start justify-center">
      <div className="w-full px-12 flex justify-center">
        <div className="mt-12 w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* 헤더 그라데이션 */}
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-center py-6">
            <h1 className="text-3xl font-bold">{t('title')}</h1>
          </div>

          <div className="p-8 space-y-4">
            {error && (
              <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-base">
                {t('error', { message: error })}
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
                    w-full px-8 py-3 text-base
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
                    w-full px-8 py-3 text-base
                    border border-gray-300 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-teal-300
                    transition
                  "
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full py-3 bg-teal-600 hover:bg-teal-700
                  text-white text-lg font-semibold
                  rounded-lg transition
                  disabled:opacity-50
                "
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
