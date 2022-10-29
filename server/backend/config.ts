export default () => ({
  keycloak: {
    host: process.env['KEYCLOAK_HOST'],
    use_tls: process.env['KEYCLOAK_USE_TLS'],
  },
  expo: {
    access_token: process.env['EXPO_ACCESS_TOKEN'],
  },
});
