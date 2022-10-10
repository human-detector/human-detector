package org.eyespy.keycloak.provider;

import org.jboss.logging.Logger;
import org.keycloak.events.Event;
import org.keycloak.events.EventListenerProvider;
import org.keycloak.events.admin.AdminEvent;

/**
 * Synchronize user IDs to an external user store (e.g. an external database).
 */
public class SyncUsersProvider implements EventListenerProvider {

    private final UserStoreProvider userStoreProvider;
    private static final Logger LOG = Logger.getLogger(SyncUsersProvider.class);

    public SyncUsersProvider(UserStoreProvider userStoreProvider) {
        this.userStoreProvider = userStoreProvider;
    }

    @Override
    public void onEvent(AdminEvent adminEvent, boolean b) {}
    @Override
    public void close() {
        userStoreProvider.close();
    }

    @Override
    public void onEvent(Event event) {
        switch (event.getType()) {
            case REGISTER:
                LOG.infov("Adding new user with ID {0} to external store", event.getUserId());
                this.userStoreProvider.addUser(event.getUserId());
                break;
            case DELETE_ACCOUNT:
                LOG.infov("Removing user with ID {0} from external store", event.getUserId());
                this.userStoreProvider.deleteUser(event.getUserId());
        }
    }
}
