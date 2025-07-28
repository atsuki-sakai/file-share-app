export type ExpirationOption = 1 | 3 | 7 | 30;

export type FileInfo = {
    id: string
    name: string
    size: number
    type: string
    createdAt: string
    updatedAt: string
    expiresAt: string
}