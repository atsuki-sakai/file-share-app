import { notFound } from "next/navigation"
import MultipleFileDownloadClient from "./multiple-client"
import type { FileInfo } from "@/types"

async function getMultipleFileInfo(ids: string[]): Promise<FileInfo[] | null> {
    try {
        if (ids.length === 0) {
            return null
        }
        
        // 各ファイルの情報を並行して取得
        const fileInfoPromises = ids.map(async (fileId) => {
            try {
                const response = await fetch(`http://localhost:8787/api/files/${fileId}`, {
                    cache: 'no-store'
                })
                
                if (!response.ok) {
                    console.error(`API error for ${fileId}: ${response.status} ${response.statusText}`)
                    throw new Error(`Failed to fetch file info for ${fileId}: ${response.status}`)
                }
                
                const result = await response.json() as any
                console.log(`API response for ${fileId}:`, result)
                
                // APIレスポンスの構造に合わせて調整
                const fileData = result.success ? result.data : result
                
                return {
                    id: fileData.id,
                    name: fileData.name || '',
                    size: fileData.size || 0,
                    type: fileData.type || '',
                    createdAt: fileData.createdAt?.toString() || '',
                    updatedAt: fileData.updatedAt?.toString() || '',
                    expiresAt: fileData.expiresAt || ''
                }
            } catch (error) {
                console.error(`Error fetching file ${fileId}:`, error)
                throw error
            }
        })
        
        const filesInfo = await Promise.all(fileInfoPromises)
        return filesInfo
    } catch (error) {
        console.error("Error fetching multiple file info:", error)
        return null
    }
}

export default async function FilesPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    try {
        const params = await searchParams
        const ids = params.ids
        
        if (!ids) {
            return notFound()
        }
        
        // IDsが文字列の場合はカンマ区切りで分割、配列の場合はそのまま使用
        const fileIds = Array.isArray(ids) ? ids : ids.split(',').map(id => id.trim()).filter(Boolean)
        
        if (fileIds.length === 0) {
            return notFound()
        }
        
        const filesInfo = await getMultipleFileInfo(fileIds)
        
        if (!filesInfo || filesInfo.length === 0) {
            return notFound()
        }
        
        // 期限切れチェック
        const now = new Date()
        const hasExpiredFiles = filesInfo.some(file => new Date(file.expiresAt) < now)

        if (hasExpiredFiles) {
            return (
                <div className="flex flex-col items-center justify-center h-screen">
                    <h1 className="text-2xl font-bold">Files expired</h1>
                    <p className="text-sm text-gray-500">
                        One or more files have expired. Please contact the administrator.
                    </p>
                </div>
            )
        }

        return <MultipleFileDownloadClient fileIds={fileIds} filesInfo={filesInfo} />
    } catch (error) {
        console.error("Multiple files page render error:", error)
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-2xl font-bold">Error</h1>
                <p className="text-sm text-gray-500">An error occurred while loading the files.</p>
            </div>
        )
    }
}