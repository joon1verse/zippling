// 📄 mergeVancouverSupabase.js — Supabase 전용 병합 스크립트 (병렬 다운로드 최적화)

import { supabase } from './supabaseClient.js';
import { removeDuplicatesAndSort } from './mergeUtils.js';
import pLimit from 'p-limit'; // 🔧 병렬 제한 처리용 라이브러리

async function mergeVancouver() {
  console.log('🟢 [MergeVancouverSupabase] 시작');

  // 1) rawdata 목록 가져오기
  const { data: fileList, error: listErr } = await supabase
    .storage
    .from('zippling-data')
    .list('rawdata/vancouver', { limit: 1000 });

  if (listErr) {
    console.error('❌ 목록 불러오기 실패:', listErr.message);
    return;
  }

  const jsonFiles = fileList.filter(file => file.name.endsWith('.json'));
  const limit = pLimit(5); // 병렬 요청 수 제한 (최대 5개)

  // 2) 병렬 다운로드 + 파싱
  const downloadTasks = jsonFiles.map(file =>
    limit(async () => {
      const filePath = `rawdata/vancouver/${file.name}`;
      const { data: downloaded, error: dErr } = await supabase
        .storage
        .from('zippling-data')
        .download(filePath);

      if (dErr) {
        console.error(`❌ 다운로드 실패 (${file.name}):`, dErr.message);
        return null;
      }

      try {
        const text = await downloaded.text();
        const parsed = JSON.parse(text);
        return parsed;
      } catch (e) {
        console.error(`❌ JSON 파싱 오류 (${file.name}):`, e.message);
        return null;
      }
    })
  );

  const results = await Promise.allSettled(downloadTasks);
  const all = results
    .filter(r => r.status === 'fulfilled' && r.value)
    .flatMap(r => r.value);

  console.log(`📦 총 ${all.length}개 항목 로딩 완료 (rawdata)`);

  // 3) 중복 제거 + 정렬
  const merged = removeDuplicatesAndSort(all);
  console.log(`🧹 중복 제거 후 ${merged.length}개 남음. 업로드 진행...`);

  // 4) merged 결과 Supabase 업로드
  const mergedJson = JSON.stringify(merged, null, 2);
  const { error: uploadErr } = await supabase
    .storage
    .from('zippling-data')
    .upload('merged/vancouver/vancouver_crawldata.json', mergedJson, {
      contentType: 'application/json',
      upsert: true
    });

  if (uploadErr) {
    console.error('❌ 병합 결과 업로드 실패:', uploadErr.message);
    return;
  }

  console.log(`✅ merged/vancouver/vancouver_crawldata.json 저장 완료`);

  // 5) 원본 rawdata 파일 삭제
  const targets = jsonFiles.map(f => `rawdata/vancouver/${f.name}`);

  if (targets.length > 0) {
    const { error: removeErr } = await supabase
      .storage
      .from('zippling-data')
      .remove(targets);

    if (removeErr) {
      console.error('❌ rawdata 삭제 실패:', removeErr.message);
    } else {
      console.log(`🗑 rawdata 파일 총 ${targets.length}개 삭제 완료`);
    }
  } else {
    console.log('🗑 삭제할 JSON 파일이 없습니다.');
  }

  console.log('✅ [MergeVancouverSupabase] 완료');
}

mergeVancouver().catch(err => {
  console.error('❌ mergeVancouverSupabase.js 에러:', err);
});
