-- ============================================================================
-- RELIEF CLAIMS SYSTEM - DATABASE SCHEMA
-- ============================================================================
-- This schema is based on the JCC PRD specifications for disaster relief
-- claim management, donations, and distribution tracking.
-- ============================================================================

-- ============================================================================
-- TABLE: relief_claims
-- Purpose: Tracks disaster relief claims from victims
-- ============================================================================
CREATE TABLE IF NOT EXISTS relief_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Claim Identification
  claim_number TEXT UNIQUE NOT NULL,

  -- Claimant Information
  claimant_name TEXT NOT NULL,
  claimant_email TEXT,
  claimant_phone TEXT NOT NULL,
  claimant_whatsapp TEXT,
  national_id TEXT,

  -- Location Details
  address TEXT NOT NULL,
  parish TEXT NOT NULL,
  community TEXT,
  gps_coordinates POINT,

  -- Damage Assessment
  damage_type TEXT[] NOT NULL, -- ['structural', 'flooding', 'roof', 'electrical', 'water_system', 'other']
  damage_severity TEXT CHECK (damage_severity IN ('minor', 'moderate', 'severe', 'total_loss')),
  damage_description TEXT,
  damage_photos TEXT[], -- Array of image URLs
  estimated_loss DECIMAL(10, 2),

  -- Household Information
  household_size INTEGER DEFAULT 1,
  children_count INTEGER DEFAULT 0,
  elderly_count INTEGER DEFAULT 0,
  disabled_count INTEGER DEFAULT 0,

  -- Immediate Needs
  immediate_needs TEXT[], -- ['shelter', 'food', 'water', 'medical', 'clothing', 'bedding', 'sanitation']
  special_requirements TEXT,

  -- Verification & Approval
  verification_status TEXT DEFAULT 'submitted'
    CHECK (verification_status IN ('submitted', 'under_review', 'verified', 'approved', 'fulfilled', 'rejected')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,

  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  approved_items JSONB, -- Structured data of approved relief items

  -- Priority & Distribution
  priority_level TEXT DEFAULT 'standard'
    CHECK (priority_level IN ('urgent', 'high', 'standard', 'low')),
  distribution_scheduled_date TIMESTAMPTZ,
  distribution_event_id UUID REFERENCES distribution_events(id),
  pickup_confirmed BOOLEAN DEFAULT FALSE,
  pickup_confirmed_at TIMESTAMPTZ,

  -- Transparency & Notes
  public_notes TEXT, -- Visible to claimant
  internal_notes TEXT, -- Staff only

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Indexes for performance
CREATE INDEX idx_relief_claims_parish ON relief_claims(parish);
CREATE INDEX idx_relief_claims_status ON relief_claims(verification_status);
CREATE INDEX idx_relief_claims_priority ON relief_claims(priority_level);
CREATE INDEX idx_relief_claims_claim_number ON relief_claims(claim_number);
CREATE INDEX idx_relief_claims_created_at ON relief_claims(created_at DESC);
CREATE INDEX idx_relief_claims_phone ON relief_claims(claimant_phone);

-- ============================================================================
-- TABLE: donations
-- Purpose: Tracks monetary donations for disaster relief
-- ============================================================================
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Donor Information
  donor_name TEXT,
  donor_email TEXT,
  donor_phone TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,

  -- Payment Details
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'USD',
  payment_method TEXT CHECK (payment_method IN ('stripe', 'paypal', 'check', 'wire', 'cash', 'other')),

  -- Payment Gateway Integration
  stripe_payment_id TEXT,
  stripe_customer_id TEXT,
  paypal_transaction_id TEXT,
  transaction_fee DECIMAL(10, 2) DEFAULT 0,
  net_amount DECIMAL(10, 2) GENERATED ALWAYS AS (amount - transaction_fee) STORED,

  -- Campaign & Allocation
  campaign_id UUID REFERENCES campaigns(id),
  allocation_status TEXT DEFAULT 'unallocated'
    CHECK (allocation_status IN ('unallocated', 'allocated', 'disbursed')),

  -- Tax & Receipts
  tax_receipt_issued BOOLEAN DEFAULT FALSE,
  tax_receipt_url TEXT,
  tax_receipt_number TEXT,

  -- Metadata
  donated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Indexes
CREATE INDEX idx_donations_campaign ON donations(campaign_id);
CREATE INDEX idx_donations_status ON donations(allocation_status);
CREATE INDEX idx_donations_date ON donations(donated_at DESC);
CREATE INDEX idx_donations_email ON donations(donor_email);

-- ============================================================================
-- TABLE: relief_inventory
-- Purpose: Tracks physical relief supplies and inventory
-- ============================================================================
CREATE TABLE IF NOT EXISTS relief_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Item Details
  item_name TEXT NOT NULL,
  item_category TEXT CHECK (item_category IN (
    'food', 'water', 'clothing', 'bedding', 'shelter_materials',
    'medical', 'sanitation', 'tools', 'household', 'other'
  )),
  description TEXT,
  unit TEXT DEFAULT 'unit', -- 'unit', 'box', 'kg', 'liter', etc.

  -- Quantity Management
  quantity_available INTEGER DEFAULT 0 CHECK (quantity_available >= 0),
  quantity_allocated INTEGER DEFAULT 0 CHECK (quantity_allocated >= 0),
  quantity_distributed INTEGER DEFAULT 0 CHECK (quantity_distributed >= 0),
  reorder_threshold INTEGER DEFAULT 0,

  -- Storage & Source
  storage_location TEXT,
  warehouse TEXT,
  supplier TEXT,
  cost_per_unit DECIMAL(10, 2),

  -- Dates
  received_date DATE,
  expiration_date DATE,
  last_restock_date DATE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_relief_inventory_category ON relief_inventory(item_category);
CREATE INDEX idx_relief_inventory_available ON relief_inventory(quantity_available);

-- ============================================================================
-- TABLE: distribution_events
-- Purpose: Manages relief distribution events and logistics
-- ============================================================================
CREATE TABLE IF NOT EXISTS distribution_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event Details
  event_name TEXT NOT NULL,
  event_type TEXT CHECK (event_type IN ('pickup', 'delivery', 'mobile_distribution')),
  description TEXT,

  -- Location & Timing
  parish TEXT NOT NULL,
  location_name TEXT,
  address TEXT,
  gps_coordinates POINT,
  scheduled_date TIMESTAMPTZ NOT NULL,
  start_time TIME,
  end_time TIME,

  -- Capacity & Participation
  capacity INTEGER,
  registered_count INTEGER DEFAULT 0,
  served_count INTEGER DEFAULT 0,

  -- Staff & Partners
  coordinator_id UUID REFERENCES auth.users(id),
  staff_assigned UUID[],
  partner_organizations TEXT[],

  -- Status
  status TEXT DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Indexes
CREATE INDEX idx_distribution_events_parish ON distribution_events(parish);
CREATE INDEX idx_distribution_events_status ON distribution_events(status);
CREATE INDEX idx_distribution_events_date ON distribution_events(scheduled_date);

-- ============================================================================
-- TABLE: campaigns
-- Purpose: Manages fundraising campaigns for disaster relief
-- ============================================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Campaign Details
  campaign_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  campaign_image_url TEXT,

  -- Goals & Amounts
  goal_amount DECIMAL(12, 2) NOT NULL CHECK (goal_amount > 0),
  raised_amount DECIMAL(12, 2) DEFAULT 0 CHECK (raised_amount >= 0),
  currency TEXT DEFAULT 'USD',

  -- Timeline
  start_date DATE NOT NULL,
  end_date DATE,

  -- Status
  status TEXT DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),

  -- Visibility
  is_featured BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_slug ON campaigns(slug);
