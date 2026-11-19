import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AiPostGeneratorModal from './AiPostGeneratorModal'

vi.mock('../../../components/MarkdownViewer', () => ({
  default: ({ content }) => <div data-testid="markdown-viewer">{content}</div>,
}))

const categories = ['Teknologi', 'Bisnis']
const draft = {
  title: 'Draf Hasil AI',
  category: 'Teknologi',
  excerpt: 'Ringkasan AI',
  content: '## Isi AI',
  sources: ['https://id.wikipedia.org/wiki/Go'],
}

function setup(onGenerate) {
  const onClose = vi.fn()
  const onUseDraft = vi.fn()
  render(
    <AiPostGeneratorModal categories={categories} onClose={onClose} onGenerate={onGenerate} onUseDraft={onUseDraft} />
  )
  return { onClose, onUseDraft }
}

function fillAndSubmit(topic = 'Belajar Go') {
  fireEvent.change(screen.getByLabelText('Topik Artikel'), { target: { value: topic } })
  fireEvent.change(screen.getByLabelText('Kategori AI'), { target: { value: 'Teknologi' } })
  fireEvent.click(screen.getByLabelText('Gunakan penelusuran web'))
  fireEvent.click(screen.getByText('Buat Draf Artikel'))
}

describe('AiPostGeneratorModal', () => {
  it('membuat draf, menampilkan pratinjau dengan sumber, lalu menggunakannya', async () => {
    const onGenerate = vi.fn().mockResolvedValue(draft)
    const { onUseDraft, onClose } = setup(onGenerate)

    expect(screen.getByText('Gunakan Draf Ini')).toBeDisabled()
    fillAndSubmit()

    await waitFor(() => expect(screen.getByTestId('ai-draft')).toBeInTheDocument())
    expect(onGenerate).toHaveBeenCalledWith({ topic: 'Belajar Go', category: 'Teknologi', include_web_search: false })
    expect(screen.getByText('Draf Hasil AI')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-viewer')).toHaveTextContent('## Isi AI')
    expect(screen.getByTestId('ai-sources')).toHaveTextContent('https://id.wikipedia.org/wiki/Go')

    fireEvent.click(screen.getByText('Gunakan Draf Ini'))
    expect(onUseDraft).toHaveBeenCalledWith(draft)

    fireEvent.click(screen.getByText('Batal'))
    fireEvent.click(screen.getByLabelText('Tutup'))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('tidak menampilkan sumber ketika sources null atau kosong', async () => {
    const onGenerate = vi.fn().mockResolvedValue({ ...draft, sources: null })
    setup(onGenerate)
    fillAndSubmit()
    await waitFor(() => expect(screen.getByTestId('ai-draft')).toBeInTheDocument())
    expect(screen.queryByTestId('ai-sources')).not.toBeInTheDocument()
  })

  it('menampilkan label memuat selama proses pembuatan', async () => {
    let resolve
    const onGenerate = vi.fn().mockReturnValue(new Promise((r) => (resolve = r)))
    setup(onGenerate)
    fillAndSubmit()

    expect(await screen.findByText('Menulis draf...')).toBeDisabled()
    resolve(draft)
    await waitFor(() => expect(screen.getByText('Buat Draf Artikel')).not.toBeDisabled())
  })

  it('tidak menampilkan draf ketika generator gagal (null)', async () => {
    const onGenerate = vi.fn().mockResolvedValue(null)
    setup(onGenerate)
    fillAndSubmit()

    await waitFor(() => expect(screen.getByText('Buat Draf Artikel')).not.toBeDisabled())
    expect(screen.queryByTestId('ai-draft')).not.toBeInTheDocument()
    expect(screen.getByText('Gunakan Draf Ini')).toBeDisabled()
  })
})
