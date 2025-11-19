import type { Database } from './database.types';

// Database table types
export type Business = Database['public']['Tables']['businesses']['Row'];
export type BusinessInsert = Database['public']['Tables']['businesses']['Insert'];
export type BusinessUpdate = Database['public']['Tables']['businesses']['Update'];

export type BusinessCategory = Database['public']['Tables']['business_categories']['Row'];
export type BusinessReview = Database['public']['Tables']['business_reviews']['Row'];

export type ReliefClaim = Database['public']['Tables']['relief_claims']['Row'];
export type ReliefClaimInsert = Database['public']['Tables']['relief_claims']['Insert'];
export type ReliefClaimUpdate = Database['public']['Tables']['relief_claims']['Update'];

export type Donation = Database['public']['Tables']['donations']['Row'];
export type DonationInsert = Database['public']['Tables']['donations']['Insert'];

export type Campaign = Database['public']['Tables']['campaigns']['Row'];
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

// Legacy types for backward compatibility
export interface NewsArticle {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image: string;
  featured: boolean;
}

export type Category = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

// Application-specific types
export interface DonationStats {
  total_raised: number;
  total_allocated: number;
  total_disbursed: number;
  active_donors: number;
}

export interface AllocationBreakdown {
  category: string;
  amount: number;
}

export interface ClaimFormData {
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  whatsapp?: string;
  parish: string;
  community: string;
  address: string;
  household_size: number;
  children_count?: number;
  elderly_count?: number;
  disabled_count?: number;
  damage_type: string[];
  damage_severity: string;
  immediate_needs: string[];
}

export interface BusinessFormData {
  business_name: string;
  owner_name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  category: string;
  subcategory?: string;
  description?: string;
  country: string;
  state_province?: string;
  city?: string;
  address?: string;
  website?: string;
  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
}

// Constants
export const JAMAICAN_PARISHES = [
  'Clarendon',
  'Hanover',
  'Kingston',
  'Manchester',
  'Portland',
  'St. Andrew',
  'St. Ann',
  'St. Catherine',
  'St. Elizabeth',
  'St. James',
  'St. Mary',
  'St. Thomas',
  'Trelawny',
  'Westmoreland',
] as const;

export const DAMAGE_TYPES = [
  'roof_damage',
  'flooding',
  'structural_damage',
  'total_loss',
  'water_damage',
  'electrical_damage',
  'other',
] as const;

export const DAMAGE_SEVERITY = [
  'minor',
  'moderate',
  'severe',
  'total_loss',
] as const;

export const IMMEDIATE_NEEDS = [
  'shelter',
  'food',
  'water',
  'medical',
  'clothing',
  'hygiene_supplies',
  'baby_supplies',
  'other',
] as const;

export const CLAIM_STATUSES = [
  'pending',
  'approved',
  'in_progress',
  'fulfilled',
  'closed',
] as const;

export const VERIFICATION_STATUSES = [
  'submitted',
  'under_review',
  'verified',
  'approved',
  'fulfilled',
] as const;
