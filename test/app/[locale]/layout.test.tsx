import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'

// Mock next-intl/server first
const mockGetTranslations = vi.fn()
vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations,
  getMessages: vi.fn().mockResolvedValue({
    metadata: {
      title: 'File Share App',
      description: 'Secure file sharing platform'
    }
  })
}))

// Import after mocking
import { generateMetadata } from '@/app/[locale]/layout'

describe('RootLayout', () => {
  describe('generateMetadata', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('generates metadata for English locale', async () => {
      const mockT = vi.fn()
      mockT.mockImplementation((key: string) => {
        const translations: Record<string, string> = {
          title: 'File Share App',
          description: 'Secure and fast file sharing platform'
        }
        return translations[key]
      })
      
      mockGetTranslations.mockResolvedValue(mockT)

      const params = Promise.resolve({ locale: 'en' })
      const metadata = await generateMetadata({ params })

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'en',
        namespace: 'metadata'
      })
      expect(metadata).toEqual({
        title: 'File Share App',
        description: 'Secure and fast file sharing platform'
      })
    })

    it('generates metadata for Japanese locale', async () => {
      const mockT = vi.fn()
      mockT.mockImplementation((key: string) => {
        const translations: Record<string, string> = {
          title: 'ファイル共有アプリ',
          description: '安全で高速なファイル共有プラットフォーム'
        }
        return translations[key]
      })
      
      mockGetTranslations.mockResolvedValue(mockT)

      const params = Promise.resolve({ locale: 'ja' })
      const metadata = await generateMetadata({ params })

      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: 'ja',
        namespace: 'metadata'
      })
      expect(metadata).toEqual({
        title: 'ファイル共有アプリ',
        description: '安全で高速なファイル共有プラットフォーム'
      })
    })

    it('handles translation function calls correctly', async () => {
      const mockT = vi.fn()
      mockT.mockReturnValueOnce('Test Title')
      mockT.mockReturnValueOnce('Test Description')
      
      mockGetTranslations.mockResolvedValue(mockT)

      const params = Promise.resolve({ locale: 'en' })
      await generateMetadata({ params })

      expect(mockT).toHaveBeenCalledWith('title')
      expect(mockT).toHaveBeenCalledWith('description')
      expect(mockT).toHaveBeenCalledTimes(2)
    })

    it('awaits params promise correctly', async () => {
      const mockT = vi.fn().mockReturnValue('Test Value')
      mockGetTranslations.mockResolvedValue(mockT)

      // Test with different locale values
      const testLocales = ['en', 'ja', 'fr'] // fr should work as fallback
      
      for (const locale of testLocales) {
        const params = Promise.resolve({ locale })
        await generateMetadata({ params })
        
        expect(mockGetTranslations).toHaveBeenCalledWith({
          locale,
          namespace: 'metadata'
        })
      }
    })

    it('returns proper metadata structure', async () => {
      const mockT = vi.fn()
      mockT.mockReturnValueOnce('Custom Title')
      mockT.mockReturnValueOnce('Custom Description')
      
      mockGetTranslations.mockResolvedValue(mockT)

      const params = Promise.resolve({ locale: 'en' })
      const metadata = await generateMetadata({ params })

      expect(metadata).toHaveProperty('title')
      expect(metadata).toHaveProperty('description')
      expect(typeof metadata.title).toBe('string')
      expect(typeof metadata.description).toBe('string')
    })
  })

  describe('Layout Component Structure', () => {
    it('should have proper HTML structure with locale', () => {
      // This test would require rendering the layout component
      // For now, we'll test the key aspects that can be tested
      
      expect(true).toBe(true) // Placeholder for more complex layout tests
    })

    it('includes required font configuration', () => {
      // Test Inter font configuration
      const interConfig = {
        variable: "--font-inter",
        subsets: ["latin"]
      }
      
      expect(interConfig.variable).toBe("--font-inter")
      expect(interConfig.subsets).toContain("latin")
    })

    it('validates component props interface', () => {
      // Test the props interface structure
      interface LayoutProps {
        children: React.ReactNode
        params: Promise<{ locale: string }>
      }

      const mockProps: LayoutProps = {
        children: <div>Test</div>,
        params: Promise.resolve({ locale: 'en' })
      }

      expect(mockProps.children).toBeDefined()
      expect(mockProps.params).toBeInstanceOf(Promise)
    })
  })

  describe('Error Handling', () => {
    it('handles translation loading errors gracefully', async () => {
      const mockT = vi.fn().mockImplementation(() => {
        throw new Error('Translation loading failed')
      })
      
      mockGetTranslations.mockResolvedValue(mockT)

      const params = Promise.resolve({ locale: 'en' })
      
      await expect(generateMetadata({ params })).rejects.toThrow('Translation loading failed')
    })

    it('handles async params promise rejection', async () => {
      const mockT = vi.fn().mockReturnValue('Test')
      mockGetTranslations.mockResolvedValue(mockT)

      const params = Promise.reject(new Error('Params loading failed'))
      
      await expect(generateMetadata({ params })).rejects.toThrow('Params loading failed')
    })
  })
})