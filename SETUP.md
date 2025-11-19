# JCCI Directory & Relief System - Setup Guide

## Project Overview

This is a comprehensive platform combining:
- **Global Business Directory** for Jamaican diaspora businesses
- **Hurricane Melissa Relief Claims System**
- **Transparent Donation Platform** with Stripe integration
- **Real-time Transparency Dashboard**

## What's Been Built

### ✅ Completed Features

#### 1. **Supabase Integration**
- Complete database schema (`supabase/schema.sql`)
- Database types and utilities
- Row-level security (RLS) policies
- Real-time subscription support

#### 2. **Authentication System**
- User registration and login
- User profiles with roles (member, business_owner, partner, admin)
- Auth modal component
- Account management page
- Protected routes

#### 3. **Relief Claims System**
- Multi-step claim submission form (`/relief`)
- Photo upload for damage documentation
- Claim tracking page with real-time updates (`/relief/track`)
- Partner verification dashboard (`/relief/admin`)
- Status notifications
- Priority level management

#### 4. **Donation System**
- Stripe Checkout integration
- Donation page with multiple amount options (`/donate`)
- Success page with confirmation (`/donate/success`)
- Stripe webhook handler for payment processing
- Automatic donation record creation
- Tax receipt preparation

#### 5. **Transparency Dashboard**
- Real-time donation statistics (`/transparency`)
- Interactive charts showing fund allocation
- Recent donations feed
- Real-time updates via Supabase subscriptions
- Public fund tracking

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account (for donations)
- Git

### Step 1: Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. Fill in your environment variables in `.env.local`:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (Required for donations)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Step 2: Supabase Database Setup

1. Create a new Supabase project at https://supabase.com

2. Go to the SQL Editor in your Supabase dashboard

3. Run the complete schema:
```bash
# Copy the contents of supabase/schema.sql and run in Supabase SQL Editor
```

This will create:
- All database tables
- Indexes for performance
- RLS policies for security
- Utility functions
- Seed data for categories and Hurricane Melissa campaign

### Step 3: Stripe Setup

1. Create a Stripe account at https://stripe.com

2. Get your API keys from the Stripe Dashboard:
   - Publishable key (starts with `pk_`)
   - Secret key (starts with `sk_`)

3. Set up Stripe webhook:
   - Install Stripe CLI: https://stripe.com/docs/stripe-cli
   - Forward webhooks to local development:
     ```bash
     stripe listen --forward-to localhost:3000/api/stripe-webhook
     ```
   - Copy the webhook signing secret (starts with `whsec_`)

4. Add webhook endpoint in Stripe Dashboard (for production):
   - URL: `https://yourdomain.com/api/stripe-webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `payment_intent.payment_failed`

### Step 4: Install Dependencies

```bash
npm install
```

This will install:
- Next.js 15
- Supabase JS client
- Stripe
- Recharts (for transparency dashboard charts)
- TailwindCSS

### Step 5: Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
JCCI_Directory/
├── app/
│   ├── account/          # User account management
│   ├── api/              # API routes
│   │   ├── create-checkout-session/  # Stripe checkout
│   │   └── stripe-webhook/           # Stripe webhook handler
│   ├── donate/           # Donation pages
│   │   └── success/      # Donation success page
│   ├── relief/           # Relief claims system
│   │   ├── admin/        # Partner verification dashboard
│   │   └── track/        # Claim tracking
│   ├── transparency/     # Public transparency dashboard
│   ├── directory/        # Business directory
│   ├── news/             # News hub
│   └── layout.tsx        # Root layout with AuthProvider
├── components/
│   ├── Header.tsx        # Navigation with auth
│   ├── Footer.tsx        # Footer component
│   └── AuthModal.tsx     # Sign in/up modal
├── lib/
│   ├── supabase.ts       # Supabase client and utilities
│   ├── database.types.ts # Database type definitions
│   ├── types.ts          # Application types
│   ├── auth-context.tsx  # Authentication context
│   └── stripe.ts         # Stripe utilities
├── supabase/
│   └── schema.sql        # Complete database schema
└── .env.example          # Environment template
```

