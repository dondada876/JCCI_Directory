/**
 * RELIEF CLAIMS VALIDATION UTILITIES
 *
 * Validation functions for relief claims data
 */

import type { ReliefClaimSubmission } from '@/lib/types/relief-claims';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  // Remove common formatting characters
  const cleaned = phone.replace(/[-()\s]/g, '');

  // Check if it's a valid Jamaican phone number (876 area code, 10 digits total)
  // Also accept international format
  const jamaicanPattern = /^(876|1876)\d{7}$/;
  const generalPattern = /^\d{10,15}$/;

  return jamaicanPattern.test(cleaned) || generalPattern.test(cleaned);
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Validate claim number format
 */
export function validateClaimNumber(claimNumber: string): boolean {
  // Format: HM-YYYY-XXXXX (e.g., HM-2025-00001)
  const claimNumberPattern = /^HM-\d{4}-\d{5}$/;
  return claimNumberPattern.test(claimNumber);
}

/**
 * Validate National ID / TRN format
 */
export function validateNationalId(nationalId: string): boolean {
  // Basic validation - just check if it's not empty and has reasonable length
  // In production, implement proper TRN validation according to Jamaican standards
  return nationalId.length >= 6 && nationalId.length <= 20;
}

/**
 * Validate relief claim submission
 */
export function validateClaimSubmission(data: ReliefClaimSubmission): ValidationResult {
  const errors: Record<string, string> = {};

  // Personal Information
  if (!data.claimant_name || data.claimant_name.trim().length < 2) {
    errors.claimant_name = 'Name must be at least 2 characters long';
  }

  if (!data.claimant_phone || data.claimant_phone.trim().length === 0) {
    errors.claimant_phone = 'Phone number is required';
  } else if (!validatePhoneNumber(data.claimant_phone)) {
    errors.claimant_phone = 'Please enter a valid phone number (e.g., 876-XXX-XXXX)';
  }

  if (data.claimant_whatsapp && !validatePhoneNumber(data.claimant_whatsapp)) {
    errors.claimant_whatsapp = 'Please enter a valid WhatsApp number';
  }

  if (data.claimant_email && !validateEmail(data.claimant_email)) {
    errors.claimant_email = 'Please enter a valid email address';
  }

  if (data.national_id && !validateNationalId(data.national_id)) {
    errors.national_id = 'Invalid National ID / TRN format';
  }

  // Location Information
  if (!data.address || data.address.trim().length < 10) {
    errors.address = 'Please provide a complete address (at least 10 characters)';
  }

  if (!data.parish) {
    errors.parish = 'Parish is required';
  }

  // Damage Assessment
  if (!data.damage_type || data.damage_type.length === 0) {
    errors.damage_type = 'Please select at least one damage type';
  }

  if (!data.damage_severity) {
    errors.damage_severity = 'Damage severity is required';
  }

  if (data.estimated_loss && data.estimated_loss < 0) {
    errors.estimated_loss = 'Estimated loss cannot be negative';
  }

  // Household Information
  if (!data.household_size || data.household_size < 1) {
    errors.household_size = 'Household size must be at least 1';
  }

  if (data.children_count < 0) {
    errors.children_count = 'Children count cannot be negative';
  }

  if (data.elderly_count < 0) {
    errors.elderly_count = 'Elderly count cannot be negative';
  }

  if (data.disabled_count < 0) {
    errors.disabled_count = 'Disabled count cannot be negative';
  }

  // Validate that household members don't exceed household size
  const totalMembers = data.children_count + data.elderly_count + data.disabled_count;
  if (totalMembers > data.household_size) {
    errors.household_size = 'Total special members cannot exceed household size';
  }

  // Immediate Needs
  if (!data.immediate_needs || data.immediate_needs.length === 0) {
    errors.immediate_needs = 'Please select at least one immediate need';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[-()\s]/g, '');

  // Format as 876-XXX-XXXX
  if (cleaned.length === 10 && cleaned.startsWith('876')) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // Format as +1-876-XXX-XXXX
  if (cleaned.length === 11 && cleaned.startsWith('1876')) {
    return `+1-${cleaned.slice(1, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
}

/**
 * Format currency for display (JMD)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-JM', {
    style: 'currency',
    currency: 'JMD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  } = {}
): { isValid: boolean; error?: string } {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'] } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type must be one of: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`
    };
  }

  return { isValid: true };
}