CREATE INDEX idx_campaigns_featured ON campaigns(is_featured) WHERE is_featured = TRUE;

-- ============================================================================
-- TABLE: fund_allocations
-- Purpose: Tracks how donations are allocated and spent (transparency)
-- ============================================================================
CREATE TABLE IF NOT EXISTS fund_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source
  donation_id UUID REFERENCES donations(id),
  campaign_id UUID REFERENCES campaigns(id),

  -- Allocation Details
  allocation_type TEXT CHECK (allocation_type IN ('relief_supplies', 'operational', 'program')),
  category TEXT, -- More specific category
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,

  -- Recipient
  recipient_type TEXT CHECK (recipient_type IN ('individual_claim', 'partner_org', 'vendor')),
  claim_id UUID REFERENCES relief_claims(id),
  recipient_name TEXT,

  -- Documentation
  receipt_url TEXT,
  proof_of_delivery_url TEXT,

  -- Metadata
  allocated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Indexes
CREATE INDEX idx_fund_allocations_donation ON fund_allocations(donation_id);
CREATE INDEX idx_fund_allocations_claim ON fund_allocations(claim_id);
CREATE INDEX idx_fund_allocations_type ON fund_allocations(allocation_type);
CREATE INDEX idx_fund_allocations_date ON fund_allocations(allocated_at DESC);

-- ============================================================================
-- FUNCTIONS: Auto-generate claim numbers
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_claim_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  claim_num TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');

  -- Get the next sequence number for this year
  SELECT COUNT(*) + 1 INTO sequence_num
  FROM relief_claims
  WHERE claim_number LIKE 'HM-' || year_part || '-%';

  claim_num := 'HM-' || year_part || '-' || LPAD(sequence_num::TEXT, 5, '0');

  RETURN claim_num;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS: Auto-update timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_relief_claims_updated_at
  BEFORE UPDATE ON relief_claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relief_inventory_updated_at
  BEFORE UPDATE ON relief_inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_distribution_events_updated_at
  BEFORE UPDATE ON distribution_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE relief_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE relief_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_allocations ENABLE ROW LEVEL SECURITY;

-- Relief Claims Policies
-- Public can submit claims (insert only)
CREATE POLICY "Anyone can submit relief claims"
  ON relief_claims FOR INSERT
  TO public
  WITH CHECK (true);

