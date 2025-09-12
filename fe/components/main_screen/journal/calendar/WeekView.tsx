// WeekView.tsx (수정)

import { COLORS } from "@/constants/theme";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import React from "react";
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
              onPress={() => onSelectDate(day)}
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
    paddingVertical: 5,
  },
  dayContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 4,
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
    fontSize: 15,
    color: COLORS.darkGray,
  },
  selectedDateText: {
    fontWeight: 'bold',
    color: COLORS.white,
  },
});


export default WeekView;