/**
 * Validate multiple file uploads
 */
export function validateMultipleFiles(
  files: File[],
  options: {
    maxFiles?: number;
    maxSize?: number;
    allowedTypes?: string[];
  } = {}
): { isValid: boolean; errors: string[] } {
  const { maxFiles = 10 } = options;
  const errors: string[] = [];

  // Check number of files
  if (files.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} files allowed`);
    return { isValid: false, errors };
  }

  // Validate each file
  files.forEach((file, index) => {
    const result = validateFileUpload(file, options);
    if (!result.isValid && result.error) {
      errors.push(`File ${index + 1}: ${result.error}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Check if claim is editable based on status
 */
export function isClaimEditable(status: string): boolean {
  return ['submitted', 'under_review'].includes(status);
}

/**
 * Check if claim can be approved
 */
export function canApproveClaim(status: string): boolean {
  return ['under_review', 'verified'].includes(status);
}

/**
 * Check if claim can be rejected
 */
export function canRejectClaim(status: string): boolean {
  return !['fulfilled', 'rejected'].includes(status);
}

/**
 * Validate date range
 */
export function validateDateRange(fromDate?: string, toDate?: string): { isValid: boolean; error?: string } {
  if (!fromDate || !toDate) {
    return { isValid: true };
  }

  const from = new Date(fromDate);
  const to = new Date(toDate);

  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  if (from > to) {
    return { isValid: false, error: 'From date must be before to date' };
  }

  return { isValid: true };
}

/**
 * Generate password for user accounts (if needed)
 */
export function generateSecurePassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  const allChars = uppercase + lowercase + numbers + symbols;

  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Mask sensitive data for display
 */
export function maskNationalId(nationalId: string): string {
  if (nationalId.length <= 4) {
    return nationalId;
  }
  return nationalId.slice(0, 2) + '*'.repeat(nationalId.length - 4) + nationalId.slice(-2);
}

/**
 * Mask phone number for display
 */
export function maskPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[-()\s]/g, '');
  if (cleaned.length < 4) {
    return phone;
  }
  return phone.slice(0, -4) + '****';
}

/**
 * Calculate claim urgency score
 */
export function calculateUrgencyScore(claim: Partial<ReliefClaimSubmission>): number {
  let score = 0;

  // Damage severity
  if (claim.damage_severity === 'total_loss') score += 40;
  else if (claim.damage_severity === 'severe') score += 30;
  else if (claim.damage_severity === 'moderate') score += 20;
  else score += 10;

  // Vulnerable household members
  if (claim.children_count && claim.children_count > 0) score += 5 * claim.children_count;
  if (claim.elderly_count && claim.elderly_count > 0) score += 7 * claim.elderly_count;
  if (claim.disabled_count && claim.disabled_count > 0) score += 10 * claim.disabled_count;

  // Immediate needs
  if (claim.immediate_needs) {
    if (claim.immediate_needs.includes('medical')) score += 20;
    if (claim.immediate_needs.includes('shelter')) score += 15;
    if (claim.immediate_needs.includes('water')) score += 10;
    if (claim.immediate_needs.includes('food')) score += 10;
  }

  // Large household
  if (claim.household_size && claim.household_size >= 6) score += 10;
  if (claim.household_size && claim.household_size >= 10) score += 20;

  return score;
}

/**
 * Get urgency level from score
 */
export function getUrgencyLevel(score: number): 'urgent' | 'high' | 'standard' | 'low' {
  if (score >= 80) return 'urgent';
  if (score >= 50) return 'high';
  if (score >= 30) return 'standard';
  return 'low';
}

/**
 * Validate coordinates
 */
export function validateCoordinates(latitude?: number, longitude?: number): boolean {
  if (latitude === undefined || longitude === undefined) {
    return true; // Optional field
  }

  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}
