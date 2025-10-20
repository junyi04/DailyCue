import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_STORAGE_KEY = '@user_profile';
const PROFILE_SYNC_KEY = '@profile_needs_sync';

export default function Setting() {
  const [profile, setProfile] = useState<{
    nickname: string;
    gender: string;
    age_range: string;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      // 이미 초기 로드가 완료된 경우, 백엔드 동기화만 확인
      if (hasInitialLoad) {
        const needsSync = await AsyncStorage.getItem(PROFILE_SYNC_KEY);
        if (needsSync !== 'true') {
          return; // 동기화가 필요하지 않으면 스킵
        }
      }

      if (!hasInitialLoad) {
        setIsLoading(true);
      }

      try {
        // 먼저 AsyncStorage에서 빠르게 로드
        const storedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
        if (storedProfile !== null && !hasInitialLoad) {
          const parsedProfile = JSON.parse(storedProfile);
          setProfile(parsedProfile);
          setNewNickname(parsedProfile.nickname || "");
          console.log('📥 AsyncStorage에서 프로필 로드:', parsedProfile);
        }

        // 백엔드 동기화가 필요한지 확인
        const needsSync = await AsyncStorage.getItem(PROFILE_SYNC_KEY);
        const shouldSync = needsSync === 'true' || storedProfile === null;

        // 백엔드에서 최신 데이터 가져오기
        if (shouldSync) {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            console.log('🔄 백엔드에서 최신 프로필 동기화...');
            const { data, error } = await supabase
              .from("profiles")
              .select("nickname, gender, age_range")
              .eq("id", user.id)
              .single();

            if (error) {
              console.error("프로필 조회 실패:", error.message);
              return;
            }

            console.log('📥 백엔드에서 가져온 프로필:', data);
            setProfile(data);
            setNewNickname(data.nickname || "");
            await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data));
            
            // 동기화 완료 플래그 제거
            await AsyncStorage.removeItem(PROFILE_SYNC_KEY);
            console.log('✅ 프로필 백엔드 동기화 완료');
          } catch (backendError) {
            console.error('❌ 프로필 백엔드 동기화 실패:', backendError);
            // 백엔드 실패 시 AsyncStorage 데이터 유지
          }
        } else if (!shouldSync) {
          console.log('📋 프로필 백엔드 동기화 불필요, AsyncStorage 데이터 사용');
        }
      } catch (error) {
        console.error('프로필을 가져오는데 실패했습니다.', error);
        if (!hasInitialLoad) {
          setProfile(null);
        }
      } finally {
        if (!hasInitialLoad) {
          setIsLoading(false);
          setHasInitialLoad(true);
        }
      }
    };

    fetchProfile();
  }, [hasInitialLoad]);

  // 새 닉네임 저장
  const handleSaveNickname = async () => {
    if (!newNickname.trim()) {
      Alert.alert("오류", "닉네임을 입력해주세요.");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 백엔드에 업데이트
      const { error } = await supabase
        .from("profiles")
        .update({ 
          nickname: newNickname, 
          updated_at: new Date() 
        })
        .eq("id", user.id);

      if (error) {
        console.error("닉네임 업데이트 실패:", error);
        Alert.alert("실패", "닉네임을 변경하지 못했습니다.");
        return;
      }

      // 로컬 상태 업데이트
      const updatedProfile = profile ? { ...profile, nickname: newNickname } : null;
      setProfile(updatedProfile);
      setIsEditing(false);
      
      // AsyncStorage에 저장
      if (updatedProfile) {
        await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
      }
      
      console.log('✅ 닉네임 업데이트 완료:', newNickname);
      Alert.alert("완료", "닉네임이 변경되었습니다.");
    } catch (error) {
      console.error('❌ 닉네임 저장 실패:', error);
      Alert.alert("오류", "닉네임 저장에 실패했습니다.");
    }
  };

  const handleMenuPress = (menu: string) => {
    console.log(`${menu} 메뉴 클릭`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: SIZES.medium,
        paddingBottom: SIZES.medium,
      }}>
        {/* 프로필 섹션 */}
        <View style={styles.profileSection}>
          <View style={styles.profileImage}>
            <Text style={styles.profileEmoji}>😊</Text>
          </View>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>프로필을 불러오는 중...</Text>
            </View>
          ) : isEditing ? (
            <>
              <TextInput
                style={styles.nicknameInput}
                value={newNickname}
                onChangeText={setNewNickname}
                placeholder="새 닉네임 입력"
              />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity onPress={handleSaveNickname} style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>저장</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>취소</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.profileTitle}>{profile?.nickname || "닉네임"}</Text>
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={styles.profileSubtitle}>내 정보 수정</Text>
              </TouchableOpacity>
            </>
          )}
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
  nicknameInput: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: 180,
    textAlign: "center",
    color: COLORS.black,
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  saveBtnText: { 
    color: COLORS.white, 
    fontWeight: "bold" 
  },
  cancelBtn: {
    backgroundColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelBtnText: { 
    color: COLORS.black 
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.medium,
  },
  loadingText: {
    ...FONTS.body,
    color: COLORS.gray,
  },
});