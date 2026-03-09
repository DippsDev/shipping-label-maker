# Database Setup for Label Tracking

To enable dashboard stats tracking, you need to create the `labels` table in your database.

## Option 1: Using Vercel Postgres Dashboard

1. Go to your Vercel project dashboard
2. Navigate to **Storage** → Your Postgres database
3. Click on **Query** tab
4. Copy and paste the SQL from `scripts/labels-schema.sql`
5. Click **Run Query**

## Option 2: Using Local SQLite (Development)

If you're using SQLite for local development, run:

```bash
sqlite3 website/db.sqlite < website/scripts/labels-schema.sql
```

## SQL Schema

```sql
-- Labels table for tracking generated labels
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

## What This Enables

Once the table is created:

✅ **Dashboard Stats**: Real-time label count on dashboard
✅ **Label History**: Track all generated labels
✅ **User Analytics**: See how many labels each user generates

## Testing

After creating the table:

1. Generate a label on the Create Label page
2. Go to the Dashboard
3. You should see "Total Labels" increase from 0 to 1

The "Saved Addresses" stat already works with the existing `address` table.
