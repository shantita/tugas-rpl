# Monthly Budgeting App

Aplikasi web pengelola anggaran bulanan untuk mahasiswa, dengan fitur pembeda **Daily Spending Limit**.
Proyek mata kuliah Rekayasa Perangkat Lunak (RPL).

## Deskripsi Proyek

Monthly Budgeting App membantu mahasiswa mencatat pemasukan dan pengeluaran, menentukan anggaran per kategori
untuk setiap bulan, memantau penggunaan anggaran, dan mengetahui berapa uang yang aman dibelanjakan per hari
sampai akhir bulan.

## Latar Belakang

Mahasiswa perantau umumnya menerima uang saku sebulan sekali. Pengeluaran kecil yang sering (makan, ojek, jajan)
jarang dicatat, tidak ada batas per kategori, dan uang baru terasa menipis ketika masih banyak hari tersisa.
Total sisa uang saja tidak cukup membantu keputusan harian. Aplikasi ini menjawabnya dengan angka batas belanja
harian yang mudah dipahami.

## Tujuan

1. Mencatat pemasukan dan pengeluaran bulanan.
2. Mengelompokkan pengeluaran berdasarkan kategori.
3. Menentukan dan memantau anggaran per kategori.
4. Memberi peringatan ketika penggunaan anggaran mencapai 80% atau lebih.
5. Menghitung Daily Spending Limit dari sisa anggaran dan sisa hari.
6. Menampilkan laporan keuangan bulanan.

## Target Pengguna

Mahasiswa yang menerima uang saku atau pemasukan berkala, terutama yang tinggal di kos atau kontrakan dan
ingin belajar mengatur keuangan. Hanya ada satu peran, yaitu pengguna (mahasiswa).

## Rencana Fitur

- Register, login, dan logout
- Kategori bawaan: Makanan, Transportasi, Kos/Kontrakan, Hiburan, Lainnya
- Pencatatan pemasukan
- Pencatatan pengeluaran per kategori
- Pengaturan budget per kategori untuk bulan dan tahun tertentu
- Status anggaran dan peringatan saat penggunaan mencapai 80% atau lebih
- Daily Spending Limit
- Dashboard ringkasan keuangan
- Laporan bulanan dengan grafik sederhana

### Status Anggaran

| Penggunaan | Status |
|---|---|
| Di bawah 60% | Aman |
| 60% sampai 79% | Perlu Perhatian |
| 80% sampai 99% | Mendekati Batas |
| 100% atau lebih | Melebihi Anggaran |

## Daily Spending Limit

Fitur utama aplikasi. Sistem menghitung jumlah uang yang secara ideal masih bisa dipakai per hari
sampai akhir bulan.

```text
Sisa Anggaran        = Budget - Total Pengeluaran
Sisa Hari            = Hari terakhir bulan - Hari ini + 1   (termasuk hari ini)
Daily Spending Limit = Sisa Anggaran / Sisa Hari
```

**Contoh:** Budget Makanan Rp1.000.000, pengeluaran Rp750.000, sisa anggaran Rp250.000, sisa 10 hari,
maka batas belanja Rp25.000 per hari.

## Rencana Tech Stack

| Bagian | Teknologi |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Chart.js |
| Backend | Node.js, TypeScript, Express |
| Database | MySQL |
| ORM | Prisma |
| Autentikasi | JWT, bcrypt |
| Validasi | Zod |
| Testing | Vitest |
| Infrastruktur | Docker Compose (MySQL), npm workspaces |

## Rencana Struktur Proyek

```text
monthly-budgeting-app/
  apps/
    web/          Frontend
    api/          Backend
  packages/
    shared/       Tipe, enum, dan konstanta bersama
  docs/           Dokumen proyek
  README.md
```

## Dokumen Proyek

| Dokumen | Isi |
|---|---|
| [01-IDE_AWAL.md](catatan/ide_judul.md) | Tiga ide awal dan alasan pemilihan |
| [02-DEFINISI_MASALAH.md](catatan/definisi_masalah.md) | Definisi masalah, fitur inti, dan kriteria keberhasilan |
| [03-PROJECT_SPEC.md](catatan/project_spec.md) | Spesifikasi teknis lengkap |


## Bagian yang Akan Ditambahkan Setelah Aplikasi Jadi

- [ ] Struktur database
- [ ] Daftar endpoint API
- [ ] Instalasi dan konfigurasi `.env`
- [ ] Cara menjalankan (backend, frontend, Docker)
- [ ] Cara menjalankan pengujian
- [ ] Keterbatasan
- [ ] Pengembangan selanjutnya

## Tim Pengembang

| Nama | NIM | Peran |
|---|---|---|
| (isi) | (isi) | (isi) |
