/**
 * サービス層の共通型定義
 */

// 共通レスポンス型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Cloudflareの環境変数型定義
export interface CloudflareEnv {
  DB: D1Database;
  R2: R2Bucket; // ファイル共有用バケット
  AUTO_RAG_R2: R2Bucket; // AutoRAG用バケット
  WEATHER_KV: KVNamespace;
  AI: any; // Cloudflare AI binding for AutoRAG
  WEATHER_API_KEY: string;
}

// ファイル関連の型定義
export interface FileRecord {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  expiresAt: string;
  createdAt: number;
  updatedAt: number;
}

export interface UploadFileData {
  file: File;
  expirationDays: number;
}

export interface UploadResult {
  files: FileRecord[];
  success: boolean;
  message: string;
  url: string;
}

// 天気関連の型定義
export interface WeatherData {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface WeatherCacheData {
  weather: WeatherData;
  timestamp: string;
}

export interface WeatherResponse extends ApiResponse<WeatherData> {
  cached: boolean;
  cachedAt?: string;
}

// AutoRAG関連の型定義
export interface AutoRAGUploadData {
  message: string;
  title: string;
  chunks: number;
  files: string[];
  uploadedAt: string;
}

export interface AutoRAGSearchData {
  query: string;
  answer: string;
}

export interface AutoRAGUploadResponse extends ApiResponse<AutoRAGUploadData> {}
export interface AutoRAGSearchResponse extends ApiResponse<AutoRAGSearchData> {}

// サービス層の基底インターフェース
export interface BaseService {
  env: CloudflareEnv;
}