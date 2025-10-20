import { openai } from '../../config/openai.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

// dayjs 플러그인 설정
dayjs.extend(utc);
dayjs.extend(timezone);


// AI 자동 의도 분석 함수
export async function analyzeUserIntent(message) {
	try {
		console.log('🤖 AI 자동 의도 분석 시작:', message);
		
		// 현재 날짜 정보 제공 (AI가 정확한 날짜 계산을 위해)
		const now = dayjs();
		const koreaTime = now.tz('Asia/Seoul');
		const currentDate = koreaTime.format('YYYY-MM-DD');
		const currentYear = koreaTime.format('YYYY');
		const currentMonth = koreaTime.format('MM');
		const currentDay = koreaTime.format('DD');
		
		const response = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [{
				role: 'user',
				content: `사용자 메시지를 분석해서 의도를 파악해주세요:

**현재 날짜 정보:**
- 오늘: ${currentDate} (${currentYear}년 ${currentMonth}월 ${currentDay}일)
- 현재 년도: ${currentYear}

메시지: "${message}"

다음 JSON 형식으로 답변해주세요:
{
	"isAnalysisRequest": true/false,
	"needsRecords": true/false,
	"needsChatHistory": true/false,
	"needsChart": true/false,
	"isReportRequest": true/false,
	"isSimpleGreeting": true/false,
	"timeRange": "today|yesterday|last_week|last_month|recent",
	"topic": "감정|분석|대화|기분|아이|피로|기록|null",
	"analysisType": "period|custom|specific",
	"periodType": "week|month|year",
	"periodValue": 숫자,
	"fromDate": "YYYY-MM-DD",
	"toDate": "YYYY-MM-DD"
}

구분 기준:
- **차트 분석 요청**: "분석해줘", "보여줘", "차트", "그래프", "트렌드", "패턴", "시간대별", "시간별", "확인", "조회", "알려줘" 등 → needsChart: true, isAnalysisRequest: true, isReportRequest: false
- **리포트/요약 요청**: "리포트", "요약", "정리", "쓰줘", "만들어줘", "작성해줘" 등 → needsChart: false, isAnalysisRequest: true, isReportRequest: true
- **과거 기록 참조**: "저번에", "근래에", "최근에", "이전에", "과거에", "지난번에", "얼마 전에", "요전에", "전에" 등 → needsChart: true, isAnalysisRequest: true, isReportRequest: false, timeRange: "recent"
- **대화**: "어떻게 지냈어?", "기분이 안 좋아", "대화 정리" 등 → needsChart: false, isAnalysisRequest: false, isReportRequest: false

**간단한 규칙:**
- **"분석해줘"** → needsChart: true, isAnalysisRequest: true, isReportRequest: false (차트 생성)
- **"보여줘"** → needsChart: true, isAnalysisRequest: true, isReportRequest: false (차트와 함께 보여주기)
- **"리포트 써줘", "요약해줘"** → needsChart: false, isAnalysisRequest: true, isReportRequest: true (리포트 생성)
- **월 언급** → 해당 월 분석 (현재 년도 사용)
- **"한달동안", "한달간"** → 최근 30일 분석 (periodType: "day", periodValue: 30)

**과거 기록 참조 규칙:**
- "저번에", "근래에", "최근에", "이전에", "과거에", "지난번에", "얼마 전에", "요전에", "전에" → needsChart: true, isAnalysisRequest: true, timeRange: "custom"
- 과거 기록과 현재 상황 비교 → needsChart: true, isAnalysisRequest: true, timeRange: "custom"
- "저번에 ~했을 때는", "이전에는", "과거에는" → 과거 기록 참조로 인식

**과거 표현 기간 계산 규칙:**
- "저번에" → 최근 2-5일 전 (fromDate: 5일전, toDate: 2일전)
- "근래에" → 최근 1-2주 (fromDate: 14일전, toDate: 1일전)
- "최근에" → 최근 3-5일 (fromDate: 5일전, toDate: 1일전)
- "이전에", "과거에" → 1-4주 전 (fromDate: 28일전, toDate: 7일전)
- "지난번에" → 최근 3-7일 전 (fromDate: 7일전, toDate: 3일전)

**기간 표현 규칙 (오늘 ${currentDate} 기준):**
- "X일동안", "X일간" → periodType: "day", periodValue: X
- "X주동안", "X주간" → periodType: "day", periodValue: X*7
- "X개월동안", "X개월간", "X달동안" → periodType: "day", periodValue: X*30
- "X년동안", "X년간" → periodType: "day", periodValue: X*365
- "X일전", "X일 전", "이틀전", "이틀 전", "삼일전", "삼일 전", "사일전", "사일 전", "오일전", "오일 전" → periodType: "day", periodValue: X, timeRange: "custom", fromDate: X일전, toDate: X일전
- "X주전", "X주 전" → periodType: "week", periodValue: X, timeRange: "custom", fromDate: X주전, toDate: X주전
- "X달전", "X달 전", "X개월전", "X개월 전" → periodType: "month", periodValue: X, timeRange: "custom", fromDate: X달전, toDate: X달전
- "X년전", "X년 전" → periodType: "year", periodValue: X, timeRange: "custom", fromDate: X년전, toDate: X년전
- "오늘" → timeRange: "today"
- "어제" → timeRange: "yesterday"
- "이틀전" → timeRange: "custom", fromDate: "${koreaTime.subtract(2, 'day').format('YYYY-MM-DD')}", toDate: "${koreaTime.subtract(2, 'day').format('YYYY-MM-DD')}"
- "삼일전" → timeRange: "custom", fromDate: "${koreaTime.subtract(3, 'day').format('YYYY-MM-DD')}", toDate: "${koreaTime.subtract(3, 'day').format('YYYY-MM-DD')}"
- "사일전" → timeRange: "custom", fromDate: "${koreaTime.subtract(4, 'day').format('YYYY-MM-DD')}", toDate: "${koreaTime.subtract(4, 'day').format('YYYY-MM-DD')}"
- "오일전" → timeRange: "custom", fromDate: "${koreaTime.subtract(5, 'day').format('YYYY-MM-DD')}", toDate: "${koreaTime.subtract(5, 'day').format('YYYY-MM-DD')}"
- "육일전" → timeRange: "custom", fromDate: "${koreaTime.subtract(6, 'day').format('YYYY-MM-DD')}", toDate: "${koreaTime.subtract(6, 'day').format('YYYY-MM-DD')}"
- "칠일전" → timeRange: "custom", fromDate: "${koreaTime.subtract(7, 'day').format('YYYY-MM-DD')}", toDate: "${koreaTime.subtract(7, 'day').format('YYYY-MM-DD')}"


**중요: 모든 기간은 오늘(${currentDate})을 기준으로 계산하세요!**

**예시 (오늘 ${currentDate} 기준):**
- "한달동안" → periodType: "day", periodValue: 30 (${koreaTime.subtract(30, 'day').format('YYYY-MM-DD')} ~ ${currentDate})
- "1년동안" → periodType: "day", periodValue: 365 (${koreaTime.subtract(365, 'day').format('YYYY-MM-DD')} ~ ${currentDate})
- "5개월동안" → periodType: "day", periodValue: 150 (${koreaTime.subtract(150, 'day').format('YYYY-MM-DD')} ~ ${currentDate})
- "1주전" → periodType: "week", periodValue: 1, timeRange: "custom", fromDate: "${koreaTime.subtract(1, 'week').format('YYYY-MM-DD')}", toDate: "${koreaTime.subtract(1, 'week').format('YYYY-MM-DD')}"
- "2달전" → periodType: "month", periodValue: 2, timeRange: "custom", fromDate: "${koreaTime.subtract(2, 'month').format('YYYY-MM-DD')}", toDate: "${koreaTime.subtract(2, 'month').format('YYYY-MM-DD')}"
- "1년전" → periodType: "year", periodValue: 1, timeRange: "custom", fromDate: "${koreaTime.subtract(1, 'year').format('YYYY-MM-DD')}", toDate: "${koreaTime.subtract(1, 'year').format('YYYY-MM-DD')}"

**과거 기록 참조 예시 (오늘 ${currentDate} 기준):**
- "저번에 마트 갔을 때는 괜찮았는데" → needsChart: true, isAnalysisRequest: true, timeRange: "custom", fromDate: "${koreaTime.subtract(5, 'day').format('YYYY-MM-DD')}", toDate: "${koreaTime.subtract(2, 'day').format('YYYY-MM-DD')}"
- "근래에 기분이 안 좋아" → needsChart: true, isAnalysisRequest: true, timeRange: "custom", fromDate: "${koreaTime.subtract(14, 'day').format('YYYY-MM-DD')}", toDate: "${koreaTime.subtract(1, 'day').format('YYYY-MM-DD')}"
- "이전에는 그렇게 안 했는데" → needsChart: true, isAnalysisRequest: true, timeRange: "custom", fromDate: "${koreaTime.subtract(28, 'day').format('YYYY-MM-DD')}", toDate: "${koreaTime.subtract(7, 'day').format('YYYY-MM-DD')}"
- "과거에 비해 달라진 점" → needsChart: true, isAnalysisRequest: true, timeRange: "custom", fromDate: "${koreaTime.subtract(28, 'day').format('YYYY-MM-DD')}", toDate: "${koreaTime.subtract(7, 'day').format('YYYY-MM-DD')}"

**과거 표현 구체적 계산 (오늘 ${currentDate} 기준):**
- "저번에" → fromDate: ${koreaTime.subtract(5, 'day').format('YYYY-MM-DD')}, toDate: ${koreaTime.subtract(2, 'day').format('YYYY-MM-DD')}
- "근래에" → fromDate: ${koreaTime.subtract(14, 'day').format('YYYY-MM-DD')}, toDate: ${koreaTime.subtract(1, 'day').format('YYYY-MM-DD')}
- "최근에" → fromDate: ${koreaTime.subtract(5, 'day').format('YYYY-MM-DD')}, toDate: ${koreaTime.subtract(1, 'day').format('YYYY-MM-DD')}
- "이전에/과거에" → fromDate: ${koreaTime.subtract(28, 'day').format('YYYY-MM-DD')}, toDate: ${koreaTime.subtract(7, 'day').format('YYYY-MM-DD')}
- "지난번에" → fromDate: ${koreaTime.subtract(7, 'day').format('YYYY-MM-DD')}, toDate: ${koreaTime.subtract(3, 'day').format('YYYY-MM-DD')}

**AI가 스스로 판단하세요. 모든 월(1월~12월), 모든 날짜, 모든 기간을 자연스럽게 인식하고 처리하세요.**

**특별히 주의할 점:**
- "이틀 전", "3일 전", "삼일 전" 등은 모두 periodType: "day", periodValue: 숫자로 처리
- "이틀" = 2, "삼일" = 3, "사일" = 4, "오일" = 5로 정확히 매핑
- 사용자가 자연스럽게 말하는 모든 시간 표현을 이해하고 적절한 periodType과 periodValue로 변환
- 예: "이틀 전은 18일 아니야? 그때 기록을 요약해줘" → periodType: "day", periodValue: 2, timeRange: "custom"`
			}],
			max_tokens: 150,
			temperature: 0.1
		});
		
		// AI 응답에서 JSON 추출
		let content = response.choices[0].message.content;
		console.log('🤖 AI 원본 응답:', content);
		
		// 마크다운 코드 블록 제거
		if (content.includes('```json')) {
			content = content.replace(/```json\s*/, '').replace(/```\s*$/, '');
		} else if (content.includes('```')) {
			content = content.replace(/```\s*/, '').replace(/```\s*$/, '');
		}
		
		// JSON 부분만 추출
		const jsonMatch = content.match(/\{[\s\S]*\}/);
		if (jsonMatch) {
			content = jsonMatch[0];
		}
		
		console.log('🤖 정리된 JSON:', content);
		
		// JSON 파싱
		const result = JSON.parse(content.trim());
		console.log('✅ AI 의도 분석 성공:', result);
		return result;
		
	} catch (error) {
		console.error('❌ AI 의도 분석 실패:', error);
		console.log('🔄 간단한 fallback 분석 시도...');
		
		// 간단한 fallback 분석 (기본값)
		const fallbackResult = {
			isAnalysisRequest: false,
			needsRecords: false,
			needsChatHistory: true,
			needsChart: false,
			isReportRequest: false,
			isSimpleGreeting: true,
			timeRange: 'recent',
			topic: null,
			analysisType: null,
			periodType: null,
			periodValue: null,
			fromDate: null,
			toDate: null
		};
		console.log('✅ Fallback 분석 결과:', fallbackResult);
		return fallbackResult;
	}
}

// 기간 계산 함수 (오늘 기준으로 계산)
export function calculateDateRange(periodType, periodValue) {
	const now = dayjs();
	
	switch (periodType) {
		case 'day':
			return {
				fromDate: now.subtract(periodValue, 'day').format('YYYY-MM-DD'),
				toDate: now.format('YYYY-MM-DD')
			};
		case 'week':
			return {
				fromDate: now.subtract(periodValue, 'week').format('YYYY-MM-DD'),
				toDate: now.format('YYYY-MM-DD')
			};
		case 'month':
			return {
				fromDate: now.subtract(periodValue, 'month').format('YYYY-MM-DD'),
				toDate: now.format('YYYY-MM-DD')
			};
		case 'year':
			return {
				fromDate: now.subtract(periodValue, 'year').format('YYYY-MM-DD'),
				toDate: now.format('YYYY-MM-DD')
			};
		default:
			return null;
	}
}