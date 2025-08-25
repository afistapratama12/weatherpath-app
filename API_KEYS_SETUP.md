# API Keys Setup Guide

This application requires API keys from three external services. You'll need to obtain these keys and add them to your `.env.local` file.

## Required API Keys

### 1. OpenRouteService API Key
- **Purpose**: Routing and directions
- **Website**: https://openrouteservice.org/
- **Free Tier**: Yes (up to 2,000 requests/day)
- **Setup**:
  1. Create an account at https://openrouteservice.org/
  2. Go to Dashboard → API Keys
  3. Create a new API key
  4. Add to `.env.local` as `OPENROUTESERVICE_API_KEY=your_key_here`

### 2. OpenWeatherMap API Key  
- **Purpose**: Weather forecasts
- **Website**: https://openweathermap.org/api
- **Free Tier**: Yes (up to 1,000 calls/day)
- **Setup**:
  1. Create an account at https://openweathermap.org/api
  2. Go to API keys section
  3. Generate a new API key
  4. Add to `.env.local` as `OPENWEATHER_API_KEY=your_key_here`

### 3. Google Maps JavaScript API Key
- **Purpose**: Map display and visualization
- **Website**: https://console.cloud.google.com/
- **Free Tier**: Yes ($200 credit monthly)
- **Setup**:
  1. Go to Google Cloud Console
  2. Create a new project or select existing one
  3. Enable the Maps JavaScript API
  4. Create credentials (API Key)
  5. (Optional) Restrict the API key to your domain
  6. Add to `.env.local` as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here`

## Security Notes

- Never commit API keys to version control
- Use environment variables for sensitive data
- Consider restricting API keys to specific domains/IPs in production
- Monitor API usage to avoid unexpected charges

## Rate Limits

- **OpenRouteService**: 2,000 requests/day (free tier)
- **OpenWeatherMap**: 1,000 calls/day (free tier)  
- **Google Maps**: $200 monthly credit (usually covers small projects)

## Testing Without Real API Keys

For development testing, you can use the demo endpoints:
- The app will show error messages if API keys are invalid
- You can test the UI components without real data
- Replace demo keys with real ones when ready

## Environment File Example

```env
# Copy this to .env.local and replace with your real API keys
OPENROUTESERVICE_API_KEY=your_openrouteservice_api_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here  
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
NODE_ENV=development
```
