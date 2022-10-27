module.exports = {
    name: 'human-detector',
    version: '1.0.0',
    "owner": "eyespy",
    extra: {
      keycloakUrl: process.env.KEYCLOAK_URL,
      backendUrl: process.env.BACKEND_URL,
      clientId: process.env.CLIENT_ID,
      "eas": {
        "projectId": "ed8f08df-8ad9-4b40-85fe-8ee17795b51f"
      }
    },
    scheme: 'myapp',
    "plugins": ["@config-plugins/react-native-ble-plx",
    [
      "expo-build-properties",
      {
        "android": {
          "compileSdkVersion": 33,
          "targetSdkVersion": 33,
          "buildToolsVersion": "33.0.0"
        },
        "ios": {
          "deploymentTarget": "13.0"
        }
      }
    ]],
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourappname",
      "supportsTablet": true,
    },
    "android": {
      "package": "com.yourcompany.yourappname"
    }
  };