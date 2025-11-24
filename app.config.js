import 'dotenv/config';

export default {
  "expo": {
    "name": "app-lab",
    "slug": "app-lab",
    "scheme": "myapp",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./src/assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./src/assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./src/assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true,
      "predictiveBackGestureEnabled": false
    },
    "web": {
      "favicon": "./src/assets/favicon.png",
      "bundler": "metro"
    },
    "plugins": [
      "expo-router"
    ],
    "extra": {
      "API_URL": `http://${process.env.EXPO_PUBLIC_IP}:${process.env.EXPO_PUBLIC_SOCKET_PORT}`,
      "router": {},
      "eas": {
        "projectId": "615f9903-2eeb-4579-8923-9890226ab8d9"
      }
    },
    "runtimeVersion": {
      "policy": "appVersion"
    },
    "updates": {
      "url": "https://u.expo.dev/615f9903-2eeb-4579-8923-9890226ab8d9"
    }
  }
}
