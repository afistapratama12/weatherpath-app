'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { SearchSidebar } from '@/components/search-sidebar';
import { WeatherList } from '@/components/weather/weather-list';
import { LoadingWeatherList } from '@/components/weather/loading-weather-list';
import { useAppStore } from '@/lib/store/app-store';
import { SearchFormData } from '@/types';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface MobileBottomSheetProps {
  onSearch: (formData: SearchFormData) => void;
}

export function MobileBottomSheet({ onSearch }: MobileBottomSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showContent, setShowContent] = useState('search'); // 'search' or 'weather'
  const [windowHeight, setWindowHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const controls = useAnimation();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const {
    currentWeatherPoints,
    isLoading,
  } = useAppStore();

  // Set window height on mount
  useEffect(() => {
    setWindowHeight(window.innerHeight);
    
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Heights for different states
  const minHeight = 120; // Minimized state showing just header
  const maxHeight = windowHeight * 0.75; // 75% of screen height

  useEffect(() => {
    if (currentWeatherPoints.length > 0 && maxHeight > 0) {
      setShowContent('weather');
      setIsExpanded(true);
      controls.start({ y: 0 }); // Fully expanded
    }
  }, [currentWeatherPoints, controls, maxHeight]);

  // Don't render until we have window height
  if (windowHeight === 0) {
    return null;
  }

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Handle drag logic here if needed
  };

  const handleDragStart = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const shouldMinimize = info.velocity.y > 500 || info.offset.y > 50;
    
    if (shouldMinimize && isExpanded) {
      setIsExpanded(false);
      controls.start({ y: maxHeight - minHeight }); // Minimized position
    } else if (!shouldMinimize && !isExpanded) {
      setIsExpanded(true);
      controls.start({ y: 0 }); // Fully expanded
    } else {
      // Snap back to current state
      controls.start({ y: isExpanded ? 0 : maxHeight - minHeight });
    }
  };

  const toggleSheet = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    controls.start({ y: newExpanded ? 0 : maxHeight - minHeight });
  };

  // Wrapper function for search that minimizes the sheet
  const handleMobileSearch = async (formData: SearchFormData) => {
    // Minimize the bottom sheet when search starts
    setIsExpanded(false);
    controls.start({ y: maxHeight - minHeight });
    
    // Call the original search function
    onSearch(formData);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 pointer-events-none">
      <motion.div
        className="bg-white rounded-t-2xl shadow-2xl pointer-events-auto border-t border-gray-200 overflow-hidden"
        style={{ height: maxHeight }}
        initial={{ y: maxHeight - minHeight }}
        animate={controls}
        drag="y"
        dragConstraints={{ top: 0, bottom: maxHeight - minHeight }}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
      >
        {/* Header */}
        <div 
          className="p-4 border-b bg-white rounded-t-2xl cursor-pointer select-none flex-shrink-0"
          onClick={toggleSheet}
          style={{ height: minHeight }}
        >
          {/* Drag handle - moved to top */}
          <div className="flex justify-center mb-2">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold truncate">
                {showContent === 'search' ? 'Plan Your Route' : 'Weather Forecast'}
              </h2>
              <p className="text-sm text-gray-600 truncate">
                {showContent === 'search' 
                  ? 'Search for weather along your route'
                  : `${currentWeatherPoints.length} weather points along route`
                }
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Toggle buttons */}
              {currentWeatherPoints.length > 0 && (
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowContent('search');
                    }}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      showContent === 'search'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Search
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowContent('weather');
                    }}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      showContent === 'weather'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Weather
                  </button>
                </div>
              )}
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div 
          className="flex-1 overflow-hidden"
          onTouchStart={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {showContent === 'search' ? (
            <div className="h-full overflow-y-auto">
              <SearchSidebar 
                onSearch={handleMobileSearch}
                isMobile={true}
              />
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {isLoading ? (
                <LoadingWeatherList />
              ) : (
                <WeatherList
                  weatherPoints={currentWeatherPoints}
                  className="h-full"
                  disableInternalScroll={true}
                />
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
