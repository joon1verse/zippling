/*
================================================================================
  1. 서버 액션 파일 (신규 생성)
  파일 경로: app/[locale]/login/actions.ts
  (이 파일을 새로 생성해주세요.)
================================================================================
*/
'use server';

import { redirect } from 'next/navigation';
import { createServerSupabase } from '@server/supabaseServerClient';
import { revalidatePath } from 'next/cache';

export async function loginAction(prevState: any, formData: FormData) {
  const supabase = createServerSupabase();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const locale = formData.get('locale') as string;
  const redirectUrl = formData.get('redirectUrl') as string;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login Error:', error);
    // common.json에 에러 메시지 키를 추가하여 다국어 지원 가능
    // 예: return { message: 'invalidCredentials' };
    return { message: error.message };
  }

  // 이메일 인증 여부 확인 (필요시 주석 해제)
  /*
  if (!data.user?.email_confirmed_at) {
    await supabase.auth.signOut();
    return { message: 'Email not confirmed.' };
  }
  */

  // 캐시를 무효화하여 헤더 등 다른 컴포넌트가 최신 로그인 상태를 반영하도록 함
  revalidatePath('/', 'layout');
  
  // 리디렉션 URL이 있으면 해당 경로로, 없으면 홈페이지로 이동
  redirect(redirectUrl || `/${locale}`);
}