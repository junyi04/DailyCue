// 간단한 인메모리 메트릭 (프로세스 생명주기 한정)
const metricsState = {
	requestsTotal: 0,
	requestDurationMsSum: 0,
	byRoute: new Map() // key: method path -> { count, durationSum }
};

export function metricsMiddleware(req, res, next) {
	const startedAt = Date.now();
	res.on('finish', () => {
		const duration = Date.now() - startedAt;
		metricsState.requestsTotal += 1;
		metricsState.requestDurationMsSum += duration;
		const key = `${req.method} ${req.route?.path || req.path}`;
		const curr = metricsState.byRoute.get(key) || { count: 0, durationSum: 0 };
		curr.count += 1;
		curr.durationSum += duration;
		metricsState.byRoute.set(key, curr);
	});
	next();
}

export function renderPrometheusMetrics() {
	let out = '';
	out += '# HELP app_requests_total Total HTTP requests.\n';
	out += '# TYPE app_requests_total counter\n';
	out += `app_requests_total ${metricsState.requestsTotal}\n`;

	out += '\n# HELP app_request_duration_ms_sum Sum of request durations in ms.\n';
	out += '# TYPE app_request_duration_ms_sum counter\n';
	out += `app_request_duration_ms_sum ${metricsState.requestDurationMsSum}\n`;

	for (const [key, val] of metricsState.byRoute.entries()) {
		const labels = `route="${key.replace(/"/g, '\\"')}"`;
		out += `\n# HELP app_route_requests_total Total requests per route.\n`;
		out += '# TYPE app_route_requests_total counter\n';
		out += `app_route_requests_total{${labels}} ${val.count}\n`;
		out += `# HELP app_route_request_duration_ms_sum Sum of durations per route.\n`;
		out += '# TYPE app_route_request_duration_ms_sum counter\n';
		out += `app_route_request_duration_ms_sum{${labels}} ${val.durationSum}\n`;
	}
	return out;
}


