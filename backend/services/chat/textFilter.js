import { openai } from '../../config/openai.js';

export class AdvancedTextFilter {
	constructor() {
		// 무의미한 단어 사전 (다층 구조)
		this.meaninglessWords = {
			// 기본 무의미 단어
			basic: ['음', '아', '어', '그냥', '뭐', '응', '네', '그래', '맞아', '별로', '아무것도', '그런데'],
			
			// 반응형 표현
			reactions: ['ㅋㅋ', 'ㅎㅎ', 'ㅠㅠ', 'ㅜㅜ', 'ㅡㅡ', 'ㅇㅇ', 'ㅂㅂ', 'ㅈㅈ'],
			
			// 인사/대화 시작
			greetings: ['안녕', '하이', '헬로', '뭐해', '잘지내', '잘지내?', '어떻게지내', '어떻게지내?'],
			
			// 확인/동의 표현
			confirmations: ['그래', '맞아', '응', '네', '알겠어', '알겠어요', '알겠습니다'],
			
			// 의미없는 접속사/부사
			connectors: ['그런데', '그리고', '그래서', '그러면', '그럼', '그치', '그치?'],
			
			// 감탄사 (단독 사용시)
			exclamations: ['아', '어', '음', '으', '어라', '어머', '어쩌지'],
			
			// 테스트/확인용
			test: ['테스트', '확인', '체크', 'test', 'check', '확인해봐', '테스트해봐']
		};
		
		// 의미있는 키워드 (이게 있으면 유지)
		this.meaningfulKeywords = [
			// 감정 표현
			'기분', '감정', '마음', '행복', '기쁨', '슬픔', '화남', '걱정', '불안', '피곤', '지쳐', '힘들',
			'좋아', '싫어', '좋지', '싫지', '기뻐', '슬퍼', '화나', '걱정돼', '불안해', '피곤해', '지쳐',
			
			// 구체적 상황
			'오늘', '어제', '내일', '회사', '학교', '집', '아이', '아기', '아들', '딸', '남편', '아내',
			'친구', '가족', '부모', '엄마', '아빠', '할머니', '할아버지',
			
			// 활동/상황
			'일', '일하', '공부', '공부하', '놀', '놀았', '먹', '먹었', '자', '잤', '걷', '걸었',
			'운동', '운동하', '쇼핑', '쇼핑하', '여행', '여행하',
			
			// 질문/의문
			'왜', '어떻게', '언제', '어디', '누구', '무엇', '뭐', '어떤', '어느', '몇',
			'왜그래', '어떻게해', '언제해', '어디가', '누구야', '뭐해', '어떤거', '어느거', '몇개',
			
			// 구체적 내용
			'말', '말하', '말했', '걸음', '걸었', '웃', '웃었', '울', '울었', '놀', '놀았',
			'먹', '먹었', '자', '잤', '일', '일했', '공부', '공부했'
		];
		
		// 정규표현식 패턴
		this.patterns = {
			// 반복 문자 (3개 이상)
			repeatedChars: /(.)\1{2,}/g,
			
			// 이모티콘만 있는 경우
			onlyEmojis: /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+$/u,
			
			// 특수문자만 있는 경우
			onlySpecialChars: /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]+$/,
			
			// 숫자만 있는 경우
			onlyNumbers: /^\d+$/,
			
			// 공백만 있는 경우
			onlySpaces: /^\s+$/
		};
	}
	
	// 메인 필터링 함수
	filterText(text) {
		if (!text || typeof text !== 'string') return '';
		
		// 1. 기본 전처리
		let filtered = this.preprocess(text);
		
		// 2. 길이 체크 (너무 짧으면 제거)
		if (filtered.length < 5) return '';
		
		// 3. 패턴 기반 필터링
		if (this.isPatternBasedMeaningless(filtered)) return '';
		
		// 4. 키워드 기반 필터링
		filtered = this.filterByKeywords(filtered);
		
		// 5. 최종 길이 체크
		if (filtered.length < 5) return '';
		
		return filtered.trim();
	}
	
	// 전처리
	preprocess(text) {
		return text
			.trim()
			.replace(/\s+/g, ' ') 
			.replace(/[^\w\s가-힣!?.,]/g, '') 
			.trim();
	}
	
	// 패턴 기반 무의미함 체크
	isPatternBasedMeaningless(text) {
		// 이모티콘만 있는 경우
		if (this.patterns.onlyEmojis.test(text)) return true;
		
		// 특수문자만 있는 경우
		if (this.patterns.onlySpecialChars.test(text)) return true;
		
		// 숫자만 있는 경우
		if (this.patterns.onlyNumbers.test(text)) return true;
		
		// 공백만 있는 경우
		if (this.patterns.onlySpaces.test(text)) return true;
		
		// 반복 문자가 너무 많은 경우 (50% 이상)
		const repeatedMatches = text.match(this.patterns.repeatedChars);
		if (repeatedMatches && repeatedMatches.length > 0) {
			const repeatedLength = repeatedMatches.reduce((sum, match) => sum + match.length, 0);
			if (repeatedLength / text.length > 0.5) return true;
		}
		
		return false;
	}
	
	// 키워드 기반 필터링
	filterByKeywords(text) {
		const words = text.split(' ');
		const filteredWords = [];
		
		for (const word of words) {
			// 무의미한 단어인지 체크
			if (this.isMeaninglessWord(word)) {
				continue; // 제거
			}
			
			// 의미있는 키워드가 포함되어 있는지 체크
			if (this.hasMeaningfulKeyword(word)) {
				filteredWords.push(word);
				continue;
			}
			
			// 길이가 충분한지 체크 (3자 이상)
			if (word.length >= 3) {
				filteredWords.push(word);
			}
		}
		
		return filteredWords.join(' ');
	}
	
	// 무의미한 단어 체크
	isMeaninglessWord(word) {
		const lowerWord = word.toLowerCase();
		
		// 모든 카테고리에서 체크
		for (const category in this.meaninglessWords) {
			if (this.meaninglessWords[category].includes(lowerWord)) {
				return true;
			}
		}
		
		return false;
	}
	
	// 의미있는 키워드 포함 체크
	hasMeaningfulKeyword(word) {
		const lowerWord = word.toLowerCase();
		return this.meaningfulKeywords.some(keyword => lowerWord.includes(keyword));
	}
	
	// 텍스트 품질 점수 계산
	calculateQualityScore(originalText, filteredText) {
		if (!filteredText || filteredText.length === 0) return 0;
		
		let score = 0;
		
		// 기본 길이 점수
		score += Math.min(filteredText.length / 10, 5); // 최대 5점
		
		// 의미있는 키워드 점수
		const meaningfulKeywordCount = this.meaningfulKeywords.filter(keyword => 
			filteredText.toLowerCase().includes(keyword)
		).length;
		score += meaningfulKeywordCount * 2; // 키워드당 2점
		
		// 질문 포함 점수
		if (filteredText.includes('?') || filteredText.includes('왜') || filteredText.includes('어떻게')) {
			score += 3;
		}
		
		// 감정 표현 점수
		const emotionWords = ['기분', '감정', '마음', '행복', '기쁨', '슬픔', '화남', '걱정', '불안', '피곤'];
		const hasEmotion = emotionWords.some(word => filteredText.includes(word));
		if (hasEmotion) score += 4;
		
		// 구체적 상황 점수
		const situationWords = ['오늘', '어제', '회사', '학교', '아이', '가족', '친구'];
		const hasSituation = situationWords.some(word => filteredText.includes(word));
		if (hasSituation) score += 2;
		
		return Math.round(score);
	}
	
	// 3단계: AI 기반 의미성 최종 판단
	async getAIMeaningfulnessScore(text) {
		if (!text || text.length < 5) return 0;
		
		try {
			const response = await openai.chat.completions.create({
				model: 'gpt-4o-mini',
				messages: [{
					role: 'user',
					content: `다음 텍스트가 감정 기록이나 구체적인 상황을 나타내는 의미있는 내용인지 0-1 점수로 평가해주세요. 
					
					평가 기준:
					- 0.9-1.0: 구체적인 감정이나 상황을 명확히 표현
					- 0.7-0.8: 의미있는 내용이지만 다소 모호함
					- 0.5-0.6: 애매한 내용
					- 0.0-0.4: 무의미하거나 의미없는 내용
					
					텍스트: "${text}"
					
					점수만 숫자로 답변해주세요.`
				}],
				max_tokens: 10,
				temperature: 0.1
			});
			
			const score = parseFloat(response.choices[0].message.content);
			return isNaN(score) ? 0 : Math.max(0, Math.min(1, score));
			
		} catch (error) {
			console.error('AI 의미성 판단 실패:', error);
			// AI 실패시 기본 점수로 대체
			return text.length >= 10 ? 0.6 : 0.3;
		}
	}
	
	// 통합 필터링 함수 (3단계 모두 적용)
	async filterTextWithAI(text) {
		if (!text || typeof text !== 'string') return { filteredText: '', qualityScore: 0, aiScore: 0, passed: false };
		
		// 1단계: 기본 전처리 및 사전 기반 필터링
		let filtered = this.preprocess(text);
		if (filtered.length < 5) return { filteredText: '', qualityScore: 0, aiScore: 0, passed: false };
		
		if (this.isPatternBasedMeaningless(filtered)) return { filteredText: '', qualityScore: 0, aiScore: 0, passed: false };
		
		filtered = this.filterByKeywords(filtered);
		if (filtered.length < 5) return { filteredText: '', qualityScore: 0, aiScore: 0, passed: false };
		
		// 2단계: 코드 기반 품질 점수 계산
		const qualityScore = this.calculateQualityScore(text, filtered);
		if (qualityScore < 3) return { filteredText: '', qualityScore, aiScore: 0, passed: false };
		
		// 3단계: AI 기반 최종 판단
		const aiScore = await this.getAIMeaningfulnessScore(filtered);
		const passed = aiScore >= 0.7;
		
		return {
			filteredText: passed ? filtered : '',
			qualityScore,
			aiScore,
			passed
		};
	}
}

// 전역 필터 인스턴스
export const textFilter = new AdvancedTextFilter();
