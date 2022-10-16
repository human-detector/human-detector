# backend

It's the backend.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

### Prerequisites

- Pull the `postgres` Docker container:
  ```bash
  $ docker pull postgres:14-alpine
  ```
- Build the Keycloak container:
  ```bash
  $ docker-compose build keycloak
  ```

### Running

```bash
$ npm run test
```
