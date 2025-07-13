import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createCacheFirstSupabaseServer } from '@server/supabaseCacheServer';
import CommunityInteractions from './community-interactions.client';
import DOMPurify from 'isomorphic-dompurify';
import type { Metadata } from 'next';

type Props = {
  params: { id: string; locale: string };
};

// SEO를 위한 동적 메타데이터 생성
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createCacheFirstSupabaseServer();
  const { data: post } = await supabase.from('vancouver_community').select('title, content').eq('id', Number(params.id)).single();
  const t = await getTranslations({ locale: params.locale, namespace: 'CommunityPage.meta' });

  if (!post) {
    return { title: 'Post Not Found' };
  }
  
  const plainContent = post.content?.replace(/<[^>]*>?/gm, '').slice(0, 150) || '';

  return {
    title: `${post.title} | ${t('title')}`,
    description: plainContent,
  };
}

// 페이지 컴포넌트
export default async function CommunityDetailPage({ params: { id, locale } }: Props) {
  const supabase = createCacheFirstSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  const postQuery = supabase.from('vancouver_community').select('*').eq('id', Number(id)).single();
  const commentsQuery = supabase.from('vancouver_community_comments').select('*').eq('post_id', Number(id)).order('created_at', { ascending: true });
  
  let userVoteQuery = user 
    ? supabase.from('vancouver_community_votes').select('vote_type').eq('post_id', Number(id)).eq('user_id', user.id).maybeSingle()
    : Promise.resolve({ data: null });

  const [postResult, commentsResult, userVoteResult] = await Promise.all([postQuery, commentsQuery, userVoteQuery]);

  const { data: post, error: postError } = postResult;
  if (postError || !post) {
    notFound();
  }

  const initialComments = commentsResult.data || [];
  const initialUserVote = userVoteResult?.data?.vote_type as 'up' | 'down' | null;
  const safeContent = DOMPurify.sanitize(post.content || '');

  return (
    <CommunityInteractions
      post={post}
      safeContent={safeContent}
      initialComments={initialComments}
      currentUser={user}
      initialUserVote={initialUserVote}
      locale={locale}
    />
  );
}