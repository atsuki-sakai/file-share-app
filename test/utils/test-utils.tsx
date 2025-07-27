import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { vi } from 'vitest'

// Mock next-intl provider for testing
const MockNextIntlProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

// Custom render function with providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper = ({ children }: { children?: React.ReactNode }) => {
    return <MockNextIntlProvider>{children}</MockNextIntlProvider>
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

// Mock router utilities
export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn()
}


// Utility to wait for next tick
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0))

// Mock component props factory
export const createMockComponentProps = <T extends Record<string, unknown>>(
  overrides: Partial<T> = {}
): T => {
  return {
    className: '',
    'data-testid': 'mock-component',
    ...overrides
  } as unknown as T
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { customRender as render }