import OpenAI from 'openai';
import { env } from './env.js';

// 기존과 동일한 OpenAI 클라이언트 생성
export const openai = new OpenAI({
	apiKey: env.OPENAI_API_KEY
});