-- Claimants can view their own claims by phone number
CREATE POLICY "Claimants can view own claims"
  ON relief_claims FOR SELECT
  TO public
  USING (claimant_phone = current_setting('request.jwt.claims', true)::json->>'phone');

-- Authenticated staff can view all claims
CREATE POLICY "Staff can view all claims"
  ON relief_claims FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated staff can update claims
CREATE POLICY "Staff can update claims"
  ON relief_claims FOR UPDATE
  TO authenticated
  USING (true);

-- Campaigns Policies
-- Public can view active campaigns
CREATE POLICY "Public can view active campaigns"
  ON campaigns FOR SELECT
  TO public
  USING (status = 'active' AND is_visible = true);

-- Authenticated users can manage campaigns
CREATE POLICY "Authenticated users can manage campaigns"
  ON campaigns FOR ALL
  TO authenticated
  USING (true);

-- Donations Policies
-- Public can insert donations
CREATE POLICY "Anyone can make donations"
  ON donations FOR INSERT
  TO public
  WITH CHECK (true);

-- Authenticated users can view all donations
CREATE POLICY "Authenticated users can view donations"
  ON donations FOR SELECT
  TO authenticated
  USING (true);

-- Distribution Events Policies
-- Public can view upcoming events
CREATE POLICY "Public can view distribution events"
  ON distribution_events FOR SELECT
  TO public
  USING (status IN ('scheduled', 'in_progress'));

-- Authenticated users can manage events
CREATE POLICY "Authenticated users can manage events"
  ON distribution_events FOR ALL
  TO authenticated
  USING (true);

-- Inventory Policies
-- Only authenticated users can access inventory
CREATE POLICY "Authenticated users can manage inventory"
  ON relief_inventory FOR ALL
  TO authenticated
  USING (true);

-- Fund Allocations Policies
-- Public can view allocations (transparency)
CREATE POLICY "Public can view fund allocations"
  ON fund_allocations FOR SELECT
  TO public
  USING (true);

-- Only authenticated users can create allocations
CREATE POLICY "Authenticated users can create allocations"
  ON fund_allocations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- VIEWS: Useful aggregated data
-- ============================================================================

-- View: Claims Summary by Parish
CREATE OR REPLACE VIEW claims_by_parish AS
SELECT
  parish,
  COUNT(*) as total_claims,
  COUNT(*) FILTER (WHERE verification_status = 'submitted') as submitted,
  COUNT(*) FILTER (WHERE verification_status = 'under_review') as under_review,
  COUNT(*) FILTER (WHERE verification_status = 'verified') as verified,
  COUNT(*) FILTER (WHERE verification_status = 'approved') as approved,
  COUNT(*) FILTER (WHERE verification_status = 'fulfilled') as fulfilled,
  COUNT(*) FILTER (WHERE priority_level = 'urgent') as urgent_claims
FROM relief_claims
GROUP BY parish;

-- View: Donation Summary
CREATE OR REPLACE VIEW donation_summary AS
SELECT
  COUNT(*) as total_donations,
  SUM(amount) as total_amount,
  SUM(net_amount) as total_net_amount,
  AVG(amount) as average_donation,
  COUNT(*) FILTER (WHERE allocation_status = 'unallocated') as unallocated_count,
  SUM(amount) FILTER (WHERE allocation_status = 'unallocated') as unallocated_amount
FROM donations;

-- View: Campaign Progress
CREATE OR REPLACE VIEW campaign_progress AS
SELECT
  c.id,
  c.campaign_name,
  c.goal_amount,
  COALESCE(SUM(d.amount), 0) as current_raised,
  c.goal_amount - COALESCE(SUM(d.amount), 0) as remaining,
  ROUND((COALESCE(SUM(d.amount), 0) / c.goal_amount * 100)::numeric, 2) as percentage_complete,
  COUNT(d.id) as donation_count
FROM campaigns c
LEFT JOIN donations d ON d.campaign_id = c.id
WHERE c.status = 'active'
GROUP BY c.id, c.campaign_name, c.goal_amount;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Uncomment to insert sample campaign
-- INSERT INTO campaigns (campaign_name, slug, description, goal_amount, start_date, status)
-- VALUES (
--   'Hurricane Relief 2025',
--   'hurricane-relief-2025',
--   'Emergency relief for families affected by Hurricane season 2025',
--   100000.00,
--   CURRENT_DATE,
--   'active'
-- );

COMMENT ON TABLE relief_claims IS 'Tracks disaster relief claims from victims';
COMMENT ON TABLE donations IS 'Tracks monetary donations for disaster relief';
COMMENT ON TABLE relief_inventory IS 'Manages physical relief supplies inventory';
COMMENT ON TABLE distribution_events IS 'Manages relief distribution events and logistics';
COMMENT ON TABLE campaigns IS 'Manages fundraising campaigns';
COMMENT ON TABLE fund_allocations IS 'Tracks donation allocation for transparency';
