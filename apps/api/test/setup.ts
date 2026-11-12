import { afterAll } from 'vitest'
import { db } from '../src/db/client'

// Runs before each test file. A last line of defence: tests truncate tables,
// so never let them anywhere near the dev database.
if (!process.env.DATABASE_URL?.includes('_test')) {
    throw new Error('Refusing to run tests: DATABASE_URL is not a test database')
}

// Close the connection pool so Vitest can exit cleanly
afterAll(async () => {
    await db.destroy()
})
