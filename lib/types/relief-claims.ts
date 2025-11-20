/**
 * RELIEF CLAIMS SYSTEM - TypeScript Type Definitions
 *
 * This file contains all TypeScript interfaces and types for the relief claims system.
 * These types match the database schema defined in supabase/relief-claims-schema.sql
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export const VERIFICATION_STATUSES = [
  'submitted',
  'under_review',
  'verified',
  'approved',
  'fulfilled',
  'rejected'
] as const;

export type VerificationStatus = typeof VERIFICATION_STATUSES[number];

export const DAMAGE_SEVERITIES = [
  'minor',
  'moderate',
  'severe',
  'total_loss'
] as const;

export type DamageSeverity = typeof DAMAGE_SEVERITIES[number];

export const PRIORITY_LEVELS = [
  'urgent',
  'high',
  'standard',
  'low'
] as const;

export type PriorityLevel = typeof PRIORITY_LEVELS[number];

export const DAMAGE_TYPES = [
  'structural',
  'flooding',
  'roof',
  'electrical',
  'water_system',
  'other'
] as const;

export type DamageType = typeof DAMAGE_TYPES[number];

export const IMMEDIATE_NEEDS = [
  'shelter',
  'food',
  'water',
  'medical',
  'clothing',
  'bedding',
  'sanitation'
] as const;

export type ImmediateNeed = typeof IMMEDIATE_NEEDS[number];

export const JAMAICAN_PARISHES = [
  'Kingston',
  'St. Andrew',
  'St. Thomas',
  'Portland',
  'St. Mary',
  'St. Ann',
  'Trelawny',
  'St. James',
  'Hanover',
  'Westmoreland',
  'St. Elizabeth',
  'Manchester',
  'Clarendon',
  'St. Catherine'
] as const;

export type Parish = typeof JAMAICAN_PARISHES[number];

// ============================================================================
// RELIEF CLAIMS
// ============================================================================

export interface ReliefClaim {
  id: string;

  // Claim Identification
  claim_number: string;

  // Claimant Information
  claimant_name: string;
  claimant_email?: string;
  claimant_phone: string;
  claimant_whatsapp?: string;
  national_id?: string;

  // Location Details
  address: string;
  parish: Parish;
  community?: string;
  gps_coordinates?: {
    latitude: number;
    longitude: number;
  };

  // Damage Assessment
  damage_type: DamageType[];
  damage_severity?: DamageSeverity;
  damage_description?: string;
  damage_photos?: string[];
  estimated_loss?: number;

  // Household Information
  household_size: number;
  children_count: number;
  elderly_count: number;
  disabled_count: number;

  // Immediate Needs
  immediate_needs: ImmediateNeed[];
  special_requirements?: string;

  // Verification & Approval
  verification_status: VerificationStatus;
  verified_by?: string;
  verified_at?: string;
  verification_notes?: string;

  approved_by?: string;
  approved_at?: string;
  approved_items?: ApprovedItems;

  // Priority & Distribution
  priority_level: PriorityLevel;
  distribution_scheduled_date?: string;
  distribution_event_id?: string;
  pickup_confirmed: boolean;
  pickup_confirmed_at?: string;

  // Transparency & Notes
  public_notes?: string;
  internal_notes?: string;

  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface ApprovedItems {
  [category: string]: {
    item: string;
    quantity: number;
    unit: string;
  }[];
}

// Form data for submitting a new claim
export interface ReliefClaimSubmission {
  // Claimant Information
  claimant_name: string;
  claimant_email?: string;
  claimant_phone: string;
  claimant_whatsapp?: string;
  national_id?: string;

  // Location Details
  address: string;
  parish: Parish;
  community?: string;

  // Damage Assessment
  damage_type: DamageType[];
  damage_severity: DamageSeverity;
  damage_description?: string;
  damage_photos?: File[] | string[];
  estimated_loss?: number;

  // Household Information
  household_size: number;
  children_count: number;
  elderly_count: number;
  disabled_count: number;

  // Immediate Needs
  immediate_needs: ImmediateNeed[];
  special_requirements?: string;
}

// ============================================================================
// DONATIONS
// ============================================================================

export const PAYMENT_METHODS = [
  'stripe',
  'paypal',
  'check',
  'wire',
  'cash',
  'other'
] as const;

export type PaymentMethod = typeof PAYMENT_METHODS[number];

export const ALLOCATION_STATUSES = [
  'unallocated',
  'allocated',
  'disbursed'
] as const;

export type AllocationStatus = typeof ALLOCATION_STATUSES[number];

export interface Donation {
  id: string;

  // Donor Information
  donor_name?: string;
  donor_email?: string;
  donor_phone?: string;
  is_anonymous: boolean;

  // Payment Details
  amount: number;
  currency: string;
  payment_method: PaymentMethod;

  // Payment Gateway Integration
  stripe_payment_id?: string;
  stripe_customer_id?: string;
  paypal_transaction_id?: string;
  transaction_fee: number;
  net_amount: number;

  // Campaign & Allocation
  campaign_id?: string;
  allocation_status: AllocationStatus;

  // Tax & Receipts
  tax_receipt_issued: boolean;
  tax_receipt_url?: string;
  tax_receipt_number?: string;

  // Metadata
  donated_at: string;
  created_at: string;
  notes?: string;
}

export interface DonationSubmission {
  donor_name?: string;
  donor_email?: string;
  donor_phone?: string;
  is_anonymous?: boolean;
  amount: number;
  currency?: string;
  payment_method: PaymentMethod;
  campaign_id?: string;
  notes?: string;
}

// ============================================================================
// RELIEF INVENTORY
// ============================================================================

export const ITEM_CATEGORIES = [
  'food',
  'water',
  'clothing',
  'bedding',
  'shelter_materials',
  'medical',
  'sanitation',
  'tools',
  'household',
  'other'
] as const;

export type ItemCategory = typeof ITEM_CATEGORIES[number];

export interface ReliefInventoryItem {
  id: string;

  // Item Details
  item_name: string;
  item_category: ItemCategory;
  description?: string;
  unit: string;

  // Quantity Management
  quantity_available: number;
  quantity_allocated: number;
  quantity_distributed: number;
  reorder_threshold: number;

  // Storage & Source
  storage_location?: string;
  warehouse?: string;
  supplier?: string;
  cost_per_unit?: number;

  // Dates
  received_date?: string;
  expiration_date?: string;
  last_restock_date?: string;

  // Metadata
  created_at: string;
  updated_at: string;
}

// ============================================================================
// DISTRIBUTION EVENTS
// ============================================================================

export const EVENT_TYPES = [
  'pickup',
  'delivery',
  'mobile_distribution'
] as const;

export type EventType = typeof EVENT_TYPES[number];

export const EVENT_STATUSES = [
  'scheduled',
  'in_progress',
  'completed',
  'cancelled'
] as const;

export type EventStatus = typeof EVENT_STATUSES[number];

export interface DistributionEvent {
  id: string;

  // Event Details
  event_name: string;
  event_type: EventType;
  description?: string;

  // Location & Timing
  parish: Parish;
  location_name?: string;
  address?: string;
  gps_coordinates?: {
    latitude: number;
    longitude: number;
  };
  scheduled_date: string;
  start_time?: string;
  end_time?: string;

  // Capacity & Participation
  capacity?: number;
  registered_count: number;
  served_count: number;

  // Staff & Partners
  coordinator_id?: string;
  staff_assigned?: string[];
  partner_organizations?: string[];

  // Status
  status: EventStatus;

  // Metadata
  created_at: string;
  updated_at: string;
  notes?: string;
}

// ============================================================================
// CAMPAIGNS
// ============================================================================

export const CAMPAIGN_STATUSES = [
  'draft',
  'active',
  'paused',
  'completed',
  'archived'
] as const;

export type CampaignStatus = typeof CAMPAIGN_STATUSES[number];

export interface Campaign {
  id: string;

  // Campaign Details
  campaign_name: string;
  slug: string;
  description?: string;
  campaign_image_url?: string;

  // Goals & Amounts
  goal_amount: number;
  raised_amount: number;
  currency: string;

  // Timeline
  start_date: string;
  end_date?: string;

  // Status
  status: CampaignStatus;

  // Visibility
  is_featured: boolean;
  is_visible: boolean;

  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CampaignWithProgress extends Campaign {
  current_raised: number;
  remaining: number;
  percentage_complete: number;
  donation_count: number;
}

// ============================================================================
// FUND ALLOCATIONS
// ============================================================================

export const ALLOCATION_TYPES = [
  'relief_supplies',
  'operational',
  'program'
] as const;

export type AllocationType = typeof ALLOCATION_TYPES[number];

export const RECIPIENT_TYPES = [
  'individual_claim',
  'partner_org',
  'vendor'
] as const;

export type RecipientType = typeof RECIPIENT_TYPES[number];

export interface FundAllocation {
  id: string;

  // Source
  donation_id?: string;
  campaign_id?: string;

  // Allocation Details
  allocation_type: AllocationType;
  category?: string;
  amount: number;
  description: string;

  // Recipient
  recipient_type: RecipientType;
  claim_id?: string;
  recipient_name?: string;

  // Documentation
  receipt_url?: string;
  proof_of_delivery_url?: string;

  // Metadata
  allocated_at: string;
  created_at: string;
  created_by?: string;
  notes?: string;
}

// ============================================================================
// VIEWS & AGGREGATIONS
// ============================================================================

export interface ClaimsByParish {
  parish: Parish;
  total_claims: number;
  submitted: number;
  under_review: number;
  verified: number;
  approved: number;
  fulfilled: number;
  urgent_claims: number;
}

export interface DonationSummary {
  total_donations: number;
  total_amount: number;
  total_net_amount: number;
  average_donation: number;
  unallocated_count: number;
  unallocated_amount: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ============================================================================
// FILTER & QUERY TYPES
// ============================================================================

export interface ClaimFilters {
  parish?: Parish;
  verification_status?: VerificationStatus;
  priority_level?: PriorityLevel;
  damage_severity?: DamageSeverity;
  search?: string; // Search by name, claim number, phone
  from_date?: string;
  to_date?: string;
}

export interface DonationFilters {
  campaign_id?: string;
  allocation_status?: AllocationStatus;
  from_date?: string;
  to_date?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface InventoryFilters {
  category?: ItemCategory;
  low_stock?: boolean; // quantity_available <= reorder_threshold
  search?: string;
}
