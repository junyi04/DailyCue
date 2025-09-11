import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { View, Text, StyleSheet, TextInput } from "react-native";

const WriteBox = () => {
  return (
    <View style={styles.container}>
      <Text style={{ ...FONTS.h3, fontWeight: 'bold' }}>글 작성</Text>
      <View style={styles.postContainer}>
        <View style={styles.titleContainer}>
          <TextInput 
            style={styles.title}
            placeholder="제목을 입력해주세요. (최대 20자)"
            placeholderTextColor={COLORS.gray}
          />
        </View>
        <View style={styles.contentContainer}>
          <TextInput 
            style={styles.content}
            placeholder="내용을 입력해주세요."
            placeholderTextColor={COLORS.gray}
          />
        </View>
      </View>
    </View>
  );
}
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: SIZES.large,
  },
  postContainer: {
    flex: 1,
    paddingVertical: SIZES.medium,
  },
  titleContainer: {
    borderBottomWidth: 0.5,
    borderColor: COLORS.gray,
    paddingVertical: 5,
  },
  title: {
    fontSize: 15,
    padding: 10
  },
  contentContainer: {
    flex: 1,
    paddingVertical: 5,
  },
  content: {
    fontSize: 15,
    padding: 10
  },
})

export default WriteBox;