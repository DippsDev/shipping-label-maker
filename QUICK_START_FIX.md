# Quick Start - Fix Authentication on Vercel

## What's Fixed
Your app now uses Aurora PostgreSQL on Vercel and SQLite locally. Authentication will work correctly.

## 3 Steps to Deploy

### 1. Install Dependencies
```bash
cd website
npm install
```

### 2. Create Database Tables
Run this SQL in AWS Console (RDS Query Editor):

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

### 3. Deploy
```bash
git add .
git commit -m "Fix authentication with Aurora PostgreSQL"
git push origin master
```

## Verify It Works
1. Go to https://website-beta-pearl-26.vercel.app
2. Sign up with an email
3. Log in
4. Authentication should work!

## Environment Variables
Make sure these are set in Vercel (they should already be there):
- `BETTER_AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL` = `https://website-beta-pearl-26.vercel.app`
- All `PG*` and `AWS_*` variables (from Aurora setup)

## Local Development
Still works the same:
```bash
npm run dev
```
Uses SQLite automatically.

## Need More Details?
See `AURORA_DEPLOYMENT.md` for complete instructions.
