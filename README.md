# Smart Home Demo

A small full-stack CRUD app for managing smart home devices. Devices are lights or plugs, and each belongs to a room. You can add a device, edit it, toggle it on or off, and delete it.

## Running the application

### Prerequisites

- Node.js 24 (see `.nvmrc`; run `nvm use`)
- Docker (for Postgres)

### First run

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/client/.env.example apps/client/.env
npm run db:up       # start Postgres in Docker (dev DB on 5432, test DB on 5433)
npm run db:setup    # run migrations and seed sample rooms and devices
npm run dev         # start the API (port 3000) and the web app (port 5173) together
```

Then open http://localhost:5173 and go to the devices page (`/app/devices`).

The seed creates four rooms and six devices. The Garage is left empty on purpose, so you can see a room with no devices.

In development, Vite proxies `/api/*` to the API, so the frontend and API share an origin and no CORS configuration is needed.

### Other scripts

```bash
npm test                     # API integration tests (needs `npm run db:up` first)
npm run typecheck            # type-check every workspace
npm run lint -w apps/client  # lint the frontend
npm run db:rollback -w apps/api  # roll back the latest migration
npm run db:down              # stop the Postgres containers
```

### Project structure

```
apps/
  api/        Express REST API, Kysely migrations and seeds
  client/     React + Vite frontend
packages/
  shared/     Zod schemas and inferred types used by both apps
docker-compose.yml
```

### API

All endpoints live under `/api`.

| Method   | Path               | Description                                   | Success |
| -------- | ------------------ | --------------------------------------------- | ------- |
| `GET`    | `/api/health`      | Health check, including database connectivity | `200`   |
| `GET`    | `/api/rooms`       | List rooms, with a device count for each      | `200`   |
| `POST`   | `/api/rooms`       | Create a room                                 | `201`   |
| `GET`    | `/api/devices`     | List all devices                              | `200`   |
| `GET`    | `/api/devices/:id` | Get one device                                | `200`   |
| `POST`   | `/api/devices`     | Create a device                               | `201`   |
| `PATCH`  | `/api/devices/:id` | Update a device's name, room or status        | `200`   |
| `DELETE` | `/api/devices/:id` | Delete a device                               | `204`   |

Errors always use the same shape:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [] } }
```

| Status | When                                                                   |
| ------ | ---------------------------------------------------------------------- |
| `400`  | Body fails validation, is not valid JSON, or references a missing room |
| `404`  | Device or route not found                                              |
| `409`  | Conflict, e.g. a room with that name already exists                    |
| `503`  | Health check can't reach the database                                  |
| `500`  | Unexpected error (no internal details exposed)                         |

## Technology choices

| Layer        | Choice                                                                             |
| ------------ | ---------------------------------------------------------------------------------- |
| Language     | TypeScript throughout                                                              |
| Frontend     | React 19 + Vite, HeroUI and Tailwind CSS (based on Bulletproof React architecture) |
| Routing      | React Router                                                                       |
| Server state | TanStack Query, with axios as the HTTP client                                      |
| API          | Node.js + Express 5, RESTful                                                       |
| Validation   | Zod, shared between client and server                                              |
| Database     | PostgreSQL 16 (Docker for local development)                                       |
| DB access    | Kysely (type-safe SQL query builder) and its migrator                              |
| Testing      | Vitest and Supertest, against a real Postgres                                      |
| Repo         | npm workspaces monorepo, Prettier and Husky pre-commit hooks                       |

## Key decisions

**Monorepo with a shared package.** The API and frontend both import Zod schemas from `packages/shared`, so request and response types can't drift apart. The shared package exports TypeScript source directly to avoid a build step; in production I'd build it (e.g. with `tsup`) or bundle the API.

**Separate schemas per operation.** `CreateDeviceSchema`, `UpdateDeviceSchema` and `DeviceSchema` are distinct, because a create payload has no `id`, an update is partial and can't change `deviceType`, and the response includes timestamps and the full room.

**Rooms as their own table.** Devices reference a room by `room_id` rather than storing free text, so a room can't be misspelt into two. Room names are unique ignoring case (a unique index on `lower(name)`), and the foreign key uses `ON DELETE RESTRICT`, so Postgres refuses to delete a room that still has devices.

**`PATCH` rather than `PUT`.** Users update individual fields (most often `status`) rather than replacing a whole device.

**Postgres over SQLite.** SQLite would remove Docker from the setup, but Postgres reflects how this would run in production and handles concurrent writes properly.

**Validation at two layers.** Zod validates at the API boundary; the database enforces the same rules with `CHECK`, unique and foreign key constraints. Database errors are mapped to API errors by constraint name, so each rule gets its own message. The missing-room error has the same shape as a Zod error, so the form can show it against the room field. Unrecognised database errors fall through to a safe `500`.

**Kysely rather than an ORM.** Queries read like SQL, so it's always clear what runs against the database, while still being fully type-checked.

**Repository layer.** Route handlers call small `devicesRepo` and `roomsRepo` modules rather than querying the database directly, keeping HTTP concerns separate from data access.

**Tests against a real database.** API tests run through Supertest against a separate Postgres container that keeps its data in memory (tmpfs). This tests the SQL and constraints for real rather than mocking them. The test setup refuses to run unless the database name contains `_test`, so it can't wipe the dev database.

### Assumptions

The following assumptions were made to ensure simplicity for this task:

- A single household and a single user, so there's no authentication or data scoping.
- A device's type is fixed once created; you'd delete it and add a new one instead.
- Status is just on or off. No brightness, schedules or other device-specific settings.
- Devices are records only; nothing talks to real hardware.

## What I'd improve with more time

- **Authentication**, using a managed provider (e.g Auth0), with every query scoped to the user's household.
- **Frontend tests.** Component tests with Vitest & React Testing Library, plus a few Playwright end-to-end tests of the main flows.
- **Complete room management**: rename and delete rooms in the API and UI. Add feature for users to add a new room when creating or modifying a device.
- **Optimistic updates** for the on/off toggle, so it feels instant.
- **Pagination and filtering** on the device list, by room, type or status. As devices may become more complicated, reduce the payload size of devices when calling `getDevices`.
- **CI** running typecheck, lint and tests on every pull request.
- **API documentation** generated from the Zod schemas as OpenAPI.
- **Observability.** Sentry for error tracking and performance tracing on both the API and the client, plus structured logging (e.g. pino) with request IDs.
- **UUIDv7 IDs** instead of sequential integers, so IDs don't reveal how many records exist and can be generated outside the database.
- **One UI library.** The client uses HeroUI with MUI icons; I'd settle on one set to reduce bundle size.
- **Real-time state** (Server-Sent Events or WebSockets) if devices could change state outside the app.

## Deploying to a cloud platform

I haven't deployed this, but the app splits into three parts, and each maps onto a managed cloud service. Using AWS as an example:

- **Frontend.** `npm run build -w apps/client` produces static files, which can be hosted on S3 and served through CloudFront (AWS's CDN).
- **API.** Package the API as a Docker image and run it on a managed container service such as AWS App Runner, using `/api/health` as the health check.
- **Database.** A managed PostgreSQL database (Amazon RDS), so backups and updates are handled for me. Connection details are passed in as environment variables.
- **Deploying changes.** A GitHub Actions pipeline that runs the tests, runs the database migrations, then deploys the new version.
- **Monitoring.** Sentry to report errors from the API and the browser.
