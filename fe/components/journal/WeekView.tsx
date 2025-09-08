// CalenderStrip으로 넘어갈 컴포넌트 -> 일~토로 7일씩 보이도록 설정
import { COLORS } from "@/constants/theme";
import { addDays, format, isSameMonth } from "date-fns";
import { ko } from "date-fns/locale";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface WeekViewProps {
  weekStartDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  containerWidth: number;
  activeMonth: Date;
}

const WeekView: React.FC<WeekViewProps> = React.memo(
  ({ weekStartDate, selectedDate, onSelectDate, containerWidth, activeMonth }) => {
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStartDate, i));

    return (
      <View style={[styles.weekContainer, { width: containerWidth }]}>
        {weekDays.map((day) => {
          const dayString = format(day, "yyyy-MM-dd");
          const selectedDateString = format(selectedDate, "yyyy-MM-dd");
          const isSelected = dayString === selectedDateString;

          const isInActiveMonth = isSameMonth(day, activeMonth);

          if (!isInActiveMonth) {
            return <View style={styles.emptyDayContainer} key={dayString} />;
          }

          return (
            <TouchableOpacity
              key={dayString}
              style={styles.dayContainer}
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

const styles = StyleSheet.create({
  weekContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
  },
  emptyDayContainer: {
    flex: 1,
  },
  dayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  selectedText: {
    color: COLORS.black,
    fontWeight: 'bold',
  },
  dateCircle: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCircle: {
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  selectedDateText: {
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default WeekView;