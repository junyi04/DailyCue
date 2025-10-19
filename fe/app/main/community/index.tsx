import Board from "@/components/main_screen/community/Board";
import ChooseTag from "@/components/main_screen/community/ChooseTag";
import CommunityPost from "@/components/main_screen/community/CommunityPost";
import SearchBox from "@/components/main_screen/community/SearchBox";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { supabase } from "@/lib/supabaseClient"; // supabase 임포트 추가
import { Post } from "@/types";
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function CommunityScreen() {
  const [activeTag, setActiveTag] = useState<Post['tag'] | null>('전체');
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [viewCountMap, setViewCountMap] = useState<{ [key: string]: number }>({}); // 조회수 상태 맵

  const router = useRouter();

  // 게시글 불러오기
  useFocusEffect(
    useCallback(() => {
      const fetchPosts = async () => {
        try {
          let data: any[] = [];

          // 검색 모드
          if (searchKeyword.trim() !== '') {
            const { data: searchData, error: searchError } = await supabase.rpc(
              'get_search_suggestions',
              { search_term: searchKeyword }
            );
            if (searchError) throw searchError;

            // title 기준으로 posts 전체 조회
            if (searchData && searchData.length > 0) {
              const titles = searchData.map((item: any) => item.title);

              const { data: fullPosts, error: postsError } = await supabase
                .from('posts')
                .select('*')
                .in('title', titles)
                .order('created_at', { ascending: false });

              if (postsError) throw postsError;
              data = fullPosts || [];
            } else {
              data = [];
            }
          } else {
            let query = supabase
              .from('posts_with_details')
              .select('*')
              .order('created_at', { ascending: false });

            if (activeTag !== "전체") {
              query = query.eq('tag', activeTag);
            }

            const { data: tagData, error } = await query;
            if (error) throw error;
            data = tagData || [];
          }

          // 로컬 상태로 게시글 갱신
          setPosts(data);

          // 조회수 상태 업데이트 (기존 데이터와 조회수 맵을 업데이트)
          const newViewCountMap = data.reduce((acc, post) => {
            acc[post.id] = post.views;
            return acc;
          }, {});
          setViewCountMap(newViewCountMap);

        } catch (err: any) {
          console.error("게시글 불러오기 실패:", err.message);
        }
      };

      fetchPosts();
    }, [activeTag, searchKeyword])
  );

  // 게시글 조회수 증가 함수
  const handlePostPress = async (post: Post) => {
    try {
      await supabase
        .from("posts_with_details")
        .update({ views: post.views + 1 })
        .eq("id", post.id);

      // 조회수 증가 후 로컬 상태에 반영
      setViewCountMap((prevMap) => ({
        ...prevMap,
        [post.id]: (prevMap[post.id] || post.views) + 1,
      }));

      // 게시물 페이지로 이동
      router.push({
        pathname: "/main/community/read_post",
        params: { post: JSON.stringify(post) },
      });
    } catch (error) {
      console.error("Error updating views:", error);
    }
  };

  // 상태 업데이트 함수 전달
  const updateViewCount = (id: string, newViewCount: number) => {
    setViewCountMap((prevMap) => ({
      ...prevMap,
      [id]: newViewCount,
    }));
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <LinearGradient
        colors={[COLORS.secondary, COLORS.pageBackground]}
        locations={[0.3, 0.7]}
        style={StyleSheet.absoluteFill}
      />

      {/* 상단 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>커뮤니티</Text>
        <FontAwesome6 name="bell" size={20} />
      </View>

      {/* 검색창 */}
      <SearchBox onSearch={setSearchKeyword} />

      {/* 태그 선택 */}
      {searchKeyword.trim() === '' && (
        <ChooseTag activeTag={activeTag} setActiveTag={setActiveTag} />
      )}

      {/* 게시글 목록 */}
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <CommunityPost
            post={item}
            onPress={() => handlePostPress(item)} // 게시글 클릭 시 조회수 증가
            updateViewCount={updateViewCount} // 상태 업데이트 함수 전달
          />
        )}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingVertical: SIZES.medium }}
        ListHeaderComponent={
          searchKeyword.trim() === '' ? (
            <Board activeTag={activeTag} posts={posts} />
          ) : null
        }
      />

      {/* 글쓰기 버튼 */}
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
  container: { flex: 1 },
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