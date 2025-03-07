import { describe, expect, it, spyOn } from 'bun:test'

describe('main', () => {
  it('should print hello world', async () => {
    const consoleSpy = spyOn(console, 'log')

    await import('../src/main.ts')
    expect(consoleSpy).toHaveBeenCalledWith('Hello, world!')

    consoleSpy.mockRestore()
  })
})
