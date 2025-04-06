// 📄 merger.js — 크롤링 데이터 병합 및 저장 유틸 (vancouver.json 포함 누적형)
import fs from 'fs';
import path from 'path';
import { getSourceInfo } from './sourceMap.js';

// ✅ 병합 및 중복 제거 (vancouver.json 포함, 과거 게시물 우선 유지)
export function getMergedDataByTag(tag, crawledDataList) {
  let all = [];

  // 1️⃣ 이전 병합 결과도 포함
  const existingPath = path.join(process.cwd(), 'public', 'data', `${tag.toLowerCase()}.json`);
  if (fs.existsSync(existingPath)) {
    const prev = JSON.parse(fs.readFileSync(existingPath, 'utf-8'));
    all = all.concat(prev);
  }

  // 2️⃣ 새로 수집된 rawdata 병합
  crawledDataList.forEach(({ data }) => {
    const filtered = data.filter(item => getSourceInfo(item.link).tag === tag);
    all = all.concat(filtered);
  });

  // 3️⃣ 중복 제거 (link 기준, 과거 수집된 게시물 우선 유지)
  const seen = new Set();
  const deduped = [];
  for (const item of all) {
    if (!seen.has(item.link)) {
      seen.add(item.link);
      deduped.push(item);
    }
  }

  // 4️⃣ 시간 기준 정렬 (postedAt → crawledAt 기준 최신순 정렬)
  deduped.sort((a, b) => {
    const aTime = new Date(a.postedAt || a.crawledAt);
    const bTime = new Date(b.postedAt || b.crawledAt);
    return bTime - aTime;
  });

  console.log(`🧹 중복 제거 후 총 ${deduped.length}건 유지됨 (tag: ${tag})`);
  return deduped;
}

// ✅ 결과 저장
export function saveMergedData(tag, data) {
  const dirPath = path.join(process.cwd(), 'public', 'data');
  const outputPath = path.join(dirPath, `${tag.toLowerCase()}_crawldata.json`);

  // 📁 디렉토리 없으면 생성
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 data 폴더 생성됨 → ${dirPath}`);
  }

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`✅ 최종 저장된 ${tag} 게시물 총 ${data.length}개 → ${outputPath}`);
}
