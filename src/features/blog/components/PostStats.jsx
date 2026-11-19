import React from 'react'
import { IconArticle, IconCheck, IconNotes } from '@tabler/icons-react'

const cardClass =
  'bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center space-x-3.5 transition-colors'

export default function PostStats({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" data-testid="post-stats">
      <div className={cardClass}>
        <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
          <IconArticle size={20} />
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Total Artikel
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-slate-100" data-testid="stat-total">
            {stats.total}
          </span>
        </div>
      </div>

      <div className={cardClass}>
        <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/40">
          <IconCheck size={20} />
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Total Terbit
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400" data-testid="stat-terbit">
            {stats.total_terbit}
          </span>
        </div>
      </div>

      <div className={cardClass}>
        <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/40">
          <IconNotes size={20} />
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Belum Selesai (Draf)
          </span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400" data-testid="stat-draf">
            {stats.belum_selesai}
          </span>
        </div>
      </div>
    </div>
  )
}
