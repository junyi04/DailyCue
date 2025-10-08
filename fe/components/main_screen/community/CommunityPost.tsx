import { getTagColor } from '@/constants/tagColor';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { incrementView } from '@/services/postService';
import { Post } from '@/types';
import { EvilIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CommunityPostProps {
  post: Post;
}

const CommunityPost: React.FC<CommunityPostProps> = ({ post }) => {
  const [viewCount, setViewCount] = useState<number>(0);

  // 조회수 증가 핸들링
  const handlePostPress = (post: Post) => {
    // 백엔드에서 조회수 증가
    incrementView(post.id);

    // 조회수 증가 후 상태 업데이트
    setViewCount(viewCount + 1);

    console.log("TouchableOpacity clicked!");
    console.log("Sending post data:", post);

    // 상세 페이지로 이동
    router.push({
      pathname: "/main/community/read_post",
      params: { post: JSON.stringify(post) }
    });
  };

  // 처음 화면에 보여지는 게시글의 조회수를 상태로 설정
  useEffect(() => {
    setViewCount(post.views); // 게시글의 초기 조회수를 상태에 설정
  }, [post]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => handlePostPress(post)} // 클릭 시 조회수 증가 및 상세 페이지 이동
    >
      <View style={[styles.tag, { backgroundColor: getTagColor(post.tag) }]}>
        <Text style={styles.tagText}>{post.tag}</Text>
      </View>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.content} numberOfLines={2}>{post.content}</Text>
      <Text style={styles.author}>by {post.user_id}</Text>
      <View style={styles.viewContainer}>
        {/* 댓글 수와 좋아요 수는 임시로 주석 처리 */}
        <View style={styles.statItem}>
          <EvilIcons name="like" size={15} />
          {/* <Text style={styles.statText}>{post.like_count}</Text> */}
        </View>
        <View style={styles.statItem}>
          <FontAwesome name="commenting-o" size={10} />
          {/* <Text style={styles.statText}>{post.comment_count}</Text> */}
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
