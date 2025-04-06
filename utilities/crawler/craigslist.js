// 📄 craigslist.js — Craigslist 크롤러 (최종버전)
// 🔢 기능별 주석 포맷: (craigslist-번호)

import axios from 'axios'; // (craigslist-1) HTTP 요청 모듈
import { load } from 'cheerio'; // (craigslist-2) HTML 파싱 모듈
import fs from 'fs'; // (craigslist-3) 파일 시스템 모듈
import path from 'path'; // (craigslist-4) 경로 처리
import { getSourceInfo } from '../sourceMap.js'; // (craigslist-5) 출처 자동 추출 함수
import { runWithRandomInterval } from '../scheduler.js'; // (craigslist-6) 반복 실행 유틸

// (craigslist-7) 대상 URL (Vancouver Room 리스트)
const TARGET_URL = 'https://vancouver.craigslist.org/search/vancouver-bc/roo?lat=49.2584&lon=-123.0338&search_distance=7';

// (craigslist-8) 파일명에 날짜+시간 추가 함수
const getTimestamp = () => {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
};

// (craigslist-9) 크롤링 메인 함수
async function crawlCraigslist() {
  try {
    // (craigslist-10) HTML 요청
    const { data: html } = await axios.get(TARGET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    // (craigslist-11) cheerio 로드
    const $ = load(html);
    const rawPosts = [];

    // (craigslist-12) 게시글 루프 (최대 20개 제한)
    $('li.cl-static-search-result').slice(0, 20).each((_, el) => {
      const li = $(el);
      const anchor = li.find('a');
      const title = anchor.find('.title').text().trim();
      console.log('[🔍 제목 확인]', title);
      const link = anchor.attr('href');
      const price = li.find('.price').first().text().trim();

      // (craigslist-13) 게시 시간 추출
      const rawTime = li.find('time.date').attr('datetime');
      const postedAt = rawTime ? new Date(rawTime).toISOString() : null;

      // (craigslist-14) 필수 데이터 확인 및 포맷팅
      if (title && link) {
        const lowerTitle = title.toLowerCase();

        const maleKeywords = ['남성', '남자', '男性', 'man', 'male', 'boy'];
        const femaleKeywords = ['여성', '여자', '女性', 'woman', 'female', 'girl'];

        const hasMale = maleKeywords.some(keyword => new RegExp(`\\b${keyword}\\b`).test(lowerTitle));
        const hasFemale = femaleKeywords.some(keyword => new RegExp(`\\b${keyword}\\b`).test(lowerTitle));

        console.log('[👨‍🦱 hasMale]', hasMale, '[👩‍🦰 hasFemale]', hasFemale);
      
        const tags = [];
      
        if (hasMale && !hasFemale) tags.push('male');
        else if (hasFemale && !hasMale) tags.push('female');
        else tags.push('no-gender');
      
        tags.push('canada'); // 📍 크레이그리스트는 캐나다 기반
      
        const { source } = getSourceInfo(link);
        rawPosts.push({
          title,
          link,
          price,
          tag: tags, // ✅ 통합된 태그 배열
          source,
          postedAt,
          crawledAt: new Date().toISOString(),
        });
      }
    });

    // (craigslist-15) 저장 경로 및 폴더 생성
    const dataDir = path.join(process.cwd(), 'utilities', 'crawler', 'rawdata');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const timestamp = getTimestamp();
    const outputPath = path.join(dataDir, `craigslist_${timestamp}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(rawPosts, null, 2), 'utf-8');

    console.log(`✅ 크롤링 데이터 ${rawPosts.length}개 저장 완료 → ${outputPath}`);
  } catch (err) {
    console.error('❌ 크롤링 중 오류 발생:', err.message);
  }
}

// (craigslist-16) 자동 반복 실행 시작 (5~7분 간격)
runWithRandomInterval(crawlCraigslist, 5 * 60 * 1000, 7 * 60 * 1000);