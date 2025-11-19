-- JCCI Directory & Relief Claims System - Complete Database Schema
-- Execute this in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================================
-- BUSINESS DIRECTORY TABLES
-- ============================================================================

-- Business Categories
CREATE TABLE business_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    parent_id UUID REFERENCES business_categories(id),
    description TEXT,
    icon_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Businesses Directory
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
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
    rating_average DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),

    -- Search optimization
    search_vector TSVECTOR
);

-- Business Reviews & Ratings
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

-- ============================================================================
-- RELIEF CLAIMS SYSTEM
-- ============================================================================

-- Relief Claims
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
    fulfilled_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id)
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

-- ============================================================================
-- DONATIONS & TRANSPARENCY
-- ============================================================================

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

-- ============================================================================
-- USER PROFILES
-- ============================================================================

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

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Business Indexes
CREATE INDEX idx_businesses_location ON businesses USING GIST(coordinates);
CREATE INDEX idx_businesses_category ON businesses(category);
CREATE INDEX idx_businesses_verification ON businesses(verification_status);
CREATE INDEX idx_businesses_search ON businesses USING GIN(search_vector);
CREATE INDEX idx_businesses_slug ON businesses(slug);

-- Relief Claims Indexes
CREATE INDEX idx_relief_claims_status ON relief_claims(verification_status, status);
CREATE INDEX idx_relief_claims_parish ON relief_claims(parish);
CREATE INDEX idx_relief_claims_location ON relief_claims USING GIST(coordinates);
CREATE INDEX idx_relief_claims_priority ON relief_claims(priority_level, created_at);
CREATE INDEX idx_relief_claims_number ON relief_claims(claim_number);

-- Donations Indexes
CREATE INDEX idx_donations_campaign ON donations(campaign_id);
CREATE INDEX idx_donations_date ON donations(created_at DESC);
CREATE INDEX idx_donations_email ON donations(donor_email);

-- Reviews Indexes
CREATE INDEX idx_reviews_business ON business_reviews(business_id);
CREATE INDEX idx_reviews_user ON business_reviews(user_id);

-- ============================================================================
-- FULL TEXT SEARCH SETUP
-- ============================================================================

-- Function to update business search vector
CREATE OR REPLACE FUNCTION update_business_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.business_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'D') ||
        setweight(to_tsvector('english', COALESCE(NEW.country, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for business search vector
CREATE TRIGGER business_search_vector_update
    BEFORE INSERT OR UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_business_search_vector();

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to increment business views
CREATE OR REPLACE FUNCTION increment_business_views(business_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE businesses
    SET views_count = views_count + 1,
        updated_at = NOW()
    WHERE id = business_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update business rating average
CREATE OR REPLACE FUNCTION update_business_rating(business_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE businesses
    SET
        rating_average = (
            SELECT ROUND(AVG(rating)::numeric, 2)
            FROM business_reviews
            WHERE business_reviews.business_id = businesses.id
            AND moderation_status = 'approved'
        ),
        review_count = (
            SELECT COUNT(*)
            FROM business_reviews
            WHERE business_reviews.business_id = businesses.id
            AND moderation_status = 'approved'
        ),
        updated_at = NOW()
    WHERE id = business_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update business rating after review insert/update
CREATE OR REPLACE FUNCTION trigger_update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_business_rating(NEW.business_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_update_business_rating
    AFTER INSERT OR UPDATE ON business_reviews
    FOR EACH ROW EXECUTE FUNCTION trigger_update_business_rating();

-- Function for geospatial radius search
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
    AND verification_status = 'verified'
    ORDER BY coordinates <-> ST_MakePoint(lng, lat)::geography;
END;
$$ LANGUAGE plpgsql;

-- Function to get donation statistics
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

-- Function to get allocation breakdown
CREATE OR REPLACE FUNCTION get_allocation_breakdown()
RETURNS TABLE (
    category TEXT,
    amount DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        fund_allocations.category,
        SUM(fund_allocations.amount) as amount
    FROM fund_allocations
    WHERE allocated_date IS NOT NULL
    GROUP BY fund_allocations.category
    ORDER BY amount DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE relief_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_reviews ENABLE ROW LEVEL SECURITY;

-- Businesses Policies
CREATE POLICY "Businesses are viewable by everyone"
    ON businesses FOR SELECT
    USING (verification_status = 'verified');

CREATE POLICY "Users can insert their own businesses"
    ON businesses FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own businesses"
    ON businesses FOR UPDATE
    USING (auth.uid() = created_by);

-- Relief Claims Policies
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

CREATE POLICY "Partners and admins can update claims"
    ON relief_claims FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND user_type IN ('partner', 'admin')
        )
    );

-- Donations Policies
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

-- User Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Business Reviews Policies
CREATE POLICY "Reviews are viewable by everyone"
    ON business_reviews FOR SELECT
    USING (moderation_status = 'approved');

CREATE POLICY "Authenticated users can insert reviews"
    ON business_reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
    ON business_reviews FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================================
-- SEED DATA - BUSINESS CATEGORIES
-- ============================================================================

INSERT INTO business_categories (name, slug, description, display_order) VALUES
('Tourism & Hospitality', 'tourism-hospitality', 'Hotels, resorts, tour operators, attractions', 1),
('Restaurants & Food', 'restaurants-food', 'Restaurants, bars, cafes, catering services', 2),
('Professional Services', 'professional-services', 'Legal, accounting, consulting, marketing', 3),
('Culture & Entertainment', 'culture-entertainment', 'Music, arts, events, cultural organizations', 4),
('Agriculture & Farming', 'agriculture-farming', 'Farms, agricultural products, equipment', 5),
('Healthcare & Wellness', 'healthcare-wellness', 'Medical services, pharmacies, wellness centers', 6),
('Technology & IT', 'technology-it', 'Software, IT services, tech products', 7),
('Education & Training', 'education-training', 'Schools, universities, training centers', 8),
('Retail & Shopping', 'retail-shopping', 'Stores, boutiques, online retail', 9),
('Construction & Real Estate', 'construction-real-estate', 'Contractors, developers, real estate agencies', 10),
('Transportation & Logistics', 'transportation-logistics', 'Shipping, delivery, transportation services', 11),
('Finance & Insurance', 'finance-insurance', 'Banks, credit unions, insurance companies', 12);

-- ============================================================================
-- SEED DATA - HURRICANE MELISSA CAMPAIGN
-- ============================================================================

INSERT INTO campaigns (campaign_name, slug, campaign_type, description, goal_amount, start_date, is_active, is_featured) VALUES
('Hurricane Melissa Relief Fund', 'hurricane-melissa-relief', 'disaster_relief',
 'Supporting 400,000+ Hurricane Melissa victims across Jamaica with emergency supplies, shelter, and rebuilding assistance. 100% transparent fund allocation with real-time tracking.',
 10000000.00, NOW(), true, true);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

-- Schema created successfully!
-- Next steps:
-- 1. Add your Supabase credentials to .env.local
-- 2. Run this SQL in your Supabase SQL Editor
-- 3. Configure Stripe and other integrations
-- 4. Start the development server: npm run dev
