'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');

  useEffect(() => {
    // Track successful donation
    if (sessionId) {
      console.log('Donation successful:', sessionId);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
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

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Thank You for Your Generosity!
          </h1>

          <p className="text-lg text-gray-700 mb-6">
            Your donation has been successfully processed. You will receive a tax
            receipt via email shortly.
          </p>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              What Happens Next?
            </h2>
            <div className="text-left space-y-3 text-gray-700">
              <p>✓ Your donation is being processed securely</p>
              <p>✓ A tax receipt will be emailed to you within 24 hours</p>
              <p>✓ Track your donation's impact on our transparency dashboard</p>
              <p>✓ You'll receive updates on how your funds are helping</p>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/transparency"
              className="block w-full px-8 py-4 bg-[#009B3A] text-white text-lg font-semibold rounded-md hover:bg-[#008030] transition"
            >
              View Transparency Dashboard
            </Link>

            <Link
              href="/"
              className="block w-full px-8 py-4 border-2 border-gray-300 text-gray-700 text-lg font-semibold rounded-md hover:bg-gray-50 transition"
            >
              Return to Homepage
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t">
            <p className="text-sm text-gray-600">
              Want to make an even bigger impact?
            </p>
            <Link
              href="/donate"
              className="text-[#009B3A] hover:underline font-semibold"
            >
              Make another donation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DonationSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
