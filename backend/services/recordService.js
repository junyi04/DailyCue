
import { supabase } from '../config/database.js';
import { openai } from '../config/openai.js';



export async function handleRecordRequest(req, res) {
	try {
		const { user_id, date, fatigue, notes, title } = req.body;
		
		console.log('📥 백엔드에서 받은 데이터:', req.body);
		console.log('📥 title 값:', title);
		console.log('📥 title 타입:', typeof title);

		if (!user_id || !date || !fatigue) {
			return res.status(400).json({
				error: 'Missing required fields',
				required: ['user_id', 'date', 'fatigue']
			});
		}

		if (fatigue < 1 || fatigue > 10) {
			return res.status(400).json({
				error: 'Fatigue must be between 1-10'
			});
		}

		// notes가 있으면 감정 분석
		let emotion = null;
		if (typeof notes === 'string' && notes.trim().length > 0) {
			try {
				const prompt = `다음 텍스트(고민 내용)를 종합적으로 읽고, 가장 대표적인 감정 하나만 한글 단어(예: 행복, 우울, 분노, 스트레스, 불안, 평온, 보람 등)로 알려줘. 반드시 한 단어만 답해:\n"""\n${notes.trim()}\n"""`;
				   const completion = await openai.chat.completions.create({
					   model: 'gpt-4o-mini',
					   messages: [
						   { role: 'system', content: '너는 감정 분석가야. 반드시 한글 감정 단어 하나만 답해.' },
						   { role: 'user', content: prompt }
					   ],
					   max_tokens: 8,
					   temperature: 0.0
				   });
				   console.log('[OpenAI completion]', JSON.stringify(completion));
				   emotion = completion?.choices?.[0]?.message?.content?.trim().replace(/\n/g, '') || null;
				   // 한 단어만 추출(여분 텍스트 제거)
				   if (emotion && emotion.includes(' ')) {
					   emotion = emotion.split(' ')[0];
				   }
				   console.log('[Parsed emotion]', emotion);
			} catch (err) {
				// 감정 분석 실패 시 null 저장
				emotion = null;
			}
		}

		   const upsertData = { user_id, date, fatigue, notes, title, emotion };
		   console.log('🛠️ Supabase upsert 데이터:', upsertData);
		   const { data, error } = await supabase
			   .from('records')
			   .upsert(upsertData)
			   .select('*');
		   console.log('📦 Supabase 결과:', { data, error });

		// 분석 캐시 무효화(비차단)
		(async () => {
			try {
				const { getRedisClient } = await import('../config/redis.js');
				const redis = await getRedisClient();
				if (redis) {
					const prefix = `${user_id}:`;
					for await (const key of redis.scanIterator({ MATCH: `${prefix}*`, COUNT: 100 })) {
						await redis.del(key);
					}
				}
			} catch (_) {}
		})();

		if (error) {
			return res.status(500).json({ error: error.message });
		}

		res.json({ success: true, data });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
}

// 기록 조회 API
export async function getRecords(req, res) {
	try {
		const { user_id = 'test_user' } = req.query;
		
		console.log('📥 기록 조회 요청:', { user_id });

		// 사용자의 모든 기록 조회
		const { data: records, error } = await supabase
			.from('records')
			.select('*')
			.eq('user_id', user_id)
			.order('date', { ascending: false });

		if (error) {
			console.error('기록 조회 에러:', error);
			return res.status(500).json({ error: '기록 조회 실패' });
		}

		console.log('📤 조회된 기록 개수:', records?.length || 0);
		res.json(records || []);
	} catch (e) {
		console.error('기록 조회 실패:', e);
		res.status(500).json({ 
			error: '기록 조회 실패',
			details: e.message 
		});
	}
}

// 기록 삭제 API
export async function deleteRecord(req, res) {
	try {
		const { record_id } = req.params;
		const { user_id = 'test_user' } = req.query;
		
		console.log('📥 기록 삭제 요청:', { record_id, user_id });

		if (!record_id) {
			return res.status(400).json({ error: 'record_id is required' });
		}

		// record_id가 date 형식(YYYY-MM-DD)인지 확인
		const isDateFormat = /^\d{4}-\d{2}-\d{2}/.test(record_id);
		
		// 해당 사용자의 기록인지 확인 후 삭제
		const deleteQuery = supabase
			.from('records')
			.delete()
			.eq('user_id', user_id);
		
		// date 또는 id로 삭제 시도
		if (isDateFormat) {
			deleteQuery.eq('date', record_id);
		} else {
			deleteQuery.eq('id', record_id);
		}
		
		const { data, error } = await deleteQuery.select('*');

		if (error) {
			console.error('기록 삭제 에러:', error);
			return res.status(500).json({ error: '기록 삭제 실패' });
		}

		if (!data || data.length === 0) {
			return res.status(404).json({ error: '기록을 찾을 수 없습니다' });
		}

		console.log('📤 삭제된 기록:', data[0]);
		
		// 분석 캐시 무효화(비차단)
		(async () => {
			try {
				const { getRedisClient } = await import('../config/redis.js');
				const redis = await getRedisClient();
				if (redis) {
					const prefix = `${user_id}:`;
					for await (const key of redis.scanIterator({ MATCH: `${prefix}*`, COUNT: 100 })) {
						await redis.del(key);
					}
				}
			} catch (_) {}
		})();

		res.json({ success: true, deletedRecord: data[0] });
	} catch (e) {
		console.error('기록 삭제 실패:', e);
		res.status(500).json({ 
			error: '기록 삭제 실패',
			details: e.message 
		});
	}
}