# Database Migrations

This directory contains SQL migration files for the WidgetNite database.

## Running Migrations

To run the Clash Royale challenge migration, execute the following SQL against your PostgreSQL database:

### Using psql command line:
```bash
psql $DATABASE_URL -f migrations/002_create_clash_royale_challenges.sql
```

### Using a database client:
Open `migrations/002_create_clash_royale_challenges.sql` and execute the SQL statements in your database client.

### Using Node.js script:
You can also create a simple migration script:

```javascript
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : false,
  });

  const sql = fs.readFileSync(
    path.join(__dirname, '002_create_clash_royale_challenges.sql'),
    'utf8'
  );

  try {
    await pool.query(sql);
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
```

## Migration Files

- `002_create_clash_royale_challenges.sql` - Creates the clash_royale_challenges table with necessary columns and indexes

## Table Schema

The `clash_royale_challenges` table includes:
- `id` - UUID primary key
- `user_id` - Foreign key to users table
- `name` - Challenge name
- `win_goal` - Number of wins needed to complete the challenge
- `max_losses` - Maximum allowed losses before attempt ends
- `current_wins` - Current win count in active attempt
- `current_losses` - Current loss count in active attempt
- `best_wins` - Best win count across all attempts
- `best_losses` - Loss count of the best attempt
- `total_attempts` - Total number of attempts made
- `is_active` - Whether the challenge is active
- `created_at` - Timestamp of creation
- `updated_at` - Timestamp of last update

