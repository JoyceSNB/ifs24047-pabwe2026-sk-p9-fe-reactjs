import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiHelper from '../../../helpers/apiHelper'
import adminApi from './adminApi'

vi.mock('../../../helpers/apiHelper', () => ({
  default: { fetchData: vi.fn() },
}))

describe('adminApi', () => {
  beforeEach(() => {
    apiHelper.fetchData.mockReset()
    apiHelper.fetchData.mockResolvedValue({ data: 'DATA' })
  })

  it('getUsers membaca daftar pengguna', async () => {
    expect(await adminApi.getUsers()).toBe('DATA')
    expect(apiHelper.fetchData).toHaveBeenCalledWith('/admin/users')
  })

  it('getPosts membaca arsip seluruh artikel', async () => {
    expect(await adminApi.getPosts()).toBe('DATA')
    expect(apiHelper.fetchData).toHaveBeenCalledWith('/admin/posts')
  })

  it('getUserPosts membaca artikel milik pengguna tertentu', async () => {
    expect(await adminApi.getUserPosts(5)).toBe('DATA')
    expect(apiHelper.fetchData).toHaveBeenCalledWith('/admin/users/5/posts')
  })
})
