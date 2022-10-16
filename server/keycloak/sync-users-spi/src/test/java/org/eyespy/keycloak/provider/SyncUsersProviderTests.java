package org.eyespy.keycloak.provider;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.keycloak.events.Event;
import org.keycloak.events.EventType;
import org.keycloak.events.admin.AdminEvent;
import org.keycloak.events.admin.OperationType;
import org.keycloak.events.admin.ResourceType;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public class SyncUsersProviderTests {

    private class BogusConfigProvider implements ConfigProvider {
        public Optional<String> get(String key) {
            return Optional.empty();
        }
    }

    private class MemoryUserStoreProvider implements UserStoreProvider {
        private Set<String> userIds = new HashSet<>();

        @Override
        public void init(ConfigProvider configProvider) {}

        @Override
        public void close() {}

        @Override
        public void addUser(String userId) {
            userIds.add(userId);
        }

        @Override
        public void deleteUser(String userId) {
            userIds.remove(userId);
        }

        public boolean hasUser(String userId) {
            return userIds.contains(userId);
        }
    }

    @Test
    void user_registration_should_sync() {
        MemoryUserStoreProvider userStoreProvider = new MemoryUserStoreProvider();
        SyncUsersProvider provider = new SyncUsersProvider(userStoreProvider);
        String newUserId = UUID.randomUUID().toString();
        Event registerEvent = new Event();
        registerEvent.setType(EventType.REGISTER);
        registerEvent.setId(UUID.randomUUID().toString());
        registerEvent.setUserId(newUserId);

        provider.onEvent(registerEvent);
        assertTrue(userStoreProvider.hasUser(newUserId));
    }

    @Test
    void adding_user_in_admin_console_should_sync() {
        MemoryUserStoreProvider userStoreProvider = new MemoryUserStoreProvider();
        SyncUsersProvider provider = new SyncUsersProvider(userStoreProvider);
        String newUserId = UUID.randomUUID().toString();
        AdminEvent event = new AdminEvent();
        event.setId(UUID.randomUUID().toString());
        event.setOperationType(OperationType.CREATE);
        event.setResourceType(ResourceType.USER);
        event.setResourcePath("users/" + newUserId);

        provider.onEvent(event, false);
        assertTrue(userStoreProvider.hasUser(newUserId));
    }
}
