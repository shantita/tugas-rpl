# Definisi Masalah dan Ruang Lingkup Proyek

**Tema:** Pengelolaan Keuangan Pribadi Mahasiswa
**Aplikasi:** Monthly Budgeting App

---

## 1. Deskripsi Masalah

Mahasiswa yang tinggal jauh dari orang tua, terutama yang di kos atau kontrakan, biasanya menerima uang saku
sekali dalam sebulan. Uang itu harus dibagi untuk makan, transportasi, sewa kos, hiburan, dan kebutuhan lain
sampai penerimaan berikutnya. Masalah yang sering muncul:

1. **Pengeluaran tidak tercatat.** Uang keluar dalam jumlah kecil dan sering (makan, ojek, jajan), sehingga
   mahasiswa tidak tahu ke mana uangnya pergi.
2. **Tidak ada batas per kategori.** Uang saku dipakai tanpa pembagian yang jelas, sehingga satu kategori
   (misalnya hiburan) bisa menghabiskan jatah kategori lain.
3. **Baru sadar setelah terlambat.** Mahasiswa baru tahu uangnya menipis ketika saldo hampir habis, padahal
   masih ada belasan hari sebelum uang saku berikutnya.
4. **Tidak tahu berapa yang boleh dipakai hari ini.** Angka total sisa uang belum cukup membantu keputusan
   harian. Sisa Rp250.000 terasa banyak, tetapi belum tentu cukup untuk 10 hari.

Aplikasi pencatat keuangan yang ada umumnya hanya menampilkan riwayat dan total. Masalah 3 dan 4 belum
terjawab secara langsung, terutama dalam bentuk angka harian yang mudah dipahami.

**Rumusan masalah:**
Bagaimana membantu mahasiswa mencatat keuangan bulanannya, memantau penggunaan anggaran per kategori, dan
mengetahui batas belanja harian yang aman sampai akhir bulan?

---

## 2. Profil Target Pengguna

| Aspek | Keterangan |
|---|---|
| Pengguna utama | Mahasiswa yang menerima uang saku atau pemasukan berkala |
| Kondisi | Sering tinggal di kos/kontrakan, mengelola uang sendiri |
| Usia | Sekitar 18 sampai 24 tahun |
| Kemampuan teknis | Terbiasa memakai browser dan aplikasi web di ponsel atau laptop |
| Pengalaman keuangan | Pemula, belum terbiasa membuat anggaran |
| Kebutuhan | Pencatatan cepat, tampilan sederhana, dan angka yang langsung dipahami |
| Kendala | Waktu terbatas, malas mencatat jika prosesnya rumit |

Jumlah aktor hanya satu, yaitu **mahasiswa (user)**. Tidak ada admin atau peran lain.

---

## 3. Manfaat Aplikasi

1. **Kesadaran pengeluaran:** semua pemasukan dan pengeluaran tercatat per bulan.
2. **Pengendalian per kategori:** anggaran ditentukan untuk setiap kategori, sehingga satu kategori tidak
   menghabiskan jatah kategori lain.
3. **Peringatan dini:** sistem memberi peringatan saat penggunaan anggaran mencapai 80% atau lebih, sebelum
   anggaran benar-benar habis.
4. **Panduan belanja harian (manfaat utama):** fitur **Daily Spending Limit** menghitung batas belanja yang
   aman per hari dari sisa anggaran dan sisa hari.
5. **Evaluasi bulanan:** laporan per bulan membantu mahasiswa melihat pola pengeluaran dan menyusun anggaran
   yang lebih realistis di bulan berikutnya.
6. **Kebiasaan finansial yang sehat:** membiasakan mahasiswa merencanakan dan mencatat keuangan sejak dini.

**Daily Spending Limit** = Sisa Anggaran / Sisa Hari
Contoh: sisa anggaran Rp250.000 dan sisa 10 hari, maka batas belanja Rp25.000 per hari.

---

## 4. Daftar Fitur Inti

Fitur di bawah ini dipilih karena bisa diselesaikan dalam sekitar 12 pertemuan.

| No | Fitur | Deskripsi singkat | Prioritas |
|---|---|---|---|
| 1 | Register dan Login | Akun dengan password ter-hash dan autentikasi JWT | Wajib |
| 2 | Kategori | Kategori bawaan: Makanan, Transportasi, Kos/Kontrakan, Hiburan, Lainnya | Wajib |
| 3 | Pencatatan pemasukan | Tambah, ubah, hapus, dan lihat daftar pemasukan | Wajib |
| 4 | Pencatatan pengeluaran | Tambah, ubah, hapus, dan lihat daftar pengeluaran per kategori | Wajib |
| 5 | Pengaturan budget | Anggaran per kategori untuk bulan dan tahun tertentu | Wajib |
| 6 | Pemantauan anggaran | Persentase penggunaan, progress bar, dan status (Aman, Perlu Perhatian, Mendekati Batas, Melebihi Anggaran) | Wajib |
| 7 | Peringatan anggaran | Alert saat penggunaan mencapai 80% atau lebih | Wajib |
| 8 | **Daily Spending Limit** | Batas belanja harian dari sisa anggaran dan sisa hari, termasuk penanganan kasus khusus | Wajib (fitur pembeda) |
| 9 | Dashboard | Ringkasan pemasukan, pengeluaran, saldo, total anggaran, sisa anggaran | Wajib |
| 10 | Laporan bulanan | Ringkasan per bulan, pengeluaran per kategori, dan satu bar chart sederhana | Wajib |
| 11 | Pengujian | Unit test perhitungan dan API test dasar | Wajib |
| 12 | Dokumentasi | README, spesifikasi, dan dokumen pendukung | Wajib |

