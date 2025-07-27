import '@testing-library/jest-dom'
import { vi } from 'vitest'
import createFetchMock from 'vitest-fetch-mock'
import React from 'react'

const fetchMocker = createFetchMock(vi)
fetchMocker.enableMocks()

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn()
  }),
  usePathname: () => '/ja',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ locale: 'ja' })
}))

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'header.title': 'File Share App',
      'header.subtitle': 'A secure and fast file sharing platform',
      'features.fileSharing.title': 'File Sharing',
      'features.fileSharing.description': 'Easy and secure file upload',
      'features.fileSharing.badge': 'Secure',
      'features.fastDelivery.title': 'Fast Delivery',
      'features.fastDelivery.description': 'High-speed delivery',
      'features.fastDelivery.badge': 'Fast',
      'features.global.title': 'Global',
      'features.global.description': 'Accessible worldwide',
      'features.global.badge': 'Global',
      'actions.deploy': 'Deploy',
      'actions.readDocs': 'Read Documentation',
      'developer.title': 'Developer Information',
      'developer.techStack': 'Tech stack:',
      'developer.getStarted': 'Get started:',
      'developer.editFile': 'Edit file',
      'developer.autoReload': 'Auto reload',
      'footer.learn': 'Learn',
      'footer.templates': 'Templates',
      'footer.nextjs': 'Next.js →',
      'language.switch': 'Switch Language',
      'language.japanese': '日本語',
      'language.english': 'English'
    }
    return translations[key] || key
  },
  useLocale: () => 'ja',
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children
}))

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => {
    const translations: Record<string, string> = {
      'metadata.title': 'File Share App',
      'metadata.description': 'Secure file sharing platform'
    }
    return translations[key] || key
  }),
  getMessages: vi.fn().mockResolvedValue({
    metadata: {
      title: 'File Share App',
      description: 'Secure file sharing platform'
    }
  })
}))


// Global test environment setup
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})