import React, { useState } from 'react'
import { IconEye, IconShield } from '@tabler/icons-react'
import { formatDate } from '../../../helpers/toolsHelper'

const statusBadge = (published) =>
  published
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'

export default function AdminDashboard({ users, posts, onLoadUserPosts }) {
  const [inspected, setInspected] = useState(null)

  const handleInspect = async (user) => {
    const userPosts = await onLoadUserPosts(user.id)
    setInspected({ username: user.username, posts: userPosts })
  }

  return (
    <div className="w-full space-y-8" data-testid="admin-dashboard">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Panel Administrasi</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Memantau seluruh pengguna dan membaca arsip artikel dari semua penulis.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Direktori Pengguna</h2>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-sm divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Username</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3 text-center">Total Artikel</th>
                <th className="px-6 py-3 text-center">Total Terbit</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400" data-testid="empty-users">
                    Tidak ada data pengguna.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 text-slate-500">{u.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">{u.username}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          u.role === 'admin'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {u.total_posts}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                      {u.total_published}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleInspect(u)}
                        aria-label={`Monitoring Artikel ${u.username}`}
                        className="px-3 py-1.5 rounded-lg border border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 text-xs font-medium cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <IconEye size={14} />
                        <span>Monitoring Artikel</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Arsip Seluruh Artikel</h2>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-sm divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Judul</th>
                <th className="px-6 py-3">Penulis</th>
                <th className="px-6 py-3">Kategori</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3">Dibuat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400" data-testid="empty-admin-posts">
                    Belum ada artikel di sistem.
                  </td>
                </tr>
              ) : (
                posts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">{p.title}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{p.user.username}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{p.category}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(p.is_published)}`}>
                        {p.is_published ? 'Terbit' : 'Draf'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{formatDate(p.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {inspected && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          data-testid="inspect-modal"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col my-auto">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-5 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <span className="p-1.5 bg-white/10 rounded-lg flex items-center justify-center">
                  <IconShield size={20} />
                </span>
                <h3 className="text-base font-bold">Monitoring Artikel: {inspected.username} (Read-Only)</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspected(null)}
                aria-label="Tutup monitoring"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl font-bold transition cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="divide-y divide-slate-200 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                {inspected.posts.length === 0 ? (
                  <p className="p-6 text-center text-xs text-slate-400" data-testid="empty-inspected">
                    Pengguna ini belum memiliki artikel.
                  </p>
                ) : (
                  inspected.posts.map((p) => (
                    <div key={p.id} className="p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{p.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{p.category}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${statusBadge(p.is_published)}`}>
                        {p.is_published ? 'Terbit' : 'Draf'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200/80 dark:border-slate-800 px-6 py-4 flex justify-end">
              <button
                type="button"
                onClick={() => setInspected(null)}
                className="px-6 py-2 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-medium text-sm transition cursor-pointer"
              >
                Tutup Pemantauan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}