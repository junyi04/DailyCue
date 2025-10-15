import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { Record } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { format, isSameDay } from 'date-fns';
import React, { useState, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import MonthlyCalendar from "./calendar/MonthlyCalendar";
import { recordApiService } from '@/services/recordApiService';

interface SavedRecordsProps {
  records: Record[];
  onRecordSelect: (record: Record) => void;
  onRecordDelete?: (recordId: string) => Promise<void>;
  userId?: string;
}

export const SavedRecords: React.FC<SavedRecordsProps> = ({ records, onRecordSelect, onRecordDelete, userId }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const RECORDS_PER_PAGE = 3;

  // 선택된 날짜의 기록들만 필터링하고 시간순으로 정렬 (최신 기록이 위에)
  const recordsForSelectedDay = records
    .filter(record => 
      record.createdAt && isSameDay(new Date(record.createdAt), selectedDate)
    )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

  // 페이지네이션 계산
  const totalPages = Math.ceil(recordsForSelectedDay.length / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;
  const currentRecords = recordsForSelectedDay.slice(startIndex, endIndex);

  // 날짜가 변경되면 첫 페이지로 리셋
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate]);

  // 단일클릭: 상세보기 모달 열기
  const handleRecordPress = (record: Record) => {
    onRecordSelect(record);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 기록 삭제 핸들러
  const handleDeleteRecord = async (record: Record) => {
    if (!record.id) {
      Alert.alert('오류', '삭제할 기록의 ID가 없습니다.');
      return;
    }

    Alert.alert(
      '기록 삭제',
      '이 기록을 삭제하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ 기록 삭제 요청:', record.id);
              console.log('👤 사용자 ID:', userId || 'test_user');
              
              // 부모 컴포넌트에 삭제 요청 (실제 삭제는 부모에서 처리)
              if (onRecordDelete) {
                await onRecordDelete(record.id);
                Alert.alert('성공', '기록이 삭제되었습니다.');
              } else {
                Alert.alert('오류', '삭제 기능을 사용할 수 없습니다.');
              }
            } catch (error) {
              console.error('❌ 기록 삭제 실패:', error);
              Alert.alert('오류', '기록 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollViewStyle}
        showsVerticalScrollIndicator={false}
      >
        <MonthlyCalendar
          onDateSelect={setSelectedDate}
        />
        <View style={styles.recordDisplayArea}>
          <View style={styles.recordsHeader}>
            <Text style={styles.recordsTitle}>
              {format(selectedDate, 'M월 d일')} 기록
            </Text>
            <Text style={styles.recordsCount}>{recordsForSelectedDay.length}개</Text>
          </View>
          
          {recordsForSelectedDay.length > 0 ? (
            <>
              <View style={styles.recordsList}>
                {currentRecords.map((record, index) => (
                <TouchableOpacity 
                  key={record.id || index} 
                  style={styles.recordItem} 
                  onPress={() => handleRecordPress(record)}
                  activeOpacity={0.8}
                >
                  <View style={styles.headerLeft}>
                    <Text style={styles.recordEmoji}>{record.emoji || '😐'}</Text>
                    <View style={styles.recordInfo}>
                      <Text style={styles.recordTitle} numberOfLines={1}>{record.title}</Text>
                    </View>
                  </View>
                  <View style={styles.recordActions}>
                    <TouchableOpacity 
                      style={styles.detailButton} 
                      onPress={() => onRecordSelect(record)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name={'open-outline'} size={24} color={COLORS.darkGray} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteButton} 
                      activeOpacity={0.7}
                      onPress={() => handleDeleteRecord(record)}
                    >
                      <Ionicons name={'trash-outline'} size={20} color={COLORS.red} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
                ))}
              </View>
              
              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <View style={styles.paginationContainer}>
                  <TouchableOpacity
                    style={[styles.pageButton, currentPage === 1 && styles.disabledButton]}
                    onPress={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name="chevron-back" 
                      size={20} 
                      color={currentPage === 1 ? COLORS.gray : COLORS.darkGray} 
                    />
                  </TouchableOpacity>
                  
                  <View style={styles.pageNumbers}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <TouchableOpacity
                        key={page}
                        style={[
                          styles.pageNumber,
                          currentPage === page && styles.activePageNumber
                        ]}
                        onPress={() => handlePageChange(page)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.pageNumberText,
                          currentPage === page && styles.activePageNumberText
                        ]}>
                          {page}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.pageButton, currentPage === totalPages && styles.disabledButton]}
                    onPress={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color={currentPage === totalPages ? COLORS.gray : COLORS.darkGray} 
                    />
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyView}>
              <Text style={styles.emptyText}>
                {format(selectedDate, 'M월 d일')}에 기록이 없습니다.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 25,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.large,
    borderTopRightRadius: SIZES.large,
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  scrollViewStyle: {
    paddingHorizontal: 10,
  },
  recordDisplayArea: {
    padding: SIZES.small,
  },
  recordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.medium,
    paddingHorizontal: SIZES.small,
  },
  recordsTitle: {
    ...FONTS.h3,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  recordsCount: {
    ...FONTS.body,
    color: COLORS.gray,
  },
  recordsList: {
    gap: SIZES.small,
  },
  recordItem: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.small,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    flex: 1,
  },
  recordEmoji: { 
    ...FONTS.h1 
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: { 
    ...FONTS.h3, 
    fontWeight: 'bold', 
    color: COLORS.darkGray,
  },
  recordActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailButton: {
    padding: 5,
  },
  deleteButton: {
    padding: 5,
  },
  emptyView: { 
    paddingTop: 30, 
    alignItems: 'center' 
  },
  emptyText: { 
    fontSize: 14, 
    color: COLORS.darkGray 
  },
  // 페이지네이션 스타일
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.medium,
    paddingVertical: SIZES.small,
    gap: 10,
  },
  pageButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
    opacity: 0.5,
  },
  pageNumbers: {
    flexDirection: 'row',
    gap: 5,
  },
  pageNumber: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: COLORS.lightGray,
    minWidth: 30,
    alignItems: 'center',
  },
  activePageNumber: {
    backgroundColor: COLORS.secondary,
  },
  pageNumberText: {
    ...FONTS.body,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  activePageNumberText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

export default SavedRecords;