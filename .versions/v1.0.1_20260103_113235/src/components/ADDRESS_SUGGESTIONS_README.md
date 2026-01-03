# Address Suggestions Feature

## Overview
This feature provides Google-like address suggestions for the real estate search page when AI mode is disabled. It uses the Geocode.earth API to provide location-based suggestions with an integrated, seamless design.

## Implementation

### 1. Environment Setup
Add the following environment variable to your `.env` file:
```
VITE_GEOCODE_API_KEY=ge-867a11e5467a973b
```

### 2. Components

#### Integrated Suggestions in RealEstateHero (`src/v3/components/RealEstateHero.tsx`)
- **Integrated Design**: Suggestions appear as part of the main search container, not as a separate dropdown
- **Seamless UX**: The search box expands to show suggestions within the same rounded container
- **Visual Consistency**: Maintains the same background, shadows, and styling as the main search area

#### API Integration (`src/utils/api.ts`)
- `searchAddressSuggestions()` function
- TypeScript interfaces for API responses
- Error handling and validation

### 3. Key Features

#### Visual Design
- **Unified Container**: Suggestions appear within the same rounded container as the search input
- **Subtle Separator**: Light border between input and suggestions
- **Gold Location Icons**: Matches the brand color scheme (#905E26)
- **Consistent Spacing**: Proper padding and margins throughout

#### Functionality
- **Debounced Search**: 300ms delay to avoid excessive API calls
- **Keyboard Navigation**: Arrow keys, Enter, and Escape support
- **Click Outside**: Closes suggestions when clicking outside
- **Loading States**: Shows spinner while fetching suggestions
- **Error Handling**: Graceful fallbacks for API failures

## Usage

### When AI Mode is OFF:
1. User types in the search input (2+ characters required)
2. Suggestions appear integrated within the search container
3. User can navigate with keyboard or click
4. Selected location updates the input and passes data to map search

### When AI Mode is ON:
1. Regular input field is shown
2. Clicking opens chatbot
3. No address suggestions

## Visual Design Details

### Container Structure
```
┌─────────────────────────────────────┐
│  🔍 Search location                 │
├─────────────────────────────────────┤
│  📍 Location 1                      │
│  📍 Location 2                      │
│  📍 Location 3                      │
│  📍 Location 4                      │
│  📍 Location 5                      │
└─────────────────────────────────────┘
```

### Styling
- **Background**: Semi-transparent white (white/92, white/95)
- **Border**: Subtle gray separator between input and suggestions
- **Icons**: Gold location pins (#905E26)
- **Hover Effects**: Light gray background on suggestion hover
- **Loading**: Gold spinner with "Searching..." text

## API Response Format
The Geocode.earth API returns suggestions with:
- `name`: Primary location name
- `label`: Full address string
- `layer`: Type of location (locality, street, etc.)
- `coordinates`: [longitude, latitude]
- `country`, `region`, `county`: Administrative divisions

## Features
- ✅ **Integrated Design**: Suggestions within main container
- ✅ **Debounced Search**: 300ms delay
- ✅ **Keyboard Navigation**: Arrow keys, Enter, Escape
- ✅ **Loading States**: Visual feedback during search
- ✅ **Error Handling**: Graceful API failure handling
- ✅ **Responsive Design**: Works on mobile and desktop
- ✅ **Country-specific Search**: Supports US, IN, etc.
- ✅ **TypeScript Support**: Full type safety
- ✅ **Accessibility**: Proper keyboard and screen reader support
- ✅ **Click Outside**: Closes suggestions appropriately
