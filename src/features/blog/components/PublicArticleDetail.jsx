import React from 'react'
import { IconArrowLeft, IconClock } from '@tabler/icons-react'
import MarkdownViewer from '../../../components/MarkdownViewer'
import { formatDate } from '../../../helpers/toolsHelper'

export default function PublicArticleDetail({ post, loading, onBack }) {
  const backButton = (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
    >
      <IconArrowLeft size={16} />
      <span>Kembali ke Beranda</span>
    </button>
  )

  if (loading) {
    return (
      <div className="w-full text-center py-20 text-slate-400" data-testid="article-loading">
        Memuat artikel...
      </div>
    )
  }

  if (!post) {
    return (
      <div className="w-full text-center py-20 space-y-4" data-testid="article-not-found">
        <p className="text-slate-500 dark:text-slate-400">Artikel tidak ditemukan atau belum diterbitkan.</p>
        {backButton}
      </div>
    )
  }

  return (
    <article className="w-full space-y-6" data-testid="public-article-detail">
      {backButton}

      {post.cover_image_path && (
        <img
          src={post.cover_image_path}
          alt={post.title}
          className="w-full max-h-[420px] object-cover rounded-2xl border border-slate-200 dark:border-slate-800"
        />
      )}

      <header className="space-y-3">
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300">
          {post.category}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
          <span>
            Oleh <strong className="text-slate-700 dark:text-slate-200">{post.user.username}</strong>
          </span>
          <span>{formatDate(post.published_at)}</span>
          <span className="inline-flex items-center gap-1">
            <IconClock size={14} />
            {post.reading_time} menit baca
          </span>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-8">
        <MarkdownViewer content={post.content} />
      </div>
    </article>
  )
}
