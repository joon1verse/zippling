// runAllCrawlers.js — 세 크롤러를 순차 실행, 정확한 시간 측정

// 1) 3개 크롤러에서 export한 runCraigslist, runJpcanada, runUvanu를 가져온다
import { runCraigslist } from './craigslist.js';
import { runJPcanada } from './jpcanada_van.js';
import { runUvanU } from './uvanu.js';

// 2) 스크립트 최상단에서 시간 측정 시작
const start = Date.now();
console.log('🟢 [START] All crawlers started...');

try {
  // 3) 크롤러를 순차로 호출하고 기다린다 (비동기 처리 끝날 때까지)
  await runCraigslist();   // craigslist.js 내부에서 crawlCraigslist() 실행
  await runJPcanada();     // jpcanada_van.js 내부에서 crawlJPCanada() 실행
  await runUvanU();        // uvanu.js 내부에서 crawlUvanu() 실행

} catch (error) {
  console.error('❌ [ERROR] Crawler failure:', error);
}

// 4) 모든 크롤러가 끝난 후 시간 측정 완료
const end = Date.now();
const durationSec = ((end - start) / 1000).toFixed(2);
const durationMin = ((end - start) / 60000).toFixed(2);

console.log(`✅ [DONE] All crawlers finished in ${durationSec} seconds (${durationMin} minutes).`);
