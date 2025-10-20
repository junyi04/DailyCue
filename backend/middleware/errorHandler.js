// 기존과 동일한 글로벌 에러 핸들러
export const globalErrorHandler = (error, req, res, next) => {
	console.error('Server error:', error);
	res.status(500).json({
		error: 'Internal server error',
		message: error.message,
		timestamp: new Date().toISOString()
	});
};
