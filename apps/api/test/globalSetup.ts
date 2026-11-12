import { readFileSync } from 'node:fs'
import { parse } from 'dotenv'
import { Kysely, PostgresDialect } from 'kysely'
import pg from 'pg'
import { migrateToLatest } from '../src/db/migrate'

// Runs once, before any test file, in the main Vitest process
export default async function setup() {
    const { DATABASE_URL } = parse(readFileSync(new URL('../.env.test', import.meta.url)))

    if (!DATABASE_URL?.includes('_test')) {
        throw new Error(
            'Refusing to migrate: DATABASE_URL in .env.test is not a test database'
        )
    }

    const db = new Kysely<any>({
        dialect: new PostgresDialect({
            pool: new pg.Pool({ connectionString: DATABASE_URL }),
        }),
    })

    try {
        await migrateToLatest(db)
    } catch (error) {
        throw new Error(
            'Could not migrate the test database. Is it running? Start it with: npm run db:up',
            { cause: error }
        )
    } finally {
        await db.destroy()
    }
}
