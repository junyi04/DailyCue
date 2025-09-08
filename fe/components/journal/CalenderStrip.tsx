// SavedRecords에 보낼 달력 컴포넌트

import {
  addWeeks,
  endOfWeek,
  isSameDay,
  setDate,
  setMonth,
  startOfWeek
} from "date-fns";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, LayoutChangeEvent, StyleSheet, View } from "react-native";
import MonthPicker from "./MonthPicker";
import WeekView from "./WeekView";


interface CalendarStripProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

interface WeekDataItem {
  id: string;
  weekStartDate: Date;
  activeMonthContext: Date;
}

interface ViewableItemsChangedInfo {
  viewableItems: { item: WeekDataItem; key: string; index: number | null; isViewable: boolean }[];
}

const CalendarStrip: React.FC<CalendarStripProps> = ({ selectedDate, onDateChange }) => {
  const flatListRef = useRef<FlatList>(null);
  const [currentViewDate, setCurrentViewDate] = useState(selectedDate);
  const [containerWidth, setContainerWidth] = useState(0);

  // --- 1. 데이터 생성: "주 중복" 로직 ---
  const { weeksList, initialScrollIndex } = useMemo(() => {
    const list: WeekDataItem[] = [];
    const today = new Date();
    const rangeInWeeks = 100; // 과거/미래 범위
    let currentWeekStartDate = startOfWeek(addWeeks(today, -rangeInWeeks), { weekStartsOn: 0 });
    let todayIndex = -1;

    for (let i = 0; i < rangeInWeeks * 2 + 1; i++) {
      const weekEndDate = endOfWeek(currentWeekStartDate, { weekStartsOn: 0 });
      const startMonthContext = currentWeekStartDate;

      // 1. 주의 시작일 기준으로 주 추가 (예: 1월 컨텍스트)
      list.push({
        id: `${currentWeekStartDate.toISOString()}-start`,
        weekStartDate: currentWeekStartDate,
        activeMonthContext: startMonthContext,
      });

      if (todayIndex === -1 && startOfWeek(today, { weekStartsOn: 0 }).getTime() === currentWeekStartDate.getTime()) {
        todayIndex = list.length - 1; // 현재 날짜가 포함된 주의 인덱스 (start 컨텍스트 기준)
      }

      // 2. 월을 가로지르는 경우 (시작일 월 != 종료일 월), 종료일 기준으로 한 번 더 추가
      if (currentWeekStartDate.getMonth() !== weekEndDate.getMonth()) {
        const endMonthContext = weekEndDate;
        list.push({
          id: `${currentWeekStartDate.toISOString()}-end`,
          weekStartDate: currentWeekStartDate,
          activeMonthContext: endMonthContext, // 컨텍스트: 종료일 기준 월
        });
      }
      currentWeekStartDate = addWeeks(currentWeekStartDate, 1);
    }
    return { weeksList: list, initialScrollIndex: todayIndex > -1 ? todayIndex : 0 };
  }, []);

  // --- 2. 동기화 로직 ---
  const handleDateSelect = (date: Date) => {
    onDateChange(date);
    setCurrentViewDate(date);
  };

  const monthChangeHandler = useCallback(
    (monthIndex: number) => {
      const newDate = setDate(setMonth(new Date(), monthIndex), 1);
      onDateChange(newDate);
      setCurrentViewDate(newDate);

      // 스크롤 로직: 선택한 월(newDate)의 컨텍스트를 가진 항목으로 이동
      const targetWeekStartDate = startOfWeek(newDate, { weekStartsOn: 0 });
      const targetIndex = weeksList.findIndex(item =>
        isSameDay(item.weekStartDate, targetWeekStartDate) &&
        item.activeMonthContext.getMonth() === monthIndex
      );

      if (targetIndex !== -1) {
        flatListRef.current?.scrollToIndex({ index: targetIndex, animated: true });
      }
    },
    [weeksList, onDateChange]
  );

  const onViewableItemsChanged = useCallback(({ viewableItems }: ViewableItemsChangedInfo) => {
    if (viewableItems.length > 0) {
      // 스크롤 시, 보이는 항목의 activeMonthContext를 MonthPicker에 반영
      setCurrentViewDate(viewableItems[0].item.activeMonthContext);
    }
  }, []);

  const onContainerLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  if (containerWidth === 0) {
    return <View style={styles.container} onLayout={onContainerLayout} />;
  }

  return (
    <View style={styles.container} onLayout={onContainerLayout}>
      <MonthPicker
        selectedMonth={currentViewDate.getMonth()}
        onMonthChange={monthChangeHandler}
      />
      <FlatList
        ref={flatListRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={weeksList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <WeekView
            weekStartDate={item.weekStartDate}
            selectedDate={selectedDate}
            onSelectDate={handleDateSelect} 
            containerWidth={containerWidth}
            activeMonth={item.activeMonthContext}
          />
        )}
        initialScrollIndex={initialScrollIndex}
        getItemLayout={(_, index) => ({
          length: containerWidth,
          offset: containerWidth * index,
          index,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

export default CalendarStrip;