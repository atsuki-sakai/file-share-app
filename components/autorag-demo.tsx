'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Upload, Search, Loader2, MessageSquare, FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AutoRAGUploadResponse, AutoRAGSearchResponse } from '@/types/services';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AutoRAGDemo() {
  const t = useTranslations();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [metadata, setMetadata] = useState('');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isComposing, setIsComposing] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);

  const handleUploadQA = async () => {
    if (!question.trim() || !answer.trim()) return;

    setIsUploading(true);
    setUploadStatus('');

    try {
      const response = await fetch('/api/autorag/add-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          answer: answer.trim(),
          metadata: metadata.trim() || undefined,
        }),
      });

      const result = await response.json() as AutoRAGUploadResponse;

      if (result.success && result.data) {
        setUploadStatus(`✅ 質問と回答のペアを${result.data.chunks}個のチャンクとしてアップロード完了`);
        setQuestion('');
        setAnswer('');
        setMetadata('');
      } else {
        setUploadStatus(`❌ アップロードエラー: ${result.error || '不明なエラー'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(`❌ ネットワークエラー: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsUploading(false);
    }
  };

  const parseCsvData = (csvText: string): Array<{ question: string; answer: string; metadata?: string }> => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('CSVファイルが不正です（ヘッダー行とデータ行が必要）');
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data: Array<{ question: string; answer: string; metadata?: string }> = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length < 2) continue;
      
      const questionIndex = headers.findIndex(h => h.toLowerCase().includes('question') || h.toLowerCase().includes('質問'));
      const answerIndex = headers.findIndex(h => h.toLowerCase().includes('answer') || h.toLowerCase().includes('回答'));
      const metadataIndex = headers.findIndex(h => h.toLowerCase().includes('metadata') || h.toLowerCase().includes('メタ'));
      
      if (questionIndex === -1 || answerIndex === -1) {
        throw new Error('CSVファイルに"question"と"answer"列が見つかりません');
      }
      
      data.push({
        question: values[questionIndex] || '',
        answer: values[answerIndex] || '',
        metadata: metadataIndex >= 0 ? values[metadataIndex] : undefined,
      });
    }
    
    return data;
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;

    setIsUploadingCsv(true);
    setUploadStatus('');

    try {
      const csvText = await csvFile.text();
      const qaData = parseCsvData(csvText);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const item of qaData) {
        if (!item.question.trim() || !item.answer.trim()) continue;
        
        try {
          const response = await fetch('/api/autorag/add-text', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              question: item.question.trim(),
              answer: item.answer.trim(),
              metadata: item.metadata?.trim() || undefined,
            }),
          });

          const result = await response.json() as AutoRAGUploadResponse;
          
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch {
          errorCount++;
        }
      }
      
      setUploadStatus(`✅ CSVアップロード完了: ${successCount}件成功, ${errorCount}件エラー`);
      setCsvFile(null);
      
    } catch (error) {
      console.error('CSV upload error:', error);
      setUploadStatus(`❌ CSVアップロードエラー: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsUploadingCsv(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsSearching(true);

    try {
      const response = await fetch('/api/autorag/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      const result = await response.json() as AutoRAGSearchResponse;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.success && result.data
          ? result.data.answer 
          : `エラー: ${result.error || '不明なエラー'}`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setQuery('');
    } catch (error) {
      console.error('Search error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `ネットワークエラー: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* テキスト入力・アップロード部分 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>{t('autorag.upload.title')}</CardTitle>
          </div>
          <CardDescription>
            {t('autorag.upload.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="question" className="text-sm font-medium">
              {t('autorag.upload.questionLabel')} <span className="text-red-500">*</span>
            </label>
            <Input
              id="question"
              placeholder={t('autorag.upload.titlePlaceholder')}
              value={question}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestion(e.target.value)}
              disabled={isUploading}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="answer" className="text-sm font-medium">
              {t('autorag.upload.answerLabel')} <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="answer"
              placeholder={t('autorag.upload.textPlaceholder')}
              value={answer}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAnswer(e.target.value)}
              disabled={isUploading}
              rows={6}
              className="min-h-[150px]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="metadata" className="text-sm font-medium">
              メタ情報 <span className="text-muted-foreground">(任意)</span>
            </label>
            <Input
              id="metadata"
              placeholder="カテゴリ、タグ、その他の情報"
              value={metadata}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMetadata(e.target.value)}
              disabled={isUploading}
            />
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleUploadQA}
              disabled={!question.trim() || !answer.trim() || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('autorag.upload.uploading')}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {t('autorag.upload.button')}
                </>
              )}
            </Button>

            <div className="border-t pt-3">
              <div className="text-sm font-medium mb-2">またはCSVファイルをアップロード</div>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  disabled={isUploadingCsv}
                  className="flex-1"
                />
                <Button
                  onClick={handleCsvUpload}
                  disabled={!csvFile || isUploadingCsv}
                  variant="outline"
                >
                  {isUploadingCsv ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                CSVフォーマット: question, answer, metadata（オプション）
              </div>
            </div>
          </div>

          {uploadStatus && (
            <div className="p-3 rounded-md bg-muted">
              <p className="text-sm">{uploadStatus}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AutoRAG検索・チャット部分 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <CardTitle>{t('autorag.search.title')}</CardTitle>
          </div>
          <CardDescription>
            {t('autorag.search.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* メッセージ履歴 */}
          <div className="h-64 overflow-y-auto space-y-3 p-3 border rounded-md bg-muted/20">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <MessageSquare className="mr-2 h-4 w-4" />
                {t('autorag.search.empty')}
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isSearching && (
              <div className="flex justify-start">
                <div className="bg-background border p-3 rounded-lg">
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="text-sm">{t('autorag.search.searching')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 検索入力 */}
          <div className="flex gap-2">
            <Textarea
              placeholder={t('autorag.search.placeholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              disabled={isSearching}
              rows={2}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={!query.trim() || isSearching}
              size="sm"
              className="h-auto"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              {t('autorag.search.shortcuts.send')}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {t('autorag.search.shortcuts.newline')}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
