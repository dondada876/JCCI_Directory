# Product Requirements Document (PRD)
## Jamaica Community Center International Global Business Directory & Relief Claims System

**Version:** 1.0  
**Date:** November 18, 2025  
**Project Owner:** Don, Executive Director, JCCI  
**Development:** Claude Code Web Implementation

---

## 1. Executive Summary

JCCI is developing a comprehensive global directory and relief management platform that serves the 6 million-strong Jamaican diaspora worldwide. This system combines business networking, disaster relief coordination, and transparent fund management into a unified platform, leveraging the organization's "conscious capitalism" model and "radical transparency" principles.

### Core Value Proposition
- **For Diaspora Businesses:** Free global visibility and connection to 6M+ potential customers
- **For Relief Recipients:** Dignified, transparent process for receiving aid with verification
- **For Donors:** Complete transparency on fund allocation through real-time tracking
- **For JCCI:** Sustainable revenue model through transaction fees funding nonprofit programs

---

## 2. Product Vision & Goals

### Vision Statement
Create the world's premier diaspora-owned business directory and disaster relief coordination platform, serving as "the everything app for Jamaica" - connecting economic opportunity with community support through radical transparency.

### Success Metrics
- **Year 1:** 10,000+ business listings across 50+ countries
- **Relief Operations:** Support 400,000+ Hurricane Melissa victims
- **Platform Adoption:** 100,000+ registered users within 6 months
- **Revenue Target:** $10M fundraising in 60 days for Hurricane Melissa relief
- **Transparency Score:** 100% of donations publicly trackable

---

## 3. User Personas

### Primary Personas

#### 1. **Diaspora Business Owner - "Marcus"**
- **Demographics:** 35-55, Jamaican-owned business, US/UK/Canada based
- **Goals:** Increase visibility, connect with diaspora customers, support homeland
- **Pain Points:** Limited marketing budget, difficulty reaching diaspora audience
- **Tech Comfort:** Moderate; uses social media, basic web tools

#### 2. **Disaster Relief Recipient - "Pauline"**
- **Demographics:** Any age, Jamaica-based, Hurricane Melissa victim
- **Goals:** Access emergency supplies, shelter, financial assistance
- **Pain Points:** Traditional aid slow/bureaucratic, uncertain about eligibility
- **Tech Comfort:** Variable; may have limited internet access

#### 3. **Diaspora Donor - "Jennifer"**
- **Demographics:** 25-65, living abroad, wants to help homeland
- **Goals:** Ensure donations reach intended recipients, tax deductibility
- **Pain Points:** Mistrust of charitable organizations, wants transparency
- **Tech Comfort:** High; expects mobile-first, real-time updates

#### 4. **Partner Organization - "Jamaica Chamber of Commerce"**
- **Demographics:** Institutional partner in Jamaica
- **Goals:** Coordinate relief efforts, verify beneficiaries, distribute supplies
- **Pain Points:** Manual processes, coordination across agencies
- **Tech Comfort:** Moderate institutional capacity

---

## 4. Technical Architecture

### Stack Overview
```
Frontend:
- WordPress + Astra Pro (existing infrastructure)
- React components for dynamic features
- Mobile-responsive design (mobile-first approach)

Backend:
- Supabase (PostgreSQL database)
- Real-time subscriptions for live updates
- Row Level Security (RLS) for data protection

Integration Layer:
- N8N workflow automation
- Stripe Connect for payments
- TeraWallet for digital wallet
- PassKit for Apple/Google Wallet integration
- Twilio for SMS notifications

Directory Technology:
- ListingPro theme/plugin foundation
- Custom Supabase integration for scalability
- Real-time search and filtering
```

### Supabase Database Schema

