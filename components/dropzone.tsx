"use client"

import * as React from "react"
import { useDropzone, type DropzoneOptions } from "react-dropzone"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { X, Upload, File, Copy, Download } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { expirationOptions } from "@/lib/constants"
import type { ExpirationOption } from "@/types/common/types"
import type { UploadResponse } from "@/types/components/types"
import { useTranslations } from 'next-intl'


const dropzoneVariants = cva(
  "flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer",
  {
    variants: {
      variant: {
        default: "border-border bg-background hover:bg-accent/50",
        active: "border-primary bg-primary/10",
        error: "border-destructive bg-destructive/10",
        success: "border-green-500 bg-green-50 dark:bg-green-950",
      },
      size: {
        default: "h-32 p-6",
        sm: "h-24 p-4",
        lg: "h-48 p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface DropzoneProps 
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrop'>,
    VariantProps<typeof dropzoneVariants> {
  options?: DropzoneOptions
  onDrop?: (acceptedFiles: File[], rejectedFiles: any[]) => void
  children?: React.ReactNode
}

const Dropzone = React.forwardRef<HTMLDivElement, DropzoneProps>(
  ({ className, variant, size, options, onDrop, children, ...props }, ref) => {
    const { toast } = useToast()
    const t = useTranslations('dropzone')
    const [uploadResult, setUploadResult] = React.useState<UploadResponse | null>(null)
    const [files, setFiles] = React.useState<File[]>([])
    const [isUploading, setIsUploading] = React.useState(false)
    const [expiration, setExpiration] = React.useState<ExpirationOption>(7)
    
    const {
      getRootProps,
      getInputProps,
      isDragActive,
      isDragReject,
    } = useDropzone({
      ...options,
      onDrop: (acceptedFiles, rejectedFiles) => {
        setFiles(acceptedFiles)
        onDrop?.(acceptedFiles, rejectedFiles)
        
        if (rejectedFiles.length > 0) {
          toast({
            title: t('errors.filesRejected'),
            description: t('errors.filesRejectedDescription', { count: rejectedFiles.length }),
            variant: "destructive",
          })
        }
        
        if (acceptedFiles.length > 0) {
          toast({
            title: t('success.filesSelected'),
            description: t('success.filesSelectedDescription', { count: acceptedFiles.length }),
          })
        }
      },
    })

    const handleUpload = async () => {
      if (files.length === 0) return
      
      setIsUploading(true)
      try {
        const formData = new FormData()
        files.forEach(file => {
          formData.append("file", file)
        })
        formData.append("expiration", expiration.toString())
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData, 
        })

        if (!response.ok) {
          throw new Error("Failed to upload files response:" + response + ", status: " + response.status)
        }
        const uploadResult: UploadResponse = await response.json()
        setUploadResult(uploadResult)
        toast({
          title: t('success.uploadComplete'),
          description: t('success.uploadCompleteDescription', { count: files.length }),
        })
        console.log("uploadResult", uploadResult)
        setFiles([])
      } catch (error) {
        toast({
          title: t('errors.uploadError'),
          description: t('errors.uploadErrorDescription') + error,
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
      }
    }

    const removeFile = (index: number) => {
      const newFiles = files.filter((_, i) => i !== index)
      setFiles(newFiles)
    }

    const getVariant = () => {
      if (isDragReject) return "error"
      if (isDragActive) return "active"
      if (files.length > 0) return "success"
      return variant
    }

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-end gap-3">
          <Label>{t('ui.downloadExpiry')}</Label>
          <Select value={expiration.toString()} onValueChange={(value) => setExpiration(Number(value) as ExpirationOption)}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder={t('ui.selectExpiry')} />
            </SelectTrigger>
            <SelectContent>
              {
                Object.entries(expirationOptions).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value}{t('ui.days')}</SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>
        <div
          {...getRootProps()}
          className={cn(dropzoneVariants({ variant: getVariant(), size, className }))}
          ref={ref}
          {...props}
        >
          <input {...getInputProps()} />
          {children || (
            <div className="text-center">
              <File className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                {isDragActive
                  ? t('ui.dropHere')
                  : t('ui.dragDropOrClick')}
              </p>
            </div>
          )}
        </div>

        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">{t('ui.selectedFiles', { count: files.length })}</h3>
              <Button
                onClick={() => setFiles([])}
                variant="outline"
                size="sm"
                className="h-8 px-2"
              >
                {t('ui.removeAll')}
              </Button>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                      </p>
                    </div>
                    <Badge variant="outline" className="flex-shrink-0">
                      {file.type?.split('/')[0] || 'file'}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => removeFile(index)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button 
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full"
              size="sm"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? t('ui.uploading') : t('ui.uploadFiles', { count: files.length })}
            </Button>
          </div>
        )}
        {
          uploadResult && uploadResult.success && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">{t('success.uploadComplete')}</h3>
              {uploadResult.files && uploadResult.files.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {t('success.filesUploaded', { count: uploadResult.files.length })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('ui.expiry')}: {uploadResult.files[0].expiresAt ? new Date(uploadResult.files[0].expiresAt).toLocaleString() : t('ui.none')}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        // 複数ファイルの場合はZIPダウンロード
                        const fileIds = uploadResult.files!.map(f => f.id).join(',');
                        window.open(`/api/download/${fileIds}/zip`, '_blank');
                      }}
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {t('ui.downloadZip')}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        // 共有リンクをコピー
                        const fileIds = uploadResult.files!.map(f => f.id).join(',');
                        const shareUrl = uploadResult.files!.length > 1 
                          ? `${window.location.origin}/ja/files?ids=${fileIds}`
                          : `${window.location.origin}/ja/files/${uploadResult.files![0].id}`;
                        navigator.clipboard.writeText(shareUrl);
                        toast({
                          title: t('success.linkCopied'),
                          description: t('success.linkCopiedDescription'),
                        });
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {uploadResult.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                        <span className="truncate">{file.name}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(`/api/download/${file.id}`, '_blank')}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : uploadResult.url ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {t('ui.expiry')}: {uploadResult.expiresAt ? new Date(uploadResult.expiresAt).toLocaleString() : t('ui.none')}
                  </p>
                  <div className="flex items-center gap-2 w-full"> 
                    <Input type="text" value={uploadResult.url} readOnly className="w-full" />
                    <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(uploadResult.url || "")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => {
                      const hasMultipleFiles = uploadResult.files && uploadResult.files.length > 1;
                      const downloadUrl = hasMultipleFiles 
                        ? `/ja/files?ids=${uploadResult.files!.map(f => f.id).join(',')}`
                        : `/ja/files/${uploadResult.id || uploadResult.files![0].id}`;
                      window.open(downloadUrl, '_blank');
                    }}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          ) 
        }
      </div>
    )
  }
)

Dropzone.displayName = "Dropzone"

export { Dropzone, dropzoneVariants }