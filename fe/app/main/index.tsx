// 홈 화면
import Button from '@/components/main_screen/journal/Button';
import HeadScreen from '@/components/main_screen/journal/HeadScreen';
import SavedRecords from '@/components/main_screen/journal/SavedRecords';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { STORAGE_KEY } from '@/hooks/useRecords';
import { Record } from '@/types';
import { recordApiService } from '@/services/recordApiService';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState, useEffect } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';


export default function JournalScreen() {
  const [records, setRecords] = useState<Record[]>([]);
  const [modalRecord, setModalRecord] = useState<Record | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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
        try {
          // 백엔드에서 사용자별 기록 가져오기
          if (userId) {
            const backendRecords = await recordApiService.getRecords(userId);
            console.log('📥 백엔드에서 가져온 기록:', backendRecords);
            
            // 백엔드 데이터를 Record 타입으로 변환
            const convertedRecords: Record[] = backendRecords.map((record: any) => ({
              id: record.id || Date.now().toString(),
              emoji: '😐', // 기본 이모지 (Record 타입에 맞는 이모지)
              title: record.title || '기록',
              content: record.notes || '',
              createdAt: record.date || new Date().toISOString(),
            }));
            
            setRecords(convertedRecords);
          } else {
            // 로그인하지 않은 경우 로컬 스토리지에서 가져오기
            const storedRecords = await AsyncStorage.getItem(STORAGE_KEY);
            if (storedRecords !== null) {
              setRecords(JSON.parse(storedRecords));
            }
          }
        } catch (error) {
          console.error('기록을 가져오는데 실패했습니다.', error);
          // 에러 시 로컬 스토리지에서 가져오기
          try {
            const storedRecords = await AsyncStorage.getItem(STORAGE_KEY);
            if (storedRecords !== null) {
              setRecords(JSON.parse(storedRecords));
            }
          } catch (localError) {
            console.error('로컬 기록도 가져오는데 실패했습니다.', localError);
          }
        }
      }
      fetchRecords();
    }, [userId])
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
        <Button count={records.length} />
        <SavedRecords
          records={records}
          onRecordSelect={setModalRecord}
        />
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
});