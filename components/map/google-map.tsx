'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { RouteResponse, WeatherPoint } from '@/types';

interface GoogleMapProps {
  route: RouteResponse | null;
  weatherPoints: WeatherPoint[];
  className?: string;
  center?: { lat: number; lng: number } | null;
  isLoading?: boolean;
}

export function GoogleMap({ route, weatherPoints, className, center, isLoading = false }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
      libraries: ['geometry'],
    });

    loader.load().then(() => {
      setIsLoaded(true);
      if (mapRef.current && !mapInstanceRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: center || { lat: -6.2, lng: 106.816666 }, // Jakarta as default
          zoom: 10,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pan to center if changed
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !center) return;
    mapInstanceRef.current.panTo(center);
  }, [center, isLoaded]);

  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !route) return;

    const map = mapInstanceRef.current;

    // Clear existing overlays
    // Note: In a real implementation, you'd want to keep track of overlays to remove them

    if (route.features && route.features.length > 0) {
      const feature = route.features[0];
      const coordinates = feature.geometry.coordinates;

      // Convert coordinates to Google Maps LatLng format
      const path = coordinates.map(coord => ({
        lat: coord[1],
        lng: coord[0],
      }));

      // Create polyline for the route
      const routeLine = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#3B82F6',
        strokeOpacity: 1.0,
        strokeWeight: 4,
      });

      routeLine.setMap(map);

      // Add markers for weather points
      weatherPoints.forEach((point, index) => {
        const marker = new google.maps.Marker({
          position: { lat: point.lat, lng: point.lon },
          map: map,
          title: `Weather Point ${index + 1}`,
          icon: {
            url: `https://openweathermap.org/img/wn/${point.weather?.weather[0]?.icon}@2x.png`,
            scaledSize: new google.maps.Size(40, 40),
          },
        });

        // Add info window with weather data
        if (point.weather) {
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h3 class="font-semibold">${Math.round(point.weather.main.temp)}°C</h3>
                <p class="text-sm">${point.weather.weather[0].description}</p>
                <p class="text-xs text-gray-500">
                  Time from start: ${Math.round(point.timeFromStart)}min
                </p>
              </div>
            `,
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });
        }
      });

      // Fit map to show entire route
      if (path.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        path.forEach(point => bounds.extend(point));
        map.fitBounds(bounds);
      }
    }
  }, [isLoaded, route, weatherPoints]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full" />
      {!isLoaded && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-2" />
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      {isLoading && isLoaded && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-20 z-20">
          <div className="bg-white rounded-lg p-4 shadow-lg text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-2" />
            <p className="text-gray-700 font-medium">Searching route & weather...</p>
            <p className="text-gray-500 text-sm mt-1">This may take a moment</p>
          </div>
        </div>
      )}
    </div>
  );
}
