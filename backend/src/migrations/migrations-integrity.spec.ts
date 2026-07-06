import * as fs from 'fs';
import * as path from 'path';

/**
 * Guards the canonical migrations directory (this folder).
 *
 * Both the runtime DataSource (app.module.ts) and the TypeORM CLI DataSource
 * (database/data-source.ts) load migrations from this single directory, so the
 * ordered set they apply is identical. TypeORM orders migrations by the numeric
 * timestamp parsed from the migration class name; duplicate timestamps make that
 * order non-deterministic. These tests fail fast if a regression reintroduces a
 * collision or a filename/class-name timestamp mismatch.
 */
describe('migrations directory integrity', () => {
  const migrationsDir = __dirname;

  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((f) => /^\d+-.*\.ts$/.test(f) && !f.endsWith('.spec.ts'));

  it('contains migration files', () => {
    expect(migrationFiles.length).toBeGreaterThan(0);
  });

  it('has no duplicate filename timestamps', () => {
    const byTimestamp = new Map<string, string[]>();
    for (const file of migrationFiles) {
      const ts = file.match(/^(\d+)-/)![1];
      byTimestamp.set(ts, [...(byTimestamp.get(ts) ?? []), file]);
    }

    const duplicates = [...byTimestamp.entries()].filter(
      ([, files]) => files.length > 1,
    );

    expect(
      duplicates.map(([ts, files]) => `${ts}: ${files.join(', ')}`),
    ).toEqual([]);
  });

  it('keeps each class-name timestamp in sync with its filename timestamp', () => {
    const mismatches: string[] = [];
    for (const file of migrationFiles) {
      const fileTs = file.match(/^(\d+)-/)![1];
      const source = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      const classMatch = source.match(/export class\s+\w+?(\d{10,})\b/);
      if (!classMatch) {
        mismatches.push(`${file}: no timestamped exported class found`);
        continue;
      }
      if (classMatch[1] !== fileTs) {
        mismatches.push(
          `${file}: filename ts ${fileTs} !== class ts ${classMatch[1]}`,
        );
      }
    }
    expect(mismatches).toEqual([]);
  });

  it('exposes strictly increasing, unique timestamps when sorted', () => {
    const timestamps = migrationFiles
      .map((f) => Number(f.match(/^(\d+)-/)![1]))
      .sort((a, b) => a - b);
    for (let i = 1; i < timestamps.length; i += 1) {
      expect(timestamps[i]).toBeGreaterThan(timestamps[i - 1]);
    }
  });
});
