import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('devices')
        .addColumn('id', 'integer', (col) => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn('device_type', 'text', (col) => col.notNull())
        .addColumn('name', 'text', (col) => col.notNull())
        .addColumn('room', 'text', (col) => col.notNull())
        .addColumn('status', 'text', (col) => col.notNull().defaultTo('off'))
        .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
        .addCheckConstraint('devices_device_type_check', sql`device_type in ('light', 'plug')`)
        .addCheckConstraint('devices_status_check', sql`status in ('on', 'off')`)
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('devices').execute();
}