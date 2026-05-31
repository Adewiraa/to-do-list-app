# 📝 To-Do List App

Aplikasi manajemen tugas berbasis web yang dibangun dengan arsitektur **full-stack monorepo**. Proyek ini terdiri dari dua bagian utama: REST API berbasis **Laravel** sebagai backend dan antarmuka pengguna berbasis **Next.js** sebagai frontend.

---

## 📁 Struktur Repositori

```
to-do-list-app/
├── Back-end/       # REST API Laravel 13
├── Front-End/      # Aplikasi Next.js 16
├── .gitignore
└── README.md
```

---

## 🚀 Teknologi yang Digunakan

### Backend (`Back-end/`)
| Teknologi | Versi | Kegunaan |
|---|---|---|
| PHP | ^8.3 | Bahasa Pemrograman |
| Laravel | ^13.8 | Framework Backend |
| Laravel Sanctum | ^4.3 | Autentikasi API (Token) |
| MySQL | - | Database |
| PHPUnit | ^12 | Testing |

### Frontend (`Front-End/`)
| Teknologi | Versi | Kegunaan |
|---|---|---|
| Next.js | 16.2.6 | Framework React (App Router) |
| React | 19.2.4 | Library UI |
| TypeScript | ^5 | Keamanan Tipe Data |
| Tailwind CSS | ^4 | Styling |
| TanStack Query | ^5 | Manajemen State Server |
| React Hook Form | ^7 | Manajemen Form |
| Zod | ^4 | Validasi Skema |
| Axios | ^1 | HTTP Client |
| Recharts | ^3 | Visualisasi Data |
| Lucide React | ^1 | Ikon |
| Storybook | ^10 | Pengembangan Komponen UI |
| Vitest | ^4 | Unit Testing |

---

## ✨ Fitur Utama

- 🔐 **Autentikasi** — Register, Login, Logout menggunakan token berbasis Sanctum
- ✅ **Manajemen Tugas** — Buat, lihat, perbarui, dan hapus tugas dengan dukungan soft-delete
- 🏷️ **Kategori** — Kelompokkan tugas berdasarkan kategori yang dapat dikustomisasi
- 📊 **Dashboard** — Ringkasan statistik tugas dan grafik tren produktivitas secara real-time
- 🔔 **Pengingat Tugas** — Jadwal otomatis untuk notifikasi pengingat tugas
- 📖 **Storybook** — Pengembangan dan dokumentasi komponen UI secara terisolasi
- 🛡️ **Validasi Form** — Validasi sisi klien dengan Zod dan sisi server dengan Laravel Form Request
- 🗑️ **Konfirmasi Hapus** — Dialog konfirmasi sebelum menghapus tugas atau kategori

---

## ⚙️ Cara Memulai

### Prasyarat

Pastikan perangkat lunak berikut sudah terpasang:
- **PHP** >= 8.3
- **Composer**
- **Node.js** >= 18
- **pnpm** >= 9
- **MySQL** (atau Laragon / XAMPP)

---

### 🔧 Setup Backend

Lihat panduan lengkap di [Back-end/README.md](Back-end/README.md)

```bash
cd Back-end
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

API tersedia di: `http://localhost:8000`

---

### 🎨 Setup Frontend

Lihat panduan lengkap di [Front-End/README.md](Front-End/README.md)

```bash
cd Front-End
pnpm install
cp .env.example .env.local
# Atur NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
pnpm dev
```

Aplikasi tersedia di: `http://localhost:3000`

---

## 🗂️ Endpoint API

Base URL: `http://localhost:8000/api/v1`

| Metode | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/register` | Daftar akun baru |
| `POST` | `/login` | Login dan dapatkan token |
| `POST` | `/logout` | Logout (cabut token) |
| `GET` | `/dashboard` | Statistik & ringkasan tugas |
| `GET` | `/tasks` | Daftar semua tugas |
| `POST` | `/tasks` | Buat tugas baru |
| `PUT` | `/tasks/{id}` | Perbarui tugas |
| `DELETE` | `/tasks/{id}` | Hapus tugas (soft-delete) |
| `PATCH` | `/tasks/{id}/toggle` | Toggle status selesai |
| `GET` | `/categories` | Daftar semua kategori |
| `POST` | `/categories` | Buat kategori baru |
| `PUT` | `/categories/{id}` | Perbarui kategori |
| `DELETE` | `/categories/{id}` | Hapus kategori |

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License** — lihat file [LICENSE](Back-end/LICENSE) untuk detail.

---

> Dibuat dengan ❤️ oleh [Adewiraa](https://github.com/Adewiraa)
