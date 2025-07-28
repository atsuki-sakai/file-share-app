import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { desc, eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { files } from "@/db/schema";
import { handle } from "hono/vercel";
import JSZip from "jszip";

// Next.js API Route for Hono Integration
const app = new Hono().basePath("/api");


app.get("/health", (c) => c.json({ message: "API is running." }));

app.get('/files', async (c) => {
    const db = drizzle(
        (getCloudflareContext().env as any).DB as unknown as D1Database
    )
    const fileResponse = await db.select().from(files);
    return c.json(fileResponse);
});

app.get('/files/:id', async (c) => {
    const fileId = c.req.param('id');
    const db = drizzle(
        (getCloudflareContext().env as any).DB as unknown as D1Database
    );
    
    try {
        const fileRecord = await db.select().from(files).where(eq(files.id, fileId)).limit(1);
        
        if (fileRecord.length === 0) {
            return c.json({ success: false, message: "File not found" }, 404);
        }
        
        const file = fileRecord[0];
        
        // Check if file has expired
        if (new Date(file.expiresAt) < new Date()) {
            return c.json({ success: false, message: "File has expired" }, 410);
        }
        
        // 一貫したレスポンス形式で返す
        return c.json({
            success: true,
            data: {
                id: file.id,
                name: file.name,
                size: file.size,
                type: file.type,
                createdAt: file.createdAt,
                updatedAt: file.updatedAt,
                expiresAt: file.expiresAt
            }
        });
    } catch (e) {
        console.error("File info error:", e);
        return c.json({ success: false, message: "Failed to get file info" }, 500);
    }
});

app.post('/upload', async (c) => {
    const formData = await c.req.formData();
    const uploadedFiles = formData.getAll('file');
    const expirationDays = formData.get('expiration');
    
    if (!uploadedFiles || uploadedFiles.length === 0) {
        return c.json({ success: false, message: "No files uploaded" }, 400);
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Number(expirationDays));

    const r2 = (getCloudflareContext().env as any).R2 as unknown as R2Bucket;
    const db = drizzle(
        (getCloudflareContext().env as any).DB as unknown as D1Database
    );

    const uploadResults = [];
    
    try {
        for (const fileData of uploadedFiles) {
            const file = fileData as File;
            const fileName = file.name;
            const filePath = `upload/${Date.now()}-${Math.random().toString(36).substring(2, 11)}-${fileName}`;

            try {
                const fileBuffer = await file.arrayBuffer();
                await r2.put(filePath, fileBuffer, {
                    httpMetadata: {
                        contentType: file.type,
                    },
                });

                await db.insert(files).values({
                    name: fileName,
                    path: filePath,
                    size: file.size,
                    type: file.type,
                    expiresAt: expiresAt.toISOString(),
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                });

                const insertRecord = await db.select().from(files).orderBy(desc(files.createdAt)).limit(1);
                uploadResults.push(insertRecord[0]);
            } catch (e) {
                console.error(`Failed to upload file ${fileName}:`, e);
                throw new Error(`Failed to upload file ${fileName}: ${e}`);
            }
        }

        return c.json({ 
            files: uploadResults,
            success: true, 
            message: `${uploadResults.length} files uploaded successfully`,
            url: `/ja/files/${uploadResults[0].id}`,
        }, 200);
    } catch (e) {
        console.error("Upload error:", e);
        return c.json({ success: false, message: "Failed to upload files: " + e }, 500);
    }
});

app.get('/download/:id', async (c) => {
    try {
        const fileId = c.req.param('id');
        const db = drizzle(
            (getCloudflareContext().env as any).DB as unknown as D1Database
        );
        
        // 単一ファイルのダウンロード
        const fileResult = await db.select().from(files).where(eq(files.id, fileId)).limit(1);
        if (fileResult.length === 0) {
            return c.json({ success: false, message: "File not found" }, 404);
        }

        const fileInfo = fileResult[0];

        if (new Date(fileInfo.expiresAt) < new Date()) {
            return c.json({ success: false, message: "File has expired" }, 410);
        }

        const r2 = (getCloudflareContext().env as any).R2 as unknown as R2Bucket;
        const file = await r2.get(fileInfo.path);
        if (!file) {
            return c.json({ success: false, message: "File not found in storage" }, 404);
        }

        const arrayBuffer = await file.arrayBuffer();

        const headers = new Headers();
        headers.set('Content-Type', fileInfo.type || "application/octet-stream");
        headers.set('Content-Disposition', `attachment; filename="${fileInfo.name}"`);
        return new Response(arrayBuffer, { headers });
        
    } catch(e){
        console.error("File download error:", e);
        return c.json({ success: false, message: "Failed to download file" + e }, 500);
    }
})

app.get('/download/:ids/zip', async (c) => {
    try {
        const fileIds = c.req.param('ids').split(',');
        const db = drizzle(
            (getCloudflareContext().env as any).DB as unknown as D1Database
        );
        
        const fileResults: any[] = [];
        
        for (const id of fileIds) {
            const result = await db.select().from(files).where(eq(files.id, id.trim())).limit(1);
            if (result.length > 0) {
                fileResults.push(result[0]);
            }
        }
        
        if (fileResults.length === 0) {
            return c.json({ success: false, message: "No files found" }, 404);
        }
        
        // 期限切れチェック
        for (const fileInfo of fileResults) {
            if (new Date(fileInfo.expiresAt) < new Date()) {
                return c.json({ success: false, message: `File ${fileInfo.name} has expired` }, 410);
            }
        }
        
        const r2 = (getCloudflareContext().env as any).R2 as unknown as R2Bucket;
        
        // JSZipを使用してZIPファイルを作成
        const zip = new JSZip();
        
        for (const fileInfo of fileResults) {
            const file = await r2.get(fileInfo.path);
            if (file) {
                const arrayBuffer = await file.arrayBuffer();
                zip.file(fileInfo.name, arrayBuffer);
            }
        }
        
        // ZIPファイルを生成
        const zipBuffer = await zip.generateAsync({ type: "arraybuffer" });
        
        const headers = new Headers();
        headers.set('Content-Type', 'application/zip');
        headers.set('Content-Disposition', 'attachment; filename="files.zip"');
        return new Response(zipBuffer, { headers });
        
    } catch(e){
        console.error("ZIP download error:", e);
        return c.json({ success: false, message: "Failed to create ZIP file" + e }, 500);
    }
})




export const GET = handle(app);
export const POST = handle(app);