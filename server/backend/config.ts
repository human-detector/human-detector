export default () => ({
  auth: {
    oidc_endpoint: process.env['OIDC_ENDPOINT'],
  },
  expo: {
    access_token: process.env['EXPO_ACCESS_TOKEN'],
  },
});
