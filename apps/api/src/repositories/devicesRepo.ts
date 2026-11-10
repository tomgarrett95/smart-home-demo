import type { CreateDeviceInput, Device, UpdateDeviceInput } from '@devices/shared';
import { sql } from 'kysely';
import { db } from '../db/client';
import type { DeviceRow } from '../db/database';

// The one place the database shape becomes the API shape.
// Fields are listed explicitly so new columns never leak into responses by accident.
function toDevice(row: DeviceRow): Device {
  return {
    id: row.id,
    deviceType: row.device_type,
    name: row.name,
    room: row.room,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export const devicesRepo = {
  async list(): Promise<Device[]> {
    const rows = await db
      .selectFrom('devices')
      .selectAll()
      .orderBy('room')
      .orderBy('name')
      .execute();
    return rows.map(toDevice);
  },

  async findById(id: number): Promise<Device | undefined> {
    const row = await db
      .selectFrom('devices')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    return row ? toDevice(row) : undefined;
  },

  async create(input: CreateDeviceInput): Promise<Device> {
    const row = await db
      .insertInto('devices')
      .values({
        device_type: input.deviceType,
        name: input.name,
        room: input.room,
        status: input.status,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toDevice(row);
  },

  async update(id: number, input: UpdateDeviceInput): Promise<Device | undefined> {
    const row = await db
      .updateTable('devices')
      .set({
        name: input.name,
        room: input.room,
        status: input.status,
        updated_at: sql`now()`,
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    return row ? toDevice(row) : undefined;
  },

  async remove(id: number): Promise<boolean> {
    const result = await db.deleteFrom('devices').where('id', '=', id).executeTakeFirst();
    return result.numDeletedRows > 0n;
  },
};
