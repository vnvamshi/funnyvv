# VistaView Integration Guide

## How to Add Product Catalog to Main Page

Add this to your main App.tsx or landing page:

```tsx
import { useState } from 'react';
import { ProductCatalog, VendorCatalogButton } from './components/catalog';
import NotificationBanner from './components/common/NotificationBanner';

function App() {
  const [showCatalog, setShowCatalog] = useState(false);
  const [notification, setNotification] = useState(null);

  return (
    <div>
      {/* ... your existing content ... */}
      
      {/* Add this button where you want the catalog access */}
      <VendorCatalogButton onClick={() => setShowCatalog(true)} />
      
      {/* Product Catalog Modal */}
      <ProductCatalog 
        isOpen={showCatalog} 
        onClose={() => setShowCatalog(false)} 
      />
      
      {/* Notifications */}
      <NotificationBanner
        notification={notification}
        onDismiss={() => setNotification(null)}
        onAction={(action) => {
          if (action === 'view-catalog') setShowCatalog(true);
        }}
      />
    </div>
  );
}
```

## Voice Commands in Product Catalog

- "Show furniture" - Filter by category
- "Show vendor [name]" - Open specific vendor
- "Search [query]" - Search products
- "Back" - Navigate back
- "Close" - Close catalog
- "Insights" - Get AI recommendations

## AI Learning Sources

The catalog learns from these industry leaders:
- **Nebraska Furniture Mart** - Premium quality, room visualization
- **IKEA** - Minimalist design, clean imagery
- **Wayfair** - Comprehensive selection, customer photos
- **LinkedIn** - Professional profiles, beautification
- **WhatsApp** - Conversational UX, quick replies

## Backend Endpoints

- `GET /api/vendors` - List all vendors
- `GET /api/products` - List all products
- `GET /api/vendors/:id/products` - Vendor's products
- `GET /api/ai/patterns` - Industry patterns
- `POST /api/ai/learn` - Log AI learning
- `POST /api/ai/vectorize` - Vectorize vendor data
- `POST /api/notifications` - Create notification
- `GET /api/notifications` - Get notifications
