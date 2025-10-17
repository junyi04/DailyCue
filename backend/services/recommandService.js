import { supabase } from '../config/database.js';

// 캐시 시스템
let newPostsCache = null;
let lastUpdateTime = null;

// 3시간 = 3 * 60 * 60 * 1000 밀리초
const CACHE_DURATION = 3 * 60 * 60 * 1000;
// 테스트용: 30초 = 30 * 1000 밀리초
// const CACHE_DURATION = 30 * 1000;

// 캐시가 유효한지 확인
const isCacheValid = () => {
  if (!lastUpdateTime) return false;
  const now = new Date();
  return (now - lastUpdateTime) < CACHE_DURATION;
};

// 시간 포맷팅 함수 (한국 시간 기준으로 정확한 시간 계산)
const formatTimeAgo = (createdAt) => {
  // 한국 시간으로 현재 시간 설정
  const now = new Date();
  const postTime = new Date(createdAt);
  
  // 한국 시간대 오프셋 적용 (UTC+9)
  const koreaOffset = 9 * 60; // 9시간을 분으로 변환
  const nowKorea = new Date(now.getTime() + (now.getTimezoneOffset() + koreaOffset) * 60000);
  const postTimeKorea = new Date(postTime.getTime() + (postTime.getTimezoneOffset() + koreaOffset) * 60000);
  
  // 밀리초 단위로 정확한 차이 계산 (한국 시간 기준)
  const diffInMilliseconds = nowKorea.getTime() - postTimeKorea.getTime();
  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  // 1분 미만
  if (diffInSeconds < 60) {
    if (diffInSeconds < 10) return '방금 전';
    return `${diffInSeconds}초 전`;
  }
  
  // 1시간 미만
  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  }
  
  // 24시간 미만
  if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  }
  
  // 7일 미만
  if (diffInDays < 7) {
    return `${diffInDays}일 전`;
  }
  
  // 7일 이상은 날짜로 표시
  return postTime.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// 새로 올라온 컨텐츠 캐시 업데이트 (내부 함수)
const updateNewPostsCacheInternal = async () => {
  try {
    console.log('🔄 새로 올라온 컨텐츠 캐시 업데이트 시작...');
    
    // 모든 게시글 가져오기 (created_at 기준으로 정렬하여 가져오기)
    const { data: allPosts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('새로 올라온 컨텐츠 캐시 업데이트 실패:', error);
      return;
    }

    // 게시글이 없으면 기존 캐시 유지
    if (!allPosts || allPosts.length === 0) {
      lastUpdateTime = new Date();
      console.log('ℹ️ 새로 올라온 컨텐츠 없음 - 기존 캐시 유지', {
        total: newPostsCache ? newPostsCache.length : 0,
        changes: false
      });
      return;
    }

    // 같은 시간에 생성된 게시글들을 인기도(좋아요 + 조회수) 순으로 정렬
    const sortedPosts = allPosts.sort((a, b) => {
      // 먼저 created_at으로 정렬 (최신순)
      const timeDiff = new Date(b.created_at) - new Date(a.created_at);
      if (timeDiff !== 0) {
        return timeDiff;
      }
      
      // 같은 시간이면 인기도(좋아요 + 조회수) 순으로 정렬
      const popularityA = (a.like_count || 0) + (a.views || 0);
      const popularityB = (b.like_count || 0) + (b.views || 0);
      return popularityB - popularityA;
    });

    // 이미 정렬된 데이터에 timeAgo와 타임스탬프 추가
    const newPosts = sortedPosts.map(post => ({
      ...post,
      timeAgo: formatTimeAgo(post.created_at),
      created_at_timestamp: new Date(post.created_at).getTime() // 정확한 시간 비교를 위한 타임스탬프
    }));
    
    // 기존 캐시와 비교하여 변경사항이 있는지 확인
    let hasChanges = false;
    if (!newPostsCache || newPostsCache.length !== newPosts.length) {
      hasChanges = true;
    } else {
      // 각 게시글의 ID와 생성시간을 비교
      for (let i = 0; i < newPosts.length; i++) {
        const newPost = newPosts[i];
        const oldPost = newPostsCache[i];
        
        if (!oldPost || 
            newPost.id !== oldPost.id || 
            newPost.created_at_timestamp !== oldPost.created_at_timestamp) {
          hasChanges = true;
          break;
        }
      }
    }
    
    // 변경사항이 있을 때만 캐시 업데이트
    if (hasChanges) {
      newPostsCache = newPosts;
      lastUpdateTime = new Date();
      
      console.log('✅ 새로 올라온 컨텐츠 캐시 업데이트 완료! (변경사항 있음)', {
        total: allPosts.length,
        changes: true
      });
    } else {
      // 변경사항이 없으면 기존 캐시 유지하고 업데이트 시간만 갱신
      lastUpdateTime = new Date();
      
      console.log('ℹ️ 새로 올라온 컨텐츠 캐시 확인 완료! (변경사항 없음)', {
        total: allPosts.length,
        changes: false
      });
    }

  } catch (error) {
    console.error('새로 올라온 컨텐츠 캐시 업데이트 오류:', error);
  }
};

