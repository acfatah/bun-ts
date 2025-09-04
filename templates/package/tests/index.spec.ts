import { describe, expect, it } from 'bun:test'
import { greet } from '../src/index.ts'

describe('greet', () => {
  it('should return hello world', async () => {
    expect(greet()).toBe('Hello, world!')
  })
})
