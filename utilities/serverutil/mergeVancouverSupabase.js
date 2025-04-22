// 📄 mergeVancouverSupabase.js — Supabase 전용 병합 스크립트 (DB upsert + 병렬 다운로드 최적화)

import { supabase } from './supabaseClient.js';           // Service‑Role key 클라이언트
import { removeDuplicatesAndSort } from './mergeUtils.js';
import pLimit from 'p-limit';                             // 병렬 제한
import chunkArray from 'lodash.chunk';                    // npm i lodash.chunk

async function mergeVancouver() {
  console.log('🟢 [MergeVancouverSupabase] 시작');

  /* 1) rawdata 파일 목록 */
  const { data: fileList, error: listErr } = await supabase
    .storage
    .from('zippling-data')
    .list('rawdata/vancouver', { limit: 1000 });

  if (listErr) {
    console.error('❌ 목록 불러오기 실패:', listErr.message);
    return;
  }

  const jsonFiles = fileList.filter(f => f.name.endsWith('.json'));
  if (jsonFiles.length === 0) {
    console.log('ℹ️ rawdata 없음 — 병합 건너뜀');
    return;
  }

  /* 2) 병렬 다운로드 + JSON 파싱 */
  const limit = pLimit(5); // 동시 5개
  const downloadTasks = jsonFiles.map(file => limit(async () => {
    const path = `rawdata/vancouver/${file.name}`;
    const { data, error } = await supabase.storage.from('zippling-data').download(path);

    if (error) {
      console.error(`❌ 다운로드 실패 (${file.name}):`, error.message);
      return null;
    }
    try {
      const text = await data.text();
      return JSON.parse(text);
    } catch (e) {
      console.error(`❌ JSON 파싱 오류 (${file.name}):`, e.message);
      return null;
    }
  }));

  const settled = await Promise.allSettled(downloadTasks);
  const all = settled
    .filter(r => r.status === 'fulfilled' && r.value)
    .flatMap(r => r.value);

  console.log(`📦 총 ${all.length}개 항목 로딩 완료 (rawdata)`);

  /* 3) 중복 제거 + 정렬 */
  const merged = removeDuplicatesAndSort(all);
  console.log(`🧹 중복 제거 후 ${merged.length}개 남음. DB upsert 진행...`);

  /* 4) DB upsert (link 컬럼 UNIQUE) */
  const batchSize = 500;                      // 한번에 500행씩
  const chunks = chunkArray(merged, batchSize);

  for (const slice of chunks) {
    const { error } = await supabase
      .from('vancouver_roomlistings')
      .upsert(slice, { onConflict: 'link' }); // 중복 시 업데이트 X, 덮어쓰기 O

    if (error) {
      console.error('❌ DB upsert 실패:', error.message);
      return;
    }
  }
  console.log(`✅ DB upsert 완료: ${merged.length} rows`);

  /* 5) 원본 rawdata 파일 삭제 (Storage 공간·속도 확보) */
  const targets = jsonFiles.map(f => `rawdata/vancouver/${f.name}`);
  const { error: rmErr } = await supabase
    .storage
    .from('zippling-data')
    .remove(targets);

  if (rmErr) {
    console.error('❌ rawdata 삭제 실패:', rmErr.message);
  } else {
    console.log(`🗑 rawdata 파일 ${targets.length}개 삭제 완료`);
  }

  console.log('✅ [MergeVancouverSupabase] 완료');
}

mergeVancouver().catch(err => {
  console.error('❌ mergeVancouverSupabase.js 에러:', err);
});
