/*
================================================================================
  1. 서버 액션 파일 (신규 생성)
  파일 경로: app/[locale]/hot-deal/[id]/actions.ts
  (이 파일을 새로 생성해주세요.)
================================================================================
*/
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@server/supabaseServerClient';

// 게시글 삭제 액션
export async function deletePostAction(postId: number, locale: string) {
  const supabase = createServerSupabase();
  const { error } = await supabase.from('hot_deal_posts').delete().eq('id', postId);

  if (error) {
    console.error('Delete Post Error:', error);
    return { success: false, error: error.message };
  }

  // 성공 시 목록 페이지로 리디렉션
  revalidatePath(`/${locale}/hot-deal`);
  redirect(`/${locale}/hot-deal`);
}

// 댓글 삭제 액션
export async function deleteCommentAction(commentId: number, locale: string, postId: number) {
  const supabase = createServerSupabase();
  const { error } = await supabase.from('hot_deal_comments').delete().eq('id', commentId);

  if (error) {
    console.error('Delete Comment Error:', error);
    return { success: false, error: error.message };
  }

  // 성공 시 상세 페이지 경로를 revalidate하여 댓글 목록 갱신
  revalidatePath(`/${locale}/hot-deal/${postId}`);
  return { success: true };
}

// 댓글 추가 액션
export async function addCommentAction(formData: FormData) {
  const supabase = createServerSupabase();
  
  const content = formData.get('content') as string;
  const postId = Number(formData.get('postId'));
  const locale = formData.get('locale') as string;

  if (!content?.trim() || !postId) {
    return { success: false, error: 'Content is required.' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'User not authenticated.' };
  }
  
  const { data: profile } = await supabase.from('user_profiles').select('user_nickname').eq('id', user.id).single();

  const { error } = await supabase.from('hot_deal_comments').insert({
    content,
    post_id: postId,
    user_id: user.id,
    user_nickname: profile?.user_nickname || 'Anonymous',
  });

  if (error) {
    console.error('Add Comment Error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/${locale}/hot-deal/${postId}`);
  return { success: true };
}

// 추천/비추천 액션
export async function handleVoteAction(postId: number, voteType: 'up' | 'down', locale: string) {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Login is required to vote.' };
    }

    const { data, error } = await supabase.rpc('handle_hotdeal_vote', {
        post_id_input: postId,
        vote_type_input: voteType
    });

    if (error) {
        console.error('Vote Error:', error);
        return { success: false, error: error.message };
    }
    
    revalidatePath(`/${locale}/hot-deal/${postId}`);
    return { success: true, data };
}