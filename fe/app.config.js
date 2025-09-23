export default {
  expo: {
    name: "DailyCue",
    slug: "dailycue",
    owner: "junyi04",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "dailycuetest",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      package: "com.junyi04.dailycue",
      edgeToEdgeEnabled: true
    },
    web: {
      bundler: "metro",
      output: "static"
    },
    icon: "./assets/icon.png",
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,  // Supabase URL
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,  // Supabase 익명 키
      eas: {
        projectId: "f5175e35-e195-40cd-850d-fb8126ca7d70"  // EAS 프로젝트 ID
      }
    }
  }
};
