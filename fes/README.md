# 🧩 Kakao Login + Supabase Auth Integration

## 📘 개요

이 문서는 **React Native(Expo) + Supabase** 기반의  
**카카오 로그인 인증 흐름 및 백엔드 연동 구조**를 설명합니다.  

현재 로그인/회원가입/세션 관리 로직은 **프론트엔드와 Supabase Auth가 직접 처리**하고 있으며,  
이후의 유저 데이터 관리(프로필, 게시글, 커뮤니티 기능 등)는 **백엔드에서 담당**해야 합니다.

---

## ⚙️ 인증 흐름 요약

### 1️⃣ 사용자 로그인 요청 (React Native 앱)

- 프론트엔드에서 [`@react-native-seoul/kakao-login`](https://github.com/react-native-seoul/react-native-kakao-login) SDK를 사용하여  
  카카오 OAuth 로그인 실행.
- 카카오 SDK가 `accessToken`과 `idToken`을 발급합니다.

```tsx
const token = await login();
console.log("Access Token:", token.accessToken);
console.log("ID Token:", token.idToken);


1. AI 추천 버튼
위치: fe/components/main_screen/community/HotIssue.tsx
라인: 61-65번째 줄
내용: "님께 추천드리는 큐픽 🔥" 텍스트 옆에 파란색 "AI 추천" 버튼
2. AI 추천 페이지 컴포넌트
위치: fe/components/main_screen/community/HotIssue.tsx
라인: 197-204번째 줄 (AIRecommendPage 컴포넌트)
라인: 206-217번째 줄 (aiRecommendStyles 스타일)
내용: "AI 추천 페이지"라는 텍스트가 중앙에 있는 흰색 페이지
3. 라우팅 파일
위치: fe/app/main/community/ai_recommend.tsx
내용: HotIssue에서 만든 AIRecommendPage 컴포넌트를 사용하는 라우팅 파일