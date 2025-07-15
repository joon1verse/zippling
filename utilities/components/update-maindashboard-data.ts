// components/update-maindashboard-data.ts

'use server';

import { createServerSupabase } from '@server/supabaseServerClient'; // 경로는 실제 위치에 맞게 조정
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function updateMaindashData() {
  const supabase = createServerSupabase();
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // --- 작업 1: 총 가입자 수 가져와서 저장 ---
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    if (userError) throw new Error(`Error fetching user count: ${userError.message}`);
    
    const { error: upsertUserError } = await supabase.from('daily_visitors_acc').upsert({ 
      metric_key: 'total_users', 
      metric_value: users.length 
    }, { onConflict: 'metric_key' });
    if (upsertUserError) throw new Error(`Error upserting total users: ${upsertUserError.message}`);


    // --- 작업 2: 총 누적 방문자 수 업데이트 ---
    // 우리 DB에 기록된 모든 일일 방문자 수를 합산합니다.
    const { data: allVisitors, error: visitorError } = await supabase
      .from('daily_visitors')
      .select('visitors');

    if (visitorError) throw new Error(`Error fetching daily visitors: ${visitorError.message}`);

    const totalVisitors = allVisitors.reduce((sum, row) => sum + (row.visitors || 0), 0);

    const { error: upsertVisitorError } = await supabase.from('daily_visitors_acc').upsert({
      metric_key: 'total_visitors',
      metric_value: totalVisitors
    }, { onConflict: 'metric_key' });
    if (upsertVisitorError) throw new Error(`Error upserting total visitors: ${upsertVisitorError.message}`);

    
    revalidatePath('/');
    console.log(`✅ Community data successfully updated. Total Users: ${users.length}, Total Visitors: ${totalVisitors}`);
    return { success: true, totalUsers: users.length, totalVisitors };

  } catch (error) {
    console.error('❌ Error in updateMaindashData:', error);
    return { error: (error as Error).message };
  }
}