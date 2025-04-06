// 📄 jpcanada_van.js — JPCanada Vancouver 크롤러 (최종버전)
import axios from 'axios';
import { load } from 'cheerio';
import fs from 'fs';
import path from 'path';
import { getSourceInfo } from '../sourceMap.js';
import { runWithRandomInterval } from '../scheduler.js';

// (jpcanada-1) 대상 URL
const TARGET_URL = 'https://bbs.jpcanada.com/listing.php?bbs=3';

// (jpcanada-2) 타임스탬프 포맷 함수
const getTimestamp = () => {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
};

// (jpcanada-3) 크롤링 메인 함수
async function crawlJPCanadaVan() {
  try {
    const { data: html } = await axios.get(TARGET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    const $ = load(html);
    const rawPosts = [];

    $('div.divTable.bbsListTable > div.divTableRow').each((_, el) => {
      if (rawPosts.length >= 20) return false; // (jpcanada-4) 최대 20개 제한

      const cell = $(el).find('div.divTableCell.col4');
      const anchor = cell.find('a[href^="topics.php?bbs=3"]');
      if (anchor.length === 0) return; // (jpcanada-5) 실제 게시글 필터

      const title = anchor.text().trim();
      const relativeLink = anchor.attr('href');
      const link = new URL(relativeLink, TARGET_URL).href;

      // (jpcanada-6) 게시 시간 파싱
      const postDetail = cell.find('span.post-detail').html();
      const dateMatch = postDetail.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
      const postedAt = dateMatch ? new Date(dateMatch[0].replace(' ', 'T')).toISOString() : null;

      // (jpcanada-7) 성별 키워드 분석
      const lowerTitle = title.toLowerCase();
      const maleKeywords = ['男性', 'man', 'male', 'boy', '남성', '남자'];
      const femaleKeywords = ['女性', 'woman', 'female', 'girl', '여성', '여자'];

      const hasMale = maleKeywords.some(keyword => lowerTitle.includes(keyword));
      const hasFemale = femaleKeywords.some(keyword => lowerTitle.includes(keyword));

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
      });
    });

    // (jpcanada-8) 저장 경로 및 파일명
    const dataDir = path.join(process.cwd(), 'utilities', 'crawler', 'rawdata');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const timestamp = getTimestamp();
    const outputPath = path.join(dataDir, `jpcanada_van_${timestamp}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(rawPosts, null, 2), 'utf-8');

    console.log(`✅ 크롤링 데이터 ${rawPosts.length}개 저장 완료 → ${outputPath}`);
  } catch (err) {
    console.error('❌ 크롤링 중 오류 발생:', err.message);
  }
}

// (jpcanada-9) 자동 반복 실행 시작 (5~7분 간격)
runWithRandomInterval(crawlJPCanadaVan, 8 * 60 * 1000, 13 * 60 * 1000);
