'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store/app-store';
import { WeatherList } from './weather-list';
import { LoadingWeatherList } from './loading-weather-list';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WeatherPanelProps {
  className?: string;
}

export function WeatherPanel({ className }: WeatherPanelProps) {
  const {
    weatherPanelOpen,
    setWeatherPanelOpen,
    currentWeatherPoints,
    isLoading,
  } = useAppStore();

  const hasWeatherData = currentWeatherPoints.length > 0;

  return (
    <div className={`relative flex ${className}`}>
      {/* Toggle Button - Show when there's data or loading */}
      <AnimatePresence>
        {(hasWeatherData || isLoading) && !weatherPanelOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setWeatherPanelOpen(true)}
            className="absolute top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all p-2 z-20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Weather Panel */}
      <AnimatePresence mode="wait">
        {weatherPanelOpen && (hasWeatherData || isLoading) && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 420, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full bg-white border-l border-gray-200 shadow-lg overflow-hidden flex flex-col"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Weather Forecast
                </h3>
                <p className="text-sm text-gray-600">
                  {isLoading 
                    ? 'Loading weather data...' 
                    : `${currentWeatherPoints.length} points along route`
                  }
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWeatherPanelOpen(false)}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-hidden mx-4">
              {isLoading ? (
                <div className="p-4">
                  <LoadingWeatherList />
                </div>
              ) : (
                <WeatherList 
                  weatherPoints={currentWeatherPoints} 
                  className="h-full" 
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
