import { supabase } from "@/lib/supabase";
import { Post } from "@/types";

// API 기본 URL
const API_BASE_URL = 'https://emotions-e598.onrender.com';

// 게시글 조회 증가
export const incrementView = async (postId: string) => {
  try {
    const { data, error } = await supabase.rpc('increment_post_view', {
      post_id_to_increment: postId,
    });

    if (error) {
      throw new Error(error.message || 'Error incrementing view count');
    }

    console.log('View count updated successfully:', data);
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
};

// // 댓글 수 증가
// export const incrementCommentCount = async (postId) => {
//   try {
//     const { data, error } = await supabase
//       .from('posts')
//       .update({ comment_count: supabase.raw('comment_count + 1') })
//       .eq('id', postId);

//     if (error) {
//       throw new Error(error.message || 'Error incrementing comment count');
//     }

//     console.log('Comment count updated successfully:', data);
//   } catch (error) {
//     console.error('Error incrementing comment count:', error);
//   }
// };

// // 좋아요 수 증가
// export const incrementLikeCount = async (postId) => {
//   try {
//     const { data, error } = await supabase
//       .from('posts')
//       .update({ like_count: supabase.raw('like_count + 1') })
//       .eq('id', postId);

//     if (error) {
//       throw new Error(error.message || 'Error incrementing like count');
//     }

//     console.log('Like count updated successfully:', data);
//   } catch (error) {
//     console.error('Error incrementing like count:', error);
//   }
// };

// 게시글 생성
export const createPost = async (postData: Omit<Post, "id">) => {
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) {
  //   console.log('User not logged in, using temporary user_id');
  //   postData.user_id = "junyi";
  // } else {
  //   postData.user_id = user.id;
  // }

  const { data, error } = await supabase
    .from('posts')
    .insert(postData)
    .select()
    .single();

  if (error) {
    console.error('Error creating post:', error);
    throw error;
  }
  return data;
}

// 새로 올라온 컨텐츠 조회
export const getNewPosts = async (limit: number = 5, offset: number = 0): Promise<Post[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai-recommend/new-posts?limit=${limit}&offset=${offset}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching new posts:', error);
    return [];
  }
};

// 실시간 핫픽 조회
export const getHotPosts = async (limit: number = 5, offset: number = 0): Promise<Post[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai-recommend/hot-posts?limit=${limit}&offset=${offset}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching hot posts:', error);
    return [];
  }
};

// 개인화 추천 게시글 조회
export const getPersonalizedPosts = async (userId: string, limit: number = 5, offset: number = 0): Promise<Post[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai-recommend/personalized?user_id=${userId}&limit=${limit}&offset=${offset}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching personalized posts:', error);
    return [];
  }
};