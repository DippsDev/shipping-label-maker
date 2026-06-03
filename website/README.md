# Label Maker Website

A modern, full-stack web application for generating professional shipping labels across multiple carriers. Built with Next.js 15, TypeScript, and PostgreSQL, it provides users with an intuitive interface to create, manage, and track shipping labels for UPS, FedEx, USPS, Canada Post, and Purolator.

## ✨ Features

- **Multi-Carrier Support** - Generate labels for UPS, FedEx, USPS, Canada Post, and Purolator
- **User Authentication** - Secure email/password and OAuth (Google, GitHub) with Better Auth
- **Address Book** - Save and manage frequently used shipping addresses
- **Label History** - Track all generated labels with download history
- **Credits System** - Wallet/credits management for usage tracking
- **Responsive Design** - Fully responsive UI built with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Authentication**: Better Auth with email & OAuth support
- **Database**: PostgreSQL (production) / SQLite (development)
- **Backend**: Next.js API routes
- **Label Generation**: Python backend with PIL & Code128
- **Icons**: Lucide React

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local`:
   ```env
   BETTER_AUTH_SECRET=your-secret-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
   
   Generate a secret key:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   
   Visit [http://localhost:3000](http://localhost:3000)

> SQLite is used automatically in development - no database setup needed.

## 📁 Project Structure

```
app/                       # Next.js App Router
├── api/                   # API routes
├── (auth)/                # Authentication pages
│   ├── login/
│   └── signup/
├── dashboard/             # User dashboard
├── create-label/          # Label creation
├── history/               # Label history
├── addresses/             # Address management
└── wallet/                # Credits/wallet

lib/                       # Shared utilities
├── auth.ts               # Auth config
├── auth-client.ts        # Client auth
└── db.ts                 # Database

scripts/
└── label_generator.py    # Python label API

public/                    # Static assets
types/                     # TypeScript types
```

## 🔐 Authentication

The app uses [Better Auth](https://better-auth.com) with:
- Email/password login
- Google OAuth
- GitHub OAuth
- Session management
- Protected routes

### Optional: Enable OAuth

**Google OAuth:**
1. Create project at [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add redirect URI: `https://your-domain.vercel.app/api/auth/callback/google`
4. Add to `.env.local`: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

**GitHub OAuth:**
1. Create OAuth app at [GitHub Developer Settings](https://github.com/settings/developers)
2. Set callback URL: `https://your-domain.vercel.app/api/auth/callback/github`
3. Add to `.env.local`: `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`

## 🏷️ Label Generation

The system generates labels by overlaying text and barcodes on carrier-specific templates using Python.

### How It Works
1. Load a blank template image for the carrier
2. Use PIL to draw recipient info and return address
3. Generate Code128 barcode from tracking number
4. Return the final PNG label

### Setup Python Backend

1. **Install Python dependencies**
   ```bash
   pip install flask pillow python-barcode flask-cors
   ```

2. **Copy label templates**
   ```bash
   cp -r label_maker_2_5.exe_extracted/resources/ public/label-templates/
   ```

3. **Run the label API**
   ```bash
   python scripts/label_generator.py
   ```

4. **Update API endpoint in code**
   
   In `app/api/generate-label/route.ts`:
   ```typescript
   const response = await fetch('http://localhost:5000/generate-label', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(labelData)
   });
   ```

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repo
   - Set root directory to `website`

3. **Set environment variables** in Vercel dashboard:
   ```
   BETTER_AUTH_SECRET=your-secret-key
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   PGHOST=your-db-host
   PGUSER=your-db-user
   PGDATABASE=your-db-name
   PGPASSWORD=your-db-password
   ```

4. **Create production database**
   
   The app automatically creates tables on first use. For manual setup:
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
   
   CREATE INDEX idx_address_userId ON address("userId");
   ```

### Database Options
- **Recommended**: Vercel Postgres
- **Alternative**: AWS Aurora, Supabase, PlanetScale, any PostgreSQL

## 📚 Pages

| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/dashboard` | User overview & recent activity |
| Create Label | `/create-label` | Generate new shipping labels |
| History | `/history` | View all generated labels |
| Addresses | `/addresses` | Manage saved addresses |
| Wallet | `/wallet` | View credits/balance |
| Login | `/login` | User login |
| Signup | `/signup` | User registration |

## 🔌 API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/auth/*` | Authentication (Better Auth) |
| `/api/addresses` | Address CRUD operations |
| `/api/generate-label` | Generate shipping labels |

## 🏗️ Build & Deploy

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Type Checking
```bash
npm run type-check
```

## 📋 Checklist for Production

- [ ] Set `BETTER_AUTH_SECRET` environment variable
- [ ] Configure `NEXT_PUBLIC_APP_URL` for your domain
- [ ] Set up PostgreSQL database
- [ ] Verify all env variables are set in deployment platform
- [ ] Test OAuth redirects (if using)
- [ ] Deploy Python label API (if needed)
- [ ] Test label generation with real carriers
- [ ] Set up monitoring & error tracking

## 🆘 Troubleshooting

**Auth fails on deployment**
- Verify `BETTER_AUTH_SECRET` is set
- Check `NEXT_PUBLIC_APP_URL` matches your domain

**Database errors**
- Confirm all database env variables are correct
- Verify database is accessible from deployment region
- Check that required tables exist

**Build fails**
- Run `npm run build` locally to see exact error
- Check for missing dependencies in `package.json`
- Verify no TypeScript errors with `npm run type-check`

## 📄 License

[Add your license here]

## 💬 Support

For issues:
1. Check the troubleshooting section above
2. Review deployment logs (Vercel dashboard)
3. Verify database and API connections
