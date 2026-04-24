# Knowledge Hub

## Prerequisites

- Git - [Download & Install Git](https://git-scm.com/downloads).
- Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager.

## Downloading

```
git clone {repository URL}
```

## Installing NPM modules

```
npm install
```

## Environment

Copy the example environment file and adjust values if needed:

```
cp .env.example .env
```

The project expects PostgreSQL settings and JWT secrets in `.env`. For Docker Compose the `POSTGRES_HOST` should be set to `db`.

## Running in development

This starts the database in Docker and runs the API locally in NestJS watch mode.

```
docker compose up -d db
npm run start:dev
```

OpenAPI docs will be available at http://localhost:4000/doc/ after the app starts.

## Running in production

The production setup runs the full stack inside Docker.

```
docker compose up --build
```

This command builds the API image, starts the PostgreSQL database, and brings the service up on port `4000`.

After startup, open http://localhost:4000/doc/ to access the API documentation.

### Stop production services

```
docker compose down
```

## Docker

The API is also available as a Docker image on Docker Hub:

https://hub.docker.com/repository/docker/gserdg/knowledge-hub-api/general

You can run it locally using Docker or Docker Compose if you have the repository configured.

## Testing

After application running open new terminal and enter:

To run only one of all test suites

```
npm run test -- <path to suite>
```

To run all test with authorization

```
npm run test:auth
```

To run only specific test suite with authorization

```
npm run test:auth -- <path to suite>
```

To run refresh token tests

```
npm run test:refresh
```

To run RBAC (role-based access control) tests

```
npm run test:rbac
```

To run unit tests

```
npm run test:unit
```

To run all tests with authorization and unit tests

```
npm run test
```

### Auto-fix and format

```
npm run lint
```

```
npm run format
```

### Debugging in VSCode

Press <kbd>F5</kbd> to debug.

For more information, visit: https://code.visualstudio.com/docs/editor/debugging
