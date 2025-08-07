import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dropzone } from "@/components/dropzone";
import { WeatherDemo } from "@/components/weather-demo";
import { AutoRAGDemo } from "@/components/autorag-demo";

export default function Home() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-8 mt-8">
        

      
        {/* AutoRAG Demo - Intelligent Search System */}
        <AutoRAGDemo />

        {/* Weather Demo - Cloudflare KV Cache */}
        <div className="flex flex-col sm:flex-row gap-6 mt-12">
        <div className="w-full sm:w-1/3">
          <WeatherDemo />
        </div>
        <div className="w-full sm:w-2/3">
         <Card>
          <CardHeader>
            <CardTitle>
              {t('upload.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dropzone />
          </CardContent>
         </Card>
        </div>
        </div>
      </div>
    </div>
  );
}
