// 📄 supabaseClient.js
import 'dotenv/config';  // 로컬 환경에서 .env 파일을 자동 로드
import { createClient } from '@supabase/supabase-js';

// process.env.SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 가 
// 이미 설정되어 있어야 함 (.env 또는 GitHub Actions Secrets)
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
