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
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 모바일 메뉴 상태

  useEffect(() => {
    setUser(initialSession?.user ?? null);
  }, [initialSession]);

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
    <div className="w-full bg-teal-100 text-gray-700 text-sm h-10 flex items-center justify-between px-4 sm:px-6 border-b border-gray-200 z-10 relative">
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
              {/* --- ▼▼▼ hidden sm:inline 클래스를 삭제하여 항상 보이도록 수정했습니다 ▼▼▼ --- */}
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
