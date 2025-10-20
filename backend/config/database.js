import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// 백엔드용 Supabase 클라이언트 (서비스 키 사용)
export const supabase = createClient(
	env.SUPABASE_URL,
	env.SUPABASE_SERVICE_ROLE_KEY // 서비스 키 사용
);
