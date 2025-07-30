import {
  CloudflareEnv,
  BaseService,
  WeatherData,
  WeatherCacheData,
  WeatherResponse,
  ApiResponse
} from "@/types/services";

/**
 * 天気情報サービス
 * - OpenWeatherMap APIからの天気データ取得
 * - Cloudflare KVを使った5分間キャッシュ
 * - キャッシュクリア機能
 */
export class WeatherService implements BaseService {
  private readonly CACHE_TTL = 300; // 5分間のキャッシュ
  
  constructor(public env: CloudflareEnv) {}

  /**
   * 天気情報を取得（キャッシュ機能付き）
   * @param city 都市名
   * @param clearCache キャッシュをクリアするかどうか
   * @returns 天気情報
   */
  async getWeather(city: string, clearCache = false): Promise<WeatherResponse> {
    if (!city?.trim()) {
      return {
        success: false,
        error: "City is required",
        cached: false
      };
    }

    try {
      if (!this.env.WEATHER_API_KEY) {
        return {
          success: false,
          error: "Weather API key not configured",
          cached: false
        };
      }

      // キャッシュクリアが指定されていない場合のみキャッシュをチェック
      if (!clearCache) {
        const cachedData = await this.getCachedWeather(city);
        if (cachedData) {
          return {
            success: true,
            data: cachedData.weather,
            cached: true,
            cachedAt: cachedData.timestamp
          };
        }
      }

      // OpenWeatherMap APIから天気データを取得
      const weatherData = await this.fetchWeatherFromAPI(city);
      if (!weatherData.success) {
        return {
          ...weatherData,
          cached: false
        };
      }

      // 新しいデータをキャッシュに保存
      await this.cacheWeatherData(city, weatherData.data!);

      return {
        success: true,
        data: weatherData.data!,
        cached: false
      };

    } catch (error) {
      console.error("Weather service error:", error);
      return {
        success: false,
        error: "Internal server error",
        cached: false
      };
    }
  }

  /**
   * キャッシュされた天気データを取得
   * @param city 都市名
   * @returns キャッシュされたデータまたはnull
   */
  private async getCachedWeather(city: string): Promise<WeatherCacheData | null> {
    try {
      const cached = await this.env.WEATHER_KV.get(city);
      if (!cached) return null;

      const cachedData: WeatherCacheData = JSON.parse(cached);
      const cacheTime = new Date(cachedData.timestamp);
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - this.CACHE_TTL * 1000);

      // キャッシュが5分以内の場合、キャッシュされたデータを返す
      if (cacheTime > fiveMinutesAgo) {
        return cachedData;
      }

      return null;
    } catch (error) {
      console.error("Cache retrieval error:", error);
      return null;
    }
  }

  /**
   * OpenWeatherMap APIから天気データを取得
   * @param city 都市名
   * @returns 天気データ
   */
  private async fetchWeatherFromAPI(city: string): Promise<ApiResponse<WeatherData>> {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${this.env.WEATHER_API_KEY}&units=metric`;
      
      console.log("Weather API URL:", url.replace(this.env.WEATHER_API_KEY, "***"));
      
      const response = await fetch(url);
      
      console.log("Weather API response status:", response.status);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Weather API error response:", errorBody);
        
        const errorMessage = response.status === 404 
          ? "City not found" 
          : `Weather API error: ${response.status} - ${errorBody}`;
        
        return {
          success: false,
          error: errorMessage
        };
      }

      const weatherData = await response.json() as WeatherData;
      console.log("Weather API success:", weatherData.name);
      
      return {
        success: true,
        data: weatherData
      };

    } catch (error) {
      console.error("API fetch error:", error);
      return {
        success: false,
        error: `Failed to fetch weather data from API: ${error}`
      };
    }
  }

  /**
   * 天気データをキャッシュに保存
   * @param city 都市名
   * @param weatherData 天気データ
   */
  private async cacheWeatherData(city: string, weatherData: WeatherData): Promise<void> {
    try {
      const cacheData: WeatherCacheData = {
        weather: weatherData,
        timestamp: new Date().toISOString()
      };

      await this.env.WEATHER_KV.put(city, JSON.stringify(cacheData), {
        expirationTtl: this.CACHE_TTL // 5分間
      });
    } catch (error) {
      console.error("Cache storage error:", error);
      // キャッシュの保存に失敗してもAPIレスポンスは返す
    }
  }

  /**
   * 特定の都市のキャッシュをクリア
   * @param city 都市名
   * @returns 操作結果
   */
  async clearCache(city: string): Promise<ApiResponse<boolean>> {
    try {
      await this.env.WEATHER_KV.delete(city);
      return {
        success: true,
        data: true,
        message: `Cache cleared for ${city}`
      };
    } catch (error) {
      console.error("Cache clear error:", error);
      return {
        success: false,
        error: "Failed to clear cache"
      };
    }
  }

  /**
   * 全キャッシュをクリア（管理用）
   * 注意: KVの全キーを取得する方法は限定的なため、実装は簡略化
   */
  async clearAllCache(): Promise<ApiResponse<boolean>> {
    try {
      // 実際の実装では、キーのリストを別途管理するか、
      // 期限切れに任せることを推奨
      console.log("Cache will expire automatically after TTL");
      return {
        success: true,
        data: true,
        message: "Cache will expire automatically"
      };
    } catch (error) {
      console.error("Cache clear all error:", error);
      return {
        success: false,
        error: "Failed to clear all cache"
      };
    }
  }
}