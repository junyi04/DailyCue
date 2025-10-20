import { openai } from '../../config/openai.js';
import { supabase } from '../../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

// dayjs 플러그인 설정
dayjs.extend(utc);
dayjs.extend(timezone);

// 분리된 모듈들 import
import { textFilter } from './textFilter.js';
import { analyzeUserIntent, calculateDateRange } from './intentAnalyze.js';
import { generateEmotionChart } from './chartGenerator.js';
// 차트 저장 관련 함수들을 직접 정의

/**
 * 차트 저장 함수
 * @param {string} userId - 사용자 ID
 * @param {Object} chartData - 차트 데이터
 * @param {Object} chartConfig - 차트 설정
 * @param {string} chartType - 차트 타입 (line, bar, pie)
 * @param {string} periodStart - 차트 기간 시작일
 * @param {string} periodEnd - 차트 기간 종료일
 * @returns {Promise<Object>} 저장 결과
 */
async function saveChart(userId, chartData, chartConfig, chartType, periodStart, periodEnd) {
  try {
    console.log('📊 차트 저장 시작:', { userId, chartType, periodStart, periodEnd });

    // 차트 이름 생성
    const chartName = `${periodStart} 감정 차트`;

    // 새 차트 저장
    const { data, error } = await supabase
      .from('saved_charts')
      .insert({
        user_id: userId,
        chart_name: chartName,
        chart_type: chartType,
        chart_data: chartData,
        chart_config: chartConfig,
        period_start: periodStart,
        period_end: periodEnd
      })
      .select()
      .single();

    if (error) {
      console.error('❌ 차트 저장 오류:', error);
      throw error;
    }

    console.log('✅ 차트 저장 성공:', data.id);

    // 20개 제한 자동 정리
    await cleanupOldCharts(userId);

    return {
      success: true,
      chartId: data.id,
      message: '차트가 성공적으로 저장되었습니다.'
    };

  } catch (error) {
    console.error('🚨 차트 저장 실패:', error);
    throw error;
  }
}

/**
 * 사용자의 저장된 차트 목록 조회
 * @param {string} userId - 사용자 ID
 * @param {number} limit - 조회할 개수 (기본값: 20)
 * @returns {Promise<Array>} 차트 목록
 */
async function getSavedCharts(userId, limit = 20) {
  try {
    console.log('📚 저장된 차트 조회:', { userId, limit });

    const { data, error } = await supabase
      .from('saved_charts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ 차트 조회 오류:', error);
      throw error;
    }

    console.log('✅ 차트 조회 성공:', data?.length || 0, '개');

    return data || [];

  } catch (error) {
    console.error('🚨 차트 조회 실패:', error);
    throw error;
  }
}

/**
 * 특정 차트 조회
 * @param {string} chartId - 차트 ID
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Object>} 차트 정보
 */
async function getChartById(chartId, userId) {
  try {
    console.log('🔍 특정 차트 조회:', { chartId, userId });

    const { data, error } = await supabase
      .from('saved_charts')
      .select('*')
      .eq('id', chartId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('❌ 차트 조회 오류:', error);
      throw error;
    }

    console.log('✅ 차트 조회 성공:', data.id);

    return data;

  } catch (error) {
    console.error('🚨 차트 조회 실패:', error);
    throw error;
  }
}

/**
 * 차트 삭제
 * @param {string} chartId - 차트 ID
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Object>} 삭제 결과
 */
async function deleteChart(chartId, userId) {
  try {
    console.log('🗑️ 차트 삭제:', { chartId, userId });

    const { data, error } = await supabase
      .from('saved_charts')
      .delete()
      .eq('id', chartId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ 차트 삭제 오류:', error);
      throw error;
    }

    console.log('✅ 차트 삭제 성공:', data.id);

    return {
      success: true,
      message: '차트가 성공적으로 삭제되었습니다.'
    };

  } catch (error) {
    console.error('🚨 차트 삭제 실패:', error);
    throw error;
  }
}

/**
 * 20개 제한 자동 정리 함수
 * @param {string} userId - 사용자 ID
 * @param {number} maxCharts - 최대 차트 개수 (기본값: 20)
 */
