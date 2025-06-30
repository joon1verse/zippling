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

  // 1. 서버에서 전달받은 initialSession으로 사용자 상태를 올바르게 초기화합니다.
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null);
  const [nickname, setNickname] = useState<string | null>(null);

  // 2. onAuthStateChange 리스너는 클라이언트 측에서 발생하는 인증 변경(로그아웃, 다른 탭에서의 로그인 등)을 감지합니다.
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // 세션 정보를 기반으로 user 상태를 업데이트합니다.
      setUser(session?.user ?? null);

      // 3. 로그인 또는 로그아웃 이벤트가 발생하면, router.refresh()를 호출하여
      // 서버 컴포넌트를 포함한 페이지 전체의 데이터를 다시 불러옵니다.
      // 이것이 헤더 상태를 최신으로 유지하는 핵심입니다.
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh();
      }
    });

    // 컴포넌트가 사라질 때 리스너를 정리합니다.
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, router]);

  // user 상태가 확정되면, user_profiles 테이블에서 닉네임을 조회합니다.
  useEffect(() => {
    if (!user) {
      setNickname(null);
      return;
    }
    (async () => {
      // 이메일 대신 고유한 id로 조회하는 것이 더 안정적입니다.
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
    // signOut이 성공하면 위의 onAuthStateChange 리스너가 'SIGNED_OUT' 이벤트를 감지하여
    // router.refresh()를 자동으로 호출해줍니다.
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
                {/* 닉네임이 로딩되기 전의 짧은 순간을 위해 기본값을 표시합니다. */}
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
