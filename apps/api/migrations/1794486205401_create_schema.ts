import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    // Rooms. Names are unique ignoring case, so "Kitchen" and "kitchen" can't both exist.
    await db.schema
        .createTable('rooms')
        .addColumn('id', 'integer', (col) => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn('name', 'text', (col) => col.notNull())
        .addColumn('created_at', 'timestamptz', (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .execute()

    await db.schema
        .createIndex('rooms_name_unique')
        .on('rooms')
        .unique()
        .expression(sql`lower(name)`)
        .execute()

    // Devices. Each belongs to exactly one room; device names don't have to be unique.
    await db.schema
        .createTable('devices')
        .addColumn('id', 'integer', (col) => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn('device_type', 'text', (col) => col.notNull())
        .addColumn('name', 'text', (col) => col.notNull())
        .addColumn('room_id', 'integer', (col) => col.notNull())
        .addColumn('status', 'text', (col) => col.notNull().defaultTo('off'))
        .addColumn('created_at', 'timestamptz', (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .addColumn('updated_at', 'timestamptz', (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .addCheckConstraint(
            'devices_device_type_check',
            sql`device_type in ('light', 'plug')`
        )
        .addCheckConstraint('devices_status_check', sql`status in ('on', 'off')`)
        // restrict: Postgres refuses to delete a room that still has devices
        .addForeignKeyConstraint(
            'devices_room_id_fkey',
            ['room_id'],
            'rooms',
            ['id'],
            (fk) => fk.onDelete('restrict')
        )
        .execute()

    // Postgres doesn't index foreign keys automatically. This one is used by the device
    // list's join and the device count per room.
    await db.schema
        .createIndex('devices_room_id_idx')
        .on('devices')
        .column('room_id')
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    // devices first, because it references rooms
    await db.schema.dropTable('devices').execute()
    await db.schema.dropTable('rooms').execute()
}
