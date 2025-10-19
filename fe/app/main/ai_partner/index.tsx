import MessagePart from "@/components/main_screen/ai_partner/MessagePart"
import { COLORS, FONTS, SIZES } from "@/constants/theme"
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaView } from "react-native-safe-area-context"

export default function AiPartnerScreen() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Daily 챗</Text>
        </View>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <MessagePart />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pageBackground,
  },
  header: {
    padding: SIZES.medium,
    alignItems: "center",
  },
  headerTitle: {
    ...FONTS.h3,
    fontWeight: "bold",
  },
})
