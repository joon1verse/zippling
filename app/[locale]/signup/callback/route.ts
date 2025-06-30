// app/[locale]/signup/callback/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerSupabase } from '@server/supabaseServerClient';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { locale: string } }
) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  
  // 성공 시 최종적으로 이동할 URL
  const successUrl = `${origin}/${params.locale}/signup/success`;
  // 실패 시 이동할 URL
  const errorUrl = `${origin}/${params.locale}/login?error=auth-callback-failed`;

  if (!code) {
    console.error('인증 콜백 오류: URL에 code 파라미터가 없습니다.');
    return NextResponse.redirect(errorUrl);
  }

  const supabase = createServerSupabase();

  // 1. 코드를 세션으로 교환
  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('세션 교환 오류:', exchangeError.message);
    return NextResponse.redirect(errorUrl);
  }
  
  // exchangeCodeForSession의 응답값으로 user와 session이 모두 들어옵니다.
  const { user, session } = data;

  if (!session || !user) {
    console.error('인증 콜백 오류: 세션 또는 사용자 정보를 가져오지 못했습니다.');
    return NextResponse.redirect(errorUrl);
  }

  // 2. DB에 사용자 프로필 정보 저장 (upsert)
  // 이 과정에서 오류가 발생해도 인증 자체는 성공한 것이므로,
  // 에러 로그만 남기고 사용자는 성공 페이지로 보냅니다.
  try {
    const meta = user.user_metadata;
    
    // user_metadata가 존재하는지 확실히 확인
    if (!meta.full_name || !meta.user_nickname) {
        throw new Error('user_metadata (이름, 닉네임)가 비어있습니다.');
    }

    const { error: dbErr } = await supabase
      .from('user_profiles')
      .upsert({
        id:            user.id,
        email:         user.email!,
        full_name:     meta.full_name,
        user_nickname: meta.user_nickname,
        phone:         meta.phone ?? null,
        birthdate:     meta.birthdate ?? null,
      }, { onConflict: 'id' });

    if (dbErr) {
      // dbErr를 그냥 throw하여 아래 catch 블록에서 처리하도록 합니다.
      throw dbErr;
    }

    console.log(`[${user.email}] 님의 프로필이 성공적으로 저장/업데이트되었습니다.`);

  } catch (dbError: any) {
    console.error('DB 저장/업데이트 심각한 오류:', dbError.message);
    // 여기서 문제가 발생해도 사용자는 계속 진행시킵니다.
    // 추후 Vercel의 서버 로그에서 이 에러를 확인하여 원인을 파악해야 합니다.
  }

  // 3. 모든 과정이 끝나면 성공 페이지로 리디렉션
  return NextResponse.redirect(successUrl);
}