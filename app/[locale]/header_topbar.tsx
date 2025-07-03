/*
 * 파일 2: header_topbar.tsx
 * * [수정 사항]
 * - 상위 컴포넌트로부터 session 대신 user 객체를 직접 받도록 props 인터페이스와 로직을 수정합니다.
 */
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createBrowserSupabase } from '@server/supabaseBrowserClient';
import type { User } from '@supabase/supabase-js'; // Session 타입은 더 이상 필요 없습니다.
import { useEffect, useState } from 'react';

// [FIXED] initialSession 대신 initialUser를 받도록 props 인터페이스를 수정합니다.
interface HeaderTopbarProps {
  locale: string;
  initialUser: User | null;
}

export default function HeaderTopbar({ locale, initialUser }: HeaderTopbarProps) {
  const t = useTranslations('header');
  const router = useRouter();
  const supabase = createBrowserSupabase();

  // [FIXED] initialUser를 사용하여 user 상태를 초기화합니다.
  const [user, setUser] = useState<User | null>(initialUser);
  const [nickname, setNickname] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // [FIXED] initialUser가 변경될 때 user 상태를 업데이트합니다.
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

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
    router.push(`/${locale}`);
  };

  const isLoggedIn = !!user;

  return (
    <div className="relative top-0 z-40 w-full bg-teal-100 text-gray-700 text-sm h-10 flex items-center justify-between px-4 sm:px-6 border-b border-gray-200">
      {/* 반응형 메뉴 */}
      <div className="md:hidden">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md hover:bg-teal-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      <div className="hidden md:flex items-center gap-6">
        <Link href={`/${locale}/about`} className="hover:underline hover:text-teal-800 transition-colors">
          {t('about')}
        </Link>
        <Link href={`/${locale}/contact`} className="hover:underline hover:text-teal-800 transition-colors">
          {t('contact')}
        </Link>
      </div>
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg rounded-b-lg border-t border-gray-200">
            <Link href={`/${locale}/about`} className="block px-4 py-3 text-gray-700 hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>
                {t('about')}
            </Link>
            <Link href={`/${locale}/contact`} className="block px-4 py-3 text-gray-700 hover:bg-gray-100 border-t border-gray-100" onClick={() => setIsMenuOpen(false)}>
                {t('contact')}
            </Link>
        </div>
      )}

      {/* 우측 인증/프로필 영역 */}
      <div className="flex gap-2 items-center">
        {isLoggedIn ? (
            <>
              <span className="text-sm px-1">
                {t('hi')}, <b className="font-bold">{nickname ?? user.email?.split('@')[0]}</b> {t('welcome_suffix')}
              </span>
              <button onClick={handleLogout} className="font-bold px-3 py-1 bg-teal-200 hover:bg-teal-300 text-teal-900 rounded">
                {t('logout')}
              </button>
            </>
        ) : (
          <>
            <Link href={`/${locale}/login`} className="px-4 py-1 text-teal-800 hover:text-teal-900 font-semibold transition">
              {t('login')}
            </Link>
            <Link href={`/${locale}/signup`} className="px-4 py-1 bg-teal-200 hover:bg-teal-300 text-teal-900 rounded-md font-medium transition">
              {t('signup')}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
