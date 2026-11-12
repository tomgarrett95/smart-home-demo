import type { CreateRoomInput, RoomSummary } from '@smart-home/packages/rooms';
import { db } from '../db/client';

export const roomsRepo = {
  // A LEFT join, unlike devicesRepo: a room with no devices must still be listed (with a count of 0).
  // count(devices.id) rather than count(*), because count(*) would count the empty row as 1.
  async list(): Promise<RoomSummary[]> {
    const rows = await db
      .selectFrom('rooms')
      .leftJoin('devices', 'devices.room_id', 'rooms.id')
      .select((eb) => [
        'rooms.id',
        'rooms.name',
        // Postgres returns count() as a bigint, which the pg driver gives back as a string
        eb.cast<number>(eb.fn.count('devices.id'), 'integer').as('device_count'),
      ])
      .groupBy(['rooms.id', 'rooms.name'])
      .orderBy('rooms.name')
      .execute();

    return rows.map((row) => ({ id: row.id, name: row.name, deviceCount: row.device_count }));
  },

  async create(input: CreateRoomInput): Promise<RoomSummary> {
    const row = await db
      .insertInto('rooms')
      .values({ name: input.name })
      .returning(['id', 'name'])
      .executeTakeFirstOrThrow();

    return { id: row.id, name: row.name, deviceCount: 0 };
  },
};
