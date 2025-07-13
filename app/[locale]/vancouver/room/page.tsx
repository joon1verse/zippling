import { createCacheFirstSupabaseServer } from '@server/supabaseCacheServer';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import RoomListings from './room-listings.client';

const POSTS_PER_PAGE = 20;

type Props = {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'vancouver.RoomPage.meta' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function VancouverRoomPage({ params: { locale }, searchParams }: Props) {
  const supabase = createCacheFirstSupabaseServer();

  // [수정] searchParams 값을 안전하게 배열로 변환하는 헬퍼 함수
  const getArrayValues = (param: string | string[] | undefined): string[] => {
    if (Array.isArray(param)) return param;
    if (typeof param === 'string') return param.split(',');
    return [];
  };

  const page = Number(searchParams.page) || 1;
  const searchQuery = typeof searchParams.q === 'string' ? searchParams.q : '';
  const regions = getArrayValues(searchParams.regions);
  const genders = getArrayValues(searchParams.genders);

  const from = (page - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  let query = supabase.from('vancouver_roomlistings').select('*', { count: 'exact' });

  if (searchQuery) query = query.ilike('title', `%${searchQuery}%`);
  
  const allFilters = [...regions, ...genders];
  if (allFilters.length > 0) {
    query = query.contains('tag', allFilters);
  }

  const { data, error, count } = await query
    .order('event_time', { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching room listings:", error.message);
  }

  const initialListings = data || [];
  const totalPosts = count || 0;

  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single();
    isAdmin = profile?.role === 'admin';
  }

  return (
    <RoomListings
      initialListings={initialListings}
      totalPosts={totalPosts}
      isAdmin={isAdmin}
      locale={locale} // [수정] 누락되었던 locale prop 추가
    />
  );
}