# Deployment Checklist ✅

Follow these steps to fix authentication on Vercel:

## 1. Install Dependencies
```bash
cd website
npm install
```

## 2. Create Database Tables

Choose one method:

### Method A: AWS Console (Easiest)
1. Go to AWS RDS Console
2. Connect to your Aurora database
3. Copy and run the SQL from `scripts/schema.sql`

### Method B: Migration Script
```bash
# Pull Vercel environment variables
vercel env pull

# Run migration
npm run migrate
```

## 3. Verify Vercel Environment Variables

Check these are set in your Vercel project settings:

**Database (should already be set):**
- ✅ AWS_ACCOUNT_ID
- ✅ AWS_REGION  
- ✅ AWS_RESOURCE_ARN
- ✅ AWS_ROLE_ARN
- ✅ PGDATABASE
- ✅ PGHOST
- ✅ PGPORT
- ✅ PGSSLMODE
- ✅ PGUSER

**Authentication:**
- ✅ BETTER_AUTH_SECRET
- ✅ NEXT_PUBLIC_APP_URL (must be your Vercel URL: `https://website-beta-pearl-26.vercel.app`)

## 4. Deploy
```bash
git add .
git commit -m "Fix authentication with Aurora PostgreSQL"
git push origin master
```

## 5. Test
1. Visit: https://website-beta-pearl-26.vercel.app
2. Try signing up
3. Try logging in
4. Verify authentication works

## What Was Fixed

- ✅ Added PostgreSQL support for production
- ✅ Kept SQLite for local development
- ✅ Updated auth configuration
- ✅ Updated API routes to support both databases
- ✅ Added AWS IAM authentication for Aurora

## Need Help?

See `AURORA_DEPLOYMENT.md` for detailed instructions.
