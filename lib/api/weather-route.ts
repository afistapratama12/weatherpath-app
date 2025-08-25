import axios from 'axios';
import { Location, RouteResponse, WeatherForecast, RoutePoint, WeatherPoint } from '@/types';

// Geocoding - get coordinates from address
export async function geocodeAddress(address: string): Promise<Location[]> {
  const response = await axios.get(`/api/geocode?q=${encodeURIComponent(address)}`);
  return response.data;
}

// Get route between two points
export async function getRoute(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  vehicleType: string = 'driving'
): Promise<RouteResponse> {
  const response = await axios.post('/api/route', {
    fromLat,
    fromLon,
    toLat,
    toLon,
    vehicleType,
  });
  return response.data;
}

// Get weather forecast for a location
export async function getWeatherForecast(lat: number, lon: number): Promise<WeatherForecast> {
  const response = await axios.get(`/api/weather?lat=${lat}&lon=${lon}`);
  return response.data;
}

// Calculate route points based on time intervals
export function calculateRoutePoints(
  route: RouteResponse,
  intervalMinutes: number,
  vehicleType: string = 'driving'
): RoutePoint[] {
  if (!route.features || route.features.length === 0) {
    return [];
  }

  const feature = route.features[0];
  const coordinates = feature.geometry.coordinates;
  const totalDuration = feature.properties.summary.duration; // in seconds
  const totalDistance = feature.properties.summary.distance; // in meters

  // Speed estimates (km/h)
  const speedMap: Record<string, number> = {
    driving: 50,
    cycling: 15,
    walking: 5,
  };

  const estimatedSpeed = speedMap[vehicleType] || 50;
  const intervalSeconds = intervalMinutes * 60;
  const points: RoutePoint[] = [];

  // Always include the start point
  if (coordinates.length > 0) {
    points.push({
      lat: coordinates[0][1],
      lon: coordinates[0][0],
      timeFromStart: 0,
      distanceFromStart: 0,
    });
  }

  // Calculate intermediate points
  let currentTime = intervalSeconds;
  while (currentTime < totalDuration) {
    const progress = currentTime / totalDuration;
    const coordinateIndex = Math.floor(progress * (coordinates.length - 1));
    const coordinate = coordinates[Math.min(coordinateIndex, coordinates.length - 1)];

    points.push({
      lat: coordinate[1],
      lon: coordinate[0],
      timeFromStart: currentTime / 60, // convert to minutes
      distanceFromStart: progress * totalDistance,
    });

    currentTime += intervalSeconds;
  }

  // Always include the end point
  if (coordinates.length > 1) {
    const endCoordinate = coordinates[coordinates.length - 1];
    points.push({
      lat: endCoordinate[1],
      lon: endCoordinate[0],
      timeFromStart: totalDuration / 60, // convert to minutes
      distanceFromStart: totalDistance,
    });
  }

  return points;
}

// Get weather data for route points
export async function getWeatherForRoutePoints(
  routePoints: RoutePoint[]
): Promise<WeatherPoint[]> {
  const weatherPromises = routePoints.map(async (point) => {
    try {
      const forecast = await getWeatherForecast(point.lat, point.lon);
      // Get the closest weather data point (usually the first one for current/near future)
      const weather = forecast.list[0];
      
      return {
        ...point,
        weather,
      };
    } catch (error) {
      console.error(`Failed to get weather for point ${point.lat}, ${point.lon}:`, error);
      // Return point without weather data
      return {
        ...point,
        weather: null as any,
      };
    }
  });

  const results = await Promise.allSettled(weatherPromises);
  return results
    .filter((result): result is PromiseFulfilledResult<WeatherPoint> => 
      result.status === 'fulfilled'
    )
    .map(result => result.value)
    .filter(point => point.weather !== null);
}

// Format weather icon URL
export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

// Format temperature
export function formatTemperature(temp: number): string {
  return `${Math.round(temp)}°C`;
}

// Format time from minutes
export function formatTimeFromStart(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  return `${hours}h ${mins}m`;
}
