import React from 'react'
import { IconSun, IconMoon, IconLogout } from '@tabler/icons-react'

const navButton =
  'px-3 py-1.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer'

export default function StickyNavbar({
  user,
  mode,
  accent,
  accents,
  onToggleMode,
  onChangeAccent,
  onNavigate,
  onLogout,
}) {
  return (
    <header
      className="bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs"
      data-testid="sticky-navbar"
    >
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="flex items-center space-x-3 cursor-pointer select-none"
        >
          <span aria-hidden="true" className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            D
          </span>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-lg tracking-tight">Delcom Blog</span>
        </button>

        <nav className="hidden sm:flex items-center gap-1">
          <button type="button" onClick={() => onNavigate('/')} className={navButton}>
            Beranda
          </button>
          {user && (
            <button type="button" onClick={() => onNavigate('/author')} className={navButton}>
              Workspace Penulis
            </button>
          )}
          {user && user.role === 'admin' && (
            <button type="button" onClick={() => onNavigate('/admin')} className={navButton}>
              Admin Panel
            </button>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMode}
          aria-label="Toggle Mode Gelap Terang"
          className="p-1.5 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          {mode === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
        </button>

        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
          {accents.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeAccent(item.id)}
              aria-label={`Tema ${item.name}`}
              className={`w-3.5 h-3.5 rounded-full transition-transform cursor-pointer ${
                accent === item.id ? 'scale-125 ring-2 ring-primary-500' : 'opacity-60 hover:opacity-100'
              }`}
              style={{ backgroundColor: item.hex }}
            />
          ))}
        </div>

        {user ? (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm font-medium text-slate-600 dark:text-slate-300" data-testid="navbar-username">
              {user.username}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl text-sm font-semibold border border-rose-300 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <IconLogout size={16} />
              <span>Keluar</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="px-3.5 py-1.5 rounded-xl text-sm font-semibold border border-primary-600 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/50 transition cursor-pointer"
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/register')}
              className="px-3.5 py-1.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 shadow-sm transition cursor-pointer"
            >
              Daftar
            </button>
          </div>
        )}
      </div>
    </header>
  )
}