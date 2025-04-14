/* 📄 supabaseUploader.js — Supabase 업로드 유틸
import supabase from './supabaseClient.js';
import fs from 'fs';

export async function uploadToSupabase(bucket, path, localFilePath) {
  try {
    const fileBuffer = fs.readFileSync(localFilePath);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, fileBuffer, {
        upsert: true, // 덮어쓰기 허용
        contentType: 'application/json',
      });

    if (error) {
      console.error('❌ 업로드 실패:', error.message);
      return null;
    }

    console.log(`✅ Supabase 업로드 완료: ${bucket}/${path}`);
    return data;
  } catch (err) {
    console.error('❌ 파일 읽기 오류:', err.message);
    return null;
  }
}
*/

// 📄 supabaseUploader.js 2.0

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Supabase에 JSON 데이터를 업로드 (파일 경로 또는 JSON 문자열 직접 업로드 가능)
 */
export async function uploadToSupabase(bucket, storagePath, dataOrFilePath) {
  let content;

  // JSON 문자열인지 파일 경로인지 명확히 구분
  try {
    JSON.parse(dataOrFilePath);
    content = dataOrFilePath;  // JSON 문자열 직접 업로드
  } catch {
    content = fs.readFileSync(dataOrFilePath, 'utf-8'); // 파일 경로에서 업로드
  }

  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, content, {
      contentType: 'application/json',
      upsert: true,
    });

  if (error) throw new Error(`업로드 실패: ${error.message}`);

  console.log(`✅ Supabase 업로드 완료 → ${bucket}/${storagePath}`);
}

