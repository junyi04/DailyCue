import { supabase } from '@/lib/supabase';
import { router, Stack } from 'expo-router';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    // 앱 첫 실행 시 세션 확인
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) router.replace('/main');
      else router.replace('/auth/login');
    };

    checkSession();

    // 세션 변경 감지 리스너 등록
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace('/main');
      else router.replace('/auth/login');
    });

    // cleanup: 리스너 해제
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="main" />
    </Stack>
  );
}
