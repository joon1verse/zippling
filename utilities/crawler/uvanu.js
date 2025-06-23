// 📄 uvanu.js — Daum Cafe - UvanU 크롤러 (postedAt & crawledAt 분리)

import puppeteer from 'puppeteer';
import { getSourceInfo } from '../sourceMap.js';
import { uploadToSupabase } from '../serverutil/supabaseUploader.js';

// ▶ 대상 URL
const TARGET_URL = 'https://m.cafe.daum.net/ourvancouver/4Nd0';

// ▶ 타임스탬프
function getTimestamp() {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
}

// ▶ 문자열 토큰화
function tokenizeText(str) {
  const lower = str.toLowerCase();
  const replaced = lower.replace(/[^a-z0-9가-힣]+/g, ' ');
  return replaced.split(/\s+/).filter(Boolean);
}

function isHangul(token) {
  return /^[가-힣]+$/.test(token);
}
function isEnglish(token) {
  return /^[a-z]+$/.test(token);
}

// ▶ 남성/여성 키워드
const hangulMale = ['남성','남자'];
const hangulFemale = ['여성','여자'];
const engMale = ['male','man','boy'];
const engFemale = ['female','woman','girl'];

function hasMaleToken(token) {
  if (isHangul(token)) return hangulMale.some(m => token.includes(m));
  if (isEnglish(token)) return engMale.includes(token);
  return false;
}
function hasFemaleToken(token) {
  if (isHangul(token)) return hangulFemale.some(f => token.includes(f));
  if (isEnglish(token)) return engFemale.includes(token);
  return false;
}

function getGenderTag(title) {
  const tokens = tokenizeText(title);
  const maleFound = tokens.some(hasMaleToken);
  const femaleFound = tokens.some(hasFemaleToken);
  if (maleFound && !femaleFound) return 'male';
  if (femaleFound && !maleFound) return 'female';
  return 'no-gender';
}

// ▶ 게시글 시간( ~분 전, ~시간 전 등 ) 파싱

/* 롤백용 코드
function parseRelativeTime(str) {
  const now = new Date();
  if (str.includes(':')) {
    const [h,m] = str.split(':').map(Number);
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  }
  const mm = str.match(/(\d+)분/);
  const hh = str.match(/(\d+)시간/);
  if (mm) return new Date(now.getTime() - parseInt(mm[1],10)*60000).toISOString();
  if (hh) return new Date(now.getTime() - parseInt(hh[1],10)*3600000).toISOString();
  return now.toISOString();
}
*/

function parseRelativeTime(str) {
  const now = new Date();
  // KST hh:mm → UTC 변환
  if (str.includes(':')) {
    const [h, m] = str.split(':').map(Number);
    const kstDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
    const utcTime = kstDate.getTime() - (9 * 60 * 60 * 1000);
    return new Date(utcTime).toISOString();
  }
  const mm = str.match(/(\d+)분/);
  const hh = str.match(/(\d+)시간/);
  if (mm) return new Date(now.getTime() - parseInt(mm[1],10)*60000).toISOString();
  if (hh) return new Date(now.getTime() - parseInt(hh[1],10)*3600000).toISOString();
  return now.toISOString();
}

// ▶ Puppeteer로 HTML 로딩
async function fetchHtmlWithPuppeteer(url) {
  const browser = await puppeteer.launch({
    headless: 'new', // 또는 true
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile Safari/604.1'
  );
  await page.goto(url, { waitUntil: 'networkidle2' });
  const content = await page.content();
  await browser.close();
  return content;
}

// ▶ articles.push({...}) → JSON 치환
function convertArticlesObjectString(raw) {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/Number\("(\d+)"\)/g, '$1');
  cleaned = cleaned.replace(/(^|[\s,{])([A-Za-z_]\w*)\s*:/g, '$1"$2":');
  return '{' + cleaned + '}';
}

// ▶ 메인 함수
export async function crawlUvanU() {
  const timestamp = getTimestamp();
  const outputFileName = `uvanu_${timestamp}.json`;
  const rawPosts = [];

  try {
    const html = await fetchHtmlWithPuppeteer(TARGET_URL);

    const regex = /articles\.push\(\{\s*([\s\S]*?)\}\)/g;
    let match; 
    const blocks = [];
    while ((match = regex.exec(html)) !== null) {
      blocks.push(match[1]);
    }

    for (let i = 0; i < blocks.length; i++) {
      const converted = convertArticlesObjectString(blocks[i]);
      try {
        const parsed = JSON.parse(converted);
        const title = parsed.title || '';
        const dataid = parsed.dataid || 0;
        // postedAt: 게시글 작성(or ~분 전) 추정 시각
        const postedAt = parseRelativeTime(parsed.articleElapsedTime || '');
        // crawledAt: 실제 크롤 시점
        const crawledAt = new Date().toISOString();

        const link = `https://m.cafe.daum.net/ourvancouver/4Nd0/${dataid}?`;
        const genderTag = getGenderTag(title);
        const { source } = getSourceInfo(link);

        rawPosts.push({
          title,
          link,
          tag: [genderTag, 'korea'],
          source,
          postedAt,
          crawledAt,
        });
      } catch(e) {
        // 파싱 실패시 무시
      }
    }

    const jsonData = JSON.stringify(rawPosts, null, 2);
    await uploadToSupabase(
      'zippling-data',
      `rawdata/vancouver/${outputFileName}`, 
      jsonData
    );

    console.log(`✅ 크롤링 데이터 ${rawPosts.length}개 Supabase 직접 업로드 완료`);
  } catch (err) {
    console.error('uvanu: error:', err.message);
  }
}

// ▶ 실행 함수 (테스트용)
export async function runUvanU() {
  const start = Date.now();
  console.log('🟢 [UvanU] 시작');
  await crawlUvanU();
  const end = Date.now();
  const durationSec = ((end - start) / 1000).toFixed(2);
  console.log(`✅ [UvanU] 완료 — 실행 시간: ${durationSec}초`);
}
