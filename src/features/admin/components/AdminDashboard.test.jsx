import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AdminDashboard from './AdminDashboard'

const users = [
  { id: 1, username: 'admin', email: 'admin@delcom.org', role: 'admin', total_posts: 0, total_published: 0 },
  { id: 2, username: 'member', email: 'member@delcom.org', role: 'member', total_posts: 7, total_published: 5 },
]
const posts = [
  { id: 1, title: 'Artikel Terbit', category: 'Teknologi', is_published: true, created_at: '2026-11-18T20:37:43+07:00', user: { username: 'member' } },
  { id: 2, title: 'Artikel Draf', category: 'Umum', is_published: false, created_at: '2026-11-18T20:37:43+07:00', user: { username: 'member' } },
]

describe('AdminDashboard', () => {
  it('menampilkan direktori pengguna dan arsip artikel', () => {
    render(<AdminDashboard users={users} posts={posts} onLoadUserPosts={vi.fn()} />)
    expect(screen.getByText('member@delcom.org')).toBeInTheDocument()
    expect(screen.getAllByText('admin').length).toBeGreaterThan(0)
    expect(screen.getByText('Artikel Terbit')).toBeInTheDocument()
    expect(screen.getByText('Terbit')).toBeInTheDocument()
    expect(screen.getByText('Draf')).toBeInTheDocument()
  })

  it('menampilkan pesan kosong untuk pengguna dan artikel', () => {
    render(<AdminDashboard users={[]} posts={[]} onLoadUserPosts={vi.fn()} />)
    expect(screen.getByTestId('empty-users')).toBeInTheDocument()
    expect(screen.getByTestId('empty-admin-posts')).toBeInTheDocument()
  })

  it('memonitor artikel pengguna lalu menutup dengan tombol Tutup Pemantauan', async () => {
    const onLoadUserPosts = vi.fn().mockResolvedValue([
      { id: 1, title: 'Artikel Milik Member', category: 'Teknologi', is_published: true },
      { id: 2, title: 'Draf Milik Member', category: 'Umum', is_published: false },
    ])
    render(<AdminDashboard users={users} posts={[]} onLoadUserPosts={onLoadUserPosts} />)

    fireEvent.click(screen.getByLabelText('Monitoring Artikel member'))
    await waitFor(() => expect(screen.getByTestId('inspect-modal')).toBeInTheDocument())
    expect(onLoadUserPosts).toHaveBeenCalledWith(2)
    expect(screen.getByText('Artikel Milik Member')).toBeInTheDocument()
    expect(screen.getByText('Draf Milik Member')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Tutup Pemantauan'))
    expect(screen.queryByTestId('inspect-modal')).not.toBeInTheDocument()
  })

  it('menampilkan pesan kosong untuk pengguna tanpa artikel dan menutup lewat tanda silang', async () => {
    const onLoadUserPosts = vi.fn().mockResolvedValue([])
    render(<AdminDashboard users={users} posts={[]} onLoadUserPosts={onLoadUserPosts} />)

    fireEvent.click(screen.getByLabelText('Monitoring Artikel admin'))
    await waitFor(() => expect(screen.getByTestId('empty-inspected')).toBeInTheDocument())

    fireEvent.click(screen.getByLabelText('Tutup monitoring'))
    expect(screen.queryByTestId('inspect-modal')).not.toBeInTheDocument()
  })
})