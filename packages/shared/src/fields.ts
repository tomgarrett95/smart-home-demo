import { z } from 'zod'

// Building blocks shared by the other modules.

export const nameField = z.string().trim().min(1, 'Name is required').max(100)

export const idField = z.number().int().positive()
