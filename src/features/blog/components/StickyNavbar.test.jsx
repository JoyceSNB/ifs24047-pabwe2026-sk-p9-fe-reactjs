import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import StickyNavbar from './StickyNavbar'

const accents = [
  { id: 'indigo', name: 'Indigo', hex: '#6366f1' },
  { id: 'rose', name: 'Rose', hex: '#f43f5e' },
]

function setup(props = {}) {
  const handlers = {
    onToggleMode: vi.fn(),
    onChangeAccent: vi.fn(),
    onNavigate: vi.fn(),
    onLogout: vi.fn(),
  }
  render(<StickyNavbar user={null} mode="light" accent="indigo" accents={accents} {...handlers} {...props} />)
  return handlers
}

describe('StickyNavbar', () => {
  it('menampilkan tombol Masuk dan Daftar untuk tamu', () => {
    const h = setup()
    expect(screen.queryByText('Workspace Penulis')).not.toBeInTheDocument()
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Masuk'))
    expect(h.onNavigate).toHaveBeenCalledWith('/login')
    fireEvent.click(screen.getByText('Daftar'))
    expect(h.onNavigate).toHaveBeenCalledWith('/register')
    fireEvent.click(screen.getByText('Beranda'))
    expect(h.onNavigate).toHaveBeenCalledWith('/')
    fireEvent.click(screen.getByLabelText('Delcom Blog'))
    expect(h.onNavigate).toHaveBeenCalledTimes(4)
  })

  it('menampilkan Workspace Penulis dan tombol Keluar untuk anggota', () => {
    const h = setup({ user: { username: 'budi', role: 'member' } })
    expect(screen.getByTestId('navbar-username')).toHaveTextContent('budi')
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Workspace Penulis'))
    expect(h.onNavigate).toHaveBeenCalledWith('/author')
    fireEvent.click(screen.getByText('Keluar'))
    expect(h.onLogout).toHaveBeenCalled()
  })

  it('menampilkan Admin Panel untuk admin', () => {
    const h = setup({ user: { username: 'admin', role: 'admin' } })
    fireEvent.click(screen.getByText('Admin Panel'))
    expect(h.onNavigate).toHaveBeenCalledWith('/admin')
  })

  it('mengganti mode gelap/terang dan aksen warna', () => {
    const h = setup({ mode: 'dark', accent: 'rose' })
    fireEvent.click(screen.getByLabelText('Toggle Mode Gelap Terang'))
    expect(h.onToggleMode).toHaveBeenCalled()

    fireEvent.click(screen.getByLabelText('Tema Indigo'))
    expect(h.onChangeAccent).toHaveBeenCalledWith('indigo')
    expect(screen.getByLabelText('Tema Rose').className).toContain('ring-2')
    expect(screen.getByLabelText('Tema Indigo').className).not.toContain('ring-2')
  })
})
