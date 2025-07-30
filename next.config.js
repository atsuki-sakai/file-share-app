const withNextIntl = require('next-intl/plugin')(
  './i18n-intl/i18n.ts'
);

module.exports = withNextIntl((async () => {
  // 開発環境でのOpenNext初期化
  if (process.env.NODE_ENV === 'development') {
    try {
      const { initOpenNextCloudflareForDev } = await import('@opennextjs/cloudflare');
      initOpenNextCloudflareForDev();
    } catch (error) {
      console.error('OpenNext initialization error:', error);
    }
  }
  
  return {
    // Next.js 15との互換性を確保
    output: 'standalone',
    // 実験的機能の有効化
    experimental: {
      // サーバーコンポーネントの最適化
      serverComponentsExternalPackages: [],
      // 静的アセットの最適化
      optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
    },
    // OpenNext互換性のためのルートマニフェスト生成を強制
    generateBuildId: async () => {
      return 'opennext-build-' + Date.now();
    },
    // 画像設定
    images: {
      domains: ['images.unsplash.com'],
      // Cloudflareでの画像最適化
      unoptimized: process.env.NODE_ENV === 'production',
    },
    // ビルド設定の最適化
    swcMinify: true,
    // 型チェックの無効化（ビルド時間短縮）
    typescript: {
      ignoreBuildErrors: false,
    },
    // ESLintの無効化（ビルド時間短縮）
    eslint: {
      ignoreDuringBuilds: true,
    },
  };
})());