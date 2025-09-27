export default {
  expo: {
    name: "DailyCue",
    slug: "dailycue",
    owner: "junyi04",
    scheme: "dailycuetest",
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
          data: [
            { scheme: "dailycuetest", host: "login-callback" },
            { scheme: "exp+dailycue", host: "login-callback" },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
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
