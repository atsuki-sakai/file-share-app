import { faker } from '@faker-js/faker'

export interface TranslationData {
  metadata: {
    title: string
    description: string
  }
  header: {
    title: string
    subtitle: string
  }
  features: {
    fileSharing: {
      title: string
      description: string
      badge: string
    }
    fastDelivery: {
      title: string
      description: string
      badge: string
    }
    global: {
      title: string
      description: string
      badge: string
    }
  }
  actions: {
    deploy: string
    readDocs: string
  }
  developer: {
    title: string
    techStack: string
    getStarted: string
    editFile: string
    autoReload: string
  }
  footer: {
    learn: string
    templates: string
    nextjs: string
  }
  language: {
    switch: string
    japanese: string
    english: string
  }
}

export const createTranslationData = (locale: 'ja' | 'en' = 'en'): TranslationData => {
  if (locale === 'ja') {
    return {
      metadata: {
        title: 'ファイル共有アプリ',
        description: '安全で高速なファイル共有プラットフォーム'
      },
      header: {
        title: 'File Share App',
        subtitle: '安全で高速なファイル共有プラットフォーム。Next.js 14とCloudflareで構築されたモダンなWebアプリケーションです。'
      },
      features: {
        fileSharing: {
          title: 'ファイル共有',
          description: '簡単で安全なファイルアップロードと共有機能',
          badge: 'セキュア'
        },
        fastDelivery: {
          title: '高速配信',
          description: 'Cloudflareのエッジネットワークによる高速配信',
          badge: '高速'
        },
        global: {
          title: 'グローバル',
          description: '世界中どこからでもアクセス可能',
          badge: 'グローバル'
        }
      },
      actions: {
        deploy: 'デプロイする',
        readDocs: 'ドキュメントを読む'
      },
      developer: {
        title: '開発者向け情報',
        techStack: 'このプロジェクトは以下の技術スタックで構築されています：',
        getStarted: '開発を始めるには：',
        editFile: 'を編集してください',
        autoReload: '変更を保存すると即座に反映されます'
      },
      footer: {
        learn: '学習する',
        templates: 'テンプレート',
        nextjs: 'Next.js →'
      },
      language: {
        switch: '言語を切り替える',
        japanese: '日本語',
        english: 'English'
      }
    }
  }

  return {
    metadata: {
      title: 'File Share App',
      description: 'Secure and fast file sharing platform'
    },
    header: {
      title: 'File Share App',
      subtitle: 'A secure and fast file sharing platform. A modern web application built with Next.js 14 and Cloudflare.'
    },
    features: {
      fileSharing: {
        title: 'File Sharing',
        description: 'Easy and secure file upload and sharing functionality',
        badge: 'Secure'
      },
      fastDelivery: {
        title: 'Fast Delivery',
        description: 'High-speed delivery through Cloudflare\'s edge network',
        badge: 'Fast'
      },
      global: {
        title: 'Global',
        description: 'Accessible from anywhere in the world',
        badge: 'Global'
      }
    },
    actions: {
      deploy: 'Deploy',
      readDocs: 'Read Documentation'
    },
    developer: {
      title: 'Developer Information',
      techStack: 'This project is built with the following tech stack:',
      getStarted: 'To get started with development:',
      editFile: 'Edit the file',
      autoReload: 'Changes will be reflected immediately upon saving'
    },
    footer: {
      learn: 'Learn',
      templates: 'Templates',
      nextjs: 'Next.js →'
    },
    language: {
      switch: 'Switch Language',
      japanese: '日本語',
      english: 'English'
    }
  }
}

export const createMockTranslationFunction = (locale: 'ja' | 'en' = 'en') => {
  const data = createTranslationData(locale)
  
  return (key: string) => {
    const keys = key.split('.')
    let value: any = data
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || key
  }
}