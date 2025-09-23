import ChooseTag from "@/components/main_screen/community/write_post/ChooseTag";
import WriteBox from "@/components/main_screen/community/write_post/WriteBox";
import { COLORS, SIZES } from "@/constants/theme";
import { Post } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";


export default function WritePostScreen() {
  const router = useRouter();
  const [tag, setTag] = useState<Post['tag'] | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const saveHandler = () => {
    if (!title || ! content || !tag) {
      alert("모든 항목을 입력해주세요.");
      return;
    };

    const newPost: Post = {
      id: Date.now().toString(),
      tag,
      title,
      content,
      author: "junyi", // 로그인 정보에서 받아오기
      like: 0,
      comment: 0,
      views: 0,
    };

    router.push({
      pathname: '/main/community',
      params: { post: JSON.stringify(newPost) },
    });

    // 백엔드 연결 시 DB에 저장. 성공 응답 받고 화면 전환.
    // try {
    //   const res = await fetch("http://localhost:8080/posts", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(newPost),
    //   });
    //   if (res.ok) {
    //     router.push("/main/community");
    //   } else {
    //     alert("저장 실패");
    //   }
    // } catch (e) {
    //   console.error(e);
    // }
  }
  
  return (
    // 밀리는 부분은 flex를 적용시킨 부분
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* 빈 화면 터치하면 마우스 커서 없애고 읽기 모드로 전환 */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1, paddingTop: 10 }}>

          {/* Header */}
          <View style={{ paddingTop: 80 }}>
            {/* 뒤로 가기 */}
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={25} /> 
            </TouchableOpacity>
            
            {/* 저장하기 */}
            <TouchableOpacity style={styles.saveButton} onPress={saveHandler}>
              <Text style={styles.text}>저장</Text>
            </TouchableOpacity>
          </View>

          {/* 게시판 선택 */}
          <View>
            <ChooseTag selectedTag={tag} onSelectTag={setTag} />
          </View>

          {/* 글 작성 */}
          <View style={{ flex: 1 }}>
            <WriteBox title={title} setTitle={setTitle} content={content} setContent={setContent} />
          </View>

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pageBackground,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: SIZES.large,
    zIndex: 10,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  saveButton: {
    position: 'absolute',
    top: 40,
    right: SIZES.large,
    zIndex: 10,
  },
});
