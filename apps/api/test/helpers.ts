import { type Insertable, sql } from 'kysely';
import { db } from '../src/db/client';
import type { DevicesTable } from '../src/db/database';

// Call in beforeEach so every test starts from an empty table with IDs starting at 1
export async function resetDatabase(): Promise<void> {
  await sql`truncate table devices restart identity`.execute(db);
}

export async function insertDevice(overrides: Partial<Insertable<DevicesTable>> = {}) {
  const past = new Date('2026-01-01T00:00:00.000Z'); // Timestamps default to a fixed past date, so tests can check updatedAt changes.

  return db
      .insertInto('devices')
      .values({
        device_type: 'light',
        name: 'Ceiling light',
        room: 'Living room',
        status: 'off',
        created_at: past,
        updated_at: past,
        ...overrides,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
}
