# Database Setup Instructions

## Required Packages

Before using the database, you need to install the following packages:

```bash
npm install pg drizzle-orm
npm install -D drizzle-kit @types/pg
```

## Environment Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update the `DATABASE_URL` in `.env.local` with your Neon PostgreSQL credentials:
   - Go to https://console.neon.tech/
   - Create a new project or use existing one
   - Copy the connection string
   - Replace the placeholder in `.env.local`

## Database Initialization

1. Run the schema SQL to create tables:
   ```bash
   # Using psql (PostgreSQL client)
   psql $DATABASE_URL -f schema.sql
   
   # Or using Neon's SQL editor in the console
   # Copy and paste the contents of schema.sql
   ```

2. Seed the database with initial data:
   ```bash
   # Using psql
   psql $DATABASE_URL -f seed.sql
   
   # Or using Neon's SQL editor
   # Copy and paste the contents of seed.sql
   ```

## Drizzle ORM Setup (Optional)

If you want to use Drizzle for migrations:

1. Create a `drizzle.config.ts` file:
   ```typescript
   import type { Config } from 'drizzle-kit';
   
   export default {
     schema: './src/lib/schema.ts',
     out: './drizzle',
     driver: 'pg',
     dbCredentials: {
       connectionString: process.env.DATABASE_URL!,
     },
   } satisfies Config;
   ```

2. Add these scripts to `package.json`:
   ```json
   {
     "scripts": {
       "db:generate": "drizzle-kit generate:pg",
       "db:push": "drizzle-kit push:pg",
       "db:studio": "drizzle-kit studio"
     }
   }
   ```

## Testing the Connection

You can test the database connection by creating a simple test file:

```typescript
// test-db.ts
import { testConnection } from './src/lib/db';

async function main() {
  const connected = await testConnection();
  if (connected) {
    console.log('Database connection successful!');
  } else {
    console.log('Database connection failed!');
  }
  process.exit(0);
}

main();
```

Run it with:
```bash
npx tsx test-db.ts
```

## Usage in Your Application

Import and use the database in your Next.js API routes or server components:

```typescript
import { db, query, queryOne } from '@/lib/db';
import { shows, listings } from '@/lib/schema';

// Using Drizzle ORM
const allShows = await db.select().from(shows);

// Using raw SQL
const showListings = await query(
  'SELECT * FROM listings WHERE show_id = $1 AND date >= CURRENT_DATE',
  [showId]
);
```