import 'dotenv/config';

export default {
  expo: {
    name: "GreenLoop Mobile",
    slug: "greenloop-mobile-clean",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.greenloop.mobile"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.greenloop.mobile"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      API_URL: process.env.API_URL || "http://192.168.0.11:8081",
      WS_URL: process.env.WS_URL || "ws://192.168.0.11:8081/ws",
      eas: {
        projectId: "your-project-id"
      }
    },
    plugins: []
  }
}; 