async function cleanupOldCharts(userId, maxCharts = 20) {
  try {
    console.log('🧹 차트 자동 정리 시작:', { userId, maxCharts });

    // 사용자의 총 차트 개수 확인
    const { count, error: countError } = await supabase
      .from('saved_charts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error('❌ 차트 개수 확인 오류:', countError);
      return;
    }

    console.log('📊 현재 차트 개수:', count);

    // 20개 초과 시 오래된 것들 삭제
    if (count > maxCharts) {
      const deleteCount = count - maxCharts;
      console.log('🗑️ 삭제할 차트 개수:', deleteCount);

      // 오래된 차트들 조회
      const { data: oldCharts, error: selectError } = await supabase
        .from('saved_charts')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(deleteCount);

      if (selectError) {
        console.error('❌ 오래된 차트 조회 오류:', selectError);
        return;
      }

      // 오래된 차트들 삭제
      const idsToDelete = oldCharts.map(chart => chart.id);
      const { error: deleteError } = await supabase
        .from('saved_charts')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) {
        console.error('❌ 오래된 차트 삭제 오류:', deleteError);
        return;
      }

      console.log('✅ 자동 정리 완료:', deleteCount, '개 차트 삭제됨');
    } else {
      console.log('✅ 정리 불필요:', '현재 차트 개수가 제한 이하');
    }

  } catch (error) {
    console.error('🚨 자동 정리 실패:', error);
  }
}

/**
 * 사용자별 차트 통계 조회
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Object>} 통계 정보
 */
async function getChartStats(userId) {
  try {
    console.log('📈 차트 통계 조회:', { userId });

    const { data, error } = await supabase
      .from('saved_charts')
      .select('chart_type, created_at')
      .eq('user_id', userId);

    if (error) {
      console.error('❌ 차트 통계 조회 오류:', error);
      throw error;
    }

    // 차트 타입별 개수 계산
    const typeStats = data.reduce((acc, chart) => {
      acc[chart.chart_type] = (acc[chart.chart_type] || 0) + 1;
      return acc;
    }, {});

    // 최근 생성일
    const latestChart = data.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    )[0];

    const stats = {
      totalCharts: data.length,
      typeStats,
      latestChart: latestChart ? {
        type: latestChart.chart_type,
        createdAt: latestChart.created_at
      } : null
    };

    console.log('✅ 차트 통계 조회 성공:', stats);

    return stats;

  } catch (error) {
    console.error('🚨 차트 통계 조회 실패:', error);
    throw error;
  }
}

// 맥락 포함 프롬프트 생성 함수
function createContextPrompt(userMessage, recentMessages) {
	if (!recentMessages || recentMessages.length === 0) {
		return userMessage;
	}
	
	// 최근 대화를 텍스트로 변환
	const context = recentMessages
		.map(msg => `${msg.user ? '사용자' : 'AI'}: ${msg.text}`)
		.join('\n');
	
	return `
이전 대화 맥락:
${context}

현재 질문: ${userMessage}

위 대화 맥락을 참고하여 답변해주세요. "그거", "저번에", "아까" 같은 표현이 있으면 이전 대화 내용을 참고해서 답변해주세요.
	`.trim();
}


async function handleSmartRequest(req, res, intent, user_id, messageId) {
	try {
		// AI가 스스로 판단: 데이터가 필요한지 확인
		const needsData = await checkIfNeedsData(req.body.message, intent);
		
		if (!needsData) {
			// 데이터 불필요 → AI가 직접 답변
			await handleSimpleRequest(req, res, intent, user_id, messageId);
		} else {
			// 데이터 필요 → 조회 후 답변
			await handleRequest(req, res, intent, user_id, messageId);
		}
	} catch (error) {
		console.error('Smart request error:', error);
		res.status(500).json({ error: '요청 처리 중 오류가 발생했습니다.' });
	}
}

// 데이터 필요 여부 확인 함수
async function checkIfNeedsData(message, intent) {
	try {
		const completion = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content: `사용자 질문을 분석해서 데이터베이스 조회가 필요한지 판단해주세요.

**데이터 조회 필요:**
- "오늘 기록 분석해줘", "10월 보여줘", "어제 피곤함은?", "이번 주 패턴은?"
- 기록, 분석, 차트, 데이터, 피곤함, 감정 관련 질문

**데이터 조회 불필요:**
- "오늘 몇일이야?", "안녕하세요", "고마워", "날씨는?", "시간이 몇시야?"
- 일반적인 대화, 시간/날짜 질문, 인사

JSON 형식으로 답변: {"needsData": true/false}`
				},
				{
					role: 'user',
					content: `질문: "${message}"`
				}
			],
			max_tokens: 50,
			temperature: 0.1
		});

		const response = completion?.choices?.[0]?.message?.content;
		const parsed = JSON.parse(response);
		return parsed.needsData || false;
	} catch (error) {
		console.error('Data check error:', error);
		// 에러 시 의도 분석 결과 사용
		return intent.needsRecords || intent.isAnalysisRequest;
	}
}

