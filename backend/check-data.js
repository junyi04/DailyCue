import { supabase } from './config/database.js';

// 기존 데이터 확인
const checkExistingData = async () => {
  try {
    console.log('🔍 기존 데이터 확인 중...');

    // 모든 게시글 가져오기
    const { data: allPosts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ 데이터 조회 실패:', error);
      return;
    }

    console.log(`📊 총 게시글 수: ${allPosts.length}`);
    
    if (allPosts.length === 0) {
      console.log('⚠️ 게시글이 없습니다. 프론트엔드에서 게시글을 작성해주세요.');
      return;
    }

    // 최근 5개 게시글 표시
    const recentPosts = allPosts.slice(0, 5);
    console.log('\n📝 최근 게시글들:');
    recentPosts.forEach((post, index) => {
      const timeAgo = Math.round((new Date() - new Date(post.created_at)) / (1000 * 60 * 60));
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   - 작성자: ${post.user_id}`);
      console.log(`   - 태그: ${post.tag}`);
      console.log(`   - 조회수: ${post.views}, 좋아요: ${post.like_count}, 댓글: ${post.comment_count}`);
      console.log(`   - 작성시간: ${timeAgo}시간 전`);
      console.log('');
    });

    console.log('🔍 이제 다음 API들을 테스트해보세요:');
    console.log('1. 핫픽 API: GET /api/community/hot-posts');
    console.log('2. 새글 API: GET /api/community/new-posts');
    console.log('3. 캐시 상태: GET /api/community/cache-status');

  } catch (error) {
    console.error('❌ 데이터 확인 중 오류:', error);
  }
};

// 실행
checkExistingData();
