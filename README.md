# LabelApp Website

This is the informational website for LabelApp, built with Next.js, React, and Tailwind CSS.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the website.

## Pages

- **Home** (`/`) - Landing page with overview and key features
- **Features** (`/features`) - Detailed feature list
- **Download** (`/download`) - Download page for different platforms

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Customization

You can customize the website by editing:

- `app/page.tsx` - Home page
- `app/features/page.tsx` - Features page
- `app/download/page.tsx` - Download page
- `app/layout.tsx` - Global layout and metadata

## Building for Production

```bash
npm run build
npm start
```

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

```bash
npm install -g vercel
vercel
```

Or deploy to any platform that supports Next.js (Netlify, AWS, etc.).
