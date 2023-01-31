module.exports = {
    name: 'human-detector',
    version: '1.0.0',
    "owner": "eyespy",
    extra: {
      oidcEndpoint: process.env.OIDC_ENDPOINT,
      backendUrl: process.env.BACKEND_URL,
      clientId: process.env.CLIENT_ID,
      experienceId: '@eyespy/human-detector',
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
      "package": "com.eyespy.mobile",
      "googleServicesFile": process.env.GOOGLE_SERVICES_JSON,
    }
  };
