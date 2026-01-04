# Mobile Property Wizard with localStorage Persistence

This directory contains the mobile property listing flow with automatic localStorage persistence to ensure data consistency across components and sessions.

## Features

- **Automatic Data Persistence**: All form data is automatically saved to localStorage
- **Data Restoration**: Data is restored from localStorage when components mount
- **Cross-Session Persistence**: Data persists across browser sessions and page refreshes
- **Error Handling**: Graceful handling of localStorage errors
- **Utility Functions**: Helper functions for data management

## How It Works

### 1. Context Provider Setup

The `MobilePropertyWizardContext.tsx` provides:
- Centralized state management
- Automatic localStorage persistence
- Data restoration on initialization
- Utility functions for data access

### 2. Data Flow

```
User Input → Context State → localStorage → Component Re-render
     ↑                                           ↓
     └─── Data Restoration from localStorage ←──┘
```

### 3. localStorage Keys

The following data is persisted:
- `mobile_property_wizard_sale_category_data` - Sale category information
- `mobile_property_wizard_property_details_data` - Property details
- `mobile_property_wizard_location_data` - Location information
- `mobile_property_wizard_property_info_data` - Property information
- `mobile_property_wizard_user_data` - User data

## Usage

### Basic Usage

```tsx
import { useMobilePropertyWizard } from './MobilePropertyWizardContext';

const MyComponent = () => {
  const { locationData, setLocationData } = useMobilePropertyWizard();
  
  // Data is automatically persisted when updated
  const updateLocation = (newData) => {
    setLocationData(newData); // This automatically saves to localStorage
  };
  
  return (
    <div>
      <p>Address: {locationData.address}</p>
      <button onClick={() => updateLocation(newData)}>
        Update Location
      </button>
    </div>
  );
};
```

### Direct localStorage Access

```tsx
import { useMobilePropertyWizardStorage } from './MobilePropertyWizardContext';

const MyComponent = () => {
  const { getLocationData, clearLocationData } = useMobilePropertyWizardStorage();
  
  const handleClearData = () => {
    clearLocationData(); // Clears only location data
  };
  
  const checkStoredData = () => {
    const storedData = getLocationData();
    console.log('Stored location data:', storedData);
  };
  
  return (
    <div>
      <button onClick={handleClearData}>Clear Location Data</button>
      <button onClick={checkStoredData}>Check Stored Data</button>
    </div>
  );
};
```

### Provider Setup

```tsx
import { MobilePropertyWizardProvider } from './MobilePropertyWizardContext';

const App = () => {
  return (
    <MobilePropertyWizardProvider>
      {/* Your components here */}
    </MobilePropertyWizardProvider>
  );
};
```

## Available Data

### Location Data Structure

```typescript
interface LocationData {
  address: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  city_detail: any;
  state_detail: any;
  country_detail: any;
  propertyType: string;
  propertyType_detail: any;
  unitNumber: string;
}
```

### Sale Category Data Structure

```typescript
interface SaleCategoryData {
  saleCategory: string;
  propertyType: any;
  streetAddress: string;
  unitNumber: string;
  city: any;
  state: any;
  postalCode: string;
  country: any;
}
```

## Utility Functions

### Context Functions

- `setLocationData(data)` - Update location data (auto-persists)
- `setSaleCategoryData(data)` - Update sale category data (auto-persists)
- `setPropertyDetailsData(data)` - Update property details (auto-persists)
- `setPropertyInfoData(data)` - Update property info (auto-persists)
- `clearAllData()` - Clear all stored data
- `clearLocationData()` - Clear only location data
- `clearPropertyData()` - Clear property-related data

### Storage Functions

- `getLocationData()` - Get location data from localStorage
- `getSaleCategoryData()` - Get sale category data from localStorage
- `getPropertyDetailsData()` - Get property details from localStorage
- `getPropertyInfoData()` - Get property info from localStorage
- `getUserData()` - Get user data from localStorage

## Error Handling

The localStorage utilities include error handling for:
- JSON parsing errors
- Storage quota exceeded
- Private browsing mode
- Disabled localStorage

Errors are logged to console but don't break the application.

## Debug Mode

In development mode, the `PropertyLocationPage.tsx` shows a debug panel with current localStorage data. This helps verify that data is being persisted correctly.

## Best Practices

1. **Always use the context setters** instead of directly manipulating localStorage
2. **Check for data existence** before using stored data
3. **Handle loading states** while data is being restored
4. **Clear data appropriately** when the flow is completed or cancelled
5. **Use the utility functions** for direct localStorage access when needed

## Troubleshooting

### Data Not Persisting
- Check browser console for localStorage errors
- Verify localStorage is enabled in browser
- Check if in private browsing mode

### Data Not Restoring
- Verify the context provider is wrapping your components
- Check that the correct localStorage keys are being used
- Ensure data structure matches expected format

### Performance Issues
- localStorage operations are synchronous and can block the main thread
- Consider debouncing frequent updates
- Use the context setters which include optimization 