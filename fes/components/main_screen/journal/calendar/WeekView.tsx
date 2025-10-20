// WeekView.tsx (수정)

import { COLORS, FONTS } from "@/constants/theme";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface WeekViewProps {
  days: (Date | null)[]; // 7개의 날짜 또는 null을 받음
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  containerWidth: number;
}

const WeekView: React.FC<WeekViewProps> = React.memo(
  ({ days, selectedDate, onSelectDate, containerWidth }) => {
    const dayWidth = containerWidth / 7;
    const [lastTap, setLastTap] = useState<number | null>(null);

    const handleDatePress = (day: Date) => {
      const now = Date.now();
      const DOUBLE_PRESS_DELAY = 300; // 더블클릭 감지 시간

      if (lastTap && (now - lastTap) < DOUBLE_PRESS_DELAY) {
        // 더블클릭: 기록 작성 화면으로 이동
        const recordDate = format(day, 'yyyy-MM-dd');
        router.push(`/main/record?date=${recordDate}`);
        setLastTap(null); // 더블클릭 후 초기화
      } else {
        // 단일클릭: 날짜 선택만 (기록 목록 보기)
        onSelectDate(day);
        setLastTap(now);
        // 더블클릭이 아닌 경우에만 초기화
        setTimeout(() => {
          if (lastTap === now) {
            setLastTap(null);
          }
        }, DOUBLE_PRESS_DELAY);
      }
    };

    return (
      <View style={[styles.weekContainer, { width: containerWidth }]}>
        {days.map((day, index) => {
          // day가 null이면 빈 칸을 렌더링
          if (!day) {
            return <View style={{ width: dayWidth }} key={`empty-${index}`} />;
          }

          const dayString = format(day, "yyyy-MM-dd");
          const selectedDateString = format(selectedDate, "yyyy-MM-dd");
          const isSelected = dayString === selectedDateString;

          return (
            <TouchableOpacity
              key={dayString}
              style={[styles.dayContainer, { width: dayWidth }]}
              onPress={() => handleDatePress(day)}
            >
              <Text style={[styles.dayText, isSelected && styles.selectedText]}>
                {format(day, "E", { locale: ko }).charAt(0)}
              </Text>
              <View style={[styles.dateCircle, isSelected && styles.selectedCircle]}>
                <Text style={[styles.dateText, isSelected && styles.selectedDateText]}>
                  {format(day, "d")}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }
);

// ... styles (기존과 동일)
const styles = StyleSheet.create({
  weekContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  dayContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 13,
    color: COLORS.darkGray,
    marginBottom: 5,
  },
  selectedText: {
    color: COLORS.black,
    fontWeight: 'bold',
  },
  dateCircle: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCircle: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 15,
  },
  dateText: {
    ...FONTS.h3,
    color: COLORS.darkGray,
  },
  selectedDateText: {
    fontWeight: 'bold',
    color: COLORS.white,
  },
});


export default WeekView;