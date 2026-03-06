# Vercel Deployment Checklist ✅

Follow this checklist to deploy your Label Maker app to Vercel.

## Pre-Deployment

- [ ] Push your code to GitHub/GitLab/Bitbucket
- [ ] Make sure you're in the `website` directory for all commands
- [ ] Test locally with `npm run dev` to ensure everything works

## Vercel Setup

### 1. Initial Deployment
- [ ] Go to https://vercel.com/new
- [ ] Import your repository
- [ ] Set **Root Directory** to `website`
- [ ] Click **Deploy** (will fail - that's OK!)

### 2. Add Database
- [ ] In Vercel dashboard → **Storage** tab
- [ ] Click **Create Database**
- [ ] Select **Postgres**
- [ ] Name it (e.g., `label-maker-db`)
- [ ] Choose region closest to your users
- [ ] Click **Create**
- [ ] Wait for database to be created (~1 minute)

### 3. Initialize Database
- [ ] In Vercel → **Storage** → Your database → **Query** tab
- [ ] Copy contents from `scripts/setup-vercel-db.sql`
- [ ] Paste and click **Run Query**
- [ ] Verify `address` table appears in the list

### 4. Environment Variables
- [ ] Go to **Settings** → **Environment Variables**
- [ ] Add `BETTER_AUTH_SECRET`:
  ```bash
  # Generate with this command:
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Add `NEXT_PUBLIC_APP_URL`:
  ```
  https://your-app-name.vercel.app
  ```
  (Replace with your actual Vercel URL from the deployment)

### 5. Redeploy
- [ ] Go to **Deployments** tab
- [ ] Click latest deployment → **Redeploy**
- [ ] Wait for deployment to complete

## Testing

- [ ] Visit your app URL
- [ ] Sign up for a new account
- [ ] Log in successfully
- [ ] Go to Addresses page
- [ ] Add a new address
- [ ] Verify address is saved and appears in the list
- [ ] Log out and log back in
- [ ] Verify address is still there

## Post-Deployment (Optional)

- [ ] Add custom domain in **Settings** → **Domains**
- [ ] Update `NEXT_PUBLIC_APP_URL` to custom domain
- [ ] Set up Google OAuth (if needed)
- [ ] Set up GitHub OAuth (if needed)

## Troubleshooting

If something doesn't work:

1. **Check Vercel Logs**: Deployments → Click deployment → **Function Logs**
2. **Verify Environment Variables**: Settings → Environment Variables
3. **Check Database**: Storage → Your database → Query tab → Run `SELECT * FROM address;`
4. **Browser Console**: Open DevTools and check for errors

## Need Help?

See `VERCEL_DEPLOYMENT.md` for detailed instructions and troubleshooting.
