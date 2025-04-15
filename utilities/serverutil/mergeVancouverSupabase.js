// 📄 mergeVancouverSupabase.js — Supabase 전용 병합 스크립트
import { supabase } from './supabaseClient.js';
import { removeDuplicatesAndSort } from './mergeUtils.js';

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

  let all = [];
  for (const file of fileList) {
    // .json 파일만 처리
    if (!file.name.endsWith('.json')) continue;

    // 2) 개별 파일 다운로드
    const filePath = `rawdata/vancouver/${file.name}`;
    const { data: downloaded, error: dErr } = await supabase
      .storage
      .from('zippling-data')
      .download(filePath);

    if (dErr) {
      console.error(`❌ 다운로드 실패 (${file.name}):`, dErr.message);
      continue;
    }

    // Blob → text
    const text = await downloaded.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch(e) {
      console.error(`❌ JSON 파싱 오류 (${file.name}):`, e.message);
      continue;
    }
    // 메인 배열(all)에 합침
    all = all.concat(parsed);
  }

  console.log(`📦 총 ${all.length}개 항목 로딩 완료 (rawdata)`);

  // 3) 중복 제거 + 정렬
  const merged = removeDuplicatesAndSort(all);
  console.log(`🧹 중복 제거 후 ${merged.length}개 남음. 업로드 진행...`);

  // 4) merged/vancouver/vancouver_crawldata.json 업로드
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
  const targets = fileList
    .filter(f => f.name.endsWith('.json'))
    .map(f => `rawdata/vancouver/${f.name}`);

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
