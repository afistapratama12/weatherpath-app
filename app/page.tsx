'use client';

import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { SearchSidebar } from '@/components/search-sidebar';
import { MobileBottomSheet } from '@/components/mobile-bottom-sheet';
import { GoogleMap } from '@/components/map/google-map';
import { WeatherPanel } from '@/components/weather/weather-panel';
import { useAppStore } from '@/lib/store/app-store';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  geocodeAddress,
  getRoute,
  calculateRoutePoints,
  getWeatherForRoutePoints,
} from '@/lib/api/weather-route';
import { SearchFormData, SearchHistory } from '@/types';
import { toast } from 'sonner';

export default function HomePage() {
  const {
    sidebarOpen,
    weatherPanelOpen,
    currentRoute,
    currentWeatherPoints,
    setCurrentRoute,
    setCurrentWeatherPoints,
    setIsLoading,
    addToHistory,
    isLoading,
  } = useAppStore();

  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const isMobile = useIsMobile();

  const searchMutation = useMutation({
    mutationFn: async (formData: SearchFormData) => {
      setIsLoading(true);

      try {
        // Step 1: Geocode addresses
        const [fromLocations, toLocations] = await Promise.all([
          geocodeAddress(formData.from),
          geocodeAddress(formData.to),
        ]);

        if (fromLocations.length === 0) {
          throw new Error('Starting location not found');
        }
        if (toLocations.length === 0) {
          throw new Error('Destination not found');
        }

        const fromLocation = fromLocations[0];
        const toLocation = toLocations[0];
        setMapCenter({ lat: fromLocation.lat, lng: fromLocation.lon });

        // Step 2: Get route
        const route = await getRoute(
          fromLocation.lat,
          fromLocation.lon,
          toLocation.lat,
          toLocation.lon,
          formData.vehicleType
        );

        // Step 3: Calculate route points based on interval
        const routePoints = calculateRoutePoints(
          route,
          parseInt(formData.interval),
          formData.vehicleType
        );

        // Step 4: Get weather for each route point
        const weatherPoints = await getWeatherForRoutePoints(routePoints);

        // Step 5: Update state
        setCurrentRoute(route);
        setCurrentWeatherPoints(weatherPoints);

        // Step 6: Save to history
        const historyItem: SearchHistory = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          searchData: formData,
          route,
          weatherPoints,
        };
        addToHistory(historyItem);

        return { route, weatherPoints };
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      toast.success('Route and weather data loaded successfully!');
    },
    onError: (error: any) => {
      console.error('Search failed:', error);
      toast.error(`Search failed: ${error.message}`);
    },
  });

  const handleSearch = (formData: SearchFormData) => {
    searchMutation.mutate(formData);
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-gray-50 relative">
        {/* Full screen map */}
        <div className="flex-1">
          <GoogleMap
            route={currentRoute}
            weatherPoints={currentWeatherPoints}
            center={mapCenter}
            className="h-full"
            isLoading={isLoading}
          />
        </div>

        {/* Bottom Sheet */}
        <MobileBottomSheet onSearch={handleSearch} />
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="h-screen flex bg-gray-50">
      {/* Search Sidebar */}
      <SearchSidebar onSearch={handleSearch} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-96' : 'ml-0'}`}>
        <div className="h-full flex relative">
          {/* Map Section */}
          <div className="flex-1">
            <GoogleMap
              route={currentRoute}
              weatherPoints={currentWeatherPoints}
              center={mapCenter}
              className="h-full"
              isLoading={isLoading}
            />
          </div>

          {/* Weather Panel */}
          <WeatherPanel className="h-full" />
        </div>
      </div>
    </div>
  );
}
