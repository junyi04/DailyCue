// WeekNavigator.tsx (수정)

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS } from '@/constants/theme';
import { FontAwesome6 } from '@expo/vector-icons';

interface WeekNavigatorProps {
  year: number;
  month: number; // 0-11
  weekOfMonth: number;
  onPrev: () => void;
  onNext: () => void;
}

const WeekNavigator: React.FC<WeekNavigatorProps> = ({ year, month, weekOfMonth, onPrev, onNext }) => {
  // 부모로부터 받은 월(month)은 0-11이므로, 표시할 때는 +1을 해줍니다.
  const monthText = `${month + 1}월`;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPrev} style={styles.arrowButton}>
        <Text style={styles.arrowText}><FontAwesome6 name='angle-left' size={15} /></Text>
      </TouchableOpacity>
      <Text style={styles.dateText}>{`${monthText} ${weekOfMonth}주차`}</Text>
      <TouchableOpacity onPress={onNext} style={styles.arrowButton}>
        <Text style={styles.arrowText}><FontAwesome6 name='angle-right' size={15} /></Text>
      </TouchableOpacity>
    </View>
  );
};

// ... styles (기존과 동일)
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  arrowButton: {
    paddingHorizontal: 20,
  },
  arrowText: {
    ...FONTS.h3,
    color: COLORS.darkGray,
  },
  dateText: {
    ...FONTS.h3,
    fontWeight: 'bold',
    color: COLORS.black,
    width: 120,
    textAlign: 'center',
  },
});

export default WeekNavigator;