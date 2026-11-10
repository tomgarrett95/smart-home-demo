import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Kysely } from 'kysely';
import { type Migration, type MigrationProvider, Migrator } from 'kysely/migration';

// The same folder kysely-ctl reads from, so the CLI and the tests apply identical migrations
const MIGRATIONS_DIR = fileURLToPath(new URL('../../migrations', import.meta.url));

// Imports the migration files from our own code, so whatever is running it (tsx, Vitest)
// handles the TypeScript. Keys are file names without the extension, matching kysely-ctl.
class LocalMigrationProvider implements MigrationProvider {
  async getMigrations(): Promise<Record<string, Migration>> {
    const files = (await fs.readdir(MIGRATIONS_DIR))
      .filter((file) => /\.(ts|js)$/.test(file) && !file.endsWith('.d.ts'))
      .sort();

    const migrations: Record<string, Migration> = {};
    for (const file of files) {
      migrations[path.parse(file).name] = await import(path.join(MIGRATIONS_DIR, file));
    }
    return migrations;
  }
}

export async function migrateToLatest(db: Kysely<any>): Promise<void> {
  const migrator = new Migrator({ db, provider: new LocalMigrationProvider() });
  const { error, results } = await migrator.migrateToLatest();

  for (const result of results ?? []) {
    if (result.status === 'Error') console.error(`Migration failed: ${result.migrationName}`);
  }

  if (error) throw error;
}
