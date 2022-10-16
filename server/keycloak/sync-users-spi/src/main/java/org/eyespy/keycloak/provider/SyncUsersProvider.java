package org.eyespy.keycloak.provider;

import org.jboss.logging.Logger;
import org.keycloak.events.Event;
import org.keycloak.events.EventListenerProvider;
import org.keycloak.events.admin.AdminEvent;
import org.keycloak.events.admin.ResourceType;

/**
 * Synchronize user IDs to an external user store (e.g. an external database).
 */
public class SyncUsersProvider implements EventListenerProvider {

    private final UserStoreProvider userStoreProvider;
    private static final Logger LOG = Logger.getLogger(SyncUsersProvider.class);

    private enum UserAction {
        CREATE,
        DELETE,
    }

    public SyncUsersProvider(UserStoreProvider userStoreProvider) {
        this.userStoreProvider = userStoreProvider;
    }

    @Override
    public void onEvent(AdminEvent adminEvent, boolean includeRepresentation) {
        if (adminEvent.getResourceType() == ResourceType.USER) {
            String userId = adminEvent.getResourcePath().split("/")[1];
            switch (adminEvent.getOperationType()) {
                case CREATE:
                    doUserAction(UserAction.CREATE, userId);
                    break;
                case DELETE:
                    doUserAction(UserAction.DELETE, userId);
                    break;
            }
        }
    }

    @Override
    public void close() {
        userStoreProvider.close();
    }

    @Override
    public void onEvent(Event event) {
        switch (event.getType()) {
            case REGISTER:
                doUserAction(UserAction.CREATE, event.getUserId());
                break;
            case DELETE_ACCOUNT:
                doUserAction(UserAction.DELETE, event.getUserId());
                break;
        }
    }

    private void doUserAction(UserAction action, String userId) {
        switch (action) {
            case CREATE:
                LOG.infov("Adding new user with ID {0} to external store", userId);
                this.userStoreProvider.addUser(userId);
                break;
            case DELETE:
                LOG.infov("Removing user with ID {0} from external store", userId);
                this.userStoreProvider.deleteUser(userId);
        }
    }
}