```sql
-- Core Tables

-- Businesses Directory
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    whatsapp TEXT,
    category TEXT NOT NULL,
    subcategory TEXT,
    description TEXT,
    
    -- Location
    country TEXT NOT NULL,
    state_province TEXT,
    city TEXT,
    address TEXT,
    coordinates GEOGRAPHY(POINT),
    
    -- Business Details
    website TEXT,
    social_facebook TEXT,
    social_instagram TEXT,
    social_twitter TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    business_hours JSONB,
    
    -- Verification
    verification_status TEXT DEFAULT 'pending', -- pending, verified, suspended
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id),
    
    -- Metrics
    views_count INTEGER DEFAULT 0,
    contact_clicks INTEGER DEFAULT 0,
    rating_average DECIMAL(3,2),
    review_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Search optimization
    search_vector TSVECTOR
);

-- Business Categories
CREATE TABLE business_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    parent_id UUID REFERENCES business_categories(id),
    description TEXT,
    icon_url TEXT,
    display_order INTEGER DEFAULT 0
);

-- Relief Claims System
CREATE TABLE relief_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_number TEXT UNIQUE NOT NULL, -- Auto-generated: HM-2025-XXXXX
    
    -- Claimant Information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    national_id TEXT, -- For verification in Jamaica
    
    -- Location
    parish TEXT NOT NULL,
    community TEXT NOT NULL,
    address TEXT NOT NULL,
    coordinates GEOGRAPHY(POINT),
    
    -- Household Details
    household_size INTEGER,
    children_count INTEGER,
    elderly_count INTEGER,
    disabled_count INTEGER,
    
    -- Damage Assessment
    damage_type TEXT[], -- ['roof_damage', 'flooding', 'total_loss', etc.]
    damage_severity TEXT, -- minor, moderate, severe, total_loss
    damage_photos TEXT[], -- Array of image URLs
    immediate_needs TEXT[], -- ['shelter', 'food', 'water', 'medical', etc.]
    
    -- Verification
    verification_status TEXT DEFAULT 'submitted', -- submitted, under_review, verified, approved, fulfilled
    verified_by UUID REFERENCES auth.users(id),
    verification_date TIMESTAMPTZ,
    verification_notes TEXT,
    verification_partner TEXT, -- e.g., "St. James Municipal Corporation"
    
    -- Aid Allocation
    approved_items JSONB, -- {item_id: quantity}
    distribution_location TEXT,
    pickup_date TIMESTAMPTZ,
    pickup_confirmed BOOLEAN DEFAULT FALSE,
    
    -- Tracking
    status TEXT DEFAULT 'pending', -- pending, approved, in_progress, fulfilled, closed
    priority_level TEXT DEFAULT 'standard', -- urgent, high, standard, low
    
    -- Transparency
    public_notes TEXT, -- Visible on public dashboard
    internal_notes TEXT, -- Staff only
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    fulfilled_at TIMESTAMPTZ
);

-- Donations Tracking
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Donor Information
    donor_name TEXT, -- Optional for anonymity
    donor_email TEXT NOT NULL,
    donor_country TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    
    -- Transaction
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_method TEXT, -- stripe, paypal, check, etc.
    stripe_payment_id TEXT,
    transaction_fee DECIMAL(10,2),
    net_amount DECIMAL(10,2),
    
    -- Allocation
    campaign_id UUID REFERENCES campaigns(id),
    designated_use TEXT, -- 'general', 'hurricane_melissa', 'education', etc.
    allocation_status TEXT DEFAULT 'unallocated', -- unallocated, allocated, disbursed
    
    -- Tax Receipt
    tax_receipt_issued BOOLEAN DEFAULT FALSE,
    tax_receipt_url TEXT,
    tax_receipt_sent_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relief Supply Inventory
CREATE TABLE relief_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_name TEXT NOT NULL,
    item_category TEXT NOT NULL, -- shelter, water, food, medical, etc.
    item_description TEXT,
    
    -- Quantities
    quantity_available INTEGER DEFAULT 0,
    quantity_allocated INTEGER DEFAULT 0,
    quantity_distributed INTEGER DEFAULT 0,
    unit_of_measure TEXT, -- ea, box, liter, kg, etc.
    
    -- Logistics
    storage_location TEXT,
    warehouse_id UUID REFERENCES warehouses(id),
    supplier TEXT,
    cost_per_unit DECIMAL(10,2),
    
    -- Tracking
    last_restock_date TIMESTAMPTZ,
    expiration_date TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Distribution Events
CREATE TABLE distribution_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name TEXT NOT NULL,
    event_type TEXT, -- pickup, delivery, mobile_distribution
    
    -- Location
    parish TEXT NOT NULL,
    location_name TEXT NOT NULL,
    address TEXT,
    coordinates GEOGRAPHY(POINT),
    
    -- Timing
    scheduled_date TIMESTAMPTZ NOT NULL,
    start_time TIME,
    end_time TIME,
    
    -- Capacity
    capacity INTEGER,
    registered_count INTEGER DEFAULT 0,
    served_count INTEGER DEFAULT 0,
    
    -- Staff
    coordinator_id UUID REFERENCES auth.users(id),
    staff_assigned TEXT[],
    partner_organizations TEXT[],
    
    -- Status
    status TEXT DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews & Ratings
CREATE TABLE business_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    
    -- Response
    owner_response TEXT,
    response_date TIMESTAMPTZ,
    
    -- Moderation
    is_verified_customer BOOLEAN DEFAULT FALSE,
    is_flagged BOOLEAN DEFAULT FALSE,
    moderation_status TEXT DEFAULT 'approved',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users Table (extends Supabase Auth)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    display_name TEXT,
    avatar_url TEXT,
    
    -- Contact
    phone TEXT,
    whatsapp TEXT,
    
    -- Location
    country TEXT,
    state_province TEXT,
    city TEXT,
    parish TEXT, -- For Jamaica-based users
    
    -- Preferences
    preferred_language TEXT DEFAULT 'en',
    notification_preferences JSONB,
    
    -- Roles
    user_type TEXT DEFAULT 'member', -- member, business_owner, volunteer, partner, admin
    
    -- Engagement
    businesses_claimed UUID[],
    favorite_businesses UUID[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns (Fundraising)
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    campaign_type TEXT, -- disaster_relief, education, infrastructure
    
    description TEXT,
    image_url TEXT,
    video_url TEXT,
    
    -- Goals
    goal_amount DECIMAL(12,2),
    current_amount DECIMAL(12,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    
    -- Timing
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transparency Dashboard Data
CREATE TABLE fund_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    donation_id UUID REFERENCES donations(id),
    allocation_type TEXT NOT NULL, -- relief_supplies, operational, program
    category TEXT NOT NULL,
    
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    
    -- Recipients
    recipient_type TEXT, -- individual_claim, partner_org, vendor
    recipient_id TEXT, -- Could be claim_id, vendor name, etc.
    
    -- Documentation
    receipt_url TEXT,
    proof_of_delivery_url TEXT,
    
    allocated_date TIMESTAMPTZ DEFAULT NOW(),
    disbursed_date TIMESTAMPTZ
);

-- Indexes for Performance
CREATE INDEX idx_businesses_location ON businesses USING GIST(coordinates);
CREATE INDEX idx_businesses_category ON businesses(category);
CREATE INDEX idx_businesses_verification ON businesses(verification_status);
CREATE INDEX idx_businesses_search ON businesses USING GIN(search_vector);

CREATE INDEX idx_relief_claims_status ON relief_claims(verification_status, status);
CREATE INDEX idx_relief_claims_parish ON relief_claims(parish);
CREATE INDEX idx_relief_claims_location ON relief_claims USING GIST(coordinates);
CREATE INDEX idx_relief_claims_priority ON relief_claims(priority_level, created_at);

CREATE INDEX idx_donations_campaign ON donations(campaign_id);
CREATE INDEX idx_donations_date ON donations(created_at DESC);

-- Full Text Search Setup
CREATE FUNCTION update_business_search_vector() RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.business_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER business_search_vector_update 
    BEFORE INSERT OR UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_business_search_vector();
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE relief_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Businesses: Public read, authenticated write (own listings)
CREATE POLICY "Businesses are viewable by everyone"
    ON businesses FOR SELECT
    USING (verification_status = 'verified');

CREATE POLICY "Users can insert their own businesses"
    ON businesses FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own businesses"
    ON businesses FOR UPDATE
    USING (auth.uid() = created_by);

-- Relief Claims: Claimants can view own, staff can view all
CREATE POLICY "Users can view their own claims"
    ON relief_claims FOR SELECT
    USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND user_type IN ('partner', 'admin')
        )
    );

CREATE POLICY "Anyone can submit a claim"
    ON relief_claims FOR INSERT
    WITH CHECK (true);

-- Donations: Donors can view own, public aggregate stats
CREATE POLICY "Users can view their own donations"
    ON donations FOR SELECT
    USING (
        auth.jwt()->>'email' = donor_email OR
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND user_type = 'admin'
        )
    );
```

