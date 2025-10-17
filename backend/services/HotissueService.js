import { supabase } from '../config/database.js';

// 캐시 시스템
let hotPostsCache = null;
let lastUpdateTime = null;

// 4시간 = 4 * 60 * 60 * 1000 밀리초
// const CACHE_DURATION = 4 * 60 * 60 * 1000;
// 테스트용: 30초 = 30 * 1000 밀리초
const CACHE_DURATION = 30 * 1000;

// 캐시가 유효한지 확인
const isCacheValid = () => {
  if (!lastUpdateTime) return false;
  const now = new Date();
  return (now - lastUpdateTime) < CACHE_DURATION;
};

// 핫스코어 계산 함수 (캐시용)
const calculateHotScore = (post) => {
  const views = post.views || 0;
  const likes = post.like_count || 0;
  const comments = post.comment_count || 0;
  
  // 가중치 설정 (조회수 1점, 좋아요 5점, 댓글 3점)
  const viewWeight = 1;
  const likeWeight = 5;
  const commentWeight = 3;
  
  // 시간 가중치 (최근 글일수록 높은 점수) - 한국 시간 기준
  const now = new Date();
  const postTime = new Date(post.created_at);
  
  // 한국 시간으로 변환 (UTC+9)
  const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  const postKoreaTime = new Date(postTime.getTime() + (9 * 60 * 60 * 1000));
  
  const hoursAgo = (koreaTime - postKoreaTime) / (1000 * 60 * 60);
  
  // 시간 가중치: 12시간 이내는 1.0, 12시간 이후는 0 (넷플릭스 방식)
  let timeWeight = 1.0;
  if (hoursAgo > 12) {
    timeWeight = 0; // 12시간 이후는 완전히 제외
  }
  
  // 핫스코어 = (조회수 × 1 + 좋아요 × 5 + 댓글 × 3) × 시간가중치
  const hotScore = (views * viewWeight + likes * likeWeight + comments * commentWeight) * timeWeight;
  
  return {
    ...post,
    hotScore: Math.round(hotScore * 100) / 100, // 소수점 2자리까지
    timeWeight: Math.round(timeWeight * 100) / 100
  };
};

// 모든 캐시 업데이트 (변경사항이 있을 때만)
const updateAllCaches = async () => {
  try {
    console.log('🔄 캐시 업데이트 시작...');
    
    // 모든 게시글 가져오기
    const { data: allPosts, error } = await supabase
      .from('posts')
      .select('*');

    if (error) {
      console.error('캐시 업데이트 실패:', error);
      return;
    }

    // 게시글이 없으면 기존 캐시 유지
    if (!allPosts || allPosts.length === 0) {
      lastUpdateTime = new Date();
      console.log('ℹ️ 게시글 없음 - 기존 캐시 유지', {
        total: hotPostsCache ? hotPostsCache.total : 0,
        changes: false
      });
      return;
    }

    // 기존 캐시와 비교하여 변경사항이 있는지 확인
    let hasChanges = false;
    if (!hotPostsCache || hotPostsCache.total !== allPosts.length) {
      hasChanges = true;
    } else {
      // 각 게시글의 ID, 조회수, 좋아요, 댓글 수를 비교
      const currentPosts = allPosts.map(calculateHotScore);
      const existingPosts = [...(hotPostsCache.recentPosts || []), ...(hotPostsCache.olderPosts || [])];
      
      for (let i = 0; i < currentPosts.length; i++) {
        const currentPost = currentPosts[i];
        const existingPost = existingPosts.find(p => p.id === currentPost.id);
        
        if (!existingPost || 
            currentPost.views !== existingPost.views ||
            currentPost.like_count !== existingPost.like_count ||
            currentPost.comment_count !== existingPost.comment_count ||
            currentPost.hotScore !== existingPost.hotScore) {
          hasChanges = true;
          break;
        }
      }
    }

    // 변경사항이 있을 때만 캐시 업데이트
    if (hasChanges) {
      // 핫픽 캐시 업데이트
      const postsWithScore = allPosts.map(calculateHotScore);
      
      // 12시간 이내 글과 이전 글을 분리
      const recentPosts = postsWithScore.filter(post => post.timeWeight > 0);
      const olderPosts = postsWithScore.filter(post => post.timeWeight === 0);
      
      // 각각 따로 정렬
      recentPosts.sort((a, b) => b.hotScore - a.hotScore);
      
      // 이전 글들은 원래 점수(시간가중치 적용 전)로 정렬
      const olderPostsWithOriginalScore = olderPosts.map(post => {
        const views = post.views || 0;
        const likes = post.like_count || 0;
        const comments = post.comment_count || 0;
        const originalScore = views * 1 + likes * 5 + comments * 3;
        return { ...post, originalScore };
      });
      olderPostsWithOriginalScore.sort((a, b) => b.originalScore - a.originalScore);
      
      // 최종 핫픽 데이터
      hotPostsCache = {
        recentPosts: recentPosts,
        olderPosts: olderPostsWithOriginalScore,
        total: allPosts.length
      };

      lastUpdateTime = new Date();
      console.log('✅ 캐시 업데이트 완료! (변경사항 있음)', {
        recentPosts: recentPosts.length,
        olderPosts: olderPosts.length,
        total: allPosts.length,
        changes: true
      });
    } else {
      // 변경사항이 없으면 기존 캐시 유지하고 업데이트 시간만 갱신
      lastUpdateTime = new Date();
      console.log('ℹ️ 캐시 확인 완료! (변경사항 없음)', {
        total: allPosts.length,
        changes: false
      });
    }

  } catch (error) {
    console.error('캐시 업데이트 오류:', error);
  }
};


