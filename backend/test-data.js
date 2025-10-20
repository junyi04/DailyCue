import { supabase } from './config/database.js';

// 테스트 데이터 생성 함수
const createTestData = async () => {
  try {
    console.log('🧪 테스트 데이터 생성 시작...');

    // 기존 테스트 데이터 삭제 (선택사항)
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .like('title', '테스트%');

    if (deleteError) {
      console.log('기존 테스트 데이터 삭제 중 오류:', deleteError.message);
    } else {
      console.log('✅ 기존 테스트 데이터 삭제 완료');
    }

    // 테스트 게시글 데이터
    const testPosts = [
      {
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        tag: '공유해요',
        title: '테스트 게시글 1 - 최신글',
        content: '이것은 최신 테스트 게시글입니다. 조회수와 좋아요가 많아서 핫픽에 올라갈 것 같습니다!',
        views: 150,
        like_count: 25,
        comment_count: 12,
        created_at: new Date().toISOString() // 현재 시간
      },
      {
        user_id: '550e8400-e29b-41d4-a716-446655440002',
        tag: '공감원해요',
        title: '테스트 게시글 2 - 1시간 전',
        content: '1시간 전에 작성된 게시글입니다. 조회수는 적지만 좋아요가 많습니다.',
        views: 45,
        like_count: 30,
        comment_count: 8,
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1시간 전
      },
      {
        user_id: '550e8400-e29b-41d4-a716-446655440003',
        tag: '함께해요',
        title: '테스트 게시글 3 - 3시간 전',
        content: '3시간 전에 작성된 게시글입니다. 댓글이 많습니다.',
        views: 80,
        like_count: 15,
        comment_count: 20,
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3시간 전
      },
      {
        user_id: '550e8400-e29b-41d4-a716-446655440004',
        tag: '고수찾아요',
        title: '테스트 게시글 4 - 6시간 전',
        content: '6시간 전에 작성된 게시글입니다. 조회수는 많지만 좋아요는 적습니다.',
        views: 200,
        like_count: 5,
        comment_count: 3,
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6시간 전
      },
      {
        user_id: '550e8400-e29b-41d4-a716-446655440005',
        tag: '전체',
        title: '테스트 게시글 5 - 15시간 전 (오래된 글)',
        content: '15시간 전에 작성된 오래된 게시글입니다. 시간 가중치가 0이 될 것입니다.',
        views: 100,
        like_count: 20,
        comment_count: 15,
        created_at: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString() // 15시간 전
      },
      {
        user_id: '550e8400-e29b-41d4-a716-446655440006',
        tag: '공유해요',
        title: '테스트 게시글 6 - 2시간 전',
        content: '2시간 전에 작성된 게시글입니다. 모든 지표가 균형있습니다.',
        views: 90,
        like_count: 18,
        comment_count: 10,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2시간 전
      }
    ];

    // 데이터베이스에 삽입
    const { data, error } = await supabase
      .from('posts')
      .insert(testPosts)
      .select();

    if (error) {
      console.error('❌ 테스트 데이터 생성 실패:', error);
      return;
    }

    console.log('✅ 테스트 데이터 생성 완료!');
    console.log(`📊 생성된 게시글 수: ${data.length}`);
    
    // 생성된 데이터 요약
    data.forEach((post, index) => {
      const timeAgo = Math.round((new Date() - new Date(post.created_at)) / (1000 * 60 * 60));
      console.log(`${index + 1}. ${post.title} (${timeAgo}시간 전, 조회:${post.views}, 좋아요:${post.like_count}, 댓글:${post.comment_count})`);
    });

    console.log('\n🔍 이제 다음 API들을 테스트해보세요:');
    console.log('1. 핫픽 API: GET /api/community/hot-posts');
    console.log('2. 새글 API: GET /api/community/new-posts');
    console.log('3. 캐시 상태: GET /api/community/cache-status');

  } catch (error) {
    console.error('❌ 테스트 데이터 생성 중 오류:', error);
  }
};

// 실행
createTestData();
