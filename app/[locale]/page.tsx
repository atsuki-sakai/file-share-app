import Image from "next/image";
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Globe, ExternalLink, Code } from "lucide-react";
import { Dropzone } from "@/components/dropzone";
import { WeatherDemo } from "@/components/weather-demo";
import { AutoRAGDemo } from "@/components/autorag-demo";

export default function Home() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <header className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="Next.js logo"
              width={180}
              height={38}
              priority
            />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t('header.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('header.subtitle')}
          </p>
        </header>

        {/* 機能カード */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>{t('features.fileSharing.title')}</CardTitle>
              </div>
              <CardDescription>
                {t('features.fileSharing.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{t('features.fileSharing.badge')}</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" />
                <CardTitle>{t('features.fastDelivery.title')}</CardTitle>
              </div>
              <CardDescription>
                {t('features.fastDelivery.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{t('features.fastDelivery.badge')}</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                <CardTitle>{t('features.global.title')}</CardTitle>
              </div>
              <CardDescription>
                {t('features.global.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{t('features.global.badge')}</Badge>
            </CardContent>
          </Card>
        </div> */}

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="group">
            <ExternalLink className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            {t('actions.deploy')}
          </Button>
          <Button variant="outline" size="lg" className="group">
            <Code className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
            {t('actions.readDocs')}
          </Button>
        </div>
        {/* AutoRAG Demo - Intelligent Search System */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('autorag.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t('autorag.subtitle')}
            </p>
          </div>
          <AutoRAGDemo />
        </div>

        {/* Weather Demo - Cloudflare KV Cache */}
        <WeatherDemo />

        <Card className="max-w-2xl mx-auto mt-12">
          <CardHeader>
            <CardTitle>
              {t('upload.title')}
            </CardTitle>
            <CardDescription>
              {t('upload.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dropzone />
          </CardContent>
        </Card>
      </div>


      {/* フッター */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-center text-sm text-muted-foreground">
            <a
              className="flex items-center gap-2 hover:text-foreground transition-colors"
              href="https://nextjs.org/learn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileText className="h-4 w-4" />
              {t('footer.learn')}
            </a>
            <a
              className="flex items-center gap-2 hover:text-foreground transition-colors"
              href="https://vercel.com/templates"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Globe className="h-4 w-4" />
              {t('footer.templates')}
            </a>
            <a
              className="flex items-center gap-2 hover:text-foreground transition-colors"
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              {t('footer.nextjs')}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
