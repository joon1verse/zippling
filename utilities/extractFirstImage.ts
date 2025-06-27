// utils/extractFirstImage.ts
export function extractFirstImageSrc(html: string): string | null {
  // DOMParser (브라우저 환경) 를 이용한 안전한 파싱
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const img = doc.querySelector('img');
  return img?.getAttribute('src') || null;
}