// 한국 시간 기준으로 3시간마다 자동 업데이트 스케줄러
const scheduleUpdate = () => {
  const now = new Date();
  // 한국 시간으로 변환 (UTC+9)
  const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  
  // 다음 업데이트 시간 계산 (3시간 후)
  const nextUpdate = new Date(koreaTime.getTime() + CACHE_DURATION);
  
  const timeUntilUpdate = nextUpdate.getTime() - koreaTime.getTime();
  
  console.log(`⏰ 다음 새글 캐시 업데이트 예정: ${nextUpdate.toLocaleString('ko-KR')} (${Math.round(timeUntilUpdate / (1000 * 60 * 60))}시간 후)`);
  
  setTimeout(async () => {
    await updateNewPostsCacheInternal();
    scheduleUpdate(); // 다음 업데이트 스케줄링
  }, timeUntilUpdate);
};

// 스케줄러 시작
scheduleUpdate();

// 서버 시작 시 초기 캐시 생성
updateNewPostsCacheInternal();

/**
 * 새로 올라온 컨텐츠 조회 (created_at 기준 최신순)
 */
export async function getNewPosts(req, res) {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    // 캐시가 유효하지 않으면 업데이트
    if (!isCacheValid()) {
      await updateNewPostsCacheInternal();
    }

    // 캐시에서 데이터 가져오기
    const allPosts = newPostsCache || [];
    const paginatedPosts = allPosts.slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      data: paginatedPosts,
      count: paginatedPosts.length,
      total: allPosts.length,
      cached: true,
      lastUpdate: lastUpdateTime
    });

  } catch (error) {
    console.error('새로 올라온 컨텐츠 API 오류:', error);
    res.status(500).json({ 
      error: '서버 오류가 발생했습니다.',
      details: error.message 
    });
  }
}

/**
 * 새로 올라온 컨텐츠 캐시 수동 업데이트
 */
export async function updateNewPostsCache(req, res) {
  try {
    console.log('🔄 새로 올라온 컨텐츠 수동 캐시 업데이트 요청...');
    await updateNewPostsCacheInternal();
    
    res.json({
      success: true,
      message: '새로 올라온 컨텐츠 캐시가 성공적으로 업데이트되었습니다.',
      lastUpdate: lastUpdateTime,
      total: newPostsCache ? newPostsCache.length : 0
    });

  } catch (error) {
    console.error('새로 올라온 컨텐츠 캐시 업데이트 오류:', error);
    res.status(500).json({ 
      error: '캐시 업데이트에 실패했습니다.',
      details: error.message 
    });
  }
}

/**
 * 새로 올라온 컨텐츠 캐시 상태 조회
 */
export async function getNewPostsCacheStatus(req, res) {
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
        dataAvailable: newPostsCache ? true : false,
        totalPosts: newPostsCache ? newPostsCache.length : 0
      }
    });

  } catch (error) {
    console.error('새로 올라온 컨텐츠 캐시 상태 조회 오류:', error);
    res.status(500).json({ 
      error: '캐시 상태를 조회하는데 실패했습니다.',
      details: error.message 
    });
  }
}
