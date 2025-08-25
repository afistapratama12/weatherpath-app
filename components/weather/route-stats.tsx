'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RouteResponse } from '@/types';
import { Route, Clock, MapPin, Navigation } from 'lucide-react';

interface RouteStatsProps {
  route: RouteResponse | null;
  vehicleType: string;
}

export function RouteStats({ route, vehicleType }: RouteStatsProps) {
  if (!route || !route.features || route.features.length === 0) {
    return null;
  }

  const feature = route.features[0];
  const summary = feature.properties.summary;
  
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours === 0) {
      return `${minutes} min`;
    }
    return `${hours}h ${minutes}min`;
  };

  const getVehicleIcon = () => {
    switch (vehicleType) {
      case 'driving':
        return '🚗';
      case 'cycling':
        return '🚴';
      case 'walking':
        return '🚶';
      default:
        return '🚗';
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Navigation className="h-4 w-4 text-blue-600" />
          Route Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-lg font-semibold text-blue-600">
              {getVehicleIcon()}
            </div>
            <div className="text-xs text-gray-500 capitalize">
              {vehicleType}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-lg font-semibold">
              {formatDistance(summary.distance)}
            </div>
            <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
              <Route className="h-3 w-3" />
              Distance
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-lg font-semibold">
              {formatDuration(summary.duration)}
            </div>
            <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              Duration
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
