/**
 * 天気サービス関連の型定義
 */

// 天気APIの設定型
export interface WeatherConfig {
  apiKey: string;
  cacheTtl: number;
  defaultUnits: 'metric' | 'imperial' | 'kelvin';
}

// 天気検索用のオプション型
export interface WeatherSearchOptions {
  city: string;
  country?: string;
  state?: string;
  clearCache?: boolean;
  units?: 'metric' | 'imperial' | 'kelvin';
}

// 天気予報データ型（将来の拡張用）
export interface WeatherForecast {
  date: string;
  temp: {
    min: number;
    max: number;
  };
  weather: {
    main: string;
    description: string;
  };
}

// 詳細天気情報型（拡張版）
export interface DetailedWeatherData {
  location: {
    name: string;
    country: string;
    coordinates: {
      lat: number;
      lon: number;
    };
  };
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    visibility: number;
    uv: number;
  };
  wind: {
    speed: number;
    direction: number;
    gust?: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  };
  sun: {
    sunrise: string;
    sunset: string;
  };
  updatedAt: string;
}

// キャッシュ統計情報型
export interface WeatherCacheStats {
  totalEntries: number;
  hitRate: number;
  missRate: number;
  averageResponseTime: number;
  mostRequestedCities: string[];
}