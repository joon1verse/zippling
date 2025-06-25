import { createServerClient } from '@supabase/ssr'
import { cookies }          from 'next/headers'

// route.ts 내에서
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      getAll: () => cookies().getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookies().set(name, value, options)
        )
      }
    }
  }
)

// 그리고 supabase.auth.handleRequest(req) 도 지원되지 않습니다.
// 대신 App Router 에서는 “서버 액션(server actions)” 형태로 로그인/토큰 갱신을 처리하거나,
// Route Handler 에서 직접 supabase.auth.getSession(), supabase.auth.signInWithPassword() 등을 호출합니다.
