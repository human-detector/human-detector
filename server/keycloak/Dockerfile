FROM maven:3.8-openjdk-18-slim AS spi-builder
WORKDIR sync-users-spi
RUN mkdir -p ./target
# Utilize Docker cache; if pom.xml doesn't change, we don't need to re-fetch our deps
COPY ./sync-users-spi/pom.xml .
RUN mvn dependency:go-offline -B
COPY ./sync-users-spi/src ./src
RUN mvn package

FROM quay.io/keycloak/keycloak:19.0.2 AS keycloak-builder
COPY --from=spi-builder /sync-users-spi/target/sync-users.jar /opt/keycloak/providers
COPY ./data/import /opt/keycloak/data/import
RUN /opt/keycloak/bin/kc.sh -v import --dir /opt/keycloak/data/import
RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:19.0.2
COPY --from=keycloak-builder /opt/keycloak /opt/keycloak
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
