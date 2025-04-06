// 📄 uvanu.js — Daum Cafe - UvanU 크롤러 (서버리스 Cron Job 버전)

import axios from 'axios';
import { load } from 'cheerio';
import { getSourceInfo } from '../sourceMap.js';
import { uploadToSupabase } from '../supabaseUploader.js';

// (uvanu-1) 대상 URL
const TARGET_URL = 'https://m.cafe.daum.net/ourvancouver/4Nd0';

// (uvanu-2) 타임스탬프 생성 함수
const getTimestamp = () => {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
};

// (uvanu-3) 크롤링 메인 함수
async function crawlUvanU() {
  const timestamp = getTimestamp();
  const outputFileName = `uvanu_${timestamp}.json`;

  try {
    const { data: html } = await axios.get(TARGET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    const $ = load(html);
    const rawPosts = [];

    $('li').each((_, el) => {
      if (rawPosts.length >= 20) return false;

      const li = $(el);
      const liText = li.text();
      if (liText.includes('공지') || liText.includes('필독')) return;

      const title = li.find('.txt_detail').text().trim();
      const href = li.find('a').attr('href');
      const link = href ? 'https://m.cafe.daum.net' + href : null;

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

        tags.push('korea');

        const { source } = getSourceInfo(link);
        rawPosts.push({
          title,
          link,
          tag: tags,
          source,
          crawledAt: new Date().toISOString(),
        });
      }
    });

    const jsonData = JSON.stringify(rawPosts, null, 2);

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

// (uvanu-4) cron job 실행 시 직접 호출
crawlUvanU();
