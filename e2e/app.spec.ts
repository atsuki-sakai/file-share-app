import { test, expect } from '@playwright/test'

test.describe('File Share App', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/')
    
    await expect(page).toHaveTitle(/File Share App/)
    await expect(page.getByText('File Share App')).toBeVisible()
    await expect(page.getByText('A secure and fast file sharing platform')).toBeVisible()
  })

  test('displays main features', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.getByText('File Sharing')).toBeVisible()
    await expect(page.getByText('Fast Delivery')).toBeVisible()
    await expect(page.getByText('Global')).toBeVisible()
  })

  test('language switcher works', async ({ page }) => {
    await page.goto('/')
    
    const languageSwitcher = page.getByRole('combobox')
    await expect(languageSwitcher).toBeVisible()
    
    await languageSwitcher.click()
    await expect(page.getByText('English')).toBeVisible()
    
    await page.getByText('English').click()
    await page.waitForURL('**/en/**')
    
    await expect(page.getByText('A secure and fast file sharing platform')).toBeVisible()
  })

  test('theme toggle exists', async ({ page }) => {
    await page.goto('/')
    
    const themeToggle = page.locator('[data-testid="theme-toggle"], button:has(svg)')
    await expect(themeToggle).toBeVisible()
  })

  test('footer links are functional', async ({ page }) => {
    await page.goto('/')
    
    const learnLink = page.getByRole('link', { name: /Learn/i })
    await expect(learnLink).toBeVisible()
    await expect(learnLink).toHaveAttribute('href', 'https://nextjs.org/learn')
    
    const templatesLink = page.getByRole('link', { name: /Templates/i })
    await expect(templatesLink).toBeVisible()
    await expect(templatesLink).toHaveAttribute('href', 'https://vercel.com/templates')
  })

  test('responsive design works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    await expect(page.getByText('File Share App')).toBeVisible()
    await expect(page.getByText('File Sharing')).toBeVisible()
  })

  test('page has proper meta tags', async ({ page }) => {
    await page.goto('/')
    
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /file sharing/i)
  })

  test('navigation between locales preserves path', async ({ page }) => {
    await page.goto('/ja')
    
    const languageSwitcher = page.getByRole('combobox')
    await languageSwitcher.click()
    await page.getByText('English').click()
    
    await page.waitForURL('**/en')
    expect(page.url()).toContain('/en')
  })
})