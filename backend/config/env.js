import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// 기존과 동일한 환경변수 검증
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
	console.error(' Supabase environment variables not set');
	process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
	console.error(' OpenAI API key not set');
	process.exit(1);
}

export const env = {
	SUPABASE_URL: process.env.SUPABASE_URL,
	SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
	OPENAI_API_KEY: process.env.OPENAI_API_KEY,
	PORT: process.env.PORT || 5001,
	REDIS_URL: process.env.REDIS_URL || null,
	OPENAI_TIMEOUT_MS: parseInt(process.env.OPENAI_TIMEOUT_MS || '15000', 10),
	EMERGENCY_NUMBER: process.env.EMERGENCY_NUMBER || null, // 예: 119
	MENTAL_HEALTH_LINE: process.env.MENTAL_HEALTH_LINE || null, // 예: 1393
	CHILD_PROTECTION_LINE: process.env.CHILD_PROTECTION_LINE || null // 예: 112
};
