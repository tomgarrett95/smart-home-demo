import type { ApiErrorBody } from '@devices/shared';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import pg from 'pg';
import { AppError } from '../errors';

// Postgres error codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
const PG_UNIQUE_VIOLATION = '23505';
const PG_CHECK_VIOLATION = '23514';

function sendError(res: Parameters<ErrorRequestHandler>[2], status: number, body: ApiErrorBody) {
  res.status(status).json(body);
}

// Any request that didn't match a route gets a JSON 404
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
    if (err.code === PG_UNIQUE_VIOLATION) {
      sendError(res, 409, { error: { code: 'CONFLICT', message: 'A matching device already exists' } });
      return;
    }
    if (err.code === PG_CHECK_VIOLATION) {
      sendError(res, 400, { error: { code: 'CONSTRAINT_VIOLATION', message: 'Value not allowed' } });
      return;
    }
  }

  // Unexpected: log the detail but never send it to the client
  console.error(err);
  sendError(res, 500, { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
};
