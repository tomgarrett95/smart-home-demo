import { sql } from 'kysely';
import { db } from '../src/db/client';

// Call in beforeEach so every test starts from an empty table with IDs starting at 1
export async function resetDatabase(): Promise<void> {
  await sql`truncate table devices restart identity`.execute(db);
}
