import React from 'react';
import ShareButton from './ShareButton';

/**
 * Example component demonstrating how to use the ShareButton component
 * in different scenarios for both mobile and desktop
 */
const ShareButtonExample: React.FC = () => {
  // Example property data
  const propertyData = {
    id: '12345',
    title: 'Beautiful 3-Bedroom Home in Downtown',
    address: '123 Main St, San Francisco, CA',
    price: '$850,000',
    url: 'https://vistaview.com/property/12345'
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        ShareButton Component Examples
      </h1>

      {/* Example 1: Basic usage with current URL */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">1. Basic Share Button (Current URL)</h2>
        <p className="text-gray-600 mb-3">
          Uses the current page URL and default title
        </p>
        <ShareButton />
      </div>

      {/* Example 2: Custom property URL */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">2. Property Share Button</h2>
        <p className="text-gray-600 mb-3">
          Shares a specific property with custom title and text
        </p>
        <ShareButton
          url={propertyData.url}
          title={`${propertyData.title} - ${propertyData.price}`}
          text={`Check out this amazing ${propertyData.title} located at ${propertyData.address}. Priced at ${propertyData.price}!`}
        />
      </div>

      {/* Example 3: Different sizes */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">3. Different Sizes</h2>
        <p className="text-gray-600 mb-3">
          Small, medium, and large button sizes
        </p>
        <div className="flex gap-4 items-center">
          <ShareButton size="small" url={propertyData.url} title={propertyData.title} />
          <ShareButton size="medium" url={propertyData.url} title={propertyData.title} />
          <ShareButton size="large" url={propertyData.url} title={propertyData.title} />
        </div>
      </div>

      {/* Example 4: Different variants */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">4. Different Variants</h2>
        <p className="text-gray-600 mb-3">
          Outline, filled, and icon-only variants
        </p>
        <div className="flex gap-4 items-center">
          <ShareButton variant="outline" url={propertyData.url} title={propertyData.title} />
          <ShareButton variant="filled" url={propertyData.url} title={propertyData.title} />
          <ShareButton variant="icon-only" url={propertyData.url} title={propertyData.title} />
          <ShareButton variant="edit-style" url={propertyData.url} title={propertyData.title} />
        </div>
      </div>

      {/* Example 5: Custom styling */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">5. Custom Styling</h2>
        <p className="text-gray-600 mb-3">
          Custom CSS classes and button text
        </p>
        <ShareButton
          url={propertyData.url}
          title={propertyData.title}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700"
          buttonText="Share Property"
        />
      </div>

      {/* Example 6: Callbacks */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">6. With Callbacks</h2>
        <p className="text-gray-600 mb-3">
          Success and error callback functions
        </p>
        <ShareButton
          url={propertyData.url}
          title={propertyData.title}
          onShareSuccess={() => {
            console.log('Property shared successfully!');
            // You could track analytics here
          }}
          onShareError={(error) => {
            console.error('Share failed:', error);
            // You could show a custom error message here
          }}
        />
      </div>

      {/* Example 7: Icon only with custom size */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">7. Icon Only Variants</h2>
        <p className="text-gray-600 mb-3">
          Icon-only buttons in different sizes
        </p>
        <div className="flex gap-4 items-center">
          <ShareButton
            variant="icon-only"
            size="small"
            url={propertyData.url}
            title={propertyData.title}
          />
          <ShareButton
            variant="icon-only"
            size="medium"
            url={propertyData.url}
            title={propertyData.title}
          />
          <ShareButton
            variant="icon-only"
            size="large"
            url={propertyData.url}
            title={propertyData.title}
          />
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h2 className="text-lg font-semibold mb-3">Usage Instructions</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Mobile:</strong> Uses native share API if available, falls back to clipboard copy</p>
          <p><strong>Desktop:</strong> Opens a share modal with social media options and copy link</p>
          <p><strong>Props:</strong> All props are optional except for custom functionality</p>
          <p><strong>Styling:</strong> Follows the existing design system with gold icons and green accents</p>
        </div>
      </div>
    </div>
  );
};

export default ShareButtonExample; 