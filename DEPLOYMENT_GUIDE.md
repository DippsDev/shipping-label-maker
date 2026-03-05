# Deploying to Vercel - Step by Step Guide

## Prerequisites
- A [Vercel account](https://vercel.com/signup) (free tier works fine)
- [Vercel CLI](https://vercel.com/docs/cli) installed (optional but recommended)
- Git repository with your code

## Important: Database Consideration

⚠️ **Your app currently uses SQLite (`db.sqlite`)** which is a file-based database. This won't work on Vercel's serverless environment because:
- Files are read-only in production
- Each serverless function runs in isolation
- Database changes won't persist between deployments

### Recommended Solutions:
1. **Vercel Postgres** (Recommended) - Managed PostgreSQL database
2. **Turso** - Serverless SQLite alternative
3. **PlanetScale** - MySQL-compatible serverless database
4. **Supabase** - PostgreSQL with additional features

For now, I'll show you how to deploy, but you'll need to migrate to a production database.

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin master
   ```

2. **Go to [Vercel Dashboard](https://vercel.com/new)**

3. **Import your repository**
   - Click "Add New" → "Project"
   - Select your GitHub repository
   - Vercel will auto-detect it's a Next.js project

4. **Configure the project**
   - Framework Preset: `Next.js`
   - Root Directory: `website`
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. **Add Environment Variables**
   Click "Environment Variables" and add:
   
   ```
   BETTER_AUTH_SECRET=edee4ce81d569070ae783353181fa33350d8c6756ed66ea018175d64ef6a5d7d
   NEXT_PUBLIC_APP_URL=https://your-project-name.vercel.app
   ```
   
   Optional (if you want OAuth):
   ```
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

6. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (2-3 minutes)
   - Your site will be live at `https://your-project-name.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from the website directory**
   ```bash
   cd website
   vercel
   ```

4. **Follow the prompts**
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N`
   - What's your project's name? `label-maker` (or your choice)
   - In which directory is your code located? `./`
   - Want to override settings? `N`

5. **Add environment variables**
   ```bash
   vercel env add BETTER_AUTH_SECRET
   vercel env add NEXT_PUBLIC_APP_URL
   ```

6. **Deploy to production**
   ```bash
   vercel --prod
   ```

## Post-Deployment Steps

### 1. Update OAuth Redirect URIs

If using Google OAuth:
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Navigate to your OAuth credentials
- Add authorized redirect URI: `https://your-domain.vercel.app/api/auth/callback/google`

If using GitHub OAuth:
- Go to [GitHub Developer Settings](https://github.com/settings/developers)
- Update your OAuth App
- Add callback URL: `https://your-domain.vercel.app/api/auth/callback/github`

### 2. Test Your Deployment

Visit your deployed site and test:
- ✅ Homepage loads correctly
- ✅ Login/Signup pages work
- ✅ Authentication flow (will fail until database is migrated)
- ✅ Navigation between pages

### 3. Set Up Production Database (CRITICAL)

Since SQLite won't work in production, choose one of these:

#### Option A: Vercel Postgres (Recommended)
```bash
vercel postgres create
```
Then update your `lib/auth.ts` to use the Postgres connection.

#### Option B: Turso (SQLite-compatible)
1. Sign up at [turso.tech](https://turso.tech)
2. Create a database
3. Get connection URL
4. Update your database configuration

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript has no errors: `npm run build` locally

### Environment Variables Not Working
- Make sure they're added in Vercel dashboard
- Redeploy after adding variables
- Check variable names match exactly

### Database Errors
- SQLite won't work in production
- You must migrate to a cloud database
- See "Set Up Production Database" section above

## Continuous Deployment

Once connected to GitHub:
- Every push to `master` branch auto-deploys to production
- Pull requests create preview deployments
- You can configure branch deployments in Vercel settings

## Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. SSL certificate is automatically provisioned

## Monitoring

- View deployment logs: Vercel Dashboard → Your Project → Deployments
- Check analytics: Vercel Dashboard → Your Project → Analytics
- Monitor errors: Consider adding error tracking (Sentry, etc.)

## Next Steps

1. ✅ Deploy to Vercel
2. ⚠️ Migrate to production database (REQUIRED)
3. 🔐 Set up OAuth providers (optional)
4. 🌐 Add custom domain (optional)
5. 📊 Set up monitoring and analytics

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Better Auth Deployment Guide](https://www.better-auth.com/docs/deployment)
