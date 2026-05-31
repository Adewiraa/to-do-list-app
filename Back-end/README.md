# 📝 To Do List App - Backend API (Laravel 13)

[![PHP Version](https://img.shields.io/badge/php-%3E%3D%208.3-blue.svg)](https://www.php.net/)
[![Laravel Version](https://img.shields.io/badge/laravel-13.x-red.svg)](https://laravel.com/)
[![Sanctum](https://img.shields.io/badge/auth-sanctum-green.svg)](https://laravel.com/docs/sanctum)
[![License](https://img.shields.io/badge/license-MIT-brightgreen.svg)](#license)

API Engine tangguh, aman, dan berkinerja tinggi untuk aplikasi manajemen tugas (**To Do List App**). Dikembangkan menggunakan **Laravel 13** dan **Laravel Sanctum** untuk sistem otentikasi SPA/Token modern.

---

## ✨ Fitur Utama Backend
* **Otentikasi Aman (Sanctum)**: Registrasi, login, logout, dan manajemen sesi pengguna yang aman via token.
* **CRUD Kategori Berwarna**: Pengelompokan tugas dengan label warna kustom (`color`) dan penanda ikon (`icon`).
* **CRUD Tugas Fleksibel**:
  * Penyaringan canggih: Berdasarkan status (`pending`, `in_progress`, `done`, `cancelled`), prioritas (`low`, `medium`, `high`, `urgent`), kategori, dan tenggat waktu (`today`, `overdue`).
  * Pencarian instan judul tugas (`search`).
  * Pengurutan dinamis berdasarkan tenggat waktu, tingkat prioritas, atau tanggal dibuat.
  * **Soft Deletes**: Fitur pemulihan (*restore*) tugas yang dihapus dari tong sampah.
* **Audit Log Perubahan (Observer)**: Perekaman otomatis riwayat aktivitas perubahan tugas ke tabel `task_activities` (menyimpan perbandingan data JSON sebelum dan setelah disunting).
* **Auto-Timestamp Selesai**: Mengisi otomatis waktu selesai (`completed_at`) jika status tugas diubah menjadi `done`, dan menghapusnya jika dibatalkan.
* **Dashboard Analytics**: Agregasi data persentase penyelesaian, rincian prioritas, dan ringkasan tugas per kategori secara realtime.
* **Rate Limiting (Proteksi DDoS & Brute Force)**:
  * Maksimal 5 percobaan login/registrasi per menit per IP.
  * Maksimal 60 request API umum per menit per pengguna.
* **Sistem Pengingat Tenggat Waktu (Console Schedulers)**: Perintah Artisan otomatis untuk memindai tugas yang hampir jatuh tempo atau sudah terlambat dan mengirimkan simulasinya.

---

## 🛠️ Persyaratan Sistem
* **PHP** `>= 8.3`
* **MySQL/MariaDB**
* **Composer**

---

## 🚀 Panduan Instalasi Lokal

Ikuti langkah-langkah di bawah ini untuk menjalankan backend di komputer lokal Anda:

1. **Buka Terminal** dan arahkan ke folder `Back-end`.
2. **Instal dependensi Composer**:
   ```bash
   composer install
   ```
3. **Salin file konfigurasi lingkungan**:
   ```bash
   cp .env.example .env
   ```
4. **Sesuaikan koneksi database Anda di file `.env`**:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=todolist
   DB_USERNAME=root
   DB_PASSWORD=
   ```
5. **Generate Kunci Aplikasi**:
   ```bash
   php artisan key:generate
   ```
6. **Jalankan Migrasi & Database Seeder** (Untuk membuat tabel & data uji bawaan):
   ```bash
   php artisan migrate:fresh --seed
   ```
7. **Jalankan Web Server**:
   ```bash
   php artisan serve
   ```
   *API Anda sekarang aktif dan berjalan di alamat: **`http://127.0.0.1:8000`***

---

## 🧪 Panduan Pengetesan API

### Metode 1: Menggunakan Postman (Rekomendasi)
Kami telah menyediakan file konfigurasi Postman siap pakai di folder root backend Anda:
1. Buka aplikasi **Postman**.
2. Klik tombol **Import** di pojok kiri atas.
3. Pilih file **`todolist_api_collection.json`** yang ada di folder ini.
4. Koleksi request lengkap dengan variabel otentikasi otomatis sudah siap Anda gunakan!

### Metode 2: Script Pengujian Terminal (PowerShell)
Anda juga bisa menguji integritas seluruh API secara instan via terminal Windows Anda:
```powershell
.\test_api.ps1
```

---

## ⏰ Menjalankan Sistem Pengingat Tugas (Console Command)
Untuk menjalankan pemindaian otomatis tugas yang terlambat atau mendekati tenggat waktu secara manual:
```bash
php artisan app:send-task-reminders
```

---

## 📃 Lisensi
Project ini didistribusikan di bawah lisensi resmi **MIT License**. Silakan baca file [LICENSE](../LICENSE) untuk informasi lebih lanjut.

*Developed with ❤️ by **[Adewira](https://github.com/Adewiraa)**.*
