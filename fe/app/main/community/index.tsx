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

  // posts 데이터 가져오기
  useFocusEffect(
    useCallback(() => {
      const fetchPosts = async () => {
        try {
          let query = supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (activeTag !== "전체") {
            query = query.eq('tag', activeTag);
          }

          const { data, error } = await query;

          if (error) throw error;

          setPosts(data || []);
          // console.log("Fetched posts:", data);
        } catch (err: any) {
          console.error("게시글 불러오기 실패:", err.message);
        }
      };

      fetchPosts();
    }, [activeTag])
  );
  
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

      {/* 일반 게시글 */}
      <FlatList
        data={posts}
        renderItem={({ item }) => <CommunityPost post={item} />}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingVertical: SIZES.medium }}
        ListHeaderComponent={
          <Board activeTag={activeTag} posts={posts} />
        } 
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
