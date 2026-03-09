# Supabase Database Setup Guide

This guide will help you set up Supabase as your database for the Label Maker app.

## Prerequisites

- Supabase account (free tier works great)
- Project already has Supabase configured

## Step 1: Get Your Supabase Credentials

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Create a new project (or use existing)
4. Go to **Project Settings** → **API**
5. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 2: Update Environment Variables

Create or update `.env.local` in the `website` folder:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Better Auth (if using)
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
```

## Step 3: Create Database Tables

Go to **SQL Editor** in your Supabase dashboard and run these queries:

### 1. Address Table
```sql
ye
```

### 2. Labels Table
```sql
CREATE TABLE IF NOT EXISTS labels (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  carrier TEXT NOT NULL,
  service TEXT NOT NULL,
  "trackingNumber" TEXT NOT NULL,
  "shipToName" TEXT NOT NULL,
  "shipToAddress" TEXT NOT NULL,
  "shipToCity" TEXT NOT NULL,
  "shipToState" TEXT NOT NULL,
  "shipToZip" TEXT NOT NULL,
  weight TEXT,
  "createdAt" BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_labels_userId ON labels("userId");
CREATE INDEX IF NOT EXISTS idx_labels_trackingNumber ON labels("trackingNumber");
```

### 3. Wallet Table
```sql
CREATE TABLE IF NOT EXISTS wallet (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  balance DECIMAL(10, 2) DEFAULT 100.00,
  "createdAt" BIGINT NOT NULL,
  "updatedAt" BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_wallet_userId ON wallet("userId");
```

### 4. Wallet Transactions Table
```sql
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  "createdAt" BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_userId ON wallet_transactions("userId");
```

## Step 4: Enable Row Level Security (RLS)

For each table, run these commands in SQL Editor:

```sql
-- Enable RLS
ALTER TABLE address ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies (allow users to access their own data)
CREATE POLICY "Users can view their own addresses" ON address
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert their own addresses" ON address
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can view their own labels" ON labels
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert their own labels" ON labels
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can view their own wallet" ON wallet
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can update their own wallet" ON wallet
  FOR ALL USING (auth.uid()::text = "userId");

CREATE POLICY "Users can view their own transactions" ON wallet_transactions
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert their own transactions" ON wallet_transactions
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");
```

## Step 5: Update API Routes

I'll create Supabase-compatible versions of the API routes. The code will:
- Use Supabase client for database operations
- Handle authentication properly
- Work with RLS policies

## Step 6: Restart Development Server

```bash
cd website
npm run dev
```

## Benefits of Using Supabase

✅ **Persistent Storage**: Data survives server restarts
✅ **Real-time Updates**: Built-in real-time subscriptions
✅ **Authentication**: Integrated auth system
✅ **Row Level Security**: Secure data access
✅ **Free Tier**: Generous free tier for development
✅ **Scalable**: Easy to scale as you grow
✅ **Dashboard**: Visual database management

## Testing

After setup:

1. Generate a label → Check Supabase dashboard → See new row in `labels` table
2. Save an address → Check `address` table
3. View dashboard → Stats pulled from Supabase
4. Restart server → Data persists!

## Troubleshooting

### SSL Certificate Error
If you see SSL errors, make sure your `.env.local` has the correct Supabase URL (should be `https://`).

### RLS Blocking Access
If data isn't showing up, check:
1. RLS policies are created
2. User is authenticated
3. `userId` matches `auth.uid()`

### Connection Issues
- Verify environment variables are set
- Restart dev server after changing `.env.local`
- Check Supabase project is active

## Migration from In-Memory

Current in-memory data will be lost when switching to Supabase. This is expected for development.

For production migration, you would:
1. Export data from in-memory
2. Import to Supabase tables
3. Switch API routes to Supabase

---

**Ready to switch?** Let me know and I'll update all the API routes to use Supabase!
