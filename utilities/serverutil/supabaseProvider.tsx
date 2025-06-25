'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useMemo,
} from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

type SupabaseClient = ReturnType<typeof createBrowserClient<Database>>;

const SupabaseContext = createContext<SupabaseClient | null>(null);

export function useSupabaseClient(): SupabaseClient {
  const ctx = useContext(SupabaseContext);
  if (!ctx) {
    throw new Error('useSupabaseClient must be used within SupabaseProvider');
  }
  return ctx;
}

/**
 * 브라우저 전용 Supabase 클라이언트를 리액트 컨텍스트로 감쌉니다.
 * Login/Logout 후 자동으로 session state 가 업데이트되려면
 * 내부에서 onAuthStateChange 등을 걸어서 상태관리도 추가할 수 있습니다.
 */
export default function SupabaseProvider({
  children,
}: {
  children: ReactNode;
}) {
  // 한 번만 생성하도록 useMemo (또는 useState) 사용
  const supabase = useMemo(
    () =>
      createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}
