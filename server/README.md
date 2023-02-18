# server

This package contains everything related to the backend (DB, app, various plugins).

## Hosting in AWS

For production hosting, our app runs in AWS. See the `cdk` package for more
details about the setup.

## Hosting with Docker

If you want to host outside of AWS, or, more likely, you want to test your
backend changes without running a test deployment, you can run the backend
stack on your machine using Docker.

Currently, hosting on a local machine won't work without some extra work.
Our nginx config assumes you're using 2 different domains for `API_URL` and `AUTH_URL`
and it assumes that you have SSL certificates obtained with [Certbot](https://certbot.eff.org/)
installed on your machine. Fixing these issues will require nginx config changes (maybe
a dev config file for local testing?)

### Prerequisites
- [Node LTS](https://nodejs.org/en/download/)
- [Docker](https://docs.docker.com/get-docker/) with Compose v2

Docker Desktop should get you a compatible version of Compose. If you're
Docker through your package manager, make sure you get Compose v2
(`docker compose` will show a help message if you have it).

### Setup

1. Copy `dev.env` to `.env` and enter your desired config there.
   For a production  server, you'll want the standard HTTP
   and HTTPS ports, and your `API_URL` and `AUTH_URL` should
   be different. To get functioning notification delivery, enter
   the Expo access token into `EXPO_ACCESS_TOKEN`.
2. Set up [Certbot](https://certbot.eff.org/) to get and autorenew
   SSL certificates for your `API_URL` and `AUTH_URL` domains.
3. Create volumes for our Docker containers so they'll have persistent storage:
   ```sh
   docker volume create backend-database
   docker volume create keycloak-database
   ```
4. Run `docker compose --env-file .env build` and `docker compose --env-file .env up`
   to build the stack and start it.
5. Navigate to `API_URL` and log in as the Keycloak admin user you configured.
6. Click on `master` and create a realm, importing `keycloak/users-realm.json` as
   the resource file.

After these steps, you'll have a functioning backend stack. You can point the
Expo dev client at it by using the following environment variables:
```sh
OIDC_ENDPOINT="${AUTH_URL}/realms/users"
BACKEND_URL="${API_URL}"
CLIENT_ID="app-client"
```

### Useful commands

- Build the containers for each component
  ```sh
  $ docker compose build
  ```
- Run the test stack
  ```sh
  $ docker compose --env-file dev.env up
  ```
- List running containers
  ```sh
  $ docker container ls
  ```
- Connect to the database
  ```sh
  $ docker exec -it ${POSTGRES_CONTAINER_NAME} psql -U ${DB_USER} ${DB_NAME}
  ```
- Clean up the resources created by Compose:
  ```sh
  $ docker compose down
  ```
