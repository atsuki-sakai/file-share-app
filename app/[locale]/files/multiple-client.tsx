"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Download, File, Archive, Clock } from "lucide-react"
import type { FileInfo } from "@/types"

interface MultipleFileDownloadClientProps {
    fileIds: string[]
    filesInfo: FileInfo[]
}

export default function MultipleFileDownloadClient({ fileIds, filesInfo }: MultipleFileDownloadClientProps) {
    const { toast } = useToast()
    const [isDownloading, setIsDownloading] = useState(false)
    const [isDownloadingZip, setIsDownloadingZip] = useState(false)

    const handleDownloadAll = async () => {
        setIsDownloadingZip(true)
        try {
            window.open(`/api/download/${fileIds.join(',')}/zip`, '_blank')
            toast({
                title: "ダウンロード開始",
                description: "ZIPファイルのダウンロードを開始しました。",
            })
        } catch (error) {
            toast({
                title: "ダウンロードエラー",
                description: "ZIPファイルのダウンロードに失敗しました。",
                variant: "destructive",
            })
        } finally {
            setIsDownloadingZip(false)
        }
    }

    const handleSingleDownload = async (fileId: string, fileName: string) => {
        setIsDownloading(true)
        try {
            window.open(`/api/download/${fileId}`, '_blank')
            toast({
                title: "ダウンロード開始",
                description: `${fileName} のダウンロードを開始しました。`,
            })
        } catch (error) {
            toast({
                title: "ダウンロードエラー",
                description: `${fileName} のダウンロードに失敗しました。`,
                variant: "destructive",
            })
        } finally {
            setIsDownloading(false)
        }
    }

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

    const getTotalSize = () => {
        return filesInfo.reduce((total, file) => total + file.size, 0)
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Archive className="h-6 w-6 text-primary" />
                                <div>
                                    <CardTitle>複数ファイルのダウンロード</CardTitle>
                                    <CardDescription>
                                        {filesInfo.length}個のファイルが利用可能です
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">合計サイズ</p>
                                    <p className="text-2xl font-bold">{formatFileSize(getTotalSize())}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-sm font-medium">有効期限</p>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        {formatDate(filesInfo[0].expiresAt)}
                                    </div>
                                </div>
                            </div>

                            <Button 
                                onClick={handleDownloadAll}
                                disabled={isDownloadingZip}
                                className="w-full"
                                size="lg"
                            >
                                <Archive className="mr-2 h-5 w-5" />
                                {isDownloadingZip ? "ZIPファイル準備中..." : "すべてZIPでダウンロード"}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>ファイル一覧</CardTitle>
                            <CardDescription>
                                個別にダウンロードすることも可能です
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {filesInfo.map((file, index) => (
                                    <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                                            <File className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium truncate">{file.name}</p>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span>{formatFileSize(file.size)}</span>
                                                    <span>•</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {file.type?.split('/')[0] || 'file'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => handleSingleDownload(file.id, file.name)}
                                            disabled={isDownloading}
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}