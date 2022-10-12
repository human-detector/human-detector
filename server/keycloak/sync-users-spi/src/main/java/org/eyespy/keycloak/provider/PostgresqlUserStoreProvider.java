package org.eyespy.keycloak.provider;

import org.jboss.logging.Logger;

import java.sql.*;
import java.util.Properties;

public class PostgresqlUserStoreProvider implements UserStoreProvider {

    private static final String HOST_OPTION = "db-host";
    private static final String DATABASE_OPTION = "db-name";
    private static final String USER_OPTION = "db-user";
    private static final String PASSWORD_OPTION = "db-password";
    private static final String USERS_TABLE_OPTION = "db-users-table";
    private static final String USER_ID_COLUMN_OPTION = "db-user-id-column";

    // 'user' is a keyword in PostgreSQL, so we need to wrap it in double quotes for queries
    private static final String DEFAULT_USERS_TABLE = "\"user\"";
    private static final String DEFAULT_USER_ID_COLUMN = "id";

    private String dbConnUrl;
    private Properties dbConnProps;
    private String usersTable = DEFAULT_USERS_TABLE;
    private String userIdColumn = DEFAULT_USER_ID_COLUMN;
    private static final Logger LOG = Logger.getLogger(PostgresqlUserStoreProvider.class);

    private Connection getConnection() throws SQLException {
        return DriverManager.getConnection(dbConnUrl, dbConnProps);
    }

    @Override
    public void init(ConfigProvider configProvider) {
        try {
            /*
             * FIXME: According to the Postgresql JDBC driver docs, this shouldn't be necessary for this Java version:
             *        https://jdbc.postgresql.org/documentation/use/#loading-the-driver
             *        However, I'm going insane and I just want my provider to work and this seems to do the job
             *        for now because Keycloak comes bundled with a Postgresql JDBC driver. For some reason,
             *        it won't expose it by default and I have to load it manually like this???
             */
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException exception) {
            LOG.error("Postgresql driver not found", exception);
        }
        dbConnUrl = "jdbc:postgresql://" + configProvider.get(HOST_OPTION).orElse("localhost") + "/" + configProvider.get(DATABASE_OPTION).orElse("postgres");
        dbConnProps = new Properties();

        // Needed to allow saving user ID strings as UUID in Postgres: https://stackoverflow.com/a/66416520
        dbConnProps.setProperty("stringtype", "unspecified");

        dbConnProps.setProperty("user", configProvider.get(USER_OPTION).orElse("postgres"));
        dbConnProps.setProperty("password", configProvider.get(PASSWORD_OPTION).orElse(""));
        usersTable = configProvider.get(USERS_TABLE_OPTION).orElse(DEFAULT_USERS_TABLE);
        userIdColumn = configProvider.get(USER_ID_COLUMN_OPTION).orElse(DEFAULT_USER_ID_COLUMN);

        // Test connection now rather than surprising you with a failed connection later
        try {
            getConnection().close();
        } catch (SQLException exception) {
            LOG.error("Failed to connect to database (is your configuration correct?)", exception);
        }
    }

    @Override
    public void close() {}

    @Override
    public void addUser(String userId) {
        try (Connection conn = this.getConnection();
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO " + usersTable + " (" + userIdColumn + ") VALUES (?)")) {
            stmt.setString(1, userId);
            stmt.execute();
            LOG.debugv("Added user with ID {0} to database", userId);
        } catch (SQLException exception) {
            LOG.error("Failed to add user to database", exception);
        }
    }

    @Override
    public void deleteUser(String userId) {
        try (Connection conn = this.getConnection();
             PreparedStatement stmt = conn.prepareStatement("DELETE FROM " + usersTable + " WHERE " + userIdColumn + " = ?")) {
            stmt.setString(1, userId);
            stmt.execute();
            LOG.debugv("Deleted user with ID {0} from database", userId);
        } catch (SQLException exception) {
            LOG.error("Failed to delete user from database", exception);
        }
    }
}
