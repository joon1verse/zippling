// app/sitemap.ts (수정된 버전)
import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트는 한 번만 생성합니다.
// 환경변수가 Vercel에 올바르게 설정되었는지 확인하세요.
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SITE_URL = process.env.SITE_URL || 'https://zippling.net';
const LOCALES = ['en', 'ko', 'ja'] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ─── 1. 정적 페이지 경로 정의 ───────────────────────────
  // 루트 경로는 ''로 표현합니다.
  const staticPaths = [
    '', 'about', 'contact',
    'hot-deal', 'hot-deal/write',
    'login', 'signup', 'signup/success',
    'vancouver', 'vancouver/community',
    'vancouver/community/write', 'vancouver/room',
  ];

  const staticUrls = staticPaths.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: path === '' ? `${SITE_URL}/${locale}` : `${SITE_URL}/${locale}/${path}`,
      lastModified: new Date(),
    }))
  );
  
  // ─── 2. 동적 페이지 경로 데이터 가져오기 ──────────────────
  const { data: hotDeals } = await supabase
    .from('hot_deal_posts')
    .select('id, created_at');

  const { data: comms } = await supabase
    .from('vancouver_community')
    .select('id, created_at');

  // ─── 3. 동적 페이지 URL 생성 ───────────────────────────
  const hotDealUrls = hotDeals?.flatMap((item) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}/hot-deal/${item.id}`,
      lastModified: new Date(item.created_at),
    }))
  ) ?? []; // 데이터가 null일 경우 빈 배열 반환

  const communityUrls = comms?.flatMap((item) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}/vancouver/community/${item.id}`,
      lastModified: new Date(item.created_at),
    }))
  ) ?? []; // 데이터가 null일 경우 빈 배열 반환

  // ─── 4. 모든 URL을 하나로 합쳐서 반환 ──────────────────
  return [
    ...staticUrls,
    ...hotDealUrls,
    ...communityUrls,
  ];
}