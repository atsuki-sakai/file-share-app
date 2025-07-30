import { Context } from "hono";
import { ApiResponse } from "@/types/services";

/**
 * API レスポンスヘルパー
 * 統一されたレスポンス形式とエラーハンドリングを提供
 */
export class ResponseHelper {
  /**
   * 成功レスポンスを返す
   * @param c Honoのコンテキスト
   * @param data レスポンスデータ
   * @param status HTTPステータスコード
   * @returns JSONレスポンス
   */
  static success<T>(c: Context, data: T, status = 200 as any) {
    const response: ApiResponse<T> = {
      success: true,
      data
    };
    return c.json(response, status as any);
  }

  /**
   * エラーレスポンスを返す
   * @param c Honoのコンテキスト
   * @param error エラーメッセージ
   * @param status HTTPステータスコード
   * @returns JSONレスポンス
   */
  static error(c: Context, error: string, status = 500 as any) {
    const response: ApiResponse = {
      success: false,
      error
    };
    return c.json(response, status as any);
  }

  /**
   * サービスレスポンスをHTTPレスポンスに変換
   * @param c Honoのコンテキスト
   * @param serviceResponse サービス層からのレスポンス
   * @param successStatus 成功時のHTTPステータスコード
   * @param errorStatus エラー時のHTTPステータスコード
   * @returns JSONレスポンス
   */
  static fromServiceResponse<T>(
    c: Context, 
    serviceResponse: ApiResponse<T>, 
    successStatus = 200 as any,
    errorStatus = 500 as any
  ) {
    if (serviceResponse.success) {
      return c.json(serviceResponse, successStatus as any);
    } else {
      const status = this.getErrorStatus(serviceResponse.error || 'Unknown error', errorStatus);
      return c.json(serviceResponse, status as any);
    }
  }

  /**
   * バイナリファイルレスポンスを返す
   * @param c Honoのコンテキスト
   * @param buffer ファイルデータ
   * @param fileName ファイル名
   * @param contentType Content-Type
   * @returns バイナリレスポンス
   */
  static binaryFile(
    c: Context, 
    buffer: ArrayBuffer, 
    fileName: string, 
    contentType: string
  ) {
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    
    return new Response(buffer, { headers });
  }

  /**
   * エラーメッセージからHTTPステータスコードを推定
   * @param error エラーメッセージ
   * @param defaultStatus デフォルトステータス
   * @returns HTTPステータスコード
   */
  private static getErrorStatus(error: string, defaultStatus: number): number {
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('not found') || errorLower.includes('file not found')) {
      return 404;
    }
    if (errorLower.includes('expired') || errorLower.includes('has expired')) {
      return 410; // Gone
    }
    if (errorLower.includes('required') || errorLower.includes('invalid')) {
      return 400;
    }
    if (errorLower.includes('unauthorized') || errorLower.includes('not configured')) {
      return 401;
    }
    if (errorLower.includes('forbidden')) {
      return 403;
    }
    
    return defaultStatus;
  }

  /**
   * バリデーションエラーのレスポンス
   * @param c Honoのコンテキスト
   * @param field フィールド名
   * @param message エラーメッセージ
   * @returns バリデーションエラーレスポンス
   */
  static validationError(c: Context, field: string, message: string) {
    return this.error(c, `Validation error: ${field} - ${message}`, 400 as any);
  }

  /**
   * 404 Not Foundレスポンス
   * @param c Honoのコンテキスト
   * @param resource リソース名
   * @returns 404レスポンス
   */
  static notFound(c: Context, resource = 'Resource') {
    return this.error(c, `${resource} not found`, 404 as any);
  }

  /**
   * 401 Unauthorizedレスポンス
   * @param c Honoのコンテキスト
   * @param message メッセージ
   * @returns 401レスポンス
   */
  static unauthorized(c: Context, message = 'Unauthorized') {
    return this.error(c, message, 401 as any);
  }
}