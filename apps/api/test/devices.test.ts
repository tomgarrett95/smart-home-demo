import { DeviceSchema } from '@devices/shared';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { db } from '../src/db/client';
import { insertDevice, resetDatabase } from './helpers';

const app = createApp();

beforeEach(resetDatabase);

describe('POST /api/devices', () => {
  it('creates a device and returns it with 201', async () => {
    const res = await request(app)
      .post('/api/devices')
      .send({ deviceType: 'plug', name: 'Kettle', room: 'Kitchen', status: 'on' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: 1,
      deviceType: 'plug',
      name: 'Kettle',
      room: 'Kitchen',
      status: 'on',
    });
    expect(() => DeviceSchema.parse(res.body)).not.toThrow();
  });

  it('saves the device to the database', async () => {
    await request(app)
      .post('/api/devices')
      .send({ deviceType: 'plug', name: 'Kettle', room: 'Kitchen' });

    const rows = await db.selectFrom('devices').selectAll().execute();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ device_type: 'plug', name: 'Kettle', room: 'Kitchen' });
  });

  it('defaults status to off when not provided', async () => {
    const res = await request(app)
      .post('/api/devices')
      .send({ deviceType: 'light', name: 'Lamp', room: 'Bedroom' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('off');
  });

  it('trims whitespace from name and room', async () => {
    const res = await request(app)
      .post('/api/devices')
      .send({ deviceType: 'light', name: '  Lamp  ', room: ' Bedroom ' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Lamp', room: 'Bedroom' });
  });

  it.each([
    ['an invalid deviceType', { deviceType: 'toaster', name: 'Lamp', room: 'Bedroom' }, 'deviceType'],
    ['a missing name', { deviceType: 'light', room: 'Bedroom' }, 'name'],
    ['a blank name', { deviceType: 'light', name: '   ', room: 'Bedroom' }, 'name'],
    ['a missing room', { deviceType: 'light', name: 'Lamp' }, 'room'],
    ['an invalid status', { deviceType: 'light', name: 'Lamp', room: 'Bedroom', status: 'dim' }, 'status'],
  ])('returns 400 for %s', async (_label, body, field) => {
    const res = await request(app).post('/api/devices').send(body);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: field })]),
    );
  });

  it('returns 400 for unknown fields', async () => {
    const res = await request(app)
      .post('/api/devices')
      .send({ deviceType: 'light', name: 'Lamp', room: 'Bedroom', brightness: 80 });

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

  it('allows the same name in a different room', async () => {
    await insertDevice({ name: 'Lamp', room: 'Bedroom' });

    const res = await request(app)
      .post('/api/devices')
      .send({ deviceType: 'light', name: 'Lamp', room: 'Office' });

    expect(res.status).toBe(201);
  });
});

describe('PATCH /api/devices/:id', () => {
  it('updates status only, leaving the other fields unchanged', async () => {
    const device = await insertDevice({ name: 'Kettle', room: 'Kitchen', status: 'off' });

    const res = await request(app).patch(`/api/devices/${device.id}`).send({ status: 'on' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: device.id,
      deviceType: 'light',
      name: 'Kettle',
      room: 'Kitchen',
      status: 'on',
    });
  });

  // Starts with status 'on' (not the default), so a bug that resets unsent fields can't hide
  it('updates name only, leaving status and room unchanged', async () => {
    const device = await insertDevice({ name: 'Kettle', room: 'Kitchen', status: 'on' });

    const res = await request(app).patch(`/api/devices/${device.id}`).send({ name: 'Toaster' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: 'Toaster', room: 'Kitchen', status: 'on' });
  });

  it('updates name and room, trimming whitespace', async () => {
    const device = await insertDevice();

    const res = await request(app)
      .patch(`/api/devices/${device.id}`)
      .send({ name: ' Desk lamp ', room: ' Office ' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: 'Desk lamp', room: 'Office' });
  });

  it('changes updatedAt but not createdAt', async () => {
    const device = await insertDevice();

    const res = await request(app).patch(`/api/devices/${device.id}`).send({ status: 'on' });

    expect(res.body.createdAt).toBe(device.created_at.toISOString());
    expect(res.body.updatedAt).not.toBe(device.updated_at.toISOString());
  });

  it('saves the change to the database', async () => {
    const device = await insertDevice({ status: 'off' });

    await request(app).patch(`/api/devices/${device.id}`).send({ status: 'on' });

    const row = await db
      .selectFrom('devices')
      .select('status')
      .where('id', '=', device.id)
      .executeTakeFirstOrThrow();
    expect(row.status).toBe('on');
  });

  it('returns 400 for an empty body', async () => {
    const device = await insertDevice();

    const res = await request(app).patch(`/api/devices/${device.id}`).send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when trying to change deviceType', async () => {
    const device = await insertDevice({ device_type: 'light' });

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
    const device = await insertDevice();

    const res = await request(app).patch(`/api/devices/${device.id}`).send({ status: 'dim' });

    expect(res.status).toBe(400);
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

  it('returns 409 when renaming to a name already used in the same room', async () => {
    await insertDevice({ name: 'Lamp', room: 'Bedroom' });
    const other = await insertDevice({ name: 'Fan', room: 'Bedroom' });

    const res = await request(app).patch(`/api/devices/${other.id}`).send({ name: 'Lamp' });

    expect(res.status).toBe(409);
  });
});

describe('DELETE /api/devices/:id', () => {
  it('deletes the device and returns 204 with no body', async () => {
    const device = await insertDevice();

    const res = await request(app).delete(`/api/devices/${device.id}`);

    expect(res.status).toBe(204);
    expect(res.text).toBe('');
  });

  it('removes only that device', async () => {
    const keep = await insertDevice({ name: 'Keep me' });
    const remove = await insertDevice({ name: 'Remove me' });

    await request(app).delete(`/api/devices/${remove.id}`);

    const rows = await db.selectFrom('devices').select('id').execute();
    expect(rows).toEqual([{ id: keep.id }]);
  });

  it('returns 404 when fetching a deleted device', async () => {
    const device = await insertDevice();
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
