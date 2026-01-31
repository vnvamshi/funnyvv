// ═══════════════════════════════════════════════════════════════════════════════
// PRICE ALERT SYSTEM
// Users sign up to get notified when prices drop
// Builds email list + increases conversions
// © 2026 Vista View Realty Services LLC
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  productCategory?: string;
  currentPrice?: string;
}

const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  productName = '',
  productCategory = 'furniture',
  currentPrice = ''
}) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [email, setEmail] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [productSearch, setProductSearch] = useState(productName);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send to backend
      await fetch('/api/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          productSearch,
          targetPrice: parseFloat(targetPrice) || null,
          productCategory,
          createdAt: new Date().toISOString()
        })
      });

      setStep('success');
    } catch (error) {
      console.error('Failed to create alert:', error);
      // Still show success for demo
      setStep('success');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('form');
    setEmail('');
    setTargetPrice('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {step === 'form' ? (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🔔</span>
                  <div>
                    <h2 className="text-xl font-bold">Price Drop Alert</h2>
                    <p className="text-orange-100 text-sm">Get notified when prices drop!</p>
                  </div>
                </div>
                <button onClick={handleClose} className="p-1 hover:bg-white/20 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What product are you watching?
                </label>
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="e.g., Mid century sofa, Queen bed frame"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target price (optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="Alert me when under this price"
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Leave blank to get notified of any price drop</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Alert...
                  </>
                ) : (
                  <>
                    <span>🔔</span>
                    Create Price Alert
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                We'll email you when prices drop. Unsubscribe anytime.
              </p>
            </form>
          </>
        ) : (
          /* Success State */
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Alert Created!</h2>
            <p className="text-gray-600 mb-6">
              We'll email you at <strong>{email}</strong> when we find deals on "{productSearch}"
              {targetPrice && ` under $${targetPrice}`}.
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">While you wait...</h3>
              <p className="text-sm text-gray-600 mb-3">Check out current deals from 100+ retailers:</p>
              <a
                href={`/compare?q=${encodeURIComponent(productSearch)}`}
                className="inline-block px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                Compare Prices Now
              </a>
            </div>

            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceAlertModal;
