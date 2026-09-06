import { describe, expect, it, vi } from 'vitest'
import type { BlockLike, InlineItem } from './durableMarkdownBlocks'
import {
  formatMoraToggleMarker,
  injectMoraToggleBlocks,
  parseMoraToggleMarker,
  serializeMoraToggleBlock,
} from './moraToggleMarkdown'

function quote(content: InlineItem[]): BlockLike {
  return { type: 'quote', content }
}

describe('Mora Toggle Markdown', () => {
  it('recognizes only the namespaced Mora marker', () => {
    expect(parseMoraToggleMarker('[!mora-toggle]- Project context')).toEqual({
      collapsed: true,
      title: 'Project context',
    })
    expect(parseMoraToggleMarker('[!mora-toggle]+ Expanded context')).toEqual({
      collapsed: false,
      title: 'Expanded context',
    })
    expect(parseMoraToggleMarker('[!tip]- External callout')).toBeNull()
    expect(formatMoraToggleMarker({ collapsed: false, title: 'Project context' })).toBe(
      '[!mora-toggle]+ Project context',
    )
  })

  it('hydrates the marker as a parent Toggle with a child paragraph', () => {
    const [toggle] = injectMoraToggleBlocks([quote([
      { type: 'text', text: '[!mora-toggle]- Project context\n' },
      { type: 'text', text: 'Hidden detail', styles: { bold: true } },
    ])]) as Array<Record<string, unknown>>

    expect(toggle).toMatchObject({
      type: 'moraToggle',
      props: { collapsed: true },
      content: [{ type: 'text', text: 'Project context' }],
      children: [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'Hidden detail', styles: { bold: true } }],
      }],
    })
  })

  it('serializes the title and nested child blocks through the normal serializer', () => {
    const editor = {
      blocksToMarkdownLossy: vi.fn((blocks: Array<{ content?: InlineItem[] }>) => (
        blocks.flatMap(block => block.content ?? []).map(item => item.text ?? '').join('')
      )),
    }

    expect(serializeMoraToggleBlock(editor, {
      type: 'moraToggle',
      props: { collapsed: true },
      content: [{ type: 'text', text: 'Project context' }],
      children: [{
        type: 'paragraph',
        props: {},
        content: [{ type: 'text', text: 'Hidden detail' }],
      }],
    })).toBe([
      '> [!mora-toggle]- Project context',
      '> Hidden detail',
    ].join('\n'))
  })
})
