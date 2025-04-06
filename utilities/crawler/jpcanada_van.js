// 📄 jpcanada_van.js — JPCanada Vancouver 크롤러 (서버리스 Cron Job 버전)

import axios from 'axios';
import { load } from 'cheerio';
import { getSourceInfo } from '../sourceMap.js';
import { uploadToSupabase } from '../supabaseUploader.js';

// (jpcanada-1) 대상 URL
const TARGET_URL = 'https://bbs.jpcanada.com/listing.php?bbs=3';

// (jpcanada-2) 타임스탬프 생성 함수
const getTimestamp = () => {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
};

// (jpcanada-3) 크롤링 메인 함수
async function crawlJPCanadaVan() {
  const timestamp = getTimestamp();
  const outputFileName = `jpcanada_van_${timestamp}.json`;

  try {
    const { data: html } = await axios.get(TARGET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
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
      const postedAt = dateMatch ? new Date(dateMatch[0].replace(' ', 'T')).toISOString() : null;

      const lowerTitle = title.toLowerCase();
      const maleKeywords = ['남성', '남자', '男性', 'man', 'male', 'boy'];
      const femaleKeywords = ['여성', '여자', '女性', 'woman', 'female', 'girl'];

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

    // ✅ Supabase 직접 업로드
    await uploadToSupabase(
      'zippling-data',
      `rawdata/vancouver/${outputFileName}`,
      jsonData
    );

    console.log(`✅ 크롤링 데이터 ${rawPosts.length}개 Supabase 직접 업로드 완료`);
  } catch (err) {
    console.error('❌ 크롤링 중 오류 발생:', err.message);
  }
}

// ✅ Cron Job 실행을 위한 직접 실행
crawlJPCanadaVan();
