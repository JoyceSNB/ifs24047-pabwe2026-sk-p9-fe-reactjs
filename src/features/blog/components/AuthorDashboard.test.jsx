import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AuthorDashboard from './AuthorDashboard'

const stats = { total: 2, total_terbit: 1, belum_selesai: 1 }
const published = {
  id: 1,
  slug: 'artikel-terbit',
  title: 'Artikel Terbit',
  category: 'Teknologi',
  reading_time: 2,
  is_published: true,
  updated_at: '2026-11-17T20:37:43+07:00',
}
const draft = {
  id: 2,
  slug: 'artikel-draf',
  title: 'Artikel Draf',
  category: 'Umum',
  reading_time: 1,
  is_published: false,
  updated_at: '2026-11-18T20:37:43+07:00',
}

function setup(posts = [published, draft]) {
  const handlers = {
    onCreate: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onTogglePublish: vi.fn(),
    onOpenAi: vi.fn(),
    onOpenPost: vi.fn(),
  }
  render(<AuthorDashboard stats={stats} posts={posts} {...handlers} />)
  return handlers
}

describe('AuthorDashboard', () => {
  it('menampilkan statistik, daftar artikel, dan tombol aksi utama', () => {
    const h = setup()
    expect(screen.getByTestId('stat-total')).toHaveTextContent('2')
    expect(screen.getByText('Artikel Terbit')).toBeInTheDocument()
    expect(screen.getByText('Artikel Draf')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Tambah Artikel'))
    expect(h.onCreate).toHaveBeenCalled()
    fireEvent.click(screen.getByText('AI Generator'))
    expect(h.onOpenAi).toHaveBeenCalled()
  })

  it('men-toggle status terbit/draf lewat switch', () => {
    const h = setup()
    const sw = screen.getByRole('switch', { name: 'Terbitkan Artikel Terbit' })
    expect(sw).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('switch', { name: 'Terbitkan Artikel Draf' })).toHaveAttribute('aria-checked', 'false')
    fireEvent.click(sw)
    expect(h.onTogglePublish).toHaveBeenCalledWith(published)
  })

  it('menu kebab artikel terbit: Lihat, Ubah, Hapus', () => {
    const h = setup()
    const kebab = screen.getByLabelText('Menu Artikel Terbit')

    fireEvent.click(kebab)
    expect(screen.getByTestId('post-menu-1')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Lihat'))
    expect(h.onOpenPost).toHaveBeenCalledWith('artikel-terbit')
    expect(screen.queryByTestId('post-menu-1')).not.toBeInTheDocument()

    fireEvent.click(kebab)
    fireEvent.click(screen.getByText('Ubah'))
    expect(h.onEdit).toHaveBeenCalledWith(published)

    fireEvent.click(kebab)
    fireEvent.click(screen.getByText('Hapus'))
    expect(h.onDelete).toHaveBeenCalledWith(published)
  })

  it('menu kebab artikel draf tidak punya tombol Lihat dan bisa ditutup ulang', () => {
    setup()
    const kebab = screen.getByLabelText('Menu Artikel Draf')
    fireEvent.click(kebab)
    expect(screen.getByTestId('post-menu-2')).toBeInTheDocument()
    expect(screen.queryByText('Lihat')).not.toBeInTheDocument()

    fireEvent.click(kebab)
    expect(screen.queryByTestId('post-menu-2')).not.toBeInTheDocument()
  })

  it('menampilkan pesan kosong tanpa artikel', () => {
    setup([])
    expect(screen.getByTestId('empty-author-posts')).toBeInTheDocument()
  })
})
