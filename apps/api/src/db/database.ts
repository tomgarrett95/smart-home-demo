import type { DeviceStatus, DeviceType } from '@devices/shared';
import type { Generated, Selectable } from 'kysely';

// Mirrors the real Postgres columns (snake_case). Mapping to the API shape happens in the repository.
export interface DevicesTable {
  id: Generated<number>;
  device_type: DeviceType;
  name: string;
  room: string;
  status: Generated<DeviceStatus>; // defaults to 'off' in the database
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface Database {
  devices: DevicesTable;
}

export type DeviceRow = Selectable<DevicesTable>;
