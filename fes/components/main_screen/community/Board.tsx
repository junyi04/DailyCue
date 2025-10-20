import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { Post } from "@/types";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import HotIssue from "./HotIssue";

interface BoardProps {
  activeTag: Post['tag'] | null;
  posts: Post[];
}

const Board: React.FC<BoardProps> = ({ activeTag, posts }) => {
  const filteredPosts = activeTag === "전체" ? posts : posts.filter(post => post.tag === activeTag);

  return (
    <View>
      {activeTag === "전체" && (
        <>
          <HotIssue posts={filteredPosts.slice(0, 4)} />
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
