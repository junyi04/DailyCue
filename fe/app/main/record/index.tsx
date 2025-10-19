import ChooseEmoji from "@/components/main_screen/journal/record/ChooseEmoji";
import WriteEmotion from "@/components/main_screen/journal/record/WriteEmotion";
import { COLORS, SIZES } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { recordApiService, RecordData } from "@/services/recordApiService";
import { Record } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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
  const params = useLocalSearchParams();

  // URL 파라미터에서 선택된 날짜 가져오기 (기본값: 오늘)
  const selectedDate = params.date ? new Date(params.date as string) : new Date();

  const [emoji, setEmoji] = useState<Record["emoji"] | null>("love");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // 현재 로그인된 사용자 정보 가져오기
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) {
          console.error("Error getting user:", error.message);
          return;
        }
        if (user) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error("Error in getCurrentUser:", error);
      }
    };

    getCurrentUser();
  }, []);

  const saveHandler = async () => {
    if (!title || !content || !emoji) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 백엔드 API 호출
      const recordData: RecordData = {
        user_id: userId, // 실제 사용자 ID 사용
        date: format(selectedDate, "yyyy-MM-dd"),
        fatigue: 5, // 기본값 (나중에 UI에서 입력받도록 수정 가능)
        notes: content,
        title: title,
        emotion: emoji,
      };

      console.log("📤 전송할 데이터:", recordData);

      const response = await recordApiService.saveRecord(recordData);
      console.log("📥 응답 받음:", response);

      if (response.success) {
        try {
          await AsyncStorage.setItem("@needsBackendSync", "true");
          console.log("✅ 백엔드 동기화 플래그 설정 완료");
        } catch (storageError) {
          console.error("❌ 플래그 설정 실패:", storageError);
        }

        alert("기록이 저장되었습니다!");
        router.push("/main");
      } else {
        throw new Error("서버에서 오류가 발생했습니다.");
      }
    } catch (err: any) {
      console.error("기록 저장 실패:", err);
      setError(err.message || "기록 저장에 실패했습니다.");
      alert(`기록 저장에 실패했습니다: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
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
              paddingBottom: 100,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              {/* 뒤로가기 버튼 */}
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => router.push("/main")}
                >
                  <Ionicons name="chevron-back" size={25} />
                </TouchableOpacity>
              </View>

              {/* 선택된 날짜 */}
              <View style={styles.dateHeader}>
                <Text style={styles.dateText}>
                  {format(selectedDate, "yyyy년 M월 d일")}
                </Text>
              </View>

              {/* 에러 메시지 */}
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* 감정 이모티콘 선택 */}
              <ChooseEmoji selectedEmoji={emoji} onSelectEmoji={setEmoji} />

              {/* 기록 작성 영역 (이 아래로 이동됨) */}
              <WriteEmotion
                title={title}
                setTitle={setTitle}
                content={content}
                setContent={setContent}
              />
            </View>

            {/* 저장 버튼 (오른쪽 하단 고정) */}
            <View style={styles.saveButtonWrapper}>
              <TouchableOpacity
                style={[styles.saveButton, isLoading && styles.disabledButton]}
                onPress={saveHandler}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Ionicons name="save-outline" size={22} color="white" />
                <Text style={styles.saveText}>
                  {isLoading ? "저장 중..." : "저장"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column", // 세로 정렬
    justifyContent: "flex-start",
    paddingHorizontal: SIZES.large,
    marginTop: SIZES.large,
    gap: 24, // 컴포넌트 간 간격
  },
  header: {
  },
  closeButton: {
    position: "absolute",
    top: 40,
    left: SIZES.large,
    zIndex: 10,
  },
  dateHeader: {
    alignItems: "center",
    marginTop: SIZES.mega,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.pageBackground,
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: SIZES.small,
    marginHorizontal: SIZES.large,
    borderRadius: SIZES.small,
    marginBottom: SIZES.small,
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 14,
    textAlign: "center",
  },
  saveButtonWrapper: {
    position: "absolute",
    bottom: 20,
    right: 30,
    zIndex: 50,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  saveText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
