# JCCI Global Directory & Hurricane Melissa Relief System

A comprehensive platform serving the 6 million-strong Jamaican diaspora worldwide, combining business networking, disaster relief coordination, and transparent fund management through "radical transparency" principles.

## 🌟 Overview

The JCCI platform integrates three powerful systems:
1. **Global Business Directory** - Connecting diaspora-owned businesses worldwide
2. **Hurricane Melissa Relief System** - Coordinating aid for 400,000+ affected Jamaicans
3. **Transparent Donation Platform** - Real-time tracking of every dollar raised and spent

## ✨ Core Features

### 🏢 Business Directory (Coming Soon)
- **Global Listings**: Jamaican-owned businesses across 50+ countries
- **Advanced Search**: Full-text search with geospatial filtering
- **Reviews & Ratings**: Community-driven business verification
- **Map View**: Interactive maps with location-based search
- **Business Profiles**: Comprehensive information with social media integration

### 🆘 Hurricane Melissa Relief System
- **Relief Claim Submission** (`/relief`): Multi-step form with photo upload for damage documentation
- **Claim Tracking** (`/relief/track`): Real-time status updates with unique claim numbers
- **Partner Dashboard** (`/relief/admin`): Verification and approval workflow for partner organizations
- **SMS Notifications**: Automated updates via Twilio integration (configurable)
- **Priority Management**: Urgent, high, standard, and low priority classification

### 💰 Donation & Transparency System
- **Stripe Integration** (`/donate`): Secure payment processing with multiple amount options
- **Real-time Dashboard** (`/transparency`): Live donation statistics and fund allocation
- **100% Transparency**: Every transaction tracked and publicly visible
- **Tax Receipts**: Automatic generation for all donors
- **Interactive Charts**: Visual breakdown of fund usage

### 🔐 Authentication & User Management
- **User Registration**: Email/password authentication via Supabase Auth
- **User Roles**: Member, Business Owner, Partner, Admin
- **Profile Management** (`/account`): Update personal information and preferences
- **Protected Routes**: Role-based access control

### 📰 News Hub
- **Latest News**: Current events and stories from Jamaica
- **Category Organization**: Tourism, Business, Technology, Culture, Sports, Environment
- **Article Search**: Full-text search across all articles
- **Featured Stories**: Highlighted trending news

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (React 18)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Real-time**: Supabase Realtime subscriptions
- **Geospatial**: PostGIS extensions

## 🚀 Quick Start

For detailed setup instructions, see [SETUP.md](./SETUP.md)

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Supabase account (free tier available)
- Stripe account (test mode for development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dondada876/JCCI_Directory.git
cd JCCI_Directory
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase and Stripe credentials
```

4. Set up Supabase database:
- Create a new Supabase project
- Run the SQL schema from `supabase/schema.sql` in Supabase SQL Editor

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
JCCI_Directory/
├── app/
│   ├── account/           # User account management
│   ├── api/               # API routes (Stripe, webhooks)
│   ├── donate/            # Donation system
│   ├── relief/            # Relief claims system
│   │   ├── admin/         # Partner verification dashboard
│   │   └── track/         # Claim tracking
│   ├── transparency/      # Public transparency dashboard
│   ├── directory/         # Business directory
│   └── news/              # News hub
├── components/            # Reusable React components
├── lib/                   # Utilities and configurations
│   ├── supabase.ts        # Supabase client
│   ├── stripe.ts          # Stripe configuration
│   ├── auth-context.tsx   # Authentication context
│   └── types.ts           # TypeScript definitions
├── supabase/
│   └── schema.sql         # Complete database schema
├── SETUP.md               # Detailed setup guide
└── .env.example           # Environment variables template
```

## 🗄️ Database Schema

The platform uses Supabase (PostgreSQL) with the following key tables:

- **businesses** - Business directory listings with full-text search
- **business_reviews** - Customer reviews and ratings
- **relief_claims** - Hurricane Melissa relief claim records
- **donations** - All donation transactions with Stripe integration
- **campaigns** - Fundraising campaigns (e.g., Hurricane Melissa Relief)
- **fund_allocations** - Transparent fund tracking and allocation
- **user_profiles** - Extended user information and roles

Full schema with indexes, RLS policies, and functions available in `supabase/schema.sql`

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
JCCI_Directory/
├── app/                    # Next.js app directory
│   ├── about/             # About Jamaica page
│   ├── contact/           # Contact page
│   ├── directory/         # Business directory pages
│   │   └── [id]/         # Individual business pages
│   ├── news/              # News hub pages
│   │   └── [id]/         # Individual news article pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Homepage
├── components/            # Reusable React components
│   ├── Header.tsx         # Navigation header
│   └── Footer.tsx         # Footer component
├── data/                  # Data files
│   ├── businesses.ts      # Business listings data
│   └── news.ts           # News articles data
├── lib/                   # Utility functions and types
│   └── types.ts          # TypeScript type definitions
├── public/               # Static assets
├── .gitignore           # Git ignore file
├── next.config.js       # Next.js configuration
├── package.json         # Project dependencies
├── postcss.config.mjs   # PostCSS configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Key Pages

- **Homepage** (`/`): Welcome page with featured businesses, latest news, and category browsing
- **Directory** (`/directory`): Complete business directory with search and filtering
- **Business Details** (`/directory/[id]`): Individual business information pages
- **News Hub** (`/news`): All news articles with category filtering
- **Article Details** (`/news/[id]`): Full news article pages
- **About** (`/about`): Information about Jamaica
- **Contact** (`/contact`): Contact form and information

## Customization

### Adding New Businesses

Edit `data/businesses.ts` to add new business listings:

```typescript
{
  id: "unique-id",
  name: "Business Name",
  category: "category-id",
  description: "Business description...",
  address: "Full address",
  phone: "+1 876-XXX-XXXX",
  email: "email@example.com",
  website: "https://website.com",
  image: "image-url",
  featured: false,
}
```

### Adding News Articles

Edit `data/news.ts` to add new news articles:

```typescript
{
  id: "unique-id",
  title: "Article Title",
  category: "Category",
  excerpt: "Brief excerpt...",
  content: "Full article content...",
  author: "Author Name",
  date: "YYYY-MM-DD",
  image: "image-url",
  featured: false,
}
```

### Styling

The project uses Jamaica's national colors:
- **Gold**: `#FDB913` (jamaica-gold)
- **Green**: `#009B3A` (jamaica-green)
- **Black**: `#000000` (jamaica-black)

Modify `tailwind.config.ts` to customize the color scheme.

## Future Enhancements

Potential features for future development:
- Backend API integration with database
- User authentication and business owner dashboards
- Advanced analytics and reporting
- Comment system for news articles
- Business reviews and ratings
- Event calendar for Jamaican events
- Newsletter subscription
- Multi-language support (English/Patois)
- Interactive maps for business locations
- Social media integration

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please contact:
- Email: info@jamaicaconnect.com
- Phone: +1 876-555-0100

## Acknowledgments

- Built with Next.js and Tailwind CSS
- Images from Unsplash
- Inspired by Jamaica's vibrant culture and entrepreneurial spirit

---

**Jamaica Connect** - Connecting the world to Jamaica, one click at a time. 🇯🇲
