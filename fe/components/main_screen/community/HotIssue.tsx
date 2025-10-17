// 추천 글 + 게시판 컴포넌트
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { incrementView, getNewPosts, getHotPosts, getPersonalizedPosts } from "@/services/postService";
import { Post } from "@/types";
import { EvilIcons, FontAwesome, Ionicons } from "@expo/vector-icons";
import { router, Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';


interface CommunityPostProps {
  posts: Post[];
}


const HotIssue: React.FC<CommunityPostProps> = ({ posts }) => {
  const [userName, setUserName] = useState<string>("님");
  const [viewCount, setViewCount] = useState<number>(0);

  // 조회수 증가 핸들링
  const handlePostPress = (post: Post) => {
    incrementView(post.id);
    
    setViewCount(viewCount + 1);

    router.push({
      pathname: "/main/community/read_post",
      params: { post: JSON.stringify(post) }
    });
  };

  // 사용자 이름 가져오기
  useEffect(() => {
    const loadUserName = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem('@user_profile');
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          setUserName(profile.nickname || "님");
        }
      } catch (error) {
        console.error('사용자 이름 로드 실패:', error);
      }
    };
    
    loadUserName();
  }, []);

  // 처음 화면에 보여지는 게시글의 조회수를 상태로 설정
  useEffect(() => {
    if (posts.length > 0) {
      setViewCount(posts[0].views);
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.text}>{userName}님께 추천드리는 큐픽 🔥</Text>
        <Link href="/main/community/ai_recommend" asChild>
          <TouchableOpacity style={styles.aiButton}>
            <Text style={styles.aiButtonText}>AI 추천</Text>
          </TouchableOpacity>
        </Link>
      </View>
      <FlatList
        data={posts}
        horizontal
        contentContainerStyle={{ paddingBottom: 20 }}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item: post }) => (
          <TouchableOpacity
            style={[styles.cardContainer, { backgroundColor: COLORS.white, marginHorizontal: 5 }]}
            onPress={() => handlePostPress(post)}
          >
            <View style={styles.tag}>
              <Text style={[styles.tagText, { color: COLORS.gray }]}>{post.tag}</Text>
            </View>
            <Text style={[styles.title, { color: COLORS.darkGray }]}>{post.title}</Text>

            <View style={styles.viewContainer}>
              <View style={styles.statItem}>
                <EvilIcons name="like" size={15} />
                {/* <Text style={styles.statText}>{post.like_count}</Text> */}
              </View>
              <View style={styles.statItem}>
                <FontAwesome name="commenting-o" size={10} />
                <Text style={styles.statText}>{post.comment_count}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="eye-outline" size={14} />
                <Text style={styles.statText}>{viewCount}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <TouchableOpacity style={[styles.cardContainer, { backgroundColor: COLORS.secondary, marginLeft: SIZES.medium, marginRight: 5, }]}>
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
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.large,
    marginBottom: SIZES.large,
  },
  text: {
    ...FONTS.h3,
    fontWeight: 'bold',
    flex: 1,
  },
  aiButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
    borderRadius: SIZES.base,
  },
  aiButtonText: {
    ...FONTS.body,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  cardContainer: {
    width: 200,
    height: 200,
    padding: SIZES.medium,
    borderRadius: SIZES.medium,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tag: {
    alignSelf: 'flex-start',
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
    fontWeight: 'bold',
  },
  content: {
    ...FONTS.body,
    color: COLORS.gray,
    marginVertical: SIZES.base,
  },
  author: {
    position: 'absolute',
    ...FONTS.body,
    fontSize: SIZES.small,
    right: SIZES.large,
    bottom: SIZES.small,
  },
  viewContainer: {
    position: 'absolute',
    left: SIZES.medium,
    bottom: SIZES.small,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...FONTS.body,
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginLeft: 3,
  },
})

