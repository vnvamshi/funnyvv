// Privacy Policy - vistaview.live
// © 2026 Vista View Realty Services LLC. All Rights Reserved.

import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: January 31, 2026</p>

        <div className="prose prose-gray max-w-none">
          <h2>1. Introduction</h2>
          <p>
            Vista View Realty Services LLC ("VistaView," "we," "us," or "our") operates
            vistaview.live (the "Website"). This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you visit our Website.
          </p>

          <h2>2. Information We Collect</h2>

          <h3>2.1 Personal Information</h3>
          <p>We may collect personal information that you voluntarily provide, including:</p>
          <ul>
            <li>Name and email address (when you sign up or contact us)</li>
            <li>Phone number (for real estate inquiries)</li>
            <li>Mailing address (for shipping or real estate purposes)</li>
            <li>Payment information (processed securely via Stripe)</li>
          </ul>

          <h3>2.2 Automatically Collected Information</h3>
          <p>When you visit our Website, we automatically collect:</p>
          <ul>
            <li>IP address and browser type</li>
            <li>Device information</li>
            <li>Pages visited and time spent</li>
            <li>Referral source</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul>
            <li>Provide and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send promotional communications (with your consent)</li>
            <li>Respond to inquiries and customer service requests</li>
            <li>Analyze usage patterns to improve user experience</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>4. Affiliate Disclosure</h2>
          <p>
            <strong>Important:</strong> VistaView participates in affiliate marketing programs.
            This means we may earn commissions when you click on links to retailers (such as
            Amazon, Wayfair, IKEA, Flipkart, and others) and make purchases. This does not
            affect the price you pay. See our full <a href="/affiliate-disclosure">Affiliate Disclosure</a>.
          </p>

          <h2>5. Cookies and Tracking</h2>
          <p>We use cookies and similar technologies to:</p>
          <ul>
            <li>Remember your preferences</li>
            <li>Track affiliate referrals</li>
            <li>Analyze website traffic (Google Analytics)</li>
            <li>Provide personalized content</li>
          </ul>
          <p>
            You can control cookies through your browser settings. Note that disabling
            cookies may affect website functionality.
          </p>

          <h2>6. Third-Party Services</h2>
          <p>We share information with:</p>
          <ul>
            <li><strong>Affiliate Partners:</strong> Amazon, Wayfair, and 100+ retailers for tracking purchases</li>
            <li><strong>Payment Processors:</strong> Stripe for secure payment handling</li>
            <li><strong>Analytics:</strong> Google Analytics for website statistics</li>
            <li><strong>Hosting:</strong> Vercel for website hosting</li>
          </ul>

          <h2>7. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your
            personal information. However, no method of transmission over the Internet is
            100% secure.
          </p>

          <h2>8. Your Rights</h2>

          <h3>8.1 GDPR Rights (EU Residents)</h3>
          <p>If you are in the European Union, you have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Rectify inaccurate data</li>
            <li>Request erasure ("right to be forgotten")</li>
            <li>Restrict processing</li>
            <li>Data portability</li>
            <li>Object to processing</li>
          </ul>

          <h3>8.2 CCPA Rights (California Residents)</h3>
          <p>If you are a California resident, you have the right to:</p>
          <ul>
            <li>Know what personal information is collected</li>
            <li>Know if personal information is sold or disclosed</li>
            <li>Say no to the sale of personal information</li>
            <li>Access your personal information</li>
            <li>Equal service and price</li>
          </ul>

          <h2>9. Children's Privacy</h2>
          <p>
            Our Website is not intended for children under 13. We do not knowingly collect
            personal information from children under 13.
          </p>

          <h2>10. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than
            your own. We ensure appropriate safeguards are in place for such transfers.
          </p>

          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of
            any changes by posting the new Privacy Policy on this page and updating the
            "Last updated" date.
          </p>

          <h2>12. Contact Us</h2>
          <p>For privacy-related inquiries, contact us at:</p>
          <p>
            <strong>Vista View Realty Services LLC</strong><br />
            3128 Denali Dr<br />
            Irving, TX 75063<br />
            United States<br />
            Email: privacy@vistaview.live
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

export default PrivacyPolicy;
