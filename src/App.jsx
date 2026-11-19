import React, { useState, useEffect } from 'react'
import { apiRequest, setToken, removeToken, getUser, setUser, removeUser } from './services/api'
import authApi from './features/auth/api/authApi'
import blogApi from './features/blog/api/blogApi'
import adminApi from './features/admin/api/adminApi'
import AuthPage from './features/auth/components/AuthPage'
import StickyNavbar from './features/blog/components/StickyNavbar'
import PublicArticleList from './features/blog/components/PublicArticleList'
import PublicArticleDetail from './features/blog/components/PublicArticleDetail'
import AuthorDashboard from './features/blog/components/AuthorDashboard'
import PostModal from './features/blog/modals/PostModal'
import AiPostGeneratorModal from './features/blog/modals/AiPostGeneratorModal'
import AdminDashboard from './features/admin/components/AdminDashboard'
import useTheme from './hooks/useTheme'
import { showErrorAlert, showConfirmDialog } from './helpers/toolsHelper'

const EMPTY_STATS = { total: 0, total_terbit: 0, belum_selesai: 0 }

export default function App() {
  const { mode, accent, toggleMode, changeAccent, accents } = useTheme()
  const [currentUser, setCurrentUser] = useState(getUser())
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  // Data publik
  const [categories, setCategories] = useState([])
  const [publicPosts, setPublicPosts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [detail, setDetail] = useState({ post: null, loading: true })

  // Data penulis & admin
  const [stats, setStats] = useState(EMPTY_STATS)
  const [myPosts, setMyPosts] = useState([])
  const [adminUsers, setAdminUsers] = useState([])
  const [adminPosts, setAdminPosts] = useState([])

  // Modal & notifikasi
  const [postModal, setPostModal] = useState(null)
  const [isAiOpen, setIsAiOpen] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const navigate = (path) => {
    window.history.pushState({}, '', path)
    setCurrentPath(path)
  }

  const notify = (message) => setStatusMessage(message)

  // Membungkus aksi async agar error apa pun tampil sebagai dialog
  const guard = async (action) => {
    try {
      await action()
    } catch (err) {
      showErrorAlert(err.message)
    }
  }

  const loadPublicPosts = async () => {
    setPublicPosts(await blogApi.getPublicPosts({ q: searchQuery, category: activeCategory }))
  }

  const loadAuthorData = async () => {
    const [newStats, newPosts] = await Promise.all([blogApi.getStats(), blogApi.getPosts()])
    setStats(newStats)
    setMyPosts(newPosts)
  }

  const loadAdminData = async () => {
    const [users, posts] = await Promise.all([adminApi.getUsers(), adminApi.getPosts()])
    setAdminUsers(users)
    setAdminPosts(posts)
  }

  const refreshAll = async () => {
    await loadPublicPosts()
    await loadAuthorData()
    if (currentUser.role === 'admin') await loadAdminData()
  }

  // Sinkronisasi URL peramban (tombol back/forward)
  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Kategori dimuat sekali
  useEffect(() => {
    guard(async () => setCategories(await blogApi.getCategories()))
  }, [])

  // Artikel publik: pencarian real-time & filter kategori
  useEffect(() => {
    guard(loadPublicPosts)
  }, [searchQuery, activeCategory])

  // Detail artikel berdasarkan slug pada URL
  const slugMatch = currentPath.match(/^\/posts\/([^/]+)$/)
  const currentSlug = slugMatch ? decodeURIComponent(slugMatch[1]) : null
  useEffect(() => {
    if (!currentSlug) return
    setDetail({ post: null, loading: true })
    blogApi
      .getPublicPostBySlug(currentSlug)
      .then((post) => setDetail({ post, loading: false }))
      .catch(() => setDetail({ post: null, loading: false }))
  }, [currentSlug])

  // Data workspace penulis & admin mengikuti sesi login
  useEffect(() => {
    if (!currentUser) return
    guard(async () => {
      await loadAuthorData()
      if (currentUser.role === 'admin') await loadAdminData()
    })
  }, [currentUser])

  // ===== Auth =====
  const persistSession = (data) => {
    setToken(data.token)
    setUser(data.user)
    setCurrentUser(data.user)
  }

  const handleLogin = async ({ username, password }) => {
    persistSession(await authApi.login(username, password))
    notify('Berhasil masuk!')
  }

  const handleRegister = async ({ username, email, password }) => {
    persistSession(await authApi.register(username, email, password))
    notify('Pendaftaran berhasil!')
  }

  const handleLogout = async () => {
    await apiRequest('/auth/logout', 'POST').catch(() => {})
    removeToken()
    removeUser()
    setCurrentUser(null)
    setStats(EMPTY_STATS)
    setMyPosts([])
    setAdminUsers([])
    setAdminPosts([])
    notify('Berhasil keluar.')
    navigate('/')
  }

  // ===== Artikel =====
  const openCreateModal = () => setPostModal({ post: null, initialData: null, key: Date.now() })
  const openEditModal = (post) => setPostModal({ post, initialData: null, key: post.id })

  const handleSavePost = (data) =>
    guard(async () => {
      if (postModal.post) {
        await blogApi.updatePost(postModal.post.id, data)
        notify('Artikel berhasil diperbarui!')
      } else {
        await blogApi.createPost(data)
        notify('Artikel baru berhasil dibuat!')
      }
      setPostModal(null)
      await refreshAll()
    })

  const handleTogglePublish = (post) =>
    guard(async () => {
      await blogApi.togglePublish(post.id)
      notify('Status publikasi diperbarui.')
      await refreshAll()
    })

  const handleDeletePost = async (post) => {
    const confirmed = await showConfirmDialog(`Hapus artikel "${post.title}"?`)
    if (!confirmed) return
    await guard(async () => {
      await blogApi.deletePost(post.id)
      notify('Artikel berhasil dihapus.')
      await refreshAll()
    })
  }

  // ===== AI Generator =====
  const handleGenerateAi = async (params) => {
    try {
      return await blogApi.generateAiPost(params)
    } catch (err) {
      showErrorAlert(err.message)
      return null
    }
  }

  const handleUseDraft = (draft) => {
    setIsAiOpen(false)
    setPostModal({ post: null, initialData: draft, key: Date.now() })
  }

  // ===== Admin =====
  const handleLoadUserPosts = async (userId) => {
    try {
      return await adminApi.getUserPosts(userId)
    } catch (err) {
      showErrorAlert(err.message)
      return []
    }
  }

  // ===== Render =====
  if (currentPath === '/login' || currentPath === '/register') {
    return (
      <div data-testid="app-container">
        <AuthPage
          mode={currentPath === '/login' ? 'login' : 'register'}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onNavigate={navigate}
        />
      </div>
    )
  }

  const gate = (message) => (
    <div className="text-center py-20 space-y-4" data-testid="access-gate">
      <p className="text-slate-500 dark:text-slate-400">{message}</p>
      {!currentUser && (
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold cursor-pointer"
        >
          Masuk
        </button>
      )}
    </div>
  )

  const renderContent = () => {
    if (currentPath === '/author') {
      if (!currentUser) return gate('Silakan masuk untuk membuka Workspace Penulis.')
      return (
        <AuthorDashboard
          stats={stats}
          posts={myPosts}
          onCreate={openCreateModal}
          onEdit={openEditModal}
          onDelete={handleDeletePost}
          onTogglePublish={handleTogglePublish}
          onOpenAi={() => setIsAiOpen(true)}
          onOpenPost={(slug) => navigate(`/posts/${slug}`)}
        />
      )
    }

    if (currentPath === '/admin') {
      if (!currentUser) return gate('Silakan masuk untuk membuka Panel Administrasi.')
      if (currentUser.role !== 'admin') return gate('Halaman ini hanya dapat diakses oleh administrator.')
      return <AdminDashboard users={adminUsers} posts={adminPosts} onLoadUserPosts={handleLoadUserPosts} />
    }

    if (currentSlug) {
      return <PublicArticleDetail post={detail.post} loading={detail.loading} onBack={() => navigate('/')} />
    }

    return (
      <PublicArticleList
        posts={publicPosts}
        categories={categories}
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCategoryChange={setActiveCategory}
        onOpenPost={(slug) => navigate(`/posts/${slug}`)}
      />
    )
  }

  const isWorkspace = currentPath === '/author' || currentPath === '/admin'

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors"
      data-testid="app-container"
    >
      <StickyNavbar
        user={currentUser}
        mode={mode}
        accent={accent}
        accents={accents}
        onToggleMode={toggleMode}
        onChangeAccent={changeAccent}
        onNavigate={navigate}
        onLogout={handleLogout}
      />

      {statusMessage && (
        <div
          className="mx-4 mt-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-xs"
          data-testid="status-message"
        >
          <span>{statusMessage}</span>
          <button type="button" aria-label="Tutup notifikasi" onClick={() => setStatusMessage('')} className="cursor-pointer font-bold">
            &times;
          </button>
        </div>
      )}

      <main className={isWorkspace ? 'flex-1 w-full p-4 sm:p-6 lg:p-8' : 'flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8'}>
        {renderContent()}
      </main>

      {postModal && (
        <PostModal
          key={postModal.key}
          post={postModal.post}
          initialData={postModal.initialData}
          categories={categories}
          onClose={() => setPostModal(null)}
          onSave={handleSavePost}
        />
      )}

      {isAiOpen && (
        <AiPostGeneratorModal
          categories={categories}
          onClose={() => setIsAiOpen(false)}
          onGenerate={handleGenerateAi}
          onUseDraft={handleUseDraft}
        />
      )}
    </div>
  )
}
