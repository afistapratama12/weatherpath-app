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
  const markersRef = useRef<google.maps.Marker[]>([]);
  const routeLineRef = useRef<google.maps.Polyline | null>(null);
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
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    if (routeLineRef.current) {
      routeLineRef.current.setMap(null);
    }

    if (route.features && route.features.length > 0) {
      const feature = route.features[0];
      const coordinates = feature.geometry.coordinates;

      // Convert coordinates to Google Maps LatLng format
      const path = coordinates.map(coord => ({
        lat: coord[1],
        lng: coord[0],
      }));

      // Create polyline for the route
      routeLineRef.current = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#3B82F6',
        strokeOpacity: 1.0,
        strokeWeight: 4,
      });

      routeLineRef.current.setMap(map);

      // Add weather markers along the route
      weatherPoints.forEach((point, index) => {
        if (!point.weather?.weather?.[0]) return;

        const weatherIcon = point.weather.weather[0].icon;
        const temp = Math.round(point.weather.main.temp);
        const description = point.weather.weather[0].description;
        
        // Create custom marker with weather icon
        const marker = new google.maps.Marker({
          position: { lat: point.lat, lng: point.lon },
          map: map,
          title: `${temp}°C - ${description}`,
          icon: {
            url: `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`,
            scaledSize: new google.maps.Size(50, 50),
            anchor: new google.maps.Point(25, 25),
          },
          zIndex: 1000 + index,
        });

        // Create detailed info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-3 min-w-[180px]">
              <div class="flex items-center gap-3 mb-2">
                <img 
                  src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" 
                  alt="${description}"
                  class="w-12 h-12"
                />
                <div>
                  <h3 class="font-bold text-lg text-blue-600">${temp}°C</h3>
                  <p class="text-sm text-gray-600 capitalize">${description}</p>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="flex items-center gap-1">
                  <span class="text-orange-500">🌡️</span>
                  <span>Feels like: ${Math.round(point.weather.main.feels_like)}°C</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-blue-500">💧</span>
                  <span>Humidity: ${point.weather.main.humidity}%</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-gray-500">💨</span>
                  <span>Wind: ${point.weather.wind.speed} m/s</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-purple-500">⏱️</span>
                  <span>+${Math.round(point.timeFromStart)}min</span>
                </div>
              </div>
              
              <div class="mt-2 pt-2 border-t border-gray-200">
                <p class="text-xs text-gray-500">
                  📍 ${point.lat.toFixed(4)}, ${point.lon.toFixed(4)}
                </p>
              </div>
            </div>
          `,
        });

        // Add click listener to show info window
        marker.addListener('click', () => {
          // Close all other info windows first
          markersRef.current.forEach((m, i) => {
            if (i !== index && (m as any).infoWindow) {
              (m as any).infoWindow.close();
            }
          });
          
          infoWindow.open(map, marker);
        });

        // Store info window reference for later use
        (marker as any).infoWindow = infoWindow;
        markersRef.current.push(marker);
      });

      // Add start and end markers
      // if (weatherPoints.length > 0) {
        // Start marker
        // const startMarker = new google.maps.Marker({
        //   position: { lat: weatherPoints[0].lat, lng: weatherPoints[0].lon },
        //   map: map,
        //   title: 'Start Point',
        //   icon: {
        //     url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        //       <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
        //         <circle cx="15" cy="15" r="12" fill="#10B981" stroke="#ffffff" stroke-width="3"/>
        //         <text x="15" y="20" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">S</text>
        //       </svg>
        //     `),
        //     scaledSize: new google.maps.Size(30, 30),
        //     anchor: new google.maps.Point(15, 15),
        //   },
        //   zIndex: 2000,
        // });

        // End marker
        // const endPoint = weatherPoints[weatherPoints.length - 1];
        // const endMarker = new google.maps.Marker({
        //   position: { lat: endPoint.lat, lng: endPoint.lon },
        //   map: map,
        //   title: 'End Point',
        //   icon: {
        //     url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        //       <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
        //         <circle cx="15" cy="15" r="12" fill="#EF4444" stroke="#ffffff" stroke-width="3"/>
        //         <text x="15" y="20" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">E</text>
        //       </svg>
        //     `),
        //     scaledSize: new google.maps.Size(30, 30),
        //     anchor: new google.maps.Point(15, 15),
        //   },
        //   zIndex: 2000,
        // });

        // markersRef.current.push(startMarker, endMarker);
      // }

      // Fit map to show entire route with padding
      if (path.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        path.forEach(point => bounds.extend(point));
        map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
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
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-90 z-20">
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
