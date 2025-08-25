'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  MapPin, 
  Navigation, 
  Clock, 
  Car, 
  Bike, 
  PersonStanding,
  Search,
  History,
  Trash2,
  SidebarClose
} from 'lucide-react';
import { useAppStore } from '@/lib/store/app-store';
import { SearchFormData, SearchHistory, Location } from '@/types';
import axios from 'axios';

interface SearchSidebarProps {
  onSearch: (formData: SearchFormData) => void;
  isMobile?: boolean;
}

export function SearchSidebar({ onSearch, isMobile = false }: SearchSidebarProps) {
  const {
    sidebarOpen,
    setSidebarOpen,
    searchForm,
    updateSearchForm,
    isLoading,
    searchHistory,
    loadFromHistory,
    clearHistory,
  } = useAppStore();

  const [showHistory, setShowHistory] = useState(false);
  const [fromOptions, setFromOptions] = useState<Location[]>([]);
  const [toOptions, setToOptions] = useState<Location[]>([]);
  const [fromLoading, setFromLoading] = useState(false);
  const [toLoading, setToLoading] = useState(false);
  const fromTimeout = useRef<NodeJS.Timeout | null>(null);
  const toTimeout = useRef<NodeJS.Timeout | null>(null);


  const [fromSelected, setFromSelected] = useState(false);
  const [toSelected, setToSelected] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow submit if both fields are filled and either:
    // 1. They were selected from autocomplete options, OR
    // 2. They are valid location strings
    if (searchForm.from && searchForm.to && (fromSelected || searchForm.from.length > 3) && (toSelected || searchForm.to.length > 3)) {
      onSearch(searchForm);
    }
  };

  // Autocomplete for From
  const handleFromChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateSearchForm({ from: value });
    setFromSelected(false); // Reset selection flag when typing
    setFromOptions([]);
    if (fromTimeout.current) clearTimeout(fromTimeout.current);
    if (!value) return;
    setFromLoading(true);
    fromTimeout.current = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/geocode?q=${encodeURIComponent(value)}`);
        setFromOptions(res.data);
      } catch {
        setFromOptions([]);
      } finally {
        setFromLoading(false);
      }
    }, 800);
  };

  // Autocomplete for To
  const handleToChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateSearchForm({ to: value });
    setToSelected(false); // Reset selection flag when typing
    setToOptions([]);
    if (toTimeout.current) clearTimeout(toTimeout.current);
    if (!value) return;
    setToLoading(true);
    toTimeout.current = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/geocode?q=${encodeURIComponent(value)}`);
        setToOptions(res.data);
      } catch {
        setToOptions([]);
      } finally {
        setToLoading(false);
      }
    }, 400);
  };

  const handleHistoryItemClick = (historyItem: SearchHistory) => {
    loadFromHistory(historyItem);
    setFromSelected(true); // Mark as selected since it's from history
    setToSelected(true); // Mark as selected since it's from history
    setShowHistory(false);
  };

  const vehicleIcons = {
    driving: Car,
    cycling: Bike,
    walking: PersonStanding,
  };

  // Mobile version - just the content without sidebar wrapper
  if (isMobile) {
    return (
      <div className="p-4 space-y-4">
        {/* Navigation */}
        <div className="flex gap-2">
          <Button
            variant={!showHistory ? "default" : "outline"}
            size="sm"
            onClick={() => setShowHistory(false)}
            className="flex-1"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button
            variant={showHistory ? "default" : "outline"}
            size="sm"
            onClick={() => setShowHistory(true)}
            className="flex-1"
          >
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
        </div>

        {!showHistory ? (
          /* Search Form */
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Route Search</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* From Location */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    From
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Enter starting location"
                      value={searchForm.from}
                      onChange={handleFromChange}
                      autoComplete="off"
                      required
                    />
                    {fromLoading && (
                      <div className="absolute right-2 top-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                    )}
                    {fromOptions.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow z-50 max-h-48 overflow-auto">
                        {fromOptions.map((opt) => (
                          <button
                            type="button"
                            key={opt.display_name}
                            className={`block w-full text-left px-3 py-2 hover:bg-blue-50 text-sm ${searchForm.from === opt.display_name ? 'bg-blue-100' : ''}`}
                            onClick={() => {
                              updateSearchForm({ from: opt.display_name });
                              setFromSelected(true);
                              setFromOptions([]);
                            }}
                          >
                            {opt.display_name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* To Location */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-600" />
                    To
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Enter destination"
                      value={searchForm.to}
                      onChange={handleToChange}
                      autoComplete="off"
                      required
                    />
                    {toLoading && (
                      <div className="absolute right-2 top-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                    )}
                    {toOptions.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow z-50 max-h-48 overflow-auto">
                        {toOptions.map((opt) => (
                          <button
                            type="button"
                            key={opt.display_name}
                            className={`block w-full text-left px-3 py-2 hover:bg-blue-50 text-sm ${searchForm.to === opt.display_name ? 'bg-blue-100' : ''}`}
                            onClick={() => {
                              updateSearchForm({ to: opt.display_name });
                              setToSelected(true);
                              setToOptions([]);
                            }}
                          >
                            {opt.display_name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Vehicle Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Car className="h-4 w-4 text-blue-600" />
                    Transportation
                  </label>
                  <Select
                    value={searchForm.vehicleType}
                    onValueChange={(value: any) => updateSearchForm({ vehicleType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="driving">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          Driving
                        </div>
                      </SelectItem>
                      <SelectItem value="cycling">
                        <div className="flex items-center gap-2">
                          <Bike className="h-4 w-4" />
                          Cycling
                        </div>
                      </SelectItem>
                      <SelectItem value="walking">
                        <div className="flex items-center gap-2">
                          <PersonStanding className="h-4 w-4" />
                          Walking
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Time Interval */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    Weather Check Interval
                  </label>
                  <Select
                    value={searchForm.interval}
                    onValueChange={(value) => updateSearchForm({ interval: value })}
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
                </div>

                {/* Search Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !searchForm.from || !searchForm.to}
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search Route & Weather
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          /* History */
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Search History</CardTitle>
              {searchHistory.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearHistory}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {searchHistory.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No search history yet
                </p>
              ) : (
                <div className="space-y-2">
                  {searchHistory.map((item) => {
                    const IconComponent = vehicleIcons[item.searchData.vehicleType];
                    return (
                      <Button
                        key={item.id}
                        variant="outline"
                        className="w-full p-3 h-auto justify-start"
                        onClick={() => handleHistoryItemClick(item)}
                      >
                        <div className="flex items-start gap-3 w-full min-w-0">
                          <IconComponent className="h-4 w-4 mt-1 flex-shrink-0" />
                          <div className="text-left text-sm flex-1 min-w-0">
                            <div className="font-medium text-wrap break-words mb-1">
                              <span className="">{item.searchData.from}</span>
                              <span className="text-gray-400 mx-1">→</span>
                              <span className="">{item.searchData.to}</span>
                            </div>
                            <div className="text-gray-500 text-xs mb-1">
                              {item.searchData.vehicleType} • {item.searchData.interval}min intervals
                            </div>
                            <div className="text-gray-400 text-xs">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Toggle Button */}
      {/* TODO: uncomment this */}
      {!sidebarOpen && (
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-50 bg-white shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
      )}

      {/* Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-96 bg-white shadow-xl z-40 border-r overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className='flex justify-between items-center'>
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Navigation className="h-6 w-6 text-blue-600" />
                    Weather Route
                  </h1>
                  <p className="text-sm text-gray-600">
                    Plan your journey with weather forecasts
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  // className="fixed top-4 left-4 z-50 bg-white shadow-lg"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex gap-2">
                <Button
                  variant={!showHistory ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowHistory(false)}
                  className="flex-1"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button
                  variant={showHistory ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowHistory(true)}
                  className="flex-1"
                >
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
              </div>

              {!showHistory ? (
                /* Search Form */
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Route Search</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* From Location */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-green-600" />
                          From
                        </label>
                        <div className="relative">
                          <Input
                            placeholder="Enter starting location"
                            value={searchForm.from}
                            onChange={handleFromChange}
                            autoComplete="off"
                            required
                          />
                          {fromLoading && (
                            <div className="absolute right-2 top-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                          )}
                          {fromOptions.length > 0 && (
                            <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow z-50 max-h-48 overflow-auto">
                              {fromOptions.map((opt) => (
                                <button
                                  type="button"
                                  key={opt.display_name}
                                  className={`block w-full text-left px-3 py-2 hover:bg-blue-50 text-sm ${searchForm.from === opt.display_name ? 'bg-blue-100' : ''}`}
                                  onClick={() => {
                                    updateSearchForm({ from: opt.display_name });
                                    setFromSelected(true);
                                    setFromOptions([]);
                                  }}
                                >
                                  {opt.display_name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* To Location */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-red-600" />
                          To
                        </label>
                        <div className="relative">
                          <Input
                            placeholder="Enter destination"
                            value={searchForm.to}
                            onChange={handleToChange}
                            autoComplete="off"
                            required
                          />
                          {toLoading && (
                            <div className="absolute right-2 top-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                          )}
                          {toOptions.length > 0 && (
                            <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow z-50 max-h-48 overflow-auto">
                              {toOptions.map((opt) => (
                                <button
                                  type="button"
                                  key={opt.display_name}
                                  className={`block w-full text-left px-3 py-2 hover:bg-blue-50 text-sm ${searchForm.to === opt.display_name ? 'bg-blue-100' : ''}`}
                                  onClick={() => {
                                    updateSearchForm({ to: opt.display_name });
                                    setToSelected(true);
                                    setToOptions([]);
                                  }}
                                >
                                  {opt.display_name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Vehicle Type */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Car className="h-4 w-4 text-blue-600" />
                          Transportation
                        </label>
                        <Select
                          value={searchForm.vehicleType}
                          onValueChange={(value: any) => updateSearchForm({ vehicleType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="driving">
                              <div className="flex items-center gap-2">
                                <Car className="h-4 w-4" />
                                Driving
                              </div>
                            </SelectItem>
                            <SelectItem value="cycling">
                              <div className="flex items-center gap-2">
                                <Bike className="h-4 w-4" />
                                Cycling
                              </div>
                            </SelectItem>
                            <SelectItem value="walking">
                              <div className="flex items-center gap-2">
                                <PersonStanding className="h-4 w-4" />
                                Walking
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Time Interval */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple-600" />
                          Weather Check Interval
                        </label>
                        <Select
                          value={searchForm.interval}
                          onValueChange={(value) => updateSearchForm({ interval: value })}
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
                      </div>

                      {/* Search Button */}
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || !searchForm.from || !searchForm.to}
                      >
                        {isLoading ? (
                          <>
                            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <Search className="h-4 w-4 mr-2" />
                            Search Route & Weather
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                /* History */
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Search History</CardTitle>
                    {searchHistory.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearHistory}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {searchHistory.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No search history yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {searchHistory.map((item) => {
                          const IconComponent = vehicleIcons[item.searchData.vehicleType];
                          return (
                            <Button
                              key={item.id}
                              variant="outline"
                              className="w-full p-3 h-auto justify-start"
                              onClick={() => handleHistoryItemClick(item)}
                            >
                              <div className="flex items-start gap-3 w-full min-w-0">
                                <IconComponent className="h-4 w-4 mt-1 flex-shrink-0" />
                                <div className="text-left text-sm flex-1 min-w-0">
                                  <div className="font-medium text-wrap break-words mb-1">
                                    <span className="font-semibold">{item.searchData.from}</span>
                                    <span className="text-gray-400 mx-1">→</span>
                                    <span className="font-semibold">{item.searchData.to}</span>
                                  </div>
                                  <div className="text-gray-500 text-xs mb-1">
                                    {item.searchData.vehicleType} • {item.searchData.interval} min intervals
                                  </div>
                                  <div className="text-gray-400 text-xs">
                                    {new Date(item.timestamp).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
