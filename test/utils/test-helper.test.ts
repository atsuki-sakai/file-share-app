import { describe, it, expect } from 'vitest'

describe('Basic Test Setup', () => {
  it('should pass a simple test', () => {
    expect(true).toBe(true)
  })

  it('should perform basic arithmetic', () => {
    expect(2 + 2).toBe(4)
    expect(5 * 3).toBe(15)
  })

  it('should handle strings correctly', () => {
    const testString = 'Hello, World!'
    expect(testString).toContain('World')
    expect(testString.length).toBe(13)
  })

  it('should work with arrays', () => {
    const testArray = [1, 2, 3, 4, 5]
    expect(testArray).toHaveLength(5)
    expect(testArray).toContain(3)
  })

  it('should handle objects', () => {
    const testObj = { name: 'Test', value: 42 }
    expect(testObj).toHaveProperty('name')
    expect(testObj.value).toBe(42)
  })
})