**Contoh rencana per fase (dapat disesuaikan jadwal kuliah):**

| Pertemuan | Fokus |
|---|---|
| 1 sampai 2 | Analisis kebutuhan, definisi masalah, desain database |
| 3 sampai 4 | Setup proyek, database, dan autentikasi |
| 5 sampai 7 | CRUD pemasukan, pengeluaran, dan budget |
| 8 sampai 9 | Perhitungan budget, status, dan Daily Spending Limit |
| 10 | Dashboard dan laporan bulanan |
| 11 | Pengujian dan perbaikan bug |
| 12 | Dokumentasi, finalisasi, dan presentasi |

---

## 5. Fitur yang Tidak Dikerjakan

Fitur berikut sengaja tidak dikerjakan agar proyek tetap fokus dan selesai tepat waktu:

- Integrasi bank atau e-wallet (saldo dan transaksi diinput manual)
- Pemisahan sumber dana (dompet digital, tunai, rekening) dan transfer antar dompet
- Pembayaran online
- Pemindaian struk (OCR)
- Prediksi keuangan berbasis AI dan chatbot
- Fitur investasi dan cryptocurrency
- Notifikasi di luar aplikasi (WhatsApp, email, push notification)
- Sinkronisasi multi-device secara real-time
- Fitur sosial dan gamifikasi kompleks
- Peran admin dan manajemen organisasi
- Aplikasi mobile native
- Kategori khusus per pengguna (kategori bersifat global)

Fitur-fitur ini dapat dicatat sebagai **pengembangan selanjutnya** di README.

---

## 6. Kriteria Aplikasi Dinyatakan Berhasil

Aplikasi dinyatakan berhasil jika seluruh kriteria berikut terpenuhi.

### A. Fungsional

| No | Kriteria |
|---|---|
| 1 | Pengguna dapat register, login, dan logout. Halaman terlindungi tidak bisa dibuka tanpa login |
| 2 | Pengguna dapat menambah, mengubah, menghapus, dan melihat pemasukan, pengeluaran, dan budget |
| 3 | Dashboard otomatis ter-update setelah ada perubahan pemasukan, pengeluaran, atau budget |
| 4 | Status anggaran tampil sesuai aturan: di bawah 60% Aman, 60% sampai 79% Perlu Perhatian, 80% sampai 99% Mendekati Batas, 100% atau lebih Melebihi Anggaran |
| 5 | Peringatan muncul saat penggunaan anggaran mencapai 80% atau lebih |
| 6 | Daily Spending Limit benar untuk contoh baku: budget Rp1.000.000, pengeluaran Rp750.000, sisa 10 hari, hasil Rp25.000 per hari |
| 7 | Kasus khusus tertangani tanpa error: budget belum dibuat, budget habis, budget terlampaui, dan periode berakhir (tanpa pembagian dengan nol) |
| 8 | Laporan bulanan hanya memuat data bulan yang dipilih. Laporan September tidak menyertakan data Agustus |

### B. Kualitas dan Keamanan

| No | Kriteria |
|---|---|
| 9 | Password tersimpan dalam bentuk hash, bukan teks asli |
| 10 | Pengguna hanya dapat mengakses datanya sendiri |
| 11 | Validasi dilakukan di backend (jumlah lebih dari 0, tanggal valid, kategori valid, budget tidak duplikat) |
| 12 | Pesan error mudah dipahami pengguna dan seluruh antarmuka berbahasa Indonesia |

### C. Teknis dan Dokumentasi

| No | Kriteria |
|---|---|
| 13 | Seluruh unit test perhitungan dan API test lulus |
| 14 | Aplikasi dapat di-build dan dijalankan dari nol mengikuti README (instalasi, migrasi, seed, start) |
| 15 | README, spesifikasi, dan dokumen pendukung lengkap |
| 16 | Aplikasi dapat didemonstrasikan dengan alur: Register, Login, Input Income, Set Budget, Input Expense, Peringatan, Daily Spending Limit, Laporan Bulanan |

### D. Skenario Uji Penerimaan (untuk demo)

1. Mahasiswa mencatat pemasukan Rp3.000.000.
2. Mahasiswa mengatur budget: Makanan Rp1.000.000, Transportasi Rp500.000, Kos Rp1.000.000,
   Hiburan Rp300.000, Lainnya Rp200.000.
3. Mahasiswa mencatat pengeluaran makanan hingga total Rp820.000 (82%).
4. **Hasil yang diharapkan:** status Makanan berubah menjadi Mendekati Batas, muncul peringatan,
   dan Daily Spending Limit ter-update sesuai sisa anggaran dan sisa hari.