## Key Features Guide

### For Relief Recipients

1. **Submit a Claim** (`/relief`):
   - Fill out multi-step form
   - Upload damage photos
   - Specify immediate needs
   - Receive claim number instantly

2. **Track Your Claim** (`/relief/track`):
   - Enter claim number
   - See real-time status updates
   - View approved items
   - Get pickup location and schedule

### For Partners (Verification Staff)

1. **Access Admin Dashboard** (`/relief/admin`):
   - Requires `partner` or `admin` user_type
   - Filter claims by parish, status, priority
   - Review claim details with photos
   - Approve or reject claims
   - Add notes for claimants

### For Donors

1. **Make a Donation** (`/donate`):
   - Choose amount or enter custom
   - Provide email for receipt
   - Option for anonymous donation
   - Secure Stripe Checkout
   - Instant confirmation

2. **Track Donations** (`/transparency`):
   - View real-time statistics
   - See fund allocation breakdown
   - Recent donations feed
   - 100% transparent tracking

### For Business Owners (Coming Soon)

- Create business listing
- Manage business profile
- Respond to reviews
- View analytics

## Database Schema Overview

### Core Tables

- **businesses**: Business directory listings
- **business_categories**: Business categories and subcategories
- **business_reviews**: Customer reviews and ratings
- **relief_claims**: Hurricane Melissa relief claims
- **relief_inventory**: Supply inventory tracking
- **distribution_events**: Distribution event scheduling
- **donations**: All donation records
- **campaigns**: Fundraising campaigns
- **fund_allocations**: Transparent fund tracking
- **user_profiles**: Extended user information

### Key Functions

- `get_donation_stats()`: Real-time donation statistics
- `get_allocation_breakdown()`: Fund allocation by category
- `businesses_near_location()`: Geospatial search
- `increment_business_views()`: Track business views
- `update_business_rating()`: Auto-update business ratings

## Testing the System

### Test Relief Claims

1. Go to `/relief`
2. Fill out the multi-step form
3. Upload test images
4. Submit and note your claim number
5. Track at `/relief/track`
6. Log in as partner/admin to verify at `/relief/admin`

### Test Donations

1. Go to `/donate`
2. Use Stripe test card: `4242 4242 4242 4242`
3. Any future expiration date and any CVC
4. Complete checkout
5. Check `/transparency` for real-time update

### Test Authentication

1. Click "Sign In" in header
2. Create account with email/password
3. Check user profile at `/account`
4. Update profile information

## Security Features

- **Row Level Security (RLS)**: All tables protected
- **API Route Protection**: Server-side validation
- **Stripe Webhook Verification**: Signed webhooks only
- **Environment Variables**: Secrets never exposed to client
- **Authentication**: Supabase Auth with JWT
- **HTTPS Only**: Production requires SSL

## Next Steps

### Remaining Features to Build

1. **Business Directory Enhancement**:
   - Migrate from static data to Supabase
   - Add business listing creation form
   - Implement search and filtering
   - Add map view with Google Maps API

2. **Reviews & Ratings**:
   - Review submission form
   - Rating display on business pages
   - Owner response functionality
   - Review moderation

3. **Additional Integrations**:
   - Twilio SMS notifications
   - N8N workflow automation
   - Google Maps for location services
   - Email service for receipts

## Deployment

### Recommended Platforms

- **Vercel** (Recommended for Next.js)
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**

### Pre-Deployment Checklist

- [ ] Set all production environment variables
- [ ] Update `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Configure Stripe webhook for production
- [ ] Enable RLS on all Supabase tables
- [ ] Test authentication flow
- [ ] Test donation flow end-to-end
- [ ] Test relief claim submission
- [ ] Verify transparency dashboard updates

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Production deployment
vercel --prod
```

## Support & Documentation

- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Next.js Docs**: https://nextjs.org/docs

## License

MIT License - See LICENSE file for details

---

**Built with:** Next.js 15, TypeScript, Supabase, Stripe, TailwindCSS, Recharts