// 간단한 질문 처리 함수
async function handleSimpleRequest(req, res, intent, user_id, messageId) {
	try {
		// 현재 날짜 정보 추가
		const now = dayjs();
		const koreaTime = now.tz('Asia/Seoul');
		const currentDate = koreaTime.format('YYYY년 MM월 DD일');
		const currentTime = koreaTime.format('HH:mm');
		
		// 맥락 포함 프롬프트 생성
		const contextPrompt = createContextPrompt(req.body.message, req.body.recent_messages || []);
		
		// 간단한 AI 응답
		const completion = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content: `너는 한국어로 답하는 따뜻한 부모 상담 AI야. 간단한 질문에 친근하게 답변해줘.

**현재 정보:**
- 오늘 날짜: ${currentDate}
- 현재 시간: ${currentTime}
- 요일: ${koreaTime.format('dddd')}

날짜나 시간 관련 질문이면 위 정보를 사용해서 정확하게 답변해줘.`
				},
				{
					role: 'user',
					content: contextPrompt
				}
			],
			max_tokens: 300,
			temperature: 0.7
		});

		const aiResponse = completion?.choices?.[0]?.message?.content || '죄송하지만 다시 시도해 주시면 감사하겠습니다.';

		// 응답
		const responseData = {
			aiResponse: aiResponse,
			analysisType: 'conversation',
			dateRange: null,
			isAnalysis: false,
			chatHistory: [],
			chartData: null
		};

		res.json(responseData);

		// AI 답변 저장
		supabase
			.from('chat_messages')
			.update({ ai_answer: aiResponse })
			.eq('id', messageId)
			.then(() => null)
			.catch((e) => console.error('AI answer update error:', e?.message || e));

	} catch (error) {
		console.error('Simple request error:', error);
		res.status(500).json({ error: '요청 처리 중 오류가 발생했습니다.' });
	}
}

