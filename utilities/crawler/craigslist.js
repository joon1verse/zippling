// 📄 craigslist.js — Craigslist 크롤러 (서버리스 Cron Job 버전)

import axios from 'axios';
import { load } from 'cheerio';
import { getSourceInfo } from '../sourceMap.js';
import { uploadToSupabase } from '../serverutil/supabaseUploader.js';

// 대상 URL (Vancouver Room 리스트)
const TARGET_URL = 'https://vancouver.craigslist.org/search/vancouver-bc/roo?lat=49.2584&lon=-123.0338&search_distance=7';

// 타임스탬프 생성 함수
const getTimestamp = () => {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
};

// 크롤링 메인 함수
async function crawlCraigslist() {
  const timestamp = getTimestamp();
  const outputFileName = `craigslist_${timestamp}.json`;

  try {
    const { data: html } = await axios.get(TARGET_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });

    const $ = load(html);
    const rawPosts = [];

    $('li.cl-static-search-result').slice(0, 20).each((_, el) => {
      const li = $(el);
      const anchor = li.find('a');
      const title = anchor.find('.title').text().trim();
      const link = anchor.attr('href');
      const price = li.find('.price').first().text().trim();

      const rawTime = li.find('time.date').attr('datetime');
      const postedAt = rawTime ? new Date(rawTime).toISOString() : null;

      if (title && link) {
        const lowerTitle = title.toLowerCase();
        const maleKeywords = ['남성', '남자', '男性', 'man', 'male', 'boy'];
        const femaleKeywords = ['여성', '여자', '女性', 'woman', 'female', 'girl'];
        
        const hasMale = maleKeywords.some(keyword => new RegExp(`\\b${keyword}\\b`, 'i').test(lowerTitle));
        const hasFemale = femaleKeywords.some(keyword => new RegExp(`\\b${keyword}\\b`, 'i').test(lowerTitle));
        
        const tags = [];
        
        if (hasMale && !hasFemale) tags.push('male');
        else if (hasFemale && !hasMale) tags.push('female');
        else tags.push('no-gender');
        
        tags.push('canada');

        const { source } = getSourceInfo(link);
        rawPosts.push({
          title,
          link,
          price,
          tag: tags,
          source,
          postedAt,
          crawledAt: new Date().toISOString(),
        });
      }
    });

    const jsonData = JSON.stringify(rawPosts, null, 2);
  

    // ✅ Supabase에 JSON 데이터 직접 업로드
    await uploadToSupabase(
      'zippling-data',
      `rawdata/vancouver/${outputFileName}`,
      jsonData
    );

    console.log(`✅ 크롤링 데이터 ${rawPosts.length}개 Supabase 직접 업로드 완료`);

  } catch (err) {
    console.error('❌ 크롤링 중 오류 발생:', err);
  }
}

export async function runCraigslist() {
  const start = Date.now();
  console.log('🟢 [Craigslist] 시작');

  await crawlCraigslist(); // 기존 메인 함수 그대로 호출

  const end = Date.now();
  const durationSec = ((end - start) / 1000).toFixed(2);
  console.log(`✅ [Craigslist] 완료 — 실행 시간: ${durationSec}초`);
}