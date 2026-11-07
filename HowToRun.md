# Petunjuk Menjalankan Website (Monthly Budgeting Web App)

Dokumen ini menjelaskan langkah-langkah untuk menjalankan website **Monthly Budgeting App** di lingkungan lokal (development) komputer Anda.

---

## Prasyarat

Pastikan perangkat lunak berikut sudah terinstal di komputer Anda:

| Perangkat Lunak | Versi Minimum | Keterangan |
|---|---|---|
| Node.js | 18.x | Runtime JavaScript |
| npm | 9.x | Package manager (bawaan Node.js) |
| MySQL | 8.0 | Database relasional (bisa via XAMPP, Laragon, instalasi langsung, atau Docker) |
| Docker *(opsional)* | 20.x | Hanya jika ingin menjalankan MySQL lewat Docker Compose |
| Git | 2.x | Untuk mengelola versi kode |

> **Catatan Database:** Anda bebas menjalankan MySQL secara lokal (misalnya lewat **XAMPP**, **Laragon**, atau instalasi mandiri) **atau** menggunakan Docker Compose yang sudah disediakan.

---

## 1. Clone Repository

```bash
git clone <url-repository>
cd monthly-budgeting-app
```

---

## 2. Menyiapkan Database MySQL

### Opsi A — Menggunakan Docker Compose (Opsional)

```bash
docker compose up -d
```

Konfigurasi bawaan:
- **Host:** `localhost`
- **Port:** `3306`
- **Database:** `monthly_budgeting_app`
- **User / Password:** `user` / `password123`
- **Root Password:** `password123`

### Opsi B — MySQL Lokal (XAMPP / Laragon / Mandiri)

1. Pastikan modul MySQL di XAMPP / Laragon sudah aktif (berjalan di port 3306).
2. Buat database baru di phpMyAdmin / MySQL client:
   ```sql
   CREATE DATABASE monthly_budgeting_app;
   ```

---

## 3. Konfigurasi File `.env`

Salin file contoh konfigurasi environment:

```bash
cp .env.example .env
```

> Di Windows PowerShell:
> ```powershell
> Copy-Item .env.example .env
> ```

Buka file `.env` lalu sesuaikan dengan kredensial MySQL Anda:

```env
DATABASE_URL="mysql://root:@localhost:3306/monthly_budgeting_app"
JWT_SECRET="kunci_rahasia_acak_yang_panjang_dan_aman"
PORT=5000
NODE_ENV=development
```

> **Catatan:** File `.env` juga disarankan disalin ke folder backend `apps/api/`:
> ```powershell
> Copy-Item .env apps/api/.env
> ```

---

## 4. Instalasi Dependensi

Dari root folder proyek, jalankan:

```bash
npm install
```

Perintah ini akan menginstal seluruh dependensi monorepo untuk:
- Root workspace
- `packages/shared` (tipe & model bersama)
- `apps/api` (backend server)
- `apps/web` (frontend website)

---

## 5. Build Shared Package

Shared package perlu di-build terlebih dahulu agar tipe dan enumnya dapat diakses oleh API dan Web:

```bash
npm run build --workspace=@monthly-budgeting-app/shared
```

---

## 6. Generate Prisma Client & Migrasi Database

Jalankan perintah berikut untuk membuat client dan tabel database:

```bash
# Generate Prisma Client
npm run prisma:generate

# Migrasi skema ke database MySQL
npm run prisma:migrate
```

*(Jika diminta nama migrasi, masukkan `init`)*

---

## 7. Seed Data Awal (Kategori Bawaan)

Isi kategori default ke database:

```bash
npm run prisma:seed
```

---

## 8. Menjalankan Website di Lingkungan Lokal

### Opsi 1: Menjalankan Sekaligus (Rekomendasi)

```bash
npm run dev
```

### Opsi 2: Menjalankan Secara Terpisah (Dua Terminal)

**Terminal 1 — Backend API:**
```bash
npm run dev:api
```

**Terminal 2 — Frontend Website:**
```bash
npm run dev:web
```

---

## 9. Mengakses Website di Browser

Buka browser pilihan Anda (Google Chrome, Edge, Firefox, Safari) dan akses tautan berikut:

| Layanan | URL Browser | Keterangan |
|---|---|---|
| **Frontend Website** | [http://localhost:3000](http://localhost:3000) | Tampilan antarmuka website utama |
| **Backend REST API** | [http://localhost:5000](http://localhost:5000) | Layanan API backend |

---

## 10. Menjalankan Pengujian (Unit Tests)

Proyek ini dilengkapi dengan 61 unit test untuk memverifikasi logika bisnis keuangan:

```bash
npm run test:unit
```

---

## 11. Publikasi Website ke Internet (Production Deployment)

Jika Anda ingin mempublikasikan website ini ke internet (misalnya ke **Vercel** untuk frontend dan **Railway / Render** untuk backend serta database MySQL agar dapat diakses oleh siapa saja secara online), silakan ikuti panduan lengkap di:

👉 **[PUBLISH_GUIDE.md](PUBLISH_GUIDE.md)**

---

## Ringkasan Perintah

| Langkah | Perintah |
|---|---|
| Install dependensi | `npm install` |
| Build shared package | `npm run build --workspace=@monthly-budgeting-app/shared` |
| Generate Prisma Client | `npm run prisma:generate` |
| Migrasi tabel database | `npm run prisma:migrate` |
| Isi data awal (seed) | `npm run prisma:seed` |
| Jalankan website (dev) | `npm run dev` |
| Build seluruh website | `npm run build` |
| Jalankan unit test | `npm run test:unit` |
