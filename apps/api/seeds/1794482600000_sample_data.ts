import { type Kysely, sql } from 'kysely';

// Local development only: wipes both tables and starts IDs from 1 again
export async function seed(db: Kysely<any>): Promise<void> {
  await sql`truncate table devices, rooms restart identity`.execute(db);

  const rooms = await db
    .insertInto('rooms')
    .values([{ name: 'Living room' }, { name: 'Kitchen' }, { name: 'Bedroom' }, { name: 'Garage' }])
    .returning(['id', 'name'])
    .execute();

  // Look rooms up by name, so the device list below stays readable
  const roomId = (name: string) => {
    const room = rooms.find((r) => r.name === name);
    if (!room) throw new Error(`Seed room "${name}" not found`);
    return room.id;
  };

  await db
    .insertInto('devices')
    .values([
      { device_type: 'light', name: 'Ceiling light', room_id: roomId('Living room'), status: 'on' },
      { device_type: 'plug', name: 'TV', room_id: roomId('Living room'), status: 'off' },
      { device_type: 'light', name: 'Pendant', room_id: roomId('Kitchen'), status: 'off' },
      { device_type: 'plug', name: 'Kettle', room_id: roomId('Kitchen'), status: 'off' },
      { device_type: 'light', name: 'Bedside lamp', room_id: roomId('Bedroom'), status: 'on' },
      { device_type: 'plug', name: 'Phone charger', room_id: roomId('Bedroom'), status: 'on' },
    ])
    .execute();

  // Garage is left empty on purpose, so the UI and GET /api/rooms show a room with no devices
}
