'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useTransition } from 'react';
import { createBrowserSupabase } from '@server/supabaseBrowserClient';
import type { User } from '@supabase/supabase-js';
import { logoutAction } from '../actions/auth.actions';

interface HeaderTopbarProps {
  locale: string;
  initialUser: User | null;
  initialProfile: { user_nickname: string | null } | null;
}

export default function HeaderTopbar({
  locale,
  initialUser,
  initialProfile,
}: HeaderTopbarProps) {
  const t = useTranslations('common.Header');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // UI는 서버에서 내려준 초기 props 값을 직접 사용합니다.
  const isLoggedIn = initialUser !== null;
  const nickname = initialProfile?.user_nickname ?? initialUser?.email?.split('@')[0];

  // useEffect는 클라이언트에서 발생하는 모든 인증 상태 변경을 감지하고,
  // 서버로부터 최신 데이터를 가져오도록 페이지를 새로고침하는 역할만 합니다.
  useEffect(() => {
    const supabase = createBrowserSupabase();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      router.refresh(); 
    });
  };

  return (
    <div className="relative top-0 z-40 w-full bg-teal-100 text-gray-700 text-sm h-10 flex items-center justify-between px-4 sm:px-6 border-b border-gray-200">
      
      {/* --- 모바일 햄버거 버튼 --- */}
      <div className="md:hidden">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md hover:bg-teal-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* --- 데스크탑 메뉴 (About, Contact) --- */}
      <div className="hidden md:flex items-center gap-6">
        <Link href={`/${locale}/about`} className="hover:underline hover:text-teal-800 transition-colors">
          {t('about')}
        </Link>
        <Link href={`/${locale}/contact`} className="hover:underline hover:text-teal-800 transition-colors">
          {t('contact')}
        </Link>
      </div>

      {/* --- 모바일 드롭다운 메뉴 --- */}
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

      {/* --- 우측 인증 영역 --- */}
      <div className="flex gap-2 items-center">
        {isLoggedIn ? (
          <>
            <span className="text-sm px-1">
              {t('hi')}, <b className="font-bold text-teal-900">{nickname}</b> {t('welcome_suffix')}
            </span>
            <button 
              onClick={handleLogout} 
              disabled={isPending}
              className="font-bold px-3 py-1 bg-teal-200 hover:bg-teal-300 text-teal-900 rounded disabled:opacity-50"
            >
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