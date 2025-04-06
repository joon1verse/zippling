// 📄 index.js — 크롤링 데이터 병합 및 저장 실행 파일
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getMergedDataByTag, saveMergedData } from './merger.js';

// ⛓ 경로 안전 처리 (현재 파일 기준)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 📁 크롤링 원본 데이터 디렉토리
const dataDir = path.join(__dirname, 'crawler', 'rawdata');

// ✅ 원본 파일 읽기 함수 (uvanu, craigslist 등)
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

// 🧩 모든 크롤링 소스 로딩
const crawledDataList = [
  ...loadRawFiles('uvanu'),
  ...loadRawFiles('craigslist'),
];

// 📦 태그별 병합 및 저장
['vancouver'].forEach(tag => {
  const tagData = getMergedDataByTag(tag, crawledDataList);
  saveMergedData(tag, tagData);
});
