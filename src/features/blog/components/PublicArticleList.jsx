import React from 'react'
import { IconSearch, IconClock } from '@tabler/icons-react'
import { formatDate } from '../../../helpers/toolsHelper'

export default function PublicArticleList({
  posts,
  categories,
  activeCategory,
  searchQuery,
  onSearchChange,
  onCategoryChange,
  onOpenPost,
}) {
  const pills = [{ label: 'Semua', value: '' }, ...categories.map((c) => ({ label: c, value: c }))]

  return (
    <div className="space-y-6" data-testid="public-article-list">
      <div className="text-center space-y-2 py-4">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Delcom Blog
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
          Kumpulan artikel teknologi, pendidikan, dan gaya hidup dari para penulis Delcom.
        </p>
      </div>

      <div className="relative max-w-xl mx-auto">
        <IconSearch size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          aria-label="Cari artikel"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari artikel berdasarkan judul atau ringkasan..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm shadow-xs"
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2" data-testid="category-pills">
        {pills.map((pill) => (
          <button
            key={pill.label}
            type="button"
            onClick={() => onCategoryChange(pill.value)}
            aria-pressed={activeCategory === pill.value}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition cursor-pointer ${
              activeCategory === pill.value
                ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-primary-500'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-slate-400" data-testid="empty-posts">
          Belum ada artikel yang cocok dengan pencarian Anda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <button
              key={post.id}
              type="button"
              onClick={() => onOpenPost(post.slug)}
              data-testid={`post-card-${post.id}`}
              className="text-left bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md overflow-hidden transition cursor-pointer flex flex-col"
            >
              {post.cover_image_path ? (
                <img src={post.cover_image_path} alt={post.title} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-primary-500 to-primary-700" />
              )}
              <div className="p-5 flex-1 flex flex-col gap-3">
                <span className="self-start text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300">
                  {post.category}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">{post.title}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex-1">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>
                    {post.user.username} · {formatDate(post.published_at)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <IconClock size={14} />
                    {post.reading_time} menit baca
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
