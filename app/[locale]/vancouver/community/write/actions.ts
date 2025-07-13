// app/[locale]/vancouver/community/write/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@server/supabaseServerClient';
import { getLocale } from 'next-intl/server';
import { z } from 'zod';
// [수정] jsdom 라이브러리를 import 합니다. 서버에서 HTML을 파싱하기 위함입니다.
import { JSDOM } from 'jsdom';

// [추가] 서버 환경에서 안전하게 HTML을 파싱하여 첫 이미지 URL을 추출하는 함수
const extractFirstImageSrcOnServer = (html: string): string | null => {
  if (!html) return null;
  // JSDOM을 사용하여 서버에서 가상 DOM을 생성합니다.
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const img = doc.querySelector('img');
  return img ? img.getAttribute('src') : null;
};

// 폼 데이터 유효성 검사를 위한 스키마 정의
const postSchema = z.object({
  postId: z.string().optional(),
  title: z.string().min(1, 'Title is required.'),
  content: z.string().min(1, 'Content is required.'),
  isNotice: z.string().optional(), 
});

export type FormState = {
  message: string;
  errors?: {
    title?: string[];
    content?: string[];
    general?: string[];
  };
};

// 게시글 저장/수정 서버 액션
export async function saveCommunityPost(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = createServerSupabase();
  const locale = await getLocale();

  // 1. 사용자 인증 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { message: 'error', errors: { general: ['Login is required.'] } };
  }
  const { data: profile } = await supabase.from('user_profiles').select('user_nickname, role').eq('id', user.id).single();
  if (!profile?.user_nickname) {
    return { message: 'error', errors: { general: ['A nickname is required. Please set it in your profile.'] } };
  }

  // 2. 폼 데이터 파싱 및 유효성 검사
  const validatedFields = postSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return {
      message: 'error',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const { postId, title, content, isNotice } = validatedFields.data;
  const isEdit = Boolean(postId);

  // 3. 데이터베이스에 저장할 페이로드 생성
  const payload = {
    title: title.trim(),
    content,
    // [수정] 서버용 이미지 추출 함수를 사용합니다.
    thumbnail_url: extractFirstImageSrcOnServer(content) || null,
    user_id: user.id,
    user_nickname: profile.user_nickname,
    is_notice: profile.role === 'admin' ? isNotice === 'on' : false,
  };

  // 4. 데이터베이스 작업 (생성 또는 수정)
  let dbError;
  let newPostId = postId ? Number(postId) : null;

  if (isEdit) {
    const { error } = await supabase.from('vancouver_community').update(payload).eq('id', Number(postId));
    dbError = error;
  } else {
    const { data, error } = await supabase.from('vancouver_community').insert(payload).select('id').single();
    dbError = error;
    if (data) {
        newPostId = data.id;
    }
  }

  if (dbError) {
    return { message: 'error', errors: { general: [dbError.message] } };
  }

  // 5. 성공 시 캐시 무효화 및 리디렉션
  revalidatePath(`/${locale}/vancouver/community`);
  if (newPostId) {
    redirect(`/${locale}/vancouver/community/${newPostId}`);
  } else {
    redirect(`/${locale}/vancouver/community`);
  }
}
