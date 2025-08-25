'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/lib/store/app-store';
import { calculateRoutePoints, getWeatherForRoutePoints } from '@/lib/api/weather-route';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

interface IntervalSelectorProps {
  onIntervalChange?: (interval: string) => void;
}

export function IntervalSelector({ onIntervalChange }: IntervalSelectorProps) {
  const {
    searchForm,
    currentRoute,
    setCurrentWeatherPoints,
    updateSearchForm,
    isLoading,
    setIsLoading,
  } = useAppStore();

  const updateIntervalMutation = useMutation({
    mutationFn: async (newInterval: string) => {
      if (!currentRoute) {
        throw new Error('No route available');
      }

      setIsLoading(true);
      
      try {
        // Recalculate route points with new interval
        const routePoints = calculateRoutePoints(
          currentRoute,
          parseInt(newInterval),
          searchForm.vehicleType
        );

        // Get weather for new route points
        const weatherPoints = await getWeatherForRoutePoints(routePoints);
        
        setCurrentWeatherPoints(weatherPoints);
        updateSearchForm({ interval: newInterval });
        
        return weatherPoints;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      toast.success('Weather data updated successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to update interval: ${error.message}`);
    },
  });

  const handleIntervalChange = (newInterval: string) => {
    if (currentRoute && searchForm.interval !== newInterval) {
      updateIntervalMutation.mutate(newInterval);
      onIntervalChange?.(newInterval);
    } else if (!currentRoute) {
      updateSearchForm({ interval: newInterval });
      onIntervalChange?.(newInterval);
    }
  };

  if (!currentRoute) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardHeader className="">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-purple-600" />
          Update Weather Interval
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select
          value={searchForm.interval}
          onValueChange={handleIntervalChange}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15">Every 15 minutes</SelectItem>
            <SelectItem value="30">Every 30 minutes</SelectItem>
            <SelectItem value="60">Every 1 hour</SelectItem>
            <SelectItem value="120">Every 2 hours</SelectItem>
          </SelectContent>
        </Select>
        
        {updateIntervalMutation.isPending && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Updating weather data...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
