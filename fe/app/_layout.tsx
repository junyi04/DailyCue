import { supabase } from "@/lib/supabase";
import { Stack, router } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) router.replace("/main");
        else router.replace("/auth/login");
      }
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false, animation: "none" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="main" />
    </Stack>
  );
}