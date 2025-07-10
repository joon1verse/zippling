/*
================================================================================
  1. 서버 액션 파일 (수정)
  파일 경로: app/[locale]/signup/actions.ts
  (이메일 중복 확인 로직을 RPC 함수 호출 방식으로 수정했습니다.)
================================================================================
*/
'use server';

import { redirect } from 'next/navigation';
import { createServerSupabase } from '@server/supabaseServerClient';
import { getSupabaseAdmin } from '@server/supabaseClient';
import { revalidatePath } from 'next/cache';

// 이메일 중복 확인 액션
export async function checkEmailAvailabilityAction(email: string) {
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return { error: 'invalidEmailFormat' };
  }
  
  // [수정] Supabase에 직접 만든 'check_email_exists' 함수를 호출(RPC)합니다.
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const { data: isTaken, error } = await supabaseAdmin.rpc('check_email_exists', {
      email_to_check: email.toLowerCase(),
    });

    if (error) {
      console.error("RPC 'check_email_exists' Error:", error);
      throw error;
    }
    
    return { isTaken };

  } catch (error: any) {
    console.error('Email check error (RPC call):', error);
    return { error: 'emailCheckError' };
  }
}

// 1단계: 회원가입 (OTP 발송) 액션
export async function signupAction(prevState: any, formData: FormData) {
  const supabase = createServerSupabase();
  
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const nickname = formData.get('nickname') as string;
  const phone = formData.get('phone') as string;
  const birthdate = formData.get('birthdate') as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        user_nickname: nickname,
        phone,
        birthdate,
      },
    },
  });

  if (error) {
    if (error.message.includes('User already registered')) {
        return { success: false, message: 'emailTakenError' };
    }
    return { success: false, message: error.message };
  }

  return { success: true, message: null };
}

// 2단계: OTP 검증 및 프로필 생성 액션
export async function verifyOtpAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const token = formData.get('token') as string;
  const locale = formData.get('locale') as string;
  const supabase = createServerSupabase();

  const { data: { session }, error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup',
  });

  if (verifyError || !session?.user) {
    console.error('OTP verification error:', verifyError?.message);
    return { success: false, message: 'Invalid or expired token. Please try again.' };
  }
  
  try {
    const user = session.user;
    const meta = user.user_metadata;

    if (!meta || !meta.full_name || !meta.user_nickname) {
      throw new Error('Metadata missing from user object.');
    }
    
    const { error: dbErr } = await supabase.from('user_profiles').insert({
      id: user.id,
      email: user.email!,
      full_name: meta.full_name,
      user_nickname: meta.user_nickname,
      phone: meta.phone || null,
      birthdate: meta.birthdate || null,
    });

    if (dbErr) throw dbErr;

  } catch (error: any) {
    console.error('Profile save error after OTP:', error);
    return { success: false, message: 'Failed to save profile after verification.' };
  }

  revalidatePath('/', 'layout');
  redirect(`/${locale}/signup/success`);
}
