import { COLORS, FONTS } from '@/constants/theme';
import { FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WeekNavigatorProps {
  year: number;
  month: number; // 0-11
  weekOfMonth: number;
  onPrev: () => void;
  onNext: () => void;
}

const WeekNavigator: React.FC<WeekNavigatorProps> = ({ year, month, weekOfMonth, onPrev, onNext }) => {
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