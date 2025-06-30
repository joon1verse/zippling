// app/[locale]/signup/callback/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// tsconfig.json의 "@server/*": ["utilities/serverutil/*"] 설정에 따라
// 정확한 경로에서 함수를 가져옵니다.
import { createServerSupabase } from '@server/supabaseServerClient';

// tsconfig.json의 "@server/*" 설정과 기존에 만들어두신 `supabaseClient.js` 파일을 활용하여
// 관리자 클라이언트를 'supabaseAdmin'이라는 별칭으로 가져옵니다.
import { supabase as supabaseAdmin } from '@server/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { locale: string } }
) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  
  // 성공 시나리오는 /signup/success 페이지가 있는 경우를 가정합니다.
  // 만약 없다면 홈페이지('/') 등으로 변경하셔도 됩니다.
  const successUrl = `${origin}/${params.locale}/signup/success`;
  const errorUrl = `${origin}/${params.locale}/login?error=auth-failed`;

  if (!code) {
    console.error('Callback Error: No code found in URL');
    return NextResponse.redirect(errorUrl);
  }

  // 1. 일반 사용자용 클라이언트로 세션 교환을 시도합니다.
  const supabase = createServerSupabase();
  const { data: { user }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !user) {
    console.error('Session exchange error:', exchangeError?.message);
    return NextResponse.redirect(errorUrl);
  }

  // 2. 인증 성공! 이제 DB 저장을 위한 후속 처리를 시작합니다.
  try {
    // 2-1. 관리자 클라이언트로 해당 유저의 전체 정보를 조회합니다.
    // 이 과정을 통해 가입 시 입력했던 raw_user_meta_data를 가져올 수 있습니다.
    const { data: { user: adminUser }, error: adminError } = await supabaseAdmin.auth.admin.getUserById(user.id);

    if (adminError || !adminUser) {
      throw new Error(`Admin client failed to get user info: ${adminError?.message}`);
    }

    // 2-2. 메타데이터를 변수에 저장합니다.
    const meta = adminUser.user_metadata;
    if (!meta || !meta.full_name || !meta.user_nickname) {
        throw new Error('User metadata (full_name, user_nickname) is missing from admin user object.');
    }
    
    // 2-3. 일반 클라이언트로 user_profiles 테이블에 데이터를 upsert 합니다.
    const { error: dbErr } = await supabase.from('user_profiles').upsert({
      id: user.id,
      email: user.email!,
      full_name: meta.full_name,
      user_nickname: meta.user_nickname,
      phone: meta.phone ?? null,
      birthdate: meta.birthdate ?? null,
    });

    if (dbErr) {
      throw new Error(`Failed to save to DB: ${dbErr.message}`);
    }

  } catch (error) {
    // 후속 처리 중 에러가 발생해도 인증 자체는 성공했으므로,
    // 서버에 로그만 남기고 사용자는 성공 페이지로 보내줍니다.
    console.error('Error in post-authentication processing:', error instanceof Error ? error.message : String(error));
  }
  
  // 3. 모든 과정이 끝나면 최종적으로 성공 페이지로 리디렉션합니다.
  return NextResponse.redirect(successUrl);
}