'use client';

/**
 * CLAIM SUBMISSION FORM COMPONENT
 *
 * Mobile-first form for submitting disaster relief claims.
 * Features:
 * - Multi-step wizard interface
 * - Photo upload from camera/gallery
 * - Form validation
 * - Progress tracking
 */

import React, { useState } from 'react';
import { submitReliefClaim } from '@/lib/api/relief-claims';
import type {
  ReliefClaimSubmission,
  DamageType,
  DamageSeverity,
  ImmediateNeed,
  Parish
} from '@/lib/types/relief-claims';
import {
  DAMAGE_TYPES,
  DAMAGE_SEVERITIES,
  IMMEDIATE_NEEDS,
  JAMAICAN_PARISHES
} from '@/lib/types/relief-claims';

type FormStep = 'personal' | 'location' | 'damage' | 'household' | 'needs' | 'review';

interface FormErrors {
  [key: string]: string;
}

export default function ClaimSubmissionForm() {
  const [currentStep, setCurrentStep] = useState<FormStep>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [claimNumber, setClaimNumber] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});

  // Form state
  const [formData, setFormData] = useState<ReliefClaimSubmission>({
    claimant_name: '',
    claimant_email: '',
    claimant_phone: '',
    claimant_whatsapp: '',
    national_id: '',
    address: '',
    parish: 'Kingston',
    community: '',
    damage_type: [],
    damage_severity: 'moderate',
    damage_description: '',
    damage_photos: [],
    estimated_loss: 0,
    household_size: 1,
    children_count: 0,
    elderly_count: 0,
    disabled_count: 0,
    immediate_needs: [],
    special_requirements: ''
  });

  const steps: FormStep[] = ['personal', 'location', 'damage', 'household', 'needs', 'review'];

  // Update form field
  const updateField = (field: keyof ReliefClaimSubmission, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Toggle array values (for checkboxes)
  const toggleArrayValue = <T,>(field: keyof ReliefClaimSubmission, value: T) => {
    const currentArray = (formData[field] as T[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateField(field, newArray);
  };

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    updateField('damage_photos', [...(formData.damage_photos || []), ...files]);
  };

  // Remove photo
  const removePhoto = (index: number) => {
    const photos = formData.damage_photos || [];
    updateField('damage_photos', photos.filter((_, i) => i !== index));
  };

  // Validate current step
  const validateStep = (step: FormStep): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 'personal':
        if (!formData.claimant_name.trim()) {
          newErrors.claimant_name = 'Name is required';
        }
        if (!formData.claimant_phone.trim()) {
          newErrors.claimant_phone = 'Phone number is required';
        } else if (!/^\d{10,}$/.test(formData.claimant_phone.replace(/[-()\s]/g, ''))) {
          newErrors.claimant_phone = 'Please enter a valid phone number';
        }
        if (formData.claimant_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.claimant_email)) {
          newErrors.claimant_email = 'Please enter a valid email address';
        }
        break;

      case 'location':
        if (!formData.address.trim()) {
          newErrors.address = 'Address is required';
        }
        if (!formData.parish) {
          newErrors.parish = 'Parish is required';
        }
        break;

      case 'damage':
        if (formData.damage_type.length === 0) {
          newErrors.damage_type = 'Please select at least one damage type';
        }
        if (!formData.damage_severity) {
          newErrors.damage_severity = 'Damage severity is required';
        }
        break;

      case 'household':
        if (formData.household_size < 1) {
          newErrors.household_size = 'Household size must be at least 1';
        }
        break;

      case 'needs':
        if (formData.immediate_needs.length === 0) {
          newErrors.immediate_needs = 'Please select at least one immediate need';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigate to next step
  const nextStep = () => {
    if (validateStep(currentStep)) {
      const currentIndex = steps.indexOf(currentStep);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1]);
      }
    }
  };

  // Navigate to previous step
  const prevStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateStep('review')) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitReliefClaim(formData);

      if (result.error) {
        alert(`Error: ${result.error}`);
      } else if (result.data) {
        setClaimNumber(result.data.claim_number);
        setSubmitSuccess(true);
      }
    } catch (error) {
      alert('An unexpected error occurred. Please try again.');
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Claim Submitted Successfully!</h2>
          <p className="text-gray-600 mb-4">Your claim has been received and is being processed.</p>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Your Claim Number:</p>
            <p className="text-3xl font-bold text-blue-600">{claimNumber}</p>
          </div>
          <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">What happens next?</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Your claim will be reviewed by our team within 24-48 hours</li>
              <li>We may contact you for verification or additional information</li>
              <li>You will receive updates via SMS/WhatsApp</li>
              <li>Once approved, you'll be notified about distribution arrangements</li>
            </ol>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Save your claim number: <strong>{claimNumber}</strong>
            <br />
            You can use it to track your claim status.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Submit Another Claim
          </button>
        </div>
      </div>
    );
  }

  // Progress indicator
  const stepIndex = steps.indexOf(currentStep);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <h1 className="text-2xl font-bold mb-2">Relief Claim Submission</h1>
          <p className="text-blue-100">Please provide accurate information for your claim</p>
        </div>

        {/* Progress bar */}
        <div className="bg-gray-200 h-2">
          <div
            className="bg-blue-600 h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Form steps indicator */}
        <div className="bg-gray-50 px-6 py-3 border-b">
          <div className="flex justify-between text-xs md:text-sm">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`flex-1 text-center ${index <= stepIndex ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}
              >
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </div>
            ))}
          </div>
        </div>

        {/* Form content */}
        <div className="p-6">
          {/* Personal Information */}
          {currentStep === 'personal' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.claimant_name}
                  onChange={(e) => updateField('claimant_name', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.claimant_name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter your full name"
                />
                {errors.claimant_name && <p className="text-red-500 text-sm mt-1">{errors.claimant_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.claimant_phone}
                  onChange={(e) => updateField('claimant_phone', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.claimant_phone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="876-XXX-XXXX"
                />
                {errors.claimant_phone && <p className="text-red-500 text-sm mt-1">{errors.claimant_phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Number (if different)
                </label>
                <input
                  type="tel"
                  value={formData.claimant_whatsapp}
                  onChange={(e) => updateField('claimant_whatsapp', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="876-XXX-XXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.claimant_email}
                  onChange={(e) => updateField('claimant_email', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.claimant_email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="your.email@example.com"
                />
                {errors.claimant_email && <p className="text-red-500 text-sm mt-1">{errors.claimant_email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  National ID / TRN (Optional)
                </label>
                <input
                  type="text"
                  value={formData.national_id}
                  onChange={(e) => updateField('national_id', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your National ID or TRN"
                />
              </div>
            </div>
          )}

          {/* Location Information */}
          {currentStep === 'location' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Location Information</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parish <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.parish}
                  onChange={(e) => updateField('parish', e.target.value as Parish)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.parish ? 'border-red-500' : 'border-gray-300'}`}
                >
                  {JAMAICAN_PARISHES.map(parish => (
                    <option key={parish} value={parish}>{parish}</option>
                  ))}
                </select>
                {errors.parish && <p className="text-red-500 text-sm mt-1">{errors.parish}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Community / District
                </label>
                <input
                  type="text"
                  value={formData.community}
                  onChange={(e) => updateField('community', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your community or district"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                  rows={3}
                  placeholder="Enter your complete address including street, community, and parish"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>
            </div>
          )}

          {/* Damage Assessment */}
          {currentStep === 'damage' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Damage Assessment</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type of Damage <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {DAMAGE_TYPES.map(type => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.damage_type.includes(type)}
                        onChange={() => toggleArrayValue('damage_type', type)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
                {errors.damage_type && <p className="text-red-500 text-sm mt-1">{errors.damage_type}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Damage Severity <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.damage_severity}
                  onChange={(e) => updateField('damage_severity', e.target.value as DamageSeverity)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.damage_severity ? 'border-red-500' : 'border-gray-300'}`}
                >
                  {DAMAGE_SEVERITIES.map(severity => (
                    <option key={severity} value={severity}>
                      {severity.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
                {errors.damage_severity && <p className="text-red-500 text-sm mt-1">{errors.damage_severity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Damage Description
                </label>
                <textarea
                  value={formData.damage_description}
                  onChange={(e) => updateField('damage_description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Describe the damage in detail..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Loss (JMD)
                </label>
                <input
                  type="number"
                  value={formData.estimated_loss || ''}
                  onChange={(e) => updateField('estimated_loss', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos of Damage
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {formData.damage_photos && formData.damage_photos.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {formData.damage_photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={photo instanceof File ? URL.createObjectURL(photo) : photo}
                          alt={`Damage ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Household Information */}
          {currentStep === 'household' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Household Information</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Household Size <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.household_size}
                  onChange={(e) => updateField('household_size', parseInt(e.target.value) || 1)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.household_size ? 'border-red-500' : 'border-gray-300'}`}
                  min="1"
                />
                {errors.household_size && <p className="text-red-500 text-sm mt-1">{errors.household_size}</p>}
                <p className="text-xs text-gray-500 mt-1">Total number of people in your household</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Children (under 18)
                </label>
                <input
                  type="number"
                  value={formData.children_count}
                  onChange={(e) => updateField('children_count', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Elderly (65+)
                </label>
                <input
                  type="number"
                  value={formData.elderly_count}
                  onChange={(e) => updateField('elderly_count', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Disabled/Vulnerable Members
                </label>
                <input
                  type="number"
                  value={formData.disabled_count}
                  onChange={(e) => updateField('disabled_count', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>
          )}

          {/* Immediate Needs */}
          {currentStep === 'needs' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Immediate Needs</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What do you need most urgently? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {IMMEDIATE_NEEDS.map(need => (
                    <label key={need} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.immediate_needs.includes(need)}
                        onChange={() => toggleArrayValue('immediate_needs', need)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm capitalize">{need}</span>
                    </label>
                  ))}
                </div>
                {errors.immediate_needs && <p className="text-red-500 text-sm mt-1">{errors.immediate_needs}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requirements or Additional Information
                </label>
                <textarea
                  value={formData.special_requirements}
                  onChange={(e) => updateField('special_requirements', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Any medical conditions, dietary restrictions, or other special needs..."
                />
              </div>
            </div>
          )}

          {/* Review */}
          {currentStep === 'review' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Review Your Information</h2>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-sm text-gray-600">Personal Information</h3>
                  <p><strong>Name:</strong> {formData.claimant_name}</p>
                  <p><strong>Phone:</strong> {formData.claimant_phone}</p>
                  {formData.claimant_email && <p><strong>Email:</strong> {formData.claimant_email}</p>}
                </div>

                <div className="border-t pt-3">
                  <h3 className="font-semibold text-sm text-gray-600">Location</h3>
                  <p><strong>Parish:</strong> {formData.parish}</p>
                  {formData.community && <p><strong>Community:</strong> {formData.community}</p>}
                  <p><strong>Address:</strong> {formData.address}</p>
                </div>

                <div className="border-t pt-3">
                  <h3 className="font-semibold text-sm text-gray-600">Damage</h3>
                  <p><strong>Type:</strong> {formData.damage_type.join(', ')}</p>
                  <p><strong>Severity:</strong> {formData.damage_severity}</p>
                  {formData.damage_photos && formData.damage_photos.length > 0 && (
                    <p><strong>Photos:</strong> {formData.damage_photos.length} uploaded</p>
                  )}
                </div>

                <div className="border-t pt-3">
                  <h3 className="font-semibold text-sm text-gray-600">Household</h3>
                  <p><strong>Size:</strong> {formData.household_size} people</p>
                  <p><strong>Children:</strong> {formData.children_count}</p>
                  <p><strong>Elderly:</strong> {formData.elderly_count}</p>
                  <p><strong>Disabled/Vulnerable:</strong> {formData.disabled_count}</p>
                </div>

                <div className="border-t pt-3">
                  <h3 className="font-semibold text-sm text-gray-600">Immediate Needs</h3>
                  <p>{formData.immediate_needs.join(', ')}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  By submitting this claim, you confirm that the information provided is accurate and truthful.
                  False information may result in claim rejection.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-between">
          <button
            onClick={prevStep}
            disabled={stepIndex === 0}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>

          {currentStep !== 'review' ? (
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Claim'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
