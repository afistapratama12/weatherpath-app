export interface Location {
  lat: number;
  lon: number;
  display_name: string;
}

export interface WeatherData {
  coord: {
    lat: number;
    lon: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  dt: number;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  name: string;
}

export interface WeatherForecast {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      humidity: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    wind: {
      speed: number;
      deg: number;
    };
    dt_txt: string;
  }>;
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
  };
}

export interface RouteResponse {
  type: string;
  features: Array<{
    type: string;
    properties: {
      summary: {
        distance: number;
        duration: number;
      };
    };
    geometry: {
      type: string;
      coordinates: number[][];
    };
  }>;
}

export interface RoutePoint {
  lat: number;
  lon: number;
  timeFromStart: number; // in minutes
  distanceFromStart: number; // in meters
}

export interface WeatherPoint extends RoutePoint {
  weather: WeatherForecast['list'][0];
}

export interface SearchFormData {
  from: string;
  to: string;
  interval: string;
  vehicleType: 'driving' | 'cycling' | 'walking';
}

export interface SearchHistory {
  id: string;
  timestamp: number;
  searchData: SearchFormData;
  route: RouteResponse;
  weatherPoints: WeatherPoint[];
}

export type VehicleType = 'driving' | 'cycling' | 'walking';
export type TimeInterval = '15' | '30' | '60' | '120'; // minutes
