import React, { useState } from 'react'
import { IconArticle } from '@tabler/icons-react'
import MarkdownEditor from '../../../components/MarkdownEditor'

const EMPTY_POST = { title: '', category: 'Umum', excerpt: '', content: '', cover_image_path: '' }

const fieldClass =
  'w-full px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm shadow-xs'

export default function PostModal({ post, initialData, categories, onClose, onSave }) {
  const source = post || initialData || EMPTY_POST
  const [title, setTitle] = useState(source.title)
  const [category, setCategory] = useState(source.category)
  const [excerpt, setExcerpt] = useState(source.excerpt)
  const [content, setContent] = useState(source.content)
  const [coverImagePath, setCoverImagePath] = useState(source.cover_image_path || '')
  const [isPublished, setIsPublished] = useState(Boolean(source.is_published))

  const handleSubmit = (e) => {
    e.preventDefault()
    const clearedCover = coverImagePath === '' && Boolean(source.cover_image_path)
    onSave({
      title,
      category,
      excerpt,
      content,
      cover_image_path: clearedCover ? 'DELETE' : coverImagePath,
      is_published: isPublished,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-100 dark:bg-slate-950 flex flex-col overflow-hidden animate-fadeIn"
      data-testid="post-modal"
    >
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 sm:px-8 py-4 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-white/10 rounded-xl flex items-center justify-center">
            <IconArticle size={24} />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">{post ? 'Ubah Artikel' : 'Tambah Artikel Baru'}</h2>
            <p className="text-xs text-primary-100">Tulis artikel dalam format Markdown, lalu simpan sebagai draf atau terbitkan</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl font-bold transition cursor-pointer"
        >
          &times;
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <form id="post-form" onSubmit={handleSubmit} className="w-full max-w-[96vw] mx-auto space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Judul Artikel <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              aria-label="Judul Artikel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Mengenal Clean Architecture di Golang"
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Kategori</label>
              <select
                aria-label="Kategori"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={fieldClass}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Gambar Sampul (URL)
              </label>
              <input
                type="text"
                aria-label="Gambar Sampul"
                value={coverImagePath}
                onChange={(e) => setCoverImagePath(e.target.value)}
                placeholder="https://contoh.com/gambar.jpg"
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Ringkasan (Excerpt)
            </label>
            <textarea
              aria-label="Ringkasan"
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Ringkasan singkat artikel (kosongkan untuk dibuat otomatis)"
              className={fieldClass}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Isi Artikel (Markdown) <span className="text-rose-500">*</span>
            </label>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              height="450px"
              placeholder="Tulis isi artikel dalam format Markdown..."
            />
          </div>

          {!post && (
            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                aria-label="Terbitkan sekarang"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 accent-emerald-600"
              />
              <span>Terbitkan sekarang</span>
            </label>
          )}
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 px-6 sm:px-8 py-4 flex justify-end gap-3 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition cursor-pointer"
        >
          Batal
        </button>
        <button
          type="submit"
          form="post-form"
          className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm shadow-md transition cursor-pointer"
        >
          Simpan Artikel
        </button>
      </div>
    </div>
  )
}
