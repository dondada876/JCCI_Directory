# Jamaica Connect - Directory & News Hub

A comprehensive online platform connecting the world to Jamaica through a business directory and news hub.

## Overview

Jamaica Connect is a modern web application built with Next.js that serves as a centralized platform for discovering Jamaican businesses and staying updated with the latest news from the island. The platform features an intuitive interface, powerful search capabilities, and responsive design for seamless access across all devices.

## Features

### Business Directory
- **Comprehensive Listings**: Browse businesses across multiple categories including Tourism, Restaurants, Services, Culture, Agriculture, Healthcare, Technology, and Education
- **Advanced Search**: Search businesses by name, description, or location
- **Category Filtering**: Filter businesses by specific categories for targeted browsing
- **Detailed Business Pages**: Each business has a dedicated page with full contact information, descriptions, and related businesses
- **Featured Businesses**: Highlighting premium and verified business listings

### News Hub
- **Latest News**: Stay updated with current events and stories from Jamaica
- **Multiple Categories**: News organized across Tourism, Business, Technology, Culture, Sports, and Environment
- **Article Search**: Full-text search across news articles
- **Featured Stories**: Highlighted important and trending news
- **Related Articles**: Discover similar content through intelligent article recommendations

### Additional Features
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Fast Performance**: Built with Next.js for optimal loading speeds and SEO
- **Modern UI/UX**: Clean, intuitive interface using Tailwind CSS
- **Jamaica-themed Branding**: Custom color scheme reflecting Jamaica's national colors

## Technology Stack

- **Framework**: Next.js 15 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Image Optimization**: Next.js Image component
- **Routing**: Next.js App Router
- **Deployment Ready**: Optimized for Vercel, Netlify, or any Node.js hosting

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

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

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

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