// 통합 요청 처리 함수
async function handleRequest(req, res, intent, user_id, messageId) {
	try {
		console.log('🔍 요청 타입 분석:', {
			isReportRequest: intent.isReportRequest,
			needsChart: intent.needsChart,
			isAnalysisRequest: intent.isAnalysisRequest,
			topic: intent.topic
		});

		// 리포트 요청인 경우 별도 처리
		if (intent.isReportRequest) {
			console.log('📊 리포트 요청 처리:', intent);
			
			// 날짜 결정
			let targetDate;
			if (intent.timeRange === 'today') {
				const now = dayjs();
				const koreaTime = now.tz('Asia/Seoul');
				targetDate = koreaTime.format('YYYY-MM-DD');
			} else if (intent.timeRange === 'yesterday') {
				const now = dayjs();
				const koreaTime = now.tz('Asia/Seoul');
				targetDate = koreaTime.subtract(1, 'day').format('YYYY-MM-DD');
			} else if (intent.timeRange === 'custom' && intent.periodType && intent.periodValue) {
				// X일전, X주전, X달전, X년전 처리
				const now = dayjs();
				const koreaTime = now.tz('Asia/Seoul');
				targetDate = koreaTime.subtract(intent.periodValue, intent.periodType).format('YYYY-MM-DD');
				console.log('📅 상대적 날짜 계산:', {
					periodType: intent.periodType,
					periodValue: intent.periodValue,
					targetDate: targetDate,
					originalMessage: req.body.message,
					currentDate: koreaTime.format('YYYY-MM-DD')
				});
			} else {
				// 기본값: 오늘
				const now = dayjs();
				const koreaTime = now.tz('Asia/Seoul');
				targetDate = koreaTime.format('YYYY-MM-DD');
			}
			
			// 리포트 타입 결정 (요약 vs 리포트)
			const reportType = intent.topic === '요약' ? 'summary' : 'report';
			
			// 리포트 생성
			const result = await generateDateReport(user_id, targetDate, reportType);
			
			if (result.success) {
				const responseData = {
					aiResponse: result.report,
					analysisType: 'report',
					dateRange: `${targetDate} ~ ${targetDate}`,
					isAnalysis: true,
					chatHistory: [],
					chartData: null,
					reportData: {
						hasData: result.hasData,
						recordsCount: result.recordsCount || 0,
						chatCount: result.chatCount || 0,
						date: targetDate
					}
				};
				res.json(responseData);

				// AI 답변을 chat_messages 테이블에 저장
				supabase
					.from('chat_messages')
					.update({ ai_answer: result.report })
					.eq('id', messageId)
					.then(() => console.log('✅ 리포트 AI 답변 저장 완료'))
					.catch((e) => console.error('❌ 리포트 AI 답변 저장 오류:', e?.message || e));

			} else {
				const errorResponse = {
					aiResponse: result.error || '리포트 생성 중 오류가 발생했습니다.',
					analysisType: 'report',
					dateRange: `${targetDate} ~ ${targetDate}`,
					isAnalysis: true,
					chatHistory: [],
					chartData: null
				};
				res.status(500).json(errorResponse);

				// 에러 메시지도 chat_messages 테이블에 저장
				supabase
					.from('chat_messages')
					.update({ ai_answer: result.error || '리포트 생성 중 오류가 발생했습니다.' })
					.eq('id', messageId)
					.then(() => console.log('✅ 에러 메시지 저장 완료'))
					.catch((e) => console.error('❌ 에러 메시지 저장 오류:', e?.message || e));
			}
			return;
		}
		
		// 1. 데이터 조회
		const data = await getData(intent, user_id);
		
		// 2. 데이터 없으면 바로 응답
		if (!data || data.length === 0) {
			const responseData = {
				aiResponse: "해당 기간에 기록이 없습니다. 먼저 기록을 추가해주세요.",
				analysisType: intent.analysisType || 'period',
				dateRange: getDateRangeDisplay(intent),
				isAnalysis: intent.isAnalysisRequest || false,
				chatHistory: [],
				chartData: {
					type: 'message',
					message: '해당 기간에 차트를 생성할 수 있는 데이터가 없습니다.',
					noData: true
				}
			};
			res.json(responseData);
			return;
		}
		
		// 3. 데이터 있으면 분석
		const analysisResult = await analyzeData(data, intent, req.body.message, req.body.recent_messages || []);
		
		// 4. 차트 생성 (필요한 경우)
		let chartData = null;
		if (intent.needsChart) {
			// dateRange 정보 생성
			const periodStart = intent.fromDate || calculateDateRange(intent.periodType || 'month', intent.periodValue || 1).fromDate;
			const periodEnd = intent.toDate || calculateDateRange(intent.periodType || 'month', intent.periodValue || 1).toDate;
			const dateRange = `${periodStart} ~ ${periodEnd}`;
			
			chartData = generateEmotionChart(data, req.body.message, dateRange);
			
			// 차트가 생성되면 자동으로 저장
			if (chartData && chartData.data) {
				try {
					
					const saveResult = await saveChart(
						user_id,
						chartData.data,
						chartData.config || {},
						chartData.type || 'line',
						periodStart,
						periodEnd
					);
					
					// 차트 ID를 chartData에 추가
					if (saveResult && saveResult.chartId) {
						chartData.chartId = saveResult.chartId;
					}
					
					console.log('📊 차트 자동 저장 완료');
				} catch (error) {
					console.error('❌ 차트 저장 실패:', error);
					// 차트 저장 실패해도 응답은 계속 진행
				}
			}
		}
		
		// 5. 응답
		const responseData = {
			aiResponse: analysisResult.result,
			analysisType: intent.analysisType || 'period',
			dateRange: getDateRangeDisplay(intent),
			isAnalysis: intent.isAnalysisRequest || false,
			chatHistory: [],
			chartData: chartData
		};
		
		res.json(responseData);
		
		// 6. AI 답변 및 차트 ID 저장
		const updateData = { 
			ai_answer: analysisResult.result
		};
		
		// 차트가 생성되었으면 saved_chart_id 저장
		if (chartData && chartData.chartId) {
			updateData.saved_chart_id = chartData.chartId;
		}
		
		supabase
			.from('chat_messages')
			.update(updateData)
			.eq('id', messageId)
			.then(() => null)
			.catch((e) => console.error('AI answer update error:', e?.message || e));
			
	} catch (error) {
		console.error('Request handling error:', error);
		res.status(500).json({ error: '요청 처리 중 오류가 발생했습니다.' });
	}
}

// 데이터 조회 함수
async function getData(intent, user_id) {
	let fromDate, toDate;
	
	// 🚨 AI의 잘못된 날짜 무시하고 직접 계산
	if (intent.timeRange === 'today') {
		const now = dayjs();
		const koreaTime = now.tz('Asia/Seoul');
		fromDate = toDate = koreaTime.format('YYYY-MM-DD');
	} else if (intent.timeRange === 'yesterday') {
		const now = dayjs();
		const koreaTime = now.tz('Asia/Seoul');
		fromDate = toDate = koreaTime.subtract(1, 'day').format('YYYY-MM-DD');
	} else if (intent.analysisType === 'custom' && intent.fromDate && intent.toDate) {
		// 커스텀 날짜만 AI 결과 사용 (월별 분석 등)
		fromDate = intent.fromDate;
		toDate = intent.toDate;
	} else {
		// 기간 분석의 경우
		fromDate = intent.fromDate || calculateDateRange(intent.periodType || 'month', intent.periodValue || 1).fromDate;
		toDate = intent.toDate || calculateDateRange(intent.periodType || 'month', intent.periodValue || 1).toDate;
	}
	
	console.log('📊 데이터 조회:', { fromDate, toDate });
	
	// 데이터 조회
	const { data: records } = await supabase
		.from('records')
		.select('date, title, notes, fatigue, emotion, created_at')
		.eq('user_id', user_id)
		.gte('date', fromDate)
		.lte('date', toDate)
		.order('created_at', { ascending: true });
	
	return records || [];
}

