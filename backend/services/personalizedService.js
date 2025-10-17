import { supabase } from '../config/database.js';
import { openai } from '../config/openai.js';

// 캐시 유효성 검사
const isCacheValid = () => {
  if (!lastUpdateTime) return false;
  const now = new Date();
  const timeSinceLastUpdate = now - lastUpdateTime;
  return timeSinceLastUpdate < CACHE_DURATION;
};

// 캐시 변수들
let personalizedPostsCache = null;
let lastUpdateTime = null;
const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3시간

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

// 개인화 추천 서비스
export const getPersonalizedPosts = async (req, res) => {
  try {
    const { user_id = 'test_user', limit = 10, offset = 0 } = req.query;
    
    console.log(`🔍 사용자 ${user_id}의 개인화 추천 요청`);

    // 1. 사용자 프로필 분석
    const userProfile = await analyzeUserProfile(user_id);
    
    if (!userProfile) {
      return res.status(500).json({ 
        success: false, 
        error: '사용자 프로필 분석 실패' 
      });
    }

    // 2. 모든 게시글 가져오기 (posts_with_details 사용)
    const { data: allPosts, error } = await supabase
      .from('posts_with_details')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('게시글 조회 실패:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }

    if (!allPosts || allPosts.length === 0) {
      return res.json({ 
        success: true, 
        data: [], 
        total: 0,
        userProfile: userProfile
      });
    }

    // 3. 사용자가 작성한 게시글 제외
    const filteredPosts = allPosts.filter(post => post.user_id !== user_id);
    
    // 디버깅 정보
    console.log(`🔍 필터링 정보: 전체 ${allPosts.length}개, 필터링 후 ${filteredPosts.length}개, 제외된 게시글 ${allPosts.length - filteredPosts.length}개`);
    console.log(`👤 사용자 ID: ${user_id}`);
    
    if (filteredPosts.length === 0) {
      return res.json({ 
        success: true, 
        data: [], 
        total: 0,
        userProfile: userProfile,
        message: '추천할 게시글이 없습니다 (본인이 작성한 게시글 제외)'
      });
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
      // 신규 사용자는 기본 점수 (조회수 + 좋아요 + 댓글 기반)
      postsWithScores = filteredPosts.map(post => {
        // 조회수와 좋아요를 균형있게 고려한 점수 계산
        const viewScore = post.views * 0.1;           // 조회수 점수
        const likeScore = post.like_count * 5;        // 좋아요 점수 (가중치 증가)
        const commentScore = post.comment_count * 3;  // 댓글 점수
        const totalScore = viewScore + likeScore + commentScore;
        
        return {
          ...post,
          personalizedScore: totalScore,
          recommendationReason: `인기 게시글 추천 (조회:${post.views}, 좋아요:${post.like_count}, 댓글:${post.comment_count})`
        };
      });
    }

    // 4. 점수순으로 정렬
    postsWithScores.sort((a, b) => (b.personalizedScore || 0) - (a.personalizedScore || 0));

    // 5. 페이지네이션
    const paginatedPosts = postsWithScores.slice(offset, offset + parseInt(limit));

    console.log(`✅ 개인화 추천 완료: ${paginatedPosts.length}개 게시글`);
    console.log(`📊 사용자 프로필:`, {
      preferredTags: userProfile.preferredTags,
      activityLevel: userProfile.activityLevel,
      isNewUser: userProfile.isNewUser
    });

    res.json({
      success: true,
      data: paginatedPosts,
      count: paginatedPosts.length,
      total: filteredPosts.length, // 필터링된 게시글 수
      totalAll: allPosts.length,   // 전체 게시글 수
      limit: parseInt(limit),
      offset: parseInt(offset),
      userProfile: {
        preferredTags: userProfile.preferredTags,
        preferredGenders: userProfile.preferredGenders,
        preferredAgeRanges: userProfile.preferredAgeRanges,
        activityLevel: userProfile.activityLevel,
        isNewUser: userProfile.isNewUser,
        totalActions: userProfile.totalActions
      },
      message: `본인이 작성한 게시글 ${allPosts.length - filteredPosts.length}개 제외됨`
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