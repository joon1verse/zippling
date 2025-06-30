// app/[locale]/signup/actions.ts
'use server';

import { createServerSupabase } from '@server/supabaseServerClient';
import { getSupabaseAdmin } from '@server/supabaseClient';

// OTP를 검증하고 프로필을 저장하는 서버 액션
export async function verifyOtpAndSaveProfile(formData: FormData) {
  const email = formData.get('email') as string;
  const token = formData.get('token') as string;
  const supabase = createServerSupabase();

  // 1. OTP 검증 시도
  const { data: { session }, error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup',
  });

  if (verifyError || !session?.user) {
    console.error('OTP verification error:', verifyError?.message);
    return { error: 'Invalid or expired token. Please try again.' };
  }
  
  // 2. 인증 성공! 프로필 저장 로직 실행
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user: adminUser }, error: adminError } = await supabaseAdmin.auth.admin.getUserById(session.user.id);
    if (adminError || !adminUser) throw new Error(`Failed to get user by admin: ${adminError?.message}`);

    const meta = adminUser.user_metadata;
    if (!meta || !meta.full_name) throw new Error('Metadata missing from user object.');
    
    const { error: dbErr } = await supabase.from('user_profiles').upsert({
      id: session.user.id,
      email: session.user.email!,
      full_name: meta.full_name,
      user_nickname: meta.user_nickname,
      phone: meta.phone || null,
      birthdate: meta.birthdate || null,
    });
    if (dbErr) throw new Error(`Failed to save profile to DB: ${dbErr.message}`);

    return { error: null };
  } catch (error) {
    console.error('Profile save error after OTP:', error);
    return { error: 'Failed to save profile after verification.' };
  }
}
