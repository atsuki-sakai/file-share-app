import { notFound } from "next/navigation"
import FileDownloadClient from "./client"
import type { FileInfo } from "@/types"
import type { ApiResponse } from "@/types/api/types"


async function getFileInfo(id: string): Promise<FileInfo | null> {
    try {
        // 複数ファイルIDが含まれている場合はエラー
        if (id.includes(',')) {
            console.error("Multiple file IDs detected in single file route:", id)
            return null
        }
        
        const response = await fetch(`http://localhost:8787/api/files/${id}`, {
            cache: 'no-store'
        })
        
        if (!response.ok) {
            console.error(`API error: ${response.status} ${response.statusText}`)
            return null
        }
        
        const result = await response.json() as ApiResponse
        console.log("Single file API response:", result)
        
        if (!result.success) {
            console.error("Invalid API response:", result)
            return null
        }

        if (!result.data) {
            console.error("No data in API response:", result)
            return null
        }

        return result.data
    } catch (error) {
        console.error("Error fetching file info:", error)
        return null
    }
}

export default async function Page(props: {params: Promise<{id: string}>}) {
    try {
        const params = await props.params;
        const fileInfo = await getFileInfo(params.id)
        console.log("fileInfo", fileInfo)

        if (!fileInfo) {
            return notFound()
        }

        // 期限切れチェック
        const now = new Date()
        const hasExpired = new Date(fileInfo.expiresAt) < now

        if (hasExpired) {
            return (
                <div className="flex flex-col items-center justify-center h-screen">
                    <h1 className="text-2xl font-bold">File expired</h1>
                    <p className="text-sm text-gray-500">
                        This file has expired. Please contact the administrator.
                    </p>
                </div>
            )
        }

        return <FileDownloadClient fileId={params.id} fileInfo={fileInfo} />
    } catch (error) {
        console.error("Page render error:", error)
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-2xl font-bold">Error</h1>
                <p className="text-sm text-gray-500">An error occurred while loading the file.</p>
            </div>
        )
    }
}