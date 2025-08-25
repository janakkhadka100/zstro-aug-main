'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation'; // <-- use this for redirect
import { useState } from 'react';

export default function UpgradePage() {
  const router = useRouter(); // <-- init router
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const plans = [
    {
      label: '7 Days',
      price: 'NPR 199',
      duration: '7 days access to unlimited chats',
      value: 'weekly',
    },
    {
      label: '30 Days',
      price: 'NPR 499',
      duration: '30 days access to unlimited chats',
      value: 'monthly',
      featured: true,
    },
    {
      label: '1 Year',
      price: 'NPR 3999',
      duration: '365 days access to unlimited chats',
      value: 'yearly',
    },
  ];

  const handleUpgradeClick = (plan: string) => {
    setSelectedPlan(plan);
    setShowPaymentOptions(true);
  };

  const handlePayment = (method: string) => {
    if (!selectedPlan) return;
    router.push(`/pay/${method}?plan=${selectedPlan}&amount=${plans.find(p => p.value === selectedPlan)?.price.replace('NPR ', '').replace(',', '')}`);
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 relative">
      <Link
        href="/"
        className="absolute top-6 right-6 text-gray-500 hover:text-gray-800 text-3xl font-bold"
        aria-label="Close upgrade page"
      >
        &times;
      </Link>

      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Upgrade Your Plan</h2>
        <p className="mt-4 text-lg text-gray-600">
          Get unlimited astrology chat access and personalized predictions.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.label}
            className={`rounded-xl border ${
              plan.featured ? 'border-blue-500 shadow-lg' : 'border-gray-200'
            } p-6 flex flex-col justify-between`}
          >
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{plan.label}</h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">{plan.price}</p>
              <p className="text-gray-600 mt-2">{plan.duration}</p>
            </div>
            <button
              onClick={() => handleUpgradeClick(plan.value)}
              className={`mt-6 py-2 px-4 rounded-lg text-white ${
                plan.featured
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-700 hover:bg-gray-800'
              }`}
            >
              Upgrade
            </button>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {showPaymentOptions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Choose Payment Method
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => handlePayment('esewa')}
                className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg"
              >
                Pay with eSewa
              </button>
              {/* 
              <button
                onClick={() => handlePayment('khalti')}
                className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
              >
                Pay with Khalti
              </button>
              <button
                onClick={() => handlePayment('connectips')}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Pay with ConnectIPS
              </button> */}
              <button
                onClick={() => setShowPaymentOptions(false)}
                className="w-full py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg mt-4"
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
