# ⚙️ Backend — To-Do List App

REST API untuk aplikasi manajemen tugas yang dibangun menggunakan **Laravel 13** dengan autentikasi berbasis token melalui **Laravel Sanctum**.

---

## 🚀 Teknologi

| Teknologi | Versi | Kegunaan |
|---|---|---|
| PHP | ^8.3 | Bahasa Pemrograman |
| Laravel | ^13.8 | Framework Backend |
| Laravel Sanctum | ^4.3 | Autentikasi API (Token) |
| MySQL | - | Database Relasional |
| PHPUnit | ^12 | Unit Testing |
| Laravel Pint | ^1 | Code Style Formatter |

---

## 📁 Struktur Direktori

```
Back-end/
├── app/
│   ├── Console/Commands/       # Scheduled commands (misal: pengingat tugas)
│   ├── Http/
│   │   ├── Controllers/Api/V1/ # Controller API
│   │   ├── Requests/Api/V1/    # Form Request (validasi server)
│   │   └── Resources/Api/V1/  # API Resource (transformasi response)
│   ├── Models/                 # Eloquent Models
│   └── Policies/               # Authorization Policies
├── database/
│   └── migrations/             # Migrasi database
├── routes/
│   └── api.php                 # Definisi route API
└── .env.example                # Contoh konfigurasi environment
```

---

## ⚙️ Cara Instalasi

### 1. Clone dan masuk ke direktori backend

```bash
cd Back-end
```

### 2. Install dependensi PHP

```bash
composer install
```

### 3. Salin dan konfigurasi file environment

```bash
cp .env.example .env
```

Edit file `.env` dan sesuaikan konfigurasi database:

```env
APP_NAME="To-Do List App"
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=todo_list
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Generate application key

```bash
php artisan key:generate
```

### 5. Jalankan migrasi database

```bash
php artisan migrate
```

### 6. Jalankan server development

```bash
php artisan serve
```

API tersedia di: `http://localhost:8000`

---

## 🗂️ Endpoint API

Base URL: `http://localhost:8000/api/v1`

### 🔐 Autentikasi

| Metode | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| `POST` | `/register` | Daftar akun baru | ❌ |
| `POST` | `/login` | Login dan dapatkan token | ❌ |
| `POST` | `/logout` | Logout (cabut token) | ✅ |

### 📊 Dashboard

| Metode | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| `GET` | `/dashboard` | Statistik dan ringkasan tugas | ✅ |

### ✅ Tugas (Tasks)

| Metode | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| `GET` | `/tasks` | Daftar semua tugas | ✅ |
| `POST` | `/tasks` | Buat tugas baru | ✅ |
| `GET` | `/tasks/{id}` | Detail tugas | ✅ |
| `PUT` | `/tasks/{id}` | Perbarui tugas | ✅ |
| `DELETE` | `/tasks/{id}` | Hapus tugas (soft-delete) | ✅ |
| `PATCH` | `/tasks/{id}/toggle` | Toggle status selesai | ✅ |
| `POST` | `/tasks/{id}/restore` | Pulihkan tugas yang dihapus | ✅ |

### 🏷️ Kategori (Categories)

| Metode | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| `GET` | `/categories` | Daftar semua kategori | ✅ |
| `POST` | `/categories` | Buat kategori baru | ✅ |
| `PUT` | `/categories/{id}` | Perbarui kategori | ✅ |
| `DELETE` | `/categories/{id}` | Hapus kategori | ✅ |

> **Catatan:** Semua endpoint bertanda ✅ memerlukan header `Authorization: Bearer {token}`

---

## 🗃️ Skema Database

```
users
├── id, name, email, password
└── created_at, updated_at

categories
├── id, user_id (FK → users)
├── name, color
└── created_at, updated_at, deleted_at

tasks
├── id, user_id (FK → users), category_id (FK → categories)
├── title, description
├── priority (low | medium | high)
├── status (pending | in_progress | completed)
├── due_date, is_completed
└── created_at, updated_at, deleted_at

task_activities
├── id, task_id (FK → tasks), user_id (FK → users)
├── activity_type, description
└── created_at, updated_at
```

---

## 🧪 Menjalankan Test

```bash
php artisan test
```

---

## 📦 Perintah Artisan yang Berguna

| Perintah | Deskripsi |
|---|---|
| `php artisan serve` | Jalankan server development |
| `php artisan migrate` | Jalankan migrasi database |
| `php artisan migrate:fresh` | Reset dan jalankan ulang semua migrasi |
| `php artisan migrate:rollback` | Batalkan migrasi terakhir |
| `php artisan route:list` | Tampilkan semua route yang terdaftar |
| `php artisan test` | Jalankan semua test |
| `php artisan schedule:run` | Jalankan scheduled tasks secara manual |

---

## 📄 Lisensi

Dilisensikan di bawah **MIT License**.
