/**
 * RELIEF CLAIMS API
 *
 * This module provides functions for interacting with the relief claims system.
 * It handles claim submissions, verification, tracking, and management.
 */

import { createClient } from '@supabase/supabase-js';
import type {
  ReliefClaim,
  ReliefClaimSubmission,
  ClaimFilters,
  ApiResponse,
  PaginatedResponse,
  VerificationStatus,
  PriorityLevel,
  ApprovedItems
} from '@/lib/types/relief-claims';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// CLAIM SUBMISSION
// ============================================================================

/**
 * Submit a new relief claim
 */
export async function submitReliefClaim(
  claimData: ReliefClaimSubmission
): Promise<ApiResponse<ReliefClaim>> {
  try {
    // Generate claim number
    const { data: claimNumber, error: claimNumberError } = await supabase
      .rpc('generate_claim_number');

    if (claimNumberError) {
      throw new Error(`Failed to generate claim number: ${claimNumberError.message}`);
    }

    // Upload photos if provided
    let photoUrls: string[] = [];
    if (claimData.damage_photos && Array.isArray(claimData.damage_photos)) {
      photoUrls = await uploadClaimPhotos(claimData.damage_photos as File[]);
    }

    // Prepare claim data
    const newClaim = {
      claim_number: claimNumber,
      claimant_name: claimData.claimant_name,
      claimant_email: claimData.claimant_email,
      claimant_phone: claimData.claimant_phone,
      claimant_whatsapp: claimData.claimant_whatsapp,
      national_id: claimData.national_id,
      address: claimData.address,
      parish: claimData.parish,
      community: claimData.community,
      damage_type: claimData.damage_type,
      damage_severity: claimData.damage_severity,
      damage_description: claimData.damage_description,
      damage_photos: photoUrls.length > 0 ? photoUrls : null,
      estimated_loss: claimData.estimated_loss,
      household_size: claimData.household_size,
      children_count: claimData.children_count,
      elderly_count: claimData.elderly_count,
      disabled_count: claimData.disabled_count,
      immediate_needs: claimData.immediate_needs,
      special_requirements: claimData.special_requirements,
      verification_status: 'submitted',
      priority_level: calculatePriorityLevel(claimData),
      pickup_confirmed: false
    };

    const { data, error } = await supabase
      .from('relief_claims')
      .insert([newClaim])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to submit claim: ${error.message}`);
    }

    return {
      data,
      message: `Claim submitted successfully. Your claim number is ${claimNumber}`
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Calculate priority level based on claim data
 */
function calculatePriorityLevel(claim: ReliefClaimSubmission): PriorityLevel {
  let score = 0;

  // Severity contributes to priority
  if (claim.damage_severity === 'total_loss') score += 4;
  else if (claim.damage_severity === 'severe') score += 3;
  else if (claim.damage_severity === 'moderate') score += 2;
  else score += 1;

  // Vulnerable household members
  if (claim.children_count > 0) score += 1;
  if (claim.elderly_count > 0) score += 1;
  if (claim.disabled_count > 0) score += 2;

  // Immediate needs
  if (claim.immediate_needs.includes('medical')) score += 2;
  if (claim.immediate_needs.includes('shelter')) score += 2;
  if (claim.immediate_needs.includes('water')) score += 1;

  // Large household
  if (claim.household_size >= 6) score += 1;

  // Determine priority level
  if (score >= 8) return 'urgent';
  if (score >= 5) return 'high';
  if (score >= 3) return 'standard';
  return 'low';
}

/**
 * Upload claim photos to Supabase Storage
 */
async function uploadClaimPhotos(files: File[]): Promise<string[]> {
  const uploadedUrls: string[] = [];

  for (const file of files) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `claims/${fileName}`;

    const { data, error } = await supabase.storage
      .from('relief-claims')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading file:', error);
      continue;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('relief-claims')
      .getPublicUrl(filePath);

    uploadedUrls.push(publicUrlData.publicUrl);
  }

  return uploadedUrls;
}

// ============================================================================
// CLAIM RETRIEVAL
// ============================================================================

/**
 * Get all claims with optional filtering and pagination
 */
export async function getAllClaims(
  filters?: ClaimFilters,
  page: number = 1,
  perPage: number = 20
): Promise<PaginatedResponse<ReliefClaim>> {
  try {
    let query = supabase
      .from('relief_claims')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters) {
      if (filters.parish) {
        query = query.eq('parish', filters.parish);
      }
      if (filters.verification_status) {
        query = query.eq('verification_status', filters.verification_status);
      }
      if (filters.priority_level) {
        query = query.eq('priority_level', filters.priority_level);
      }
      if (filters.damage_severity) {
        query = query.eq('damage_severity', filters.damage_severity);
      }
      if (filters.search) {
        query = query.or(`claimant_name.ilike.%${filters.search}%,claim_number.ilike.%${filters.search}%,claimant_phone.ilike.%${filters.search}%`);
      }
      if (filters.from_date) {
        query = query.gte('created_at', filters.from_date);
      }
      if (filters.to_date) {
        query = query.lte('created_at', filters.to_date);
      }
    }

    // Apply pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch claims: ${error.message}`);
    }

    return {
      data: data || [],
      total: count || 0,
      page,
      per_page: perPage,
      total_pages: Math.ceil((count || 0) / perPage)
    };
  } catch (error) {
    console.error('Error fetching claims:', error);
    return {
      data: [],
      total: 0,
      page,
      per_page: perPage,
      total_pages: 0
    };
  }
}

