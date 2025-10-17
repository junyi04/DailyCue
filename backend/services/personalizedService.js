import { supabase } from '../config/database.js';
import { openai } from '../config/openai.js';

// 캐시 유효성 검사 (사용자별)
const isCacheValid = (userId) => {
  if (!lastUpdateTime[userId]) return false;
  const now = new Date();
  const timeSinceLastUpdate = now - lastUpdateTime[userId];
  return timeSinceLastUpdate < CACHE_DURATION;
};

// 캐시 변수들
let personalizedPostsCache = {};
let lastUpdateTime = {};
const CACHE_DURATION = 5 * 60 * 60 * 1000; // 5시간

// 사용자 행동 데이터 수집 (임시 - 실제로는 프론트엔드에서 추적)
const collectUserBehavior = async (userId) => {
  try {
    // 사용자가 좋아요한 게시글들 (임시 데이터)
    const { data: likedPosts, error: likeError } = await supabase
      .from('posts_with_details')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (likeError) {
      console.error('사용자 행동 데이터 수집 실패:', likeError);
      return null;
    }

    return {
      likedPosts: likedPosts || [],
      totalActions: likedPosts?.length || 0
    };
  } catch (error) {
    console.error('사용자 행동 수집 오류:', error);
    return null;
  }
};

// 사용자 프로필 분석
const analyzeUserProfile = async (userId) => {
  try {
    const behavior = await collectUserBehavior(userId);
    
    if (!behavior || behavior.totalActions === 0) {
      // 신규 사용자 - 기본 프로필
      return {
        isNewUser: true,
        preferredTags: [],
        preferredGenders: [],
        preferredAgeRanges: [],
        contentKeywords: [],
        activityLevel: 'low'
      };
    }

    // 태그 선호도 분석
    const tagCounts = {};
    const genderCounts = {};
    const ageRangeCounts = {};
    const keywords = [];

    behavior.likedPosts.forEach(post => {
      // 태그 분석
      if (post.tag) {
        tagCounts[post.tag] = (tagCounts[post.tag] || 0) + 1;
      }
      
      // 성별 분석
      if (post.author_gender) {
        genderCounts[post.author_gender] = (genderCounts[post.author_gender] || 0) + 1;
      }
      
      // 연령대 분석
      if (post.author_gender_range) {
        ageRangeCounts[post.author_gender_range] = (ageRangeCounts[post.author_gender_range] || 0) + 1;
      }
      
      // 키워드 추출 (제목과 내용에서)
      if (post.title) keywords.push(post.title);
      if (post.content) keywords.push(post.content);
    });

    // 상위 선호도 추출
    const preferredTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([tag]) => tag);

    const preferredGenders = Object.entries(genderCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([gender]) => gender);

    const preferredAgeRanges = Object.entries(ageRangeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([ageRange]) => ageRange);

    return {
      isNewUser: false,
      preferredTags,
      preferredGenders,
      preferredAgeRanges,
      contentKeywords: keywords.slice(0, 10), // 상위 10개 키워드
      activityLevel: behavior.totalActions > 10 ? 'high' : behavior.totalActions > 5 ? 'medium' : 'low',
      totalActions: behavior.totalActions
    };

  } catch (error) {
    console.error('사용자 프로필 분석 오류:', error);
    return null;
  }
};