// 데이터 분석 함수
async function analyzeData(data, intent, userMessage, recentMessages) {
	// 데이터 포맷팅
	const formatted = data
		.sort((a, b) => new Date(a.date) - new Date(b.date))
		.map(row => {
			const fatigue = Number(row.fatigue);
			let fatigueText;
			if (Number.isFinite(fatigue)) {
				if (fatigue >= 5) fatigueText = '극도로 피곤';
				else if (fatigue >= 4) fatigueText = '매우 피곤';
				else if (fatigue >= 3) fatigueText = '보통 피곤';
				else if (fatigue >= 2) fatigueText = '약간 피곤';
				else if (fatigue >= 1) fatigueText = '조금 피곤';
				else fatigueText = '전혀 안 피곤';
			} else {
				fatigueText = '점수 없음';
			}
			
			const emotion = row.emotion ? `감정: ${row.emotion}` : '';
			return `${row.date}: 피곤함 ${fatigue}점(${fatigueText}) (${row.notes?.trim() || '기록 없음'})${emotion ? ' | ' + emotion : ''}`;
		})
		.join('\n');

	const systemPrompt = `너는 한국어로 답하는 따뜻한 부모 상담 AI야. 항상 한국어만 사용하고, 영어 등급(very good, okay 등)이나 내부 코드 라벨은 사용하지 마. 사용자는 일반 부모와 자폐/발달장애/ADHD 등 특별한 필요가 있는 아동의 부모일 수 있어. 숫자가 클수록 더 피곤함(0=전혀 안 피곤, 5=극도로 피곤). 부모님의 노고를 인정하고 격려하며, 실용적인 조언을 제공해줘.

	**🚨 절대 금지 사항:**
	- **절대로 가짜 데이터나 존재하지 않는 기록을 만들어내지 마**
	- **절대로 추측이나 가정으로 데이터를 생성하지 마**
	- **제공된 기록 데이터만 사용하고, 없으면 없다고 명확히 말해줘**
	- **"아마도", "추정으로는", "예상으로는" 같은 표현으로 가짜 정보를 만들지 마**`;
	
	// 맥락 포함 프롬프트 생성
	const contextPrompt = createContextPrompt(userMessage, recentMessages);
	
	const userPrompt = `다음은 부모의 일/주간 피곤함 기록(0~5, 높을수록 피곤)입니다:\n${formatted}\n\n요구사항:\n- 1문장 요약\n- 관찰된 패턴 2~3개(증가/감소/반복 시점, 주말/평일 차이 등)\n- 실행 계획 3가지(아동 지원 2, 부모 자기돌봄 1: 작게 시작)\n- 격려와 응원 메시지\n\n현재 질문: ${contextPrompt}`;

	try {
		const completion = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userPrompt }
			],
			max_tokens: 500,
			temperature: 0.6
		});

		const aiResponse = completion?.choices?.[0]?.message?.content || '분석을 생성할 수 없습니다.';
		return { result: aiResponse, cached: false };
	} catch (error) {
		return { error: 'AI 분석 실패', details: error?.message };
	}
}

// 날짜 범위 표시 함수
function getDateRangeDisplay(intent) {
	if (intent.analysisType === 'specific' && intent.timeRange) {
		const now = dayjs();
		const koreaTime = now.tz('Asia/Seoul');
		
		if (intent.timeRange === 'today') {
			const today = koreaTime.format('YYYY-MM-DD');
			return `${today} ~ ${today}`;
		} else if (intent.timeRange === 'yesterday') {
			const yesterday = koreaTime.subtract(1, 'day').format('YYYY-MM-DD');
			return `${yesterday} ~ ${yesterday}`;
		} else {
			const today = koreaTime.format('YYYY-MM-DD');
			return `${today} ~ ${today}`;
		}
	} else if (intent.fromDate && intent.toDate) {
		return `${intent.fromDate} ~ ${intent.toDate}`;
	} else {
		return `최근 ${intent.periodValue || 1}${intent.periodType || 'month'}`;
	}
}

