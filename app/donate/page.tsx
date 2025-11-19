'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Campaign } from '@/lib/types';

export default function DonatePage() {
  const searchParams = useSearchParams();
  const [amount, setAmount] = useState('100');
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const suggestedAmounts = ['25', '50', '100', '250', '500', '1000'];

  useEffect(() => {
    fetchCampaign();
  }, []);

  useEffect(() => {
    if (searchParams?.get('canceled')) {
      setError('Donation canceled. Please try again.');
    }
  }, [searchParams]);

  async function fetchCampaign() {
    const { data } = await supabase
      .from('campaigns')
      .select('*')
      .eq('slug', 'hurricane-melissa-relief')
      .eq('is_active', true)
      .single();

    if (data) {
      setCampaign(data);
    }
  }

  async function handleDonate() {
    setLoading(true);
    setError('');

    const donationAmount = amount === 'custom' ? parseFloat(customAmount) : parseFloat(amount);

    if (!donationAmount || donationAmount < 5) {
      setError('Minimum donation amount is $5');
      setLoading(false);
      return;
    }

    if (!donorEmail) {
      setError('Email is required for receipt');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: donationAmount,
          donor_name: isAnonymous ? 'Anonymous' : donorName,
          donor_email: donorEmail,
          campaign_id: campaign?.id,
          is_anonymous: isAnonymous,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Error creating checkout session:', err);
      setError(err.message || 'Failed to process donation');
      setLoading(false);
    }
  }

  const getFinalAmount = () => {
    if (amount === 'custom') {
      return parseFloat(customAmount) || 0;
    }
    return parseFloat(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Campaign Header */}
        {campaign && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {campaign.campaign_name}
            </h1>
            <p className="text-lg text-gray-700 mb-6">{campaign.description}</p>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-gray-700">
                  ${campaign.current_amount.toLocaleString()} raised
                </span>
                <span className="text-gray-600">
                  Goal: ${campaign.goal_amount?.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-[#009B3A] h-4 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      ((campaign.current_amount / (campaign.goal_amount || 1)) * 100),
                      100
                    )}%`,
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {((campaign.current_amount / (campaign.goal_amount || 1)) * 100).toFixed(1)}%
                of goal reached
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Donation Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Make Your Donation
              </h2>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-md">
                  {error}
                </div>
              )}

              {/* Amount Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Donation Amount
                </label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {suggestedAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt)}
                      className={`py-3 px-4 border-2 rounded-md font-semibold transition ${
                        amount === amt
                          ? 'border-[#009B3A] bg-green-50 text-[#009B3A]'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setAmount('custom')}
                  className={`w-full py-3 px-4 border-2 rounded-md font-semibold transition ${
                    amount === 'custom'
                      ? 'border-[#009B3A] bg-green-50 text-[#009B3A]'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Custom Amount
                </button>

                {amount === 'custom' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enter Amount (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">$</span>
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="0.00"
                        min="5"
                        step="1"
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#009B3A] focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Donor Information */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name {!isAnonymous && '*'}
                  </label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    disabled={isAnonymous}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#009B3A] focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#009B3A] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required for tax receipt
                  </p>
                </div>

                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 text-[#009B3A] border-gray-300 rounded focus:ring-[#009B3A]"
                    />
                    <span className="text-sm text-gray-700">
                      Make my donation anonymous
                    </span>
                  </label>
                </div>
              </div>

              {/* Donation Summary */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Donation Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Donation Amount</span>
                    <span className="font-semibold">${getFinalAmount().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing Fee</span>
                    <span className="font-semibold">
                      ${(getFinalAmount() * 0.029 + 0.30).toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-lg text-[#009B3A]">
                      ${getFinalAmount().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Net to Relief Fund</span>
                    <span className="font-semibold text-green-700">
                      ${(getFinalAmount() - (getFinalAmount() * 0.029 + 0.30)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleDonate}
                disabled={loading || !donorEmail || getFinalAmount() < 5}
                className="w-full py-4 bg-[#009B3A] text-white text-lg font-semibold rounded-md hover:bg-[#008030] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : `Donate $${getFinalAmount().toFixed(2)}`}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Powered by Stripe. Your payment information is secure and encrypted.
              </p>
            </div>
          </div>

          {/* Impact & Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Your Impact
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-700 font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">100% Transparent</p>
                    <p className="text-gray-600">
                      Track every dollar on our public dashboard
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-700 font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Direct Aid</p>
                    <p className="text-gray-600">
                      Funds go directly to verified recipients
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-700 font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Tax Deductible</p>
                    <p className="text-gray-600">
                      Receive an instant tax receipt via email
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex-shrink-0 flex items-center justify-center">
                    <span className="text-green-700 font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Real-Time Updates</p>
                    <p className="text-gray-600">
                      See exactly how your donation helps
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-2">
                Why Give?
              </h3>
              <p className="text-sm text-blue-800 mb-4">
                Hurricane Melissa has displaced over 400,000 Jamaicans. Your donation
                provides:
              </p>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Emergency shelter and supplies</li>
                <li>• Clean water and food</li>
                <li>• Medical assistance</li>
                <li>• Rebuilding materials</li>
              </ul>
            </div>

            <a
              href="/transparency"
              className="block text-center px-6 py-3 border-2 border-[#009B3A] text-[#009B3A] rounded-md hover:bg-green-50 transition font-semibold"
            >
              View Transparency Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
