# Environment Setup

This project uses environment variables to securely store API keys and other sensitive configuration.

## Required Environment Variables

### Google Maps API Key

The application uses Google Maps API for displaying static maps. You need to set up the following environment variable:

1. Create a `.env` file in the root directory of the project
2. Add the following line to the `.env` file:

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

3. Replace `your_google_maps_api_key_here` with your actual Google Maps API key

## Getting a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Maps JavaScript API and Static Maps API
4. Go to Credentials and create an API key
5. Restrict the API key to your domain for security

## Security Notes

- The `.env` file is already included in `.gitignore` to prevent it from being committed to version control
- Never commit API keys to version control
- Use environment-specific API keys for development, staging, and production
- Consider using API key restrictions in Google Cloud Console to limit usage to your domains

## Usage in Code

The Google Maps API key is accessed through the utility function in `src/utils/googleMaps.ts`:

```typescript
import { getStaticMapUrl } from '../utils/googleMaps';

// Generate a static map URL
const mapUrl = getStaticMapUrl('Punta+Cana', 11, '600x600', 'roadmap');
```

## Environment Variable Naming Convention

All environment variables used in this Vite React application are prefixed with `VITE_` to make them available in the client-side code. 