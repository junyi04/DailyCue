// Board.tsx
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { Post } from "@/types";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import HotIssue from "./HotIssue";

interface BoardProps {
  activeTag: Post['tag'] | null;
  posts: Post[];
}

const Board: React.FC<BoardProps> = ({ activeTag, posts }) => {
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(posts);  // 필터된 게시글 상태
  const [nickname, setNickname] = useState<string | null>(null);

  useEffect(() => {
    const fetchNickname = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('닉네임 불러오기 실패:', error.message);
        } else {
          setNickname(data?.nickname);
        }
      }
    };

    fetchNickname();
  }, []);

  // 게시글 조회수 업데이트 함수
  const updateViewCount = (id: string, newViewCount: number) => {
    const updatedPosts = posts.map(post => 
      post.id === id ? { ...post, views: newViewCount } : post
    );

    setFilteredPosts(updatedPosts);
  };


  useEffect(() => {
    const filtered = activeTag === "전체" ? posts : posts.filter(post => post.tag === activeTag);
    setFilteredPosts(filtered);  // 필터된 게시글 목록 상태 업데이트
  }, [activeTag, posts]);

  return (
    <View>
      {activeTag === "전체" && (
        <>
          <HotIssue posts={filteredPosts.slice(0, 4)} name={nickname} updateViewCount={updateViewCount} />
          <View style={{ borderWidth: 0.2, marginHorizontal: SIZES.medium, borderColor: COLORS.lightGray }}></View>
        </>
      )}
      <Text style={styles.text}>게시글</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    ...FONTS.h3,
    fontWeight: 'bold',
    paddingHorizontal: SIZES.large,
    marginVertical: 20,
  },
});

export default Board;