// 메인 채팅 요청 처리 함수
export async function handleChatRequest(req, res) {
	try {
		const { message, user_id = 'test_user', recent_messages = [] } = req.body;
		const trimmed = typeof message === 'string' ? message.trim() : '';
		if (!trimmed) {
			return res.status(400).json({ error: 'Message is required' });
		}

		// 최근 대화 맥락 생성
		const contextPrompt = createContextPrompt(trimmed, recent_messages);
		console.log('📚 맥락 포함 프롬프트:', contextPrompt);

		// 1. 사용자 의도 분석
		let intent;
		try {
			intent = await analyzeUserIntent(trimmed);
			console.log('🔍 의도 분석 결과:', intent);
		} catch (error) {
			console.error('의도 분석 실패, 기본값 사용:', error);
			// 의도 분석 실패 시 기본값 사용
			intent = {
				isAnalysisRequest: false,
				needsRecords: true,
				needsChatHistory: true,
				needsChart: false,
				isSimpleGreeting: false,
				timeRange: 'recent',
				topic: null,
				analysisType: null,
				periodType: null,
				periodValue: null,
				fromDate: null,
				toDate: null
			};
		}

		// 2. 메시지 ID 생성 및 저장
		const messageId = uuidv4();
		const { error: insertError } = await supabase
			.from('chat_messages')
			.insert({ id: messageId, user_id, user_chat: trimmed, ai_answer: null });
		
		if (insertError) {
			console.error('User message insert error:', insertError);
			return res.status(500).json({ error: '메시지 저장 실패' });
		}

		// 3. AI가 스스로 판단해서 처리
		await handleSmartRequest(req, res, intent, user_id, messageId);

	} catch (error) {
		console.error('🚨 Chatbot error:', error);
		console.error('🚨 Error stack:', error.stack);
		res.status(500).json({ 
			error: '분석 처리 중 오류가 발생했습니다.',
			details: error.message 
		});
	}
}

// 채팅 기록 조회 함수
export async function getChatHistory(req, res) {
	try {
		const { user_id } = req.query;
		
		if (!user_id) {
			return res.status(400).json({ error: 'user_id가 필요합니다.' });
		}
		
		console.log('📚 채팅 기록 조회:', { user_id });
		
		// 최근 20개 채팅 기록 조회 (차트 ID 포함)
		const { data: chatHistory, error } = await supabase
			.from('chat_messages')
			.select('user_chat, ai_answer, created_at, saved_chart_id')
			.eq('user_id', user_id)
			.order('created_at', { ascending: true })
			.limit(20);
		
		if (error) {
			console.error('❌ 채팅 기록 조회 오류:', error);
			return res.status(500).json({ error: '채팅 기록 조회 중 오류가 발생했습니다.' });
		}
		
		console.log('✅ 채팅 기록 조회 성공:', chatHistory?.length || 0, '개');
		
		// 차트 데이터가 있는 메시지들에 대해 차트 정보 조회
		const chatHistoryWithCharts = await Promise.all(
			(chatHistory || []).map(async (chat) => {
				if (chat.saved_chart_id) {
					try {
						const { data: chartData, error: chartError } = await supabase
							.from('saved_charts')
							.select('chart_data, chart_type')
							.eq('id', chat.saved_chart_id)
							.single();
						
						if (!chartError && chartData) {
							// 차트 데이터를 올바른 구조로 재구성
							const reconstructedChartData = {
								type: chartData.chart_type,
								data: chartData.chart_data,
								options: chartData.chart_data?.options || {}
							};
							
							return {
								...chat,
								chart_data: reconstructedChartData
							};
						}
					} catch (error) {
						console.warn('차트 데이터 조회 실패:', error);
					}
				}
				return chat;
			})
		);
		
		res.json({
			chatHistory: chatHistoryWithCharts,
			count: chatHistoryWithCharts.length
		});
		
	} catch (error) {
		console.error('🚨 채팅 기록 조회 오류:', error);
		res.status(500).json({ 
			error: '채팅 기록 조회 중 오류가 발생했습니다.',
			details: error.message 
		});
	}
}

// 저장된 차트 목록 조회
export async function getSavedChartsAPI(req, res) {
	try {
		const { user_id } = req.query;
		const { limit = 20 } = req.query;
		
		if (!user_id) {
			return res.status(400).json({ error: 'user_id가 필요합니다.' });
		}
		
		console.log('📚 저장된 차트 조회:', { user_id, limit });
		
		const charts = await getSavedCharts(user_id, parseInt(limit));
		
		res.json({
			success: true,
			charts: charts,
			count: charts.length
		});
		
	} catch (error) {
		console.error('🚨 저장된 차트 조회 오류:', error);
		res.status(500).json({ 
			error: '저장된 차트 조회 중 오류가 발생했습니다.',
			details: error.message 
		});
	}
}

