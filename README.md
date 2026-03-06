# Label Maker Website

A Next.js web application for generating shipping labels for multiple carriers (UPS, FedEx, USPS, Canada Post, Purolator).

## Features

- Multi-carrier label generation (UPS, FedEx, USPS, Canada Post, Purolator)
- User authentication with Better Auth
- Address book management
- Label history tracking
- Wallet/credits system
- Responsive design with Tailwind CSS

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Better Auth** - Authentication
- **PostgreSQL** (Production) / SQLite (Development) - Database
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   
   Create a `.env.local` file:
   ```env
   BETTER_AUTH_SECRET=your-secret-key-here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Optional: OAuth providers
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   ```

3. **Generate a secure secret key**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

The app uses SQLite (`db.sqlite`) automatically in development - no additional setup needed.

## Project Structure

```
website/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── create-label/      # Label creation page
│   ├── dashboard/         # User dashboard
│   ├── history/           # Label history
│   ├── addresses/         # Address book
│   ├── wallet/            # Wallet/credits
│   ├── login/             # Login page
│   └── signup/            # Sign up page
├── lib/                   # Shared utilities
│   ├── auth.ts           # Authentication config
│   ├── auth-client.ts    # Client-side auth
│   └── db.ts             # Database connection
├── scripts/              # Utility scripts
│   └── label_generator.py # Python label generation
├── public/               # Static assets
└── types/                # TypeScript types
```

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin master
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Set root directory to `website`
   - Add environment variables (see below)

3. **Environment Variables**
   
   Required in Vercel:
   ```
   BETTER_AUTH_SECRET=your-secret-key
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```
   
   For PostgreSQL (production):
   ```
   PGHOST=your-db-host
   PGUSER=your-db-user
   PGDATABASE=your-db-name
   PGPORT=5432
   PGSSLMODE=require
   ```
   
   For AWS Aurora with IAM:
   ```
   AWS_ACCOUNT_ID=your-account-id
   AWS_REGION=your-region
   AWS_RESOURCE_ARN=your-db-arn
   AWS_ROLE_ARN=your-role-arn
   ```

4. **Database Setup**
   
   The app automatically switches between SQLite (dev) and PostgreSQL (production).
   
   For production, create these tables:
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
   
   CREATE INDEX IF NOT EXISTS idx_address_userId ON address("userId");
   ```
   
   Better Auth tables are created automatically on first use.

### Database Options

**Development:**
- SQLite (automatic, no setup)

**Production:**
- Vercel Postgres (recommended)
- AWS Aurora PostgreSQL
- Supabase
- PlanetScale
- Any PostgreSQL database

## Authentication

The app uses [Better Auth](https://better-auth.com) with support for:

- Email/password authentication
- Google OAuth (optional)
- GitHub OAuth (optional)
- Session management
- Protected routes

### OAuth Setup

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth credentials
3. Add redirect URI: `https://your-domain.vercel.app/api/auth/callback/google`
4. Add credentials to environment variables

**GitHub OAuth:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create OAuth App
3. Set callback URL: `https://your-domain.vercel.app/api/auth/callback/github`
4. Add credentials to environment variables

## Label Generation

The label generation feature creates shipping labels by overlaying text and barcodes on carrier-specific templates.

### How It Works

The system generates labels by:
1. Loading a blank label template image (PNG) for the selected carrier/service
2. Using PIL (Python Imaging Library) to draw text and barcodes on the template
3. Generating barcodes using the `code128` library
4. Returning the final label as a PNG file

### Label Templates

Templates are located in `label_maker_2_5.exe_extracted/resources/`:

**UPS:**
- `master.png`, `ups_ground.png`, `ups_express.png`, `ups_saver.png`, `ups_standard.png`

**FedEx:**
- `master_fedex.png`, `fedex_express.png`

**USPS:**
- `priority_master.png`, `priority_e_master.png`, `firstclass_master.png`, `ground_advantage_master.png`, `parcel_master.png`, `smartl_master.png`, `smartp_master.png`, `mailinno_master.png`

**Canada Post:**
- `canada_2_master.png`, `canada_3_master.png`, `canada_2_r_master.png`, `canada_3_r_master.png`

**Purolator:**
- `purolator_master.png`, `purolator_express.png`

### Implementation Options

#### Option 1: Python Backend API (Recommended)

Create a Python Flask/FastAPI endpoint that replicates the desktop logic.

**Pros:**
- Reuse exact same logic and libraries (PIL, code128)
- Copy template images directly
- Most accurate reproduction

**Cons:**
- Requires Python backend
- Need to deploy Python dependencies

