// app/[locale]/signup/callback/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerSupabase } from '@server/supabaseServerClient';
import { getSupabaseAdmin } from '@server/supabaseClient'; // 함수를 가져오도록 수정

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { locale: string } }
) {
  // 이제 함수가 호출되는 이 시점에서 클라이언트가 생성됩니다.
  const supabase = createServerSupabase();
  const supabaseAdmin = getSupabaseAdmin(); // 함수 호출

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  
  const successUrl = `${origin}/${params.locale}/signup/success`;
  const errorUrl = `${origin}/${params.locale}/login?error=auth-failed`;

  if (!code) {
    console.error('Callback Error: No code found in URL');
    return NextResponse.redirect(errorUrl);
  }

  const { data: { user }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !user) {
    console.error('Session exchange error:', exchangeError?.message);
    return NextResponse.redirect(errorUrl);
  }

  try {
    const { data: { user: adminUser }, error: adminError } = await supabaseAdmin.auth.admin.getUserById(user.id);

    if (adminError || !adminUser) {
      throw new Error(`Admin client failed to get user info: ${adminError?.message}`);
    }

    const meta = adminUser.user_metadata;
    
    if (!meta || typeof meta !== 'object' || !meta.full_name || !meta.user_nickname) {
        throw new Error('User metadata (full_name, user_nickname) is missing from admin user object.');
    }
    
    const { error: dbErr } = await supabase.from('user_profiles').upsert({
      id: user.id,
      email: user.email!,
      full_name: meta.full_name,
      user_nickname: meta.user_nickname,
      phone: meta.phone || null,
      birthdate: meta.birthdate || null,
    });

    if (dbErr) {
      throw new Error(`Failed to save to DB: ${dbErr.message}`);
    }

  } catch (error) {
    console.error('Error in post-authentication processing:', error instanceof Error ? error.message : String(error));
  }
  
  return NextResponse.redirect(successUrl);
}