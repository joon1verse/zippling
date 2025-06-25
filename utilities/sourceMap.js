// 📄 sourceMap.js — 크롤링 출처 매핑 유틸

export const SOURCE_MAP = [
    {
      tag: 'vancouver',
      urlPattern: 'ourvancouver',
      source: 'UvanU 우밴유',
    },
    {
      tag: 'vancouver',
      urlPattern: 'vancouver.craigslist',
      source: 'Craigslist',
    },
    {
      tag: 'vancouver',
      urlPattern: 'jpcanada.com',
      source: 'JP Canada',
    },
    // ✅ 필요 시 확장 가능
  ];
  
  // 🔎 URL을 기반으로 tag + source 자동 매핑
  export function getSourceInfo(url) {
    for (const entry of SOURCE_MAP) {
      if (url.includes(entry.urlPattern)) {
        return {
          tag: entry.tag,
          source: entry.source,
        };
      }
    }
    return {
      tag: 'unknown',
      source: 'Unknown Source',
    };
  }
  