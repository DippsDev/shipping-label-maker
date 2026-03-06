# Deployment Steps - Authentication Fix

## Status
✅ Code changes committed and pushed to GitHub
⏳ Vercel deployment in progress

## What Was Done
1. ✅ Updated authentication to use Aurora PostgreSQL in production
2. ✅ Kept SQLite for local development
3. ✅ Updated all API routes to support both databases
4. ✅ Added AWS IAM authentication for secure database access
5. ✅ Committed and pushed changes to GitHub

## Next Steps

### Step 1: Wait for Vercel Deployment
Your changes are being deployed to Vercel. Check the deployment status:
- Go to: https://vercel.com/dashboard
- Select your project: `aws-label-maker`
- Wait for the deployment to complete (usually 2-3 minutes)

### Step 2: Create Database Tables
Once Vercel deployment is complete, create the database tables in Aurora PostgreSQL.

**Option A: Using AWS Console (Recommended)**
1. Go to AWS RDS Console: https://console.aws.amazon.com/rds/
2. Find your Aurora database: `rds-aws-label-maker-j04jjk0xikbb4opoAll`
3. Click "Query Editor" or use your preferred PostgreSQL client
4. Run this SQL:

```sql
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

**Option B: Using Node.js Script (If you have local database access)**
```bash
cd website
PGHOST=your-host PGUSER=your-user PGDATABASE=your-db PGPASSWORD=your-password node scripts/setup-db.js
```

### Step 3: Verify Environment Variables in Vercel
Make sure these are set in your Vercel project settings:

**Database Variables (should already be set):**
- ✅ AWS_ACCOUNT_ID
- ✅ AWS_REGION
- ✅ AWS_RESOURCE_ARN
- ✅ AWS_ROLE_ARN
- ✅ PGDATABASE
- ✅ PGHOST
- ✅ PGPORT
- ✅ PGSSLMODE
- ✅ PGUSER

**Authentication Variables:**
- ✅ BETTER_AUTH_SECRET = `edee4ce81d569070ae783353181fa33350d8c6756ed66ea018175d64ef6a5d7d`
- ✅ NEXT_PUBLIC_APP_URL = `https://website-beta-pearl-26.vercel.app`

### Step 4: Test Authentication
1. Visit: https://website-beta-pearl-26.vercel.app
2. Click "Sign Up"
3. Create a new account with an email
4. Log in with your credentials
5. Verify that authentication works

## Troubleshooting

### "Unauthorized" Error
- Make sure `BETTER_AUTH_SECRET` is set in Vercel
- Make sure `NEXT_PUBLIC_APP_URL` matches your Vercel URL
- Check Vercel logs: `vercel logs`

### Database Connection Error
- Verify all `PG*` environment variables are set
- Verify AWS IAM role has database access
- Check that address table was created

### Build Failed
- Check Vercel deployment logs
- Ensure all dependencies installed correctly
- Verify TypeScript has no errors

## Files Changed
- `lib/auth.ts` - Updated to use PostgreSQL in production
- `lib/db.ts` - PostgreSQL connection setup
- `app/api/addresses/route.ts` - Dual database support
- `app/api/addresses/[id]/route.ts` - Dual database support
- `package.json` - Added PostgreSQL dependencies

## Local Development
Still works the same:
```bash
npm run dev
```
Uses SQLite automatically.

## Support
- See `QUICK_START_FIX.md` for quick reference
- See `AURORA_DEPLOYMENT.md` for detailed guide
- Check Vercel logs for deployment issues
