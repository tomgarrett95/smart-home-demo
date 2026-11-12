import type { ApiErrorBody } from '@smart-home/packages/api';
import type { ErrorRequestHandler, RequestHandler, Response } from 'express';
import pg from 'pg';
import { AppError } from '../errors';

// Postgres error codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
const PG_FOREIGN_KEY_VIOLATION = '23503';
const PG_UNIQUE_VIOLATION = '23505';
const PG_CHECK_VIOLATION = '23514';

// Database constraints (named in the migrations) mapped to API errors.
// Matching on the constraint name means each rule gets its own message, and new
// constraints fall through to a safe 500 until they're deliberately handled here.
const CONSTRAINT_ERRORS: Record<string, { status: number; body: ApiErrorBody }> = {
  rooms_name_unique: {
    status: 409,
    body: { error: { code: 'CONFLICT', message: 'A room with this name already exists' } },
  },
  // Same shape as a Zod failure, so the frontend can show it against the room field
  devices_room_id_fkey: {
    status: 400,
    body: {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: [{ path: 'roomId', message: 'Room does not exist' }],
      },
    },
  },
};

function sendError(res: Response, status: number, body: ApiErrorBody) {
  res.status(status).json(body);
}

// Any request that didn't match a route gets a JSON 404 rather than Express's default HTML page
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, 'ROUTE_NOT_FOUND', `No route for ${req.method} ${req.path}`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    sendError(res, err.status, {
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  // Malformed JSON body, raised by express.json()
  if (err?.type === 'entity.parse.failed') {
    sendError(res, 400, { error: { code: 'INVALID_JSON', message: 'Request body is not valid JSON' } });
    return;
  }

  if (err instanceof pg.DatabaseError) {
    const known = err.constraint ? CONSTRAINT_ERRORS[err.constraint] : undefined;
    if (known) {
      sendError(res, known.status, known.body);
      return;
    }

    if (err.code === PG_CHECK_VIOLATION) {
      sendError(res, 400, { error: { code: 'CONSTRAINT_VIOLATION', message: 'Value not allowed' } });
      return;
    }

    // An unmapped unique or foreign key violation is still a client problem, not a server crash
    if (err.code === PG_UNIQUE_VIOLATION) {
      sendError(res, 409, { error: { code: 'CONFLICT', message: 'Resource already exists' } });
      return;
    }
    if (err.code === PG_FOREIGN_KEY_VIOLATION) {
      sendError(res, 409, { error: { code: 'CONFLICT', message: 'Related resource conflict' } });
      return;
    }
  }

  // Unexpected: log the detail, but never send it to the client
  console.error(err);
  sendError(res, 500, { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
};
