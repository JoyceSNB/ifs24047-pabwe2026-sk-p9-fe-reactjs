import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'
import blogApi from './features/blog/api/blogApi'
import adminApi from './features/admin/api/adminApi'
import authApi from './features/auth/api/authApi'
import { apiRequest } from './services/api'
import { showErrorAlert, showConfirmDialog } from './helpers/toolsHelper'

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
vi.mock('./services/api', async (importOriginal) => ({
  ...(await importOriginal()),
  apiRequest: vi.fn(),
}))
vi.mock('./helpers/toolsHelper', async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorAlert: vi.fn(),
  showConfirmDialog: vi.fn(),
}))
vi.mock('./components/MarkdownEditor', () => ({
  default: ({ value, onChange }) => (
    <textarea aria-label="Konten Markdown" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}))
vi.mock('./components/MarkdownViewer', () => ({
  default: ({ content }) => <div data-testid="markdown-viewer">{content}</div>,
}))

const member = { id: 2, username: 'member', email: 'member@delcom.org', role: 'member' }
const admin = { id: 1, username: 'admin', email: 'admin@delcom.org', role: 'admin' }

const publicPosts = [
  {
    id: 1,
    slug: 'artikel-satu',
    title: 'Artikel Satu',
    excerpt: 'Ringkasan satu',
    content: '## Isi Satu',
    category: 'Teknologi',
    reading_time: 2,
    published_at: '2026-11-17T20:37:43+07:00',
    cover_image_path: '',
    user: { username: 'member' },
  },
]
const myPosts = [
  {
    id: 11,
    slug: 'artikel-terbit',
    title: 'Artikel Terbit',
    category: 'Teknologi',
    excerpt: 'Ringkasan lama',
    content: 'Isi lama',
    cover_image_path: '',
    reading_time: 1,
    is_published: true,
    updated_at: '2026-11-17T20:37:43+07:00',
  },
  {
    id: 12,
    slug: 'artikel-draf',
    title: 'Artikel Draf',
    category: 'Umum',
    excerpt: '',
    content: 'Isi draf',
    cover_image_path: '',
    reading_time: 1,
    is_published: false,
    updated_at: '2026-11-18T20:37:43+07:00',
  },
]
const stats = { total: 2, total_terbit: 1, belum_selesai: 1 }
const adminUsers = [
  { id: 1, username: 'admin', email: 'admin@delcom.org', role: 'admin', total_posts: 0, total_published: 0 },
  { id: 2, username: 'member', email: 'member@delcom.org', role: 'member', total_posts: 2, total_published: 1 },
]
const adminPosts = myPosts.map((p) => ({ ...p, created_at: p.updated_at, user: { username: 'member' } }))
const aiDraft = {
  title: 'Draf AI',
  category: 'Teknologi',
  excerpt: 'Ringkasan AI',
  content: '## Isi AI',
  sources: ['https://id.wikipedia.org/wiki/Go'],
}

const setSession = (user) => {
  localStorage.setItem('token', 'token-123')
  localStorage.setItem('user', JSON.stringify(user))
}
const goTo = (path) => window.history.pushState({}, '', path)

describe('App', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    goTo('/')

    blogApi.getCategories.mockResolvedValue(['Teknologi', 'Bisnis', 'Umum'])
    blogApi.getPublicPosts.mockResolvedValue(publicPosts)
    blogApi.getPublicPostBySlug.mockResolvedValue(publicPosts[0])
    blogApi.getStats.mockResolvedValue(stats)
    blogApi.getPosts.mockResolvedValue(myPosts)
    blogApi.createPost.mockResolvedValue({})
    blogApi.updatePost.mockResolvedValue({})
    blogApi.togglePublish.mockResolvedValue({})
    blogApi.deletePost.mockResolvedValue({})
    blogApi.generateAiPost.mockResolvedValue(aiDraft)
    adminApi.getUsers.mockResolvedValue(adminUsers)
    adminApi.getPosts.mockResolvedValue(adminPosts)
    adminApi.getUserPosts.mockResolvedValue([])
    apiRequest.mockResolvedValue({})
    showConfirmDialog.mockResolvedValue(true)
  })

  describe('halaman publik', () => {
    it('memuat artikel, mencari secara real-time, dan memfilter kategori', async () => {
      render(<App />)
      expect(await screen.findByText('Artikel Satu')).toBeInTheDocument()
      expect(await screen.findByRole('button', { name: 'Bisnis' })).toBeInTheDocument()

      fireEvent.change(screen.getByLabelText('Cari artikel'), { target: { value: 'go' } })
      await waitFor(() => expect(blogApi.getPublicPosts).toHaveBeenLastCalledWith({ q: 'go', category: '' }))

      fireEvent.click(screen.getByRole('button', { name: 'Bisnis' }))
      await waitFor(() => expect(blogApi.getPublicPosts).toHaveBeenLastCalledWith({ q: 'go', category: 'Bisnis' }))
    })

    it('menampilkan dialog error saat kategori gagal dimuat', async () => {
      blogApi.getCategories.mockRejectedValue(new Error('gagal kategori'))
      render(<App />)
      await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('gagal kategori'))
    })

    it('membuka detail artikel dari daftar lalu kembali ke beranda', async () => {
      render(<App />)
      fireEvent.click(await screen.findByTestId('post-card-1'))

      expect(await screen.findByTestId('public-article-detail')).toBeInTheDocument()
      expect(blogApi.getPublicPostBySlug).toHaveBeenCalledWith('artikel-satu')
      expect(window.location.pathname).toBe('/posts/artikel-satu')

      fireEvent.click(screen.getByText('Kembali ke Beranda'))
      expect(await screen.findByTestId('public-article-list')).toBeInTheDocument()
      expect(window.location.pathname).toBe('/')
    })

    it('menampilkan pesan tidak ditemukan bila artikel tidak ada', async () => {
      blogApi.getPublicPostBySlug.mockRejectedValue(new Error('not found'))
      goTo('/posts/tidak-ada')
      render(<App />)
      expect(await screen.findByTestId('article-not-found')).toBeInTheDocument()
    })

    it('mengikuti tombol back/forward peramban (popstate)', async () => {
      render(<App />)
      await screen.findByText('Artikel Satu')

      goTo('/posts/artikel-satu')
      act(() => {
        window.dispatchEvent(new PopStateEvent('popstate'))
      })
      expect(await screen.findByTestId('public-article-detail')).toBeInTheDocument()
    })

    it('mengganti mode gelap dan aksen warna dari navbar', async () => {
      render(<App />)
      await screen.findByText('Artikel Satu')

      fireEvent.click(screen.getByLabelText('Toggle Mode Gelap Terang'))
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      fireEvent.click(screen.getByLabelText('Tema Rose'))
      expect(document.documentElement.getAttribute('data-accent')).toBe('rose')
    })
  })

  describe('akses & autentikasi', () => {
    it('tamu di /author melihat gerbang akses lalu diarahkan ke login', async () => {
      goTo('/author')
      render(<App />)
      expect(await screen.findByTestId('access-gate')).toBeInTheDocument()

      fireEvent.click(screen.getAllByText('Masuk').find((el) => el.tagName === 'BUTTON' && el.className.includes('bg-primary-600')))
      expect(await screen.findByTestId('auth-page')).toBeInTheDocument()
      expect(window.location.pathname).toBe('/login')
    })

    it('tamu di /admin melihat gerbang akses', async () => {
      goTo('/admin')
      render(<App />)
      expect(await screen.findByText('Silakan masuk untuk membuka Panel Administrasi.')).toBeInTheDocument()
    })

    it('anggota biasa di /admin ditolak tanpa tombol masuk', async () => {
      setSession(member)
      goTo('/admin')
      render(<App />)
      expect(await screen.findByText('Halaman ini hanya dapat diakses oleh administrator.')).toBeInTheDocument()
      expect(screen.getByTestId('access-gate')).not.toHaveTextContent('Masuk')
    })

    it('login berhasil menyimpan sesi dan kembali ke beranda', async () => {
      authApi.login.mockResolvedValue({ token: 'tok', user: member })
      goTo('/login')
      render(<App />)

      fireEvent.change(document.getElementById('login-username'), { target: { value: 'member' } })
      fireEvent.change(document.getElementById('login-password'), { target: { value: 'member' } })
      fireEvent.click(document.getElementById('login-submit'))

      expect(await screen.findByText('Berhasil masuk!')).toBeInTheDocument()
      expect(authApi.login).toHaveBeenCalledWith('member', 'member')
      expect(localStorage.getItem('token')).toBe('tok')
      expect(window.location.pathname).toBe('/')
      expect(await screen.findByTestId('navbar-username')).toHaveTextContent('member')
      await waitFor(() => expect(blogApi.getStats).toHaveBeenCalled())

      fireEvent.click(screen.getByLabelText('Tutup notifikasi'))
      expect(screen.queryByTestId('status-message')).not.toBeInTheDocument()
    })

    it('registrasi berhasil membuat sesi baru', async () => {
      authApi.register.mockResolvedValue({ token: 'tok2', user: member })
      goTo('/register')
      render(<App />)

      fireEvent.change(document.getElementById('register-username'), { target: { value: 'baru' } })
      fireEvent.change(document.getElementById('register-email'), { target: { value: 'baru@delcom.org' } })
      fireEvent.change(document.getElementById('register-password'), { target: { value: 'rahasia123' } })
      fireEvent.click(document.getElementById('register-submit'))

      expect(await screen.findByText('Pendaftaran berhasil!')).toBeInTheDocument()
      expect(authApi.register).toHaveBeenCalledWith('baru', 'baru@delcom.org', 'rahasia123')
      expect(localStorage.getItem('token')).toBe('tok2')
    })

    it('logout menghapus sesi', async () => {
      setSession(member)
      render(<App />)
      fireEvent.click(await screen.findByText('Keluar'))

      expect(await screen.findByText('Berhasil keluar.')).toBeInTheDocument()
      expect(apiRequest).toHaveBeenCalledWith('/auth/logout', 'POST')
      expect(localStorage.getItem('token')).toBeNull()
      expect(screen.getByText('Daftar')).toBeInTheDocument()
    })

    it('logout tetap berhasil walau permintaan ke server gagal', async () => {
      setSession(member)
      apiRequest.mockRejectedValue(new Error('server mati'))
      render(<App />)
      fireEvent.click(await screen.findByText('Keluar'))

      expect(await screen.findByText('Berhasil keluar.')).toBeInTheDocument()
      expect(localStorage.getItem('user')).toBeNull()
    })
  })

  describe('workspace penulis', () => {
    beforeEach(() => {
      setSession(member)
      goTo('/author')
    })

    it('menampilkan statistik dan daftar artikel milik penulis', async () => {
      render(<App />)
      expect(await screen.findByText('Artikel Terbit')).toBeInTheDocument()
      expect(screen.getByTestId('stat-total')).toHaveTextContent('2')
      expect(blogApi.getStats).toHaveBeenCalled()
      expect(adminApi.getUsers).not.toHaveBeenCalled()
    })

    it('tombol Lihat membuka artikel publik', async () => {
      render(<App />)
      fireEvent.click(await screen.findByLabelText('Menu Artikel Terbit'))
      fireEvent.click(screen.getByText('Lihat'))

      expect(await screen.findByTestId('public-article-detail')).toBeInTheDocument()
      expect(blogApi.getPublicPostBySlug).toHaveBeenCalledWith('artikel-terbit')
    })

    it('menambah artikel baru lalu memuat ulang data', async () => {
      render(<App />)
      fireEvent.click(await screen.findByText('Tambah Artikel'))
      expect(await screen.findByTestId('post-modal')).toBeInTheDocument()

      fireEvent.change(screen.getByLabelText('Judul Artikel'), { target: { value: 'Artikel Baru' } })
      fireEvent.change(screen.getByLabelText('Konten Markdown'), { target: { value: 'Isi baru' } })
      const statsCalls = blogApi.getStats.mock.calls.length
      fireEvent.click(screen.getByText('Simpan Artikel'))

      expect(await screen.findByText('Artikel baru berhasil dibuat!')).toBeInTheDocument()
      expect(blogApi.createPost).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Artikel Baru', content: 'Isi baru', is_published: false })
      )
      expect(screen.queryByTestId('post-modal')).not.toBeInTheDocument()
      await waitFor(() => expect(blogApi.getStats.mock.calls.length).toBeGreaterThan(statsCalls))
    })

    it('membatalkan penambahan artikel dengan menutup modal', async () => {
      render(<App />)
      fireEvent.click(await screen.findByText('Tambah Artikel'))
      fireEvent.click(await screen.findByText('Batal'))
      expect(screen.queryByTestId('post-modal')).not.toBeInTheDocument()
    })

    it('mengubah artikel yang sudah ada', async () => {
      render(<App />)
      fireEvent.click(await screen.findByLabelText('Menu Artikel Terbit'))
      fireEvent.click(screen.getByText('Ubah'))

      expect(await screen.findByText('Ubah Artikel')).toBeInTheDocument()
      expect(screen.getByLabelText('Judul Artikel')).toHaveValue('Artikel Terbit')
      fireEvent.change(screen.getByLabelText('Judul Artikel'), { target: { value: 'Judul Diubah' } })
      fireEvent.click(screen.getByText('Simpan Artikel'))

      expect(await screen.findByText('Artikel berhasil diperbarui!')).toBeInTheDocument()
      expect(blogApi.updatePost).toHaveBeenCalledWith(11, expect.objectContaining({ title: 'Judul Diubah' }))
    })

    it('menampilkan dialog error ketika penyimpanan gagal dan modal tetap terbuka', async () => {
      blogApi.createPost.mockRejectedValue(new Error('gagal simpan'))
      render(<App />)
      fireEvent.click(await screen.findByText('Tambah Artikel'))
      fireEvent.change(await screen.findByLabelText('Judul Artikel'), { target: { value: 'X' } })
      fireEvent.click(screen.getByText('Simpan Artikel'))

      await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('gagal simpan'))
      expect(await screen.findByTestId('post-modal')).toBeInTheDocument()
    })

    it('men-toggle status terbit/draf', async () => {
      render(<App />)
      fireEvent.click(await screen.findByRole('switch', { name: 'Terbitkan Artikel Draf' }))

      expect(await screen.findByText('Status publikasi diperbarui.')).toBeInTheDocument()
      expect(blogApi.togglePublish).toHaveBeenCalledWith(12)
      expect(adminApi.getUsers).not.toHaveBeenCalled()
    })

    it('menampilkan dialog error ketika toggle gagal', async () => {
      blogApi.togglePublish.mockRejectedValue(new Error('gagal toggle'))
      render(<App />)
      fireEvent.click(await screen.findByRole('switch', { name: 'Terbitkan Artikel Draf' }))
      await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('gagal toggle'))
    })

    it('menghapus artikel setelah konfirmasi', async () => {
      render(<App />)
      fireEvent.click(await screen.findByLabelText('Menu Artikel Draf'))
      fireEvent.click(screen.getByText('Hapus'))

      expect(await screen.findByText('Artikel berhasil dihapus.')).toBeInTheDocument()
      expect(showConfirmDialog).toHaveBeenCalledWith('Hapus artikel "Artikel Draf"?')
      expect(blogApi.deletePost).toHaveBeenCalledWith(12)
    })

    it('tidak menghapus artikel bila konfirmasi dibatalkan', async () => {
      showConfirmDialog.mockResolvedValue(false)
      render(<App />)
      fireEvent.click(await screen.findByLabelText('Menu Artikel Draf'))
      fireEvent.click(screen.getByText('Hapus'))

      await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled())
      expect(blogApi.deletePost).not.toHaveBeenCalled()
    })

    it('menampilkan dialog error ketika penghapusan gagal', async () => {
      blogApi.deletePost.mockRejectedValue(new Error('gagal hapus'))
      render(<App />)
      fireEvent.click(await screen.findByLabelText('Menu Artikel Draf'))
      fireEvent.click(screen.getByText('Hapus'))
      await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('gagal hapus'))
    })
  })

  describe('AI Blog Generator', () => {
    beforeEach(() => {
      setSession(member)
      goTo('/author')
    })

    it('membuat draf lalu membukanya di editor artikel dan menyimpannya', async () => {
      render(<App />)
      fireEvent.click(await screen.findByText('AI Generator'))
      expect(await screen.findByTestId('ai-post-modal')).toBeInTheDocument()

      fireEvent.change(screen.getByLabelText('Topik Artikel'), { target: { value: 'Belajar Go' } })
      fireEvent.click(screen.getByText('Buat Draf Artikel'))
      expect(await screen.findByTestId('ai-draft')).toBeInTheDocument()
      expect(blogApi.generateAiPost).toHaveBeenCalledWith({
        topic: 'Belajar Go',
        category: '',
        include_web_search: true,
      })

      fireEvent.click(screen.getByText('Gunakan Draf Ini'))
      expect(screen.queryByTestId('ai-post-modal')).not.toBeInTheDocument()
      expect(await screen.findByLabelText('Judul Artikel')).toHaveValue('Draf AI')

      fireEvent.click(screen.getByText('Simpan Artikel'))
      await waitFor(() =>
        expect(blogApi.createPost).toHaveBeenCalledWith(expect.objectContaining({ title: 'Draf AI', content: '## Isi AI' }))
      )
    })

    it('menampilkan dialog error saat generator gagal dan modal bisa ditutup', async () => {
      blogApi.generateAiPost.mockRejectedValue(new Error('openai down'))
      render(<App />)
      fireEvent.click(await screen.findByText('AI Generator'))
      fireEvent.change(await screen.findByLabelText('Topik Artikel'), { target: { value: 'Go' } })
      fireEvent.click(screen.getByText('Buat Draf Artikel'))

      await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('openai down'))
      expect(screen.queryByTestId('ai-draft')).not.toBeInTheDocument()

      fireEvent.click(await screen.findByText('Batal'))
      expect(screen.queryByTestId('ai-post-modal')).not.toBeInTheDocument()
    })
  })

  describe('panel admin', () => {
    beforeEach(() => {
      setSession(admin)
    })

    it('menampilkan direktori pengguna dan arsip artikel serta memonitor pengguna', async () => {
      goTo('/admin')
      adminApi.getUserPosts.mockResolvedValue([
        { id: 11, title: 'Artikel Milik Member', category: 'Teknologi', is_published: true },
      ])
      render(<App />)

      expect(await screen.findByTestId('admin-dashboard')).toBeInTheDocument()
      expect(await screen.findByText('member@delcom.org')).toBeInTheDocument()

      fireEvent.click(screen.getByLabelText('Monitoring Artikel member'))
      expect(await screen.findByText('Artikel Milik Member')).toBeInTheDocument()
      expect(adminApi.getUserPosts).toHaveBeenCalledWith(2)
    })

    it('menampilkan dialog error saat monitoring gagal', async () => {
      goTo('/admin')
      adminApi.getUserPosts.mockRejectedValue(new Error('gagal monitoring'))
      render(<App />)

      fireEvent.click(await screen.findByLabelText('Monitoring Artikel member'))
      await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('gagal monitoring'))
      expect(await screen.findByTestId('empty-inspected')).toBeInTheDocument()
    })

    it('admin yang men-toggle artikel juga memuat ulang data admin', async () => {
      goTo('/author')
      render(<App />)
      await waitFor(() => expect(adminApi.getUsers).toHaveBeenCalledTimes(1))

      fireEvent.click(await screen.findByRole('switch', { name: 'Terbitkan Artikel Draf' }))
      await waitFor(() => expect(adminApi.getUsers).toHaveBeenCalledTimes(2))
    })

    it('navbar menampilkan tautan Admin Panel', async () => {
      render(<App />)
      fireEvent.click(await screen.findByText('Admin Panel'))
      expect(await screen.findByTestId('admin-dashboard')).toBeInTheDocument()
      expect(window.location.pathname).toBe('/admin')
    })
  })
})