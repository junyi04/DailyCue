import { COLORS, FONTS } from '@/constants/theme';
import { FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface YearNavigatorProps {
  year: number;
  onPrev: () => void;
  onNext: () => void;
  onYearChange: (newYear: number) => void;
}

const YearNavigator: React.FC<YearNavigatorProps> = ({ year, onPrev, onNext, onYearChange }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onYearChange(year - 1)} style={styles.arrowButton}>
        <Text style={styles.arrowText}><FontAwesome6 name='angle-left' size={15} /></Text>
      </TouchableOpacity>

      <Text style={styles.dateText}>{`${year}년`}</Text>
      
      <TouchableOpacity onPress={() => onYearChange(year + 1)} style={styles.arrowButton}>
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
    paddingVertical: 30,
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

export default YearNavigator;