package org.eyespy.keycloak.provider;

import java.util.Optional;

public interface ConfigProvider {
    public Optional<String> get(String key);
}
