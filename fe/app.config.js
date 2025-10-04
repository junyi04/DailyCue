export default {
  expo: {
    name: "DailyCue",
    slug: "dailycue",
    owner: "junyi04",
    scheme: "dailycue",
    platforms: ["ios", "android"],
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.junyi04.dailycue",
    },
    android: {
      package: "com.junyi04.dailycue",
      edgeToEdgeEnabled: true,
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "dailycue",
              host: "login",
              pathPrefix: "/callback"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    web: {
      bundler: "metro",
      output: "static",
    },
    icon: "./assets/icon.png",
    plugins: [
      "expo-router",
      "expo-web-browser",
      "expo-dev-client",
      [
        "expo-splash-screen",
        {
          image: "./assets/splash.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "@react-native-seoul/kakao-login",
        {
          kakaoAppKey: "bb6c2b86af4af113d831f074fbbe1a0f",
          postlink: "kakaotalk"
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      supabaseNativeKey: process.env.EXPO_PUBLIC_SUPABASE_NATIVE_KEY,
      eas: {
        projectId: "f5175e35-e195-40cd-850d-fb8126ca7d70",
      },
    },
  },
};