---

## 5. Core Features & User Stories

### 5.1 Global Business Directory

#### Feature: Business Listing Management

**User Stories:**

**As a Business Owner, I want to:**
- Create a free business listing with comprehensive details
- Upload my logo and cover images
- Categorize my business (with 100+ categories)
- Add my location with map visualization
- List my services/products
- Set business hours
- Add social media links
- Receive notifications when someone contacts me

**Acceptance Criteria:**
- Business creation form with validation
- Image upload (max 5MB, auto-resize)
- Category dropdown with search
- Google Maps integration for address verification
- Email verification required
- SMS notification option via Twilio

**Technical Implementation:**
```javascript
// Supabase function for business creation
const createBusiness = async (businessData) => {
  const { data, error } = await supabase
    .from('businesses')
    .insert({
      ...businessData,
      created_by: supabase.auth.user().id,
      coordinates: `POINT(${businessData.longitude} ${businessData.latitude})`,
      verification_status: 'pending'
    })
    .select()
    .single();
  
  // Trigger N8N workflow for verification email
  if (!error) {
    await triggerN8NWorkflow('business_verification', data.id);
  }
  
  return { data, error };
};
```

#### Feature: Advanced Search & Filtering

**User Stories:**

**As a User, I want to:**
- Search businesses by name, category, location
- Filter by distance from my location
- Filter by rating, verification status
- See results on a map
- Save favorite businesses
- Share business profiles

**Acceptance Criteria:**
- Full-text search with real-time results
- Radius search (5, 10, 25, 50, 100 miles/km)
- Multi-select category filters
- Star rating filter
- Map view with clustering
- Favorites saved to user profile

**Technical Implementation:**
```javascript
// Real-time search with Supabase
const searchBusinesses = async (query, filters) => {
  let supabaseQuery = supabase
    .from('businesses')
    .select('*')
    .eq('verification_status', 'verified');
  
  // Full-text search
  if (query) {
    supabaseQuery = supabaseQuery.textSearch('search_vector', query);
  }
  
  // Category filter
  if (filters.categories?.length) {
    supabaseQuery = supabaseQuery.in('category', filters.categories);
  }
  
  // Location radius filter
  if (filters.location && filters.radius) {
    supabaseQuery = supabaseQuery.rpc('businesses_near_location', {
      lat: filters.location.lat,
      lng: filters.location.lng,
      radius_km: filters.radius
    });
  }
  
  // Rating filter
  if (filters.minRating) {
    supabaseQuery = supabaseQuery.gte('rating_average', filters.minRating);
  }
  
  const { data, error } = await supabaseQuery.order('rating_average', { ascending: false });
  
  return { data, error };
};

// PostgreSQL function for radius search
CREATE OR REPLACE FUNCTION businesses_near_location(lat FLOAT, lng FLOAT, radius_km FLOAT)
RETURNS SETOF businesses AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM businesses
  WHERE ST_DWithin(
    coordinates::geography,
    ST_MakePoint(lng, lat)::geography,
    radius_km * 1000
  )
  AND verification_status = 'verified';
END;
$$ LANGUAGE plpgsql;
```

#### Feature: Business Profile Pages

**User Stories:**

**As a Customer, I want to:**
- View complete business information
- See photos/videos
- Read reviews and ratings
- Contact business directly (click-to-call, email, WhatsApp)
- Get directions
- Share on social media

**Acceptance Criteria:**
- SEO-optimized profile URLs (/business/[slug])
- Schema.org markup for local business
- Photo gallery with lightbox
- Reviews with verified badge
- One-click contact buttons
- Share buttons (Facebook, WhatsApp, Twitter, copy link)