// 한국 시간 기준으로 4시간마다 자동 업데이트 스케줄러
const scheduleUpdate = () => {
  const now = new Date();
  // 한국 시간으로 변환 (UTC+9)
  const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  
  // 다음 업데이트 시간 계산 (4시간 후)
  const nextUpdate = new Date(koreaTime.getTime() + CACHE_DURATION);
  
  const timeUntilUpdate = nextUpdate.getTime() - koreaTime.getTime();
  
  console.log(`⏰ 다음 핫픽 캐시 업데이트 예정: ${nextUpdate.toLocaleString('ko-KR')} (${Math.round(timeUntilUpdate / (1000 * 60 * 60))}시간 후)`);
  
  setTimeout(async () => {
    await updateAllCaches();
    scheduleUpdate(); // 다음 업데이트 스케줄링
  }, timeUntilUpdate);
};

// 스케줄러 시작
scheduleUpdate();

// 서버 시작 시 초기 캐시 생성
updateAllCaches();





/**
 * 실시간 핫픽 조회 (조회수, 좋아요, 댓글 수 종합 점수 기준)
 */
export async function getHotPosts(req, res) {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    // 캐시가 유효하지 않으면 업데이트
    if (!isCacheValid()) {
      await updateAllCaches();
    }

    // 캐시에서 데이터 가져오기
    if (!hotPostsCache) {
      return res.status(500).json({ 
        error: '핫픽 데이터를 불러오는데 실패했습니다.'
      });
    }

    // 캐시에서 데이터 가져오기
    const { recentPosts, olderPosts, total } = hotPostsCache;
    
    // 최종 글 선택 로직
    let finalPosts;
    if (recentPosts.length < limit) {
      // 12시간 이내 글이 부족하면 이전 글도 추가
      const remainingSlots = limit - recentPosts.length;
      const additionalPosts = olderPosts.slice(0, remainingSlots);
      finalPosts = [...recentPosts, ...additionalPosts];
    } else {
      // 12시간 이내 글이 충분하면 그것만 사용
      finalPosts = recentPosts;
    }
    
    // 페이지네이션 적용
    const paginatedPosts = finalPosts.slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      data: paginatedPosts,
      count: paginatedPosts.length,
      total: total,
      recentCount: recentPosts.length,
      olderCount: olderPosts.length,
      cached: true,
      lastUpdate: lastUpdateTime,
      // 디버깅용 정보 (개발 환경에서만)
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          scoreCalculation: {
            viewWeight: 1,
            likeWeight: 5,
            commentWeight: 3,
            timeWeightFormula: "12시간 이내: 1.0, 12시간 이후: 0 (한국 시간 기준)",
            timeZone: "Asia/Seoul (UTC+9)"
          },
          postSelection: {
            recentPosts: recentPosts.length,
            olderPosts: olderPosts.length,
            finalPosts: finalPosts.length,
            strategy: recentPosts.length < limit ? "recent + older" : "recent only",
            olderPostsSorting: "by original score (without time weight)"
          },
          serverInfo: {
            serverTime: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
            koreaTime: new Date(new Date().getTime() + (9 * 60 * 60 * 1000)).toLocaleString('ko-KR')
          }
        }
      })
    });

  } catch (error) {
    console.error('핫픽 API 오류:', error);
    res.status(500).json({ 
      error: '서버 오류가 발생했습니다.',
      details: error.message 
    });
  }
}





/**
 * 캐시 수동 업데이트 (관리자용)
 */
export async function updateCache(req, res) {
  try {
    console.log('🔄 수동 캐시 업데이트 요청...');
    await updateAllCaches();
    
    res.json({
      success: true,
      message: '캐시가 성공적으로 업데이트되었습니다.',
      lastUpdate: lastUpdateTime,
      cacheStatus: {
        hotPosts: hotPostsCache ? 'available' : 'empty'
      }
    });

  } catch (error) {
    console.error('캐시 업데이트 오류:', error);
    res.status(500).json({ 
      error: '캐시 업데이트에 실패했습니다.',
      details: error.message 
    });
  }
}

/**
 * 캐시 상태 조회
 */
export async function getCacheStatus(req, res) {
  try {
    const now = new Date();
    const timeSinceLastUpdate = lastUpdateTime ? now - lastUpdateTime : null;
    const isExpired = timeSinceLastUpdate ? timeSinceLastUpdate > CACHE_DURATION : true;
    
    res.json({
      success: true,
      cacheStatus: {
        lastUpdate: lastUpdateTime,
        timeSinceLastUpdate: timeSinceLastUpdate,
        isExpired: isExpired,
        cacheDuration: CACHE_DURATION,
        nextUpdateIn: timeSinceLastUpdate ? CACHE_DURATION - timeSinceLastUpdate : null,
        dataAvailable: {
          hotPosts: hotPostsCache ? true : false
        }
      }
    });

  } catch (error) {
    console.error('캐시 상태 조회 오류:', error);
    res.status(500).json({ 
      error: '캐시 상태를 조회하는데 실패했습니다.',
      details: error.message 
    });
  }
}