// AI 기반 개인화 추천
const getAIRecommendations = async (userProfile, allPosts) => {
  try {
    const prompt = `
당신은 개인화 추천 전문가입니다.

사용자 프로필:
- 선호 태그: ${userProfile.preferredTags.join(', ') || '없음'}
- 선호 성별: ${userProfile.preferredGenders.join(', ') || '없음'}
- 선호 연령대: ${userProfile.preferredAgeRanges.join(', ') || '없음'}
- 관심 키워드: ${userProfile.contentKeywords.slice(0, 5).join(', ') || '없음'}
- 활동 수준: ${userProfile.activityLevel}
- 총 행동 수: ${userProfile.totalActions || 0}

게시글 목록:
${allPosts.map((post, index) => 
  `${index}: [${post.tag}] ${post.title} (작성자: ${post.author}, 성별: ${post.author_gender}, 연령대: ${post.author_gender_range})`
).join('\n')}

다음 기준으로 각 게시글의 적합도를 0-100점으로 평가해주세요:
1. 사용자 선호 태그와의 일치도 (30%)
2. 작성자 성별/연령대 선호도 (20%)
3. 콘텐츠 키워드 일치도 (25%)
4. 게시글 인기도 (15%)
5. 최신성 (10%)

JSON 형태로 답변해주세요: {"0": 85, "1": 92, "2": 78, ...}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.3
    });

    const aiScores = JSON.parse(response.choices[0].message.content);
    return aiScores;

  } catch (error) {
    console.error('AI 추천 오류:', error);
    return null;
  }
};

// 추천 이유 생성
const getRecommendationReason = (userProfile, post, score) => {
  const reasons = [];
  
  if (userProfile.preferredTags.includes(post.tag)) {
    reasons.push(`선호 태그: ${post.tag}`);
  }
  
  if (userProfile.preferredGenders.includes(post.author_gender)) {
    reasons.push(`선호 성별: ${post.author_gender}`);
  }
  
  if (userProfile.preferredAgeRanges.includes(post.author_gender_range)) {
    reasons.push(`선호 연령대: ${post.author_gender_range}`);
  }
  
  if (score > 80) {
    reasons.push('높은 적합도');
  } else if (score > 60) {
    reasons.push('적당한 적합도');
  }
  
  return reasons.length > 0 ? reasons.join(', ') : '일반 추천';
};

// 개인화 추천 캐시 업데이트
const updatePersonalizedCache = async (userId) => {
  try {
    console.log(`🔄 사용자 ${userId}의 개인화 추천 캐시 업데이트 시작`);
    
    // 1. 사용자 프로필 분석
    const userProfile = await analyzeUserProfile(userId);
    
    if (!userProfile) {
      console.error('사용자 프로필 분석 실패');
      return null;
    }

    // 2. 모든 게시글 가져오기
    const { data: allPosts, error } = await supabase
      .from('posts_with_details')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('게시글 조회 실패:', error);
      return null;
    }

    if (!allPosts || allPosts.length === 0) {
      personalizedPostsCache[userId] = [];
      lastUpdateTime[userId] = new Date();
      return [];
    }

    // 3. 사용자가 작성한 게시글 제외
    const filteredPosts = allPosts.filter(post => post.user_id !== userId);
    
    if (filteredPosts.length === 0) {
      personalizedPostsCache[userId] = [];
      lastUpdateTime[userId] = new Date();
      return [];
    }

    // 4. AI 기반 추천 점수 계산
    let postsWithScores = filteredPosts;
    
    if (!userProfile.isNewUser) {
      const aiScores = await getAIRecommendations(userProfile, filteredPosts);
      
      if (aiScores) {
        postsWithScores = filteredPosts.map((post, index) => ({
          ...post,
          personalizedScore: aiScores[index] || 0,
          recommendationReason: getRecommendationReason(userProfile, post, aiScores[index] || 0)
        }));
      }
    } else {
      // 신규 사용자는 기본 점수
      postsWithScores = filteredPosts.map(post => {
        const viewScore = post.views * 0.1;
        const likeScore = post.like_count * 5;
        const commentScore = post.comment_count * 3;
        const totalScore = viewScore + likeScore + commentScore;
        
        return {
          ...post,
          personalizedScore: totalScore,
          recommendationReason: `인기 게시글 추천 (조회:${post.views}, 좋아요:${post.like_count}, 댓글:${post.comment_count})`
        };
      });
    }

    // 5. 점수순으로 정렬
    postsWithScores.sort((a, b) => (b.personalizedScore || 0) - (a.personalizedScore || 0));

    // 6. 캐시에 저장
    personalizedPostsCache[userId] = postsWithScores;
    lastUpdateTime[userId] = new Date();

    console.log(`✅ 사용자 ${userId}의 개인화 추천 캐시 업데이트 완료: ${postsWithScores.length}개 게시글`);
    
    return postsWithScores;

  } catch (error) {
    console.error('개인화 추천 캐시 업데이트 오류:', error);
    return null;
  }
};

// 개인화 추천 서비스
export const getPersonalizedPosts = async (req, res) => {
  try {
    const { user_id = 'test_user', limit = 10, offset = 0 } = req.query;
    
    console.log(`🔍 사용자 ${user_id}의 개인화 추천 요청`);

    // 캐시 확인
    if (isCacheValid(user_id) && personalizedPostsCache[user_id]) {
      console.log(`📦 캐시에서 사용자 ${user_id}의 개인화 추천 반환`);
      const cachedPosts = personalizedPostsCache[user_id];
      const paginatedPosts = cachedPosts.slice(offset, offset + parseInt(limit));
      
      return res.json({
        success: true,
        data: paginatedPosts,
        count: paginatedPosts.length,
        total: cachedPosts.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        fromCache: true,
        message: '캐시에서 반환됨'
      });
    }

    // 캐시가 없거나 만료된 경우 새로 생성
    console.log(`🔄 사용자 ${user_id}의 개인화 추천 캐시 생성/업데이트`);
    const postsWithScores = await updatePersonalizedCache(user_id);
    
    if (!postsWithScores) {
      return res.status(500).json({ 
        success: false, 
        error: '개인화 추천 생성 실패' 
      });
    }

    // 페이지네이션
    const paginatedPosts = postsWithScores.slice(offset, offset + parseInt(limit));

    console.log(`✅ 개인화 추천 완료: ${paginatedPosts.length}개 게시글`);

    res.json({
      success: true,
      data: paginatedPosts,
      count: paginatedPosts.length,
      total: postsWithScores.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      fromCache: false,
      message: '새로 생성됨'
    });

  } catch (error) {
    console.error('개인화 추천 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// 사용자 프로필 조회 (디버깅용)
export const getUserProfile = async (req, res) => {
  try {
    const { user_id = 'test_user' } = req.query;
    
    const userProfile = await analyzeUserProfile(user_id);
    
    if (!userProfile) {
      return res.status(500).json({ 
        success: false, 
        error: '사용자 프로필 분석 실패' 
      });
    }

    res.json({
      success: true,
      userProfile: userProfile
    });

  } catch (error) {
    console.error('사용자 프로필 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// 개인화 추천 캐시 상태 조회
export const getPersonalizedCacheStatus = async (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (user_id) {
      // 특정 사용자 캐시 상태
      const isValid = isCacheValid(user_id);
      const lastUpdate = lastUpdateTime[user_id];
      const cacheSize = personalizedPostsCache[user_id] ? personalizedPostsCache[user_id].length : 0;
      
      res.json({
        success: true,
        userId: user_id,
        isValid: isValid,
        lastUpdate: lastUpdate,
        cacheSize: cacheSize,
        cacheDuration: CACHE_DURATION,
        timeUntilExpiry: isValid && lastUpdate ? 
          CACHE_DURATION - (new Date() - lastUpdate) : 0
      });
    } else {
      // 전체 캐시 상태
      const allUsers = Object.keys(personalizedPostsCache);
      const cacheStatus = allUsers.map(uid => ({
        userId: uid,
        isValid: isCacheValid(uid),
        lastUpdate: lastUpdateTime[uid],
        cacheSize: personalizedPostsCache[uid] ? personalizedPostsCache[uid].length : 0
      }));
      
      res.json({
        success: true,
        totalUsers: allUsers.length,
        cacheStatus: cacheStatus,
        cacheDuration: CACHE_DURATION
      });
    }

  } catch (error) {
    console.error('캐시 상태 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// 개인화 추천 캐시 수동 업데이트
export const updatePersonalizedCacheManual = async (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id가 필요합니다'
      });
    }
    
    console.log(`🔄 사용자 ${user_id}의 개인화 추천 캐시 수동 업데이트 시작`);
    
    const result = await updatePersonalizedCache(user_id);
    
    if (!result) {
      return res.status(500).json({
        success: false,
        error: '캐시 업데이트 실패'
      });
    }
    
    res.json({
      success: true,
      message: `사용자 ${user_id}의 개인화 추천 캐시가 업데이트되었습니다`,
      cacheSize: result.length,
      lastUpdate: lastUpdateTime[user_id]
    });

  } catch (error) {
    console.error('캐시 수동 업데이트 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// 모든 캐시 미리 생성 (앱 시작 시)
export const preloadAllCaches = async (req, res) => {
  try {
    console.log('🚀 모든 캐시 미리 생성 시작...');
    
    // 기본 사용자 ID들 (실제로는 사용자 목록을 DB에서 가져와야 함)
    const defaultUserIds = [
      '83152734-6697-4e81-a797-a915dfbc608a',
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002'
    ];
    
    const results = [];
    
    // 각 사용자별로 캐시 생성
    for (const userId of defaultUserIds) {
      try {
        console.log(`🔄 사용자 ${userId} 캐시 생성 중...`);
        const result = await updatePersonalizedCache(userId);
        
        if (result) {
          results.push({
            userId: userId,
            success: true,
            cacheSize: result.length,
            lastUpdate: lastUpdateTime[userId]
          });
        } else {
          results.push({
            userId: userId,
            success: false,
            error: '캐시 생성 실패'
          });
        }
      } catch (error) {
        console.error(`사용자 ${userId} 캐시 생성 오류:`, error);
        results.push({
          userId: userId,
          success: false,
          error: error.message
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    
    res.json({
      success: true,
      message: `캐시 미리 생성 완료: ${successCount}/${defaultUserIds.length}개 성공`,
      results: results,
      totalUsers: defaultUserIds.length,
      successCount: successCount
    });

  } catch (error) {
    console.error('캐시 미리 생성 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};