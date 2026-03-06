# Fixing Authentication on Vercel

## The Problem
Your authentication isn't working on Vercel because SQLite (file-based database) doesn't work in serverless environments.

## Quick Fix Options

### Option 1: Vercel Postgres (Recommended - 10 minutes)

1. **Create Vercel Postgres Database**
   ```bash
   # Install Vercel CLI if you haven't
   npm install -g vercel
   
   # Login to Vercel
   vercel login
   
   # Link your project
   cd website
   vercel link
   
   # Create Postgres database
   vercel postgres create
   ```

2. **Install Postgres Dependencies**
   ```bash
   npm install @vercel/postgres pg
   npm install --save-dev @types/pg
   ```

3. **Update auth.ts to use Postgres**
   
   Replace `website/lib/auth.ts` with:
   ```typescript
   import { betterAuth } from "better-auth";
   import { Pool } from "@vercel/postgres";
   import { kyselyAdapter } from "@better-auth/kysely-adapter";
   import { Kysely, SqliteDialect, PostgresDialect } from "kysely";
   import Database from "better-sqlite3";

   const getDatabase = () => {
     if (process.env.POSTGRES_URL) {
       // Production: Use Vercel Postgres
       const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
       const db = new Kysely({
         dialect: new PostgresDialect({ pool }),
       });
       return kyselyAdapter(db);
     } else {
       // Development: Use SQLite
       const db = new Kysely({
         dialect: new SqliteDialect({
           database: new Database("./db.sqlite"),
         }),
       });
       return kyselyAdapter(db);
     }
   };

   export const auth = betterAuth({
     database: getDatabase(),
     emailAndPassword: {
       enabled: true,
     },
     socialProviders: {
       google: {
         clientId: process.env.GOOGLE_CLIENT_ID || "",
         clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
       },
       github: {
         clientId: process.env.GITHUB_CLIENT_ID || "",
         clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
       },
     },
   });
   ```

4. **Update package.json**
   Add to dependencies:
   ```json
   "@vercel/postgres": "^0.10.0",
   "pg": "^8.13.1"
   ```
   
   Add to devDependencies:
   ```json
   "@types/pg": "^8.11.10"
   ```

5. **Run migrations**
   Better Auth will auto-create tables on first run, but you can also run:
   ```bash
   # The database will be initialized automatically when you deploy
   ```

6. **Deploy**
   ```bash
   git add .
   git commit -m "Add Postgres support for Vercel"
   git push origin master
   ```
   
   Vercel will automatically set the `POSTGRES_URL` environment variable.

### Option 2: Turso (SQLite-compatible, 15 minutes)

1. **Sign up for Turso**
   - Go to https://turso.tech
   - Create a free account
   - Create a new database

2. **Install Turso SDK**
   ```bash
   npm install @libsql/client
   ```

3. **Get your database URL and token**
   ```bash
   turso db show <your-db-name>
   ```

4. **Add to Vercel environment variables**
   - `TURSO_DATABASE_URL` = your database URL
   - `TURSO_AUTH_TOKEN` = your auth token

5. **Update auth.ts**
   ```typescript
   import { betterAuth } from "better-auth";
   import { createClient } from "@libsql/client";
   import { kyselyAdapter } from "@better-auth/kysely-adapter";
   import { Kysely, SqliteDialect } from "kysely";
   import Database from "better-sqlite3";

   const getDatabase = () => {
     if (process.env.TURSO_DATABASE_URL) {
       // Production: Use Turso
       const client = createClient({
         url: process.env.TURSO_DATABASE_URL,
         authToken: process.env.TURSO_AUTH_TOKEN,
       });
       const db = new Kysely({
         dialect: new SqliteDialect({ database: client as any }),
       });
       return kyselyAdapter(db);
     } else {
       // Development: Use SQLite
       const db = new Kysely({
         dialect: new SqliteDialect({
           database: new Database("./db.sqlite"),
         }),
       });
       return kyselyAdapter(db);
     }
   };

   export const auth = betterAuth({
     database: getDatabase(),
     emailAndPassword: {
       enabled: true,
     },
     socialProviders: {
       google: {
         clientId: process.env.GOOGLE_CLIENT_ID || "",
         clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
       },
       github: {
         clientId: process.env.GITHUB_CLIENT_ID || "",
         clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
       },
     },
   });
   ```

### Option 3: PlanetScale (MySQL, 15 minutes)

Similar to Postgres but uses MySQL. Good if you prefer MySQL.

## Recommended: Vercel Postgres

I recommend Option 1 (Vercel Postgres) because:
- ✅ Integrated with Vercel (automatic env vars)
- ✅ Free tier available
- ✅ Easy setup with CLI
- ✅ Good performance
- ✅ Automatic backups

## After Fixing

Once you've migrated to a production database:

1. **Test locally** with your new database
2. **Deploy to Vercel**
3. **Verify authentication works** at https://website-beta-pearl-26.vercel.app/

## Need Help?

If you run into issues:
- Check Vercel logs: `vercel logs`
- Check environment variables are set correctly
- Ensure database connection string is correct
- Verify Better Auth tables were created

## Quick Command Reference

```bash
# Install Vercel CLI
npm install -g vercel

# Create Postgres database
vercel postgres create

# Check environment variables
vercel env ls

# View logs
vercel logs

# Redeploy
vercel --prod
```
