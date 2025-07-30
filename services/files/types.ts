/**
 * ファイルサービス関連の型定義
 */

// ファイルアップロード用のデータ型
export interface UploadFileData {
  files: File[];
  expirationDays: number;
}

// ファイルダウンロード用のレスポンス型
export interface FileDownloadData {
  buffer: ArrayBuffer;
  fileName: string;
  contentType: string;
}

// ファイル操作の結果型
export interface FileOperationResult {
  fileId: string;
  success: boolean;
  message?: string;
  error?: string;
}

// ファイル一覧用のフィルター型
export interface FileFilter {
  expired?: boolean;
  type?: string;
  sizeMin?: number;
  sizeMax?: number;
  createdAfter?: Date;
  createdBefore?: Date;
}

// ファイル統計情報型
export interface FileStats {
  totalFiles: number;
  totalSize: number;
  expiredFiles: number;
  filesByType: Record<string, number>;
}