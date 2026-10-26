# Petunjuk Menjalankan Aplikasi

Dokumen ini menjelaskan langkah-langkah untuk menjalankan **Monthly Budgeting App** di lingkungan lokal (development).

---

## Prasyarat

Pastikan perangkat lunak berikut sudah terinstal:

| Perangkat Lunak | Versi Minimum | Keterangan |
|---|---|---|
| Node.js | 18.x | Runtime JavaScript |
| npm | 9.x | Biasanya sudah termasuk saat menginstal Node.js |
| MySQL | 8.0 | Database relasional |
| Docker *(opsional)* | 20.x | Hanya jika ingin menjalankan MySQL lewat Docker Compose |
| Git | 2.x | Untuk clone repository |

> **Catatan:** Kamu bisa menjalankan MySQL secara lokal (misalnya lewat XAMPP, Laragon, atau instalasi mandiri) **atau** menggunakan Docker Compose yang sudah disediakan.

---

## 1. Clone Repository

```bash
git clone <url-repository>
cd monthly-budgeting-app
```

---

## 2. Menyiapkan Database MySQL

### Opsi A — Menggunakan Docker Compose (Disarankan)

```bash
docker compose up -d
```

Perintah ini akan membuat container MySQL dengan konfigurasi:
- **Host:** `localhost`
- **Port:** `3306`
- **Database:** `monthly_budgeting_app`
- **User / Password:** `user` / `password123`
- **Root Password:** `password123`

### Opsi B — MySQL Lokal (XAMPP / Laragon / Instalasi Mandiri)

1. Pastikan MySQL sudah berjalan.
2. Buat database baru:
   ```sql
   CREATE DATABASE monthly_budgeting_app;
   ```

---

## 3. Konfigurasi File `.env`

Salin file contoh environment:

```bash
cp .env.example .env
```

> Di Windows tanpa Git Bash, gunakan:
> ```powershell
> Copy-Item .env.example .env
> ```

Buka file `.env` lalu sesuaikan isinya:

```env
DATABASE_URL="mysql://username:password@localhost:3306/monthly_budgeting_app"
JWT_SECRET="ganti_dengan_string_acak_yang_panjang"
PORT=5000
```

**Penjelasan variabel:**

| Variabel | Keterangan |
|---|---|
| `DATABASE_URL` | Connection string MySQL. Sesuaikan `username`, `password`, host, dan port. |
| `JWT_SECRET` | Secret key untuk token autentikasi. Gunakan string acak yang panjang. |
| `PORT` | Port tempat backend API berjalan (default `5000`). |

**Contoh `DATABASE_URL`:**

| Sumber MySQL | Contoh DATABASE_URL |
|---|---|
| Docker Compose (user biasa) | `mysql://user:password123@localhost:3306/monthly_budgeting_app` |
| Docker Compose (root) | `mysql://root:password123@localhost:3306/monthly_budgeting_app` |
| XAMPP / Laragon (root tanpa password) | `mysql://root:@localhost:3306/monthly_budgeting_app` |

> **Penting:** File `.env` juga perlu disalin ke folder `apps/api/`:
> ```bash
> cp .env apps/api/.env
> ```

---

## 4. Instalasi Dependensi

Dari folder root proyek, jalankan:

```bash
npm install
```

Perintah ini akan menginstal semua dependensi untuk:
- Root project (workspace manager)
- `apps/api` (backend)
- `apps/web` (frontend)
- `packages/shared` (tipe & konstanta bersama)

---

## 5. Build Shared Package

Shared package perlu di-build terlebih dahulu agar bisa dipakai oleh API dan Web:

```bash
npm run build --workspace=@monthly-budgeting-app/shared
```

---

## 6. Generate Prisma Client

```bash
npm run prisma:generate
```

Perintah ini membaca `apps/api/prisma/schema.prisma` dan membuat Prisma Client.

---

## 7. Migrasi Database

```bash
npm run prisma:migrate
```

Perintah ini akan membuat tabel-tabel (`User`, `Category`, `Budget`, `Income`, `Expense`) ke database MySQL.

> Jika diminta nama migrasi, beri nama deskriptif, misalnya `init`.

---

## 8. Seed Data Awal (Opsional)

```bash
npm run prisma:seed
```

Perintah ini mengisi data awal (misalnya kategori bawaan: Makanan, Transportasi, dsb.) ke database.

---

## 9. Menjalankan Aplikasi

### Menjalankan Backend dan Frontend Sekaligus

```bash
npm run dev
```

### Menjalankan Secara Terpisah

Buka **dua terminal** terpisah:

**Terminal 1 — Backend API:**
```bash
npm run dev:api
```

**Terminal 2 — Frontend Web:**
```bash
npm run dev:web
```

---

## 10. Mengakses Aplikasi

| Layanan | URL |
|---|---|
| Frontend (Web) | [http://localhost:3000](http://localhost:3000) |
| Backend (API) | [http://localhost:5000](http://localhost:5000) |

> Frontend otomatis mem-proxy request `/api/*` ke backend (`localhost:5000`), jadi tidak perlu konfigurasi CORS tambahan saat development.

---

## 11. Menjalankan Pengujian

```bash
# Semua test
npm run test

# Unit test saja
npm run test:unit
```

---

## Ringkasan Perintah

| Langkah | Perintah |
|---|---|
| Install dependensi | `npm install` |
| Jalankan MySQL (Docker) | `docker compose up -d` |
| Build shared package | `npm run build --workspace=@monthly-budgeting-app/shared` |
| Generate Prisma Client | `npm run prisma:generate` |
| Migrasi database | `npm run prisma:migrate` |
| Seed data awal | `npm run prisma:seed` |
| Jalankan semua (dev) | `npm run dev` |
| Jalankan backend saja | `npm run dev:api` |
| Jalankan frontend saja | `npm run dev:web` |
| Jalankan test | `npm run test` |

---

## Troubleshooting

| Masalah | Solusi |
|---|---|
| `Can't reach database server` | Pastikan MySQL sudah berjalan dan `DATABASE_URL` di `.env` benar. |
| `EADDRINUSE: port 5000` | Port 5000 sudah dipakai. Ubah `PORT` di `.env` atau matikan proses lain. |
| `Module not found: @monthly-budgeting-app/shared` | Jalankan `npm run build --workspace=@monthly-budgeting-app/shared` terlebih dahulu. |
| `Prisma Client not generated` | Jalankan `npm run prisma:generate`. |
| Port 3306 sudah dipakai | Matikan MySQL lokal yang sudah berjalan, atau ubah port di `docker-compose.yml`. |
