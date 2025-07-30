'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Cloud, RefreshCw, Trash2, Thermometer, Eye, Wind, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

// OpenWeatherMap APIからのレスポンスデータ型定義
interface WeatherData {
  name: string; // 都市名
  main: {
    temp: number; // 現在の気温（摂氏）
    feels_like: number; // 体感温度（摂氏）
    humidity: number; // 湿度（%）
  };
  weather: Array<{
    main: string; // 天気の概要（例: "Clear", "Rain"）
    description: string; // 天気の詳細説明
  }>;
  wind: {
    speed: number; // 風速（m/s）
  };
}

// Weather APIエンドポイントからのレスポンス型定義
interface WeatherResponse {
  success: boolean; // API呼び出しの成功/失敗
  data: WeatherData; // 天気データ
  cached: boolean; // キャッシュから取得したかどうか
  cachedAt?: string; // キャッシュされた日時（ISO文字列）
  message?: string; // エラーメッセージ（失敗時）
}

/**
 * Cloudflare KVキャッシュ機能をデモするWeatherコンポーネント
 * - 天気データの取得とキャッシュ表示
 * - キャッシュクリア機能
 * - キャッシュ状態の可視化
 */
export function WeatherDemo() {
  const t = useTranslations();
  
  // 状態管理
  const [city, setCity] = useState('Tokyo'); // 検索対象の都市名
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null); // 取得した天気データ
  const [loading, setLoading] = useState(false); // ローディング状態
  const [error, setError] = useState<string | null>(null); // エラーメッセージ

  /**
   * 天気データを取得する関数
   * @param clearCache - trueの場合、キャッシュをクリアして新しいデータを取得
   */
  const fetchWeather = async (clearCache = false) => {
    if (!city.trim()) return; // 都市名が空の場合は何もしない
    
    setLoading(true);
    setError(null);
    
    try {
      // キャッシュクリア時は特別なクエリパラメータを付与
      const url = clearCache 
        ? `/api/weather/${encodeURIComponent(city)}?clear=true`
        : `/api/weather/${encodeURIComponent(city)}`;
        
      const response = await fetch(url);
      const data: WeatherResponse = await response.json();
      
      console.log('weatherData', data);
      if (data.success) {
        setWeatherData(data);
      } else {
        setError(data.message || 'Failed to fetch weather data');
      }
    } catch (err) {
      setError('Network error occurred' + err);
    } finally {
      setLoading(false);
    }
  };


  const weatherPoints = [
    t('weather.info.points.0'),
    t('weather.info.points.1'),
    t('weather.info.points.2'),
  ]

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-blue-500" />
          {t('weather.title')}
        </CardTitle>
        <CardDescription>
          {t('weather.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder={t('weather.form.cityPlaceholder')}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
          />
          <Button onClick={() => fetchWeather()} disabled={loading}>
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {t('weather.form.fetchButton')}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => fetchWeather(true)} 
            disabled={loading}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t('weather.form.clearCacheButton')}
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {weatherData && weatherData.success && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{weatherData.data.name}</h3>
              <Badge variant={weatherData.cached ? "secondary" : "default"}>
                {weatherData.cached ? t('weather.status.cached') : t('weather.status.fresh')}
              </Badge>
            </div>

            {weatherData.cachedAt && (
              <p className="text-sm text-muted-foreground">
                {t('weather.status.cachedAt')}: {new Date(weatherData.cachedAt).toLocaleString()}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {Math.round(weatherData.data.main.temp)}°C
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('weather.status.feelsLike')} {Math.round(weatherData.data.main.feels_like)}°C
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Cloud className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="font-semibold">{weatherData.data.weather[0].main}</p>
                      <p className="text-xs text-muted-foreground">
                        {weatherData.data.weather[0].description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Wind className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-semibold">
                        {weatherData.data.wind.speed} m/s
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('weather.status.humidity')} {weatherData.data.main.humidity}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium mb-2">{t('weather.info.title')}</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {weatherPoints.map((point, index) => (
                  <li key={index}>• {point}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}