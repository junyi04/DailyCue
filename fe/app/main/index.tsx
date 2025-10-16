// 1. store/recordStore.js (Zustand 전역 상태 - TypeScript 버전)
import { create } from 'zustand';
import { recordApiService } from '@/services/recordApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorageKey } from '@/hooks/useRecords';

// 타입 정의 - 기존 types.ts의 Record 타입 사용
import { Record } from '@/types';

interface RecordStore {
  records: Record[];
  isLoading: boolean;
  lastSync: number | null;
  setRecords: (records: Record[]) => void;
  addRecord: (record: Record) => void;
  deleteRecord: (recordId: string, userId: string) => Promise<void>;
  syncWithBackend: (userId: string, force?: boolean) => Promise<void>;
  loadFromStorage: (userId: string) => Promise<void>;
}

export const useRecordStore = create<RecordStore>((set, get) => ({
  records: [],
  isLoading: false,
  lastSync: null,

  setRecords: (records: Record[]) => set({ records }),

  addRecord: (record: Record) => set((state) => ({ 
    records: [record, ...state.records] 
  })),

  // 낙관적 업데이트로 즉시 UI 반영
  deleteRecord: async (recordId: string, userId: string) => {
    const { records } = get();
    const deletedRecord = records.find((r: Record) => r.id === recordId);
    
    // 1. 즉시 UI에서 제거 (낙관적 업데이트)
    set({ records: records.filter((r: Record) => r.id !== recordId) });
    
    // 2. AsyncStorage 즉시 업데이트
    const updatedRecords = records.filter((r: Record) => r.id !== recordId);
    AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(updatedRecords)).catch(console.error);

    try {
      // 3. 백엔드 삭제 (백그라운드)
      await recordApiService.deleteRecord(recordId, userId);
      console.log('✅ 백엔드 삭제 완료');
    } catch (error) {
      console.error('❌ 백엔드 삭제 실패:', error);
      
      // 4. 실패 시 롤백
      if (deletedRecord) {
        set({ records: [...get().records, deletedRecord] });
        AsyncStorage.setItem(getStorageKey(userId), JSON.stringify([...get().records])).catch(console.error);
      }
      
      throw error; // UI에 에러 전달
    }
  },

  // 백엔드 동기화 (5분마다 또는 강제 호출 시에만)
  syncWithBackend: async (userId: string, force: boolean = false) => {
    const { lastSync } = get();
    const SYNC_INTERVAL = 5 * 60 * 1000; // 5분
    
    // 강제 호출이거나 5분 이상 지났을 때만 동기화
    if (!force && lastSync && Date.now() - lastSync < SYNC_INTERVAL) {
      console.log('🔄 최근 동기화 완료, 스킵');
      return;
    }

    set({ isLoading: true });
    
    try {
      const backendRecords = await recordApiService.getRecords(userId);
      
      const convertedRecords = backendRecords.map((record) => ({
        id: record.id || Date.now().toString(),
        emoji: '😐' as const,
        title: record.title || '기록',
        content: record.notes || '',
        createdAt: record.date || new Date().toISOString(),
      }));
      
      // 1. 로컬 상태 업데이트 (사용자가 바로 볼 수 있음)
      set({ 
        records: convertedRecords, 
        lastSync: Date.now() 
      });
      
      // 2. 로컬 저장소에도 저장
      await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(convertedRecords));
      console.log('✅ 백엔드 동기화 완료:', convertedRecords.length);
    } catch (error) {
      console.error('❌ 백엔드 동기화 실패:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // 초기 로드 (앱 시작 시 한 번만)
  loadFromStorage: async (userId: string) => {
    try {
      const storedRecords = await AsyncStorage.getItem(getStorageKey(userId));
      if (storedRecords) {
        const parsedRecords = JSON.parse(storedRecords);
        set({ records: parsedRecords });
        console.log('📥 AsyncStorage 로드:', parsedRecords.length);
      }
    } catch (error) {
      console.error('❌ AsyncStorage 로드 실패:', error);
    }
  },

}));


// 2. 개선된 JournalScreen.jsx (JavaScript 버전)
import Button from '@/components/main_screen/journal/Button';
import HeadScreen from '@/components/main_screen/journal/HeadScreen';
import SavedRecords from '@/components/main_screen/journal/SavedRecords';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { format, isToday } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function JournalScreen() {
  const { records, isLoading, deleteRecord, syncWithBackend, loadFromStorage } = useRecordStore();
  const [modalRecord, setModalRecord] = useState<Record | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // 오늘 기록 개수
  const getTodayRecordCount = () => {
    return records.filter((record: Record) => isToday(new Date(record.createdAt))).length;
  };

  // 삭제 핸들러 - 로컬 우선 업데이트 + 백엔드 동기화
  const handleRecordDelete = async (recordId: string) => {
    if (!userId) return;
    
    try {
      // 1. 로컬에서 즉시 삭제 (사용자가 바로 볼 수 있음)
      await deleteRecord(recordId, userId);
      
      // 2. 백그라운드에서 백엔드 동기화 (비동기로 실행)
      syncWithBackend(userId, true); // 강제 동기화
      
      console.log('✅ 기록 삭제 완료 - 로컬 업데이트 + 백엔드 동기화');
    } catch (error) {
      // 롤백은 store에서 자동 처리
      alert('기록 삭제에 실패했습니다.');
    }
  };

  // 사용자 인증 (한 번만)
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

  // 초기 데이터 로드 및 동기화 (userId 있을 때만)
  useEffect(() => {
    if (!userId) return;

    const initializeData = async () => {
      // 1. 먼저 로컬 데이터 즉시 로드 (사용자가 바로 볼 수 있음)
      await loadFromStorage(userId);
      
      // 2. 백그라운드에서 백엔드 동기화 (비동기로 실행)
      try {
        const needsSync = await AsyncStorage.getItem('@needsBackendSync');
        const shouldForceSync = needsSync === 'true';
        
        if (shouldForceSync) {
          console.log('🔄 백엔드 동기화 플래그 감지 - 강제 동기화 실행');
          await syncWithBackend(userId, true); // 강제 동기화
          await AsyncStorage.removeItem('@needsBackendSync'); // 플래그 제거
        } else {
          // 3. 백그라운드에서 백엔드 동기화 (5분마다만)
          syncWithBackend(userId); // await 제거 - 비동기로 실행
        }
      } catch (error) {
        console.error('❌ 동기화 플래그 확인 실패:', error);
        // 플래그 확인 실패 시에도 기본 동기화는 실행
        syncWithBackend(userId); // await 제거 - 비동기로 실행
      }
    };

    initializeData();
  }, [userId]);

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
        {isLoading && records.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>기록을 불러오는 중...</Text>
          </View>
        ) : (
          <>
            <Button count={getTodayRecordCount()} />
            <SavedRecords
              records={records}
              onRecordSelect={(record: Record) => setModalRecord(record)}
              onRecordDelete={handleRecordDelete}
              userId={userId || undefined}
            />
          </>
        )}
      </View>

      <Modal
        visible={!!modalRecord}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalRecord(null)}
      >
        <View style={styles.overlay}>
          <SafeAreaView style={[styles.modalContainer, { marginTop: 100 }]}>
            {modalRecord && (
              <>
                <View style={styles.expandedHeader}>
                  <Text style={styles.expandedDateText}>
                    {format(new Date(modalRecord.createdAt), 'yyyy년 M월 d일')}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setModalRecord(null)} 
                    style={styles.headerCollapseButton}
                  >
                    <Ionicons name="close" size={28} color={COLORS.darkGray} />
                  </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={styles.expandedScrollView}>
                  <Text style={styles.expandedEmoji}>{modalRecord.emoji}</Text>
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
}

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
  expandedEmoji: { 
    fontSize: 70, 
    textAlign: 'center', 
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