// app/[locale]/vancouver/community/page.tsx

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createServerSupabase } from '@server/supabaseServerClient';
import CommunityList, { WriteButton } from './community-list.client'; // 클라이언트 컴포넌트 import

const POSTS_PER_PAGE = 15;

type Props = {
  params: { locale: string };
};

// SEO 메타데이터를 동적으로 생성합니다.
export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'vancouver' });
  return {
    title: t('CommunityPage.meta.title'),
    description: t('CommunityPage.meta.description'),
    openGraph: {
      title: t('CommunityPage.meta.title'),
      description: t('CommunityPage.meta.description'),
      images: [
        {
          url: 'https://zippling.net/og-image-vancouver-community.png', // 커뮤니티용 OG 이미지
          width: 1200,
          height: 630,
          alt: t('CommunityPage.meta.title'),
        },
      ],
    },
  };
}

// 페이지 컴포넌트 (서버 컴포넌트)
export default async function CommunityPage({ params: { locale } }: Props) {
  // 현재 요청의 locale을 설정하여 next-intl 경고를 방지합니다.
  setRequestLocale(locale);

  const t = await getTranslations('vancouver');
  const supabase = createServerSupabase();

  // 서버에서는 첫 페이지 데이터와 전체 게시글 수만 가져옵니다.
  // 1. 전체 게시글 수
  const { count: totalPosts, error: countError } = await supabase
    .from('vancouver_community')
    .select('*', { count: 'exact', head: true });

  // 2. 첫 페이지 게시글
  const { data: initialPosts, error: postsError } = await supabase
    .from("vancouver_community")
    .select("id, title, created_at, user_nickname, is_notice")
    .order("is_notice", { ascending: false })
    .order("created_at", { ascending: false })
    .range(0, POSTS_PER_PAGE - 1);

  if (countError || postsError) {
    console.error("Error fetching initial community data:", countError || postsError);
  }

  return (
    <main className="relative pt-6 px-2 w-full max-w-screen-lg mx-auto min-h-screen pb-24">
      <div className="mb-4">
        <div className="flex items-center gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight">{t('CommunityPage.pageTitle')}</h1>
          <span className="text-2xl">💬</span>
        </div>
        <p className="text-sm text-gray-500 min-w-0 mt-2">{t('CommunityPage.pageSubtitle')}</p>
      </div>

      {/* 클라이언트 컴포넌트에 초기 데이터와 번역 텍스트를 전달합니다. */}
      <CommunityList
        locale={locale}
        initialPosts={initialPosts || []}
        totalPosts={totalPosts || 0}
        postsPerPage={POSTS_PER_PAGE}
        anonymousText={t('CommunityPage.anonymous')}
        noPostsYetText={t('CommunityPage.noPostsYet')}
        loadingText={t('CommunityPage.loading')}
      />
      
      {/* 글쓰기 버튼은 별도의 클라이언트 컴포넌트로 렌더링합니다. */}
      <WriteButton locale={locale} />
    </main>
  );
}
