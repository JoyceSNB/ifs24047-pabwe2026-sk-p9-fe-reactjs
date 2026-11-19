import React, { useState } from 'react'
import { IconPlus, IconSparkles, IconDotsVertical, IconEye, IconPencil, IconTrash } from '@tabler/icons-react'
import PostStats from './PostStats'
import { formatDate } from '../../../helpers/toolsHelper'

export default function AuthorDashboard({
  stats,
  posts,
  onCreate,
  onEdit,
  onDelete,
  onTogglePublish,
  onOpenAi,
  onOpenPost,
}) {
  const [openMenuId, setOpenMenuId] = useState(null)

  const runAction = (action, post) => {
    setOpenMenuId(null)
    action(post)
  }

  return (
    <div className="w-full space-y-6" data-testid="author-dashboard">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Workspace Penulis</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Kelola artikel Anda: tulis, ubah, terbitkan, atau jadikan draf kembali.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAi}
            className="px-4 py-2 rounded-xl border border-primary-600 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/50 text-sm font-semibold transition cursor-pointer inline-flex items-center gap-1.5"
          >
            <IconSparkles size={16} />
            <span>AI Generator</span>
          </button>
          <button
            type="button"
            onClick={onCreate}
            className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition cursor-pointer inline-flex items-center gap-1.5"
          >
            <IconPlus size={16} />
            <span>Tambah Artikel</span>
          </button>
        </div>
      </div>

      <PostStats stats={stats} />

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-sm divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3">Judul</th>
              <th className="px-6 py-3">Kategori</th>
              <th className="px-6 py-3 text-center">Waktu Baca</th>
              <th className="px-6 py-3 text-center">Terbit</th>
              <th className="px-6 py-3">Diperbarui</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400" data-testid="empty-author-posts">
                  Belum ada artikel. Klik &quot;Tambah Artikel&quot; untuk mulai menulis.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">{post.title}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{post.category}</td>
                  <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">{post.reading_time} mnt</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={post.is_published}
                      aria-label={`Terbitkan ${post.title}`}
                      onClick={() => onTogglePublish(post)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer ${
                        post.is_published ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          post.is_published ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{formatDate(post.updated_at)}</td>
                  <td className="px-6 py-4 text-right relative">
                    <button
                      type="button"
                      aria-label={`Menu ${post.title}`}
                      onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <IconDotsVertical size={18} />
                    </button>
                    {openMenuId === post.id && (
                      <div
                        className="absolute right-6 top-12 z-20 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 text-left"
                        data-testid={`post-menu-${post.id}`}
                      >
                        {post.is_published && (
                          <button
                            type="button"
                            onClick={() => runAction(() => onOpenPost(post.slug), post)}
                            className="w-full px-4 py-2 text-sm flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                          >
                            <IconEye size={15} />
                            <span>Lihat</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => runAction(onEdit, post)}
                          className="w-full px-4 py-2 text-sm flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          <IconPencil size={15} />
                          <span>Ubah</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => runAction(onDelete, post)}
                          className="w-full px-4 py-2 text-sm flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        >
                          <IconTrash size={15} />
                          <span>Hapus</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
