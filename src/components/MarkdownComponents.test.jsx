import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import MarkdownEditor from './MarkdownEditor'
import MarkdownViewer from './MarkdownViewer'

describe('Markdown Components', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark')
  })

  it('renders MarkdownEditor, propagates changes, supports dark mode, and cleans up', () => {
    const handleChange = vi.fn()
    const { rerender, unmount } = render(
      <MarkdownEditor value="# Initial" onChange={handleChange} height="200px" placeholder="Tulis..." />
    )
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()

    // Nilai baru dari luar -> editor diperbarui dan event change diteruskan
    rerender(<MarkdownEditor value="# Updated" onChange={handleChange} height="200px" placeholder="Tulis..." />)
    expect(handleChange).toHaveBeenCalledWith('# Updated')

    // Nilai sama -> tidak ada pembaruan tambahan
    const calls = handleChange.mock.calls.length
    rerender(<MarkdownEditor value="# Updated" onChange={handleChange} height="200px" placeholder="Tulis..." />)
    expect(handleChange.mock.calls.length).toBe(calls)

    unmount()

    // Mode gelap
    document.documentElement.classList.add('dark')
    const dark = render(<MarkdownEditor value="" onChange={handleChange} height="200px" placeholder="Tulis..." />)
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()
    dark.unmount()
  })

  it('renders MarkdownViewer, updates content, and cleans up', () => {
    const { rerender, unmount } = render(<MarkdownViewer content="# View Title" />)
    expect(screen.getByTestId('markdown-viewer')).toBeInTheDocument()

    rerender(<MarkdownViewer content="# Updated View Title" />)
    expect(screen.getByTestId('markdown-viewer')).toBeInTheDocument()

    unmount()
  })
})
