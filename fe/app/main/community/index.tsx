import Board from "@/components/main_screen/community/Board";
import ChooseTag from "@/components/main_screen/community/ChooseTag";
import CommunityPost from '@/components/main_screen/community/CommunityPost';
import SearchBox from "@/components/main_screen/community/SearchBox";
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { supabase } from '@/lib/supabaseClient';
import { Post } from '@/types';
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function CommunityScreen() {
  const { post } = useLocalSearchParams<{ post?: string }>();
  const parsedPost: Post | null = post ? JSON.parse(post) : null;

  // console.log("Parsed Post:", parsedPost);
  // console.log("Post param:", post); 

  // 기존 post + 새 글 합치기
  const [activeTag, setActiveTag] = useState<Post['tag'] | null>('전체');
  const [posts, setPosts] = useState<Post[]>([]);

  // supabase에서 데이터 가져오기
  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts_with_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error.message);
        return;
      }

      console.log("Fetched data:", data); 

      const allPosts = parsedPost ? [parsedPost, ...(data ?? [])] : (data ?? []);
      const filteredPosts = activeTag === "전체"
        ? allPosts
        : allPosts.filter(post => post.tag === activeTag);

      console.log("Filtered posts:", filteredPosts); 
      setPosts(filteredPosts);
    };

    fetchPosts();
  }, [activeTag, parsedPost]);

  const router = useRouter();

  return (
    <SafeAreaProvider style={styles.container}>
      <LinearGradient
        colors={[COLORS.secondary, COLORS.pageBackground]} 
        locations={[0.3, 0.7]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>커뮤니티</Text>
        <FontAwesome6 name="bell" size={20} />
      </View>

      <SearchBox />
      <ChooseTag activeTag={activeTag} setActiveTag={setActiveTag} />

      {/* 추천 글 */}
      <Board activeTag={activeTag} posts={posts} />

      {/* 일반 게시글 */}
      <FlatList
        data={posts}
        renderItem={({ item }) => <CommunityPost post={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingVertical: SIZES.medium }}
      />

      <TouchableOpacity
        style={styles.post}
        onPress={() => router.push('/main/community/write_post')}
      >
        <FontAwesome name="pencil" size={30} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: SIZES.mega,
  },
  headerTitle: { 
    ...FONTS.h2,
    color: COLORS.darkBlueGray,
    fontWeight: 'bold',
  },
  post: {
    position: 'absolute',
    bottom: SIZES.large,
    right: SIZES.small,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
});
