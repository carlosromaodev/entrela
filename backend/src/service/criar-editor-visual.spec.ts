import { describe, it, expect } from 'vitest'
import { CriarEditorVisual } from './criar-editor-visual.js'

describe('RF-BASE-10 Editor visual por blocos', () => {
  it('deve criar editor responsivo', async () => {
    const c = new CriarEditorVisual({ repositorio: { criar: () => Promise.resolve() } as any })
    expect(c).toBeDefined()
  })
})