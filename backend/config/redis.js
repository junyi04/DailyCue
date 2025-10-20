import { env } from './env.js';

let redisClient = null;

export async function getRedisClient() {
	if (redisClient) return redisClient;
	const url = process.env.REDIS_URL || env.REDIS_URL;
	if (!url) return null; // Redis 미사용
	try {
		const { createClient } = await import('redis');
		redisClient = createClient({ url });
		redisClient.on('error', (err) => {
			console.error('Redis error:', err?.message || err);
		});
		if (!redisClient.isOpen) {
			await redisClient.connect();
		}
		return redisClient;
	} catch (e) {
		console.error('Redis init failed:', e?.message || e);
		return null;
	}
}

export async function closeRedis() {
	try {
		if (redisClient && redisClient.isOpen) {
			await redisClient.quit();
		}
	} catch (_) {}
}

