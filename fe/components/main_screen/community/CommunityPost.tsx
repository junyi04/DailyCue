import { getTagColor } from '@/constants/tagColor';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types';
import { EvilIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CommunityPostProps {
  post: Post;
}

const CommunityPost: React.FC<CommunityPostProps> = ({ post }) => {
  const [currentPost, setCurrentPost] = useState<Post>(post);
  const [error, setError] = useState(null);

  // 데이터를 fetch하고 상태 업데이트
  const fetchPostDetails = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('posts_with_details')
        .select('*')
        .eq('id', postId)
        .single();

      if (error) {
        return;
      }

      setCurrentPost(data);  // 상태 업데이트
    } catch (err: any) {
      setError(err.message);
    }
  };

  // views를 증가시키는 함수
  const handlePostPress = async (post: Post) => {
    try {
      // views 값 증가
      await supabase
        .from('posts_with_details')
        .update({ views: post.views + 1 })
        .eq('id', post.id);

      // 데이터 갱신 후 화면 이동
      fetchPostDetails(post.id);  // 데이터 새로고침

      router.push({
        pathname: "/main/community/read_post",
        params: { post: JSON.stringify(post) }
      });
    } catch (err: any) {
      console.error("에러:", err.message);
    }
  };

  useEffect(() => {
    if (currentPost.id) {
      fetchPostDetails(currentPost.id); // 처음 로드될 때 데이터 가져오기
    }
  }, [currentPost.id]);

  if (error) {
    return <Text>{error}</Text>;
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => handlePostPress(currentPost)}
    >
      <View style={[styles.tag, { backgroundColor: getTagColor(currentPost.tag) }]}>
        <Text style={styles.tagText}>{currentPost.tag}</Text>
      </View>
      <Text style={styles.title}>{currentPost.title}</Text>
      <Text style={styles.content} numberOfLines={2}>{currentPost.content}</Text>
      <Text style={styles.author}>by {currentPost.author || '익명'}</Text>
      <View style={styles.viewContainer}>
        <View style={styles.statItem}>
          <EvilIcons name="like" size={15} />
          <Text style={styles.statText}>{currentPost.like_count}</Text>
        </View>
        <View style={styles.statItem}>
          <FontAwesome name="commenting-o" size={10} />
          <Text style={styles.statText}>{currentPost.comment_count}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="eye-outline" size={14} />
          <Text style={styles.statText}>{currentPost.views}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    padding: SIZES.medium,
    borderRadius: SIZES.medium,
    marginHorizontal: SIZES.medium,
    marginBottom: SIZES.medium,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: SIZES.small,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.base,
    marginBottom: SIZES.small,
  },
  tagText: {
    ...FONTS.body,
    fontSize: SIZES.small,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  title: {
    ...FONTS.h3,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  content: {
    ...FONTS.body,
    color: COLORS.gray,
    marginVertical: SIZES.base,
  },
  author: {
    ...FONTS.body,
    fontSize: SIZES.small,
    color: COLORS.gray,
    textAlign: 'right',
  },
  viewContainer: {
    position: 'absolute',
    left: SIZES.medium,
    bottom: SIZES.small,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...FONTS.body,
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginLeft: 3,
  },
});

export default CommunityPost;