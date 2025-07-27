import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils'
import userEvent from '@testing-library/user-event'
import LanguageSwitcher from '@/components/language-switcher'

// Mock next/navigation
const mockPush = vi.fn()
const mockPathname = '/ja/some-path'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn()
  }),
  usePathname: () => mockPathname
}))

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'language.switch': 'Switch Language',
      'language.japanese': '日本語',
      'language.english': 'English'
    }
    return translations[key] || key
  },
  useLocale: () => 'ja'
}))

describe('LanguageSwitcher', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with Japanese locale', () => {
    render(<LanguageSwitcher />)
    
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('🇯🇵')).toBeInTheDocument()
    expect(screen.getByText('日本語')).toBeInTheDocument()
  })

  it('displays Globe icon', () => {
    render(<LanguageSwitcher />)
    
    const globeIcon = document.querySelector('svg.lucide-globe')
    expect(globeIcon).toBeInTheDocument()
  })

  it('opens dropdown when clicked', async () => {
    render(<LanguageSwitcher />)
    
    const trigger = screen.getByRole('combobox')
    await user.click(trigger)
    
    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument()
    })
  })

  it('changes language when option is selected', async () => {
    render(<LanguageSwitcher />)
    
    const trigger = screen.getByRole('combobox')
    await user.click(trigger)
    
    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument()
    })
    
    const englishOption = screen.getByText('English')
    await user.click(englishOption)
    
    expect(mockPush).toHaveBeenCalledWith('/en/some-path')
  })

  it('handles path without current locale correctly', async () => {
    // Mock pathname without locale
    vi.mocked(require('next/navigation').usePathname).mockReturnValue('/some-path')
    
    render(<LanguageSwitcher />)
    
    const trigger = screen.getByRole('combobox')
    await user.click(trigger)
    
    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument()
    })
    
    const englishOption = screen.getByText('English')
    await user.click(englishOption)
    
    expect(mockPush).toHaveBeenCalledWith('/en/some-path')
  })

  it('shows correct flags for each language option', async () => {
    render(<LanguageSwitcher />)
    
    const trigger = screen.getByRole('combobox')
    await user.click(trigger)
    
    await waitFor(() => {
      expect(screen.getAllByText('🇯🇵')).toHaveLength(2) // One in trigger, one in dropdown
      expect(screen.getByText('🇺🇸')).toBeInTheDocument()
    })
  })

  it('maintains responsive behavior on mobile', () => {
    render(<LanguageSwitcher />)
    
    // Check that language label has responsive classes
    const japaneseLabelElements = screen.getAllByText('日本語')
    const visibleLabel = japaneseLabelElements.find(el => 
      el.className.includes('sm:inline')
    )
    expect(visibleLabel).toBeInTheDocument()
  })

  it('handles keyboard navigation', async () => {
    render(<LanguageSwitcher />)
    
    const trigger = screen.getByRole('combobox')
    trigger.focus()
    
    // Press Enter to open dropdown
    fireEvent.keyDown(trigger, { key: 'Enter', code: 'Enter' })
    
    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument()
    })
  })

  it('calls router.push with correct path format', async () => {
    // Test various pathname scenarios
    const testCases = [
      { pathname: '/ja', expectedPath: '/en' },
      { pathname: '/ja/', expectedPath: '/en/' },
      { pathname: '/ja/about', expectedPath: '/en/about' },
      { pathname: '/ja/products/123', expectedPath: '/en/products/123' }
    ]

    for (const testCase of testCases) {
      vi.mocked(require('next/navigation').usePathname).mockReturnValue(testCase.pathname)
      mockPush.mockClear()
      
      render(<LanguageSwitcher />)
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      await waitFor(() => {
        expect(screen.getByText('English')).toBeInTheDocument()
      })
      
      const englishOption = screen.getByText('English')
      await user.click(englishOption)
      
      expect(mockPush).toHaveBeenCalledWith(testCase.expectedPath)
    }
  })

  it('preserves accessibility attributes', () => {
    render(<LanguageSwitcher />)
    
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})