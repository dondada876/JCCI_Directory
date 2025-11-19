-- Jamaica Connect - Supabase Database Schema
-- This schema integrates with WordPress (Amelia, ACF) and Next.js

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- BUSINESSES TABLE
-- =====================================================
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    image_url TEXT,
    featured BOOLEAN DEFAULT FALSE,

    -- WordPress Integration
    wp_post_id INTEGER, -- Link to WordPress post if needed

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,

    -- Search optimization
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(address, ''))
    ) STORED
);

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE categories (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NEWS ARTICLES TABLE
-- =====================================================
CREATE TABLE news_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    excerpt TEXT,
    content TEXT,
    author VARCHAR(255),
    author_id UUID,
    published_date DATE,
    image_url TEXT,
    featured BOOLEAN DEFAULT FALSE,

    -- WordPress Integration
    wp_post_id INTEGER,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Search optimization
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, ''))
    ) STORED
);

-- =====================================================
-- BOOKINGS TABLE (Integration with Amelia)
-- =====================================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,

    -- Customer Information
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),

    -- Booking Details
    service_name VARCHAR(255),
    booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, cancelled, completed

    -- Amelia Integration
    amelia_booking_id INTEGER UNIQUE,

    -- Pricing
    price DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'USD',

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- =====================================================
-- CONTACT FORM SUBMISSIONS (Integration with ACF)
-- =====================================================
CREATE TABLE contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Form Data
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT,
    business_listing BOOLEAN DEFAULT FALSE,

    -- ACF Integration
    acf_form_id INTEGER,
    wp_post_id INTEGER,

    -- Status
    status VARCHAR(50) DEFAULT 'new', -- new, read, replied, archived

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- =====================================================
-- BUSINESS HOURS
-- =====================================================
CREATE TABLE business_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0 = Sunday, 1 = Monday, etc.
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(business_id, day_of_week)
);

-- =====================================================
-- REVIEWS / RATINGS
-- =====================================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,

    -- Review Data
    author_name VARCHAR(255) NOT NULL,
    author_email VARCHAR(255),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,

    -- Moderation
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================
CREATE INDEX idx_businesses_category ON businesses(category);
CREATE INDEX idx_businesses_featured ON businesses(featured);
CREATE INDEX idx_businesses_search ON businesses USING gin(search_vector);
CREATE INDEX idx_businesses_wp_post ON businesses(wp_post_id);

CREATE INDEX idx_news_category ON news_articles(category);
CREATE INDEX idx_news_featured ON news_articles(featured);
CREATE INDEX idx_news_published ON news_articles(published_date DESC);
CREATE INDEX idx_news_search ON news_articles USING gin(search_vector);
CREATE INDEX idx_news_wp_post ON news_articles(wp_post_id);

CREATE INDEX idx_bookings_business ON bookings(business_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_amelia ON bookings(amelia_booking_id);

CREATE INDEX idx_contact_status ON contact_submissions(status);
CREATE INDEX idx_contact_created ON contact_submissions(created_at DESC);

CREATE INDEX idx_reviews_business ON reviews(business_id);
CREATE INDEX idx_reviews_status ON reviews(status);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) Policies
-- =====================================================
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public read access for businesses and news
CREATE POLICY "Public can view published businesses" ON businesses
    FOR SELECT USING (true);

CREATE POLICY "Public can view published news" ON news_articles
    FOR SELECT USING (true);

-- Authenticated users can create bookings
CREATE POLICY "Anyone can create bookings" ON bookings
    FOR INSERT WITH CHECK (true);

-- Anyone can submit contact forms
CREATE POLICY "Anyone can submit contact forms" ON contact_submissions
    FOR INSERT WITH CHECK (true);

-- Anyone can submit reviews (pending approval)
CREATE POLICY "Anyone can submit reviews" ON reviews
    FOR INSERT WITH CHECK (true);

-- Public can view approved reviews
CREATE POLICY "Public can view approved reviews" ON reviews
    FOR SELECT USING (status = 'approved');

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news_articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA - Categories
-- =====================================================
INSERT INTO categories (id, name, description, icon, display_order) VALUES
('tourism', 'Tourism & Hospitality', 'Hotels, resorts, tours, and travel services', '🏖️', 1),
('restaurants', 'Restaurants & Dining', 'Authentic Jamaican cuisine and international dining', '🍴', 2),
('services', 'Business Services', 'Professional services for businesses and individuals', '💼', 3),
('culture', 'Arts & Culture', 'Galleries, museums, and cultural experiences', '🎨', 4),
('agriculture', 'Agriculture & Food', 'Local produce, coffee, and agricultural products', '🌾', 5),
('healthcare', 'Healthcare', 'Medical facilities and health services', '🏥', 6),
('technology', 'Technology', 'IT services, software, and tech solutions', '💻', 7),
('education', 'Education', 'Schools, universities, and training centers', '📚', 8);

-- =====================================================
-- VIEWS for Easy Querying
-- =====================================================

-- Featured businesses with category info
CREATE VIEW featured_businesses AS
SELECT
    b.*,
    c.name as category_name,
    c.icon as category_icon
FROM businesses b
LEFT JOIN categories c ON b.category = c.id
WHERE b.featured = true
ORDER BY b.created_at DESC;

-- Latest news articles
CREATE VIEW latest_news AS
SELECT
    n.*
FROM news_articles n
WHERE n.published_date <= CURRENT_DATE
ORDER BY n.published_date DESC, n.created_at DESC;

-- Business statistics
CREATE VIEW business_stats AS
SELECT
    c.id as category_id,
    c.name as category_name,
    COUNT(b.id) as total_businesses,
    COUNT(CASE WHEN b.featured THEN 1 END) as featured_count
FROM categories c
LEFT JOIN businesses b ON c.id = b.category
GROUP BY c.id, c.name
ORDER BY c.display_order;
