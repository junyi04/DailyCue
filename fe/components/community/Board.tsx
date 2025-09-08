// ChooseTag에 따른 추천 글 + 게시글 뷰 배치 컴포넌트
import { DUMMY_POSTS } from "@/constants/communityContents";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { Post } from "@/types";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import HotIssue from "./HotIssue";


interface BoardProps {
  activeTag: Post['tag'] | null;
}
const Board: React.FC<BoardProps> = ({ activeTag }) => {
  return (
    <>
      <View style={{ borderWidth: 0.2, marginHorizontal: SIZES.medium, borderColor: COLORS.secondary }}></View>
      {activeTag === "전체"
        ? (
          <>
            <HotIssue posts={DUMMY_POSTS.slice(6, 10)} />
            <View style={{ borderWidth: 0.2, marginHorizontal: SIZES.medium, borderColor: COLORS.lightGray }}></View>
          </>
        ) : (
          <></>
        )}
      <Text style={styles.text}>게시글</Text>
    </>
  );
}

const styles = StyleSheet.create({
  text: {
    ...FONTS.h3,
    fontWeight: 'bold',
    paddingHorizontal: SIZES.large,
    marginVertical: 20,
  },
});

export default Board;