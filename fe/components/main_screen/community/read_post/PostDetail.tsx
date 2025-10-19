import { getTagColor } from '@/constants/tagColor';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { incrementView } from '@/services/postService';
import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import CommentModal from './CommentModal';

function formatTimeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 172800) return '하루 전';
  return `${Math.floor(diff / 86400)}일 전`;
}

const PostDetail = () => {
  const { post } = useLocalSearchParams();
  const parsedPost = post ? JSON.parse(post as string) : null;

  const [isLiked, setIsLiked] = useState(false);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [userComments, setUserComments] = useState<any[]>([]);
  const [viewCount, setViewCount] = useState<number>(parsedPost ? parsedPost.views : 0);
  const [currentUserName, setCurrentUserName] = useState('');

  // 조회수 1회만 증가하도록 ref로 제어
  const hasIncrementedView = useRef(false);

  const relativeDate = parsedPost?.created_at
    ? formatTimeAgo(parsedPost.created_at)
    : '';

  if (!parsedPost) return <Text>포스트 없음</Text>;

  // 🔹 사용자 닉네임 가져오기
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', user.id)
        .single();

      if (profileError) console.error(profileError);
      else setCurrentUserName(profile?.nickname || '익명');
    };
    fetchUserProfile();
  }, []);

  // 🔹 댓글 불러오기
  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', parsedPost.id)
      .order('created_at', { ascending: false });

    if (error) console.error('댓글 불러오기 오류:', error);
    else {
      // 댓글에 대해 작성자의 정보를 가져오기
      const commentsWithAuthors = await Promise.all(
        data.map(async (comment) => {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('nickname')
            .eq('id', comment.user_id)
            .single();

          if (profileError || !profileData) {
            console.error('작성자 정보 불러오기 오류:', profileError);
          }

          // 댓글 객체에 author 추가
          return {
            ...comment,
            author: profileData?.nickname || '익명',
          };
        })
      );

      setUserComments(commentsWithAuthors);
    }
  };

  useEffect(() => {
    if (parsedPost?.id) fetchComments();
  }, [parsedPost]);

  // 댓글 추가
  const handleCommentSubmit = async (commentText: string) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 댓글 객체 생성
    const newComment = {
      post_id: parsedPost.id,
      user_id: user.id,
      content: commentText,
    };

    try {
      const { data, error } = await supabase.from('comments').insert([newComment]);
      if (error) {
        console.error('댓글 저장 오류:', error.message);
        alert(`댓글 저장에 실패했습니다: ${error.message}`);
      } else {
        console.log('댓글 저장 성공:', data);
        await fetchComments(); // 댓글 저장 후 불러오기
      }
    } catch (error) {
      console.error('댓글 저장 예외 발생:', error);
      alert('댓글 저장에 실패했습니다.');
    }
  };

  // 조회수 증가
  useEffect(() => {
    if (parsedPost?.id && !hasIncrementedView.current) {
      hasIncrementedView.current = true;
      incrementView(parsedPost.id)
        .then(() => {
          console.log(`✅ View incremented for post ${parsedPost.id}`);
          setViewCount((prev) => prev + 1);
        })
        .catch((error) => console.error('❌ Error incrementing view:', error));
    }
  }, [parsedPost?.id]);

  const tagColor = getTagColor(parsedPost.tag);
  const handleLikePress = () => setIsLiked(!isLiked);

  return (
    <SafeAreaProvider style={styles.safeArea}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* 포스트 내용 */}
          <View style={styles.contentWrapper}>
            <View style={styles.tag}>
              <Text style={[styles.tagText, { color: tagColor }]}>{parsedPost.tag}</Text>
            </View>
            <Text style={styles.title}>{parsedPost.title}</Text>

            <View style={styles.profileContainer}>
              <Image
                source={{ uri: `https://i.pravatar.cc/150?u=${parsedPost.user_id}` }}
                style={styles.avatar}
              />
              <View>
                <Text style={styles.authorName}>{parsedPost.author ?? '익명'}</Text>
                <Text style={styles.postDate}>{relativeDate}</Text>
              </View>
            </View>

            <View style={styles.postContainer}>
              <Text style={styles.content}>{parsedPost.content}</Text>
            </View>
          </View>
        </ScrollView>

        {/* 하단 버튼 */}
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLikePress}>
            <FontAwesome
              name={isLiked ? 'heart' : 'heart-o'}
              size={20}
              color={isLiked ? 'red' : COLORS.black}
            />
            <Text style={styles.actionText}>{parsedPost.like_count}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsCommentModalVisible(true)}
          >
            <FontAwesome name="commenting-o" size={20} color={COLORS.black} />
            <Text style={styles.actionText}>{userComments.length}</Text>
          </TouchableOpacity>

          {/* 조회수 표시 */}
          <View style={[styles.actionButton, { marginLeft: 'auto' }]}>
            <FontAwesome name="eye" size={20} color={COLORS.gray} />
            <Text style={styles.actionText}>{viewCount}</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* 댓글 모달 */}
      <CommentModal
        visible={isCommentModalVisible}
        onClose={() => setIsCommentModalVisible(false)}
        onSubmitComment={handleCommentSubmit}
        userComments={userComments}
        currentUserName={currentUserName}
      />
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  contentWrapper: {
    backgroundColor: COLORS.white,
    padding: SIZES.large,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.large,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: COLORS.lightGray,
  },
  authorName: {
    fontSize: 13,
    color: COLORS.black,
  },
  postDate: {
    ...FONTS.h4,
    color: COLORS.gray,
    marginTop: 5,
  },
  postContainer: {
    paddingTop: SIZES.large,
    borderTopWidth: 0.7,
    borderColor: COLORS.gray,
  },
  tag: {
    alignSelf: 'flex-start',
    marginBottom: SIZES.small,
  },
  tagText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    ...FONTS.h2,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 30,
    lineHeight: 32,
  },
  content: {
    paddingTop: SIZES.small,
    fontSize: 15,
    color: COLORS.darkGray,
    lineHeight: 27,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginRight: 20,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: '600',
  },
});

export default PostDetail;