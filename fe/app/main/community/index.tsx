import Board from "@/components/main_screen/community/Board";
import ChooseTag from "@/components/main_screen/community/ChooseTag";
import CommunityPost from '@/components/main_screen/community/CommunityPost';
import SearchBox from "@/components/main_screen/community/SearchBox";
import { DUMMY_POSTS } from '@/constants/communityContents';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { Post } from '@/types';
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function CommunityScreen() {
  const { post } = useLocalSearchParams<{ post?: string }>();
  const parsedPost: Post | null = post ? JSON.parse(post) : null;
  
  // 기존 post + 새 글 합치기
  const [activeTag, setActiveTag] = useState<Post['tag'] | null>('전체');
  const posts = parsedPost ? [parsedPost, ...DUMMY_POSTS] : DUMMY_POSTS;

  const filteredPosts = activeTag === "전체"
    ? posts
    : posts.filter(post => post.tag === activeTag);


  // 백엔드 연결 시 API 호출 DB에 저장된 글 목록 불럭오기.
  // const [posts, setPosts] = useState<Post[]>([]);

  // useEffect(() => {
  //   const fetchPosts = async () => {
  //     const res = await fetch("http://localhost:8080/posts");
  //     const data = await res.json();
  //     setPosts(data);
  //   };
  //   fetchPosts();
  // }, []);


  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
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

      <FlatList
        data={filteredPosts}
        renderItem={({ item }) => <CommunityPost post={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingVertical: SIZES.medium }}
        ListHeaderComponent={<Board activeTag={activeTag} />}
      />

      <TouchableOpacity style={styles.post} onPress={() => router.push('/main/community/write_post')}>
        <FontAwesome name="pencil" size={30} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

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
  text: {
    ...FONTS.h3,
    fontWeight: 'bold',
    paddingHorizontal: SIZES.large,
    marginVertical: 20,
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