import { Hono } from "hono";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { handle } from "hono/vercel";
import { FileService } from "@/services/files/FileService";
import { WeatherService } from "@/services/weather/WeatherService";
import { ResponseHelper } from "@/lib/response-helper";
import { CloudflareEnv } from "@/types/services";

// Next.js API Route for Hono Integration
const app = new Hono().basePath("/api");

// ヘルスチェックエンドポイント
app.get("/health", (c) => 
  ResponseHelper.success(c, { message: "API is running." })
);

// ファイル関連エンドポイント
app.get('/files', async (c) => {
    const env = getCloudflareContext().env as CloudflareEnv;
    const fileService = new FileService(env);
    
    const result = await fileService.getAllFiles();
    return ResponseHelper.fromServiceResponse(c, result);
});

app.get('/files/:id', async (c) => {
    const fileId = c.req.param('id');
    const env = getCloudflareContext().env as CloudflareEnv;
    const fileService = new FileService(env);
    
    const result = await fileService.getFileById(fileId);
    return ResponseHelper.fromServiceResponse(c, result);
});

app.post('/upload', async (c) => {
    const formData = await c.req.formData();
    const uploadedFiles = formData.getAll('file');
    const expirationDays = formData.get('expiration');
    
    if (!uploadedFiles || uploadedFiles.length === 0) {
        return ResponseHelper.validationError(c, 'files', 'No files uploaded');
    }

    const env = getCloudflareContext().env as CloudflareEnv;
    const fileService = new FileService(env);
    
    const result = await fileService.uploadFiles({
        files: uploadedFiles as File[],
        expirationDays: Number(expirationDays) || 7
    });
    
    return ResponseHelper.fromServiceResponse(c, result, 201);
});

app.get('/download/:id', async (c) => {
    const fileId = c.req.param('id');
    const env = getCloudflareContext().env as CloudflareEnv;
    const fileService = new FileService(env);
    
    const result = await fileService.downloadFile(fileId);
    
    if (!result.success || !result.data) {
        return ResponseHelper.fromServiceResponse(c, result);
    }
    
    return ResponseHelper.binaryFile(
        c,
        result.data.buffer,
        result.data.fileName,
        result.data.contentType
    );
})


app.get('/download/:ids/zip', async (c) => {
    const fileIds = c.req.param('ids').split(',');
    const env = getCloudflareContext().env as CloudflareEnv;
    const fileService = new FileService(env);
    
    const result = await fileService.downloadFilesAsZip(fileIds);
    
    if (!result.success || !result.data) {
        return ResponseHelper.fromServiceResponse(c, result);
    }
    
    return ResponseHelper.binaryFile(
        c,
        result.data.buffer,
        result.data.fileName,
        result.data.contentType
    );
})

// 天気関連エンドポイント
app.get('/weather/:city', async (c) => {
    const city = c.req.param('city');
    const clearCache = c.req.query('clear') === 'true';
    
    const env = getCloudflareContext().env as CloudflareEnv;
    const weatherService = new WeatherService(env);
    
    const result = await weatherService.getWeather(city, clearCache);
    return ResponseHelper.fromServiceResponse(c, result);
})

