# Weather Route App

A modern web application that helps you plan your journey with weather forecasts along your route. Built with Next.js, TypeScript, TailwindCSS, and shadcn-ui.

## Features

- 🗺️ **Route Planning**: Plan routes for driving, cycling, or walking
- 🌤️ **Weather Forecasts**: Get weather data at intervals along your route
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 💾 **Search History**: Save and reload previous searches
- 🎨 **Modern UI**: Clean, minimalist design with smooth animations

## Getting Started

### Prerequisites

- Node.js 18+ 
- Bun package manager
- API keys for the following services:
  - [OpenRouteService](https://openrouteservice.org/) (for routing)
  - [OpenWeatherMap](https://openweathermap.org/api) (for weather data)
  - [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript) (for map display)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd weather-route-app
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your API keys to `.env.local`:
```env
OPENROUTESERVICE_API_KEY=your_openrouteservice_api_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

5. Run the development server:
```bash
bun dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. **Enter Route Details**: Use the sidebar to enter your starting location and destination
2. **Choose Transportation**: Select between driving, cycling, or walking
3. **Set Weather Interval**: Choose how often you want weather updates (15min, 30min, 1hr, 2hr)
4. **Search**: Click "Search Route & Weather" to get results
5. **View Results**: See your route on the map and weather data in the sidebar
6. **Access History**: Switch to the History tab to reload previous searches

## API Endpoints

The app includes the following API routes that proxy external services:

- `GET /api/geocode?q={address}` - Convert addresses to coordinates
- `POST /api/route` - Get route between two points
- `GET /api/weather?lat={lat}&lon={lon}` - Get weather forecast for coordinates

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Components**: shadcn-ui
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Animations**: Framer Motion
- **Maps**: Google Maps JavaScript API
- **Package Manager**: Bun

## Project Structure

```
├── app/
│   ├── api/                 # API routes (proxy endpoints)
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/
│   ├── map/                 # Map-related components
│   ├── weather/             # Weather-related components
│   ├── ui/                  # shadcn-ui components
│   ├── search-sidebar.tsx   # Main search form
│   └── query-provider.tsx   # React Query provider
├── lib/
│   ├── api/                 # API utility functions
│   ├── store/               # Zustand store
│   └── utils.ts             # Utility functions
├── types/
│   └── index.ts             # TypeScript type definitions
└── public/                  # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## API Keys Setup Guide

### OpenRouteService API Key
1. Go to [OpenRouteService](https://openrouteservice.org/)
2. Sign up for a free account
3. Go to Dashboard → API Keys
4. Create a new API key
5. Add it to your `.env.local` file

### OpenWeatherMap API Key
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Go to API Keys section in your account
4. Generate a new API key
5. Add it to your `.env.local` file

### Google Maps JavaScript API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Maps JavaScript API
4. Create credentials (API Key)
5. Restrict the API key to your domain (optional but recommended)
6. Add it to your `.env.local` file

## Troubleshooting

### Common Issues

1. **Map not loading**: Check your Google Maps API key and ensure it's enabled
2. **Route not found**: Verify your OpenRouteService API key and rate limits
3. **Weather data missing**: Check your OpenWeatherMap API key and quota
4. **CORS errors**: API routes handle CORS, but ensure your keys are correct

### Development Tips

- Use the browser's developer tools to check for API errors
- Check the Network tab for failed requests
- Ensure all environment variables are properly set
- Restart the development server after changing environment variables
