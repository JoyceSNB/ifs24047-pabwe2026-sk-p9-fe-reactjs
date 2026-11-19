import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiHelper from '../../../helpers/apiHelper'
import blogApi from './blogApi'

vi.mock('../../../helpers/apiHelper', () => ({
  default: { fetchData: vi.fn() },
}))

describe('blogApi', () => {
  beforeEach(() => {
    apiHelper.fetchData.mockReset()
    apiHelper.fetchData.mockResolvedValue({ data: 'DATA' })
  })

  it('getCategories memanggil endpoint kategori publik', async () => {
    expect(await blogApi.getCategories()).toBe('DATA')
    expect(apiHelper.fetchData).toHaveBeenCalledWith('/public/categories')
  })

  it('getPublicPosts membangun query string sesuai filter', async () => {
    await blogApi.getPublicPosts({ q: '', category: '' })
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/public/posts')

    await blogApi.getPublicPosts({ q: 'golang', category: '' })
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/public/posts?q=golang')

    await blogApi.getPublicPosts({ q: '', category: 'Teknologi' })
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/public/posts?category=Teknologi')

    const data = await blogApi.getPublicPosts({ q: 'go gin', category: 'Gaya Hidup' })
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/public/posts?q=go+gin&category=Gaya+Hidup')
    expect(data).toBe('DATA')
  })

  it('getPublicPostBySlug meng-encode slug', async () => {
    expect(await blogApi.getPublicPostBySlug('artikel satu')).toBe('DATA')
    expect(apiHelper.fetchData).toHaveBeenCalledWith('/public/posts/artikel%20satu')
  })

  it('getPosts dan getStats membaca data milik penulis', async () => {
    expect(await blogApi.getPosts()).toBe('DATA')
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/posts')
    expect(await blogApi.getStats()).toBe('DATA')
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/posts/stats')
  })

  it('createPost dan updatePost mengirim body JSON', async () => {
    const payload = { title: 'Judul', content: 'Isi' }
    expect(await blogApi.createPost(payload)).toBe('DATA')
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    expect(await blogApi.updatePost(7, payload)).toBe('DATA')
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/posts/7', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  })

  it('togglePublish dan deletePost memakai method yang sesuai', async () => {
    expect(await blogApi.togglePublish(3)).toBe('DATA')
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/posts/3/toggle-publish', { method: 'PATCH' })

    expect(await blogApi.deletePost(3)).toBe('DATA')
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/posts/3', { method: 'DELETE' })
  })

  it('generateAiPost mengirim parameter generator', async () => {
    const params = { topic: 'Go', category: '', include_web_search: true }
    expect(await blogApi.generateAiPost(params)).toBe('DATA')
    expect(apiHelper.fetchData).toHaveBeenCalledWith('/posts/ai-generate', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  })
})
