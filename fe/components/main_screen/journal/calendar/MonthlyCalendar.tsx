// MonthlyCalendar.tsx (이전 WeeklyCalendar.tsx를 이 파일로 교체)

import {
  addMonths,
  startOfMonth,
  endOfMonth,
  getDate,
  getDay,
  getYear,
  getMonth,
  isSameDay,
  setDate,
} from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';

import WeekNavigator from './WeekNavigator';
import WeekView from './WeekView';
import { SIZES } from '@/constants/theme';

// 달력의 한 '줄'에 대한 정보를 담는 타입
interface CalendarRow {
  id: string;
  year: number;
  month: number; // 0-11
  weekOfMonth: number;
  days: (Date | null)[]; // 7개의 날짜 또는 null(빈 칸)을 담는 배열
}

interface CalendarProps {
  onDateSelect: (date: Date) => void;
}

const MonthlyCalendar: React.FC<CalendarProps> = ({ onDateSelect }) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentIndex, setCurrentIndex] = useState(0);

  // --- 달력 데이터 생성 로직 ---
  const { calendarRows, initialIndex } = useMemo(() => {
    const rows: CalendarRow[] = [];
    const today = new Date();
    const rangeInMonths = 24;
    const firstMonth = startOfMonth(addMonths(today, -rangeInMonths));
    let todayIndex = -1;

    for (let i = 0; i < rangeInMonths * 2; i++) {
      const currentMonth = addMonths(firstMonth, i);
      const year = getYear(currentMonth);
      const month = getMonth(currentMonth);
      
      const firstDayOfMonth = startOfMonth(currentMonth);
      const lastDayOfMonth = endOfMonth(currentMonth);
      const firstDayWeekday = getDay(firstDayOfMonth);
      const lastDate = getDate(lastDayOfMonth);

      // 해당 월의 날짜들을 배열로 만듦 (앞에 빈 칸 포함)
      const monthDays: (Date | null)[] = [];
      for (let j = 0; j < firstDayWeekday; j++) {
        monthDays.push(null); // 1일 시작 전까지 빈 칸 추가
      }
      for (let j = 1; j <= lastDate; j++) {
        monthDays.push(setDate(currentMonth, j));
      }

      // 월 배열을 7일 단위로 잘라서 '달력의 줄'을 만듦
      let weekOfMonth = 1;
      while (monthDays.length > 0) {
        const weekDays = monthDays.splice(0, 7);
        // 7칸을 채우기 위해 뒤에 빈 칸 추가
        while (weekDays.length < 7) {
          weekDays.push(null);
        }

        rows.push({
          id: `${year}-${month}-${weekOfMonth}`,
          year,
          month,
          weekOfMonth,
          days: weekDays,
        });

        // 오늘이 포함된 주의 인덱스 찾기
        if (todayIndex === -1 && weekDays.some(day => day && isSameDay(day, today))) {
          todayIndex = rows.length - 1;
        }
        weekOfMonth++;
      }
    }
    
    const finalInitialIndex = todayIndex > -1 ? todayIndex : 0;
    return { calendarRows: rows, initialIndex: finalInitialIndex };
  }, []);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const currentRow = calendarRows[currentIndex];

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const handlePrevWeek = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNextWeek = () => {
    if (currentIndex < calendarRows.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onDateSelect(date);
  };
  
  useEffect(() => {
    onDateSelect(new Date());
  }, [onDateSelect]);
  
  if (!currentRow) {
    return <View style={styles.container} onLayout={handleLayout} />;
  }

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <WeekNavigator
        year={currentRow.year}
        month={currentRow.month}
        weekOfMonth={currentRow.weekOfMonth}
        onPrev={handlePrevWeek}
        onNext={handleNextWeek}
      />
      
      {containerWidth > 0 && (
        <WeekView
          days={currentRow.days}
          selectedDate={selectedDate}
          onSelectDate={handleDateSelect}
          containerWidth={containerWidth}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: SIZES.small,
  },
});

export default MonthlyCalendar;