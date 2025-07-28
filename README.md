# File Share App

Cloudflare Workers上で動作するNext.js 14ベースのファイル共有アプリケーションです。

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **ランタイム**: Cloudflare Workers/Pages
- **データベース**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **国際化**: next-intl (日本語/英語)
- **スタイリング**: Tailwind CSS + Shadcn/ui
- **テスト**: Vitest + Playwright

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```bash
# Cloudflare設定
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_D1_DATABASE_ID=your_database_id
CLOUDFLARE_D1_TOKEN=your_d1_token
```

### 3. データベースのセットアップ

```bash
# D1データベースの作成
npx wrangler d1 create file-share-app

# マイグレーションファイルの生成
npm run db:generate

# ローカルデータベースにマイグレーション実行
npx wrangler d1 execute file-share-app --local --file=./drizzle/0000_eminent_goliath.sql

# 本番データベースにマイグレーション実行（必要に応じて）


```

### 4. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)でアプリケーションにアクセスできます。

## 開発コマンド

```bash
# 開発サーバー
npm run dev

# ビルド
npm run build

# Cloudflareへのデプロイ
npm run deploy

# プレビュー
npm run preview

# コード品質
npm run lint

# データベース
npm run db:generate  # マイグレーション生成
npm run db:migrate   # マイグレーション実行
npm run db:studio    # Drizzle Studio起動

# テスト
npm test             # ユニットテスト
npm run test:watch   # テスト監視モード
npm run test:coverage # カバレッジ付きテスト
npm run test:e2e     # E2Eテスト
npm run test:all     # 全テスト実行

# Cloudflare型生成
npm run cf-typegen
```

## プロジェクト構造

```
app/[locale]/          # 国際化対応のページ
├── layout.tsx         # ルートレイアウト
└── page.tsx          # メインページ

components/            # Reactコンポーネント
├── ui/               # Shadcn/ui基本コンポーネント
├── language-switcher.tsx
└── theme-toggle.tsx

db/
└── schema.ts         # データベーススキーマ

i18n-intl/            # 国際化設定
├── i18n.ts          # next-intl設定
└── languages/       # 翻訳ファイル

drizzle/              # データベースマイグレーション
test/                 # ユニット・統合テスト
e2e/                  # E2Eテスト
```

## データベース

Drizzle ORMとCloudflare D1を使用したSQLiteデータベース。

### Filesテーブル
- `id`: UUID（主キー）
- `name`: ファイル名
- `path`: ファイルパス
- `size`: ファイルサイズ
- `type`: ファイルタイプ
- `createdAt`: 作成日時
- `updatedAt`: 更新日時

## 国際化

- 対応言語: 日本語（デフォルト）、英語
- すべてのルートは言語プレフィックス付き: `/ja/...` または `/en/...`
- ミドルウェアが言語検出とルーティングを処理

## デプロイ

### Cloudflareへのデプロイ

```bash
# ビルドとデプロイ
npm run deploy

# プレビュー
npm run preview
```

### 環境設定

1. Cloudflareアカウントの作成
2. D1データベースの作成と設定
3. 環境変数の設定
4. Wranglerでの認証設定

## テスト

- **ユニットテスト**: Vitest + Testing Library
- **E2Eテスト**: Playwright（複数ブラウザ対応）
- **カバレッジ目標**: 95%
- **CI/CD**: GitHub Actionsでの自動テスト実行

## 開発のヒント

- TypeScript設定は`@/*`エイリアスでルートディレクトリを参照
- Tailwind CSSでスタイリング
- Shadcn/uiコンポーネントを活用
- データベース変更時は必ずマイグレーション生成
- テストファイルはアプリ構造をミラーリング
