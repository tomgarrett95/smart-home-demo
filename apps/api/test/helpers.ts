import { type Insertable, sql } from 'kysely';
import { db } from '../src/db/client';
import type { DevicesTable } from '../src/db/database';

// Call in beforeEach so every test starts from empty tables with IDs starting at 1
export async function resetDatabase(): Promise<void> {
    await sql`truncate table devices, rooms restart identity`.execute(db);
}

// Inserts straight into the database, so tests for one endpoint don't depend on another working
export async function insertRoom(name = 'Living room') {
    return db.insertInto('rooms').values({ name }).returningAll().executeTakeFirstOrThrow();
}

type InsertDeviceInput = Partial<Insertable<DevicesTable>> & Pick<Insertable<DevicesTable>, 'room_id'>;

export async function insertDevice(input: InsertDeviceInput) {
    const past = new Date('2026-01-01T00:00:00.000Z'); // Timestamps default to a fixed past date, so tests can check updatedAt changes.

    return db
        .insertInto('devices')
        .values({
            device_type: 'light',
            name: 'Ceiling light',
            status: 'off',
            created_at: past,
            updated_at: past,
            ...input,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
}