// 📄 index.js — 크롤링 데이터 병합 및 저장 실행 파일
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getMergedDataByTag, saveMergedData } from './merger.js';

// ⛓ 경로 안전 처리
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 📁 크롤링 원본 데이터 디렉토리
const dataDir = path.join(__dirname, 'crawler', 'rawdata');

// ✅ raw 파일 로딩 함수
const loadRawFiles = (prefix) => {
  return fs.readdirSync(dataDir)
    .filter(file => file.startsWith(`${prefix}_`) && file.endsWith('.json'))
    .map(file => {
      const filePath = path.join(dataDir, file);
      const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return {
        source: prefix,
        data: jsonData,
      };
    });
};

// ✅ 병합 대상 소스들 등록
const crawledDataList = [
  ...loadRawFiles('uvanu'),
  ...loadRawFiles('craigslist'),
  ...loadRawFiles('jpcanada_van'),
];

// ✅ 병합 및 저장 + 기존 데이터 누적 유지
try {
  ['vancouver'].forEach(tag => {
    const tagData = getMergedDataByTag(tag, crawledDataList);
    saveMergedData(tag, tagData);
  });

  // ✅ 병합 후 raw 파일 정리
  const deleted = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));
  for (const file of deleted) {
    fs.unlinkSync(path.join(dataDir, file));
  }
  console.log(`🗑 rawdata 파일 ${deleted.length}개 삭제 완료`);
} catch (err) {
  console.error('❌ 병합 중 오류 발생:', err.message);
}
