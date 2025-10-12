import { openai } from '../config/openai.js';
import { supabase } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';


export async function handleChatRequest(req, res) {
	try {
		const { message, user_id = 'test_user' } = req.body;
		const trimmed = typeof message === 'string' ? message.trim() : '';
		if (!trimmed) {
			return res.status(400).json({ error: 'Message is required' });
		}

		// 프롬프트, 메시지ID, DB 저장 프라미스 선언
		const systemPrompt = '너는 따뜻한 부모 상담 AI야. 사용자의 기록과 대화 내용을 참고해 진심으로 답변해줘. 사용자가 특정 날짜를 요청하면 해당 날짜의 기록을, 만약 전체 기록을 요청하면 너가 보여 줄 수 있는 전체 날짜 기록을 보여줘.';
		const messageId = uuidv4();
		
		// 사용자 메시지 먼저 저장
		const { error: insertError } = await supabase
			.from('chat_messages')
			.insert({ id: messageId, user_id, user_chat: trimmed, ai_answer: null });
		
		if (insertError) {
			console.error('User message insert error:', insertError);
			return res.status(500).json({ error: '메시지 저장 실패' });
		}

		// 최근 대화 기록 불러오기 (예: 최근 30개)
		const { data: chatHistory, error: historyError } = await supabase
			.from('chat_messages')
			.select('user_chat, ai_answer')
			.eq('user_id', user_id)
			.order('created_at', { ascending: false })
			.limit(30);

		// 최근 30개 기록 불러오기
		const { data: recentRecords, error: recordsError } = await supabase
			.from('records')
			.select('date, title, notes, fatigue, emotion')
			.eq('user_id', user_id)
			.order('date', { ascending: false })
			.limit(30);

		// 에러 처리
		if (historyError) {
			console.error('Chat history error:', historyError);
		}
		if (recordsError) {
			console.error('Records error:', recordsError);
		}

		let recordsInfo = '';
		if (Array.isArray(recentRecords) && recentRecords.length > 0) {
			recordsInfo = '[최근 30개 기록]\n' + recentRecords.map(r =>
				`날짜: ${r.date}\n제목: ${r.title || ''}\n내용: ${r.notes || ''}\n피곤함: ${r.fatigue}\n감정: ${r.emotion || ''}`
			).join('\n---\n');
		}

		// 메시지 구성
		const messages = [
			{ role: 'system', content: systemPrompt }
		];

		// 최근 기록 정보 추가
		if (recordsInfo) {
			messages.push({ role: 'system', content: recordsInfo });
		}

		// 대화 기록 추가 (시간순으로 정렬)
		if (Array.isArray(chatHistory)) {
			for (let i = 0; i < chatHistory.length; i++) {
				const chat = chatHistory[i];
				if (chat.user_chat) messages.push({ role: 'user', content: chat.user_chat });
				if (chat.ai_answer) messages.push({ role: 'assistant', content: chat.ai_answer });
			}
		}

		// 현재 사용자 메시지 추가
		messages.push({ role: 'user', content: trimmed });

		const aiCall = openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages,
			max_tokens: 280,
			temperature: 0.6
		});

		// 소프트 타임아웃 후 폴백
		const softTimeoutMs = 12000;
		const softTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('AI timeout')), softTimeoutMs));
		let completion;
		try {
			completion = await Promise.race([aiCall, softTimeout]);
		} catch (primaryErr) {
			console.warn('Primary AI call failed, trying fallback:', primaryErr?.message || primaryErr);
			try {
				completion = await openai.chat.completions.create({
					model: 'gpt-4o-mini',
					messages,
					max_tokens: 200,
					temperature: 0.6
				});
			} catch (fallbackErr) {
				return res.status(502).json({ error: 'AI 응답 지연', details: fallbackErr?.message || primaryErr?.message });
			}
		}

		const aiResponse = completion?.choices?.[0]?.message?.content || '죄송해요, 지금은 응답을 생성할 수 없어요.';

		// 사용자에게 즉시 응답 (대화 기록 포함)
		res.json({
			aiResponse,
			chatHistory: chatHistory || []
		});

		// AI 답변을 해당 메시지에 업데이트
		supabase
			.from('chat_messages')
			.update({ 
				ai_answer: aiResponse
			})
			.eq('id', messageId)
			.then(() => null)
			.catch((e) => console.error('AI answer update error:', e?.message || e));

	} catch (error) {
		console.error('Chatbot error:', error);
		res.status(500).json({ 
			error: 'Chatbot error',
			details: error.message 
		});
	}
}

// 대화 기록만 가져오는 API
export async function getChatHistory(req, res) {
	try {
		const { user_id = 'test_user' } = req.query;

		// 최근 10개 대화 기록 불러오기
		const { data: chatHistory, error: historyError } = await supabase
			.from('chat_messages')
			.select('user_chat, ai_answer, created_at')
			.eq('user_id', user_id)
			.order('created_at', { ascending: false })
			.limit(10);

		if (historyError) {
			console.error('Chat history error:', historyError);
			return res.status(500).json({ error: '대화 기록 불러오기 실패' });
		}

		res.json({ chatHistory: chatHistory || [] });

	} catch (error) {
		console.error('Get chat history error:', error);
		res.status(500).json({ 
			error: 'Get chat history error',
			details: error.message 
		});
	}
}
