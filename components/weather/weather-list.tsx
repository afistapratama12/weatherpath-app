'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WeatherPoint } from '@/types';
import { formatTimeFromStart, formatTemperature, getWeatherIconUrl } from '@/lib/api/weather-route';
import { Clock, MapPin, Thermometer, Droplets, Wind, Eye } from 'lucide-react';
import { IntervalSelector } from './interval-selector';
import { RouteStats } from './route-stats';
import { useAppStore } from '@/lib/store/app-store';

interface WeatherListProps {
  weatherPoints: WeatherPoint[];
  className?: string;
  disableInternalScroll?: boolean;
}

export function WeatherList({ weatherPoints, className, disableInternalScroll = false }: WeatherListProps) {
  const { currentRoute, searchForm } = useAppStore();

  if (weatherPoints.length === 0) {
    return (
      <div className={className}>
        <Card className="h-full">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No weather data</h3>
              <p className="text-sm">Search for a route to see weather forecasts</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <ScrollArea 
        className="h-full"
      // className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      
      >
      <div className="space-y-4 h-full flex flex-col">
        <RouteStats route={currentRoute} vehicleType={searchForm.vehicleType} />
        <IntervalSelector />

        <Card className="flex-1 min-h-0">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-blue-600" />
              Weather Along Route
            </CardTitle>
            <p className="text-sm text-gray-600">
              Weather forecast for {weatherPoints.length} points along your route
            </p>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 px-4">
              <div className="space-y-4">
                {weatherPoints.map((point, index) => (
                  <Card
                    key={`${point.lat}-${point.lon}-${index}`}
                    className="border border-gray-200"
                  >
                    <CardContent className="px-4">
                      <div className="flex items-start justify-between gap-4">
                        {/* Time and Location Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">
                              {formatTimeFromStart(point.timeFromStart)}
                            </span>
                            {index === 0 && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Start
                              </span>
                            )}
                            {index === weatherPoints.length - 1 && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                End
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-gray-500 mb-3">
                            {point.lat.toFixed(4)}, {point.lon.toFixed(4)}
                          </div>

                          {point.weather && (
                            <div className="grid grid-cols-1 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Thermometer className="h-4 w-4 text-red-500" />
                                <span className="text-gray-600">Temp:</span>
                                <span className="font-medium">
                                  {formatTemperature(point.weather.main.temp)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Droplets className="h-4 w-4 text-blue-500" />
                                <span className="text-gray-600">Humidity:</span>
                                <span className="font-medium">{point.weather.main.humidity}%</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Wind className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-600">Wind:</span>
                                <span className="font-medium">{point.weather.wind.speed} m/s</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-purple-500" />
                                <span className="text-gray-600">Feels like:</span>
                                <span className="font-medium">
                                  {formatTemperature(point.weather.main.feels_like)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Weather Icon and Description */}
                        {point.weather && (
                          <div className="flex flex-col items-center text-center min-w-[100px]">
                            <img
                              src={getWeatherIconUrl(point.weather.weather[0].icon)}
                              alt={point.weather.weather[0].description}
                              className="w-12 h-12"
                            />
                            <div className="text-lg font-bold text-gray-900">
                              {formatTemperature(point.weather.main.temp)}
                            </div>
                            <div className="text-xs text-gray-600 capitalize leading-tight">
                              {point.weather.weather[0].description}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Additional weather details */}
                      {point.weather && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Min: {formatTemperature(point.weather.main.temp_min)}</span>
                            <span>Max: {formatTemperature(point.weather.main.temp_max)}</span>
                            <span>Pressure: {point.weather.main.pressure} hPa</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
          </CardContent>
        </Card>
      </div>
      </ScrollArea>
    </div>
  );
}
