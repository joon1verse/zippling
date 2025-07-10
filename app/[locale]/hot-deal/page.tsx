/*
================================================================================
  1. 메인 페이지 (수정)
  파일 경로: app/[locale]/hot-deal/page.tsx
  (이 파일의 내용을 아래 코드로 교체해주세요.)
================================================================================
*/
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createServerSupabase } from '@server/supabaseServerClient';
import { Megaphone, Pencil } from 'lucide-react';
import HotDealList from './hot-deal-list.client'; // 신규 클라이언트 컴포넌트
import Link from 'next/link';

const POSTS_PER_PAGE = 10;

// SEO 메타데이터 생성
export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'HotDealPage.meta' });
  const og = await getTranslations({ locale, namespace: 'HotDealPage.meta.openGraph' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: og('title'),
      description: og('description'),
      images: [og('imageUrl')],
    },
  };
}

// Hot Deal 페이지 (서버 컴포넌트)
export default async function HotDealPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const t = await getTranslations('HotDealPage');
  const supabase = createServerSupabase();

  const currentPage = Number(searchParams?.['page'] || 1);
  const from = (currentPage - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  // 서버에서 데이터 동시 조회
  const [postsResponse, countResponse] = await Promise.all([
    supabase
      .from('hot_deal_posts')
      .select('id, title, price, currency_type, thumbnail_url, created_at, user_nickname, is_notice')
      .order('is_notice', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to),
    supabase
      .from('hot_deal_posts')
      .select('*', { count: 'exact', head: true }),
  ]);

  const { data: posts, error: postsError } = postsResponse;
  const { count: totalPosts, error: countError } = countResponse;

  if (postsError || countError) {
    // 실제 프로덕션에서는 에러 로깅 서비스(Sentry 등)를 사용하는 것이 좋습니다.
    console.error('Data fetching error:', postsError || countError);
  }

  const totalPages = Math.ceil((totalPosts || 0) / POSTS_PER_PAGE);

  return (
    <main className="relative pt-6 px-2 w-full max-w-screen-lg mx-auto min-h-screen pb-24">
      {/* 페이지 헤더 (서버에서 렌더링) */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight">{t('pageTitle')}</h1>
          <span className="text-2xl">🔥</span>
        </div>
        <div className="flex items-center justify-between gap-x-4 mt-2">
          <p className="text-sm text-gray-500 min-w-0">{t('pageSubtitle')}</p>
        </div>
      </div>

      {/* 클라이언트 컴포넌트에 데이터 전달 */}
      <HotDealList
        initialPosts={posts || []}
        totalPages={totalPages}
        currentPage={currentPage}
        locale={locale}
        translations={{
          loading: t('loading'),
          noDealsYet: t('noDealsYet'),
          anonymous: t('anonymous'),
        }}
      />
      
      {/* 글쓰기 버튼 (서버 컴포넌트에서 렌더링, Link로 즉시 이동) */}
      <Link
        href={`/${locale}/hot-deal/write`}
        className="fixed bottom-8 right-8 flex items-center justify-center w-14 h-14 bg-teal-500 text-white rounded-full shadow-lg hover:bg-teal-600 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        aria-label={t('write.writeHotDeal')}
      >
        <Pencil size={24} />
      </Link>
    </main>
  );
}