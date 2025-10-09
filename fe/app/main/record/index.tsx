import ChooseEmoji from "@/components/main_screen/journal/record/ChooseEmoji";
import WriteEmotion from "@/components/main_screen/journal/record/WriteEmotion";
import { COLORS, SIZES } from "@/constants/theme";
import { useRecords } from "@/hooks/useRecords";
import { Record } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function RecordScreen() {
  const { addRecord } = useRecords();

  const [emoji, setEmoji] = useState<Record["emoji"] | null>("😆");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const saveHandler = () => {
    if (!title || !content || !emoji) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    const newRecord: Record = {
      id: Date.now().toString(),
      emoji,
      title,
      content,
      createdAt: new Date().toISOString(),
    };

    addRecord(newRecord);
    router.push("/main");
  };

  return (
    <LinearGradient
      colors={[COLORS.secondary, COLORS.pageBackground]}
      locations={[0.3, 0.7]}
      style={StyleSheet.absoluteFill}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 20,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={{ paddingTop: 80 }}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => router.push("/main")}
              >
                <Ionicons name="chevron-back" size={25} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={saveHandler}>
                <Text style={styles.text}>저장</Text>
              </TouchableOpacity>
            </View>

            {/* 감정 이모티콘 */}
            <ChooseEmoji selectedEmoji={emoji} onSelectEmoji={setEmoji} />

            {/* 기록 작성 */}
            <WriteEmotion
              title={title}
              setTitle={setTitle}
              content={content}
              setContent={setContent}
            />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    position: "absolute",
    top: 40,
    left: SIZES.large,
    zIndex: 10,
  },
  saveButton: {
    position: "absolute",
    top: 35,
    right: SIZES.large,
    zIndex: 10,
  },
  text: {
    fontWeight: "bold",
    fontSize: 15,
  },
});
