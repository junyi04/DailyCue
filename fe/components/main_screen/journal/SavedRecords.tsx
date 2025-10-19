import { emojiImages } from '@/constants/emojiMap';
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { Record } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { format, isSameDay } from 'date-fns';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MonthlyCalendar from "./calendar/MonthlyCalendar";


interface SavedRecordsProps {
  records: Record[];
  onRecordSelect: (record: Record) => void;
}

export const SavedRecords: React.FC<SavedRecordsProps> = ({ records, onRecordSelect }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  // 단일클릭: 상세보기 모달 열기
  const handleRecordPress = (record: Record) => {
    onRecordSelect(record);
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
          {/* <View style={styles.recordsHeader}>
            <Text style={styles.recordsTitle}>
              {format(selectedDate, 'M월 d일')} 기록
            </Text>
            <Text style={styles.recordsCount}>{recordsForSelectedDay.length}개</Text>
          </View> */}
          
          {recordsForSelectedDay.length > 0 ? (
            <View style={styles.recordsList}>
              {recordsForSelectedDay.map((record, index) => (
                <TouchableOpacity 
                  key={record.id || index} 
                  style={styles.recordItem} 
                  onPress={() => handleRecordPress(record)}
                  activeOpacity={0.8}
                >
                  <View style={styles.headerLeft}>
                    <Image 
                      source={emojiImages[record.emoji || 'soso']} 
                      style={styles.recordEmojiImage} 
                      resizeMode="contain"
                    />
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
                    <TouchableOpacity style={styles.deleteButton} activeOpacity={0.7}>
                      <Ionicons name={'trash-outline'} size={20} color={COLORS.red} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
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
    borderRadius: SIZES.large,
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
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    flex: 1,
  },
  recordEmojiImage: { 
    width: 35,
    height: 35,
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
    alignItems: 'center',
    paddingBottom: 30,
  },
  emptyText: { 
    fontSize: 14,
    color: COLORS.darkGray,
    paddingBottom: 30,
  },
});
export default SavedRecords;