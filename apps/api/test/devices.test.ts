import { DeviceSchema } from '@smart-home/packages/devices';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { db } from '../src/db/client';
import { insertDevice, insertRoom, resetDatabase } from './helpers';

const app = createApp();

beforeEach(resetDatabase);

describe('GET /api/devices', () => {
  it('returns each device with its room, sorted by room name then device name', async () => {
    const kitchen = await insertRoom('Kitchen');
    const bedroom = await insertRoom('Bedroom');
    await insertDevice({ name: 'Pendant', room_id: kitchen.id });
    await insertDevice({ name: 'Lamp', room_id: bedroom.id });
    await insertDevice({ name: 'Kettle', room_id: kitchen.id });

    const res = await request(app).get('/api/devices');

    expect(res.status).toBe(200);
    expect(res.body.map((d: { room: { name: string }; name: string }) => [d.room.name, d.name])).toEqual([
      ['Bedroom', 'Lamp'],
      ['Kitchen', 'Kettle'],
      ['Kitchen', 'Pendant'],
    ]);
  });
});

describe('POST /api/devices', () => {
  it('creates a device and returns it with its room and 201', async () => {
    const kitchen = await insertRoom('Kitchen');

    const res = await request(app)
        .post('/api/devices')
        .send({ deviceType: 'plug', name: 'Kettle', roomId: kitchen.id, status: 'on' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: 1,
      deviceType: 'plug',
      name: 'Kettle',
      room: { id: kitchen.id, name: 'Kitchen' },
      status: 'on',
    });
    // The response matches the shared contract the frontend relies on (including ISO timestamps)
    expect(() => DeviceSchema.parse(res.body)).not.toThrow();
  });

  it('saves the device to the database', async () => {
    const kitchen = await insertRoom('Kitchen');

    await request(app)
        .post('/api/devices')
        .send({ deviceType: 'plug', name: 'Kettle', roomId: kitchen.id });

    const rows = await db.selectFrom('devices').selectAll().execute();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ device_type: 'plug', name: 'Kettle', room_id: kitchen.id });
  });

  it('defaults status to off when not provided', async () => {
    const room = await insertRoom();

    const res = await request(app)
        .post('/api/devices')
        .send({ deviceType: 'light', name: 'Lamp', roomId: room.id });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('off');
  });

  it('trims whitespace from name', async () => {
    const room = await insertRoom();

    const res = await request(app)
        .post('/api/devices')
        .send({ deviceType: 'light', name: '  Lamp  ', roomId: room.id });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Lamp');
  });

  it.each([
    ['an invalid deviceType', { deviceType: 'toaster', name: 'Lamp', roomId: 1 }, 'deviceType'],
    ['a missing name', { deviceType: 'light', roomId: 1 }, 'name'],
    ['a blank name', { deviceType: 'light', name: '   ', roomId: 1 }, 'name'],
    ['a missing roomId', { deviceType: 'light', name: 'Lamp' }, 'roomId'],
    ['a non-numeric roomId', { deviceType: 'light', name: 'Lamp', roomId: 'Kitchen' }, 'roomId'],
    ['an invalid status', { deviceType: 'light', name: 'Lamp', roomId: 1, status: 'dim' }, 'status'],
  ])('returns 400 for %s', async (_label, body, field) => {
    await insertRoom();

    const res = await request(app).post('/api/devices').send(body);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: field })]),
    );
  });

  // Passes Zod (it's a valid number) but fails the foreign key in Postgres
  it('returns 400 against roomId when the room does not exist', async () => {
    const res = await request(app)
        .post('/api/devices')
        .send({ deviceType: 'light', name: 'Lamp', roomId: 999 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual([{ path: 'roomId', message: 'Room does not exist' }]);
    expect(await db.selectFrom('devices').selectAll().execute()).toEqual([]);
  });

  it('returns 400 for unknown fields, including the old room field', async () => {
    const room = await insertRoom();

    const res = await request(app)
        .post('/api/devices')
        .send({ deviceType: 'light', name: 'Lamp', roomId: room.id, room: 'Bedroom' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for malformed JSON', async () => {
    const res = await request(app)
        .post('/api/devices')
        .set('Content-Type', 'application/json')
        .send('{"deviceType":');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_JSON');
  });

  // Device names don't have to be unique, even within a room
  it('allows a duplicate name in the same room', async () => {
    const bedroom = await insertRoom('Bedroom');
    await insertDevice({ name: 'Lamp', room_id: bedroom.id });

    const res = await request(app)
        .post('/api/devices')
        .send({ deviceType: 'light', name: 'Lamp', roomId: bedroom.id });

    expect(res.status).toBe(201);
    const lamps = await db.selectFrom('devices').select('id').where('name', '=', 'Lamp').execute();
    expect(lamps).toHaveLength(2);
  });

  it('allows the same name in a different room', async () => {
    const bedroom = await insertRoom('Bedroom');
    const office = await insertRoom('Office');
    await insertDevice({ name: 'Lamp', room_id: bedroom.id });

    const res = await request(app)
        .post('/api/devices')
        .send({ deviceType: 'light', name: 'Lamp', roomId: office.id });

    expect(res.status).toBe(201);
  });
});

describe('PATCH /api/devices/:id', () => {
  it('updates status only, leaving the other fields unchanged', async () => {
    const kitchen = await insertRoom('Kitchen');
    const device = await insertDevice({ name: 'Kettle', room_id: kitchen.id, status: 'off' });

    const res = await request(app).patch(`/api/devices/${device.id}`).send({ status: 'on' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: device.id,
      deviceType: 'light',
      name: 'Kettle',
      room: { id: kitchen.id, name: 'Kitchen' },
      status: 'on',
    });
  });

  // Starts with status 'on' (not the default), so a bug that resets unsent fields can't hide
  it('updates name only, leaving status and room unchanged', async () => {
    const kitchen = await insertRoom('Kitchen');
    const device = await insertDevice({ name: 'Kettle', room_id: kitchen.id, status: 'on' });

    const res = await request(app).patch(`/api/devices/${device.id}`).send({ name: 'Toaster' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: 'Toaster', room: { id: kitchen.id }, status: 'on' });
  });

  it('moves a device to another room and returns the new room', async () => {
    const kitchen = await insertRoom('Kitchen');
    const office = await insertRoom('Office');
    const device = await insertDevice({ room_id: kitchen.id });

    const res = await request(app).patch(`/api/devices/${device.id}`).send({ roomId: office.id });

    expect(res.status).toBe(200);
    expect(res.body.room).toEqual({ id: office.id, name: 'Office' });
  });

  it('changes updatedAt but not createdAt', async () => {
    const room = await insertRoom();
    const device = await insertDevice({ room_id: room.id });

    const res = await request(app).patch(`/api/devices/${device.id}`).send({ status: 'on' });

    expect(res.body.createdAt).toBe(device.created_at.toISOString());
    expect(res.body.updatedAt).not.toBe(device.updated_at.toISOString());
  });

  it('saves the change to the database', async () => {
    const room = await insertRoom();
    const device = await insertDevice({ status: 'off', room_id: room.id });

    await request(app).patch(`/api/devices/${device.id}`).send({ status: 'on' });

    const row = await db
        .selectFrom('devices')
        .select('status')
        .where('id', '=', device.id)
        .executeTakeFirstOrThrow();
    expect(row.status).toBe('on');
  });

  it('returns 400 for an empty body', async () => {
    const room = await insertRoom();
    const device = await insertDevice({ room_id: room.id });

    const res = await request(app).patch(`/api/devices/${device.id}`).send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when trying to change deviceType', async () => {
    const room = await insertRoom();
    const device = await insertDevice({ device_type: 'light', room_id: room.id });

    const res = await request(app).patch(`/api/devices/${device.id}`).send({ deviceType: 'plug' });

    expect(res.status).toBe(400);
    const row = await db
        .selectFrom('devices')
        .select('device_type')
        .where('id', '=', device.id)
        .executeTakeFirstOrThrow();
    expect(row.device_type).toBe('light');
  });

  it('returns 400 for an invalid status', async () => {
    const room = await insertRoom();
    const device = await insertDevice({ room_id: room.id });

    const res = await request(app).patch(`/api/devices/${device.id}`).send({ status: 'dim' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when moving to a room that does not exist, leaving the device unchanged', async () => {
    const kitchen = await insertRoom('Kitchen');
    const device = await insertDevice({ room_id: kitchen.id });

    const res = await request(app).patch(`/api/devices/${device.id}`).send({ roomId: 999 });

    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual([{ path: 'roomId', message: 'Room does not exist' }]);
    const row = await db
        .selectFrom('devices')
        .select('room_id')
        .where('id', '=', device.id)
        .executeTakeFirstOrThrow();
    expect(row.room_id).toBe(kitchen.id);
  });

  it('returns 400 for a non-numeric id', async () => {
    const res = await request(app).patch('/api/devices/abc').send({ status: 'on' });

    expect(res.status).toBe(400);
  });

  it('returns 404 for a device that does not exist', async () => {
    const res = await request(app).patch('/api/devices/999').send({ status: 'on' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('allows renaming to a name already used in the same room', async () => {
    const bedroom = await insertRoom('Bedroom');
    await insertDevice({ name: 'Lamp', room_id: bedroom.id });
    const other = await insertDevice({ name: 'Fan', room_id: bedroom.id });

    const res = await request(app).patch(`/api/devices/${other.id}`).send({ name: 'Lamp' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Lamp');
  });
});

describe('DELETE /api/devices/:id', () => {
  it('deletes the device and returns 204 with no body', async () => {
    const room = await insertRoom();
    const device = await insertDevice({ room_id: room.id });

    const res = await request(app).delete(`/api/devices/${device.id}`);

    expect(res.status).toBe(204);
    expect(res.text).toBe('');
  });

  it('removes only that device, and leaves its room in place', async () => {
    const room = await insertRoom();
    const keep = await insertDevice({ name: 'Keep me', room_id: room.id });
    const remove = await insertDevice({ name: 'Remove me', room_id: room.id });

    await request(app).delete(`/api/devices/${remove.id}`);

    expect(await db.selectFrom('devices').select('id').execute()).toEqual([{ id: keep.id }]);
    expect(await db.selectFrom('rooms').select('name').execute()).toEqual([{ name: 'Living room' }]);
  });

  it('returns 404 when fetching a deleted device', async () => {
    const room = await insertRoom();
    const device = await insertDevice({ room_id: room.id });
    await request(app).delete(`/api/devices/${device.id}`);

    const res = await request(app).get(`/api/devices/${device.id}`);

    expect(res.status).toBe(404);
  });

  it('returns 404 for a device that does not exist', async () => {
    const res = await request(app).delete('/api/devices/999');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 400 for a non-numeric id', async () => {
    const res = await request(app).delete('/api/devices/abc');

    expect(res.status).toBe(400);
  });
});