'use client';

/**
 * CLAIM VERIFICATION DASHBOARD
 *
 * Admin/staff dashboard for reviewing, verifying, and approving relief claims.
 * Features:
 * - Filter and search claims
 * - View claim details
 * - Update claim status
 * - Approve/reject claims
 * - Assign priority levels
 * - Real-time updates
 */

import React, { useState, useEffect } from 'react';
import {
  getAllClaims,
  getClaimById,
  updateClaimStatus,
  approveClaim,
  rejectClaim,
  updateClaimPriority,
  addClaimNotes,
  getClaimsStatistics,
  subscribeToNewClaims
} from '@/lib/api/relief-claims';
import type {
  ReliefClaim,
  ClaimFilters,
  VerificationStatus,
  PriorityLevel,
  ApprovedItems,
  Parish
} from '@/lib/types/relief-claims';
import {
  VERIFICATION_STATUSES,
  PRIORITY_LEVELS,
  JAMAICAN_PARISHES
} from '@/lib/types/relief-claims';

export default function ClaimVerificationDashboard() {
  const [claims, setClaims] = useState<ReliefClaim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<ReliefClaim | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statistics, setStatistics] = useState<any>(null);

  // Filters
  const [filters, setFilters] = useState<ClaimFilters>({
    verification_status: undefined,
    parish: undefined,
    priority_level: undefined,
    search: ''
  });

  // Modal states
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Load claims
  useEffect(() => {
    loadClaims();
    loadStatistics();

    // Subscribe to new claims
    const subscription = subscribeToNewClaims((newClaim) => {
      setClaims(prev => [newClaim, ...prev]);
      loadStatistics(); // Refresh stats
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [filters, currentPage]);

  const loadClaims = async () => {
    setLoading(true);
    const result = await getAllClaims(filters, currentPage, 20);
    setClaims(result.data);
    setTotalPages(result.total_pages);
    setLoading(false);
  };

  const loadStatistics = async () => {
    const stats = await getClaimsStatistics();
    setStatistics(stats.data);
  };

  const handleViewClaim = async (claimId: string) => {
    const result = await getClaimById(claimId);
    if (result.data) {
      setSelectedClaim(result.data);
    }
  };

  const handleStatusChange = async (claimId: string, status: VerificationStatus) => {
    await updateClaimStatus(claimId, status);
    loadClaims();
    if (selectedClaim?.id === claimId) {
      handleViewClaim(claimId);
    }
  };

  const handlePriorityChange = async (claimId: string, priority: PriorityLevel) => {
    await updateClaimPriority(claimId, priority);
    loadClaims();
    if (selectedClaim?.id === claimId) {
      handleViewClaim(claimId);
    }
  };

  const handleApproveClaim = async () => {
    if (!selectedClaim) return;

    // Simple approved items structure - in production, this would be more detailed
    const approvedItems: ApprovedItems = {
      supplies: selectedClaim.immediate_needs.map(need => ({
        item: need,
        quantity: 1,
        unit: 'set'
      }))
    };

    const result = await approveClaim(
      selectedClaim.id,
      approvedItems,
      'current-user-id', // Replace with actual user ID from auth
      approvalNotes
    );

    if (result.data) {
      setShowApprovalModal(false);
      setApprovalNotes('');
      loadClaims();
      handleViewClaim(selectedClaim.id);
    }
  };

  const handleRejectClaim = async () => {
    if (!selectedClaim) return;

    const result = await rejectClaim(
      selectedClaim.id,
      rejectionReason,
      'current-user-id' // Replace with actual user ID from auth
    );

    if (result.data) {
      setShowRejectionModal(false);
      setRejectionReason('');
      loadClaims();
      setSelectedClaim(null);
    }
  };

  const getPriorityColor = (priority: PriorityLevel) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'verified': return 'bg-purple-100 text-purple-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'fulfilled': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Relief Claims Dashboard</h1>
        <p className="text-gray-600">Review and manage disaster relief claims</p>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Claims</p>
            <p className="text-3xl font-bold text-gray-900">{statistics.total}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Pending Review</p>
            <p className="text-3xl font-bold text-yellow-600">
              {(statistics.by_status?.submitted || 0) + (statistics.by_status?.under_review || 0)}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Urgent</p>
            <p className="text-3xl font-bold text-red-600">{statistics.by_priority?.urgent || 0}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Fulfilled</p>
            <p className="text-3xl font-bold text-green-600">{statistics.by_status?.fulfilled || 0}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Claims List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            {/* Filters */}
            <div className="p-4 border-b">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Search by name, number, phone..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <select
                  value={filters.verification_status || ''}
                  onChange={(e) => setFilters({ ...filters, verification_status: e.target.value as VerificationStatus || undefined })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Statuses</option>
                  {VERIFICATION_STATUSES.map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.parish || ''}
                  onChange={(e) => setFilters({ ...filters, parish: e.target.value as Parish || undefined })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Parishes</option>
                  {JAMAICAN_PARISHES.map(parish => (
                    <option key={parish} value={parish}>{parish}</option>
                  ))}
                </select>
                <select
                  value={filters.priority_level || ''}
                  onChange={(e) => setFilters({ ...filters, priority_level: e.target.value as PriorityLevel || undefined })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Priorities</option>
                  {PRIORITY_LEVELS.map(priority => (
                    <option key={priority} value={priority}>
                      {priority.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Claims Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Claim #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Claimant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parish</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        Loading claims...
                      </td>
                    </tr>
                  ) : claims.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No claims found
                      </td>
                    </tr>
                  ) : (
                    claims.map((claim) => (
                      <tr
                        key={claim.id}
                        className={`hover:bg-gray-50 cursor-pointer ${selectedClaim?.id === claim.id ? 'bg-blue-50' : ''}`}
                        onClick={() => handleViewClaim(claim.id)}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{claim.claim_number}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{claim.claimant_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{claim.parish}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(claim.priority_level)}`}>
                            {claim.priority_level}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(claim.verification_status)}`}>
                            {claim.verification_status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(claim.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewClaim(claim.id);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t flex justify-between items-center">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Claim Details */}
        <div className="lg:col-span-1">
          {selectedClaim ? (
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Claim Details</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Claim Number</p>
                  <p className="font-semibold text-lg">{selectedClaim.claim_number}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Claimant</p>
                  <p className="font-medium">{selectedClaim.claimant_name}</p>
                  <p className="text-sm">{selectedClaim.claimant_phone}</p>
                  {selectedClaim.claimant_email && <p className="text-sm">{selectedClaim.claimant_email}</p>}
                </div>

                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{selectedClaim.parish}</p>
                  {selectedClaim.community && <p className="text-sm">{selectedClaim.community}</p>}
                  <p className="text-sm">{selectedClaim.address}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Damage</p>
                  <p className="font-medium capitalize">{selectedClaim.damage_severity}</p>
                  <p className="text-sm">{selectedClaim.damage_type.join(', ')}</p>
                  {selectedClaim.damage_description && (
                    <p className="text-sm mt-1">{selectedClaim.damage_description}</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-600">Household</p>
                  <p className="text-sm">Size: {selectedClaim.household_size}</p>
                  <p className="text-sm">Children: {selectedClaim.children_count}</p>
                  <p className="text-sm">Elderly: {selectedClaim.elderly_count}</p>
                  <p className="text-sm">Disabled: {selectedClaim.disabled_count}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Immediate Needs</p>
                  <p className="text-sm">{selectedClaim.immediate_needs.join(', ')}</p>
                </div>

                {selectedClaim.damage_photos && selectedClaim.damage_photos.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Photos</p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedClaim.damage_photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Damage ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Priority Selector */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Priority Level</p>
                  <select
                    value={selectedClaim.priority_level}
                    onChange={(e) => handlePriorityChange(selectedClaim.id, e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {PRIORITY_LEVELS.map(priority => (
                      <option key={priority} value={priority}>{priority.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                {/* Status Selector */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <select
                    value={selectedClaim.verification_status}
                    onChange={(e) => handleStatusChange(selectedClaim.id, e.target.value as VerificationStatus)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {VERIFICATION_STATUSES.map(status => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4">
                  {selectedClaim.verification_status !== 'approved' && selectedClaim.verification_status !== 'rejected' && (
                    <>
                      <button
                        onClick={() => setShowApprovalModal(true)}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Approve Claim
                      </button>
                      <button
                        onClick={() => setShowRejectionModal(true)}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Reject Claim
                      </button>
                    </>
                  )}
                </div>

                {selectedClaim.public_notes && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">Public Notes</p>
                    <p className="text-sm">{selectedClaim.public_notes}</p>
                  </div>
                )}

                {selectedClaim.internal_notes && (
                  <div className="pt-2">
                    <p className="text-sm text-gray-600">Internal Notes</p>
                    <p className="text-sm">{selectedClaim.internal_notes}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-center text-gray-500">Select a claim to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Approve Claim</h3>
            <p className="text-sm text-gray-600 mb-4">
              Approving claim: {selectedClaim?.claim_number}
            </p>
            <textarea
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Add notes for the claimant (optional)..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              rows={4}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleApproveClaim}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Confirm Approval
              </button>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Reject Claim</h3>
            <p className="text-sm text-gray-600 mb-4">
              Rejecting claim: {selectedClaim?.claim_number}
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection (required)..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              rows={4}
              required
            />
            <div className="flex space-x-2">
              <button
                onClick={handleRejectClaim}
                disabled={!rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => setShowRejectionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
