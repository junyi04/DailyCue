import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// 기존과 동일한 Supabase 클라이언트 생성
export const supabase = createClient(
	env.SUPABASE_URL,
	env.SUPABASE_ANON_KEY
);
