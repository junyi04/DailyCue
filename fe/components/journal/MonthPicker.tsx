// 월 선택
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { StyleSheet, View } from "react-native";

interface MonthPickerProps {
  selectedMonth: number; // 0~11
  onMonthChange: (monthIndex: number) => void;
}

const MonthPicker: React.FC<MonthPickerProps> = ({ selectedMonth, onMonthChange }) => {
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={selectedMonth}
        onValueChange={onMonthChange}
        style={styles.picker}
      >
        {months.map((m) => (
          <Picker.Item
            key={m}
            label={`${m + 1}월`}
            value={m}
            style={styles.pickerItem}
          />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    width: 100,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    marginHorizontal: SIZES.small,
    marginTop: 7,
    transform: [{ scale: 1 }],
  },
  picker: {
    ...FONTS.h3,
    color: COLORS.black,
    fontWeight: 'bold',
  },
  pickerItem: {
    ...FONTS.h3,
    color: COLORS.black,
    fontWeight: 'bold',
  }
});

export default MonthPicker;