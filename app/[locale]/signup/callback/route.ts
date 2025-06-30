// app/[locale]/signup/callback/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerSupabase } from '@server/supabaseServerClient';

// 캐싱을 방지하고 항상 서버에서 동적으로 실행되도록 설정합니다.
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { locale: string } }
) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  // 1. URL에 인증 코드가 있는지 확인
  if (code) {
    const supabase = createServerSupabase();
    
    // 2. 인증 코드를 실제 사용자 세션으로 교환 (이 과정에서 서버가 쿠키를 설정)
    const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('세션 교환 오류:', exchangeError.message);
      // 실패 시 에러 페이지로 리디렉션
      return NextResponse.redirect(`${origin}/${params.locale}/login?error=session_exchange_failed`);
    }

    // 3. 세션 교환 성공 시, user_profiles 테이블에 정보 저장 (기존 upsert 로직)
    if (session) {
        const user = session.user;
        const meta = user.user_metadata;
        const { error: dbErr } = await supabase
            .from('user_profiles')
            .upsert({
                id:            user.id,
                email:         user.email!,
                full_name:     meta.full_name,
                user_nickname: meta.user_nickname,
                phone:         meta.phone ?? null,
                birthdate:     meta.birthdate ?? null,
            }, { onConflict: 'id' }); // id가 이미 존재하면 업데이트

        if (dbErr) {
            console.error('DB 저장 오류:', dbErr.message);
            // DB 저장이 실패하더라도 일단 로그인은 성공했으므로 성공 페이지로 보낼 수 있습니다.
            // 혹은 별도의 에러 처리를 할 수 있습니다.
        }
        
        // 4. 모든 작업 완료 후, 사용자에게 보여줄 성공 페이지로 리디렉션
        return NextResponse.redirect(`${origin}/${params.locale}/signup/success`);
    }
  }

  // 코드가 없는 등 비정상적인 접근 시
  console.error('인증 콜백 오류: URL에 code가 없습니다.');
  return NextResponse.redirect(`${origin}/${params.locale}/login?error=invalid_callback_request`);
}