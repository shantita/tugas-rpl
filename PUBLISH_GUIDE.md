# Panduan Publikasi Website (Publish / Deployment Guide)

Dokumen ini menjelaskan langkah-langkah untuk mempublikasikan website **Monthly Budgeting App** secara **100% GRATIS dan TANPA KARTU KREDIT** menggunakan **TiDB Cloud** (Database MySQL) dan **Vercel** (Fullstack Frontend + Backend API).

---

## 🚀 OPSI UTAMA: Vercel + TiDB Cloud (100% Gratis & Tanpa Kartu Kredit)

Frontend (React Vite) dan Backend (Express API) berjalan bersama dalam **1 Proyek Vercel** di bawah satu domain yang sama (bebas masalah CORS), tersambung ke database MySQL gratis di **TiDB Cloud**.

### Langkah 1: Siapkan Database MySQL di TiDB Cloud
1. Buka [https://tidbcloud.com](https://tidbcloud.com) dan login dengan akun GitHub atau Google.
2. Buat cluster baru pada paket **Serverless (Free)**:
   - Pilih Region terdekat (contoh: **Singapore / ap-southeast-1**).
   - Klik **Create**.
3. Setelah cluster aktif, klik tombol **Connect**:
   - Pilih konektor: **Prisma**.
   - Buat/generate password database baru.
   - Salin connection string yang diberikan. Contoh:
     ```
     mysql://<username>:<password>@<host>:4000/<dbname>?sslaccept=strict
     ```

### Langkah 2: Deploy ke Vercel
1. Buka [https://vercel.com](https://vercel.com) dan login menggunakan akun GitHub Anda.
2. Klik tombol **Add New...** > **Project**.
3. Cari repositori Anda (`shantita/tugas-rpl`) lalu klik **Import**.
4. Di bagian konfigurasi proyek:
   - **Framework Preset:** Pilih **Other** (atau biarkan default terdeteksi).
   - **Root Directory:** Biarkan `./` (root direktori repositori).
   - **Build and Output Settings:** Biarkan default (sudah otomatis diatur oleh file `vercel.json` proyek).
5. Buka bagian **Environment Variables** (dropdown), lalu tambahkan 2 variabel berikut:
   - **Variabel 1:**
     - Key: `DATABASE_URL`
     - Value: *(Tempel connection string TiDB Cloud dari Langkah 1)*
   - **Variabel 2:**
     - Key: `JWT_SECRET`
     - Value: `kunci_rahasia_jwt_produksi_super_aman_123` *(buat teks acak bebas)*
6. Klik tombol **Deploy**!
7. Vercel akan otomatis meng-install dependensi, mem-build frontend dan backend, serta menghasilkan URL website publik Anda (contoh: `https://monthly-budgeting-app.vercel.app`).

### Langkah 3: Migrasi Tabel Database ke TiDB Cloud
Agar tabel database (User, Budget, Expense, dll) terbuat di TiDB Cloud, Anda bisa menjalankannya dari terminal laptop Anda sekali saja:
```bash
# Ganti dengan DATABASE_URL TiDB Cloud Anda
npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
```
*(Opsional) Masukkan data kategori default*:
```bash
npx tsx apps/api/prisma/seed.ts
```

Website Anda kini sudah aktif dan bisa diakses publik dari mana saja!

---

## 📋 Ringkasan Variabel Lingkungan di Vercel

| Nama Variabel | Wajib? | Keterangan |
|---|---|---|
| `DATABASE_URL` | **Ya** | Connection string MySQL dari TiDB Cloud Serverless |
| `JWT_SECRET` | **Ya** | String acak untuk signing token autentikasi login JWT |
| `NODE_ENV` | Opsional | Nilai default `production` |
