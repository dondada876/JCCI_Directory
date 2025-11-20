'use client';

/**
 * CLAIM TRACKING PAGE
 *
 * Public-facing page for claimants to track their claim status.
 * Features:
 * - Track by claim number or phone number
 * - Real-time status updates
 * - Timeline view of claim progress
 * - Public notes and updates
 */

import React, { useState } from 'react';
import { getClaimByNumber, getClaimsByPhone, subscribeToClaimUpdates } from '@/lib/api/relief-claims';
import type { ReliefClaim, VerificationStatus } from '@/lib/types/relief-claims';

type SearchMethod = 'claim_number' | 'phone';

export default function ClaimTrackingPage() {
  const [searchMethod, setSearchMethod] = useState<SearchMethod>('claim_number');
  const [searchValue, setSearchValue] = useState('');
  const [claims, setClaims] = useState<ReliefClaim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<ReliefClaim | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setError('');
    setLoading(true);
    setClaims([]);
    setSelectedClaim(null);

    try {
      if (searchMethod === 'claim_number') {
        const result = await getClaimByNumber(searchValue);
        if (result.error) {
          setError('Claim not found. Please check your claim number and try again.');
        } else if (result.data) {
          setClaims([result.data]);
          setSelectedClaim(result.data);

          // Subscribe to updates for this claim
          subscribeToClaimUpdates(result.data.id, (updatedClaim) => {
            setSelectedClaim(updatedClaim);
          });
        }
      } else {
        const result = await getClaimsByPhone(searchValue);
        if (result.error) {
          setError('Error fetching claims. Please try again.');
        } else if (result.data && result.data.length > 0) {
          setClaims(result.data);
          setSelectedClaim(result.data[0]);
        } else {
          setError('No claims found for this phone number.');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: VerificationStatus): number => {
    const steps = ['submitted', 'under_review', 'verified', 'approved', 'fulfilled'];
    return steps.indexOf(status) + 1;
  };

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case 'submitted':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'under_review':
        return (
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'verified':
      case 'approved':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'fulfilled':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'rejected':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case 'submitted': return 'text-blue-600 bg-blue-100';
      case 'under_review': return 'text-yellow-600 bg-yellow-100';
      case 'verified': return 'text-purple-600 bg-purple-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'fulfilled': return 'text-gray-600 bg-gray-100';
      case 'rejected': return 'text-red-600 bg-red-100';
    }
  };

  const getStatusMessage = (status: VerificationStatus) => {
    switch (status) {
      case 'submitted':
        return 'Your claim has been submitted and is in the queue for review.';
      case 'under_review':
        return 'Your claim is currently being reviewed by our team. We may contact you for additional information.';
      case 'verified':
        return 'Your claim has been verified and is awaiting final approval.';
      case 'approved':
        return 'Your claim has been approved! You will be notified about distribution arrangements soon.';
      case 'fulfilled':
        return 'Your relief items have been distributed. Thank you for your patience.';
      case 'rejected':
        return 'Your claim was not approved. Please see the notes below for more information.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6">
            <h1 className="text-3xl font-bold mb-2">Track Your Relief Claim</h1>
            <p className="text-blue-100">Check the status of your disaster relief claim</p>
          </div>

          {/* Search Section */}
          <div className="p-6 border-b">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by:
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="claim_number"
                    checked={searchMethod === 'claim_number'}
                    onChange={(e) => setSearchMethod(e.target.value as SearchMethod)}
                    className="mr-2"
                  />
                  <span>Claim Number</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="phone"
                    checked={searchMethod === 'phone'}
                    onChange={(e) => setSearchMethod(e.target.value as SearchMethod)}
                    className="mr-2"
                  />
                  <span>Phone Number</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={searchMethod === 'claim_number' ? 'Enter your claim number (e.g., HM-2025-00001)' : 'Enter your phone number'}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                disabled={loading || !searchValue.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Multiple Claims List (when searching by phone) */}
          {claims.length > 1 && (
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold mb-3">Your Claims</h2>
              <div className="space-y-2">
                {claims.map((claim) => (
                  <button
                    key={claim.id}
                    onClick={() => setSelectedClaim(claim)}
                    className={`w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition ${selectedClaim?.id === claim.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{claim.claim_number}</p>
                        <p className="text-sm text-gray-600">Submitted: {new Date(claim.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(claim.verification_status)}`}>
                        {claim.verification_status.replace('_', ' ')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Claim Details */}
          {selectedClaim && (
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedClaim.claim_number}</h2>
                    <p className="text-gray-600">Submitted on {new Date(selectedClaim.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${getStatusColor(selectedClaim.verification_status)}`}>
                    {getStatusIcon(selectedClaim.verification_status)}
                    <span className="font-semibold capitalize">
                      {selectedClaim.verification_status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-900">{getStatusMessage(selectedClaim.verification_status)}</p>
                </div>

                {/* Timeline */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Claim Progress</h3>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                    {[
                      { status: 'submitted', label: 'Submitted', date: selectedClaim.created_at },
                      { status: 'under_review', label: 'Under Review', date: null },
                      { status: 'verified', label: 'Verified', date: selectedClaim.verified_at },
                      { status: 'approved', label: 'Approved', date: selectedClaim.approved_at },
                      { status: 'fulfilled', label: 'Fulfilled', date: selectedClaim.pickup_confirmed_at }
                    ].map((step, index) => {
                      const isComplete = getStatusStep(selectedClaim.verification_status) > index;
                      const isCurrent = getStatusStep(selectedClaim.verification_status) === index + 1;

                      return (
                        <div key={step.status} className="relative flex items-start mb-8 last:mb-0">
                          <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                            isComplete || isCurrent
                              ? 'bg-blue-600 border-blue-600'
                              : 'bg-white border-gray-300'
                          }`}>
                            {isComplete && (
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                            {isCurrent && !isComplete && (
                              <div className="w-3 h-3 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className="ml-4 flex-1">
                            <p className={`font-medium ${isComplete || isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>
                              {step.label}
                            </p>
                            {step.date && (
                              <p className="text-sm text-gray-500">
                                {new Date(step.date).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Claim Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Claimant Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {selectedClaim.claimant_name}</p>
                      <p><strong>Phone:</strong> {selectedClaim.claimant_phone}</p>
                      {selectedClaim.claimant_email && (
                        <p><strong>Email:</strong> {selectedClaim.claimant_email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Location</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Parish:</strong> {selectedClaim.parish}</p>
                      {selectedClaim.community && (
                        <p><strong>Community:</strong> {selectedClaim.community}</p>
                      )}
                      <p><strong>Address:</strong> {selectedClaim.address}</p>
                    </div>
                  </div>
                </div>

                {/* Immediate Needs */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Immediate Needs Requested</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedClaim.immediate_needs.map((need) => (
                      <span
                        key={need}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm capitalize"
                      >
                        {need}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Distribution Information */}
                {selectedClaim.distribution_scheduled_date && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">Distribution Scheduled</h3>
                    <p className="text-green-800">
                      <strong>Date:</strong> {new Date(selectedClaim.distribution_scheduled_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-green-700 mt-2">
                      Please bring a valid ID and this claim number when picking up your relief items.
                    </p>
                  </div>
                )}

                {/* Public Notes */}
                {selectedClaim.public_notes && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">Notes</h3>
                    <p className="text-gray-700">{selectedClaim.public_notes}</p>
                  </div>
                )}

                {/* Rejection Information */}
                {selectedClaim.verification_status === 'rejected' && selectedClaim.verification_notes && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Rejection Reason</h3>
                    <p className="text-red-800">{selectedClaim.verification_notes}</p>
                  </div>
                )}
              </div>

              {/* Help Section */}
              <div className="bg-gray-50 rounded-lg p-4 border-t">
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-2">
                  If you have questions about your claim or need to update your information:
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>Call our hotline: 1-876-XXX-XXXX</li>
                  <li>WhatsApp: {selectedClaim.claimant_whatsapp || selectedClaim.claimant_phone}</li>
                  <li>Email: relief@jamaicaconnect.com</li>
                </ul>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!selectedClaim && !loading && !error && (
            <div className="p-12 text-center text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>Enter your claim number or phone number above to track your claim</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
