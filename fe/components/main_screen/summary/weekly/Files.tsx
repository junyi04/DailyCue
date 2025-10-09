import { COLORS, SIZES } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";


function getWeeksInMonth(year: number, month: number): number {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const usedDays = firstDay.getDay() + lastDay.getDate();
  return Math.ceil(usedDays / 7);
}

const Files: React.FC = () => {
  const { year, month } = useLocalSearchParams<{ year: string; month: string }>();

  const weeks = getWeeksInMonth(Number(year), Number(month));
  const data = ["all", ...Array.from({ length: weeks }, (_, i) => i + 1)];

  const handlePress = (week: number | string) => {
    if (week === "all") {
      router.push(`/main/summary/weekly/detail?year=${year}&month=${month}&week=all`);
    } else {
      router.push(`/main/summary/weekly/detail?year=${year}&month=${month}&week=${week}`);
    }
  };

  const renderItem = ({ item }: { item: number | string }) => (
    <View style={{ alignItems: "center" }}>
      {item === "all"
        ? (
          <>
            <TouchableOpacity
              style={[styles.weekFolder, { backgroundColor: COLORS.secondary }]}
              onPress={() => handlePress(item)}
              >
              <Ionicons name="document-text-outline" size={50} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.weekText}>전체</Text>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.weekFolder}
              onPress={() => handlePress(item)}
              >
              <Ionicons name="document-text-outline" size={50} color={"#444"} />
            </TouchableOpacity>
            <Text style={styles.weekText}>{item}주차</Text>
          </>
        )
      }
    </View>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.toString()}
      numColumns={2}
      contentContainerStyle={styles.weekList}
      columnWrapperStyle={styles.weekListColumn}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  weekFolder: {
    marginTop: SIZES.large,
    backgroundColor: COLORS.white,
    paddingHorizontal: 55,
    paddingVertical: 30,
    borderRadius: SIZES.medium,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  weekText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 0,
    marginTop: 10,
    marginHorizontal: 5,
  },
  weekList: {
    paddingBottom: 100,
    alignItems: 'center',
  },
  weekListColumn: {
    gap: 20,
  },
});

export default Files;
