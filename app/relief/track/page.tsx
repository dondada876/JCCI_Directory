'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { ReliefClaim } from '@/lib/types';

function TrackClaimContent() {
  const searchParams = useSearchParams();
  const [claimNumber, setClaimNumber] = useState(searchParams?.get('claim') || '');
  const [claim, setClaim] = useState<ReliefClaim | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const claimStages = [
    { id: 1, name: 'Submitted', description: 'Your claim has been received', status: 'submitted' },
    { id: 2, name: 'Under Review', description: 'Partner organization is verifying details', status: 'under_review' },
    { id: 3, name: 'Approved', description: 'Claim approved, supplies allocated', status: 'approved' },
    { id: 4, name: 'Scheduled', description: 'Distribution event scheduled', status: 'in_progress' },
    { id: 5, name: 'Fulfilled', description: 'Aid received and confirmed', status: 'fulfilled' },
  ];

  useEffect(() => {
    if (claimNumber) {
      searchClaim(claimNumber);
    }
  }, []);

  useEffect(() => {
    if (!claim) return;

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`claim_${claim.claim_number}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'relief_claims',
          filter: `claim_number=eq.${claim.claim_number}`,
        },
        (payload) => {
          setClaim(payload.new as ReliefClaim);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [claim]);

  async function searchClaim(number: string) {
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('relief_claims')
        .select('*')
        .eq('claim_number', number.trim().toUpperCase())
        .single();

      if (error) throw new Error('Claim not found');

      setClaim(data);
    } catch (err: any) {
      setError(err.message || 'Claim not found. Please check your claim number and try again.');
      setClaim(null);
    } finally {
      setLoading(false);
    }
  }

  function getCurrentStageIndex() {
    if (!claim) return -1;
    return claimStages.findIndex((s) => s.status === claim.verification_status);
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Track Your Claim</h1>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Your Claim Number
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                value={claimNumber}
                onChange={(e) => setClaimNumber(e.target.value.toUpperCase())}
                placeholder="HM-2025-00001"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#009B3A] focus:border-transparent"
              />
              <button
                onClick={() => searchClaim(claimNumber)}
                disabled={loading || !claimNumber}
                className="px-8 py-3 bg-[#009B3A] text-white rounded-md hover:bg-[#008030] transition disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Track'}
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          {claim && (
            <div className="space-y-8">
              <div className="border-b pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Claim Status
                </h2>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600">Claim Number</p>
                      <p className="text-2xl font-bold text-[#009B3A]">
                        {claim.claim_number}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Current Status</p>
                      <p className="text-lg font-semibold text-gray-900 capitalize">
                        {claim.verification_status.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Progress Tracker
                </h3>
                <div className="space-y-4">
                  {claimStages.map((stage, index) => {
                    const currentStageIndex = getCurrentStageIndex();
                    const isComplete = index <= currentStageIndex;
                    const isCurrent = index === currentStageIndex;

                    return (
                      <div key={stage.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isComplete
                                ? 'bg-[#009B3A] text-white'
                                : 'bg-gray-200 text-gray-400'
                            }`}
                          >
                            {isComplete ? (
                              <svg
                                className="w-6 h-6"
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
                            ) : (
                              <span className="text-sm font-semibold">{stage.id}</span>
                            )}
                          </div>
                          {index < claimStages.length - 1 && (
                            <div
                              className={`w-1 h-16 ${
                                isComplete ? 'bg-[#009B3A]' : 'bg-gray-200'
                              }`}
                            />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <h4
                            className={`font-semibold ${
                              isCurrent ? 'text-[#009B3A]' : 'text-gray-900'
                            }`}
                          >
                            {stage.name}
                          </h4>
                          <p className="text-sm text-gray-600">{stage.description}</p>
                          {isCurrent && claim.public_notes && (
                            <p className="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                              {claim.public_notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Claim Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Name</p>
                    <p className="font-semibold">
                      {claim.first_name} {claim.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Location</p>
                    <p className="font-semibold">
                      {claim.community}, {claim.parish}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Household Size</p>
                    <p className="font-semibold">{claim.household_size} people</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Submitted On</p>
                    <p className="font-semibold">{formatDate(claim.created_at)}</p>
                  </div>
                  {claim.pickup_date && (
                    <div>
                      <p className="text-gray-600">Scheduled Pickup</p>
                      <p className="font-semibold">{formatDate(claim.pickup_date)}</p>
                    </div>
                  )}
                  {claim.distribution_location && (
                    <div>
                      <p className="text-gray-600">Pickup Location</p>
                      <p className="font-semibold">{claim.distribution_location}</p>
                    </div>
                  )}
                </div>
              </div>

              {claim.verification_status === 'approved' && claim.approved_items && (
                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Approved Items
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      You have been approved to receive the following supplies:
                    </p>
                    <div className="mt-2 text-sm font-semibold text-gray-900">
                      {JSON.stringify(claim.approved_items)}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">Important Notes:</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Keep your claim number safe for future reference</li>
                  <li>• You will receive SMS updates on your claim status</li>
                  <li>
                    • If approved, you must collect supplies within 7 days of notification
                  </li>
                  <li>• Bring a valid ID when collecting supplies</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TrackClaimPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <TrackClaimContent />
    </Suspense>
  );
}
