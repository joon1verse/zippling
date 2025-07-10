/*
================================================================================
  1. 서버 액션 파일 (수정)
  파일 경로: app/[locale]/hot-deal/write/actions.ts
  (DOMParser 오류 해결을 위해 jsdom 라이브러리를 사용하도록 수정했습니다.)
================================================================================
*/
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@server/supabaseServerClient';
import { JSDOM } from 'jsdom'; // [수정] jsdom 라이브러리를 import 합니다.

// [수정] 서버 환경에서 안전하게 HTML을 파싱하여 첫 이미지 URL을 추출하는 함수
const extractFirstImageSrcOnServer = (html: string): string | null => {
  if (!html) return null;
  // JSDOM을 사용하여 서버에서 가상 DOM을 생성합니다.
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const img = doc.querySelector('img');
  return img ? img.getAttribute('src') : null;
};

// 게시글 생성 및 수정을 위한 서버 액션
export async function upsertPostAction(prevState: any, formData: FormData) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'Login is required.' };
  }
  
  const { data: profile } = await supabase.from('user_profiles').select('user_nickname, role').eq('id', user.id).single();
  if (!profile?.user_nickname) {
    return { message: 'Nickname is required.' };
  }

  // 폼 데이터 추출
  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const price = formData.get('price') as string;
  const currency_type = formData.get('currency_type') as string;
  const is_notice = formData.get('is_notice') === 'on';
  const locale = formData.get('locale') as string;

  // 유효성 검사
  if (!title.trim() || !content.trim() || !price || parseFloat(price) <= 0) {
    return { message: 'Title, content, and a valid price are required.' };
  }

  const payload = {
    title: title.trim(),
    content,
    price: parseFloat(price),
    currency_type,
    thumbnail_url: extractFirstImageSrcOnServer(content), // [수정] 서버용 이미지 추출 함수 사용
    user_id: user.id,
    user_nickname: profile.user_nickname,
    is_notice: profile.role === 'admin' ? is_notice : false,
  };

  let postId = id ? Number(id) : null;
  let error;

  if (postId) {
    // 수정 모드
    const { error: updateError } = await supabase.from('hot_deal_posts').update(payload).eq('id', postId);
    error = updateError;
  } else {
    // 생성 모드
    const { data, error: insertError } = await supabase.from('hot_deal_posts').insert(payload).select('id').single();
    error = insertError;
    if (data) {
      postId = data.id;
    }
  }

  if (error) {
    console.error('Upsert Post Error:', error);
    return { message: `Error: ${error.message}` };
  }

  if (!postId) {
    return { message: 'Failed to get post ID.' };
  }

  // 캐시 무효화 및 리디렉션
  revalidatePath(`/${locale}/hot-deal`);
  revalidatePath(`/${locale}/hot-deal/${postId}`);
  redirect(`/${locale}/hot-deal/${postId}`);
}