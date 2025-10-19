import Board from "@/components/main_screen/community/Board";
import ChooseTag from "@/components/main_screen/community/ChooseTag";
import CommunityPost from '@/components/main_screen/community/CommunityPost';
import SearchBox from "@/components/main_screen/community/SearchBox";
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { supabase } from '@/lib/supabaseClient';
import { Post } from '@/types';
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

  const router = useRouter();

  // 게시글 불러오기
  useFocusEffect(
    useCallback(() => {
      const fetchPosts = async () => {
        try {
          let data: any[] = [];

          // 검색 모드
          if (searchKeyword.trim() !== '') {
            console.log('🔎 검색 실행:', searchKeyword);
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
          } 
          // 일반 모드 (태그별)
          else {
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

          setPosts(data);
        } catch (err: any) {
          console.error("게시글 불러오기 실패:", err.message);
        }
      };

      fetchPosts();
    }, [activeTag, searchKeyword])
  );

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
        renderItem={({ item }) => <CommunityPost post={item} />}
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