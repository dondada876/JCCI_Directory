'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, generateClaimNumber, uploadImage } from '@/lib/supabase';
import {
  JAMAICAN_PARISHES,
  DAMAGE_TYPES,
  DAMAGE_SEVERITY,
  IMMEDIATE_NEEDS,
  type ClaimFormData,
} from '@/lib/types';

export default function ReliefClaimPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [claimNumber, setClaimNumber] = useState('');

  const [formData, setFormData] = useState<ClaimFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    whatsapp: '',
    parish: '',
    community: '',
    address: '',
    household_size: 1,
    children_count: 0,
    elderly_count: 0,
    disabled_count: 0,
    damage_type: [],
    damage_severity: '',
    immediate_needs: [],
  });

  const [photos, setPhotos] = useState<File[]>([]);

  const updateFormData = (field: keyof ClaimFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field: 'damage_type' | 'immediate_needs', value: string) => {
    setFormData((prev) => {
      const currentArray = prev[field] as string[];
      if (currentArray.includes(value)) {
        return { ...prev, [field]: currentArray.filter((v) => v !== value) };
      } else {
        return { ...prev, [field]: [...currentArray, value] };
      }
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Upload photos
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const { url, error } = await uploadImage(photo, 'relief-photos', 'claims');
        if (error) throw new Error(`Photo upload failed: ${error}`);
        if (url) photoUrls.push(url);
      }

      // Generate claim number
      const newClaimNumber = await generateClaimNumber();

      // Submit claim
      const { error: claimError } = await supabase.from('relief_claims').insert({
        claim_number: newClaimNumber,
        ...formData,
        damage_photos: photoUrls,
        verification_status: 'submitted',
        status: 'pending',
      });

      if (claimError) throw claimError;

      setClaimNumber(newClaimNumber);
      setStep(4);
    } catch (err: any) {
      console.error('Error submitting claim:', err);
      setError(err.message || 'An error occurred while submitting your claim');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => updateFormData('first_name', e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#009B3A] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => updateFormData('last_name', e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#009B3A] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData('phone', e.target.value)}
            required
            placeholder="+1 876-XXX-XXXX"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#009B3A] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            WhatsApp Number
          </label>
          <input
            type="tel"
            value={formData.whatsapp}
            onChange={(e) => updateFormData('whatsapp', e.target.value)}
            placeholder="+1 876-XXX-XXXX"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#009B3A] focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email (Optional)
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#009B3A] focus:border-transparent"
          />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mt-8">Location</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parish *
          </label>
          <select
            value={formData.parish}
            onChange={(e) => updateFormData('parish', e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#009B3A] focus:border-transparent"
          >
            <option value="">Select Parish</option>
            {JAMAICAN_PARISHES.map((parish) => (
              <option key={parish} value={parish}>
                {parish}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Community/Town *
          </label>
          <input
            type="text"
            value={formData.community}
            onChange={(e) => updateFormData('community', e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#009B3A] focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street Address *
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => updateFormData('address', e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#009B3A] focus:border-transparent"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setStep(2)}
        className="w-full md:w-auto px-8 py-3 bg-[#009B3A] text-white rounded-md hover:bg-[#008030] transition"
      >
        Next: Household Details
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Household Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Household Size *
          </label>
          <input
            type="number"
            value={formData.household_size}
            onChange={(e) => updateFormData('household_size', parseInt(e.target.value))}
            min="1"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#009B3A] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Children (Under 18)
          </label>
          <input
            type="number"
            value={formData.children_count}
            onChange={(e) => updateFormData('children_count', parseInt(e.target.value))}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#009B3A] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Elderly (65+)
          </label>
          <input
            type="number"
            value={formData.elderly_count}
            onChange={(e) => updateFormData('elderly_count', parseInt(e.target.value))}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#009B3A] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Disabled Persons
          </label>
          <input
            type="number"
            value={formData.disabled_count}
            onChange={(e) => updateFormData('disabled_count', parseInt(e.target.value))}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#009B3A] focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="px-8 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setStep(3)}
          className="px-8 py-3 bg-[#009B3A] text-white rounded-md hover:bg-[#008030] transition"
        >
          Next: Damage Assessment
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Damage Assessment</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type of Damage (Select all that apply) *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DAMAGE_TYPES.map((type) => (
            <label key={type} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.damage_type.includes(type)}
                onChange={() => toggleArrayValue('damage_type', type)}
                className="w-4 h-4 text-[#009B3A] border-gray-300 rounded focus:ring-[#009B3A]"
              />
              <span className="text-sm capitalize">
                {type.replace(/_/g, ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Severity of Damage *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DAMAGE_SEVERITY.map((severity) => (
            <label key={severity} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="severity"
                value={severity}
                checked={formData.damage_severity === severity}
                onChange={(e) => updateFormData('damage_severity', e.target.value)}
                required
                className="w-4 h-4 text-[#009B3A] border-gray-300 focus:ring-[#009B3A]"
              />
              <span className="text-sm capitalize">
                {severity.replace(/_/g, ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Immediate Needs (Select all that apply) *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {IMMEDIATE_NEEDS.map((need) => (
            <label key={need} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.immediate_needs.includes(need)}
                onChange={() => toggleArrayValue('immediate_needs', need)}
                className="w-4 h-4 text-[#009B3A] border-gray-300 rounded focus:ring-[#009B3A]"
              />
              <span className="text-sm capitalize">
                {need.replace(/_/g, ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photos of Damage (Upload up to 5 photos)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#009B3A] focus:border-transparent"
        />
        {photos.length > 0 && (
          <p className="mt-2 text-sm text-gray-600">
            {photos.length} photo(s) selected
          </p>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-md">{error}</div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setStep(2)}
          disabled={submitting}
          className="px-8 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={submitting || formData.damage_type.length === 0 || formData.immediate_needs.length === 0}
          className="px-8 py-3 bg-[#009B3A] text-white rounded-md hover:bg-[#008030] transition disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Claim'}
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center space-y-6 py-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <svg
          className="w-12 h-12 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h2 className="text-3xl font-bold text-gray-900">Claim Submitted Successfully!</h2>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 max-w-md mx-auto">
        <p className="text-sm text-gray-600 mb-2">Your Claim Number:</p>
        <p className="text-3xl font-bold text-[#009B3A]">{claimNumber}</p>
      </div>

      <div className="max-w-2xl mx-auto text-left space-y-4">
        <p className="text-gray-700">
          Thank you for submitting your relief claim. We have received your information
          and our partner organizations will review it within 48 hours.
        </p>
        <p className="text-gray-700">
          You will receive an SMS notification at <strong>{formData.phone}</strong> when
          your claim status changes.
        </p>
        <p className="text-gray-700">
          Please save your claim number for tracking purposes.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <a
          href={`/relief/track?claim=${claimNumber}`}
          className="px-8 py-3 bg-[#009B3A] text-white rounded-md hover:bg-[#008030] transition"
        >
          Track My Claim
        </a>
        <a
          href="/"
          className="px-8 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
        >
          Return Home
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Hurricane Melissa Relief Claim
            </h1>
            <p className="text-gray-600">
              Submit your claim to receive emergency assistance
            </p>
          </div>

          {step < 4 && (
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`flex-1 ${
                      s < 3 ? 'mr-2' : ''
                    }`}
                  >
                    <div
                      className={`h-2 rounded-full ${
                        s <= step ? 'bg-[#009B3A]' : 'bg-gray-200'
                      }`}
                    />
                    <p
                      className={`text-xs mt-1 ${
                        s <= step ? 'text-[#009B3A] font-semibold' : 'text-gray-400'
                      }`}
                    >
                      Step {s}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </form>
        </div>
      </div>
    </div>
  );
}
