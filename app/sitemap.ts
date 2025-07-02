// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

// ➊ 환경변수에서 관리하세요 (Vercel의 환경변수 설정에 SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SITE_URL = process.env.SITE_URL ?? 'https://zippling.net';
const LOCALES = ['en', 'ko', 'ja'] as const;
const STATIC_PATHS = [
  '', 'about', 'contact',
  'hot-deal','hot-deal/write',
  'login','signup','signup/success',
  'vancouver','vancouver/community',
  'vancouver/community/write','vancouver/room',
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [];

  // ─── 정적 페이지들 ────────────────────────────────────
  urls.push({ url: SITE_URL, lastModified: new Date() });
  LOCALES.forEach(locale => {
    STATIC_PATHS.forEach(path => {
      const loc = path === '' 
        ? `${SITE_URL}/${locale}` 
        : `${SITE_URL}/${locale}/${path}`;
      urls.push({ url: loc, lastModified: new Date() });
    });
  });

  // ─── 동적 hot-deal ID들 ───────────────────────────────
  const { data: hotDeals, error: hdError } = await supabase
    .from('hot_deal_posts')               // 실제 테이블명으로 수정
    .select('id, created_at');
  if (hdError) throw hdError;
  LOCALES.forEach(locale => {
    hotDeals!.forEach(item => {
      urls.push({
        url: `${SITE_URL}/${locale}/hot-deal/${item.id}`,
        lastModified: new Date(item.created_at),
      });
    });
  });

  // ─── 동적 community ID들 ──────────────────────────────
  const { data: comms, error: commError } = await supabase
    .from('vancouver_community')    // 실제 테이블명으로 수정
    .select('id, created_at');
  if (commError) throw commError;
  LOCALES.forEach(locale => {
    comms!.forEach(item => {
      urls.push({
        url: `${SITE_URL}/${locale}/vancouver/community/${item.id}`,
        lastModified: new Date(item.created_at),
      });
    });
  });

  return urls;
}
