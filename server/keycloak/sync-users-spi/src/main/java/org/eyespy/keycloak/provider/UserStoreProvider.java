package org.eyespy.keycloak.provider;

import org.keycloak.provider.Provider;

public interface UserStoreProvider extends Provider {
    void init(ConfigProvider configProvider);
    void addUser(String userId);
    void deleteUser(String userId);
}
