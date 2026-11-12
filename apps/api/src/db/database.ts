import type { DeviceStatus, DeviceType } from '@smart-home/packages/devices';
import type { Generated, Selectable } from 'kysely';

export interface RoomsTable {
  id: Generated<number>;
  name: string;
  created_at: Generated<Date>;
}

export interface DevicesTable {
  id: Generated<number>;
  device_type: DeviceType;
  name: string;
  room_id: number;
  status: Generated<DeviceStatus>; // defaults to 'off' in the database
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface Database {
  rooms: RoomsTable;
  devices: DevicesTable;
}

export type RoomRow = Selectable<RoomsTable>;
export type DeviceRow = Selectable<DevicesTable>;
