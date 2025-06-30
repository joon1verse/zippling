// app/api/check-email/route.ts

import { NextResponse } from 'next/server';
// 기존에 만들어 둔 관리자 클라이언트 생성 함수를 사용합니다.
import { getSupabaseAdmin } from '@server/supabaseClient';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    // 관리자 권한으로 user_profiles 테이블 조회
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('email')
      .eq('email', email)
      .single();

    // 결과가 없다는 에러(PGRST116)는 정상적인 상황이므로 무시합니다.
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    // 데이터가 존재하면(data is not null), 이메일이 사용 중이라는 의미입니다.
    return NextResponse.json({ isTaken: !!data });

  } catch (error: any) {
    console.error('Email check API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