// AI 추천 페이지 컴포넌트
export const AIRecommendPage: React.FC = () => {
  const [personalizedPosts, setPersonalizedPosts] = useState<Post[]>([]);
  const [newPosts, setNewPosts] = useState<Post[]>([]);
  const [hotPosts, setHotPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('83152734-6697-4e81-a797-a915dfbc608a');

  // 개인화 추천, 새로 올라온 컨텐츠와 핫픽 데이터 로드
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const [personalizedPostsData, newPostsData, hotPostsData] = await Promise.all([
          getPersonalizedPosts(userId, 5, 0),
          getNewPosts(5, 0),
          getHotPosts(5, 0)
        ]);
        setPersonalizedPosts(personalizedPostsData);
        setNewPosts(newPostsData);
        setHotPosts(hotPostsData);
      } catch (error) {
        console.error('게시글 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [userId]);

  // 새로 올라온 컨텐츠 카드 클릭 핸들러
  const handleNewPostPress = (post: Post) => {
    incrementView(post.id);
    router.push({
      pathname: "/main/community/read_post",
      params: { post: JSON.stringify(post) }
    });
  };

  // 핫픽 카드 클릭 핸들러
  const handleHotPostPress = (post: Post) => {
    incrementView(post.id);
    router.push({
      pathname: "/main/community/read_post",
      params: { post: JSON.stringify(post) }
    });
  };

  // 개인화 추천 카드 클릭 핸들러
  const handlePersonalizedPostPress = (post: Post) => {
    incrementView(post.id);
    router.push({
      pathname: "/main/community/read_post",
      params: { post: JSON.stringify(post) }
    });
  };

  return (
    <View style={aiRecommendStyles.container}>
      {/* 헤더 */}
      <View style={aiRecommendStyles.header}>
        <Text style={aiRecommendStyles.headerTitle}>AI 추천</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={aiRecommendStyles.scrollView}>
        {/* 회원님을 위한 컨텐츠 */}
        <View style={aiRecommendStyles.section}>
          <Text style={aiRecommendStyles.sectionTitle}>회원님을 위한 컨텐츠</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={aiRecommendStyles.scrollContainer}>
            {loading ? (
              // 로딩 상태
              [1, 2, 3, 4, 5].map((item) => (
                <View key={item} style={aiRecommendStyles.card}>
                  <View style={[aiRecommendStyles.cardImage, { backgroundColor: COLORS.lightGray }]} />
                  <Text style={aiRecommendStyles.cardTitle}>로딩 중...</Text>
                  <Text style={aiRecommendStyles.cardSubtitle}>잠시만 기다려주세요</Text>
                </View>
              ))
            ) : personalizedPosts.length > 0 ? (
              // 실제 데이터 표시
              personalizedPosts.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  style={aiRecommendStyles.card}
                  onPress={() => handlePersonalizedPostPress(post)}
                >
                  <View style={aiRecommendStyles.cardImage}>
                    <Text style={aiRecommendStyles.cardImageText}>{post.tag}</Text>
                  </View>
                  <Text style={aiRecommendStyles.cardTitle} numberOfLines={2}>
                    {post.title}
                  </Text>
                  <Text style={aiRecommendStyles.cardSubtitle}>
                    AI 추천 ({post.personalizedScore ? Math.round(post.personalizedScore) : 0}점)
                  </Text>
                  <View style={aiRecommendStyles.cardStats}>
                    <View style={aiRecommendStyles.statItem}>
                      <Ionicons name="eye-outline" size={12} color={COLORS.gray} />
                      <Text style={aiRecommendStyles.statText}>{post.views}</Text>
                    </View>
                    <View style={aiRecommendStyles.statItem}>
                      <FontAwesome name="commenting-o" size={10} color={COLORS.gray} />
                      <Text style={aiRecommendStyles.statText}>{post.comment_count}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              // 데이터가 없을 때
              <View style={aiRecommendStyles.card}>
                <View style={aiRecommendStyles.cardImage} />
                <Text style={aiRecommendStyles.cardTitle}>추천할 글이 없습니다</Text>
                <Text style={aiRecommendStyles.cardSubtitle}>더 많은 활동을 해보세요</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* 실시간 핫픽 */}
        <View style={aiRecommendStyles.section}>
          <Text style={aiRecommendStyles.sectionTitle}>실시간 핫픽 🔥</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={aiRecommendStyles.scrollContainer}>
            {loading ? (
              // 로딩 상태
              [1, 2, 3, 4, 5].map((item) => (
                <View key={item} style={aiRecommendStyles.card}>
                  <View style={[aiRecommendStyles.cardImage, { backgroundColor: COLORS.lightGray }]} />
                  <Text style={aiRecommendStyles.cardTitle}>로딩 중...</Text>
                  <Text style={aiRecommendStyles.cardSubtitle}>잠시만 기다려주세요</Text>
                </View>
              ))
            ) : hotPosts.length > 0 ? (
              // 실제 데이터 표시
              hotPosts.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  style={aiRecommendStyles.card}
                  onPress={() => handleHotPostPress(post)}
                >
                  <View style={aiRecommendStyles.cardImage}>
                    <Text style={aiRecommendStyles.cardImageText}>{post.tag}</Text>
                  </View>
                  <Text style={aiRecommendStyles.cardTitle} numberOfLines={2}>
                    {post.title}
                  </Text>
                  <Text style={aiRecommendStyles.cardSubtitle}>
                    조회수 {post.views} (핫픽!)
                  </Text>
                  <View style={aiRecommendStyles.cardStats}>
                    <View style={aiRecommendStyles.statItem}>
                      <Ionicons name="eye-outline" size={12} color={COLORS.gray} />
                      <Text style={aiRecommendStyles.statText}>{post.views}</Text>
                    </View>
                    <View style={aiRecommendStyles.statItem}>
                      <FontAwesome name="commenting-o" size={10} color={COLORS.gray} />
                      <Text style={aiRecommendStyles.statText}>{post.comment_count}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              // 데이터가 없을 때
              <View style={aiRecommendStyles.card}>
                <View style={aiRecommendStyles.cardImage} />
                <Text style={aiRecommendStyles.cardTitle}>핫픽이 없습니다</Text>
                <Text style={aiRecommendStyles.cardSubtitle}>곧 인기 글이 올라올 예정입니다</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* 새로 올라온 컨텐츠 */}
        <View style={aiRecommendStyles.section}>
          <Text style={aiRecommendStyles.sectionTitle}>새로 올라온 컨텐츠</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={aiRecommendStyles.scrollContainer}>
            {loading ? (
              // 로딩 상태
              [1, 2, 3, 4, 5].map((item) => (
                <View key={item} style={aiRecommendStyles.card}>
                  <View style={[aiRecommendStyles.cardImage, { backgroundColor: COLORS.lightGray }]} />
                  <Text style={aiRecommendStyles.cardTitle}>로딩 중...</Text>
                  <Text style={aiRecommendStyles.cardSubtitle}>잠시만 기다려주세요</Text>
                </View>
              ))
            ) : newPosts.length > 0 ? (
              // 실제 데이터 표시
              newPosts.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  style={aiRecommendStyles.card}
                  onPress={() => handleNewPostPress(post)}
                >
                  <View style={aiRecommendStyles.cardImage}>
                    <Text style={aiRecommendStyles.cardImageText}>{post.tag}</Text>
                  </View>
                  <Text style={aiRecommendStyles.cardTitle} numberOfLines={2}>
                    {post.title}
                  </Text>
                  <Text style={aiRecommendStyles.cardSubtitle}>
                    {(post as any).timeAgo || '방금 전'}
                  </Text>
                  <View style={aiRecommendStyles.cardStats}>
                    <View style={aiRecommendStyles.statItem}>
                      <Ionicons name="eye-outline" size={12} color={COLORS.gray} />
                      <Text style={aiRecommendStyles.statText}>{post.views}</Text>
                    </View>
                    <View style={aiRecommendStyles.statItem}>
                      <FontAwesome name="commenting-o" size={10} color={COLORS.gray} />
                      <Text style={aiRecommendStyles.statText}>{post.comment_count}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              // 데이터가 없을 때
              <View style={aiRecommendStyles.card}>
                <View style={aiRecommendStyles.cardImage} />
                <Text style={aiRecommendStyles.cardTitle}>새로운 글이 없습니다</Text>
                <Text style={aiRecommendStyles.cardSubtitle}>곧 새로운 글이 올라올 예정입니다</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const aiRecommendStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pageBackground,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: SIZES.large,
    paddingBottom: SIZES.medium,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    ...FONTS.h2,
    color: COLORS.darkGray,
    fontWeight: 'bold',
  },
  section: {
    marginVertical: SIZES.medium,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.darkGray,
    fontWeight: 'bold',
    paddingHorizontal: SIZES.large,
    marginBottom: SIZES.small,
  },
  scrollContainer: {
    paddingLeft: SIZES.large,
  },
  card: {
    width: 150,
    height: 200,
    backgroundColor: COLORS.white,
    marginRight: SIZES.small,
    borderRadius: SIZES.base,
    padding: SIZES.small,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardImage: {
    width: '100%',
    height: 80,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.base,
    marginBottom: SIZES.small,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    ...FONTS.body,
    color: COLORS.darkGray,
    fontWeight: 'bold',
    marginBottom: SIZES.small,
  },
  cardSubtitle: {
    ...FONTS.body,
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  cardImageText: {
    ...FONTS.body,
    fontSize: SIZES.small,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.small,
    gap: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...FONTS.body,
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginLeft: 3,
  },
});

export default HotIssue;