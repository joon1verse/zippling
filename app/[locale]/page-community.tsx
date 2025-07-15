// app/[locale]/page-community.tsx

import { createServerSupabase } from '@server/supabaseServerClient';
import CommunitySectionClient from './page-communitysection'; // [수정] 파일명 변경에 따라 import 경로 수정

export default async function CommunitySection() {
  const supabase = createServerSupabase();
  
  // 서버에서 데이터 로딩
  const [
    { data: dailyVisitors },
    { data: accumulatedMetrics },
    { data: testimonials }
  ] = await Promise.all([
    supabase.from('daily_visitors').select('*').order('date', { ascending: false }).limit(7),
    supabase.from('daily_visitors_acc').select('metric_key, metric_value'),
    supabase.from('main_review').select(`*, user_profiles (user_nickname, nationality, avatar_url)`).eq('is_featured', true).limit(5)
  ]);

  // 필요한 데이터만 가공
  const totalUsers = accumulatedMetrics?.find(m => m.metric_key === 'total_users')?.metric_value || 0;
  const totalVisitors = accumulatedMetrics?.find(m => m.metric_key === 'total_visitors')?.metric_value || 0;
  const currentTestimonial = testimonials?.[0];

  return (
    // [수정] 컴포넌트명 변경
    <CommunitySectionClient
      dailyVisitors={dailyVisitors}
      totalUsers={totalUsers}
      totalVisitors={totalVisitors}
      currentTestimonial={currentTestimonial}
    />
  );
}