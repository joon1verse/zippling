// 📄 uvanu.js — Daum Cafe - UvanU 크롤러 (최종버전)
// 🔢 기능별 주석 포맷: (uvanu-번호)

import axios from 'axios'; // (uvanu-1) HTTP 요청 모듈
import { load } from 'cheerio'; // (uvanu-2) HTML 파싱 모듈
import fs from 'fs'; // (uvanu-3) 파일 시스템 모듈
import path from 'path'; // (uvanu-4) 경로 처리
import { getSourceInfo } from '../sourceMap.js'; // (uvanu-5) 출처 자동 추출 함수
import { runWithRandomInterval } from '../scheduler.js'; // (uvanu-6) 반복 실행 유틸

// (uvanu-7) 대상 URL
const TARGET_URL = 'https://m.cafe.daum.net/ourvancouver/4Nd0';

// (uvanu-8) 파일명에 날짜+시간 추가 함수
const getTimestamp = () => {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
};

// (uvanu-9) 크롤링 메인 함수
async function crawlUvanU() {
  try {
    // (uvanu-10) HTML 요청
    const { data: html } = await axios.get(TARGET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    // (uvanu-11) cheerio 로드
    const $ = load(html);
    const rawPosts = [];

    // (uvanu-12) 게시글 루프
    $('li').each((_, el) => {
      const li = $(el);
      const liText = li.text();

      // (uvanu-13) 공지글 필터링
      const isNotice = liText.includes('공지') || liText.includes('필독');
      if (isNotice) return;

      // (uvanu-14) 제목 및 링크 추출
      const title = li.find('.txt_detail').text().trim();
      const href = li.find('a').attr('href');
      const link = href ? 'https://m.cafe.daum.net' + href : null;

      if (title && link) {
        const lowerTitle = title.toLowerCase();
      
        const maleKeywords = ['남성', '남자', '男性', 'man', 'male', 'boy'];
        const femaleKeywords = ['여성', '여자', '女性', 'woman', 'female', 'girl'];
      
        const hasMale = maleKeywords.some(keyword => lowerTitle.includes(keyword));
        const hasFemale = femaleKeywords.some(keyword => lowerTitle.includes(keyword));
      
        const tags = [];
      
        if (hasMale && !hasFemale) tags.push('male');
        else if (hasFemale && !hasMale) tags.push('female');
        else tags.push('no-gender');
      
        tags.push('korea'); // 📍 우밴유는 한국 기반
      
        const { source } = getSourceInfo(link); // tag는 우리가 수동 생성하므로 제거
        rawPosts.push({
          title,
          link,
          tag: tags, // ✅ 통합된 태그 배열
          source,
          crawledAt: new Date().toISOString(),
        });
      }      
    });

    // (uvanu-16) 저장 경로 및 폴더 생성
    const dataDir = path.join(process.cwd(), 'utilities', 'crawler', 'rawdata');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const timestamp = getTimestamp();
    const outputPath = path.join(dataDir, `uvanu_${timestamp}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(rawPosts, null, 2), 'utf-8');

    console.log(`✅ 크롤링 데이터 ${rawPosts.length}개 저장 완료 → ${outputPath}`);
  } catch (err) {
    console.error('❌ 크롤링 중 오류 발생:', err.message);
  }
}

// (uvanu-17) 자동 반복 실행 시작
runWithRandomInterval(crawlUvanU, 5 * 60 * 1000, 8 * 60 * 1000);
