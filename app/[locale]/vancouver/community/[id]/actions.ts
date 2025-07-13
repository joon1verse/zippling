'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createCacheFirstSupabaseServer } from '@server/supabaseCacheServer';

// 게시글 삭제
export async function deletePostAction(postId: number, locale: string) {
  const supabase = createCacheFirstSupabaseServer();
  const { error } = await supabase.from('vancouver_community').delete().eq('id', postId);
  if (error) return { error: error.message };
  
  revalidatePath(`/${locale}/vancouver/community`);
  redirect(`/${locale}/vancouver/community`);
}

// 댓글 추가
export async function addCommentAction(formData: FormData) {
  const supabase = createCacheFirstSupabaseServer();
  const postId = Number(formData.get('postId'));
  const content = formData.get('content') as string;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'User not authenticated.' };
  
  const { data: profile } = await supabase.from('user_profiles').select('user_nickname').eq('id', user.id).single();

  const { error } = await supabase.from('vancouver_community_comments').insert({
    content,
    post_id: postId,
    user_id: user.id,
    user_nickname: profile?.user_nickname || 'Anonymous',
  });

  if (error) return { error: error.message };
  revalidatePath(`/vancouver/community/${postId}`);
  return { success: true };
}

// 댓글 삭제
export async function deleteCommentAction(commentId: number, postId: number) {
  const supabase = createCacheFirstSupabaseServer();
  const { error } = await supabase.from('vancouver_community_comments').delete().eq('id', commentId);
  
  if (error) return { error: error.message };
  revalidatePath(`/vancouver/community/${postId}`);
  return { success: true };
}

// 추천/비추천
export async function handleVoteAction(postId: number, voteType: 'up' | 'down') {
  const supabase = createCacheFirstSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Login required' };

  const { data, error } = await supabase.rpc('handle_vote', {
    post_id_input: postId,
    vote_type_input: voteType
  });

  if (error) return { error: error.message };
  revalidatePath(`/vancouver/community/${postId}`);
  return { success: true, data };
}