import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types'; // 기존 타입 경로 유지

// [수정] 파일 이름에 맞춰 함수 이름 변경 또는 그대로 사용
export function createCacheFirstSupabaseServer() {
  const cookieStore = cookies();

  // [핵심] @supabase/ssr을 사용한 공식 패턴
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Server-Action 또는 Route-Handler가 아닐 경우 쿠키 설정 시 에러가 발생할 수 있습니다.
            // 이 에러는 무시해도 안전합니다.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // 위와 동일
          }
        },
      },
    }
  );
}