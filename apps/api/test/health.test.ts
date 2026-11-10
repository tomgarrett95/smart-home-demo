import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { db } from '../src/db/client';
import { resetDatabase } from './helpers';

// Wiring checks: if these pass, the test database is reachable, migrated and resettable
describe('test setup', () => {
  beforeEach(resetDatabase);

  it('GET /api/health reports ok', async () => {
    const res = await request(createApp()).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('starts each test with an empty, migrated devices table', async () => {
    const rows = await db.selectFrom('devices').selectAll().execute();

    expect(rows).toEqual([]);
  });
});
