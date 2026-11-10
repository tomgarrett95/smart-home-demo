import { type Kysely, sql } from 'kysely';

export async function seed(db: Kysely<any>): Promise<void> {
    await sql`truncate table devices restart identity`.execute(db);

    await db
        .insertInto('devices')
        .values([
            { device_type: 'light', name: 'Ceiling light', room: 'Living room', status: 'on' },
            { device_type: 'plug', name: 'TV', room: 'Living room', status: 'off' },
            { device_type: 'light', name: 'Pendant', room: 'Kitchen', status: 'off' },
            { device_type: 'plug', name: 'Kettle', room: 'Kitchen', status: 'off' },
            { device_type: 'light', name: 'Bedside lamp', room: 'Bedroom', status: 'on' },
            { device_type: 'plug', name: 'Phone charger', room: 'Bedroom', status: 'on' },
        ])
        .execute();
}