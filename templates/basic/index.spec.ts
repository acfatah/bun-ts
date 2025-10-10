import { describe, expect, it, spyOn } from 'bun:test'

describe('main', () => {
  it('should print hello world', async () => {
    const consoleSpy = spyOn(console, 'log')

    await import('./index.ts')
    expect(consoleSpy).toHaveBeenCalledWith('Hello via Bun!')

    consoleSpy.mockRestore()
  })
})
