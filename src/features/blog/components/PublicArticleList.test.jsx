import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PublicArticleList from './PublicArticleList'

const posts = [
  {
    id: 1,
    slug: 'artikel-satu',
    title: 'Artikel Satu',
    excerpt: 'Ringkasan satu',
    category: 'Teknologi',
    reading_time: 3,
    published_at: '2026-11-17T20:37:43+07:00',
    cover_image_path: 'https://contoh.com/cover.jpg',
    user: { username: 'member' },
  },
  {
    id: 2,
    slug: 'artikel-dua',
    title: 'Artikel Dua',
    excerpt: 'Ringkasan dua',
    category: 'Bisnis',
    reading_time: 1,
    published_at: '2026-11-16T20:37:43+07:00',
    cover_image_path: '',
    user: { username: 'member' },
  },
  {
    id: 3,
    slug: 'artikel-tiga',
    title: 'Artikel Tiga',
    excerpt: 'Ringkasan tiga',
    category: 'Umum',
    reading_time: 2,
    published_at: '2026-11-15T20:37:43+07:00',
    cover_image_path: 'https://contoh.com/cover-tiga.jpg',
    user: { username: 'member' },
  },
]

function setup(props = {}) {
  const handlers = {
    onSearchChange: vi.fn(),
    onCategoryChange: vi.fn(),
    onOpenPost: vi.fn(),
  }
  render(
    <PublicArticleList
      posts={posts}
      categories={['Teknologi', 'Bisnis']}
      activeCategory=""
      searchQuery=""
      {...handlers}
      {...props}
    />
  )
  return handlers
}

describe('PublicArticleList', () => {
  it('menampilkan kartu artikel dengan dan tanpa gambar sampul', () => {
    setup()
    expect(screen.getByText('Artikel Satu')).toBeInTheDocument()
    expect(screen.getByText('Artikel Dua')).toBeInTheDocument()
    expect(screen.getByAltText('Artikel Satu')).toHaveAttribute('src', 'https://contoh.com/cover.jpg')
    expect(screen.queryByAltText('Artikel Dua')).not.toBeInTheDocument()
    expect(screen.getByText('3 menit baca')).toBeInTheDocument()
  })

  it('memuat gambar sampul pertama segera dan sisanya secara lazy', () => {
    setup()
    expect(screen.getByAltText('Artikel Satu')).toHaveAttribute('loading', 'eager')
    expect(screen.getByAltText('Artikel Tiga')).toHaveAttribute('loading', 'lazy')
    expect(screen.getByAltText('Artikel Satu')).toHaveAttribute('width', '800')
    expect(screen.getByAltText('Artikel Satu')).toHaveAttribute('height', '400')
  })

  it('membuka artikel ketika kartu diklik', () => {
    const h = setup()
    fireEvent.click(screen.getByTestId('post-card-2'))
    expect(h.onOpenPost).toHaveBeenCalledWith('artikel-dua')
  })

  it('mengirim perubahan pencarian dan filter kategori', () => {
    const h = setup({ activeCategory: 'Bisnis' })
    fireEvent.change(screen.getByLabelText('Cari artikel'), { target: { value: 'go' } })
    expect(h.onSearchChange).toHaveBeenCalledWith('go')

    fireEvent.click(screen.getByText('Semua'))
    expect(h.onCategoryChange).toHaveBeenCalledWith('')
    fireEvent.click(screen.getByRole('button', { name: 'Teknologi' }))
    expect(h.onCategoryChange).toHaveBeenCalledWith('Teknologi')

    expect(screen.getByRole('button', { name: 'Bisnis' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Teknologi' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('menandai pill Semua aktif saat tidak ada filter', () => {
    setup()
    expect(screen.getByText('Semua')).toHaveAttribute('aria-pressed', 'true')
  })

  it('menampilkan pesan kosong bila tidak ada artikel', () => {
    setup({ posts: [] })
    expect(screen.getByTestId('empty-posts')).toBeInTheDocument()
  })
})
