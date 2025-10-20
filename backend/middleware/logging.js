export const requestLogger = (req, res, next) => {
	const start = Date.now();
	const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
	req.requestId = requestId;
	res.on('finish', () => {
		const duration = Date.now() - start;
		const log = {
			timestamp: new Date().toISOString(),
			level: 'info',
			requestId,
			method: req.method,
			url: req.url,
			status: res.statusCode,
			durationMs: duration,
			userId: req.body?.user_id || req.body?.user || undefined
		};
		console.log(JSON.stringify(log));
	});
	next();
};