/**
 * Get a single claim by ID
 */
export async function getClaimById(id: string): Promise<ApiResponse<ReliefClaim>> {
  try {
    const { data, error } = await supabase
      .from('relief_claims')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch claim: ${error.message}`);
    }

    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get a claim by claim number
 */
export async function getClaimByNumber(claimNumber: string): Promise<ApiResponse<ReliefClaim>> {
  try {
    const { data, error } = await supabase
      .from('relief_claims')
      .select('*')
      .eq('claim_number', claimNumber)
      .single();

    if (error) {
      throw new Error(`Failed to fetch claim: ${error.message}`);
    }

    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get claims by phone number (for claimant tracking)
 */
export async function getClaimsByPhone(phone: string): Promise<ApiResponse<ReliefClaim[]>> {
  try {
    const { data, error } = await supabase
      .from('relief_claims')
      .select('*')
      .eq('claimant_phone', phone)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch claims: ${error.message}`);
    }

    return { data: data || [] };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: []
    };
  }
}

/**
 * Get claims by parish
 */
export async function getClaimsByParish(parish: string): Promise<ApiResponse<ReliefClaim[]>> {
  try {
    const { data, error } = await supabase
      .from('relief_claims')
      .select('*')
      .eq('parish', parish)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch claims: ${error.message}`);
    }

    return { data: data || [] };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: []
    };
  }
}

/**
 * Get urgent claims
 */
export async function getUrgentClaims(): Promise<ApiResponse<ReliefClaim[]>> {
  try {
    const { data, error } = await supabase
      .from('relief_claims')
      .select('*')
      .eq('priority_level', 'urgent')
      .in('verification_status', ['submitted', 'under_review', 'verified', 'approved'])
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch urgent claims: ${error.message}`);
    }

    return { data: data || [] };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: []
    };
  }
}

// ============================================================================
// CLAIM VERIFICATION & APPROVAL
// ============================================================================

/**
 * Update claim verification status
 */
