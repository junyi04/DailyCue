import Board from "@/components/community/Board";
import ChooseTag from "@/components/community/ChooseTag";
import CommunityPost from '@/components/community/CommunityPost';
import SearchBox from "@/components/community/SearchBox";
import { DUMMY_POSTS } from '@/constants/communityContents';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { Post } from '@/types';
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function CommunityScreen() {
  const [activeTag, setActiveTag] = useState<Post['tag'] | null>('전체');

  const filteredPosts = activeTag === "전체"
    ? DUMMY_POSTS
    : DUMMY_POSTS.filter(post => post.tag === activeTag);

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

      <TouchableOpacity style={styles.post} onPress={() => router.push("/postCreation")}>
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
    bottom: SIZES.small,
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