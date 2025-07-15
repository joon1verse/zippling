// app/api/track-visit/route.ts

import { createServerSupabase } from '@server/supabaseServerClient';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase();
  
  // 사용자의 IP 주소를 가져옵니다. Vercel 환경에서는 헤더를 통해 확인 가능합니다.
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
  const today = new Date().toISOString().split('T')[0];

  try {
    // 1. 오늘 날짜의 방문자 데이터가 있는지 확인합니다.
    let { data: todayData } = await supabase
      .from('daily_visitors')
      .select('visitors')
      .eq('date', today)
      .single();

    if (todayData) {
      // 2. 데이터가 있다면, 방문자 수를 1 증가시킵니다.
      await supabase
        .from('daily_visitors')
        .update({ visitors: todayData.visitors + 1 })
        .eq('date', today);
    } else {
      // 3. 데이터가 없다면, 오늘 날짜로 새로운 행을 만들고 방문자 수를 1로 설정합니다.
      await supabase
        .from('daily_visitors')
        .insert({ date: today, visitors: 1 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}