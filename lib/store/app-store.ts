import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { SearchFormData, SearchHistory, RouteResponse, WeatherPoint } from '@/types';

interface AppState {
  // UI State
  sidebarOpen: boolean;
  weatherPanelOpen: boolean;
  isLoading: boolean;
  
  // Form Data
  searchForm: SearchFormData;
  
  // Current Route & Weather Data
  currentRoute: RouteResponse | null;
  currentWeatherPoints: WeatherPoint[];
  
  // History
  searchHistory: SearchHistory[];
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setWeatherPanelOpen: (open: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  updateSearchForm: (data: Partial<SearchFormData>) => void;
  setCurrentRoute: (route: RouteResponse | null) => void;
  setCurrentWeatherPoints: (points: WeatherPoint[]) => void;
  addToHistory: (historyItem: SearchHistory) => void;
  loadFromHistory: (historyItem: SearchHistory) => void;
  clearHistory: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      sidebarOpen: true,
      weatherPanelOpen: false,
      isLoading: false,
      searchForm: {
        from: '',
        to: '',
        interval: '30',
        vehicleType: 'driving',
      },
      currentRoute: null,
      currentWeatherPoints: [],
      searchHistory: [],

      // Actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      setWeatherPanelOpen: (open) => set({ weatherPanelOpen: open }),
      
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      updateSearchForm: (data) =>
        set((state) => ({
          searchForm: { ...state.searchForm, ...data },
        })),
      
      setCurrentRoute: (route) => set({ currentRoute: route }),
      
      setCurrentWeatherPoints: (points) => set({ 
        currentWeatherPoints: points,
        weatherPanelOpen: points.length > 0 // Auto-open when weather data is available
      }),
      
      addToHistory: (historyItem) =>
        set((state) => ({
          searchHistory: [historyItem, ...state.searchHistory.slice(0, 9)], // Keep last 10 items
        })),
      
      loadFromHistory: (historyItem) =>
        set({
          searchForm: historyItem.searchData,
          currentRoute: historyItem.route,
          currentWeatherPoints: historyItem.weatherPoints,
          weatherPanelOpen: historyItem.weatherPoints.length > 0, // Auto-open when loading from history
        }),
      
      clearHistory: () => set({ searchHistory: [] }),
    }),
    {
      name: 'weather-route-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        searchHistory: state.searchHistory,
        searchForm: state.searchForm 
      }),
    }
  )
);