// AutoRAG エンドポイント
app.post('/autorag/search', async (c) => {
    const { query } = await c.req.json();
    
    if (!query) {
        return ResponseHelper.validationError(c, 'query', 'Query is required');
    }
    
    const env = getCloudflareContext().env as CloudflareEnv;
    
    try {
        const result = await env.AI.autorag("first-auto-rag").aiSearch({
            query: query,
        });
        
        console.log('AutoRAG result structure:', result);
        
        // Extract the actual answer from the result object
        let answer = "回答を取得できませんでした";
        if (result && typeof result === 'object') {
            // Try different possible keys for the answer
            answer = result.response || result.data || result.answer || JSON.stringify(result);
        } else if (typeof result === 'string') {
            answer = result;
        }
        
        return ResponseHelper.success(c, { 
            query: query,
            answer: answer
        });
    } catch (error) {
        console.error('AutoRAG search error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return ResponseHelper.error(c, `AutoRAG search failed: ${errorMessage}`, 500);
    }
});


// テキストをチャンク化してR2に保存（AutoRAG用）
app.post('/autorag/add-text', async (c) => {
    try {
        const { question, answer } = await c.req.json();
        
        if (!question || !answer) {
            return ResponseHelper.validationError(c, 'question_answer', 'Both question and answer are required');
        }
        
        const env = getCloudflareContext().env as CloudflareEnv;
        
        // 質問と回答をペアにしてテキストを構成（AutoRAGが参照できるように構造化）
        const qaText = `質問: ${question}
            回答: ${answer}

            ---
            メタ情報:
            - 作成日時: ${new Date().toISOString()}
            - 分類: ユーザー登録Q&A
            - ソース: user-qa-input`;
        
        // テキストをチャンク化（適切なサイズに分割）
        const chunks = chunkText(qaText, 1500); // より大きなチャンクサイズでコンテキストを保持
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const baseFileName = `qa-${question.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}`;
        
        const uploadedFiles = [];
        
        for (let i = 0; i < chunks.length; i++) {
            const fileName = `${baseFileName}-${timestamp}-chunk-${i + 1}.txt`;
            
            // ファイル内容に質問・回答・メタデータを全て含める
            const fileContent = chunks[i] + (chunks.length > 1 ? `\n\n[チャンク ${i + 1}/${chunks.length}]` : '');
            
            await env.AUTO_RAG_R2.put(fileName, fileContent, {
                httpMetadata: {
                    contentType: 'text/plain; charset=utf-8',
                },
                customMetadata: {
                    source: 'user-qa-input',
                    chunkIndex: String(i + 1),
                    totalChunks: String(chunks.length),
                    uploadedAt: new Date().toISOString(),
                }
            });
            
            uploadedFiles.push(fileName);
        }
        
        return ResponseHelper.success(c, {
            message: 'Question-Answer pair uploaded and chunked successfully',
            question: question,
            answer: answer,
            chunks: chunks.length,
            files: uploadedFiles,
            uploadedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Q&A upload error:', error);
        return ResponseHelper.error(c, `Failed to upload Q&A: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
});

// テキストチャンク化関数（Q&A形式に最適化）
function chunkText(text: string, maxChunkSize: number): string[] {
    const chunks: string[] = [];
    
    // Q&A形式の場合、質問と回答を分離して処理
    if (text.includes('質問:') && text.includes('回答:')) {
        const questionMatch = text.match(/質問:\s*([\s\S]*?)(?=\n\n回答:)/);
        const answerMatch = text.match(/回答:\s*([\s\S]*?)(?=\n\n---|\n\n質問:|$)/);
        const metaMatch = text.match(/---\n([\s\S]*?)$/);
        
        if (questionMatch && answerMatch) {
            const question = questionMatch[1].trim();
            const answer = answerMatch[1].trim();
            const meta = metaMatch ? metaMatch[1].trim() : '';
            
            // 質問＋回答＋メタ情報が最大サイズ以下の場合は分割しない
            if (text.length <= maxChunkSize) {
                return [text];
            }
            
            // 質問は常に含める、回答を分割
            const answerChunks = splitLongText(answer, maxChunkSize - question.length - 200); // 質問とフォーマット分を差し引く
            
            for (let i = 0; i < answerChunks.length; i++) {
                const chunk = `質問: ${question}

回答: ${answerChunks[i]}

${meta}`;
                chunks.push(chunk);
            }
        } else {
            // フォールバック：通常の分割
            return splitLongText(text, maxChunkSize);
        }
    } else {
        // 通常のテキスト分割
        return splitLongText(text, maxChunkSize);
    }
    
    return chunks.filter(chunk => chunk.length > 0);
}

// 長いテキストを分割するヘルパー関数
function splitLongText(text: string, maxChunkSize: number): string[] {
    const chunks: string[] = [];
    const paragraphs = text.split('\n\n');
    
    let currentChunk = '';
    
    for (const paragraph of paragraphs) {
        // 段落が最大サイズを超える場合は文で分割
        if (paragraph.length > maxChunkSize) {
            if (currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = '';
            }
            
            const sentences = paragraph.split(/[.!?。！？]\s+/);
            for (const sentence of sentences) {
                if (currentChunk.length + sentence.length > maxChunkSize) {
                    if (currentChunk) {
                        chunks.push(currentChunk.trim());
                        currentChunk = sentence;
                    } else {
                        // 非常に長い文は強制的に分割
                        const words = sentence.split(' ');
                        let wordChunk = '';
                        for (const word of words) {
                            if (wordChunk.length + word.length > maxChunkSize) {
                                if (wordChunk) chunks.push(wordChunk.trim());
                                wordChunk = word;
                            } else {
                                wordChunk += (wordChunk ? ' ' : '') + word;
                            }
                        }
                        if (wordChunk) currentChunk = wordChunk;
                    }
                } else {
                    currentChunk += (currentChunk ? '. ' : '') + sentence;
                }
            }
        } else {
            // 現在のチャンクに段落を追加できるかチェック
            if (currentChunk.length + paragraph.length > maxChunkSize) {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                    currentChunk = paragraph;
                }
            } else {
                currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
            }
        }
    }
    
    if (currentChunk) {
        chunks.push(currentChunk.trim());
    }
    
    return chunks.filter(chunk => chunk.length > 0);
}

export const GET = handle(app);
export const POST = handle(app);