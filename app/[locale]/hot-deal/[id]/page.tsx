/*
================================================================================
  3. 메인 페이지 (수정)
  파일 경로: app/[locale]/hot-deal/[id]/page.tsx
  (이 파일의 내용을 아래 코드로 교체해주세요.)
================================================================================
*/
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createServerSupabase } from '@server/supabaseServerClient';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import PostInteractions from './post-interactions.client';
import type { Metadata } from 'next';
import DOMPurify from 'isomorphic-dompurify'; // [수정]

type Props = {
  params: { id: string; locale: string };
};

// SEO 메타데이터 생성
export async function generateMetadata({ params: { id, locale } }: Props): Promise<Metadata> {
  const supabase = createServerSupabase();
  const { data: post } = await supabase.from('hot_deal_posts').select('title, content').eq('id', id).single();

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const description = post.content?.substring(0, 150).replace(/<[^>]*>?/gm, '') + '...';

  return {
    title: `${post.title} | Zippling Hot Deals`,
    description: description,
    openGraph: {
      title: post.title,
      description: description,
      type: 'article',
    },
  };
}

// 통화 코드 변환 유틸리티
const getSafeCurrencyCode = (code: string | null): string => {
  if (!code) return 'CAD';
  const mapping: { [key: string]: string } = { 'CA$': 'CAD', 'US$': 'USD' };
  return mapping[code] || code;
};

// Hot Deal 상세 페이지 (서버 컴포넌트)
export default async function HotDealDetailPage({ params: { id, locale } }: Props) {
  const t = await getTranslations('HotDealPage.detail');
  const supabase = createServerSupabase();

  // 서버에서 데이터 동시 조회
  const { data: { user } } = await supabase.auth.getUser();
  
  const [postResponse, commentsResponse, voteResponse, profileResponse] = await Promise.all([
    supabase.from('hot_deal_posts').select('*').eq('id', id).single(),
    supabase.from('hot_deal_comments').select('*').eq('post_id', id).order('created_at', { ascending: true }),
    user ? supabase.from('hot_deal_votes').select('vote_type').eq('post_id', id).eq('user_id', user.id).single() : Promise.resolve({ data: null }),
    user ? supabase.from('user_profiles').select('role').eq('id', user.id).single() : Promise.resolve({ data: null })
  ]);

  const { data: post, error: postError } = postResponse;
  if (postError || !post) {
    notFound();
  }

  // [추가] 서버에서 HTML을 안전하게 정제합니다.
  const safeContent = DOMPurify.sanitize(post.content || '');

  const { data: comments } = commentsResponse;
  const { data: vote } = voteResponse;
  const { data: profile } = profileResponse;

  const isAuthor = post.user_id === user?.id;
  const isAdmin = profile?.role === 'admin';

  return (
    <main className="bg-gray-50 min-h-screen py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-screen-lg mx-auto">
        <div className="mb-4">
          <Link href={`/${locale}/hot-deal`} className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-1.5" />
            {t('backToList')}
          </Link>
        </div>
        
        {/* 정적 래퍼와 클라이언트 컴포넌트 */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* 서버에서 렌더링하는 정적 부분 */}
          <div className="p-6 sm:p-8">
            <h1 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">{post.title}</h1>
            {post.price != null && (
              <p className="text-xl font-bold text-teal-600 mb-4">
                {new Intl.NumberFormat(locale, {
                  style: 'currency',
                  currency: getSafeCurrencyCode(post.currency_type),
                  minimumFractionDigits: 2,
                }).format(post.price)}
              </p>
            )}
          </div>
          
          {/* 인터랙션을 담당하는 클라이언트 컴포넌트 */}
          <PostInteractions
            post={post}
            safeContent={safeContent} // [추가]
            initialComments={comments || []}
            currentUser={user}
            userVote={vote?.vote_type as 'up' | 'down' | null}
            isAuthor={isAuthor}
            isAdmin={isAdmin}
            locale={locale}
          />
        </div>
      </div>
    </main>
  );
}
