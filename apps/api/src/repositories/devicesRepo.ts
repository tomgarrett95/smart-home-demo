import type { CreateDeviceInput, Device, UpdateDeviceInput } from '@smart-home/packages/devices';
import { sql } from 'kysely';
import { db } from '../db/client';

const deviceWithRoomColumns = [
    'devices.id',
    'devices.device_type',
    'devices.name',
    'devices.status',
    'devices.created_at',
    'devices.updated_at',
    'rooms.id as room_id',
    'rooms.name as room_name',
] as const;

// Every read goes through this query, so a device always comes back with its room.
// An inner join is right here: room_id is NOT NULL with a foreign key, so every device has a room.
function selectDevicesWithRoom() {
    return db
        .selectFrom('devices')
        .innerJoin('rooms', 'rooms.id', 'devices.room_id')
        .select(deviceWithRoomColumns);
}

type DeviceWithRoomRow = NonNullable<
    Awaited<ReturnType<ReturnType<typeof selectDevicesWithRoom>['executeTakeFirst']>>
>;

// The one place the database shape becomes the API shape.
// Fields are listed explicitly so new columns never leak into responses by accident.
function toDevice(row: DeviceWithRoomRow): Device {
    return {
        id: row.id,
        deviceType: row.device_type,
        name: row.name,
        room: { id: row.room_id, name: row.room_name },
        status: row.status,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString(),
    };
}

export const devicesRepo = {
    async list(): Promise<Device[]> {
        const rows = await selectDevicesWithRoom()
            .orderBy('rooms.name')
            .orderBy('devices.name')
            .execute();
        return rows.map(toDevice);
    },

    async findById(id: number): Promise<Device | undefined> {
        const row = await selectDevicesWithRoom().where('devices.id', '=', id).executeTakeFirst();
        return row ? toDevice(row) : undefined;
    },

    // Writes use a data-modifying CTE: the write and the join with rooms happen in one statement,
    // so it's one round trip and nothing can change the device in between.
    //
    // The main SELECT reads from the CTE's output ("written"), not the devices table, because
    // every part of a statement sees the database as it was before the statement started:
    // the new row isn't in the table yet as far as the SELECT is concerned.
    // "written as devices" lets it reuse the same column list as the reads above.

    async create(input: CreateDeviceInput): Promise<Device> {
        const row = await db
            .with('written', (qb) =>
                qb
                    .insertInto('devices')
                    .values({
                        device_type: input.deviceType,
                        name: input.name,
                        room_id: input.roomId,
                        status: input.status,
                    })
                    .returningAll(),
            )
            .selectFrom('written as devices')
            .innerJoin('rooms', 'rooms.id', 'devices.room_id')
            .select(deviceWithRoomColumns)
            .executeTakeFirstOrThrow();

        return toDevice(row);
    },

    // Fields that weren't sent are undefined, and Kysely leaves undefined values out of the SET clause.
    // If no device has this id, the CTE returns no rows, so neither does the SELECT.
    async update(id: number, input: UpdateDeviceInput): Promise<Device | undefined> {
        const row = await db
            .with('written', (qb) =>
                qb
                    .updateTable('devices')
                    .set({
                        name: input.name,
                        room_id: input.roomId,
                        status: input.status,
                        updated_at: sql`now()`,
                    })
                    .where('id', '=', id)
                    .returningAll(),
            )
            .selectFrom('written as devices')
            .innerJoin('rooms', 'rooms.id', 'devices.room_id')
            .select(deviceWithRoomColumns)
            .executeTakeFirst();

        return row ? toDevice(row) : undefined;
    },

    async remove(id: number): Promise<boolean> {
        const result = await db.deleteFrom('devices').where('id', '=', id).executeTakeFirst();
        return result.numDeletedRows > 0n;
    },
};