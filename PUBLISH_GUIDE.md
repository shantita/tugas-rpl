# Panduan Publikasi Website (Publish / Deployment Guide)

Dokumen ini menjelaskan langkah-langkah untuk mempublikasikan (deploy/publish) **Monthly Budgeting App** agar dapat diakses secara publik melalui internet sebagai **Website**.

---

## 1. Persiapan yang Sudah Dikonfigurasi di Proyek

Proyek ini telah dikonfigurasi siap produksi (*production-ready*):

1. **Flexible API URL**: Frontend ([apps/web/src/services/api.service.ts](file:///c:/tugas-rpl/apps/web/src/services/api.service.ts)) mendukung variabel lingkungan `VITE_API_URL`.
   - Jika frontend dan backend dipisah (misal Vercel + Railway), cukup isi `VITE_API_URL` dengan domain backend.
   - Jika frontend dan backend di-hosting bersama pada 1 server, otomatis menggunakan `/api`.
2. **SPA Routing Rewrite**: Telah ditambahkan [vercel.json](file:///c:/tugas-rpl/apps/web/vercel.json) dan [_redirects](file:///c:/tugas-rpl/apps/web/public/_redirects) agar saat halaman di-refresh (seperti `/budgets`, `/expenses`) tidak terjadi error 404.
3. **Single-Service Support**: Backend Express ([apps/api/src/app.ts](file:///c:/tugas-rpl/apps/api/src/app.ts)) telah dikonfigurasi untuk otomatis menyajikan file static frontend (`apps/web/dist`) jika di-deploy dalam 1 server tunggal.
4. **Build & Start Pipeline**: Perintah build di [package.json](file:///c:/tugas-rpl/package.json) telah diatur secara berurutan: `packages/shared` -> `apps/api` -> `apps/web`.

---

## 2. Pilihan Cara Publikasi

### OPSI A — Terpisah: Vercel (Frontend) + Railway / Render (Backend & MySQL)
*(Sangat disarankan untuk tugas kuliah karena gratis, cepat, dan mudah di-setup)*

#### Langkah 1: Push Kode ke GitHub
Pastikan seluruh kode proyek Anda sudah di-push ke repositori GitHub pribadi/publik.

#### Langkah 2: Deploy Database MySQL & Backend ke Railway (atau Render)
1. Buka [Railway.app](https://railway.app) dan login dengan akun GitHub Anda.
2. Buat proyek baru: **New Project** > **Provision MySQL**.
   - Salin connection string MySQL yang diberikan (`DATABASE_URL`).
3. Tambahkan service backend: **New** > **GitHub Repo** > Pilih repositori ini.
4. Pada menu **Settings** service backend di Railway:
   - **Root Directory**: Biarkan `/` (root repositori).
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. Pada menu **Variables**, tambahkan:
   ```env
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=<salin_url_mysql_dari_langkah_2>
   JWT_SECRET=buat_kunci_acak_panjang_dan_aman_di_sini
   CLIENT_URL=https://<domain-frontend-anda-di-vercel>.vercel.app
   ```
6. Jalankan migrasi database di Railway (buka tab CLI / terminal di Railway):
   ```bash
   npm run prisma:deploy
   npm run prisma:seed
   ```
7. Generate domain publik untuk backend di tab **Settings** > **Networking** (contoh: `https://budget-api-production.up.railway.app`).

#### Langkah 3: Deploy Frontend ke Vercel
1. Buka [Vercel.com](https://vercel.com) dan login dengan akun GitHub.
2. Klik **Add New** > **Project** > Pilih repositori ini.
3. Konfigurasi proyek:
   - **Framework Preset**: `Vite`
   - **Root Directory**: klik edit, pilih folder `apps/web`
4. Buka bagian **Environment Variables**, tambahkan:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://budget-api-production.up.railway.app/api` *(sesuaikan dengan domain backend Railway Anda + akhiran `/api`)*
5. Klik **Deploy**.
6. Website Anda kini live dan dapat diakses publik!

---

### OPSI B — Satu Server Tunggal (Single Service di Railway, Render, atau VPS)
*(Praktis karena frontend dan backend berjalan di satu domain dan satu port)*

1. Buat service baru dari repositori GitHub di Railway / Render / VPS.
2. Konfigurasi environment variables:
   ```env
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=<koneksi_mysql_anda>
   JWT_SECRET=kunci_rahasia_acak
   ```
3. Script build: `npm run build` (akan mem-build shared, backend, dan frontend sekaligus).
4. Script start: `npm start` (menjalankan backend, dan backend otomatis menampilkan website frontend).
5. Buka domain yang dihasilkan; website langsung terbuka secara penuh.

---

## 3. Ringkasan Variabel Lingkungan (Environment Variables)

| Variabel | Digunakan Di | Keterangan |
|---|---|---|
| `DATABASE_URL` | Backend | Connection string database MySQL produksi |
| `JWT_SECRET` | Backend | String acak untuk signing autentikasi token JWT |
| `PORT` | Backend | Port server (biasanya otomatis diatur oleh cloud provider) |
| `NODE_ENV` | Backend | Set ke `production` |
| `CLIENT_URL` | Backend *(Opsional)* | URL website frontend untuk whitelist CORS |
| `VITE_API_URL` | Frontend *(Opsional)* | URL endpoint backend (misal: `https://api.domain.com/api`) jika frontend di-deploy terpisah |