export async function updateClaimStatus(
  claimId: string,
  status: VerificationStatus,
  userId?: string,
  notes?: string
): Promise<ApiResponse<ReliefClaim>> {
  try {
    const updates: any = {
      verification_status: status,
      updated_at: new Date().toISOString()
    };

    if (status === 'verified' || status === 'approved') {
      updates[`${status === 'verified' ? 'verified' : 'approved'}_by`] = userId;
      updates[`${status === 'verified' ? 'verified' : 'approved'}_at`] = new Date().toISOString();
    }

    if (notes) {
      updates.verification_notes = notes;
    }

    const { data, error } = await supabase
      .from('relief_claims')
      .update(updates)
      .eq('id', claimId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update claim status: ${error.message}`);
    }

    return {
      data,
      message: `Claim status updated to ${status}`
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Approve claim with items
 */
export async function approveClaim(
  claimId: string,
  approvedItems: ApprovedItems,
  userId: string,
  notes?: string
): Promise<ApiResponse<ReliefClaim>> {
  try {
    const updates = {
      verification_status: 'approved' as VerificationStatus,
      approved_by: userId,
      approved_at: new Date().toISOString(),
      approved_items: approvedItems,
      updated_at: new Date().toISOString()
    };

    if (notes) {
      updates['public_notes'] = notes;
    }

    const { data, error } = await supabase
      .from('relief_claims')
      .update(updates)
      .eq('id', claimId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to approve claim: ${error.message}`);
    }

    return {
      data,
      message: 'Claim approved successfully'
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Reject claim
 */
export async function rejectClaim(
  claimId: string,
  reason: string,
  userId: string
): Promise<ApiResponse<ReliefClaim>> {
  try {
    const { data, error } = await supabase
      .from('relief_claims')
      .update({
        verification_status: 'rejected',
        verification_notes: reason,
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', claimId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to reject claim: ${error.message}`);
    }

    return {
      data,
      message: 'Claim rejected'
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Update claim priority
 */
export async function updateClaimPriority(
  claimId: string,
  priority: PriorityLevel
): Promise<ApiResponse<ReliefClaim>> {
  try {
    const { data, error } = await supabase
      .from('relief_claims')
      .update({
        priority_level: priority,
        updated_at: new Date().toISOString()
      })
      .eq('id', claimId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update priority: ${error.message}`);
    }

    return {
      data,
      message: `Priority updated to ${priority}`
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// ============================================================================
// CLAIM DISTRIBUTION
// ============================================================================

/**
 * Schedule claim for distribution
 */
export async function scheduleClaimDistribution(
  claimId: string,
  distributionEventId: string,
  scheduledDate: string
): Promise<ApiResponse<ReliefClaim>> {
  try {
    const { data, error } = await supabase
      .from('relief_claims')
      .update({
        distribution_event_id: distributionEventId,
        distribution_scheduled_date: scheduledDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', claimId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to schedule distribution: ${error.message}`);
    }

    return {
      data,
      message: 'Distribution scheduled successfully'
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Confirm pickup for claim
 */
export async function confirmPickup(claimId: string): Promise<ApiResponse<ReliefClaim>> {
  try {
    const { data, error } = await supabase
      .from('relief_claims')
      .update({
        pickup_confirmed: true,
        pickup_confirmed_at: new Date().toISOString(),
        verification_status: 'fulfilled',
        updated_at: new Date().toISOString()
      })
      .eq('id', claimId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to confirm pickup: ${error.message}`);
    }

    return {
      data,
      message: 'Pickup confirmed successfully'
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Add notes to claim
 */
export async function addClaimNotes(
  claimId: string,
  publicNotes?: string,
  internalNotes?: string
): Promise<ApiResponse<ReliefClaim>> {
  try {
    const updates: any = {
      updated_at: new Date().toISOString()
    };

    if (publicNotes !== undefined) {
      updates.public_notes = publicNotes;
    }

    if (internalNotes !== undefined) {
      updates.internal_notes = internalNotes;
    }

    const { data, error } = await supabase
      .from('relief_claims')
      .update(updates)
      .eq('id', claimId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add notes: ${error.message}`);
    }

    return {
      data,
      message: 'Notes added successfully'
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// ============================================================================
// STATISTICS & REPORTS
// ============================================================================

/**
 * Get claims statistics
 */
export async function getClaimsStatistics() {
  try {
    const { data, error } = await supabase
      .from('relief_claims')
      .select('verification_status, priority_level, parish');

    if (error) {
      throw new Error(`Failed to fetch statistics: ${error.message}`);
    }

    const stats = {
      total: data?.length || 0,
      by_status: {} as Record<string, number>,
      by_priority: {} as Record<string, number>,
      by_parish: {} as Record<string, number>
    };

    data?.forEach(claim => {
      stats.by_status[claim.verification_status] = (stats.by_status[claim.verification_status] || 0) + 1;
      stats.by_priority[claim.priority_level] = (stats.by_priority[claim.priority_level] || 0) + 1;
      stats.by_parish[claim.parish] = (stats.by_parish[claim.parish] || 0) + 1;
    });

    return { data: stats };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: null
    };
  }
}

/**
 * Get claims by parish summary
 */
export async function getClaimsByParishSummary() {
  try {
    const { data, error } = await supabase
      .from('claims_by_parish')
      .select('*');

    if (error) {
      throw new Error(`Failed to fetch parish summary: ${error.message}`);
    }

    return { data: data || [] };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: []
    };
  }
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

/**
 * Subscribe to new claims
 */
export function subscribeToNewClaims(
  callback: (claim: ReliefClaim) => void
) {
  return supabase
    .channel('new-claims')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'relief_claims'
      },
      (payload) => callback(payload.new as ReliefClaim)
    )
    .subscribe();
}

/**
 * Subscribe to claim updates
 */
export function subscribeToClaimUpdates(
  claimId: string,
  callback: (claim: ReliefClaim) => void
) {
  return supabase
    .channel(`claim-${claimId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'relief_claims',
        filter: `id=eq.${claimId}`
      },
      (payload) => callback(payload.new as ReliefClaim)
    )
    .subscribe();
}
