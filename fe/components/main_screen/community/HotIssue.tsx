// HotIssue.tsx
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { supabase } from "@/lib/supabaseClient"; // supabase 임포트 추가
import { Post } from "@/types";
import { EvilIcons, FontAwesome, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CommunityPostProps {
  post: Post;
  name: string | null;
  updateViewCount: (id: string, newViewCount: number) => void;  // 부모 컴포넌트 상태 갱신 함수
}

const HotIssue: React.FC<{ posts: Post[]; name: string | null; updateViewCount: (id: string, newViewCount: number) => void; }> = ({ posts, name, updateViewCount }) => {
  const [topPosts, setTopPosts] = useState<Post[]>(posts);

  useEffect(() => {
    setTopPosts(posts);  // `posts` props로 받은 데이터를 `topPosts`에 설정
  }, [posts]);

  const handlePostPress = async (post: Post) => {
    try {
      const newViewCount = post.views + 1;
      await supabase
        .from("posts_with_details")
        .update({ views: newViewCount })
        .eq("id", post.id);

      // 조회수 바로 반영
      updateViewCount(post.id, newViewCount); // 부모 컴포넌트에서 상태 갱신

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
    <View style={styles.container}>
      <Text style={styles.text}>{name}님께 추천드리는 큐픽 🔥</Text>
      <FlatList
        data={topPosts}
        horizontal
        contentContainerStyle={{ paddingBottom: 20 }}
        keyExtractor={(item) => String(item.id)} // UUID를 처리할 수 있도록 수정
        showsHorizontalScrollIndicator={false}
        renderItem={({ item: post }) => (
          <TouchableOpacity
            style={[styles.cardContainer, { backgroundColor: COLORS.white, marginHorizontal: 5 }]}
            onPress={() => handlePostPress(post)} // handlePostPress를 각 게시글에 전달
          >
            <View style={styles.tag}>
              <Text style={[styles.tagText, { color: COLORS.gray }]}>{post.tag}</Text>
            </View>
            <Text style={[styles.title, { color: COLORS.darkGray }]}>{post.title}</Text>

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
                <Text style={styles.statText}>{post.views}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <TouchableOpacity style={[styles.cardContainer, { backgroundColor: COLORS.secondary, marginLeft: SIZES.medium, marginRight: 5 }]}>
            <View style={styles.tag}>
              <Text style={[styles.tagText, { color: COLORS.white }]}>공지사항</Text>
            </View>
            <Text style={[styles.title, { color: COLORS.white }]}>데일리큐 가이드라인</Text>
            <Text style={[styles.author, { color: COLORS.white }]}>DailyCue</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
  },
  text: {
    ...FONTS.h3,
    fontWeight: "bold",
    paddingHorizontal: SIZES.large,
    marginBottom: SIZES.large,
  },
  cardContainer: {
    width: 200,
    height: 200,
    padding: SIZES.medium,
    borderRadius: SIZES.medium,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tag: {
    alignSelf: "flex-start",
    borderRadius: SIZES.base,
    marginBottom: SIZES.small,
    paddingVertical: 5,
  },
  tagText: {
    ...FONTS.body,
    fontSize: SIZES.small,
  },
  title: {
    ...FONTS.h3,
    fontWeight: "bold",
  },
  content: {
    ...FONTS.body,
    color: COLORS.gray,
    marginVertical: SIZES.base,
  },
  author: {
    position: "absolute",
    ...FONTS.body,
    fontSize: SIZES.small,
    right: SIZES.large,
    bottom: SIZES.small,
  },
  viewContainer: {
    position: "absolute",
    left: SIZES.medium,
    bottom: SIZES.small,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    ...FONTS.body,
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginLeft: 3,
  },
});

export default HotIssue;