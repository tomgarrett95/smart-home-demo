import { z } from 'zod';

// Conventions that apply across every endpoint

// :id route parameter. Arrives as a string in the URL, so it's coerced to a number.
export const IdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// The body of every error response
export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
