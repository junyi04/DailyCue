import { supabase } from "@/lib/supabase";
import { Alert } from "react-native";


export async function updateUserProfile(profileData: {
  nickname: string;
  gender: "male" | "female";
  ageRange: string;
}) {
  try {
    // 현재 로그인된 유저 정보 가져오기
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error("사용자 조회 실패:", userError);
      return { success: false, error: userError };
    }

    if (!user) {
      console.error("로그인되지 않은 상태입니다.");
      return { success: false, error: "User not logged in" };
    }

    // 업데이트할 데이터 구성
    const updates = {
      nickname: profileData.nickname,
      gender: profileData.gender,
      age_range: profileData.ageRange,
      updated_at: new Date(),
    };

    // Supabase의 profiles 테이블 업데이트
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      console.error("프로필 업데이트 실패:", error);
      Alert.alert("프로필 저장 실패", "잠시 후 다시 시도해주세요.");
      return { success: false, error };
    }

    console.log("프로필 업데이트 성공:", updates);
    return { success: true };
  } catch (err: any) {
    console.error("updateUserProfile 함수 에러:", err.message);
    Alert.alert("프로필 저장 실패", "서버와의 연결에 문제가 발생했습니다.");
    return { success: false, error: err };
  }
}
