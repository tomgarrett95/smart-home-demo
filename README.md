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

## Technology choices and key decisions

TypeScript is used throughout, in an npm workspaces monorepo. The API and frontend both import the same Zod schemas from `packages/shared`, so request and response types can't drift apart.

### Frontend

**Stack:** React 19 + Vite, React Router, TanStack Query, axios, HeroUI and Tailwind CSS.

- **Plain React (a Vite single-page app) rather than Next.js.** The app has no public content that needs to rank in search, so there's no need for SEO or server rendering. A static SPA is simpler to build and host. Code is organised by feature, following the Bulletproof React structure.
- **State lives in the URL and TanStack Query.** The device being viewed comes from the route (`/my-home/devices/:id`), and server data is cached by TanStack Query, which refetches after every change. That leaves almost no local state, so there's no need for Redux or Zustand.
- **Route loaders prefetch into the query cache**, so pages have their data as soon as they open.
- **Edits save as you go.** The on/off switch and room save immediately; the name saves after a short pause in typing (using `use-debounce`).
- **HeroUI and Tailwind** provide accessible, ready-made components.

### Backend

**Stack:** Node.js, Express 5, Zod.

- **A REST API with Express 5.** It's familiar and small, and version 5 passes errors from async handlers to the error middleware.
- **`PATCH` rather than `PUT`**, because users change one field at a time (most often the status).
- **Zod validates every request** at the API boundary, with separate schemas for create, update and the response.
- **A repository layer.** Route handlers call `devicesRepo` and `roomsRepo` rather than querying the database directly, keeping HTTP concerns separate from data access.
- **Consistent errors.** Every error has the same shape. Database constraint errors become clear `400` or `409` responses, and anything unexpected returns a safe `500`.

### Data

**Stack:** PostgreSQL 16 (in Docker locally), Kysely.

- **Postgres over SQLite.** SQLite would remove Docker from the setup, but Postgres matches how this would run in production, lets several API instances share one database, and handles concurrent writes.
- **Kysely rather than an ORM.** Queries read like SQL and are fully type-checked. The trade-off is that migrations are written by hand.
- **Rooms as their own table.** Devices reference a room by ID, room names are unique ignoring case, and a room that still has devices can't be deleted.
- **The database enforces the rules too**, with `CHECK`, unique and foreign key constraints as a backstop to Zod.
- **Tests run against a real Postgres**, in a separate in-memory container, rather than mocking the database. The test setup refuses to run against anything but the test database.

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
- **Observability.** Sentry for error tracking and performance tracing on both the API and the client.
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
