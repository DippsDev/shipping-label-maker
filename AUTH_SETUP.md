# Better Auth Setup Guide

## Overview
This project uses Better Auth for authentication. The setup includes email/password authentication and social login (Google & GitHub).

## Setup Steps

### 1. Database Setup
Better Auth is configured to use SQLite by default. The database will be created automatically at `./db.sqlite`.

For production, you can switch to PostgreSQL, MySQL, or other supported databases by updating `lib/auth.ts`.

### 2. Environment Variables
Update the `.env.local` file with your configuration:

```env
# Required: Generate a secure secret key
BETTER_AUTH_SECRET=your-secret-key-here-change-this-in-production

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional: GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 3. Generate Secret Key
Generate a secure secret key for production:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Social Login Setup (Optional)

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

#### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret to `.env.local`

### 5. Run Database Migrations
Better Auth will automatically create the necessary tables on first run.

### 6. Start Development Server
```bash
npm run dev
```

## Features Implemented

- ✅ Email/Password authentication
- ✅ Google OAuth
- ✅ GitHub OAuth
- ✅ Login page with error handling
- ✅ Sign up page
- ✅ Session management
- ✅ Protected routes (ready to implement)

## Usage

### Sign In
```typescript
import { signIn } from "@/lib/auth-client";

await signIn.email({
    email: "user@example.com",
    password: "password123"
});
```

### Sign Up
```typescript
import { signUp } from "@/lib/auth-client";

await signUp.email({
    email: "user@example.com",
    password: "password123",
    name: "John Doe"
});
```

### Get Session
```typescript
import { useSession } from "@/lib/auth-client";

function Component() {
    const { data: session } = useSession();
    
    if (session) {
        console.log("User:", session.user);
    }
}
```

### Sign Out
```typescript
import { signOut } from "@/lib/auth-client";

await signOut();
```

## Next Steps

1. **Protect Routes**: Add middleware to protect authenticated routes
2. **User Profile**: Create user profile management pages
3. **Email Verification**: Enable email verification for new accounts
4. **Password Reset**: Implement forgot password functionality
5. **Two-Factor Auth**: Add 2FA support using Better Auth plugins

## Documentation
- [Better Auth Docs](https://better-auth.com)
- [Better Auth GitHub](https://github.com/better-auth/better-auth)
