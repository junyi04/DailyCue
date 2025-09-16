import { COLORS, SIZES } from "@/constants/theme";
import { StyleSheet, TextInput, View } from "react-native";


interface WriteBoxProps {
  title: string;
  setTitle: (t: string) => void;
  content: string;
  setContent: (c: string) => void;
}

const WriteEmotion: React.FC<WriteBoxProps> = ({ title, setTitle, content, setContent }) => {
  return (
    <View style={styles.container}>
      <View style={styles.postContainer}>
        <View style={styles.titleContainer}>
          <TextInput 
            style={styles.title}
            value={title}
            onChangeText={setTitle}
            placeholder="제목을 입력해주세요."
            placeholderTextColor={COLORS.darkGray}
            
          />
        </View>
        <View style={styles.contentContainer}>
          <TextInput 
            style={styles.content}
            value={content}
            onChangeText={setContent}
            multiline
            placeholder="내용을 입력해주세요."
            placeholderTextColor={COLORS.darkGray}
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
    paddingHorizontal: SIZES.small,
    // marginHorizontal: SIZES.mega,
    borderRadius: SIZES.large,
    // backgroundColor: COLORS.white,
    // elevation: 2,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.05,
    // shadowRadius: 2,
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
    fontSize: 17,
    fontWeight: 'bold',
    padding: 10
  },
  contentContainer: {
    // KeyBoardAvoidingView에 의해 Content 부분이 글 작성 시 올라감
    flex: 1,
    marginTop: SIZES.small,
  },
  content: {
    flex: 1,
    fontSize: 15,
    padding: 10,
    textAlignVertical: 'top',
  },
})

export default WriteEmotion;