import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

const ChooseTag = () => {
  return (
    <View style={styles.container}>
      <Text style={{ ...FONTS.h3, fontWeight: 'bold' }}>게시판 선택</Text>
      <View style={styles.tagContainer}>
        <TouchableOpacity style={styles.tag}>
          <Text style={styles.tagText}>공유해요</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tag}>
          <Text style={styles.tagText}>공감원해요</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tag}>
          <Text style={styles.tagText}>함께해요</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tag}>
          <Text style={styles.tagText}>고수찾아요</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: SIZES.large,
  },
  tagContainer: {
    flexDirection: 'row',
    paddingVertical: SIZES.medium,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal: SIZES.small,
    paddingVertical: SIZES.small,
    borderRadius: SIZES.large,
    borderWidth: 1,
    borderColor: COLORS.gray,
    marginRight: 5,
  },
  tagText: {
    ...FONTS.h4,
    color: COLORS.darkGray,
  },
})

export default ChooseTag;