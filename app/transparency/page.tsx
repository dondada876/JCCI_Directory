'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Donation, DonationStats, AllocationBreakdown } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function TransparencyDashboard() {
  const [stats, setStats] = useState<DonationStats>({
    total_raised: 0,
    total_allocated: 0,
    total_disbursed: 0,
    active_donors: 0,
  });
  const [allocations, setAllocations] = useState<AllocationBreakdown[]>([]);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#009B3A', '#FDB913', '#3B82F6', '#EF4444', '#8B5CF6', '#F59E0B'];

  useEffect(() => {
    fetchData();
    subscribeToUpdates();
  }, []);

  async function fetchData() {
    setLoading(true);

    try {
      // Fetch donation stats
      const { data: statsData, error: statsError } = await supabase.rpc('get_donation_stats');

      if (statsError) throw statsError;
      if (statsData) setStats(statsData as any);

      // Fetch allocation breakdown
      const { data: allocData, error: allocError } = await supabase.rpc(
        'get_allocation_breakdown'
      );

      if (allocError) throw allocError;
      if (allocData) setAllocations(allocData as AllocationBreakdown[]);

      // Fetch recent donations
      const { data: donationsData, error: donationsError } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (donationsError) throw donationsError;
      if (donationsData) setRecentDonations(donationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  function subscribeToUpdates() {
    const channel = supabase
      .channel('donations_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'donations' },
        (payload) => {
          setRecentDonations((prev) => [payload.new as Donation, ...prev].slice(0, 10));
          setStats((prev) => ({
            ...prev,
            total_raised: prev.total_raised + ((payload.new as Donation).net_amount || 0),
            active_donors: prev.active_donors + 1,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading transparency dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Financial Transparency Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            100% transparent tracking of Hurricane Melissa relief funds
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Raised</h3>
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-3xl font-bold text-[#009B3A]">
              {formatCurrency(stats.total_raised)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              From {stats.active_donors} generous donors
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Allocated</h3>
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {formatCurrency(stats.total_allocated)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {((stats.total_allocated / stats.total_raised) * 100).toFixed(1)}% of
              funds allocated
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Disbursed</h3>
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {formatCurrency(stats.total_disbursed)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Direct aid delivered</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Available</h3>
              <svg
                className="w-5 h-5 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <p className="text-3xl font-bold text-amber-600">
              {formatCurrency(stats.total_raised - stats.total_allocated)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Ready for allocation</p>
          </div>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Allocation Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Fund Allocation Breakdown
            </h2>
            {allocations.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={allocations}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) =>
                        `${entry.category}: ${((entry.amount / stats.total_allocated) * 100).toFixed(1)}%`
                      }
                    >
                      {allocations.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-6 space-y-2">
                  {allocations.map((allocation, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm text-gray-700">
                          {allocation.category}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(allocation.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No allocations yet. Funds are being planned for distribution.
              </div>
            )}
          </div>

          {/* Recent Donations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Recent Donations
            </h2>
            {recentDonations.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {recentDonations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex justify-between items-center py-3 border-b last:border-b-0"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {donation.is_anonymous ? 'Anonymous' : donation.donor_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(donation.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#009B3A]">
                        {formatCurrency(donation.amount)}
                      </p>
                      <p className="text-xs text-gray-500">{donation.currency}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No donations yet. Be the first to contribute!
              </div>
            )}
          </div>
        </div>

        {/* Information Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-green-900 mb-3">
              Our Commitment to Transparency
            </h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li>✓ 100% of funds are publicly tracked in real-time</li>
              <li>✓ Every transaction is verified and documented</li>
              <li>✓ Receipts and proof of delivery for all expenditures</li>
              <li>✓ Third-party audits to ensure accountability</li>
              <li>✓ Regular updates to all donors</li>
            </ul>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-3">
              How Funds Are Used
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Emergency shelter and temporary housing</li>
              <li>• Food, water, and essential supplies</li>
              <li>• Medical care and medications</li>
              <li>• Rebuilding materials and tools</li>
              <li>• Direct cash assistance to verified families</li>
            </ul>
            <a
              href="/donate"
              className="inline-block mt-4 px-6 py-2 bg-[#009B3A] text-white rounded-md hover:bg-[#008030] transition font-semibold"
            >
              Make a Donation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
