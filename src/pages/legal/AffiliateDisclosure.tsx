// Affiliate Disclosure - vistaview.live
// © 2026 Vista View Realty Services LLC. All Rights Reserved.
// Required by FTC (US), ASA (UK), and similar regulations worldwide

import React from 'react';

export const AffiliateDisclosure: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Affiliate Disclosure</h1>
        <p className="text-gray-500 mb-8">Last updated: January 31, 2026</p>

        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8">
          <p className="text-amber-800 font-medium">
            <strong>Important Notice:</strong> VistaView.live is a participant in various
            affiliate advertising programs. This means we earn commissions when you click
            on links to retailers and make purchases. This is at no additional cost to you.
          </p>
        </div>

        <div className="prose prose-gray max-w-none">
          <h2>What This Means for You</h2>
          <p>
            When you see products on VistaView, we provide links to purchase those products
            from various retailers. If you click on these links and make a purchase, we may
            receive a small commission from the retailer.
          </p>
          <p>
            <strong>This does NOT increase the price you pay.</strong> The retailer pays us
            the commission from their marketing budget, not from your purchase price.
          </p>

          <h2>Our Affiliate Partnerships</h2>
          <p>VistaView participates in affiliate programs with retailers worldwide, including:</p>

          <h3>🇺🇸 United States</h3>
          <ul>
            <li><strong>Amazon Associates Program</strong> - As an Amazon Associate, we earn from qualifying purchases.</li>
            <li><strong>Wayfair Affiliate Program</strong></li>
            <li><strong>IKEA Affiliate Program</strong> (via Awin)</li>
            <li><strong>Target Affiliate Program</strong></li>
            <li><strong>Walmart Affiliate Program</strong></li>
            <li><strong>Home Depot Affiliate Program</strong></li>
            <li><strong>Overstock Affiliate Program</strong> (via CJ Affiliate)</li>
            <li><strong>West Elm, Pottery Barn</strong> (via Rakuten)</li>
            <li>And 50+ other US retailers</li>
          </ul>

          <h3>🇮🇳 India</h3>
          <ul>
            <li><strong>Amazon Associates India</strong></li>
            <li><strong>Flipkart Affiliate Program</strong></li>
            <li><strong>Pepperfry, Urban Ladder</strong> (via Cuelinks)</li>
            <li>And 20+ other Indian retailers</li>
          </ul>

          <h3>🇪🇺 Europe</h3>
          <ul>
            <li><strong>Amazon Associates</strong> (UK, DE, FR, IT, ES)</li>
            <li><strong>IKEA Affiliate Programs</strong> (via Awin)</li>
            <li><strong>Wayfair Europe</strong></li>
            <li><strong>Made.com, John Lewis, Maisons du Monde</strong></li>
            <li>And 40+ other European retailers</li>
          </ul>

          <h3>🌏 Asia Pacific</h3>
          <ul>
            <li><strong>Amazon Japan & Australia</strong></li>
            <li><strong>Taobao/Tmall</strong> (via Alimama)</li>
            <li><strong>JD.com</strong></li>
            <li><strong>Temple & Webster</strong> (Australia)</li>
          </ul>

          <h2>Affiliate Networks We Use</h2>
          <p>We work with major affiliate networks that manage relationships with thousands of retailers:</p>
          <ul>
            <li>Awin (global)</li>
            <li>CJ Affiliate (Commission Junction)</li>
            <li>ShareASale</li>
            <li>Rakuten Advertising</li>
            <li>Impact</li>
            <li>FlexOffers</li>
            <li>Admitad</li>
            <li>Cuelinks (India)</li>
            <li>Commission Factory (Australia)</li>
          </ul>

          <h2>How We Choose Products</h2>
          <p>
            Our product recommendations are based on:
          </p>
          <ul>
            <li>User search queries and preferences</li>
            <li>Price competitiveness</li>
            <li>Product ratings and reviews</li>
            <li>Availability and shipping options</li>
          </ul>
          <p>
            While we earn commissions from affiliate links, this does NOT influence our
            product rankings or recommendations. We show products from retailers regardless
            of affiliate commission rates.
          </p>

          <h2>Price Accuracy</h2>
          <p>
            Prices displayed on VistaView are provided by third-party retailers and may
            not be current. Prices can change at any time. Always verify the final price
            on the retailer's website before making a purchase.
          </p>

          <h2>Cookies and Tracking</h2>
          <p>
            When you click an affiliate link, a cookie may be placed on your device to
            track your purchase for commission purposes. These cookies typically last
            24 hours to 30 days depending on the retailer's affiliate program.
          </p>

          <h2>Questions?</h2>
          <p>
            If you have any questions about our affiliate relationships, please contact us:
          </p>
          <p>
            <strong>Vista View Realty Services LLC</strong><br />
            Email: affiliates@vistaview.live
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            © 2026 Vista View Realty Services LLC. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AffiliateDisclosure;
