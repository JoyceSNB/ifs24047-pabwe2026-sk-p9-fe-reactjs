import React, { useState } from 'react'
import { IconSparkles } from '@tabler/icons-react'
import MarkdownViewer from '../../../components/MarkdownViewer'

const fieldClass =
  'w-full px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none transition text-sm shadow-xs'

export default function AiPostGeneratorModal({ categories, onClose, onGenerate, onUseDraft }) {
  const [topic, setTopic] = useState('')
  const [category, setCategory] = useState('')
  const [includeWebSearch, setIncludeWebSearch] = useState(true)
  const [loading, setLoading] = useState(false)
  const [draft, setDraft] = useState(null)

  const handleGenerate = async (e) => {
    e.preventDefault()
    setLoading(true)
    const result = await onGenerate({ topic, category, include_web_search: includeWebSearch })
    if (result) setDraft(result)
    setLoading(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-100 dark:bg-slate-950 flex flex-col overflow-hidden animate-fadeIn"
      data-testid="ai-post-modal"
    >
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 sm:px-8 py-4 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-white/10 rounded-xl flex items-center justify-center">
            <IconSparkles size={24} />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">AI Blog Generator</h2>
            <p className="text-xs text-primary-100">Buat draf artikel otomatis dengan bantuan AI dan penelusuran web</p>
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
        <div className="w-full max-w-[96vw] mx-auto space-y-6">
          <form
            onSubmit={handleGenerate}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 space-y-4"
          >
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Topik Artikel <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                aria-label="Topik Artikel"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Contoh: Manfaat belajar Golang untuk backend developer"
                className={fieldClass}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Kategori
                </label>
                <select
                  aria-label="Kategori AI"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={fieldClass}
                >
                  <option value="">Otomatis</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer self-end pb-2.5">
                <input
                  type="checkbox"
                  aria-label="Gunakan penelusuran web"
                  checked={includeWebSearch}
                  onChange={(e) => setIncludeWebSearch(e.target.checked)}
                  className="w-4 h-4 accent-primary-600"
                />
                <span>Gunakan penelusuran Search Engine</span>
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-medium text-sm shadow-sm transition cursor-pointer"
            >
              {loading ? 'Menulis draf...' : 'Buat Draf Artikel'}
            </button>
          </form>

          {draft && (
            <div
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 space-y-4"
              data-testid="ai-draft"
            >
              <div className="space-y-2">
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300">
                  {draft.category}
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">{draft.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{draft.excerpt}</p>
              </div>
              <MarkdownViewer content={draft.content} />
              {(draft.sources || []).length > 0 && (
                <div data-testid="ai-sources">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Sumber Rujukan</h4>
                  <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">
                    {draft.sources.map((source) => (
                      <li key={source}>{source}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
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
          type="button"
          disabled={!draft}
          onClick={() => onUseDraft(draft)}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-sm shadow-md transition cursor-pointer"
        >
          Gunakan Draf Ini
        </button>
      </div>
    </div>
  )
}
