import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PublicArticleDetail from './PublicArticleDetail'

vi.mock('../../../components/MarkdownViewer', () => ({
  default: ({ content }) => <div data-testid="markdown-viewer">{content}</div>,
}))

const post = {
  id: 1,
  title: 'Judul Artikel',
  category: 'Teknologi',
  content: '## Isi Artikel',
  reading_time: 4,
  published_at: '2026-11-17T20:37:43+07:00',
  cover_image_path: 'https://contoh.com/cover.jpg',
  user: { username: 'member' },
}

describe('PublicArticleDetail', () => {
  it('menampilkan status memuat', () => {
    render(<PublicArticleDetail post={null} loading={true} onBack={vi.fn()} />)
    expect(screen.getByTestId('article-loading')).toBeInTheDocument()
  })

  it('menampilkan pesan tidak ditemukan dengan tombol kembali', () => {
    const onBack = vi.fn()
    render(<PublicArticleDetail post={null} loading={false} onBack={onBack} />)
    expect(screen.getByTestId('article-not-found')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Kembali ke Beranda'))
    expect(onBack).toHaveBeenCalled()
  })

  it('menampilkan artikel lengkap dengan gambar sampul', () => {
    render(<PublicArticleDetail post={post} loading={false} onBack={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Judul Artikel' })).toBeInTheDocument()
    expect(screen.getByText('member')).toBeInTheDocument()
    expect(screen.getByText('4 menit baca')).toBeInTheDocument()
    expect(screen.getByAltText('Judul Artikel')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-viewer')).toHaveTextContent('## Isi Artikel')
  })

  it('menampilkan artikel tanpa gambar sampul', () => {
    render(<PublicArticleDetail post={{ ...post, cover_image_path: '' }} loading={false} onBack={vi.fn()} />)
    expect(screen.queryByAltText('Judul Artikel')).not.toBeInTheDocument()
  })
})
