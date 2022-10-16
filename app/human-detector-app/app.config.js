module.exports = {
    name: 'human-detector',
    version: '1.0.0',
    extra: {
      keycloakUrl: process.env.KEYCLOAK_URL,
      backendUrl: process.env.BACKEND_URL,
      clientId: process.env.CLIENT_ID
    },
    scheme: 'myapp',
  };