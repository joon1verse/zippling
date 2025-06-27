// app/[locale]/header_topbar.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createBrowserSupabase } from '@server/supabaseBrowserClient';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@server/types';
import { useEffect, useState } from 'react';

interface HeaderTopbarProps {
  locale: string;
}

export default function HeaderTopbar({ locale }: HeaderTopbarProps) {
  const t = useTranslations('header');
  const router = useRouter();
  const supabase = createBrowserSupabase();

  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);

  // 인증 상태 초기화 및 변경 리스너
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u }, error }) => {
      if (error) {
        console.error('Auth validation failed', error);
        setUser(null);
      } else {
        setUser(u || null);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_, s) => {
      setUser(s?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  // user_profiles 테이블에서 user_nickname 조회
  useEffect(() => {
    if (!user) {
      setNickname(null);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_nickname')
        .eq('email', user.email)  
        .single()
      if (!error && data) {
        setNickname(data.user_nickname);
      }
    })();
  }, [supabase, user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}`);
  };

  const isLoggedIn = !!user;

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

      {/* 우측 인증/프로필 영역 */}
      <div className="flex gap-4 items-center">
        {isLoggedIn ? (
            <>
              <span className="text-sm px-1">
                {t('hi')}, <b className="font-bold">{nickname}</b> {t('welcome_suffix')}
              </span>
              <button
                onClick={handleLogout}
                className="font-bold px-3 py-1 bg-teal-200 hover:bg-teal-300 text-teal-900 rounded"
              >
                {t('logout')}
              </button>
            </>
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
