'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import type { ReliefClaim } from '@/lib/types';
import { JAMAICAN_PARISHES } from '@/lib/types';

export default function ClaimVerificationDashboard() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [claims, setClaims] = useState<ReliefClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<ReliefClaim | null>(null);
  const [updating, setUpdating] = useState(false);

  const [filters, setFilters] = useState({
    status: 'submitted',
    parish: 'all',
    priority: 'all',
  });

  useEffect(() => {
    if (!authLoading && (!user || (profile?.user_type !== 'partner' && profile?.user_type !== 'admin'))) {
      router.push('/');
    }
  }, [user, profile, authLoading, router]);

  useEffect(() => {
    if (user && (profile?.user_type === 'partner' || profile?.user_type === 'admin')) {
      fetchClaims();
      subscribeToChanges();
    }
  }, [user, profile, filters]);

  async function fetchClaims() {
    setLoading(true);

    try {
      let query = supabase
        .from('relief_claims')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.status !== 'all') {
        query = query.eq('verification_status', filters.status);
      }

      if (filters.parish !== 'all') {
        query = query.eq('parish', filters.parish);
      }

      if (filters.priority !== 'all') {
        query = query.eq('priority_level', filters.priority);
      }

      const { data, error } = await query;

      if (error) throw error;

      setClaims(data || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  }

  function subscribeToChanges() {
    const channel = supabase
      .channel('relief_claims_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'relief_claims' },
        (payload) => {
          setClaims((prev) => [payload.new as ReliefClaim, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'relief_claims' },
        (payload) => {
          setClaims((prev) =>
            prev.map((claim) =>
              claim.id === payload.new.id ? (payload.new as ReliefClaim) : claim
            )
          );
          if (selectedClaim?.id === payload.new.id) {
            setSelectedClaim(payload.new as ReliefClaim);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async function updateClaimStatus(
    claimId: string,
    updates: Partial<ReliefClaim>
  ) {
    setUpdating(true);

    try {
      const { error } = await supabase
        .from('relief_claims')
        .update({
          ...updates,
          verified_by: user?.id,
          verification_date: new Date().toISOString(),
        })
        .eq('id', claimId);

      if (error) throw error;

      // Close modal after successful update
      setSelectedClaim(null);
    } catch (error) {
      console.error('Error updating claim:', error);
      alert('Error updating claim');
    } finally {
      setUpdating(false);
    }
  }

  async function approveClaim(claim: ReliefClaim) {
    await updateClaimStatus(claim.id, {
      verification_status: 'approved',
      status: 'approved',
    });
  }

  async function rejectClaim(claim: ReliefClaim, reason: string) {
    await updateClaimStatus(claim.id, {
      verification_status: 'submitted',
      status: 'pending',
      internal_notes: `Rejected: ${reason}`,
    });
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || (profile?.user_type !== 'partner' && profile?.user_type !== 'admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Relief Claims Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Review and verify Hurricane Melissa relief claims
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#009B3A] focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="verified">Verified</option>
                <option value="approved">Approved</option>
                <option value="fulfilled">Fulfilled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parish
              </label>
              <select
                value={filters.parish}
                onChange={(e) => setFilters({ ...filters, parish: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#009B3A] focus:border-transparent"
              >
                <option value="all">All Parishes</option>
                {JAMAICAN_PARISHES.map((parish) => (
                  <option key={parish} value={parish}>
                    {parish}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#009B3A] focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="standard">Standard</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Claims List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Claims ({claims.length})
            </h2>
          </div>

          {claims.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No claims found matching your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Claim #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Household
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {claims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {claim.claim_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {claim.first_name} {claim.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {claim.community}, {claim.parish}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {claim.household_size} people
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            claim.verification_status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : claim.verification_status === 'under_review'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {claim.verification_status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {claim.priority_level}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedClaim(claim)}
                          className="text-[#009B3A] hover:text-[#008030]"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Claim Detail Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full p-8 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Claim Details: {selectedClaim.claim_number}
              </h2>
              <button
                onClick={() => setSelectedClaim(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold">
                    {selectedClaim.first_name} {selectedClaim.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold">{selectedClaim.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{selectedClaim.email || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold">
                    {selectedClaim.community}, {selectedClaim.parish}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-semibold">{selectedClaim.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Household Size</p>
                  <p className="font-semibold">{selectedClaim.household_size} people</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Children</p>
                  <p className="font-semibold">{selectedClaim.children_count || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Elderly</p>
                  <p className="font-semibold">{selectedClaim.elderly_count || 0}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Damage Type</p>
                <div className="flex flex-wrap gap-2">
                  {selectedClaim.damage_type?.map((type) => (
                    <span
                      key={type}
                      className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full capitalize"
                    >
                      {type.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Damage Severity</p>
                <p className="font-semibold capitalize">
                  {selectedClaim.damage_severity?.replace(/_/g, ' ')}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Immediate Needs</p>
                <div className="flex flex-wrap gap-2">
                  {selectedClaim.immediate_needs?.map((need) => (
                    <span
                      key={need}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full capitalize"
                    >
                      {need.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {selectedClaim.damage_photos && selectedClaim.damage_photos.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Damage Photos</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedClaim.damage_photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Damage ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 border-t pt-6">
              <button
                onClick={() => approveClaim(selectedClaim)}
                disabled={updating || selectedClaim.verification_status === 'approved'}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Approve Claim'}
              </button>
              <button
                onClick={() => {
                  const reason = prompt('Enter rejection reason:');
                  if (reason) {
                    rejectClaim(selectedClaim, reason);
                  }
                }}
                disabled={updating}
                className="px-6 py-3 border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={() => setSelectedClaim(null)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
