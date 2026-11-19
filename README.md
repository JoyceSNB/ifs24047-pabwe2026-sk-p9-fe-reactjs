# PABWE 2026 Praktikum 9 — Delcom Blog Frontend (ReactJS)

Frontend Single Page Application (SPA) untuk aplikasi **Delcom Blog** dengan arsitektur **Feature-First Approach & TDD (100% Code Coverage)**, dibangun menggunakan **React 18**, **Vite**, **Tailwind CSS**, dan **Toast UI Editor**. Frontend ini mengonsumsi backend Golang Gin (`ifs24047-pabwe2026-sk-p9-be-golang-gin`) pada `http://localhost:8081`.

---

## 🧭 Tiga Tingkatan Tampilan

| Tingkat | Rute | Fitur |
|---|---|---|
| **Publik (Guest)** | `/` atau `/public`, `/posts/:slug` | Galeri artikel, pencarian real-time, filter kategori (pill), baca artikel Markdown beserta reading time, tautan Login/Register. Sticky top navbar tanpa sidebar. |
| **Penulis (Member)** | `/author` | 3 kartu statistik (Total Artikel, Total Terbit, Belum Selesai/Draf), tabel artikel dengan menu kebab (⋮), switch toggle terbit/draf, modal editor layar penuh, dan AI Blog Generator. |
| **Admin** | `/admin` | Direktori pengguna (ID, username, email, role, total artikel, total terbit), monitoring artikel per pengguna (read-only), dan arsip seluruh artikel. |
| **Auth** | `/login`, `/register` | Halaman mandiri. Input login: `id="login-username"`, `id="login-password"`, tombol `id="login-submit"`. |

Routing SPA memakai `window.history.pushState` dan event `popstate`, sehingga saat halaman di-refresh pengguna tetap berada pada rute yang sama.

## 🗂️ Struktur Proyek

```text
src/
├── main.jsx                       # React root entry point
├── index.css                      # Tailwind + tema aksen warna
├── setupTests.js                  # Konfigurasi test (URL API)
├── App.jsx                        # Orkestrator SPA: routing, sesi login, handler
├── components/
│   ├── MarkdownEditor.jsx         # Wrapper Toast UI Editor
│   └── MarkdownViewer.jsx         # Wrapper Toast UI Viewer
├── helpers/
│   ├── apiHelper.js               # Wrapper fetch + token Bearer
│   └── toolsHelper.js             # Dialog SweetAlert2 & format tanggal
├── hooks/
│   ├── useInput.js
│   └── useTheme.js                # Mode gelap/terang & aksen warna
├── services/api.js                # Penyimpanan token/user & apiRequest
└── features/
    ├── auth/      (api, components/AuthPage, modals/AuthModal)
    ├── blog/
    │   ├── api/blogApi.js
    │   ├── components/            # StickyNavbar, PublicArticleList, PublicArticleDetail,
    │   │                          # AuthorDashboard, PostStats
    │   └── modals/                # PostModal, AiPostGeneratorModal (layar penuh)
    └── admin/     (api/adminApi.js, components/AdminDashboard)
```

Setiap berkas memiliki pasangan `*.test.js(x)`.

## ⚙️ Konfigurasi

```bash
cp .env.example .env
```

```env
VITE_API_BASE_URL=http://localhost:8081/api
```

Pada mode pengembangan Vite berjalan di **port 5174** dan mem-proxy `/api` ke `http://localhost:8081`.

## ▶️ Menjalankan

Pastikan backend sudah berjalan di `http://localhost:8081`, lalu:

```bash
npm install
npm run dev
```

Buka `http://localhost:5174`. Akun contoh dari seeder backend: `admin / admin` dan `member / member`.

## ✅ Pengujian (Vitest, 100% Coverage)

```bash
npm test
```

Output wajib menunjukkan seluruh berkas lulus dengan **100% Statements, 100% Branches, 100% Functions, dan 100% Lines**.

## 🏗️ Build Produksi

```bash
npm run build
npm run preview
```
