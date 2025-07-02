// app/sitemap.ts
import type { MetadataRoute } from 'next';

const SITE_URL = process.env.SITE_URL ?? 'https://zippling.net';
const LOCALES = ['en', 'ko', 'ja'] as const;

// 1️⃣ 정적 페이지 경로
const STATIC_PATHS = [
  '',                       // /en, /ko, /ja
  'about',
  'contact',
  'hot-deal',
  'hot-deal/write',
  'login',
  'signup',
  'signup/success',
  'vancouver',
  'vancouver/community',
  'vancouver/community/write',
  'vancouver/room',
] as const;

// 2️⃣ 동적 ID 리스트를 가져오는 헬퍼
async function fetchIds(endpoint: string) {
  const res = await fetch(`${SITE_URL}/api/${endpoint}/ids`, {
    // 빌드 타임에만 실행되도록; 재빌드 전까지 캐시
    next: { revalidate: 60 },
  });
  // [{ id: '123', updatedAt: '2025-07-01T12:34:56Z' }, …]
  return res.json() as Promise<{ id: string; updatedAt: string }[]>;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [];

  // ─── 정적 URL ─────────────────────────────────────────────────
  urls.push({ url: SITE_URL, lastModified: new Date() });
  LOCALES.forEach((locale) => {
    STATIC_PATHS.forEach((path) => {
      const loc =
        path === ''
          ? `${SITE_URL}/${locale}`
          : `${SITE_URL}/${locale}/${path}`;
      urls.push({ url: loc, lastModified: new Date() });
    });
  });

  // ─── 동적 hot-deal 포스트 ───────────────────────────────────────
  const hotDeals = await fetchIds('hot-deal');
  LOCALES.forEach((locale) => {
    hotDeals.forEach((post) => {
      urls.push({
        url: `${SITE_URL}/${locale}/hot-deal/${post.id}`,
        lastModified: new Date(post.updatedAt),
      });
    });
  });

  // ─── 동적 vancouver/community 포스트 ──────────────────────────
  const comms = await fetchIds('vancouver/community');
  LOCALES.forEach((locale) => {
    comms.forEach((post) => {
      urls.push({
        url: `${SITE_URL}/${locale}/vancouver/community/${post.id}`,
        lastModified: new Date(post.updatedAt),
      });
    });
  });

  return urls;
}
