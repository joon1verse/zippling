// app/[locale]/header_topbar.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createBrowserSupabase } from '@server/supabaseBrowserClient';
import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

interface HeaderTopbarProps {
  locale: string;
  initialSession: Session | null;
}

export default function HeaderTopbar({ locale, initialSession }: HeaderTopbarProps) {
  const t = useTranslations('header');
  const router = useRouter();
  const supabase = createBrowserSupabase();

  const [session, setSession] = useState<Session | null>(initialSession);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}`);
  };

  const isLoggedIn = !!session;

  return (
    <div className="w-full bg-teal-100 text-gray-700 text-sm h-10 flex items-center justify-between px-6 border-b border-gray-200 z-10">
      {/* 좌측 메뉴 */}
      <div className="flex gap-6">
        <Link
          href={`/${locale}/about`}
          className="hover:underline hover:text-teal-800 transition-colors"
        >
          {t('about')}
        </Link>
        <Link
          href={`/${locale}/contact`}
          className="hover:underline hover:text-teal-800 transition-colors"
        >
          {t('contact')}
        </Link>
      </div>

      {/* 우측 로그인/회원가입 또는 로그아웃 */}
      <div className="flex gap-4 items-center">
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="px-4 py-1 bg-teal-200 hover:bg-teal-300 text-teal-900 rounded-md font-medium transition"
          >
            {t('logout')}
          </button>
        ) : (
          <>
            <Link
              href={`/${locale}/login`}
              className="px-4 py-1 text-teal-800 hover:text-teal-900 font-semibold transition"
            >
              {t('login')}
            </Link>
            <Link
              href={`/${locale}/signup`}
              className="px-4 py-1 bg-teal-200 hover:bg-teal-300 text-teal-900 rounded-md font-medium transition"
            >
              {t('signup')}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
