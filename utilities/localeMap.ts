// /utilities/localeMap.ts
// [ESM] 경로/도메인 유틸 - 다국어 canonical/hreflang 전용

// 실제 URL 슬러그 (확정: en, ko, ja)
export const routeLocales = ['en', 'ko', 'ja'] as const;

// hreflang 매핑 (라우트 ↔ BCP47)
export const hreflangByRoute: Record<string, string> = {
  en: 'en-CA',
  ko: 'ko-KR',
  ja: 'ja-JP',
};

// [수정 포인트] 환경변수 읽기: NEXT_PUBLIC_SITE_URL 우선, 없으면 SITE_URL, 마지막 기본값
const RAW_SITE =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  'https://zippling.net';

// 끝 슬래시 제거
export const siteUrl = RAW_SITE.replace(/\/$/, '');

// 선행 슬래시 보정
const withSlash = (p: string) => (p ? (p.startsWith('/') ? p : `/${p}`) : '');

// 절대 URL 판별
const isAbs = (u: string) => /^https?:\/\//i.test(u);

// [신규] 절대 URL 보정: 이미 절대면 그대로, 아니면 siteUrl 붙임
export function toAbsolute(u: string) {
  // [수정지점] OG 이미지/URL 이중 도메인 방지
  return isAbs(u) ? u : `${siteUrl}${withSlash(u)}`;
}

export function getCanonical(routeLocale: string, path: string) {
  const p = withSlash(path || '');
  return p === '/' ? `${siteUrl}/${routeLocale}` : `${siteUrl}/${routeLocale}${p}`;
}

export function getAlternateLanguages(path: string) {
  const p = withSlash(path || '');
  const links: Record<string, string> = {
    'en-CA': `${siteUrl}/en${p}`,
    'ko-KR': `${siteUrl}/ko${p}`,
    'ja-JP': `${siteUrl}/ja${p}`,
  };
  // 기본 언어를 en으로 가정
  links['x-default'] = `${siteUrl}/en${p}`; // [추가] x-default
  return links;
}