import { drizzle } from "drizzle-orm/d1";
import { desc, eq } from "drizzle-orm";
import { files } from "@/db/schema";
import JSZip from "jszip";
import {
  CloudflareEnv,
  BaseService,
  FileRecord,
  UploadResult,
  ApiResponse
} from "@/types/services";

/**
 * ファイル管理サービス
 * - ファイルのアップロード、ダウンロード、情報取得を担当
 * - R2ストレージとD1データベースを使用
 * - 期限付きファイル管理
 */
export class FileService implements BaseService {
  private db: ReturnType<typeof drizzle>;

  constructor(public env: CloudflareEnv) {
    this.db = drizzle(env.DB);
  }

  /**
   * 全ファイル一覧を取得
   * @returns ファイル一覧
   */
  async getAllFiles(): Promise<ApiResponse<FileRecord[]>> {
    try {
      const fileList = await this.db.select().from(files);
      return {
        success: true,
        data: fileList as FileRecord[]
      };
    } catch (error) {
      // Cloudflare Workers環境での安全なエラーログ
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to get files:", errorMessage);
      return {
        success: false,
        error: "Failed to retrieve files"
      };
    }
  }

  /**
   * ファイル情報を取得
   * @param fileId ファイルID
   * @returns ファイル情報
   */
  async getFileById(fileId: string): Promise<ApiResponse<FileRecord>> {
    try {
      const fileRecord = await this.db
        .select()
        .from(files)
        .where(eq(files.id, fileId))
        .limit(1);

      if (fileRecord.length === 0) {
        return {
          success: false,
          error: "File not found"
        };
      }

      const file = fileRecord[0] as FileRecord;

      // 期限チェック
      if (new Date(file.expiresAt) < new Date()) {
        return {
          success: false,
          error: "File has expired"
        };
      }

      return {
        success: true,
        data: file
      };
    } catch (error) {
      // Cloudflare Workers環境での安全なエラーログ
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to get file info:", errorMessage);
      return {
        success: false,
        error: "Failed to get file info"
      };
    }
  }

  /**
   * ファイルをアップロード
   * @param uploadData アップロードするファイルデータ
   * @returns アップロード結果
   */
  async uploadFiles(uploadData: {
    files: File[];
    expirationDays: number;
  }): Promise<ApiResponse<UploadResult>> {
    if (!uploadData.files || uploadData.files.length === 0) {
      return {
        success: false,
        error: "No files uploaded"
      };
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + uploadData.expirationDays);

    const uploadResults: FileRecord[] = [];

    try {
      for (const file of uploadData.files) {
        const fileName = file.name;
        const filePath = `upload/${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 11)}-${fileName}`;

        // R2にファイルをアップロード
        const fileBuffer = await file.arrayBuffer();
        await this.env.R2.put(filePath, fileBuffer, {
          httpMetadata: {
            contentType: file.type,
          },
        });

        // データベースにファイル情報を保存
        await this.db.insert(files).values({
          name: fileName,
          path: filePath,
          size: file.size,
          type: file.type,
          expiresAt: expiresAt.toISOString(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        // 挿入されたレコードを取得
        const insertRecord = await this.db
          .select()
          .from(files)
          .orderBy(desc(files.createdAt))
          .limit(1);

        uploadResults.push(insertRecord[0] as FileRecord);
      }

      const result: UploadResult = {
        files: uploadResults,
        success: true,
        message: `${uploadResults.length} files uploaded successfully`,
        url: `/ja/files/${uploadResults[0].id}`,
      };

      return {
        success: true,
        data: result
      };
    } catch (error) {
      // Cloudflare Workers環境での安全なエラーログ
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Upload error:", errorMessage);
      return {
        success: false,
        error: `Failed to upload files: ${errorMessage}`
      };
    }
  }

  /**
   * 単一ファイルをダウンロード
   * @param fileId ファイルID
   * @returns ファイルのArrayBufferとメタデータ
   */
  async downloadFile(fileId: string): Promise<ApiResponse<{
    buffer: ArrayBuffer;
    fileName: string;
    contentType: string;
  }>> {
    try {
      // ファイル情報を取得
      const fileResult = await this.getFileById(fileId);
      if (!fileResult.success || !fileResult.data) {
        return {
          success: false,
          error: fileResult.error || "Failed to get file info"
        };
      }

      const fileInfo = fileResult.data;

      // R2からファイルを取得
      const file = await this.env.R2.get(fileInfo.path);
      if (!file) {
        return {
          success: false,
          error: "File not found in storage"
        };
      }

      const arrayBuffer = await file.arrayBuffer();

      return {
        success: true,
        data: {
          buffer: arrayBuffer,
          fileName: fileInfo.name,
          contentType: fileInfo.type || "application/octet-stream"
        }
      };
    } catch (error) {
      // Cloudflare Workers環境での安全なエラーログ
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("File download error:", errorMessage);
      return {
        success: false,
        error: "Failed to download file"
      };
    }
  }

  /**
   * 複数ファイルをZIPでダウンロード
   * @param fileIds ファイルIDの配列
   * @returns ZIPファイルのArrayBuffer
   */
  async downloadFilesAsZip(fileIds: string[]): Promise<ApiResponse<{
    buffer: ArrayBuffer;
    fileName: string;
    contentType: string;
  }>> {
    try {
      const fileResults: FileRecord[] = [];

      // 各ファイルの情報を取得
      for (const id of fileIds) {
        const result = await this.db
          .select()
          .from(files)
          .where(eq(files.id, id.trim()))
          .limit(1);

        if (result.length > 0) {
          fileResults.push(result[0] as FileRecord);
        }
      }

      if (fileResults.length === 0) {
        return {
          success: false,
          error: "No files found"
        };
      }

      // 期限切れチェック
      for (const fileInfo of fileResults) {
        if (new Date(fileInfo.expiresAt) < new Date()) {
          return {
            success: false,
            error: `File ${fileInfo.name} has expired`
          };
        }
      }

      // ZIPファイルを作成
      const zip = new JSZip();

      for (const fileInfo of fileResults) {
        const file = await this.env.R2.get(fileInfo.path);
        if (file) {
          const arrayBuffer = await file.arrayBuffer();
          zip.file(fileInfo.name, arrayBuffer);
        }
      }

      // ZIPファイルを生成
      const zipBuffer = await zip.generateAsync({ type: "arraybuffer" });

      return {
        success: true,
        data: {
          buffer: zipBuffer,
          fileName: "files.zip",
          contentType: "application/zip"
        }
      };
    } catch (error) {
      // Cloudflare Workers環境での安全なエラーログ
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("ZIP download error:", errorMessage);
      return {
        success: false,
        error: "Failed to create ZIP file"
      };
    }
  }
}