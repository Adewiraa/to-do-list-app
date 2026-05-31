# 🎨 Frontend — To-Do List App

Antarmuka pengguna untuk aplikasi manajemen tugas yang dibangun menggunakan **Next.js 16** dengan **App Router**, **TypeScript**, dan **Tailwind CSS**.

---

## 🚀 Teknologi

| Teknologi | Versi | Kegunaan |
|---|---|---|
| Next.js | 16.2.6 | Framework React (App Router) |
| React | 19.2.4 | Library UI |
| TypeScript | ^5 | Keamanan Tipe Data |
| Tailwind CSS | ^4 | Utility-first CSS Framework |
| TanStack Query | ^5 | Manajemen State Server & Caching |
| React Hook Form | ^7 | Manajemen & Kontrol Form |
| Zod | ^4 | Validasi Skema Form |
| Axios | ^1 | HTTP Client untuk API |
| Recharts | ^3 | Grafik & Visualisasi Data |
| Lucide React | ^1 | Library Ikon |
| Storybook | ^10 | Pengembangan Komponen UI |
| Vitest | ^4 | Unit & Integration Testing |

---

## 📁 Struktur Direktori

```
Front-End/
├── .storybook/             # Konfigurasi Storybook
├── public/                 # Aset statis
├── src/
│   ├── app/                # Halaman (Next.js App Router)
│   │   ├── page.tsx        # Halaman Login
│   │   ├── register/       # Halaman Register
│   │   ├── dashboard/      # Halaman Dashboard
│   │   ├── tasks/          # Halaman Manajemen Tugas
│   │   ├── categories/     # Halaman Manajemen Kategori
│   │   ├── layout.tsx      # Layout Global
│   │   └── globals.css     # Styling Global
│   ├── components/         # Komponen UI yang dapat digunakan ulang
│   ├── context/            # React Context (AuthContext)
│   ├── lib/                # Utilitas, API client, validasi
│   │   ├── api.ts          # Definisi semua API call
│   │   ├── schemas.ts      # Skema validasi Zod
│   │   └── utils.ts        # Fungsi utilitas umum
│   └── stories/            # Storybook stories
├── .env.local              # Variabel environment (tidak di-commit)
├── next.config.ts          # Konfigurasi Next.js
├── tailwind.config.ts      # Konfigurasi Tailwind CSS
└── package.json
```

---

## ⚙️ Cara Instalasi

### 1. Masuk ke direktori frontend

```bash
cd Front-End
```

### 2. Install dependensi

```bash
pnpm install
```

### 3. Salin dan konfigurasi file environment

```bash
cp .env.example .env.local
```

Edit file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 4. Jalankan server development

```bash
pnpm dev
```

Aplikasi tersedia di: `http://localhost:3000`

---

## 📄 Halaman Aplikasi

| Halaman | Route | Deskripsi |
|---|---|---|
| Login | `/` | Halaman masuk ke aplikasi |
| Register | `/register` | Halaman daftar akun baru |
| Dashboard | `/dashboard` | Ringkasan statistik dan grafik tugas |
| Tugas | `/tasks` | Manajemen tugas lengkap |
| Kategori | `/categories` | Manajemen kategori tugas |

---

## ✨ Fitur Antarmuka

- 🔐 **Form Login & Register** — Validasi lengkap sisi klien dengan Zod
- 📊 **Dashboard Interaktif** — Statistik tugas, grafik tren produktivitas mingguan
- ✅ **Manajemen Tugas** — Filter berdasarkan status, prioritas, kategori; toggle selesai dengan satu klik
- 🏷️ **Manajemen Kategori** — Buat dan kelola kategori dengan warna kustom
- 🗑️ **Konfirmasi Hapus** — Modal dialog konfirmasi sebelum menghapus data
- ⏳ **Loading State** — Indikator loading yang konsisten di seluruh halaman
- 📱 **Responsif** — Tampilan menyesuaikan berbagai ukuran layar

---

## 📖 Storybook

Storybook digunakan untuk pengembangan dan dokumentasi komponen UI secara terisolasi.

```bash
pnpm storybook
```

Storybook tersedia di: `http://localhost:6006`

---

## 🧪 Menjalankan Test

```bash
# Jalankan semua unit test
pnpm vitest

# Jalankan test dengan mode watch
pnpm vitest --watch

# Lihat laporan coverage
pnpm vitest --coverage
```

---

## 📦 Perintah yang Tersedia

| Perintah | Deskripsi |
|---|---|
| `pnpm dev` | Jalankan server development di `localhost:3000` |
| `pnpm build` | Build aplikasi untuk production |
| `pnpm start` | Jalankan hasil build production |
| `pnpm lint` | Periksa kode dengan ESLint |
| `pnpm storybook` | Jalankan Storybook di `localhost:6006` |
| `pnpm build-storybook` | Build Storybook untuk production |
| `pnpm vitest` | Jalankan unit test |

---

## 🔗 Konfigurasi API

Semua pemanggilan API didefinisikan di `src/lib/api.ts`. Pastikan backend Laravel sudah berjalan dan variabel `NEXT_PUBLIC_API_URL` sudah dikonfigurasi dengan benar di `.env.local`.

Autentikasi menggunakan **Bearer Token** yang disimpan di `localStorage` setelah login berhasil.

---

## 📄 Lisensi

Dilisensikan di bawah **MIT License**.