// 특정 차트 조회
export async function getChartByIdAPI(req, res) {
	try {
		const { chartId } = req.params;
		const { user_id } = req.query;
		
		if (!user_id || !chartId) {
			return res.status(400).json({ error: 'user_id와 chartId가 필요합니다.' });
		}
		
		console.log('🔍 특정 차트 조회:', { chartId, user_id });
		
		const chart = await getChartById(chartId, user_id);
		
		res.json({
			success: true,
			chart: chart
		});
		
	} catch (error) {
		console.error('🚨 특정 차트 조회 오류:', error);
		res.status(500).json({ 
			error: '차트 조회 중 오류가 발생했습니다.',
			details: error.message 
		});
	}
}

// 차트 삭제
export async function deleteChartAPI(req, res) {
	try {
		const { chartId } = req.params;
		const { user_id } = req.body;
		
		if (!user_id || !chartId) {
			return res.status(400).json({ error: 'user_id와 chartId가 필요합니다.' });
		}
		
		console.log('🗑️ 차트 삭제:', { chartId, user_id });
		
		const result = await deleteChart(chartId, user_id);
		
		res.json({
			success: true,
			message: result.message
		});
		
	} catch (error) {
		console.error('🚨 차트 삭제 오류:', error);
		res.status(500).json({ 
			error: '차트 삭제 중 오류가 발생했습니다.',
			details: error.message 
		});
	}
}

// 차트 통계 조회
export async function getChartStatsAPI(req, res) {
	try {
		const { user_id } = req.query;
		
		if (!user_id) {
			return res.status(400).json({ error: 'user_id가 필요합니다.' });
		}
		
		console.log('📈 차트 통계 조회:', { user_id });
		
		const stats = await getChartStats(user_id);
		
		res.json({
			success: true,
			stats: stats
		});
		
	} catch (error) {
		console.error('🚨 차트 통계 조회 오류:', error);
		res.status(500).json({ 
			error: '차트 통계 조회 중 오류가 발생했습니다.',
			details: error.message 
		});
	}
}

// 날짜별 기록과 채팅 메시지를 함께 조회하는 함수
async function getDateData(user_id, targetDate) {
	try {
		console.log('📅 날짜별 데이터 조회:', { user_id, targetDate });
		
		// 1. 해당 날짜의 기록 조회
		const { data: records, error: recordsError } = await supabase
			.from('records')
			.select('date, title, notes, fatigue, emotion, created_at')
			.eq('user_id', user_id)
			.eq('date', targetDate)
			.order('created_at', { ascending: true });

		if (recordsError) {
			console.error('❌ 기록 조회 오류:', recordsError);
			throw recordsError;
		}

		// 2. 해당 날짜의 채팅 메시지 조회
		const startOfDay = dayjs(targetDate).startOf('day').toISOString();
		const endOfDay = dayjs(targetDate).endOf('day').toISOString();
		
		const { data: chatMessages, error: chatError } = await supabase
			.from('chat_messages')
			.select('user_chat, ai_answer, created_at')
			.eq('user_id', user_id)
			.gte('created_at', startOfDay)
			.lte('created_at', endOfDay)
			.order('created_at', { ascending: true });

		if (chatError) {
			console.error('❌ 채팅 조회 오류:', chatError);
			throw chatError;
		}

		console.log('✅ 날짜별 데이터 조회 완료:', {
			recordsCount: records?.length || 0,
			chatCount: chatMessages?.length || 0
		});

		return {
			records: records || [],
			chatMessages: chatMessages || []
		};

	} catch (error) {
		console.error('🚨 날짜별 데이터 조회 실패:', error);
		throw error;
	}
}

