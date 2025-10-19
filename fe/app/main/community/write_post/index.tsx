import ChooseTag from "@/components/main_screen/community/write_post/ChooseTag";
import WriteBox from "@/components/main_screen/community/write_post/WriteBox";
import { COLORS, SIZES } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
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

  // 게시글 저장 처리
  const saveHandler = async () => {
    if (!title || !content || !tag) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("posts")
        .insert([
          {
            user_id: user.id,
            tag: tag,
            title: title,
            content: content,
          },
        ]);

      if (error) throw error;

      router.push("/main/community");

    } catch (err: any) {
      console.error("게시글 저장 실패:", err.message);
    }
  };

  return (
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
