import { schemaMigrations, createTable, addColumns, unsafeExecuteSql } from '@nozbe/watermelondb/Schema/migrations'

// Helper function to simplify dropping columns if needed, as WatermelonDB doesn't have a direct 'dropColumns'
// This uses raw SQL and might need adjustment based on the specific SQLite version/features.
const dropColumns = (table, columns) => {
  // NOTE: SQLite has limited ALTER TABLE support. Dropping columns often requires
  // creating a new table, copying data, dropping the old table, and renaming the new one.
  // For simplicity here, we might use PRAGMA or assume newer SQLite features.
  // This is a placeholder and might need a more robust implementation for production.
  console.warn(`Dropping columns (${columns.join(', ')}) from ${table} using potentially unsafe/simplified migration.`);
  // A simple (often unsupported) attempt:
  // return columns.map(column => `ALTER TABLE ${table} DROP COLUMN ${column};`).join('');

  // A more compatible approach involves recreating the table, which is complex for a migration step.
  // Returning an empty SQL or a comment to indicate manual step might be safer.
  return `-- Manually drop columns ${columns.join(', ')} from table ${table}`;
}


export default schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: 'sessions',
          columns: [
            // Note: The previous migration added 'sessionId'. This migration (v3) will remove it.
            // Keeping the v2 migration definition is standard practice.
            { name: 'sessionId', type: 'string', isIndexed: true },
          ],
        }),
      ],
    },
    {
      toVersion: 3,
      steps: [
        // WatermelonDB v0.23+ provides `removeColumns`
        // If using older version, uncomment and adapt the raw SQL approach:
        // unsafeExecuteSql(dropColumns('sessions', ['sessionId']))

        // Using removeColumns (preferred if available):
         {
           $migration: true, // Indicates this is a migration step object
           type: 'remove_columns',
           table: 'sessions',
           columns: ['sessionId'],
         }
      ],
    },
    {
      toVersion: 4,
      steps: [
        addColumns({
          table: 'sessions',
          columns: [
            // Note: The previous migration added 'sessionId'. This migration (v3) will remove it.
            // Keeping the v2 migration definition is standard practice.
            { name: 'stoppedAt', type: 'number', isIndexed: true },
          ],
        }),
      ],
    },
    {
      toVersion: 5,
      steps: [
        // Add new columns to sessions table
        addColumns({
          table: 'sessions',
          columns: [
            { name: 'timeLimit', type: 'number', isOptional: true },
            { name: 'timeInterval', type: 'number', isOptional: true },
          ],
        }),
      ],
    }
  ],
})