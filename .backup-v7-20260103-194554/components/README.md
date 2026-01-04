# ShareButton Component

A comprehensive, responsive share button component for both mobile and desktop that allows users to share property links and other content.

## Features

- **Responsive Design**: Automatically adapts to mobile and desktop layouts
- **Native Sharing**: Uses native share API on mobile devices when available
- **Social Media Integration**: Desktop modal with social media sharing options
- **Fallback Support**: Clipboard copy functionality for unsupported browsers
- **Internationalization**: Full i18n support with English and Spanish
- **Customizable**: Multiple variants, sizes, and styling options
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Installation

The component is already included in the project. Import it directly:

```tsx
import ShareButton from '../components/ShareButton';
```

## Basic Usage

### Simple Share Button
```tsx
// Uses current page URL and default title
<ShareButton />
```

### Property Share Button
```tsx
<ShareButton
  url="https://vistaview.com/property/12345"
  title="Beautiful 3-Bedroom Home - $850,000"
  text="Check out this amazing property located at 123 Main St, San Francisco, CA. Priced at $850,000!"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `url` | `string` | `window.location.href` | The URL to share |
| `title` | `string` | `'Check out this property on Vistaview'` | The title of the content being shared |
| `text` | `string` | `title` | Additional text description for the shared content |
| `className` | `string` | `''` | Custom CSS classes for styling |
| `showText` | `boolean` | `true` | Whether to show the button text |
| `buttonText` | `string` | Translation key | Custom button text |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size variant for the button |
| `variant` | `'outline' \| 'filled' \| 'icon-only' \| 'original' \| 'minimal' \| 'green' \| 'edit-style'` | `'outline'` | Variant style for the button |
| `onShareSuccess` | `() => void` | `undefined` | Callback function called when share is successful |
| `onShareError` | `(error: string) => void` | `undefined` | Callback function called when share fails |

## Variants

### Outline (Default)
```tsx
<ShareButton variant="outline" />
```

### Filled
```tsx
<ShareButton variant="filled" />
```

### Icon Only
```tsx
<ShareButton variant="icon-only" />
```

### Edit Style (matches edit button design)
```tsx
<ShareButton variant="edit-style" />
```

## Sizes

### Small
```tsx
<ShareButton size="small" />
```

### Medium (Default)
```tsx
<ShareButton size="medium" />
```

### Large
```tsx
<ShareButton size="large" />
```

## Behavior

### Mobile Devices
- Uses native share API if available
- Falls back to clipboard copy if native sharing is not supported
- Shows loading state during share operation

### Desktop Devices
- Opens a share modal with social media options
- Includes Facebook, Twitter, LinkedIn, WhatsApp, and Email sharing
- Provides copy link functionality
- Modal can be closed by clicking outside or the close button

## Social Media Integration

The desktop modal includes sharing options for:
- **Facebook**: Opens Facebook share dialog
- **Twitter**: Opens Twitter compose dialog
- **LinkedIn**: Opens LinkedIn share dialog
- **WhatsApp**: Opens WhatsApp with pre-filled message
- **Email**: Opens default email client with pre-filled subject and body

## Styling

The component follows the existing design system:
- Uses gold gradient icons (`gold-share.svg` for desktop, `pd-gold-share.svg` for mobile)
- Green color scheme (`#00916A`, `#007E67`)
- Consistent with existing button styles
- Responsive design with appropriate sizing for mobile and desktop

## Custom Styling

You can override the default styles using the `className` prop:

```tsx
<ShareButton
  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0"
  buttonText="Share Property"
/>
```

## Callbacks

### Success Callback
```tsx
<ShareButton
  onShareSuccess={() => {
    console.log('Property shared successfully!');
    // Track analytics, show success message, etc.
  }}
/>
```

### Error Callback
```tsx
<ShareButton
  onShareError={(error) => {
    console.error('Share failed:', error);
    // Show custom error message, retry logic, etc.
  }}
/>
```

## Internationalization

The component supports internationalization with the following translation keys:

- `property.details.share` - Button text
- `common.shareSuccess` - Success message
- `common.linkCopied` - Link copied message
- `common.shareError` - Error message
- `common.sharing` - Loading state text
- `common.shareDescription` - Modal description
- `common.copyLink` - Copy link label
- `common.copy` - Copy button text

## Accessibility

- Proper ARIA labels for screen readers
- Keyboard navigation support
- Focus management in modal
- Loading states with appropriate indicators
- Error handling with user-friendly messages

## Browser Support

- **Modern Browsers**: Full support with native share API (mobile) and clipboard API
- **Older Browsers**: Fallback to document.execCommand for clipboard operations
- **Mobile Browsers**: Native share API when available, clipboard fallback otherwise

## Examples

See `ShareButtonExample.tsx` for comprehensive usage examples including:
- Basic usage
- Custom property sharing
- Different sizes and variants
- Custom styling
- Callback functions
- Icon-only variants

## Integration with Agent Property Listings

To integrate with the existing agent property listings, replace the current share buttons:

```tsx
// Before (in AgentMyPropertyListingsDesktop.tsx)
<button className="flex items-center gap-2 border border-[#D1D5DB] px-5 py-2 rounded-lg text-[#00916A] bg-white hover:bg-[#F0FDF4] transition-all text-[15px] font-semibold w-[120px] justify-center">
  <img src={ShareIcon} alt="Share" className="w-5 h-5" />
  <span>Share</span>
</button>

// After
<ShareButton
  url={`https://vistaview.com/property/${property.property_id}`}
  title={`${property.name} - ${property.price}`}
  text={`Check out this ${property.property_type?.name} at ${property.address}`}
  size="medium"
  variant="outline"
  className="w-[120px]"
/>
```

## Troubleshooting

### Share not working on mobile
- Ensure the device supports the Web Share API
- Check if the browser has permission to access the clipboard
- Verify the URL is valid and accessible

### Modal not opening on desktop
- Check if the component is properly imported
- Verify that `useIsMobile` hook is working correctly
- Ensure no CSS conflicts are preventing the modal from displaying

### Translation keys missing
- Add missing keys to both `en.json` and `es.json` files
- Restart the development server after adding new translations
- Check the browser console for missing translation warnings 

# Floating Ask Bar Usage

- The global floating input renders from `src/components/FloatingAskBar.tsx` and is provided by `FloatingAskBarProvider` in `App.tsx`.
- To temporarily hide it inside any page/section, use the helper component:

```tsx
import { HideFloatingAskBar } from '../../contexts/FloatingAskBarContext';

export default function SomePage() {
	return (
		<HideFloatingAskBar>
			{/* your page content while the ask bar stays hidden */}
		</HideFloatingAskBar>
	);
}
```

- Or control programmatically:

```tsx
import { useFloatingAskBar } from '../../contexts/FloatingAskBarContext';

const { hide, show, toggle } = useFloatingAskBar();
``` 