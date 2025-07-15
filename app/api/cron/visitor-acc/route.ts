// app/api/cron/update-data/route.ts

// [수정] tsconfig.json의 @components/ 별칭을 사용하여 import 경로를 수정합니다.
import { updateMaindashData } from '@components/update-maindashboard-data';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log("🤖 Cron Job: Starting main dashboard data update...");
    
    const result = await updateMaindashData();

    if (result.error) {
      console.error("❌ Cron Job failed:", result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    console.log("✅ Cron Job: Data update successful.");
    return NextResponse.json({ success: true, ...result });

  } catch (error) {
    console.error("💥 Cron Job uncaught error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}