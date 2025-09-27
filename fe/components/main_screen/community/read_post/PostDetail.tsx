import { COLORS } from '@/constants/theme';
import React from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { getTagColor } from '@/constants/tagColor';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const HeartIcon = ({ filled }: { filled: boolean }) => <Text style={[styles.iconText, { color: filled ? COLORS.primary : COLORS.gray }]}>♥</Text>;
const CommentIcon = () => <Text style={styles.iconText}>💬</Text>;

const PostDetail = () => {
  const { post } = useLocalSearchParams();
  const parsedPost = post ? JSON.parse(post as string) : null;

  if (!parsedPost) {
    return <Text>포스트 없음</Text>;
  }

  const tagColor = getTagColor(parsedPost.tag);

  return (
    <SafeAreaProvider style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentWrapper}>
          <View style={styles.profileContainer}>
            <Image
              source={{ uri: `https://i.pravatar.cc/150?u=${parsedPost.author}` }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.authorName}>{parsedPost.author}</Text>
              <Text style={styles.postDate}>2025년 9월 25일</Text>
            </View>
          </View>
          
          <View style={styles.postContainer}>
            <View style={[styles.tag, { backgroundColor: tagColor }]}>
              <Text style={styles.tagText}>{parsedPost.tag}</Text>
            </View>
            <Text style={styles.title}>{parsedPost.title}</Text>
            <Text style={styles.content}>{parsedPost.content}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>좋아요 {parsedPost.like}</Text>
          <Text style={styles.statsText}>댓글 {parsedPost.comment}</Text>
          <Text style={styles.statsText}>조회수 {parsedPost.views}</Text>
        </View>
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton}>
          <HeartIcon filled={true} />
          <Text style={[styles.actionText, {color: COLORS.primary}]}>공감</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <CommentIcon />
          <Text style={styles.actionText}>댓글</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  scrollContainer: {
    paddingBottom: 80
  },
  contentWrapper: {
    backgroundColor: COLORS.white,
    padding: 20
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: COLORS.lightGray
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black
  },
  postDate: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2
  },
  postContainer: {},
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 20
  },
  tagText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 30,
    lineHeight: 32
  },
  content: {
    fontSize: 16,
    color: COLORS.darkGray,
    lineHeight: 24
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray
  },
  statsText: {
    fontSize: 13,
    color: COLORS.gray,
    marginRight: 16
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  iconText: {
    fontSize: 20,
    color: COLORS.darkGray
  }
});

export default PostDetail;