# Supabase Deployment Checklist ✅

You already have Supabase configured! Just follow these quick steps.

## ✅ Already Done

- [x] Supabase project created
- [x] All Supabase environment variables added to Vercel
- [x] Code updated to work with Supabase

## 🔧 Setup Steps (5 minutes)

### 1. Create Address Table in Supabase

- [ ] Go to https://supabase.com/dashboard
- [ ] Select project: `uksxeawgrtrvaoehlmjs`
- [ ] Click **SQL Editor** in left sidebar
- [ ] Click **New Query**
- [ ] Copy/paste from `scripts/setup-vercel-db.sql`
- [ ] Click **Run** (Ctrl+Enter)
- [ ] Verify "Success" message appears

### 2. Generate Auth Secret

- [ ] Run in terminal:
```bash
cd website
npm run generate-secret
```
- [ ] Copy the generated secret

### 3. Add Environment Variables to Vercel

- [ ] Go to Vercel Dashboard → Settings → Environment Variables
- [ ] Add `BETTER_AUTH_SECRET` (paste your generated secret)
- [ ] Add `NEXT_PUBLIC_APP_URL` (your Vercel URL)

### 4. Deploy

- [ ] Push your code:
```bash
git add .
git commit -m "Fix TypeScript errors for Supabase"
git push
```
- [ ] Vercel will auto-deploy

### 5. Test

- [ ] Visit your app URL
- [ ] Sign up for account
- [ ] Add an address
- [ ] Verify it saves

## 🎉 Done!

Your authentication and address book are now live with Supabase!

## View Your Data

Go to Supabase Dashboard → Table Editor → `address` table to see saved addresses.