**Setup:**
```bash
# Install dependencies
pip install flask pillow python-barcode flask-cors

# Run the label generator API
python scripts/label_generator.py
```

#### Option 2: Node.js Backend with Canvas

Use Node.js with `canvas` and `bwip-js` libraries.

**Pros:**
- Integrates with existing Next.js backend
- No additional language/runtime needed

**Cons:**
- Need to recreate positioning logic
- Different libraries may produce slightly different results

#### Option 3: Client-Side Generation

Use browser Canvas API with JavaScript barcode libraries.

**Pros:**
- No backend processing needed
- Instant generation

**Cons:**
- Template images need to be public
- More complex client-side code
- Browser compatibility concerns

### Setup Instructions

1. **Copy label templates**
   ```bash
   cp -r label_maker_2_5.exe_extracted/resources/ website/public/label-templates/
   ```

2. **Install Python dependencies**
   ```bash
   pip install flask pillow python-barcode flask-cors
   ```

3. **Run the label generator API**
   ```bash
   python scripts/label_generator.py
   ```
   
   The API will run on `http://localhost:5000`

4. **Configure the API endpoint**
   
   Update `app/api/generate-label/route.ts` to point to your Python service:
   ```typescript
   const response = await fetch('http://localhost:5000/generate-label', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(labelData)
   });
   ```

### Generation Process Example

```python
# 1. Load template
blank_label = Image.open('resources/canada_3_master.png')

# 2. Set up fonts
return_address_font = ImageFont.truetype('fonts/Helvetica.ttf', 14)
ship_to_font = ImageFont.truetype('fonts/Helvetica.ttf', 19)

# 3. Create drawing context
image_editable = ImageDraw.Draw(blank_label)

# 4. Add text at specific coordinates
image_editable.text((72, 273), ship_to_name, (0, 0, 0), font=ship_to_font)
image_editable.text((72, 293), ship_to_address, (0, 0, 0), font=ship_to_font)

# 5. Generate and paste barcode
big_barcode = code128.image(tracking_number, height=160)
blank_label.paste(big_barcode.resize((625, 130)), (63, 560))

# 6. Save the label
blank_label.save('output.png')
```

### Template Coordinates Reference

Each carrier has specific coordinates for text placement:

#### Canada Post (Regular Parcel)
- Return address: (75, 800), (75, 815), (75, 830)
- Ship to name: (72, 273)
- Ship to address: (72, 293)
- Ship to city/province/postal: (72, 313)
- Large postal code: (75, 453)
- Tracking number: (295, 700)
- Barcode: (63, 560) - size (625, 130)

#### Purolator
- Return address: (28, 80), (28, 97), (28, 114)
- Ship to name: (263, 80)
- Ship to address: (263, 103)
- Ship to city/province: (263, 128)
- Ship to postal: (263, 154)
- Sorting code: (600, 580)
- Barcode: (43, 819) - size (640, 180)

#### UPS, FedEx, USPS
Similar coordinate mappings exist for other carriers. See `scripts/label_generator.py` for complete implementation.

### Testing

1. Start the Python API server
2. Navigate to `/create-label` in the web app
3. Fill in the form with test data
4. Click "Generate Label"
5. Verify the label downloads correctly

### Deployment

For production deployment:
- Host the Python API separately (AWS Lambda, Google Cloud Functions, etc.)
- Update the API endpoint URL in the Next.js app
- Ensure label templates are accessible to the Python service
- Add proper error handling and validation

## Pages

- `/` - Landing page
- `/features` - Feature showcase
- `/download` - Download desktop app
- `/login` - User login
- `/signup` - User registration
- `/dashboard` - User dashboard
- `/create-label` - Create shipping labels
- `/history` - View label history
- `/addresses` - Manage saved addresses
- `/wallet` - Manage credits/wallet

## API Routes

- `/api/auth/*` - Authentication endpoints (Better Auth)
- `/api/addresses` - Address CRUD operations
- `/api/generate-label` - Label generation endpoint

## Building for Production

```bash
npm run build
npm start
```

## Troubleshooting

### Authentication not working on Vercel
- Verify `BETTER_AUTH_SECRET` is set
- Ensure `NEXT_PUBLIC_APP_URL` matches your deployment URL
- Check database connection and tables exist

### Database connection errors
- Verify all database environment variables are set
- Check database is accessible from Vercel
- Ensure tables are created

### Build failures
- Run `npm run build` locally to check for errors
- Verify all dependencies are in `package.json`
- Check TypeScript errors with `npm run type-check`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

[Your License Here]

## Support

For issues or questions:
- Check the troubleshooting section
- Review Vercel deployment logs
- Check database connection and credentials
