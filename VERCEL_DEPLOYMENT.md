# Vercel Deployment Guide

This guide will help you deploy your Label Maker web app to Vercel with authentication and address book storage.

## Prerequisites

- A Vercel account (sign up at https://vercel.com)
- Your project pushed to GitHub, GitLab, or Bitbucket

## Step-by-Step Deployment

### 1. Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your repository
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `website`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
4. Click "Deploy" (it will fail initially - that's expected!)

### 2. Add Vercel Postgres Database

1. In your Vercel project dashboard, go to the **Storage** tab
2. Click **Create Database**
3. Select **Postgres**
4. Choose a database name (e.g., `label-maker-db`)
5. Select a region (choose closest to your users)
6. Click **Create**

**Important**: Vercel will automatically add these environment variables to your project:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### 3. Initialize Database Tables

After creating the database:

1. In Vercel dashboard, go to **Storage** → Your Postgres database
2. Click on the **Query** tab
3. Copy and paste the contents of `scripts/setup-vercel-db.sql`
4. Click **Run Query**
5. Verify the tables were created (you should see `address` table listed)

### 4. Configure Environment Variables

1. In your Vercel project, go to **Settings** → **Environment Variables**
2. Add the following variables:

```env
# Better Auth Secret (generate a new one for production)
BETTER_AUTH_SECRET=<generate-a-random-32-character-string>

# App URL (replace with your actual Vercel URL)
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

**To generate BETTER_AUTH_SECRET:**
```bash
# Run this in your terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Redeploy

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

### 6. Test Your Deployment

1. Visit your app at `https://your-app-name.vercel.app`
2. Try signing up for a new account
3. Test adding an address to the address book
4. Verify everything works!

## Optional: Custom Domain

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow Vercel's instructions to configure DNS
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain

## Troubleshooting

### Authentication Not Working
- Verify `BETTER_AUTH_SECRET` is set
- Check `NEXT_PUBLIC_APP_URL` matches your actual URL
- Check browser console for errors

### Database Connection Errors
- Verify Postgres database is created in Vercel
- Check that `POSTGRES_URL` environment variable exists
- Verify tables were created using the SQL script

### Address Book Not Saving
- Check database tables exist (run setup SQL script)
- Verify user is authenticated
- Check Vercel function logs for errors

## Local Development

Your local development will continue to use SQLite (`db.sqlite`). This is automatic - no configuration needed!

## Database Management

To view/manage your production database:
1. Go to Vercel dashboard → **Storage** → Your database
2. Use the **Query** tab to run SQL queries
3. Use the **Data** tab to browse tables

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres
- Better Auth: https://www.better-auth.com/docs
