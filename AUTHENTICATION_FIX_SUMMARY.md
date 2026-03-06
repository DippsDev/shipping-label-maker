# Authentication Fix Summary

## Problem
Authentication was not working on Vercel deployment because the app was using SQLite, a file-based database that doesn't work in serverless environments.

## Solution
Updated the app to use Aurora PostgreSQL in production (Vercel) while keeping SQLite for local development.

## Files Changed

### New Files
1. **lib/db.ts** - PostgreSQL connection with AWS IAM authentication
2. **scripts/migrate-postgres.ts** - Database migration script
3. **scripts/schema.sql** - SQL schema for manual migration
4. **AURORA_DEPLOYMENT.md** - Detailed deployment guide
5. **DEPLOY_CHECKLIST.md** - Quick deployment checklist

### Modified Files
1. **lib/auth.ts** - Updated to support both PostgreSQL and SQLite
2. **app/api/addresses/route.ts** - Updated GET and POST to support both databases
3. **app/api/addresses/[id]/route.ts** - Updated PATCH and DELETE to support both databases
4. **package.json** - Added PostgreSQL dependencies

## Dependencies Added
- `pg` - PostgreSQL client
- `@aws-sdk/rds-signer` - AWS RDS IAM authentication
- `@vercel/functions` - Vercel OIDC integration
- `@types/pg` - TypeScript types for pg
- `tsx` - TypeScript execution for migration scripts

## How It Works

### Local Development
- Uses SQLite (`db.sqlite`)
- No configuration needed
- Fast and simple

### Production (Vercel)
- Uses Aurora PostgreSQL
- Authenticates via AWS IAM (no password in code)
- Automatically detects environment and switches database

## Deployment Steps

1. **Install dependencies**
   ```bash
   cd website
   npm install
   ```

2. **Create database tables**
   
   Option A - AWS Console:
   - Run SQL from `scripts/schema.sql`
   
   Option B - Migration script:
   ```bash
   vercel env pull
   npm run migrate
   ```

3. **Verify environment variables in Vercel**
   - Database vars (already set from Aurora setup)
   - `BETTER_AUTH_SECRET`
   - `NEXT_PUBLIC_APP_URL` = `https://website-beta-pearl-26.vercel.app`

4. **Deploy**
   ```bash
   git add .
   git commit -m "Fix authentication with Aurora PostgreSQL"
   git push origin master
   ```

5. **Test**
   - Visit https://website-beta-pearl-26.vercel.app
   - Sign up and log in

## Key Features

✅ Dual database support (PostgreSQL + SQLite)
✅ Automatic environment detection
✅ AWS IAM authentication (secure, no passwords)
✅ Better Auth integration
✅ All API routes updated
✅ Migration scripts included

## Testing Locally

Your local development still works exactly the same:
```bash
cd website
npm run dev
```

SQLite will be used automatically.

## Next Steps

After deployment:
1. Test authentication on Vercel
2. (Optional) Configure OAuth providers with Vercel URLs
3. Monitor Vercel logs for any issues

## Support

- See `AURORA_DEPLOYMENT.md` for detailed instructions
- See `DEPLOY_CHECKLIST.md` for quick reference
- Check Vercel logs: `vercel logs`
