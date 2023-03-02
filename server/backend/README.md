# backend

It's the backend.

## Dev setup

- Run `npm install`
- Install [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) plugins for your editor

## Database changes

If you make any schema changes to MikroORM entities, you should
- Update `server/database/init/01-create.sql` with the new schema for tests.
  You can get the new schema with this command:
  ```sh
  $ DB_NAME=e DB_HOST=e DB_USER=e DB_PASSWORD=e npx mikro-orm schema:create -d > ../database/init/01-create.sql
  ```
- Generate migrations for deploying these changes to the prod database if necessary.
  The `mikro-orm` CLI mentioned above has tools for doing this. Usually this won't be
  necessary if you're just adding new columns.

## Running the app

Running the app in isolation doesn't make sense due to dependencies (database, auth server),
so you should use Docker. See the `README` in the parent folder.

## Test

### Prerequisites

- Pull the `postgres` Docker container:
  ```bash
  $ docker pull postgres:14-alpine
  ```
- Build the Keycloak container:
  ```bash
  $ docker compose build keycloak
  ```

### Running

```bash
$ npm run test
```
