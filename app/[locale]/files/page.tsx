import { notFound } from "next/navigation"
import { drizzle } from "drizzle-orm/d1"
import { inArray } from "drizzle-orm"
import { files } from "@/db/schema"
import FileDownloadClient from "./client"
import type { FileInfo } from "@/types"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import type { CloudflareEnv } from "@/types/services"

async function getMultipleFileInfo(ids: string[]): Promise<FileInfo[] | null> {
    try {
        if (ids.length === 0) {
            return null
        }
        
        // Cloudflare Workers環境から直接データベースにアクセス
        const env = getCloudflareContext().env as CloudflareEnv
        const db = drizzle(env.DB)
        
        console.log('Fetching files from database:', ids)
        
        // データベースから直接ファイル情報を取得
        const fileRecords = await db
            .select()
            .from(files)
            .where(inArray(files.id, ids))
        
        console.log('Database query result:', fileRecords)
        
        if (fileRecords.length === 0) {
            console.error("No files found in database")
            return null
        }
        
        // 期限切れチェック
        const now = new Date()
        const validFiles = fileRecords.filter(file => new Date(file.expiresAt) > now)
        
        if (validFiles.length === 0) {
            console.error("All files have expired")
            return null
        }
        
        // FileInfo形式に変換
        const filesInfo: FileInfo[] = validFiles.map(file => ({
            id: file.id,
            name: file.name || '',
            size: file.size || 0,
            type: file.type || '',
            createdAt: file.createdAt?.toString() || '',
            updatedAt: file.updatedAt?.toString() || '',
            expiresAt: file.expiresAt || ''
        }))
        
        return filesInfo
    } catch (error) {
        console.error("Error fetching multiple file info from database:", error)
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
        
        console.log('fileIds', fileIds)
        if (fileIds.length === 0) {
            return notFound()
        }
        
        const filesInfo = await getMultipleFileInfo(fileIds)
        
        console.log('filesInfo', filesInfo)
        if (!filesInfo || filesInfo.length === 0) {
            return notFound()
        }
        
        // 期限切れチェック（既にデータベースレベルでチェック済みだが、念のため）
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

        return <FileDownloadClient fileIds={fileIds} filesInfo={filesInfo} />
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