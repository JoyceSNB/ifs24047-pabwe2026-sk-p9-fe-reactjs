import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PostModal from './PostModal'

vi.mock('../../../components/MarkdownEditor', () => ({
  default: ({ value, onChange }) => (
    <textarea aria-label="Konten Markdown" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}))

const categories = ['Teknologi', 'Bisnis', 'Umum']

function setup(props = {}) {
  const onClose = vi.fn()
  const onSave = vi.fn()
  render(<PostModal categories={categories} onClose={onClose} onSave={onSave} {...props} />)
  return { onClose, onSave }
}

describe('PostModal', () => {
  it('mode tambah: form kosong, isi semua kolom, dan simpan', () => {
    const { onClose, onSave } = setup({ post: null, initialData: null })
    expect(screen.getByText('Tambah Artikel Baru')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Judul Artikel'), { target: { value: 'Belajar Vitest' } })
    fireEvent.change(screen.getByLabelText('Kategori'), { target: { value: 'Teknologi' } })
    fireEvent.change(screen.getByLabelText('Gambar Sampul'), { target: { value: 'https://x.com/a.jpg' } })
    fireEvent.change(screen.getByLabelText('Ringkasan'), { target: { value: 'Ringkasan' } })
    fireEvent.change(screen.getByLabelText('Konten Markdown'), { target: { value: '## Isi' } })
    fireEvent.click(screen.getByLabelText('Terbitkan sekarang'))

    fireEvent.click(screen.getByText('Simpan Artikel'))
    expect(onSave).toHaveBeenCalledWith({
      title: 'Belajar Vitest',
      category: 'Teknologi',
      excerpt: 'Ringkasan',
      content: '## Isi',
      cover_image_path: 'https://x.com/a.jpg',
      is_published: true,
    })

    fireEvent.click(screen.getByText('Batal'))
    fireEvent.click(screen.getByLabelText('Tutup'))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('mode tambah tanpa sampul mengirim cover kosong dan draf', () => {
    const { onSave } = setup()
    fireEvent.change(screen.getByLabelText('Judul Artikel'), { target: { value: 'Draf' } })
    fireEvent.click(screen.getByText('Simpan Artikel'))
    expect(onSave).toHaveBeenCalledWith({
      title: 'Draf',
      category: 'Umum',
      excerpt: '',
      content: '',
      cover_image_path: '',
      is_published: false,
    })
  })

  it('mode ubah: terisi data artikel, tanpa opsi terbitkan, sampul dipertahankan', () => {
    const post = {
      id: 9,
      title: 'Artikel Lama',
      category: 'Bisnis',
      excerpt: 'Ringkasan lama',
      content: 'Isi lama',
      cover_image_path: 'https://x.com/lama.jpg',
      is_published: true,
    }
    const { onSave } = setup({ post })
    expect(screen.getByText('Ubah Artikel')).toBeInTheDocument()
    expect(screen.queryByLabelText('Terbitkan sekarang')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Judul Artikel')).toHaveValue('Artikel Lama')

    fireEvent.change(screen.getByLabelText('Judul Artikel'), { target: { value: 'Artikel Baru' } })
    fireEvent.click(screen.getByText('Simpan Artikel'))
    expect(onSave).toHaveBeenCalledWith({
      title: 'Artikel Baru',
      category: 'Bisnis',
      excerpt: 'Ringkasan lama',
      content: 'Isi lama',
      cover_image_path: 'https://x.com/lama.jpg',
      is_published: true,
    })
  })

  it('mode ubah: mengosongkan sampul mengirim DELETE', () => {
    const post = {
      id: 9,
      title: 'Artikel Lama',
      category: 'Bisnis',
      excerpt: '',
      content: 'Isi',
      cover_image_path: 'https://x.com/lama.jpg',
      is_published: false,
    }
    const { onSave } = setup({ post })
    fireEvent.change(screen.getByLabelText('Gambar Sampul'), { target: { value: '' } })
    fireEvent.click(screen.getByText('Simpan Artikel'))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ cover_image_path: 'DELETE', is_published: false }))
  })

  it('terisi dari draf AI (initialData) yang belum punya sampul', () => {
    const initialData = { title: 'Draf AI', category: 'Teknologi', excerpt: 'Ringkasan AI', content: '## AI' }
    const { onSave } = setup({ initialData })
    expect(screen.getByText('Tambah Artikel Baru')).toBeInTheDocument()
    expect(screen.getByLabelText('Judul Artikel')).toHaveValue('Draf AI')

    fireEvent.click(screen.getByText('Simpan Artikel'))
    expect(onSave).toHaveBeenCalledWith({
      title: 'Draf AI',
      category: 'Teknologi',
      excerpt: 'Ringkasan AI',
      content: '## AI',
      cover_image_path: '',
      is_published: false,
    })
  })
})
