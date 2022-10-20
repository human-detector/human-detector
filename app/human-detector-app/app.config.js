module.exports = {
    name: 'human-detector',
    version: '1.0.0',
    extra: {
      keycloakUrl: process.env.KEYCLOAK_URL,
      backendUrl: process.env.BACKEND_URL,
      clientId: process.env.CLIENT_ID,
      "eas": {
        "projectId": "ed8f08df-8ad9-4b40-85fe-8ee17795b51f"
      }
    },
    scheme: 'myapp',
    "plugins": ["@config-plugins/react-native-ble-plx"],
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourappname",
      "supportsTablet": true,
    },
    "android": {
      "package": "com.yourcompany.yourappname"
    }
  };