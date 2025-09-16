// 홈 화면
import Button from '@/components/main_screen/journal/Button';
import HeadScreen from '@/components/main_screen/journal/HeadScreen';
import SavedRecords from '@/components/main_screen/journal/SavedRecords';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { STORAGE_KEY } from '@/hooks/useRecords';
import { Record } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from "react";
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function JournalScreen() {
  const [records, setRecords] = useState<Record[]>([]);
  const [modalRecord, setModalRecord] = useState<Record | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchRecords = async () => {
        try {
          const storedRecords = await AsyncStorage.getItem(STORAGE_KEY);
          if (storedRecords !== null) {
            setRecords(JSON.parse(storedRecords));
          }
        } catch (error) {
          console.error('기록을 가져오는데 실패했습니다.', error);
        }
      }
      fetchRecords();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
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
        animationType="fade"
        transparent={false}
        onRequestClose={() => setModalRecord(null)}
      >
        {/* 모달 내부 */}
        <View style={styles.modalContainer}>
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
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  head: {
    height: 335,
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.pageBackground,
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