**Technical Implementation:**
```jsx
// React component for business profile
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function BusinessProfile({ slug }) {
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  
  useEffect(() => {
    // Fetch business data
    const fetchBusiness = async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_reviews (
            id,
            rating,
            review_text,
            user_profiles (display_name, avatar_url),
            created_at
          )
        `)
        .eq('slug', slug)
        .single();
      
      if (!error) {
        setBusiness(data);
        setReviews(data.business_reviews);
        
        // Increment view count
        await supabase.rpc('increment_business_views', { business_id: data.id });
      }
    };
    
    fetchBusiness();
  }, [slug]);
  
  return (
    <div className="business-profile">
      {/* Profile implementation */}
    </div>
  );
}
```

### 5.2 Hurricane Melissa Relief Claims System

#### Feature: Relief Claim Submission

**User Stories:**

**As a Hurricane Melissa Victim, I want to:**
- Submit a relief claim with my details
- Upload photos of damage
- Specify my immediate needs
- Track my claim status
- Receive SMS updates on my claim

**Acceptance Criteria:**
- Mobile-optimized form (works on low bandwidth)
- Photo upload from camera or gallery
- Multi-select needs checklist
- Unique claim number generated (HM-2025-XXXXX)
- SMS confirmation sent immediately
- Email confirmation if provided
- Claim visible in personal dashboard

**Technical Implementation:**
```jsx
// Relief Claim Submission Form
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ReliefClaimForm() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    parish: '',
    community: '',
    address: '',
    household_size: 1,
    damage_type: [],
    immediate_needs: []
  });
  
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Upload photos to Supabase Storage
      const photoUrls = await Promise.all(
        photos.map(async (photo) => {
          const filename = `${Date.now()}-${photo.name}`;
          const { data, error } = await supabase.storage
            .from('relief-photos')
            .upload(`claims/${filename}`, photo);
          
          if (error) throw error;
          
          const { data: urlData } = supabase.storage
            .from('relief-photos')
            .getPublicUrl(data.path);
          
          return urlData.publicUrl;
        })
      );
      
      // Generate claim number
      const claimNumber = await generateClaimNumber();
      
      // Create claim
      const { data: claim, error } = await supabase
        .from('relief_claims')
        .insert({
          ...formData,
          claim_number: claimNumber,
          damage_photos: photoUrls,
          verification_status: 'submitted'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Send SMS notification via N8N
      await triggerN8NWorkflow('send_claim_confirmation_sms', {
        phone: formData.phone,
        claim_number: claimNumber,
        name: formData.first_name
      });
      
      // Show success message
      alert(`Claim submitted successfully! Your claim number is: ${claimNumber}`);
      
      // Reset form
      setFormData({ /* reset */ });
      setPhotos([]);
      
    } catch (error) {
      console.error('Error submitting claim:', error);
      alert('Error submitting claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="relief-claim-form">
      {/* Form fields */}
    </form>
  );
}

// Function to generate unique claim number
async function generateClaimNumber() {
  const year = new Date().getFullYear();
  
  // Get the count of claims this year
  const { count } = await supabase
    .from('relief_claims')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${year}-01-01`);
  
  const sequence = String(count + 1).padStart(5, '0');
  return `HM-${year}-${sequence}`;
}
```

#### Feature: Claim Verification & Approval

**User Stories:**

**As a Partner Organization Staff Member, I want to:**
- View all claims in my parish
- Filter claims by status, priority, needs
- Verify claimant information
- Approve eligible claims
- Allocate supplies to approved claims
- Schedule distribution

**Acceptance Criteria:**
- Admin dashboard with claim queue
- Claim detail view with all photos/info
- Verification checklist
- Approval workflow with notes
- Supply allocation interface
- Distribution scheduling

**Technical Implementation:**
```jsx
// Partner Dashboard for Claim Verification
export default function ClaimVerificationDashboard() {
  const [claims, setClaims] = useState([]);
  const [filters, setFilters] = useState({
    status: 'submitted',
    parish: 'all',
    priority: 'all'
  });
  
  useEffect(() => {
    const fetchClaims = async () => {
      let query = supabase
        .from('relief_claims')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters.status !== 'all') {
        query = query.eq('verification_status', filters.status);
      }
      
      if (filters.parish !== 'all') {
        query = query.eq('parish', filters.parish);
      }
      
      if (filters.priority !== 'all') {
        query = query.eq('priority_level', filters.priority);
      }
      
      const { data, error } = await query;
      
      if (!error) {
        setClaims(data);
      }
    };
    
    fetchClaims();
    
    // Real-time subscription for new claims
    const subscription = supabase
      .channel('relief_claims_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'relief_claims' },
        (payload) => {
          setClaims((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [filters]);
  
  const approveClaim = async (claimId, approvedItems) => {
    const { error } = await supabase
      .from('relief_claims')
      .update({
        verification_status: 'approved',
        status: 'approved',
        approved_items: approvedItems,
        verified_by: supabase.auth.user().id,
        verification_date: new Date().toISOString()
      })
      .eq('id', claimId);
    
    if (!error) {
      // Trigger SMS notification
      await triggerN8NWorkflow('send_claim_approval_sms', { claim_id: claimId });
      
      // Update local state
      setClaims((prev) => 
        prev.map((claim) => 
          claim.id === claimId 
            ? { ...claim, verification_status: 'approved' } 
            : claim
        )
      );
    }
  };
  
  return (
    <div className="verification-dashboard">
      {/* Dashboard UI */}
    </div>
  );
}
```

### 5.3 Transparent Donation Tracking

#### Feature: Public Transparency Dashboard

**User Stories:**

**As a Donor or Public User, I want to:**
- See total funds raised in real-time
- View how funds are allocated (% breakdown)
- See individual expenditures with receipts
- Filter by campaign, date range, category
- Export reports
- Verify any donation by transaction ID

**Acceptance Criteria:**
- Public dashboard at /transparency
- Real-time updates (via Supabase subscriptions)
- Interactive charts (pie, bar, timeline)
- Searchable transaction table
- PDF receipt downloads
- No authentication required for viewing

**Technical Implementation:**
```jsx
// Public Transparency Dashboard
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PieChart, BarChart } from '@/components/Charts';

export default function TransparencyDashboard() {
  const [stats, setStats] = useState({
    total_raised: 0,
    total_allocated: 0,
    total_disbursed: 0,
    active_donors: 0
  });
  
  const [allocations, setAllocations] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      // Get aggregate stats
      const { data: statsData } = await supabase.rpc('get_donation_stats');
      setStats(statsData);
      
      // Get allocation breakdown
      const { data: allocationData } = await supabase.rpc('get_allocation_breakdown');
      setAllocations(allocationData);
      
      // Get recent donations (anonymized if requested)
      const { data: donationsData } = await supabase
        .from('donations')
        .select('amount, donor_name, is_anonymous, created_at, campaign_id')
        .order('created_at', { ascending: false })
        .limit(20);
      
      setRecentDonations(donationsData);
    };
    
    fetchData();
    
    // Real-time subscription for new donations
    const subscription = supabase
      .channel('donations_changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'donations' },
        (payload) => {
          setRecentDonations((prev) => [payload.new, ...prev].slice(0, 20));
          // Update stats
          setStats((prev) => ({
            ...prev,
            total_raised: prev.total_raised + payload.new.net_amount
          }));
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return (
    <div className="transparency-dashboard">
      <h1>Hurricane Melissa Relief - Financial Transparency</h1>
      
      <div className="stats-grid">
        <StatCard 
          title="Total Raised" 
          value={`$${stats.total_raised.toLocaleString()}`}
          subtitle={`From ${stats.active_donors} donors`}
        />
        <StatCard 
          title="Allocated" 
          value={`$${stats.total_allocated.toLocaleString()}`}
          subtitle={`${((stats.total_allocated / stats.total_raised) * 100).toFixed(1)}% of funds`}
        />
        <StatCard 
          title="Disbursed" 
          value={`$${stats.total_disbursed.toLocaleString()}`}
          subtitle="Direct aid delivered"
        />
      </div>
      
      <div className="charts-grid">
        <div className="chart-container">
          <h2>Fund Allocation</h2>
          <PieChart 
            data={allocations.map(a => ({
              category: a.category,
              value: a.amount,
              percentage: (a.amount / stats.total_allocated * 100).toFixed(1)
            }))}
          />
        </div>
        
        <div className="chart-container">
          <h2>Donations Timeline</h2>
          <BarChart data={/* timeline data */} />
        </div>
      </div>
      
      <div className="recent-donations">
        <h2>Recent Donations</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Donor</th>
              <th>Amount</th>
              <th>Campaign</th>
            </tr>
          </thead>
          <tbody>
            {recentDonations.map((donation) => (
              <tr key={donation.id}>
                <td>{new Date(donation.created_at).toLocaleDateString()}</td>
                <td>{donation.is_anonymous ? 'Anonymous' : donation.donor_name}</td>
                <td>${donation.amount.toLocaleString()}</td>
                <td>{donation.campaign_id || 'General Fund'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// PostgreSQL function for donation stats
CREATE OR REPLACE FUNCTION get_donation_stats()
RETURNS TABLE (
  total_raised DECIMAL,
  total_allocated DECIMAL,
  total_disbursed DECIMAL,
  active_donors BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(net_amount), 0) as total_raised,
    (SELECT COALESCE(SUM(amount), 0) FROM fund_allocations WHERE allocated_date IS NOT NULL) as total_allocated,
    (SELECT COALESCE(SUM(amount), 0) FROM fund_allocations WHERE disbursed_date IS NOT NULL) as total_disbursed,
    COUNT(DISTINCT donor_email) as active_donors
  FROM donations;
END;
$$ LANGUAGE plpgsql;
```

---

## 6. N8N Automation Workflows

### Workflow 1: New Business Verification Email
**Trigger:** New business created in Supabase  
**Actions:**
1. Send welcome email with verification link
2. Create task for admin review
3. Add to business verification queue

### Workflow 2: Claim Submission Notifications
**Trigger:** New relief claim submitted  
**Actions:**
1. Send SMS to claimant with claim number
2. Notify relevant parish coordinator
3. Create verification task
4. Update public stats dashboard

### Workflow 3: Donation Receipt Automation
**Trigger:** Successful Stripe payment  
**Actions:**
1. Create donation record in Supabase
2. Generate PDF tax receipt
3. Send email with receipt
4. Update transparency dashboard
5. Add to mailing list (with consent)

### Workflow 4: Distribution Event Reminders
**Trigger:** 24 hours before scheduled distribution  
**Actions:**
1. Send SMS to all registered claimants
2. Send WhatsApp message with location map
3. Notify staff coordinators
4. Update event status

---

## 7. Mobile Experience Priorities

### Mobile-First Design Principles
1. **Progressive Web App (PWA)** capabilities
2. **Offline Mode** for claim submissions (sync when online)
3. **Camera Integration** for damage photos
4. **GPS Location** for accurate addressing
5. **One-Tap Actions** (call, WhatsApp, directions)
6. **Low Bandwidth Optimization** (image compression, lazy loading)

### Mobile Navigation Structure
```
Home
├── Find Businesses
│   ├── Search
│   ├── Categories
│   ├── Map View
│   └── Favorites
├── Submit Relief Claim
│   ├── Personal Info
│   ├── Damage Assessment
│   ├── Photo Upload
│   └── Submit
├── Track My Claim
│   └── Claim Status
├── Donate
│   ├── Quick Donate
│   ├── Campaigns
│   └── Transparency
└── Account
    ├── My Business
    ├── My Claims
    ├── My Donations
    └── Settings
```

---

## 8. Integration with Existing JCCI Infrastructure

### WordPress Integration Points
- **Header/Footer:** Consistent JCCI branding
- **Authentication:** WordPress users sync to Supabase
- **Blog/News:** Pull from WordPress REST API
- **Static Pages:** About, Contact, etc. remain in WordPress

### Stripe Connect Implementation
- **Individual Donations:** Standard Stripe Checkout
- **Recurring Donations:** Stripe Subscriptions
- **Business Fees (Future):** Featured listings, premium services
- **Wallet Loads:** Integration with TeraWallet

### PassKit Wallet Integration
- **Digital ID Cards:** For relief recipients
- **Donation Receipts:** Add to Apple/Google Wallet
- **Business Cards:** For business owners
- **Event Tickets:** Distribution event passes

---

## 9. Reference Implementation: California Victim Compensation Board (CalVCB)

### Key Features to Emulate

#### 1. Claim Process Transparency
**CalVCB Approach:**
- Clear step-by-step process visualization
- Status tracking with estimated timelines
- Automated email/SMS updates at each stage

**JCCI Implementation:**
```jsx
const claimStages = [
  { id: 1, name: 'Submitted', description: 'Your claim has been received' },
  { id: 2, name: 'Under Review', description: 'Partner organization is verifying details' },
  { id: 3, name: 'Approved', description: 'Claim approved, supplies allocated' },
  { id: 4, name: 'Scheduled', description: 'Distribution event scheduled' },
  { id: 5, name: 'Fulfilled', description: 'Aid received and confirmed' }
];

export default function ClaimStatus({ claimNumber }) {
  const [claim, setClaim] = useState(null);
  
  useEffect(() => {
    const fetchClaim = async () => {
      const { data } = await supabase
        .from('relief_claims')
        .select('*')
        .eq('claim_number', claimNumber)
        .single();
      
      setClaim(data);
    };
    
    fetchClaim();
    
    // Real-time updates
    const subscription = supabase
      .channel(`claim_${claimNumber}`)
      .on('postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'relief_claims',
          filter: `claim_number=eq.${claimNumber}`
        },
        (payload) => {
          setClaim(payload.new);
        }
      )
      .subscribe();
    
    return () => subscription.unsubscribe();
  }, [claimNumber]);
  
  return (
    <div className="claim-status-tracker">
      <h2>Claim Status: {claimNumber}</h2>
      <div className="status-timeline">
        {claimStages.map((stage, index) => {
          const currentStageIndex = claimStages.findIndex(
            s => s.name.toLowerCase() === claim?.status
          );
          const isComplete = index <= currentStageIndex;
          const isCurrent = index === currentStageIndex;
          
          return (
            <div 
              key={stage.id} 
              className={`stage ${isComplete ? 'complete' : ''} ${isCurrent ? 'current' : ''}`}
            >
              <div className="stage-marker">{isComplete ? '✓' : index + 1}</div>
              <div className="stage-info">
                <h3>{stage.name}</h3>
                <p>{stage.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

#### 2. Document Upload System
**CalVCB Approach:**
- Drag-and-drop interface
- Progress indicators
- Supported formats clearly listed
- Automatic virus scanning

**JCCI Implementation:**
- Use Supabase Storage with RLS policies
- Client-side image compression before upload
- Progress feedback during upload
- Support for multiple formats (JPEG, PNG, PDF)

#### 3. Eligibility Verification
**CalVCB Approach:**
- Pre-screening questionnaire
- Clear eligibility criteria
- Denial reasons explained
- Appeal process outlined

**JCCI Implementation:**
```jsx
const eligibilityQuestions = [
  {
    id: 'affected_by_melissa',
    question: 'Was your home or property affected by Hurricane Melissa?',
    type: 'boolean',
    required: true
  },
  {
    id: 'jamaica_resident',
    question: 'Are you a resident of Jamaica?',
    type: 'boolean',
    required: true
  },
  {
    id: 'previous_aid',
    question: 'Have you received aid from other sources for Hurricane Melissa?',
    type: 'boolean',
    info: 'This will not disqualify you, but helps us coordinate assistance.'
  }
];

export default function EligibilityCheck({ onComplete }) {
  const [answers, setAnswers] = useState({});
  
  const checkEligibility = () => {
    const isEligible = answers.affected_by_melissa && answers.jamaica_resident;
    onComplete(isEligible, answers);
  };
  
  return (
    <div className="eligibility-check">
      <h2>Check Your Eligibility</h2>
      {eligibilityQuestions.map((q) => (
        <div key={q.id} className="question">
          <label>{q.question}</label>
          {q.type === 'boolean' && (
            <div className="radio-group">
              <label>
                <input 
                  type="radio" 
                  name={q.id}
                  value="true"
                  onChange={() => setAnswers({ ...answers, [q.id]: true })}
                />
                Yes
              </label>
              <label>
                <input 
                  type="radio" 
                  name={q.id}
                  value="false"
                  onChange={() => setAnswers({ ...answers, [q.id]: false })}
                />
                No
              </label>
            </div>
          )}
          {q.info && <p className="info-text">{q.info}</p>}
        </div>
      ))}
      <button onClick={checkEligibility}>Check Eligibility</button>
    </div>
  );
}
```

---

## 10. Security & Privacy

### Data Protection Measures
1. **Supabase Row Level Security (RLS):** Enforce access control at database level
2. **API Keys:** Environment variables, never exposed to client
3. **Rate Limiting:** Prevent abuse of public endpoints
4. **SQL Injection Prevention:** Parameterized queries only
5. **XSS Protection:** Content Security Policy headers
6. **HTTPS Only:** Enforce SSL for all connections

### Privacy Considerations
1. **Anonymous Donations:** Option to hide donor name
2. **Sensitive Data:** National ID numbers encrypted at rest
3. **Photo Permissions:** Claimants consent to public use (if any)
4. **Data Retention:** Clear policies on how long data is kept
5. **Right to Deletion:** Users can request data removal

### Compliance
- **GDPR Compliance:** For European diaspora users
- **CCPA Compliance:** For California-based users
- **501(c)(3) Requirements:** Financial reporting, donor privacy

---

## 11. Performance Targets

### Load Time Goals
- **Business Directory:** < 2 seconds (LCP)
- **Claim Submission Form:** < 1.5 seconds
- **Transparency Dashboard:** < 2.5 seconds (with charts)
- **Mobile:** < 3 seconds on 3G

### Optimization Strategies
1. **Image Optimization:** WebP format, lazy loading, responsive images
2. **Code Splitting:** Load only necessary JavaScript
3. **CDN:** Cloudflare for static assets
4. **Database Indexing:** Ensure all queries use indexes
5. **Caching:** Redis for frequently accessed data
6. **Real-time Only When Needed:** Don't subscribe to everything

### Scalability Targets
- **Concurrent Users:** 10,000+
- **Total Businesses:** 100,000+
- **Total Claims:** 500,000+
- **Database Size:** 100GB+
- **Storage:** 1TB+ (photos, documents)

---

## 12. Analytics & Metrics

### Key Performance Indicators (KPIs)

#### Business Directory Metrics
- New businesses listed per week
- Average time to verification
- Search queries per day
- Business profile views
- Contact click-through rate
- User engagement (favorites, shares)

#### Relief Operations Metrics
- Claims submitted per day
- Average verification time
- Approval rate
- Distribution efficiency (people served per event)
- Beneficiary satisfaction (post-distribution survey)

#### Fundraising Metrics
- Total raised vs. goal
- Average donation size
- Donor retention rate
- Campaign conversion rate
- Social media referral rate

### Analytics Implementation
```javascript
// Custom analytics tracking with Supabase
const trackEvent = async (eventName, properties = {}) => {
  await supabase
    .from('analytics_events')
    .insert({
      event_name: eventName,
      properties: properties,
      user_id: supabase.auth.user()?.id,
      session_id: getSessionId(),
      timestamp: new Date().toISOString()
    });
};

// Example usage
trackEvent('business_search', {
  query: searchQuery,
  filters: activeFilters,
  results_count: results.length
});

trackEvent('claim_submitted', {
  claim_number: claimNumber,
  parish: parish,
  damage_type: damageType
});

trackEvent('donation_completed', {
  amount: donationAmount,
  campaign: campaignId,
  payment_method: 'stripe'
});
```

---

## 13. Launch Phases

### Phase 1: MVP Launch (Weeks 1-4)
**Goal:** Core functionality live for Hurricane Melissa relief

**Features:**
- Business directory (basic search, no reviews yet)
- Relief claim submission
- Claim verification dashboard (partner access)
- Basic transparency dashboard
- Donation processing via Stripe

**Success Criteria:**
- 1,000+ businesses listed
- 5,000+ relief claims submitted
- $1M raised

### Phase 2: Enhanced Features (Weeks 5-8)
**Features:**
- Reviews and ratings
- Advanced search (map view, filters)
- Distribution event scheduling
- Mobile app (PWA)
- SMS notifications via Twilio
- N8N workflow automation

**Success Criteria:**
- 5,000+ businesses listed
- 20,000+ relief claims processed
- $5M raised

### Phase 3: Platform Expansion (Weeks 9-12)
**Features:**
- Digital wallet integration (PassKit)
- Multi-language support (English, Patois)
- Business premium features (promoted listings)
- Advanced analytics dashboard
- API for third-party integrations

**Success Criteria:**
- 10,000+ businesses listed across 50+ countries
- 100,000+ platform users
- $10M raised
- Self-sustaining revenue model

---

## 14. Budget & Resources

### Development Costs (Estimated)

#### Infrastructure (Monthly)
- Supabase Pro: $25/month
- DigitalOcean/Vercel hosting: $50/month
- Cloudflare CDN: $20/month
- Twilio SMS: $200/month (estimated 10,000 SMS)
- Domain & SSL: $15/month
- **Total:** ~$310/month

#### Third-Party Services
- Stripe: 2.9% + $0.30 per transaction
- N8N Cloud: $20/month or self-hosted
- Google Maps API: $200/month credit (should cover initial usage)

#### Development Time (Claude Code Web)
- Phase 1 MVP: ~40 hours
- Phase 2 Features: ~30 hours
- Phase 3 Expansion: ~20 hours
- **Total:** ~90 hours of AI-assisted development

### Revenue Model
1. **Transaction Fees:** 2.5% on JCCIX wallet loads (50% to nonprofit)
2. **Premium Business Listings:** $50-200/year
3. **Corporate Sponsorships:** Featured placement on transparency dashboard
4. **Grants:** Apply for disaster relief and diaspora development grants

---

## 15. Risk Mitigation

### Technical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Supabase outage | High | Low | Implement caching, status page |
| Database performance issues | Medium | Medium | Optimize queries, add indexes |
| Stripe API errors | High | Low | Retry logic, error handling |
| Photo storage costs | Medium | High | Image compression, storage limits |

### Operational Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Fraudulent claims | High | Medium | Multi-step verification, partner confirmation |
| Donor mistrust | High | Low | Radical transparency, third-party audit |
| Partner coordination failure | Medium | Medium | Clear SLAs, backup partners |
| Overwhelming claim volume | Medium | High | Prioritization system, phased rollout |

### Legal Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data breach | High | Low | Security best practices, insurance |
| Privacy violations | High | Low | Legal review, clear consent |
| Tax compliance | Medium | Low | CPA oversight, automated receipts |

---

## 16. Success Metrics & KPIs

### 60-Day Targets (Hurricane Melissa Relief)
- **$10,000,000** total raised
- **400,000** people assisted
- **50,000** relief claims processed
- **100%** donation transparency (every dollar tracked)

### 6-Month Targets (Platform Growth)
- **10,000+** business listings
- **100,000** registered users
- **50+** countries represented
- **4.5+** average business rating
- **90%+** claim approval rate (eligible claims)

### 12-Month Targets (Sustainability)
- **25,000+** business listings
- **500,000** platform users
- **$2M** annual revenue (conscious capitalism model)
- **100+** Safe Zone Hubs established across Jamaica
- **Breakeven** operational costs through transaction fees

---

## 17. Accessibility Standards

### WCAG 2.1 Level AA Compliance
- Color contrast ratios 4.5:1 minimum
- Keyboard navigation for all features
- Screen reader compatibility
- Alt text for all images
- Closed captions for video content
- Form labels and error messages

### Multilingual Support (Phase 3)
- English (default)
- Jamaican Patois
- Spanish (for Latin American diaspora)

---

## 18. Documentation Requirements

### User Documentation
- How to create a business listing (video + text)
- How to submit a relief claim (video + text)
- How to make a donation
- FAQ section

### Partner Documentation
- Claim verification guide
- Distribution event planning guide
- Reporting requirements
- API documentation (Phase 3)

### Developer Documentation
- Supabase schema documentation
- API endpoints (if exposed)
- N8N workflow documentation
- Deployment guide

---

## 19. Testing Strategy

### Automated Testing
- Unit tests for critical functions
- Integration tests for Supabase queries
- End-to-end tests for key user flows

### Manual Testing
- Cross-browser testing (Chrome, Safari, Firefox)
- Mobile device testing (iOS, Android)
- Accessibility testing with screen readers
- Load testing with simulated traffic

### User Acceptance Testing (UAT)
- Beta test with 50 diaspora users
- Partner organization feedback sessions
- Focus group for claim submission experience

---

## 20. Post-Launch Support Plan

### Monitoring
- Uptime monitoring (99.9% target)
- Error tracking (Sentry or similar)
- Performance monitoring (Core Web Vitals)
- User feedback collection

### Maintenance
- Weekly database backups
- Monthly security patches
- Quarterly feature updates
- Annual third-party security audit

### Support Channels
- Email: support@jccint.org
- WhatsApp: +1-XXX-XXX-XXXX
- Live chat (business hours)
- Knowledge base / Help Center

---

## Appendix A: Database Schema Diagram

```mermaid
erDiagram
    USERS ||--o{ BUSINESSES : creates
    USERS ||--o{ RELIEF_CLAIMS : submits
    USERS ||--o{ DONATIONS : makes
    USERS ||--o{ BUSINESS_REVIEWS : writes
    
    BUSINESSES ||--o{ BUSINESS_REVIEWS : receives
    BUSINESSES }o--|| BUSINESS_CATEGORIES : belongs_to
    
    RELIEF_CLAIMS ||--o{ DISTRIBUTION_EVENTS : scheduled_for
    
    DONATIONS ||--o{ FUND_ALLOCATIONS : allocated_to
    DONATIONS }o--|| CAMPAIGNS : supports
    
    RELIEF_INVENTORY ||--o{ RELIEF_CLAIMS : allocated_to
```

---

## Appendix B: User Flow Diagrams

### Business Listing Creation Flow
```
Start
  → Sign Up / Login
  → Complete Profile
  → Create Business Listing
    → Enter Basic Info
    → Add Location
    → Upload Images
    → Set Business Hours
    → Add Contact Methods
  → Submit for Verification
  → Receive Verification Email
  → Admin Reviews
    → Approved → Listing Live
    → Rejected → Edit & Resubmit
```

### Relief Claim Submission Flow
```
Start
  → Eligibility Check
    → Eligible → Continue
    → Not Eligible → Show Resources
  → Enter Personal Info
  → Add Location
  → Assess Damage
    → Select Damage Types
    → Upload Photos
  → Specify Immediate Needs
  → Review & Submit
  → Receive Claim Number (SMS)
  → Track Claim Status
    → Submitted → Under Review → Approved → Scheduled → Fulfilled
```

---

## Appendix C: Sample N8N Workflows (JSON)

### Workflow: New Claim SMS Notification
```json
{
  "nodes": [
    {
      "name": "Supabase Trigger",
      "type": "n8n-nodes-base.supabaseTrigger",
      "parameters": {
        "event": "INSERT",
        "table": "relief_claims"
      }
    },
    {
      "name": "Format SMS Message",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "const claim = items[0].json;\nconst message = `JCCI Relief: Your claim ${claim.claim_number} has been received. We will contact you within 48 hours. Track status: jccint.org/track`;\nreturn [{ json: { to: claim.phone, message } }];"
      }
    },
    {
      "name": "Send SMS (Twilio)",
      "type": "n8n-nodes-base.twilio",
      "parameters": {
        "operation": "send",
        "from": "={{ $env.TWILIO_FROM_NUMBER }}",
        "to": "={{ $json.to }}",
        "message": "={{ $json.message }}"
      }
    }
  ]
}
```

---

## Appendix D: Sample API Endpoints

### Public API (Phase 3)
```
GET  /api/v1/businesses
  - Query params: ?search, ?category, ?country, ?lat, ?lng, ?radius
  
GET  /api/v1/businesses/:id

POST /api/v1/businesses
  - Requires authentication

GET  /api/v1/categories

GET  /api/v1/transparency/stats
  - Returns public donation statistics

POST /api/v1/claims
  - Public endpoint for claim submission

GET  /api/v1/claims/:claim_number
  - Public claim status lookup
```

---

## Appendix E: Environment Variables Template

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Twilio
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_FROM_NUMBER=+1234567890

# N8N
N8N_WEBHOOK_URL=https://your-n8n.com/webhook/
N8N_API_KEY=xxx

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyxxx

# Application
NEXT_PUBLIC_APP_URL=https://jccint.org
NODE_ENV=production
```

---

## Conclusion

This PRD provides a comprehensive blueprint for building JCCI's Global Business Directory and Hurricane Melissa Relief Claims System. The platform combines cutting-edge technology (Supabase, real-time subscriptions, N8N automation) with compassionate disaster relief coordination and radical transparency.

**Next Steps:**
1. Review and approve this PRD
2. Set up development environment (Supabase project, Stripe account, etc.)
3. Begin Phase 1 development with Claude Code Web
4. Recruit beta testers from diaspora community
5. Launch MVP within 4 weeks

**Key Success Factors:**
- **Speed:** Hurricane Melissa victims need aid now - prioritize fast deployment
- **Trust:** Radical transparency builds donor confidence
- **Scalability:** Design for global diaspora from day one
- **Sustainability:** Transaction fee model ensures long-term viability

**Questions or Clarifications:**
Contact Don at JCCI for any technical specifications, branding guidelines, or partnership details.

---

**Document History:**
- v1.0 - November 18, 2025 - Initial PRD created for Claude Code Web implementation