import { COMMENTS } from '@/constants/commentContents';
import { getTagColor } from '@/constants/tagColor';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { supabase } from '@/lib/supabaseClient';
import { FontAwesome } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import CommentModal from './CommentModal';

const PostDetail = () => {
  const { post } = useLocalSearchParams();
  const parsedPost = post ? JSON.parse(post as string) : null;

  const [postDetails, setPostDetails] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [userComments, setUserComments] = useState(COMMENTS);

  const relativeDate = formatDistanceToNow(new Date(), { addSuffix: true });

  if (!parsedPost) {
    return <Text>포스트 없음</Text>;
  }

  // 데이터 가져오기
  useEffect(() => {
    const fetchPostDetails = async () => {
      const { data, error } = await supabase
        .from('posts_with_details')
        .select('*')
        .eq('id', parsedPost.id)
        .single();

      if (error) {
        console.error('Error fetching post details:', error.message);
        return;
      }

      setPostDetails(data);
    };

    fetchPostDetails();
  }, [parsedPost.id]);

  const tagColor = getTagColor(postDetails?.tag);

  const handleLikePress = () => {
    setIsLiked(!isLiked);
  };

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      const newComment = {
        id: userComments.length + 100,
        author: '비밀',
        content: commentText,
        createdAt: new Date().toLocaleString('ko-KR'),
        likes: 0,
        avatar: 'https://i.pravatar.cc/150?u=anonymous'
      };
      setUserComments([...userComments, newComment]);
      setCommentText('');
    }
  };

  return (
    <SafeAreaProvider style={styles.safeArea}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StatusBar barStyle="dark-content" />
        
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* 포스트 헤더 */}
          <View style={styles.contentWrapper}>
            <View style={styles.tag}>
              <Text style={[styles.tagText, { color: tagColor }]}>{postDetails?.tag}</Text>
            </View>
            <Text style={styles.title}>{postDetails?.title}</Text>
            <View style={styles.profileContainer}>
              <Image
                source={{ uri: `https://i.pravatar.cc/150?u=${postDetails?.user_id}` }}
                style={styles.avatar}
              />
              <View>
                <Text style={styles.authorName}>{postDetails?.author || '익명'}</Text>
                <Text style={styles.postDate}>{relativeDate}</Text>
              </View>
            </View>
            
            {/* 포스트 내용 */}
            <View style={styles.postContainer}>
              <Text style={styles.content}>{postDetails?.content}</Text>
            </View>
          </View>
        </ScrollView>

        {/* 공감 및 댓글 */}
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLikePress}>
            {isLiked
              ? (
                <FontAwesome name="heart" size={20} color={'red'} />
              ) : (
                <FontAwesome name="heart-o" size={20} color={COLORS.black} />
              )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setIsCommentModalVisible(true)}>
            <FontAwesome name="commenting-o" size={20} color={COLORS.black} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* 댓글 모달 */}
      <CommentModal
        visible={isCommentModalVisible}
        onClose={() => setIsCommentModalVisible(false)}
        onSubmitComment={handleCommentSubmit}
        userComments={userComments}
      />
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  scrollContainer: {
    paddingBottom: 80
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
    backgroundColor: COLORS.lightGray
  },
  authorName: {
    fontSize: 13,
    color: COLORS.black
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
    fontWeight: 'bold'
  },
  title: {
    ...FONTS.h2,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 30,
    lineHeight: 32
  },
  content: {
    paddingTop: SIZES.small,
    fontSize: 15,
    color: COLORS.darkGray,
    lineHeight: 27,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 60,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 20
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginRight: 30
  },
  actionText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: '600'
  },

});

export default PostDetail;