// app/[locale]/page-community.tsx

import { getTranslations } from 'next-intl/server';
import { createServerSupabase } from '@server/supabaseServerClient';
import CommunitySectionClient from './page-communitysection';

export default async function CommunitySection() {
  const t = await getTranslations('MainPage');
  const supabase = createServerSupabase();
  
  const [
    { data: dailyVisitors },
    { data: accumulatedMetrics },
    { data: testimonials }
  ] = await Promise.all([
    supabase.from('daily_visitors').select('*').order('date', { ascending: false }).limit(7),
    supabase.from('daily_visitors_acc').select('metric_key, metric_value'),
    supabase.from('main_review').select(`*, user_profiles (user_nickname, nationality, avatar_url)`).eq('is_featured', true).limit(5)
  ]);

  const totalUsers = accumulatedMetrics?.find(m => m.metric_key === 'total_users')?.metric_value || 0;
  const latestDailyVisitors = dailyVisitors?.[0]?.visitors || 0;
  const currentTestimonial = testimonials?.[0];

  // [수정 1] 번역 파일에서 그래프 라벨을 불러옵니다.
  const cumulativeVisitorLabel = t('cumulativeVisitorLabel');

  let cumulativeTotal = 0;
  const cumulativeVisitorData = (dailyVisitors || [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(day => {
      cumulativeTotal += day.visitors;
      // [수정 2] 하드코딩된 한글 대신, 번역된 라벨을 데이터의 '키'로 사용합니다.
      return { date: day.date, [cumulativeVisitorLabel]: cumulativeTotal };
    });

  const communityTranslations = {
    title: t('communityTitle'),
    descriptionPart1: t('communityDescriptionPart1'),
    highlightText: t('serviceHighlightText'),
    descriptionPart2: t('communityDescriptionPart2'),
    totalUsersCardTitle: t('totalUsersCardTitle'),
    todayVisitorsCardTitle: t('todayVisitorsCardTitle'),
    cumulativeGraphTitle: t('cumulativeGraphTitle'),
    noVisitorDataText: t('noVisitorDataText'),
    testimonialCardTitle: t('testimonialCardTitle'),
    testimonialCardDescription: t.markup('testimonialCardDescription'),
  };

  return (
    <CommunitySectionClient
      translations={communityTranslations}
      cumulativeVisitorData={cumulativeVisitorData}
      totalUsers={totalUsers}
      latestDailyVisitors={latestDailyVisitors}
      currentTestimonial={currentTestimonial}
      // [수정 3] 번역된 라벨(키 이름)을 클라이언트 컴포넌트로 전달합니다.
      graphLabel={cumulativeVisitorLabel}
    />
  );
}