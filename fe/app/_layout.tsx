import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="main" />
      <Stack.Screen name="recording" options={{ presentation: "modal" }} />
      <Stack.Screen name="postCreation" options={{ presentation: "modal"}} />
    </Stack>
  );
}