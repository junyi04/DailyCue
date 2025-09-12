import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { Record } from '@/types';
import { isSameDay } from 'date-fns';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from "react-native";
import MonthlyCalendar from "./calendar/MonthlyCalendar";

interface SavedRecordsProps {
  records: Record[];
}

export const SavedRecords: React.FC<SavedRecordsProps> = ({ records }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 1. 선택된 날짜에 해당하는 첫 번째 기록 찾기
  const recordForSelectedDay = records.find(record =>
    record.createdAt && isSameDay(new Date(record.createdAt), selectedDate)
  );

  return (
    // 2. 부모 컨테이너에 마진 적용
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* <CalendarStrip
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      /> */}
      <MonthlyCalendar
        onDateSelect={setSelectedDate}
      />

      {/* 3. 단일 기록 표시 영역 */}
      <View style={styles.recordDisplayArea}>
        {recordForSelectedDay ? (
          <View style={styles.recordItem}>
            <Text style={styles.recordContent}>{recordForSelectedDay.content}</Text>
            <Text style={styles.recordTitle}>
              {recordForSelectedDay.emoji ? `나의 감정: ${recordForSelectedDay.emoji}` : '기록'}
            </Text>
          </View>
        ) : (
          <View style={styles.emptyView}>
            <Text style={styles.emptyText}>선택한 날짜에 기록이 없습니다.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 25,
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.large,
    borderTopRightRadius: SIZES.large,
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recordDisplayArea: {
    padding: SIZES.small,
  },
  recordItem: {
    padding: SIZES.small,
  },
  recordTitle: {
    ...FONTS.h4,
    fontWeight: 'bold',
  },
  recordContent: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: SIZES.medium,
  },
  emptyView: {
    paddingTop: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
});

export default SavedRecords;