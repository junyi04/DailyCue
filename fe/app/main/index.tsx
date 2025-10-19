// 홈 화면
import Button from '@/components/main_screen/journal/Button';
import HeadScreen from '@/components/main_screen/journal/HeadScreen';
import SavedRecords from '@/components/main_screen/journal/SavedRecords';
import { emojiImages } from '@/constants/emojiMap';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { STORAGE_KEY } from '@/hooks/useRecords';
import { supabase } from '@/lib/supabase';
import { recordApiService } from '@/services/recordApiService';
import { Record } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, isToday } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from "react";
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';


export default function JournalScreen() {
  const [records, setRecords] = useState<Record[]>([]);
  const [modalRecord, setModalRecord] = useState<Record | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // 오늘 기록 개수 계산
  const getTodayRecordCount = () => {
    return records.filter(record => {
      const recordDate = new Date(record.createdAt);
      return isToday(recordDate);
    }).length;
  };


  // 현재 로그인된 사용자 정보 가져오기
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error getting user:', error.message);
          return;
        }
        if (user) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Error in getCurrentUser:', error);
      }
    };

    getCurrentUser();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchRecords = async () => {
        // 이미 초기 로드가 완료된 경우, 백엔드 동기화만 확인
        if (hasInitialLoad) {
          const needsSync = await AsyncStorage.getItem('@needsBackendSync');
          if (needsSync !== 'true') {
            return; // 동기화가 필요하지 않으면 스킵
          }
        }

        if (!hasInitialLoad) {
          setIsLoading(true);
        }

        try {
          // 먼저 AsyncStorage에서 빠르게 로드
          const storedRecords = await AsyncStorage.getItem(STORAGE_KEY);
          if (storedRecords !== null && !hasInitialLoad) {
            const parsedRecords = JSON.parse(storedRecords);
            setRecords(parsedRecords);
            console.log('📥 AsyncStorage에서 기록 로드:', parsedRecords.length);
          }

          // 백엔드 동기화가 필요한지 확인
          const needsSync = await AsyncStorage.getItem('@needsBackendSync');
          const shouldSync = needsSync === 'true' || storedRecords === null;

          // 백엔드에서 최신 데이터 가져오기
          if (userId && shouldSync) {
            try {
              console.log('🔄 백엔드에서 최신 데이터 동기화...');
              const backendRecords = await recordApiService.getRecords(userId);
              console.log('📥 백엔드에서 가져온 기록:', backendRecords);
              
              // 백엔드 데이터를 Record 타입으로 변환
              const convertedRecords: Record[] = backendRecords.map((record: any) => ({
                id: record.id || Date.now().toString(),
                emoji: record.emotion || 'soso', // 기본 이모지
                title: record.title || '기록',
                content: record.notes || '',
                createdAt: record.date || new Date().toISOString(),
              }));
              
              setRecords(convertedRecords);
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(convertedRecords));
              
              // 동기화 완료 플래그 제거
              await AsyncStorage.removeItem('@needsBackendSync');
              console.log('✅ 백엔드 동기화 완료');
            } catch (backendError) {
              console.error('❌ 백엔드 동기화 실패:', backendError);
              // 백엔드 실패 시 AsyncStorage 데이터 유지
            }
          } else if (userId && !shouldSync) {
            console.log('📋 백엔드 동기화 불필요, AsyncStorage 데이터 사용');
          }
        } catch (error) {
          console.error('기록을 가져오는데 실패했습니다.', error);
          if (!hasInitialLoad) {
            setRecords([]);
          }
        } finally {
          if (!hasInitialLoad) {
            setIsLoading(false);
            setHasInitialLoad(true);
          }
        }
      }
      fetchRecords();
    }, [userId, hasInitialLoad])
  );


  return (
    <SafeAreaProvider style={styles.container}>
      <LinearGradient
        colors={[COLORS.secondary, COLORS.pageBackground]}
        locations={[0.3, 0.7]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.head}>
        <HeadScreen />
      </View>
      <View style={styles.body}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>기록을 불러오는 중...</Text>
          </View>
        ) : (
          <>
            <Button count={getTodayRecordCount()} />
            <SavedRecords
              records={records}
              onRecordSelect={setModalRecord}
            />
          </>
        )}
      </View>

      {/* modalRecord가 있을 때만 Modal 띄움 */}
      <Modal
        visible={!!modalRecord}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalRecord(null)}
      >
        {/* 모달 내부 */}
        <View style={styles.overlay}>
          <SafeAreaView style={[styles.modalContainer, { marginTop: 100 }]}>
            {modalRecord && (
              <>
                <View style={styles.expandedHeader}>
                  <Text style={styles.expandedDateText}>
                    {format(new Date(modalRecord.createdAt), 'yyyy년 M월 d일')}
                  </Text>
                  <TouchableOpacity onPress={() => setModalRecord(null)} style={styles.headerCollapseButton}>
                    <Ionicons name="close" size={28} color={COLORS.darkGray} />
                  </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={styles.expandedScrollView}>
                  <Image
                    source={emojiImages[modalRecord.emoji ?? 'neutral']}
                    style={styles.expandedEmojiImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.expandedTitle}>{modalRecord.title}</Text>
                  <Text style={styles.expandedContent}>{modalRecord.content}</Text>
                </ScrollView>
              </>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  head: {
    height: 335,
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
  flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-start",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.pageBackground,
    borderTopLeftRadius: SIZES.large,
    borderTopRightRadius: SIZES.large,
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  expandedDateText: { 
    ...FONTS.h4, 
    fontWeight: 'bold', 
    color: COLORS.darkGray 
  },
  headerCollapseButton: { 
    padding: 5 
  },
  expandedScrollView: {
    padding: SIZES.large, 
  },
  expandedEmojiImage: {
    width: 90,
    height: 90,
    alignSelf: 'center',
    marginBottom: SIZES.mega,
  },
  expandedTitle: { 
    ...FONTS.h2, 
    fontWeight: 'bold', 
    marginBottom: 50,
    textAlign: 'center',
    color: COLORS.black 
  },
  expandedContent: { 
    ...FONTS.h3,
    lineHeight: 25, 
    color: COLORS.darkGray,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 10,
  },
});