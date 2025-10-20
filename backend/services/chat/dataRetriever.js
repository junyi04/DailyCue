import { supabase } from '../../config/database.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

// dayjs 플러그인 설정
dayjs.extend(utc);
dayjs.extend(timezone);

// 관련 기록 조회 함수
export async function getRelevantRecords(user_id, timeRange = 'recent') {
	try {
		const now = dayjs();
		const koreaTime = now.tz('Asia/Seoul');
		const today = koreaTime.format('YYYY-MM-DD');
		const yesterday = koreaTime.subtract(1, 'day').format('YYYY-MM-DD');
		
		console.log('🔍 기록 조회 디버깅:');
		console.log('- timeRange:', timeRange);
		console.log('- 오늘:', today);
		console.log('- 어제:', yesterday);
		
		// 단일 시간대 요청 처리
		let targetDate;
		if (timeRange === 'today') {
			targetDate = today;
		} else if (timeRange === 'yesterday') {
			targetDate = yesterday;
		} else {
			// 기본값: 오늘 기록 우선 조회
			targetDate = today;
		}
		
		console.log('- 조회할 날짜:', targetDate);
		
		const { data: records } = await supabase
			.from('records')
			.select('date, title, notes, fatigue, emotion')
			.eq('user_id', user_id)
			.eq('date', targetDate);

		console.log('- 기록 개수:', records?.length || 0);
		if (records && records.length > 0) {
			// 🚨 데이터 무결성 검증
			const validRecords = records.filter(record => {
				// 필수 필드 검증
				if (!record.date || !record.fatigue) {
					console.warn('📝 데이터 검증: 유효하지 않은 기록 필터링됨', record);
					return false;
				}
				// 날짜 형식 검증
				if (isNaN(new Date(record.date).getTime())) {
					console.warn('📝 데이터 검증: 잘못된 날짜 형식 필터링됨', record.date);
					return false;
				}
				// 피로도 점수 검증 (0-5 범위)
				const fatigue = Number(record.fatigue);
				if (isNaN(fatigue) || fatigue < 0 || fatigue > 5) {
					console.warn('📝 데이터 검증: 잘못된 피로도 점수 필터링됨', record.fatigue);
					return false;
				}
				return true;
			});

			if (validRecords.length > 0) {
				console.log('- 유효한 기록 발견, 반환:', validRecords.length, '개');
				return validRecords;
			} else {
				console.log('- 유효한 기록이 없음, 빈 배열 반환');
				return [];
			}
		}

		// 특정 날짜에 기록이 없으면 빈 배열 반환
		console.log('- 특정 날짜에 기록 없음, 빈 배열 반환');
		return [];
	} catch (error) {
		console.error('Records fetch error:', error);
		return [];
	}
}

// 동적 챗 메시지 조회 함수
export async function getRelevantChatHistory(user_id, intent) {
	try {
		let query = supabase
			.from('chat_messages')
			.select('user_chat, ai_answer, created_at, saved_chart_id')
			.eq('user_id', user_id);

		// 시간 범위 필터링
		if (intent.timeRange) {
			const timeFilter = calculateTimeFilter(intent.timeRange);
			if (timeFilter.start) {
				query = query.gte('created_at', timeFilter.start);
			}
			if (timeFilter.end) {
				query = query.lt('created_at', timeFilter.end);
			}
		}

		// 주제 기반 필터링
		if (intent.topic) {
			query = query.ilike('user_chat', `%${intent.topic}%`);
		}

		// 동적 개수 제한
		const limit = calculateOptimalChatLimit(intent);
		query = query.limit(limit);

		const { data, error } = await query.order('created_at', { ascending: false });

		if (error) {
			console.error('Chat history error:', error);
			return [];
		}

		return data || [];
	} catch (error) {
		console.error('Chat history fetch error:', error);
		return [];
	}
}

// 시간 필터 계산 함수 (한국 시간 기준)
export function calculateTimeFilter(timeRange) {
	const now = dayjs();
	const koreaTime = now.tz('Asia/Seoul');
	
	switch (timeRange) {
		case 'today':
			const todayStart = koreaTime.startOf('day');
			return {
				start: todayStart.utc().format(),
				end: koreaTime.utc().format()
			};
		case 'yesterday':
			const yesterdayStart = koreaTime.subtract(1, 'day').startOf('day');
			const yesterdayEnd = koreaTime.subtract(1, 'day').endOf('day');
			return {
				start: yesterdayStart.utc().format(),
				end: yesterdayEnd.utc().format()
			};
		case 'last_week':
			const weekAgo = koreaTime.subtract(7, 'day');
			return {
				start: weekAgo.utc().format(),
				end: koreaTime.utc().format()
			};
		case 'last_month':
			const monthAgo = koreaTime.subtract(30, 'day');
			return {
				start: monthAgo.utc().format(),
				end: koreaTime.utc().format()
			};
		case 'recent':
		default:
			const recent = koreaTime.subtract(6, 'hour'); // 최근 6시간
			return {
				start: recent.utc().format(),
				end: koreaTime.utc().format()
			};
	}
}

// 최적 챗 메시지 개수 계산 함수
export function calculateOptimalChatLimit(intent) {
	// 분석 요청은 최근 대화만
	if (intent.isAnalysisRequest) {
		return 10;
	}
	
	// 감정 지원은 조금 더 많은 대화
	if (intent.needsRecords) {
		return 20;
	}
	
	// 간단한 인사는 최소한만
	if (intent.isSimpleGreeting) {
		return 5;
	}
	
	// 특정 시간 범위가 있으면 해당 범위에 맞게
	if (intent.timeRange === 'yesterday') {
		return 15;
	}
	
	if (intent.timeRange === 'last_week') {
		return 25;
	}
	
	// 기본값
	return 15;
}
