import ChooseEmoji from "@/components/main_screen/journal/record/ChooseEmoji";
import WriteEmotion from "@/components/main_screen/journal/record/WriteEmotion";
import { COLORS, SIZES } from "@/constants/theme";
import { useRecords } from "@/hooks/useRecords";
import { Record } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";


export default function RecordScreen() {
  const { addRecord } = useRecords();

  const [emoji, setEmoji] = useState<Record['emoji'] | null>('😆');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const saveHandler = () => {
    if (!title || ! content || !emoji) {
      alert("모든 항목을 입력해주세요.");
      return;
    };

    const newRecord: Record = {
      id: Date.now().toString(),
      emoji,
      title,
      content,
      createdAt: new Date().toISOString(),
    }

    addRecord(newRecord);
    router.push({ pathname: '/main' });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={[COLORS.secondary, COLORS.pageBackground]} 
        locations={[0.3, 0.7]}
        style={StyleSheet.absoluteFill}
      />
      {/* 빈 화면 터치하면 마우스 커서 없애고 읽기모드로 전환 */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1, paddingTop: 10 }}>
          
          {/* Header */}
          <View style={{ paddingTop: 80 }}>
            {/* 뒤로 가기 */}
            <TouchableOpacity style={styles.closeButton} onPress={() => router.push('/main')}>
              <Ionicons name="chevron-back" size={25} /> 
            </TouchableOpacity>
            
            {/* 저장하기 */}
            <TouchableOpacity style={styles.saveButton} onPress={saveHandler}>
              <Text style={styles.text}>저장</Text>
            </TouchableOpacity>
          </View>

          {/* 감정 이모티콘 선택 */}
          <View style={{ flex: 1 }}>
            <ChooseEmoji selectedEmoji={emoji} onSelectEmoji={setEmoji} />
          </View>

          {/* 기록 작성 */}
          <View style={{ flex: 1, paddingTop: 30, }}>
            <WriteEmotion title={title} setTitle={setTitle} content={content} setContent={setContent} />
          </View>

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
})