import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PostStats from './PostStats'

describe('PostStats', () => {
  it('menampilkan tiga kartu statistik', () => {
    render(<PostStats stats={{ total: 7, total_terbit: 5, belum_selesai: 2 }} />)
    expect(screen.getByTestId('stat-total')).toHaveTextContent('7')
    expect(screen.getByTestId('stat-terbit')).toHaveTextContent('5')
    expect(screen.getByTestId('stat-draf')).toHaveTextContent('2')
    expect(screen.getByText('Total Artikel')).toBeInTheDocument()
    expect(screen.getByText('Total Terbit')).toBeInTheDocument()
    expect(screen.getByText('Belum Selesai (Draf)')).toBeInTheDocument()
  })
})