// 날짜별 리포트/요약 생성 함수
async function generateDateReport(user_id, targetDate, reportType = 'report') {
	try {
		console.log('📊 날짜별 리포트 생성 시작:', { user_id, targetDate, reportType });
		
		// 1. 해당 날짜의 데이터 조회
		const { records, chatMessages } = await getDateData(user_id, targetDate);
		
		// 2. 데이터가 없으면 빈 리포트 반환
		if (records.length === 0 && chatMessages.length === 0) {
			return {
				success: true,
				report: `${targetDate}에는 기록된 데이터가 없습니다.`,
				hasData: false
			};
		}

		// 3. 기록 데이터 포맷팅
		const formattedRecords = records.map(record => {
			const fatigue = Number(record.fatigue);
			let fatigueText;
			if (Number.isFinite(fatigue)) {
				if (fatigue >= 5) fatigueText = '극도로 피곤';
				else if (fatigue >= 4) fatigueText = '매우 피곤';
				else if (fatigue >= 3) fatigueText = '보통 피곤';
				else if (fatigue >= 2) fatigueText = '약간 피곤';
				else if (fatigue >= 1) fatigueText = '조금 피곤';
				else fatigueText = '전혀 안 피곤';
			} else {
				fatigueText = '점수 없음';
			}
			
			const time = record.created_at ? 
				dayjs(record.created_at).tz('Asia/Seoul').format('HH:mm') : 
				'시간 미상';
			
			return `[${time}] 피곤함 ${fatigue}점(${fatigueText}) - ${record.title || '제목 없음'}\n   내용: ${record.notes?.trim() || '기록 없음'}${record.emotion ? ` | 감정: ${record.emotion}` : ''}`;
		}).join('\n\n');

		// 4. 채팅 데이터 포맷팅
		const formattedChats = chatMessages.map(chat => {
			const time = dayjs(chat.created_at).tz('Asia/Seoul').format('HH:mm');
			return `[${time}] 사용자: ${chat.user_chat}\n[${time}] AI: ${chat.ai_answer}`;
		}).join('\n\n');

		// 5. AI 프롬프트 생성
		const systemPrompt = `당신은 부모의 일상 기록을 분석하는 전문가입니다. 
제공된 기록과 대화 내용을 바탕으로 ${reportType === 'report' ? '상세한 리포트' : '간결한 요약'}를 작성해주세요.

**🚨 절대 금지 사항:**
- 제공된 데이터에 없는 내용을 추측하거나 만들어내지 마세요
- 실제 기록과 대화 내용만을 바탕으로 분석하세요
- 데이터가 없으면 없다고 명확히 말하세요`;

		const userPrompt = `다음은 ${targetDate}의 기록과 AI 대화 내용입니다:

**📝 기록 내용:**
${formattedRecords || '기록 없음'}

**💬 AI 대화 내용:**
${formattedChats || '대화 없음'}

위 데이터를 바탕으로 ${reportType === 'report' ? '다음 형식의 상세 리포트' : '다음 형식의 간결한 요약'}를 작성해주세요:

${reportType === 'report' ? 
`1. 📊 하루 요약 (1-2문장)
2. 📈 감정/피로도 패턴 분석
3. 💭 주요 고민사항 및 대화 내용
4. 🎯 개선점 및 제안사항
5. 💪 격려 메시지` : 
`1. 📊 하루 요약 (1문장)
2. 📈 주요 패턴 (2-3개)
3. 💡 핵심 제안 (1-2개)
4. 💪 격려 메시지`}`;

		// 6. AI에게 리포트 생성 요청
		const completion = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userPrompt }
			],
			max_tokens: reportType === 'report' ? 800 : 400,
			temperature: 0.6
		});

		const aiReport = completion?.choices?.[0]?.message?.content || '리포트를 생성할 수 없습니다.';

		console.log('✅ 날짜별 리포트 생성 완료');

		return {
			success: true,
			report: aiReport,
			hasData: true,
			recordsCount: records.length,
			chatCount: chatMessages.length
		};

	} catch (error) {
		console.error('🚨 날짜별 리포트 생성 실패:', error);
		return {
			success: false,
			error: '리포트 생성 중 오류가 발생했습니다.',
			details: error.message
		};
	}
}

// 날짜별 리포트 생성 API 엔드포인트
export async function generateDateReportAPI(req, res) {
	try {
		const { user_id, date, type = 'report' } = req.body;
		
		if (!user_id || !date) {
			return res.status(400).json({ 
				error: 'user_id와 date는 필수입니다.' 
			});
		}

		// 날짜 유효성 검사
		const targetDate = dayjs(date).format('YYYY-MM-DD');
		if (!dayjs(targetDate).isValid()) {
			return res.status(400).json({ 
				error: '올바른 날짜 형식이 아닙니다. (YYYY-MM-DD)' 
			});
		}

		console.log('📊 날짜별 리포트 API 요청:', { user_id, date: targetDate, type });

		// 리포트 생성
		const result = await generateDateReport(user_id, targetDate, type);

		if (result.success) {
			res.json({
				success: true,
				report: result.report,
				hasData: result.hasData,
				recordsCount: result.recordsCount || 0,
				chatCount: result.chatCount || 0,
				date: targetDate
			});
		} else {
			res.status(500).json({
				success: false,
				error: result.error,
				details: result.details
			});
		}

	} catch (error) {
		console.error('🚨 날짜별 리포트 API 오류:', error);
		res.status(500).json({ 
			success: false,
			error: '서버 오류가 발생했습니다.',
			details: error.message 
		});
	}
}