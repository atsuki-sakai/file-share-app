"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, AlertCircle, File, Archive, Copy, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { FileDownloadClientProps } from "@/types/api/types"

export default function FileDownloadClient({ fileId, fileInfo }: FileDownloadClientProps) {
    const [isDownloading, setIsDownloading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()

    const isMultipleFiles = Array.isArray(fileInfo)
    const files = isMultipleFiles ? fileInfo : [fileInfo]

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ja-JP')
    }

    const handleDownload = async (targetFileId?: string) => {
        setIsDownloading(true)
        setError(null)
        
        try {
            const downloadId = targetFileId || fileId
            window.location.href = `/api/download/${downloadId}`
        } catch (err) {
            setError("ダウンロードに失敗しました。もう一度お試しください。")
            console.error("Download error:", err)
        } finally {
            setIsDownloading(false)
        }
    }

    const handleZipDownload = async () => {
        setIsDownloading(true)
        setError(null)
        
        try {
            window.location.href = `/api/download/${fileId}/zip`
        } catch (err) {
            setError("ZIPダウンロードに失敗しました。もう一度お試しください。")
            console.error("ZIP download error:", err)
        } finally {
            setIsDownloading(false)
        }
    }

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href)
        toast({
            title: "リンクをコピーしました",
            description: "ファイルのリンクがクリップボードにコピーされました。",
        })
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            {isMultipleFiles ? (
                                <Archive className="h-6 w-6 text-primary" />
                            ) : (
                                <File className="h-6 w-6 text-primary" />
                            )}
                            <CardTitle>
                                {isMultipleFiles ? `${files.length}個のファイル` : files[0].name}
                            </CardTitle>
                        </div>
                        <CardDescription>
                            {isMultipleFiles 
                                ? 'ファイルパッケージの詳細とダウンロードオプション'
                                : 'ファイルの詳細とダウンロードオプション'
                            }
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        {/* エラーメッセージ */}
                        {error && (
                            <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-md">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {/* ファイル一覧 */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium">ファイル一覧</h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {files.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                                            <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium truncate">{file.name}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>{formatFileSize(file.size)}</span>
                                                    <span>•</span>
                                                    <span>{file.type || 'Unknown type'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => handleDownload(file.id)}
                                            variant="ghost"
                                            size="sm"
                                            disabled={isDownloading}
                                            className="flex-shrink-0"
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 有効期限情報 */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>
                                有効期限: {formatDate(files[0].expiresAt)}
                            </span>
                        </div>

                        {/* ダウンロードボタン */}
                        <div className="flex gap-2">
                            {isMultipleFiles && (
                                <Button 
                                    onClick={handleZipDownload} 
                                    disabled={isDownloading}
                                    className="flex-1"
                                >
                                    <Archive className="mr-2 h-4 w-4" />
                                    {isDownloading ? "準備中..." : "ZIPでダウンロード"}
                                </Button>
                            )}
                            
                            {!isMultipleFiles && (
                                <Button 
                                    onClick={() => handleDownload()} 
                                    disabled={isDownloading}
                                    className="flex-1"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    {isDownloading ? "準備中..." : "ダウンロード"}
                                </Button>
                            )}
                            
                            <Button variant="outline" onClick={handleCopyLink}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* 統計情報 */}
                        {isMultipleFiles && (
                            <div className="pt-4 border-t">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">ファイル数:</span>
                                        <span className="ml-2 font-medium">{files.length}個</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">合計サイズ:</span>
                                        <span className="ml-2 font-medium">
                                            {formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}