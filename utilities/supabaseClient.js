// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ovvxpymgnwsnyoieboxb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92dnhweW1nbndzbnlvaWVib3hiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mzk0NDU4NCwiZXhwIjoyMDU5NTIwNTg0fQ.J0Wrm5VJYvuderrp0fKW_GTrWPISBz3IrvZYu48QjMQ' // ❗ 서버에서만 사용
);

export default supabase;
