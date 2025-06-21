import axios from 'axios';
import { load } from 'cheerio';
import { getSourceInfo } from '../sourceMap.js';
import { uploadToSupabase } from '../serverutil/supabaseUploader.js';
// [수정: date-fns-tz에서 toDate만 import]
import { toDate } from 'date-fns-tz'; // ✅

const TARGET_URL = 'https://bbs.jpcanada.com/listing.php?bbs=3';

const getTimestamp = () => {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
};

async function crawlJPcanadaVan() {
  const timestamp = getTimestamp();
  const outputFileName = `jpcanada_van_${timestamp}.json`;

  try {
    const { data: html } = await axios.get(TARGET_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });

    const $ = load(html);
    const rawPosts = [];

    $('div.divTable.bbsListTable > div.divTableRow').each((_, el) => {
      if (rawPosts.length >= 20) return false;

      const cell = $(el).find('div.divTableCell.col4');
      const anchor = cell.find('a[href^="topics.php?bbs=3"]');
      if (anchor.length === 0) return;

      const title = anchor.text().trim();
      const relativeLink = anchor.attr('href');
      const link = new URL(relativeLink, TARGET_URL).href;

      const postDetail = cell.find('span.post-detail').html();
      const dateMatch = postDetail?.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
      // [수정: 밴쿠버 현지 시각을 UTC로 변환]
      let postedAt = null;
      if (dateMatch) {
        // toDate(로컬시각문자열, { timeZone }) → UTC Date 객체 반환, .toISOString()으로 변환
        postedAt = toDate(dateMatch[0], { timeZone: 'America/Vancouver' }).toISOString();
      }

      const lowerTitle = title.toLowerCase();
      const maleKeywords = ['남성', '남자', '男性', 'man', 'male', 'boy', 'boys'];
      const femaleKeywords = ['여성', '여자', '女性', 'woman', 'female', 'girl', 'girls'];

      const hasMale = maleKeywords.some(keyword => new RegExp(`\\b${keyword}\\b`, 'i').test(lowerTitle));
      const hasFemale = femaleKeywords.some(keyword => new RegExp(`\\b${keyword}\\b`, 'i').test(lowerTitle));

      const tags = [];
      if (hasMale && !hasFemale) tags.push('male');
      else if (hasFemale && !hasMale) tags.push('female');
      else tags.push('no-gender');

      tags.push('japan');

      const { source } = getSourceInfo(link);
      rawPosts.push({
        title,
        link,
        tag: tags,
        source: source || 'JPCanada',
        postedAt,
        crawledAt: new Date().toISOString(),
      });
    });

    const jsonData = JSON.stringify(rawPosts, null, 2);
    await uploadToSupabase('zippling-data', `rawdata/vancouver/${outputFileName}`, jsonData);
    console.log(`✅ 크롤링 데이터 ${rawPosts.length}개 Supabase 직접 업로드 완료`);
  } catch (err) {
    console.error('❌ 크롤링 중 오류 발생:', err.message);
  }
}

export async function runJPcanada() {
  const start = Date.now();
  console.log('🟢 [JPCanada] 시작');

  await crawlJPcanadaVan();

  const end = Date.now();
  const durationSec = ((end - start) / 1000).toFixed(2);
  console.log(`✅ [JPCanada] 완료 — 실행 시간: ${durationSec}초`);
}
