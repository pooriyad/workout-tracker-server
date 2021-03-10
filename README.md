## Description

The server side of a web app for tracking workout metrics.

## Features

- Setting workout schedule
- Keeping track of weight
- Setting weight goal
- Workout statistics (done, to-do, missed, indeterminate)

## Tech stack

The tech stack includes:

- Nestjs
- PostgreSQL
- TypeORM

## API documentation

The API documentation can be found at `/documentation` after running the app in development mode.

## Environment variables

Information about environment variables can be found at `app.module.ts` file and in `ConfigModule` options.

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
