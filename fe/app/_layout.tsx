import { NicknameProvider } from "@/context/NicknameContext";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    cafe24: require("@/assets/fonts/Cafe24.ttf"),
    homeEngFont: require("@/assets/fonts/homeEngFont.ttf"),
    homeFont: require("@/assets/fonts/homeFont.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <NicknameProvider>
      <Stack screenOptions={{ headerShown: false, animation: "none" }}>
      </Stack>
    </NicknameProvider>
  );
}
