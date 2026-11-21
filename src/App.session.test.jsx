import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'
import blogApi from './features/blog/api/blogApi'
import adminApi from './features/admin/api/adminApi'
import { showErrorAlert } from './helpers/toolsHelper'

vi.mock('./features/blog/api/blogApi', () => ({
  default: {
    getCategories: vi.fn(),
    getPublicPosts: vi.fn(),
    getPublicPostBySlug: vi.fn(),
    getPosts: vi.fn(),
    getStats: vi.fn(),
    createPost: vi.fn(),
    updatePost: vi.fn(),
    togglePublish: vi.fn(),
    deletePost: vi.fn(),
    generateAiPost: vi.fn(),
  },
}))
vi.mock('./features/admin/api/adminApi', () => ({
  default: { getUsers: vi.fn(), getPosts: vi.fn(), getUserPosts: vi.fn() },
}))
vi.mock('./features/auth/api/authApi', () => ({
  default: { login: vi.fn(), register: vi.fn() },
}))
vi.mock('./helpers/toolsHelper', async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorAlert: vi.fn(),
  showConfirmDialog: vi.fn(),
}))
vi.mock('./components/MarkdownEditor', () => ({
  default: () => <div data-testid="markdown-editor" />,
}))
vi.mock('./components/MarkdownViewer', () => ({
  default: ({ content }) => <div data-testid="markdown-viewer">{content}</div>,
}))

const member = { id: 2, username: 'member', email: 'member@delcom.org', role: 'member' }
const expiredError = () => Object.assign(new Error('Unauthorized: Invalid or expired token'), { status: 401 })

describe('App: sesi kedaluwarsa', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
    window.history.pushState({}, '', '/')

    blogApi.getCategories.mockResolvedValue(['Teknologi', 'Umum'])
    blogApi.getPublicPosts.mockResolvedValue([])
    blogApi.getStats.mockResolvedValue({ total: 0, total_terbit: 0, belum_selesai: 0 })
    blogApi.getPosts.mockResolvedValue([])
    adminApi.getUsers.mockResolvedValue([])
    adminApi.getPosts.mockResolvedValue([])
  })

  it('token kedaluwarsa (401) mengakhiri sesi tanpa dialog error', async () => {
    localStorage.setItem('token', 'token-lama')
    localStorage.setItem('user', JSON.stringify(member))
    blogApi.getStats.mockRejectedValue(expiredError())

    render(<App />)

    expect(await screen.findByText('Sesi berakhir, silakan masuk kembali.')).toBeInTheDocument()
    expect(showErrorAlert).not.toHaveBeenCalled()
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
    await waitFor(() => expect(screen.getByText('Daftar')).toBeInTheDocument())
  })

  it('error selain 401 tetap tampil sebagai dialog dan sesi dipertahankan', async () => {
    localStorage.setItem('token', 'token-aktif')
    localStorage.setItem('user', JSON.stringify(member))
    blogApi.getStats.mockRejectedValue(new Error('server error'))

    render(<App />)

    await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('server error'))
    expect(localStorage.getItem('token')).toBe('token-aktif')
  })
})