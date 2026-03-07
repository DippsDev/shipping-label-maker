# Supabase Database Setup

You already have Supabase configured! Now you just need to create the address table.

## Step 1: Initialize Database Tables

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `uksxeawgrtrvaoehlmjs`
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste this SQL:

```sql
-- Address table for storing user addresses
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

-- Create index for faster queries by userId
CREATE INDEX IF NOT EXISTS idx_address_userId ON address("userId");
```

6. Click **Run** (or press Ctrl+Enter)
7. Verify the table was created (you should see "Success" message)

## Step 2: Add Missing Environment Variables to Vercel

You already have all the Supabase variables! Just add these two for Better Auth:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:

```env
BETTER_AUTH_SECRET=<generate-with-npm-run-generate-secret>
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Step 3: Redeploy

1. Push your latest code changes:
```bash
git add .
git commit -m "Fix TypeScript errors for Supabase"
git push
```

2. Vercel will automatically redeploy

## That's It!

Your authentication and address book will now work on Vercel with Supabase! 🎉

## Verify It Works

1. Visit your deployed app
2. Sign up for a new account
3. Go to Addresses page
4. Add an address
5. Verify it saves and persists

## Check Data in Supabase

To view your saved addresses:
1. Supabase Dashboard → Table Editor
2. Select `address` table
3. You'll see all saved addresses
