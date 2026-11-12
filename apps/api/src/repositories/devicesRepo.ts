import type { CreateDeviceInput, Device, UpdateDeviceInput } from '@smart-home/packages/devices';
import { sql } from 'kysely';
import { db } from '../db/client';

// Every read goes through this query, so a device always comes back with its room.
// An inner join is right here: room_id is NOT NULL with a foreign key, so every device has a room.
function selectDevicesWithRoom() {
  return db
    .selectFrom('devices')
    .innerJoin('rooms', 'rooms.id', 'devices.room_id')
    .select([
      'devices.id',
      'devices.device_type',
      'devices.name',
      'devices.status',
      'devices.created_at',
      'devices.updated_at',
      'rooms.id as room_id',
      'rooms.name as room_name',
    ]);
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

  // Writes return only the ID, then re-read through the join so the response always includes the room.
  // That's two queries, which is fine here; a data-modifying CTE could do it in one.
  async create(input: CreateDeviceInput): Promise<Device> {
    const { id } = await db
      .insertInto('devices')
      .values({
        device_type: input.deviceType,
        name: input.name,
        room_id: input.roomId,
        status: input.status,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    const device = await this.findById(id);
    if (!device) throw new Error(`Device ${id} missing immediately after insert`);
    return device;
  },

  // Fields that weren't sent are undefined, and Kysely leaves undefined values out of the SET clause.
  async update(id: number, input: UpdateDeviceInput): Promise<Device | undefined> {
    const updated = await db
      .updateTable('devices')
      .set({
        name: input.name,
        room_id: input.roomId,
        status: input.status,
        updated_at: sql`now()`,
      })
      .where('id', '=', id)
      .returning('id')
      .executeTakeFirst();

    return updated ? this.findById(updated.id) : undefined;
  },

  async remove(id: number): Promise<boolean> {
    const result = await db.deleteFrom('devices').where('id', '=', id).executeTakeFirst();
    return result.numDeletedRows > 0n;
  },
};
