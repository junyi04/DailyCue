// 기록 저장 버튼 + 하얀 배경 뷰
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { format } from "date-fns";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";


interface ButtonProps {
  count: number;
}

const Button: React.FC<ButtonProps> = ({ count }) => {
  const currentDate = format(new Date(), 'yyyy.MM.dd');

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => router.push('/recording')}>
      
      <View style={{ flexDirection: 'column' }}>
        <Text style={styles.leftTopContainer}>{currentDate}</Text>
        <Text style={styles.leftBottomContainer}>오늘 기록을 완료해주세요!</Text>
      </View>
      <Text style={styles.rightContainer}>{count} 회</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 85,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    padding: SIZES.mega,
    marginHorizontal: 35,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  leftTopContainer: {
    ...FONTS.h4,
    paddingVertical: 5,
  },
  leftBottomContainer: {
    ...FONTS.h3,
    fontWeight: 'bold',
    paddingVertical: 5,
    color: COLORS.secondary,
  },
  rightContainer: {
    ...FONTS.h2,
    fontWeight: 'bold',
  },
  text: {
    ...FONTS.h2,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
})

export default Button;