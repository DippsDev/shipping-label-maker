# Quick Deploy to Vercel - TL;DR

## 🚀 Fastest Way (5 minutes)

### Step 1: Push to GitHub
```bash
cd website
git add .
git commit -m "Ready for deployment"
git push origin master
```

### Step 2: Deploy on Vercel
1. Go to https://vercel.com/new
2. Click "Import" your GitHub repository
3. Set Root Directory: `website`
4. Add these environment variables:
   - `BETTER_AUTH_SECRET` = `edee4ce81d569070ae783353181fa33350d8c6756ed66ea018175d64ef6a5d7d`
   - `NEXT_PUBLIC_APP_URL` = `https://your-project.vercel.app` (update after deployment)
5. Click "Deploy"

### Step 3: Update the URL
After deployment:
1. Copy your Vercel URL (e.g., `https://label-maker-xyz.vercel.app`)
2. Go to Settings → Environment Variables
3. Update `NEXT_PUBLIC_APP_URL` with your actual URL
4. Redeploy

## ⚠️ IMPORTANT: Database Issue

Your app uses SQLite which **won't work on Vercel**. You need to:

1. **Quick Fix (Testing Only)**: Deploy as-is to see the UI, but auth won't work
2. **Production Fix**: Migrate to Vercel Postgres or Turso

### Migrate to Vercel Postgres (Recommended)
```bash
vercel postgres create
```

Then update `website/lib/auth.ts` to use Postgres instead of SQLite.

## 📝 Environment Variables Needed

**Required:**
- `BETTER_AUTH_SECRET` - Already set in .env.local
- `NEXT_PUBLIC_APP_URL` - Your Vercel deployment URL

**Optional (for OAuth):**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Deploy New Project: https://vercel.com/new
- Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres

## 💡 Pro Tips

- Every push to `master` auto-deploys
- Pull requests create preview URLs
- Free tier includes: 100GB bandwidth, unlimited projects
- Add custom domain in project settings

## Need detailed instructions?
See `DEPLOYMENT_GUIDE.md` for the complete guide.
