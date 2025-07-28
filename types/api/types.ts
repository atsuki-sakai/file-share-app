import type { FileInfo } from "../common/types"

export type ApiResponse = {
    success: boolean
    data?: FileInfo
    message?: string
  }

export interface FileDownloadClientProps {
    fileId: string
    fileInfo: FileInfo | FileInfo[]
}