import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils/test-utils'
import Home from '@/app/[locale]/page'
import { createMockTranslationFunction } from '@/test/factories/translations.factory'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => createMockTranslationFunction('en')
}))

// Mock components
vi.mock('@/components/theme-toggle', () => ({
  default: () => <div data-testid="theme-toggle">Theme Toggle</div>
}))

describe('Home Page', () => {
  it('renders page header correctly', () => {
    render(<Home />)
    
    expect(screen.getByText('File Share App')).toBeInTheDocument()
    expect(screen.getByText('A secure and fast file sharing platform. A modern web application built with Next.js 14 and Cloudflare.')).toBeInTheDocument()
  })

  it('displays Next.js logo', () => {
    render(<Home />)
    
    const logo = screen.getByAltText('Next.js logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', '/next.svg')
    expect(logo).toHaveAttribute('width', '180')
    expect(logo).toHaveAttribute('height', '38')
  })

  it('renders all feature cards', () => {
    render(<Home />)
    
    // File Sharing feature
    expect(screen.getByText('File Sharing')).toBeInTheDocument()
    expect(screen.getByText('Easy and secure file upload and sharing functionality')).toBeInTheDocument()
    expect(screen.getByText('Secure')).toBeInTheDocument()
    
    // Fast Delivery feature
    expect(screen.getByText('Fast Delivery')).toBeInTheDocument()
    expect(screen.getByText('High-speed delivery through Cloudflare\'s edge network')).toBeInTheDocument()
    expect(screen.getByText('Fast')).toBeInTheDocument()
    
    // Global feature
    expect(screen.getByText('Global')).toBeInTheDocument()
    expect(screen.getByText('Accessible from anywhere in the world')).toBeInTheDocument()
    expect(screen.getByText('Global')).toBeInTheDocument()
  })

  it('displays action buttons', () => {
    render(<Home />)
    
    expect(screen.getByText('Deploy')).toBeInTheDocument()
    expect(screen.getByText('Read Documentation')).toBeInTheDocument()
  })

  it('shows developer information section', () => {
    render(<Home />)
    
    expect(screen.getByText('Developer Information')).toBeInTheDocument()
    expect(screen.getByText('This project is built with the following tech stack:')).toBeInTheDocument()
    
    // Tech stack badges
    expect(screen.getByText('Next.js 14')).toBeInTheDocument()
    expect(screen.getByText('React 18')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Tailwind CSS')).toBeInTheDocument()
    expect(screen.getByText('Shadcn/ui')).toBeInTheDocument()
    expect(screen.getByText('Cloudflare')).toBeInTheDocument()
  })

  it('displays getting started instructions', () => {
    render(<Home />)
    
    expect(screen.getByText('To get started with development:')).toBeInTheDocument()
    expect(screen.getByText('app/page.tsx')).toBeInTheDocument()
    expect(screen.getByText('Edit the file')).toBeInTheDocument()
    expect(screen.getByText('Changes will be reflected immediately upon saving')).toBeInTheDocument()
  })

  it('renders footer with correct links', () => {
    render(<Home />)
    
    const learnLink = screen.getByRole('link', { name: /Learn/i })
    expect(learnLink).toHaveAttribute('href', 'https://nextjs.org/learn')
    expect(learnLink).toHaveAttribute('target', '_blank')
    expect(learnLink).toHaveAttribute('rel', 'noopener noreferrer')
    
    const templatesLink = screen.getByRole('link', { name: /Templates/i })
    expect(templatesLink).toHaveAttribute('href', 'https://vercel.com/templates')
    
    const nextjsLink = screen.getByRole('link', { name: /Next.js →/i })
    expect(nextjsLink).toHaveAttribute('href', 'https://nextjs.org')
  })

  it('includes theme toggle component', () => {
    render(<Home />)
    
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
  })

  it('has proper semantic structure', () => {
    render(<Home />)
    
    expect(screen.getByRole('banner')).toBeInTheDocument() // header
    expect(screen.getByRole('contentinfo')).toBeInTheDocument() // footer
    expect(screen.getByRole('main') || screen.getByRole('region')).toBeInTheDocument() // main content
  })

  it('displays correct number of feature cards', () => {
    render(<Home />)
    
    const cards = screen.getAllByRole('article') || document.querySelectorAll('[class*="card"]')
    expect(cards.length).toBeGreaterThanOrEqual(3) // At least 3 feature cards
  })

  it('shows Lucide icons correctly', () => {
    render(<Home />)
    
    // Icons should be present (testing for SVG elements)
    const svgElements = document.querySelectorAll('svg')
    expect(svgElements.length).toBeGreaterThan(0)
  })

  it('applies correct CSS classes for responsive design', () => {
    render(<Home />)
    
    const container = document.querySelector('.container')
    expect(container).toBeInTheDocument()
    
    const gridContainer = document.querySelector('.grid')
    expect(gridContainer).toBeInTheDocument()
  })

  it('renders with Japanese translations', () => {
    // Mock Japanese translations
    vi.mocked(require('next-intl').useTranslations).mockReturnValue(
      createMockTranslationFunction('ja')
    )
    
    render(<Home />)
    
    expect(screen.getByText('安全で高速なファイル共有プラットフォーム。Next.js 14とCloudflareで構築されたモダンなWebアプリケーションです。')).toBeInTheDocument()
    expect(screen.getByText('ファイル共有')).toBeInTheDocument()
    expect(screen.getByText('高速配信')).toBeInTheDocument()
    expect(screen.getByText('グローバル')).toBeInTheDocument()
  })

  it('handles button interactions correctly', () => {
    render(<Home />)
    
    const deployButton = screen.getByText('Deploy')
    const docsButton = screen.getByText('Read Documentation')
    
    expect(deployButton).toBeInTheDocument()
    expect(docsButton).toBeInTheDocument()
    
    // Buttons should be clickable
    expect(deployButton.closest('button')).toBeInTheDocument()
    expect(docsButton.closest('button')).toBeInTheDocument()
  })
})