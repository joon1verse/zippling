// app/[locale]/signup/callback/actions.ts
'use server';

import { createServerSupabase } from '@server/supabaseServerClient';
import { getSupabaseAdmin } from '@server/supabaseClient';

export async function saveUserProfile() {
  const supabase = createServerSupabase();

  // 1. 현재 요청에 대한 사용자 정보를 가져옵니다.
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Server Action Error: User not found.', userError?.message);
    return { error: 'Failed to find user session.' };
  }

  try {
    // 2. 관리자 클라이언트로 해당 유저의 전체 정보를 다시 조회하여
    // user_metadata를 확실하게 가져옵니다.
    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user: adminUser }, error: adminError } = await supabaseAdmin.auth.admin.getUserById(user.id);

    if (adminError || !adminUser) {
      throw new Error(`Admin client failed to get user info: ${adminError?.message}`);
    }

    const meta = adminUser.user_metadata;
    if (!meta || !meta.full_name || !meta.user_nickname) {
      throw new Error('User metadata (full_name, user_nickname) is missing.');
    }
    
    // 3. user_profiles 테이블에 데이터를 upsert 합니다.
    const { error: dbErr } = await supabase.from('user_profiles').upsert({
      id: user.id,
      email: user.email!,
      full_name: meta.full_name,
      user_nickname: meta.user_nickname,
      phone: meta.phone || null,
      birthdate: meta.birthdate || null,
    });

    if (dbErr) {
      throw new Error(`DB upsert failed: ${dbErr.message}`);
    }
    
    return { error: null };

  } catch (error) {
    console.error('saveUserProfile Action Error:', error instanceof Error ? error.message : String(error));
    return { error: 'Failed to save profile information.' };
  }
}
