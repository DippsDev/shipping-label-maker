# 🚀 Deploy to Vercel - Quick Start

Your app is now ready to deploy to Vercel with full authentication and address book storage!

## What Changed?

✅ Updated database configuration to use Vercel Postgres  
✅ Updated authentication to work in production  
✅ Created database setup scripts  
✅ Added deployment documentation  

## Deploy in 3 Steps

### 1️⃣ Generate Your Secret Key

Run this command in the `website` directory:

```bash
npm run generate-secret
```

Copy the generated secret - you'll need it in step 3.

### 2️⃣ Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your repository
3. Set **Root Directory** to `website`
4. Click **Deploy**

### 3️⃣ Add Database & Configure

Follow the checklist in `DEPLOYMENT_CHECKLIST.md` - it takes about 5 minutes.

## Files Created

- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist (start here!)
- `VERCEL_DEPLOYMENT.md` - Detailed guide with troubleshooting
- `scripts/setup-vercel-db.sql` - Database initialization script
- `scripts/generate-secret.js` - Secret key generator

## Local Development

Nothing changes! Your local development still uses SQLite automatically.

```bash
npm run dev
```

## Production

Once deployed, your app will automatically use Vercel Postgres for:
- User authentication (sign up, login, sessions)
- Address book storage
- All user data

## Need Help?

1. Check `DEPLOYMENT_CHECKLIST.md` for quick steps
2. See `VERCEL_DEPLOYMENT.md` for detailed instructions
3. Check Vercel function logs if something goes wrong

## What Works After Deployment

✅ User sign up and login  
✅ Session management  
✅ Address book (save, edit, delete addresses)  
✅ Recent addresses tracking  
✅ All authentication features  

Your app is production-ready! 🎉
