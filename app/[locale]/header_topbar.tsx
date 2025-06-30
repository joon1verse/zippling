// app/[locale]/header_topbar.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createBrowserSupabase } from '@server/supabaseBrowserClient';
import type { User, Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

interface HeaderTopbarProps {
  locale: string;
  initialSession: Session | null;
}

export default function HeaderTopbar({ locale, initialSession }: HeaderTopbarProps) {
  const t = useTranslations('header');
  const router = useRouter();
  const supabase = createBrowserSupabase();

  const [user, setUser] = useState<User | null>(initialSession?.user ?? null);
  const [nickname, setNickname] = useState<string | null>(null);

  // --- ▼▼▼ 바로 이 부분이 추가된 핵심 해결책입니다 ▼▼▼ ---
  // 부모 컴포넌트로부터 받은 initialSession prop이 변경될 때마다
  // 내부의 user 상태를 동기화하여 즉각적인 UI 변경을 보장합니다.
  useEffect(() => {
    setUser(initialSession?.user ?? null);
  }, [initialSession]);
  // --- ▲▲▲ ---

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh();
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, router]);

  useEffect(() => {
    if (!user) {
      setNickname(null);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_nickname')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Error fetching user profile:', error.message);
      } else if (data) {
        setNickname(data.user_nickname);
      }
    })();
  }, [supabase, user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isLoggedIn = !!user;

  return (
    <div className="w-full bg-teal-100 text-gray-700 text-sm h-10 flex items-center justify-between px-6 border-b border-gray-200 z-10">
      {/* 좌측 메뉴 */}
      <div className="flex gap-1">
        <Link
          href={`/${locale}/about`}
          className="hover:underline hover:text-teal-800 transition-colors"
        >
          {t('about')}
        </Link>
        ｜
        <Link
          href={`/${locale}/contact`}
          className="hover:underline hover:text-teal-800 transition-colors"
        >
          {t('contact')}
        </Link>
      </div>

      {/* 우측 인증/프로필 영역 */}
      <div className="flex gap-1 items-center">
        {isLoggedIn ? (
            <>
              <span className="text-sm px-1">
                {t('hi')}, <b className="font-bold">{nickname ?? user.email}</b> {t('welcome_suffix')}
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
