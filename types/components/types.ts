export type UploadResponse = {
    success: boolean
    message?: string
    url?: string
    expiresAt?: number
    id?: string
    path?: string
    name?: string
    type?: string
    size?: number
    files?: Array<{
      id: string
      name: string
      size: number
      type: string
      createdAt: number
      updatedAt: number
      expiresAt: string
    }>
  }