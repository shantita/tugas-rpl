# Monthly Budgeting Website (Web App)

Website full-stack pengelola anggaran dan uang saku bulanan mahasiswa, dilengkapi fitur pembeda **Daily Spending Limit** serta pengelolaan **Anggaran Tetap** dan **Anggaran Sementara**.

---

## Deskripsi Proyek

**Monthly Budgeting Web App** adalah platform website yang membantu mahasiswa mencatat pemasukan dan pengeluaran, menentukan anggaran per kategori (baik anggaran tetap bulanan maupun anggaran sementara), memantau realisasi anggaran, serta mengetahui batas belanja aman per hari (**Daily Spending Limit**) sampai akhir bulan. Website ini dapat diakses secara fleksibel melalui web browser baik di laptop/PC maupun browser ponsel pintar secara responsif.

## Latar Belakang

Mahasiswa perantau umumnya menerima uang saku sebulan sekali. Pengeluaran kecil yang sering (makan, transportasi, jajan) jarang dicatat, tidak ada batasan per kategori, dan uang baru disadari menipis ketika masih banyak hari tersisa sebelum kiriman uang berikutnya. Total sisa uang saja tidak cukup memandu keputusan belanja harian. Website ini hadir memberikan solusi praktis berupa angka batas belanja harian yang langsung dapat dipahami mahasiswa.

## Tujuan

1. Mencatat pemasukan dan pengeluaran bulanan mahasiswa secara terstruktur.
2. Mengelompokkan pengeluaran berdasarkan kategori, termasuk dukungan kategori kustom.
3. Mengatur 2 tipe anggaran: **Anggaran Tetap** (rutin tiap bulan) dan **Anggaran Sementara** (berlaku di bulan tertentu).
4. Memberikan peringatan dini (*warning threshold*) saat penggunaan anggaran mendekati atau melebihi batas.
5. Menghitung **Daily Spending Limit** berdasarkan sisa anggaran dan sisa hari dalam bulan berjalan.
6. Menyajikan dashboard interaktif dan laporan keuangan bulanan dengan visualisasi grafik.

## Fitur Utama

- **Autentikasi & Keamanan:** Registrasi, login, dan logout dengan enkripsi kata sandi `bcrypt` dan token `JWT`.
- **Kustomisasi Kategori Belanja:** Kategori bawaan (*Makanan, Transportasi, Kos/Kontrakan, Hiburan, Lainnya*) serta kebebasan membuat dan mengelola kategori kustom baru.
- **2 Tipe Anggaran (Budget):**
  - 📌 **Anggaran Tetap (Rutin):** Berlaku otomatis sama di setiap bulan tanpa perlu input ulang (misal: Kosan, Uang Makan Pokok, Internet).
  - ⏳ **Anggaran Sementara:** Hanya berlaku khusus di bulan yang ditentukan (misal: Beli Kado, Servis Motor, Liburan).
- **Pencatatan Transaksi:** Manajemen pemasukan dan pengeluaran harian lengkap dengan riwayat dan filter periode.
- **Daily Spending Limit (Fitur Pembeda):** Rekomendasi batas pengeluaran aman harian yang dihitung secara dinamis.
- **Dashboard Ringkasan:** Statistik keuangan real-time, progress bar status anggaran, dan maskot visual interaktif.
- **Laporan Bulanan:** Evaluasi pengeluaran per kategori lengkap dengan diagram batang (*Chart.js*).

### Ambang Batas Status Anggaran

| Penggunaan | Status | Keterangan |
|---|---|---|
| Di bawah 60% | **Aman** | Pengeluaran terkendali dengan baik |
| 60% s.d. < 80% | **Perlu Perhatian** | Pengeluaran mulai meningkat |
| 80% s.d. < 100% | **Mendekati Batas** | Muncul pesan peringatan dini di dashboard |
| 100% atau lebih | **Melebihi Anggaran** | Pengeluaran telah melampaui plafon anggaran |

---

## Rumus Daily Spending Limit

Fitur utama website untuk memandu belanja harian mahasiswa:

```text
Sisa Anggaran        = Total Budget - Total Pengeluaran
Sisa Hari            = Hari Terakhir Bulan - Hari Ini + 1   (inklusif hari ini)
Daily Spending Limit = floor(Sisa Anggaran / Sisa Hari)     (dibulatkan ke bawah ke Rupiah utuh)
```

**Contoh:** Budget Makanan Rp1.000.000, pengeluaran Rp750.000, sisa anggaran Rp250.000, tersisa 10 hari, maka batas belanja aman adalah **Rp25.000 / hari**.

---

## Tech Stack

| Lapisan | Teknologi | Keterangan |
|---|---|---|
| **Frontend (Website)** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Chart.js | Antarmuka web responsif dan cepat |
| **Backend (API)** | Node.js, Express, TypeScript | RESTful API terstruktur dan aman |
| **Database** | MySQL 8.0 | Basis data relasional |
| **ORM** | Prisma ORM | Pemodelan data & migrasi basis data |
| **Validasi & Auth** | Zod, JWT (jsonwebtoken), bcrypt | Validasi skema request & hashing password |
| **Testing** | Vitest | Rangkaian unit test logika bisnis |
| **Infrastruktur** | npm workspaces, Docker Compose (opsional untuk MySQL lokal) | Manajemen monorepo bersih |

---

## Struktur Monorepo

```text
monthly-budgeting-app/
├── apps/
│   ├── web/                     # Frontend Website (React + Vite + Tailwind CSS)
│   └── api/                     # Backend REST API (Node.js + Express + Prisma)
├── packages/
│   └── shared/                  # Tipe TypeScript, DTO, konstanta, dan enum bersama
├── catatan_dan_video/           # Dokumen analisis, spesifikasi, dan rekaman tugas RPL
├── docker-compose.yml           # Container MySQL lokal (opsional)
├── HowToRun.md                  # Panduan menjalankan website di komputer lokal
├── PUBLISH_GUIDE.md             # Panduan publikasi / deployment website ke internet
└── README.md                    # Dokumentasi utama proyek
```

---

## Panduan Menjalankan & Mempublikasikan Website

- **Menjalankan di Komputer Lokal (Development):**  
  Silakan ikuti langkah-langkah lengkap di dokumen [HowToRun.md](HowToRun.md).
- **Mempublikasikan Website ke Internet (Production Deployment):**  
  Silakan ikuti panduan deploy (Vercel, Railway, Render, atau VPS) di dokumen [PUBLISH_GUIDE.md](PUBLISH_GUIDE.md).

---

## Dokumen Proyek RPL

Dokumen analisis dan spesifikasi tugas Rekayasa Perangkat Lunak (RPL) dapat diakses pada folder `catatan_dan_video/`:

| Dokumen | Isi & Keterangan |
|---|---|
| [ide_judul.md](catatan_dan_video/ide_judul.md) | Tiga ide awal proyek dan alasan pemilihan |
| [definisi_masalah.md](catatan_dan_video/definisi_masalah.md) | Definisi masalah, sasaran pengguna, dan kriteria keberhasilan |
| [project_spec.md](catatan_dan_video/project_spec.md) | Spesifikasi teknis sistem, arsitektur, dan entitas data |
| [user_stories_mvp.md](catatan_dan_video/user_stories_mvp.md) | 5 User Story inti MVP beserta Acceptance Criteria teruji |
| [video_demo.md](catatan_dan_video/video_demo.md) | Tautan rekaman video demonstrasi aplikasi web |
