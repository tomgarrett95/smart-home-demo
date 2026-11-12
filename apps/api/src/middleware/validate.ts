import type { z } from 'zod'
import { ValidationError } from '../errors'

// Called inside route handlers rather than used as middleware, so the parsed result
// keeps its type. Express's req.body is `any`, and middleware can't narrow it.
export function parse<T extends z.ZodType>(schema: T, data: unknown): z.output<T> {
    const result = schema.safeParse(data)

    if (!result.success) {
        throw new ValidationError(
            result.error.issues.map((issue) => ({
                path: issue.path.map(String).join('.'),
                message: issue.message,
            }))
        )
    }

    return result.data
}
