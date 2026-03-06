# Deploying with Aurora PostgreSQL

## What Changed

Your app now uses Aurora PostgreSQL in production (on Vercel) and SQLite in development. The authentication will work correctly on Vercel.

## Steps to Deploy

### 1. Install Dependencies

```bash
cd website
npm install
```

This will install:
- `pg` - PostgreSQL client
- `@aws-sdk/rds-signer` - AWS RDS IAM authentication
- `@vercel/functions` - Vercel OIDC integration

### 2. Verify Environment Variables in Vercel

Make sure these are set in your Vercel project (they should already be there from your Aurora setup):

- `AWS_ACCOUNT_ID`
- `AWS_REGION`
- `AWS_RESOURCE_ARN`
- `AWS_ROLE_ARN`
- `PGDATABASE`
- `PGHOST`
- `PGPORT`
- `PGSSLMODE`
- `PGUSER`

Also ensure these auth variables are set:
- `BETTER_AUTH_SECRET` - Your auth secret key
- `NEXT_PUBLIC_APP_URL` - Your Vercel deployment URL (e.g., `https://website-beta-pearl-26.vercel.app`)

### 3. Run Database Migration

You need to create the tables in your Aurora PostgreSQL database. You can do this in two ways:

#### Option A: Using AWS Console

1. Go to AWS RDS Console
2. Connect to your Aurora database
3. Run this SQL:

```sql
-- Better Auth will create its own tables automatically
-- Create the address table
CREATE TABLE IF NOT EXISTS address (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  "addressLine1" TEXT NOT NULL,
  "addressLine2" TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  "zipCode" TEXT NOT NULL,
  country TEXT NOT NULL,
  "isSaved" BOOLEAN DEFAULT true,
  "lastUsed" BIGINT NOT NULL,
  "usageCount" INTEGER DEFAULT 1,
  "createdAt" BIGINT NOT NULL,
  "updatedAt" BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_address_userId ON address("userId");
```

#### Option B: Using Migration Script (Recommended)

```bash
# Pull environment variables from Vercel
vercel env pull

# Run migration
npx tsx scripts/migrate-postgres.ts
```

### 4. Deploy to Vercel

```bash
git add .
git commit -m "Add Aurora PostgreSQL support"
git push origin master
```

Vercel will automatically deploy your changes.

### 5. Test Authentication

1. Go to your Vercel URL: `https://website-beta-pearl-26.vercel.app`
2. Try to sign up with a new account
3. Try to log in
4. Verify that authentication works correctly

## How It Works

### Development (Local)
- Uses SQLite (`db.sqlite`)
- No AWS credentials needed
- Fast and simple for local development

### Production (Vercel)
- Uses Aurora PostgreSQL
- Authenticates via AWS IAM (no password needed)
- Secure and scalable

### Code Changes Made

1. **lib/db.ts** - New file for PostgreSQL connection with AWS IAM auth
2. **lib/auth.ts** - Updated to use PostgreSQL in production, SQLite in dev
3. **app/api/addresses/route.ts** - Updated to support both databases
4. **package.json** - Added PostgreSQL dependencies

## Troubleshooting

### "Database pool not available" error

Make sure all environment variables are set in Vercel:
```bash
vercel env ls
```

### Authentication still not working

1. Check Vercel logs:
   ```bash
   vercel logs
   ```

2. Verify `NEXT_PUBLIC_APP_URL` matches your actual Vercel URL

3. Make sure Better Auth tables were created (they auto-create on first auth attempt)

### Tables not created

Run the migration script or manually create tables using AWS Console.

### Local development not working

Make sure you're in the `website` directory and `db.sqlite` exists. If not:
```bash
cd website
npm run dev
```

The SQLite database will be created automatically.

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Run database migration
3. ✅ Test authentication
4. Configure OAuth providers (optional):
   - Update Google OAuth redirect URI to your Vercel URL
   - Update GitHub OAuth callback URL to your Vercel URL

## Support

If you encounter issues:
- Check Vercel deployment logs
- Verify all environment variables are set
- Ensure Aurora database is accessible
- Check AWS IAM role permissions
