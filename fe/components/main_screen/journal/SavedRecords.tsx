import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { Record } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { isSameDay } from 'date-fns';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MonthlyCalendar from "./calendar/MonthlyCalendar";

interface SavedRecordsProps {
  records: Record[];
  onRecordSelect: (record: Record) => void;
}

export const SavedRecords: React.FC<SavedRecordsProps> = ({ records, onRecordSelect }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const recordForSelectedDay = records.find(record =>
    record.createdAt && isSameDay(new Date(record.createdAt), selectedDate)
  );

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
          {recordForSelectedDay ? (
            <TouchableOpacity style={styles.recordItem} onPress={() => onRecordSelect(recordForSelectedDay)} activeOpacity={0.8}>
              <View style={styles.headerLeft}>
                <Text style={styles.recordEmoji}>{recordForSelectedDay.emoji || '기록'}</Text>
                <Text style={styles.recordTitle} numberOfLines={1}>{recordForSelectedDay.title}</Text>
              </View>
              <Ionicons name={'open-outline'} size={24} color={COLORS.darkGray} />
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyView}>
              <Text style={styles.emptyText}>선택한 날짜에 기록이 없습니다.</Text>
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
  recordEmoji: { 
    ...FONTS.h1 
  },
  recordTitle: { 
    ...FONTS.h3, 
    fontWeight: 'bold', 
    color: COLORS.darkGray, 
    flex: 1 
  },
  emptyView: { 
    paddingTop: 30, 
    alignItems: 'center' 
  },
  emptyText: { 
    fontSize: 14, 
    color: COLORS.darkGray 
  },
});

export default SavedRecords;