package org.eyespy.keycloak.provider;

import java.util.Optional;

/**
 * Provide config values from the environment, converting "id-case" keys and prefixes to
 * screaming snake-case (e.g. "ID_CASE").
 */
public class EnvironmentConfigProvider implements ConfigProvider{

    private String prefix = "";

    /**
     * Convert "id-case" to screaming snake-case (e.g. "ID_CASE").
     * @return the screaming snake-case string
     */
    private static String convertCase(String s) {
        return s.replace("-", "_").toUpperCase();
    }

    public EnvironmentConfigProvider(String prefix) {
        this.prefix = convertCase(prefix);
    }

    public Optional<String> get(String key) {
        key = convertCase(key);
        if (this.prefix != null && !this.prefix.isEmpty()) {
            key = this.prefix + "_" + key;
        }
        String value = System.getenv(key);
        if (value != null) {
            return Optional.of(value);
        } else {
            return Optional.empty();
        }
    }
}
