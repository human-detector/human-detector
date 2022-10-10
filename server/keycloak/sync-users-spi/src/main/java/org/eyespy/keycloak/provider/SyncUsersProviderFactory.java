package org.eyespy.keycloak.provider;

import org.jboss.logging.Logger;
import org.keycloak.Config;
import org.keycloak.events.EventListenerProvider;
import org.keycloak.events.EventListenerProviderFactory;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;

public class SyncUsersProviderFactory implements EventListenerProviderFactory {

    private static final String PROVIDER_ID = "sync-users";

    private UserStoreProvider userStoreProvider;
    private static final Logger LOG = Logger.getLogger(SyncUsersProviderFactory.class);

    @Override
    public EventListenerProvider create(KeycloakSession keycloakSession) {
        return new SyncUsersProvider(userStoreProvider);
    }

    @Override
    public void init(Config.Scope scope) {
        ConfigProvider configProvider = new EnvironmentConfigProvider(PROVIDER_ID);
        userStoreProvider = new PostgresqlUserStoreProvider();
        userStoreProvider.init(configProvider);
        LOG.debug("Initialized user store");
    }

    @Override
    public void postInit(KeycloakSessionFactory keycloakSessionFactory) {}

    @Override
    public void close() {
        this.userStoreProvider.close();
        LOG.debug("Finished user store cleanup");
    }

    @Override
    public String getId() {
        return PROVIDER_ID;
    }
}