import type { InlineItem, MarkdownSerializer } from './durableMarkdownBlocks'
import { serializeBlockNoteMarkdown } from './blockNoteDirectMarkdown'

export const MORA_TOGGLE_BLOCK_TYPE = 'moraToggle'

type MoraToggleBlockLike = {
  type?: string
  content?: InlineItem[]
  children?: MoraToggleBlockLike[]
  props?: Record<string, unknown>
  [key: string]: unknown
}

interface MoraToggleMarker {
  collapsed: boolean
  title: string
}

const MORA_TOGGLE_MARKER = /^\[!mora-toggle\]([+-])[ \t]*(.*)$/iu

function inlineItemText(item: InlineItem): string {
  if (item.type === 'text' && typeof item.text === 'string') return item.text
  if (!Array.isArray(item.content)) return ''
  return (item.content as InlineItem[]).map(inlineItemText).join('')
}

function inlineContentText(content: InlineItem[] | undefined): string | null {
  if (!Array.isArray(content)) return null
  return content.map(inlineItemText).join('')
}

function dropInlinePrefix(content: InlineItem[], count: number): InlineItem[] {
  let remaining = count
  const result: InlineItem[] = []

  for (const item of content) {
    if (remaining === 0) {
      result.push(item)
      continue
    }
    if (item.type === 'text' && typeof item.text === 'string') {
      if (remaining < item.text.length) result.push({ ...item, text: item.text.slice(remaining) })
      remaining = Math.max(0, remaining - item.text.length)
      continue
    }
    if (Array.isArray(item.content)) {
      const nested = dropInlinePrefix(item.content as InlineItem[], remaining)
      const removed = (item.content as InlineItem[]).length === nested.length ? remaining : 0
      remaining = removed
      if (nested.length > 0) result.push({ ...item, content: nested })
    }
  }
  return result
}

export function parseMoraToggleMarker(line: string): MoraToggleMarker | null {
  const match = MORA_TOGGLE_MARKER.exec(line.trim())
  if (!match) return null
  return { collapsed: match[1] === '-', title: (match[2] ?? '').trim() }
}

export function formatMoraToggleMarker({ collapsed, title }: MoraToggleMarker): string {
  const state = collapsed ? '-' : '+'
  return title ? `[!mora-toggle]${state} ${title}` : `[!mora-toggle]${state}`
}

function buildMoraToggleBlock(block: MoraToggleBlockLike): MoraToggleBlockLike {
  if (block.type !== 'quote') return block
  const source = inlineContentText(block.content)
  if (source === null) return block

  const newlineIndex = source.indexOf('\n')
  const marker = parseMoraToggleMarker(newlineIndex === -1 ? source : source.slice(0, newlineIndex))
  if (!marker) return block

  const bodyOffset = newlineIndex === -1 ? source.length : newlineIndex + 1
  const body = dropInlinePrefix(block.content ?? [], bodyOffset)
  return {
    ...block,
    children: [{ content: body, props: {}, type: 'paragraph' }],
    content: marker.title ? [{ text: marker.title, type: 'text' }] : [],
    props: { ...(block.props ?? {}), collapsed: marker.collapsed },
    type: MORA_TOGGLE_BLOCK_TYPE,
  }
}

function injectMoraToggleBlock(block: MoraToggleBlockLike): MoraToggleBlockLike {
  const converted = buildMoraToggleBlock(block)
  if (!Array.isArray(converted.children)) return converted
  return { ...converted, children: converted.children.map(injectMoraToggleBlock) }
}

export function injectMoraToggleBlocks(blocks: unknown[]): unknown[] {
  return (blocks as MoraToggleBlockLike[]).map(injectMoraToggleBlock)
}

export function isMoraToggleBlock(block: MoraToggleBlockLike): boolean {
  return block.type === MORA_TOGGLE_BLOCK_TYPE
}

function serializeMoraToggleTitle(editor: MarkdownSerializer, block: MoraToggleBlockLike): string {
  if (!Array.isArray(block.content) || block.content.length === 0) return ''
  return serializeBlockNoteMarkdown(editor, [{ content: block.content, props: {}, type: 'paragraph' }])
    .trim()
    .replaceAll('\n', ' ')
}

export function serializeMoraToggleBlock(editor: MarkdownSerializer, block: MoraToggleBlockLike): string {
  const body = Array.isArray(block.children) && block.children.length > 0
    ? serializeBlockNoteMarkdown(editor, block.children).trim()
    : ''
  const marker = formatMoraToggleMarker({
    collapsed: block.props?.collapsed === true,
    title: serializeMoraToggleTitle(editor, block),
  })
  return [marker, ...(body ? body.split('\n') : [])].map(line => line ? `> ${line}` : '>').join('\n')
}

function hasMoraToggleBlock(block: MoraToggleBlockLike): boolean {
  if (isMoraToggleBlock(block)) return true
  return Array.isArray(block.children) && block.children.some(hasMoraToggleBlock)
}

export function hasMoraToggleBlocks(blocks: unknown[]): boolean {
  return (blocks as MoraToggleBlockLike[]).some(hasMoraToggleBlock)
}
