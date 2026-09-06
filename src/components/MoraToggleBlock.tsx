import { createExtension } from '@blocknote/core'
import { createReactBlockSpec, type ReactCustomBlockRenderProps } from '@blocknote/react'
import { CaretDown, CaretRight } from '@phosphor-icons/react'
import { useAppLocale } from '../hooks/useAppPreferences'
import { translate } from '../lib/i18n'
import { MORA_TOGGLE_BLOCK_TYPE } from '../utils/moraToggleMarkdown'
import { dispatchRichEditorExternalChange } from './editorExternalChangeEvents'

const MORA_TOGGLE_BLOCK_CONFIG = {
  type: MORA_TOGGLE_BLOCK_TYPE,
  propSchema: {
    backgroundColor: { default: 'default' },
    collapsed: { default: false },
    textAlignment: { default: 'left', values: ['left', 'center', 'right', 'justify'] },
    textColor: { default: 'default' },
  },
  content: 'inline',
} as const

type MoraToggleBlockViewProps = ReactCustomBlockRenderProps<
  typeof MORA_TOGGLE_BLOCK_TYPE,
  typeof MORA_TOGGLE_BLOCK_CONFIG.propSchema,
  'inline'
>

function updateToggleProps(
  editor: MoraToggleBlockViewProps['editor'],
  blockId: string,
  collapsed: boolean,
) {
  const updated = editor.updateBlock(blockId, { props: { collapsed } })
  dispatchRichEditorExternalChange(editor, editor.domElement ?? undefined)
  return updated
}

function createToggleChild({ block, editor }: Pick<MoraToggleBlockViewProps, 'block' | 'editor'>) {
  editor.transact(() => {
    const updated = block.children.length === 0
      ? editor.updateBlock(block.id, { children: [{}], props: { collapsed: false } })
      : editor.updateBlock(block.id, { props: { collapsed: false } })
    const firstChild = updated.children.at(0)
    if (firstChild) {
      editor.setTextCursorPosition(firstChild.id, 'start')
      editor.focus()
    }
  })
  dispatchRichEditorExternalChange(editor, editor.domElement ?? undefined)
}

function handleMoraToggleEnter(editor: MoraToggleBlockViewProps['editor']): boolean {
  const cursor = editor.getTextCursorPosition()
  if (cursor.block.type !== MORA_TOGGLE_BLOCK_TYPE) return false

  createToggleChild({
    block: cursor.block as MoraToggleBlockViewProps['block'],
    editor,
  })
  return true
}

function MoraToggleBlockView({ block, contentRef, editor }: MoraToggleBlockViewProps) {
  const locale = useAppLocale()
  const collapsed = block.props.collapsed
  const ToggleIcon = collapsed ? CaretRight : CaretDown

  return (
    <div className="mora-toggle" data-collapsed={collapsed ? 'true' : 'false'}>
      <button
        type="button"
        className="mora-toggle__button"
        aria-expanded={!collapsed}
        aria-label={translate(locale, collapsed ? 'editor.toggle.expand' : 'editor.toggle.collapse')}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          updateToggleProps(editor, block.id, !collapsed)
        }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <ToggleIcon aria-hidden="true" weight="bold" />
      </button>
      <div
        ref={contentRef}
        className="mora-toggle__content"
        aria-label={translate(locale, 'editor.toggle.title')}
        data-placeholder={translate(locale, 'editor.toggle.title')}
      />
    </div>
  )
}

export const MoraToggleBlockSpec = createReactBlockSpec(
  MORA_TOGGLE_BLOCK_CONFIG,
  { render: MoraToggleBlockView },
  [
    createExtension({
      key: 'mora-toggle-shortcuts',
      keyboardShortcuts: {
        Enter: ({ editor }) => handleMoraToggleEnter(editor as MoraToggleBlockViewProps['editor']),
      },
    }) as never,
  ],
)
