# Human Detector Camera

This project is made up of three projects - Mobile app, Server, and Camera services. Testing instructions for all three are provided below.

## Camera Services

The camera is made up of two services. One handles authentication and bluetooth communications, while the other detects people and sends notifications.

For more details, go to the [Camera Readme!](./camera/README.md)

## Mobile Application Tests

To test the mobile application, you must have `node` and `npm` installed.

To run the mobile application tests, when in the directory `/human-detector/app/human-detector-app/`, you can run `npm test`. This command will both run unit tests, and behavior tests through jest and jest-cucumber.

```
cd app/human-detector-app

npm install

npm test

npm run testBDD
```

To run the tests, make sure to install the dependencies of the project using `npm install`.

To run only behavior tests through jest-cucumber, you can use the command `npm run testBDD` which will run all the cucumber tests with corresponding `.feature` files.

## Running the Mobile Application

To run the app, you must have the expo cli installed on your machine. You also must specify an OpenID Connect endpoint
for authentication (Keycloak for local development, Cognito for production).

```
npm install -g expo-cli // install the expo-cli if you haven't already for glpbal expo cli
// or for convenience, after an npm install, use npx expo for local expo

npm install -g eas-cli

cd app/human-detector-app // enter the mobile app directry

npm install //install dependencies

eas:build android // For android development
eas:build ios // For iOS development

OIDC_ENDPOINT=<authUrl> BACKEND_URL=<backendUrl> CLIENT_ID=<clientId> expo start --dev-client // Start the mobile application 

```

You can also run the mobile application without EAS-CLI.  EAS will allow the use of react native modules that expo
isn't able to use.  Therefore, running the mobile application without EAS-CLI should only be used when developing
the UI for the mobile app.

```

npm install -g expo-cli // install the expo-cli if you haven't already for glpbal expo cli
// or for convenience, after an npm install, use npx expo for local expo

npm install

OIDC_ENDPOINT=<auth> BACKEND_URL=<backendUrl> CLIENT_ID=<clientId> npx expo start // Start the mobile application without EAS-CLI
```


## Testing the Backend

### Prerequisites
- [Node LTS](https://nodejs.org/en/download/)
- [Docker](https://docs.docker.com/get-docker/) with Compose v2

Docker Desktop should get you a compatible version of Compose. If you're
Docker through your package manager, make sure you get Compose v2
(`docker compose` will show a help message if you have it).

### Manual integration tests

For full integration tests (like with the mobile app and camera), you can spawn
a full test stack using [Docker Compose](https://docs.docker.com/compose/).

Some useful commands:

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
