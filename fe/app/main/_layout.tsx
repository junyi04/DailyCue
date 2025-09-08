import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 0,
          elevation: 0,
          height: 90,
          paddingBottom: 30,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="journal"
        options={{
          title: "홈",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size - 3} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "커뮤니티",
          tabBarIcon: ({ color, size }) => (
            <Feather name="users" size={size - 3} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-partner"
        options={{
          title: "AI 챗봇",
          tabBarIcon: ({ color, size }) => (
            <Feather name="message-circle" size={size - 3} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: "리포트",
          tabBarIcon: ({ color, size }) => (
            <Feather name="file" size={size - 3} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          title: "설정",
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size - 3} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
