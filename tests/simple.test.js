const { describe, it, expect } = require('@jest/globals')

describe('Basic Test Suite', () => {
  it('should run basic math test', () => {
    expect(2 + 2).toBe(4)
  })

  it('should test string operations', () => {
    expect('hello world').toContain('world')
  })

  it('should test array operations', () => {
    const arr = [1, 2, 3]
    expect(arr).toHaveLength(3)
    expect(arr).toContain(2)
  })

  it('should test object operations', () => {
    const obj = { name: 'test', value: 42 }
    expect(obj).toHaveProperty('name')
    expect(obj.value).toBe(42)
  })
})