import ChooseEmoji from "@/components/main_screen/journal/record/ChooseEmoji";
import WriteEmotion from "@/components/main_screen/journal/record/WriteEmotion";
import { COLORS, SIZES } from "@/constants/theme";
import { Record } from "@/types";
import { recordApiService, RecordData } from "@/services/recordApiService";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  const [emoji, setEmoji] = useState<Record["emoji"] | null>("😆");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // 현재 로그인된 사용자 정보 가져오기
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error getting user:', error.message);
          return;
        }
        if (user) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Error in getCurrentUser:', error);
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
        date: format(selectedDate, 'yyyy-MM-dd'),
        fatigue: 5, // 기본값 (나중에 UI에서 입력받도록 수정 가능)
        notes: content,
        title: title,
      };

      console.log('📤 전송할 데이터:', recordData);
      
      const response = await recordApiService.saveRecord(recordData);
      console.log('📥 응답 받음:', response);
      
      if (response.success) {
        // 백엔드 동기화 필요 플래그 설정 (홈 화면에서 백엔드에서 다시 가져오도록)
        try {
          await AsyncStorage.setItem('@needsBackendSync', 'true');
          console.log('✅ 백엔드 동기화 플래그 설정 완료');
        } catch (storageError) {
          console.error('❌ 플래그 설정 실패:', storageError);
        }
        
        alert("기록이 저장되었습니다!");
        router.push("/main");
      } else {
        throw new Error("서버에서 오류가 발생했습니다.");
      }
    } catch (err: any) {
      console.error('기록 저장 실패:', err);
      console.error('에러 상세:', err);
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

              <TouchableOpacity 
                style={[styles.saveButton, isLoading && styles.disabledButton]} 
                onPress={saveHandler}
                disabled={isLoading}
              >
                <Text style={styles.text}>
                  {isLoading ? "저장 중..." : "저장"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 선택된 날짜 표시 */}
            <View style={styles.dateHeader}>
              <Text style={styles.dateText}>
                {format(selectedDate, 'yyyy년 M월 d일')}
              </Text>
            </View>

            {/* 에러 메시지 표시 */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

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
  dateHeader: {
    alignItems: "center",
    marginVertical: SIZES.medium,
    paddingHorizontal: SIZES.large,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.darkGray,
  },
  disabledButton: {
    opacity: 0.5,
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
});
