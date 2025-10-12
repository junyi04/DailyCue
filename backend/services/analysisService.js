import { openai } from '../config/openai.js';
import { supabase } from '../config/database.js';
import dayjs from 'dayjs';

// 데이터 포맷팅: 불필요한 공백 제거 + 날짜 오름차순 정렬 보장
function formatDataForAnalysis(data) {
  return data
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(row => {
      // 피곤함: 1(전혀 피곤하지 않음) ~ 10(극도로 피곤)
      const fatigue = Number(row.fatigue);
      let fatigueText;
      if (Number.isFinite(fatigue)) {
        if (fatigue >= 9) fatigueText = '극도로 피곤';
        else if (fatigue >= 7) fatigueText = '매우 피곤';
        else if (fatigue >= 5) fatigueText = '보통 수준의 피곤';
        else if (fatigue >= 3) fatigueText = '약간 피곤';
        else fatigueText = '전혀 피곤하지 않음';
      } else {
        fatigueText = '알 수 없음';
      }
      // 감정(emotion)도 함께 표기
      const emotion = row.emotion ? `감정: ${row.emotion}` : '';
      return `${row.date}: 피곤함 ${fatigue}점(${fatigueText}) (${row.notes?.trim() || '기록 없음'})${emotion ? ' | ' + emotion : ''}`;
    })
    .join('\n');
}


// 간단한 인메모리 캐시 (프로세스 생명주기 한정)
const analysisCache = new Map(); // key: `${userId}:${fromDate}:${toDate}` -> { result, expiresAt }
const ANALYSIS_TTL_MS = 5 * 60 * 1000; // 5분


// 공통 분석 함수 (기간 지정)
async function analyzePeriod({ user_id = 'test_user', fromDate, toDate }) {
  // 캐시 체크 (Redis 우선, 없으면 메모리)
  const cacheKey = `${user_id}:${fromDate}:${toDate}`;
  try {
    const { getRedisClient } = await import('../config/redis.js');
    const redis = await getRedisClient();
    if (redis) {
      const cachedJson = await redis.get(cacheKey);
      if (cachedJson) {
        return { result: JSON.parse(cachedJson), cached: true };
      }
    } else {
      const cached = analysisCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return { result: cached.result, cached: true };
      }
    }
  } catch (e) {}

  // Supabase 조회
  const { data, error } = await supabase
    .from('records')
    .select('date, fatigue, notes, emotion')
    .eq('user_id', user_id)
    .gte('date', fromDate)
    .lte('date', toDate)
    .order('date', { ascending: true });

  if (error) return { error: error.message };
  if (!data || data.length === 0) {
    return { result: '해당 기간에 데이터가 없습니다. 먼저 기록을 추가해주세요.' };
  }

  const formatted = formatDataForAnalysis(data);

  const systemPrompt = '너는 한국어로 답하는 따뜻한 부모 상담 AI야. 항상 한국어만 사용하고, 영어 등급(very good, okay 등)이나 내부 코드 라벨은 사용하지 마. 사용자는 일반 부모와 자폐/발달장애/ADHD 등 특별한 필요가 있는 아동의 부모일 수 있어. 숫자가 클수록 더 피곤함(1=전혀, 10=극도로). 단정적 진단/의료 판단은 금지하고, 위험 신호(자해·학대·급성 위기)가 의심되면 안전 안내를 덧붙여.';
  const userPrompt = `다음은 부모의 일/주간 피곤함 기록(1~10, 높을수록 피곤)입니다:\n${formatted}\n\n요구사항:\n- 1문장 요약\n- 관찰된 패턴 2~3개(증가/감소/반복 시점, 주말/평일 차이 등)\n- 실행 계획 3가지(아동 지원 2, 부모 자기돌봄 1: 작게 시작)\n- 주의/한계(진단 금지, 필요 시 전문가 상담 권유)`;

  const primaryCall = openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: 290,
    temperature: 0.6
  });

  const softTimeoutMs = 15000;
  const softTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('AI timeout')), softTimeoutMs));

  let completion;
  try {
    completion = await Promise.race([primaryCall, softTimeout]);
  } catch (primaryErr) {
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 320,
        temperature: 0.6
      });
    } catch (fallbackErr) {
      return { error: 'AI 분석 실패', details: fallbackErr?.message || primaryErr?.message };
    }
  }

  const aiResponse = completion?.choices?.[0]?.message?.content || '분석을 생성할 수 없습니다.';

  // 캐시에 저장 (Redis 우선)
  try {
    const { getRedisClient } = await import('../config/redis.js');
    const redis = await getRedisClient();
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(aiResponse), { EX: Math.floor(ANALYSIS_TTL_MS / 1000) });
    } else {
      analysisCache.set(cacheKey, { result: aiResponse, expiresAt: Date.now() + ANALYSIS_TTL_MS });
    }
  } catch (_) {}

  return { result: aiResponse, cached: false };
}

// 커스텀(기간 지정) 분석
export async function analyzeCustomHandler(req, res) {
  try {
    const { from, to, user_id = 'test_user' } = req.body;
    if (!from || !to) {
      return res.status(400).json({ error: 'from, to 파라미터가 필요합니다.' });
    }
    const result = await analyzePeriod({ user_id, fromDate: from, toDate: to });
    if (result.error) return res.status(500).json(result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Analysis error', details: error.message });
  }
}

// 주간 분석 (이번주)
export async function analyzeWeeklyHandler(req, res) {
  try {
    const user_id = req.body?.user_id || req.query?.user_id || 'test_user';
    const now = dayjs();
    const fromDate = now.startOf('week').format('YYYY-MM-DD');
    const toDate = now.format('YYYY-MM-DD');
    const result = await analyzePeriod({ user_id, fromDate, toDate });
    if (result.error) return res.status(500).json(result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Analysis error', details: error.message });
  }
}

// 월간 분석 (이번달)
export async function analyzeMonthlyHandler(req, res) {
  try {
    const user_id = req.body?.user_id || req.query?.user_id || 'test_user';
    const now = dayjs();
    const fromDate = now.startOf('month').format('YYYY-MM-DD');
    const toDate = now.format('YYYY-MM-DD');
    const result = await analyzePeriod({ user_id, fromDate, toDate });
    if (result.error) return res.status(500).json(result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Analysis error', details: error.message });
  }
}

// 연간 분석 (올해)
export async function analyzeYearlyHandler(req, res) {
  try {
    const user_id = req.body?.user_id || req.query?.user_id || 'test_user';
    const now = dayjs();
    const fromDate = now.startOf('year').format('YYYY-MM-DD');
    const toDate = now.format('YYYY-MM-DD');
    const result = await analyzePeriod({ user_id, fromDate, toDate });
    if (result.error) return res.status(500).json(result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Analysis error', details: error.message });
  }
}
