import { COLORS, SIZES } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface FolderProps {
  year: number;
}

const Folders: React.FC<FolderProps> = ({ year }) => {

  const handleMonthPress = (month: number) => {
    router.push(`/main/summary/weekly?year=${year}&month=${month}`);
  };

  const renderMonthItem = ({ item }: { item: number }) => (
    <View style={{ alignItems: 'center' }}>
      <TouchableOpacity
        style={styles.monthFolder}
        onPress={() => handleMonthPress(item)}
      >
        <Ionicons name="folder-open-sharp" size={100} color={COLORS.secondary} />
      </TouchableOpacity>
      <Text style={styles.monthText}>{`${item + 1}월`}</Text>
    </View>
  );

  return (
    // 1 ~ 12월까지 쭉 보여줌
    <FlatList
      data={Array.from({ length: 12 }, (_, i) => i)}
      renderItem={renderMonthItem}
      keyExtractor={(item) => item.toString()}
      numColumns={2}
      contentContainerStyle={styles.monthList}
      showsVerticalScrollIndicator={false}
    />
  );
}


const styles = StyleSheet.create({
  monthFolder: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 25,
    marginTop: SIZES.large,
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.medium,
    borderRadius: SIZES.medium,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 0,
    marginTop: 5,
  },
  monthList: {
    paddingBottom: 100,
  },
});
export default Folders;