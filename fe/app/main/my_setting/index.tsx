import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SIZES } from '@/constants/theme';

export default function Setting() {
  const handleMenuPress = (menu: string) => {
    console.log(`${menu} 메뉴 클릭`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 프로필 섹션 */}
        <View style={styles.profileSection}>
          <View style={styles.profileImage}>
            <Text style={styles.profileEmoji}>😊</Text>
          </View>
          <Text style={styles.profileTitle}>닉네임</Text>
          <Text style={styles.profileSubtitle}>내 정보 수정</Text>
        </View>

        {/* 메뉴 버튼 섹션 */}
        <View style={styles.cardSection}>
          <View style={styles.menuRow}>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => handleMenuPress('기록 보기')}
            >
              <View style={styles.menuIcon}>
                <Text style={styles.menuIconText}>📝</Text>
              </View>
              <Text style={styles.menuText}>기록 보기</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => handleMenuPress('내가 쓴 글')}
            >
              <View style={styles.menuIcon}>
                <Text style={styles.menuIconText}>✍️</Text>
              </View>
              <Text style={styles.menuText}>내가 쓴 글</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => handleMenuPress('고객센터')}
            >
              <View style={styles.menuIcon}>
                <Text style={styles.menuIconText}>🎧</Text>
              </View>
              <Text style={styles.menuText}>고객센터</Text>
            </TouchableOpacity>
          </View>
        </View>

     

        {/* 추가 메뉴 섹션 */}
        <View style={styles.cardSection}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('알림 설정')}
          >
            <Text style={styles.menuItemText}>알림 설정</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('개인정보 처리방침')}
          >
            <Text style={styles.menuItemText}>개인정보 처리방침</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('서비스 이용약관')}
          >
            <Text style={styles.menuItemText}>서비스 이용약관</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress('로그아웃')}
          >
            <Text style={styles.menuItemText}>로그아웃</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pageBackground,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SIZES.medium,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: SIZES.ultra,
    marginBottom: SIZES.large,
    marginTop: SIZES.large,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 40,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.medium,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileEmoji: {
    fontSize: SIZES.ultra + 10,
  },
  profileTitle: {
    ...FONTS.h2,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: SIZES.base,
  },
  profileSubtitle: {
    ...FONTS.body,
    color: COLORS.gray,
  },
  cardSection: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.large,
    padding: SIZES.large,
    marginBottom: SIZES.large,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  menuButton: {
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  menuIconText: {
    fontSize: SIZES.mega + 2,
  },
  menuText: {
    ...FONTS.body,
    color: COLORS.black,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.pageBackground,
  },
  menuItemText: {
    ...FONTS.body,
    color: COLORS.black,
  },
  chevron: {
    ...FONTS.h2,
    color: COLORS.gray,
  },
});