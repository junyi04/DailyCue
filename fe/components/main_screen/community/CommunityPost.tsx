// CommunityPost.tsx
import { getTagColor } from '@/constants/tagColor';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { supabase } from '@/lib/supabaseClient'; // supabase 임포트 추가
import { Post } from '@/types';
import { EvilIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CommunityPostProps {
  post: Post;
  onPress: () => void;
  updateViewCount: (id: string, newViewCount: number) => void;  // 부모 컴포넌트 상태 갱신 함수
}

const CommunityPost: React.FC<CommunityPostProps> = ({ post, onPress, updateViewCount }) => {
  const [viewCount, setViewCount] = useState(post.views);

  const handlePostPress = async () => {
    try {
      // 서버에 조회수 증가
      const newViewCount = viewCount + 1;
      await supabase
        .from("posts_with_details")
        .update({ views: newViewCount })
        .eq("id", post.id);

      // 로컬 상태 반영
      setViewCount(newViewCount);
      updateViewCount(post.id, newViewCount); // 부모 컴포넌트 상태 동기화

      // 게시물 페이지로 이동
      router.push({
        pathname: "/main/community/read_post",
        params: { post: JSON.stringify({ ...post, views: newViewCount }) },
      });
    } catch (error) {
      console.error('Error updating views:', error);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePostPress}>
      <View style={[styles.tag, { backgroundColor: getTagColor(post.tag) }]}>
        <Text style={styles.tagText}>{post.tag}</Text>
      </View>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.content} numberOfLines={2}>{post.content}</Text>
      <Text style={styles.author}>by {post.author ?? '익명'}</Text>

      <View style={styles.viewContainer}>
        <View style={styles.statItem}>
          <EvilIcons name="like" size={15} />
          <Text style={styles.statText}>{post.like_count}</Text>
        </View>
        <View style={styles.statItem}>
          <FontAwesome name="commenting-o" size={10} />
          <Text style={styles.statText}>{post.comment_count}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="eye-outline" size={14} />
          <Text style={styles.statText}>{viewCount}</Text>
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