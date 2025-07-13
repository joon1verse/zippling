// app/actions/auth.actions.ts
'use server';

import { createServerSupabase } from '@server/supabaseServerClient';
import { revalidatePath } from 'next/cache';

export async function logoutAction() {
  const supabase = createServerSupabase();
  await supabase.auth.signOut();
  // 레이아웃과 관련된 모든 페이지의 캐시를 무효화하여
  // router.refresh()가 최신 데이터를 가져오도록 보장합니다.
  revalidatePath('/', 'layout');
}