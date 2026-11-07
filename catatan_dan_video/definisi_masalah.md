# Definisi Masalah dan Ruang Lingkup Proyek

**Tema:** Pengelolaan Keuangan Pribadi Mahasiswa  
**Sistem / Produk:** Website Monthly Budgeting App (Web App)  

---

## 1. Deskripsi Masalah

Mahasiswa yang tinggal jauh dari orang tua, terutama yang di kos atau kontrakan, biasanya menerima uang saku sekali dalam sebulan. Uang itu harus dibagi untuk makan, transportasi, sewa kos, hiburan, dan kebutuhan lain sampai penerimaan berikutnya. Masalah yang sering muncul:

1. **Pengeluaran tidak tercatat.** Uang keluar dalam jumlah kecil dan sering (makan, ojek, jajan), sehingga mahasiswa tidak tahu ke mana uangnya pergi.
2. **Tidak ada batas per kategori.** Uang saku dipakai tanpa pembagian yang jelas, sehingga satu kategori (misalnya hiburan) bisa menghabiskan jatah kategori lain.
3. **Baru sadar setelah terlambat.** Mahasiswa baru tahu uangnya menipis ketika saldo hampir habis, padahal masih ada belasan hari sebelum uang saku berikutnya.
4. **Tidak tahu berapa yang boleh dipakai hari ini.** Angka total sisa uang belum cukup membantu keputusan harian. Sisa Rp250.000 terasa banyak, tetapi belum tentu cukup untuk 10 hari.

Website pencatat keuangan yang ada di pasaran umumnya hanya menampilkan riwayat dan total secara umum. Masalah 3 dan 4 belum terjawab secara langsung, terutama dalam bentuk angka harian yang mudah dipahami.

**Rumusan masalah:**  
Bagaimana membangun website yang membantu mahasiswa mencatat keuangan bulanannya, memantau penggunaan anggaran per kategori (tetap maupun sementara), dan mengetahui batas belanja harian yang aman (**Daily Spending Limit**) sampai akhir bulan?

---

## 2. Profil Target Pengguna

| Aspek | Keterangan |
|---|---|
| Pengguna utama | Mahasiswa yang menerima uang saku atau pemasukan berkala |
| Kondisi | Sering tinggal di kos/kontrakan, mengelola uang sendiri |
| Usia | Sekitar 18 sampai 24 tahun |
| Kemampuan teknis | Terbiasa memakai web browser di laptop maupun smartphone (website responsif) |
| Pengalaman keuangan | Pemula, belum terbiasa membuat anggaran terstruktur |
| Kebutuhan | Akses website cepat tanpa perlu instalasi aplikasi rumit, pencatatan praktis, dan angka yang langsung dipahami |
| Kendala | Waktu terbatas, malas mencatat jika prosesnya rumit |

Jumlah aktor hanya satu, yaitu **mahasiswa (user)**. Tidak ada admin atau peran lain.

---

## 3. Manfaat Website

1. **Kesadaran pengeluaran:** Semua pemasukan dan pengeluaran tercatat per bulan secara real-time.
2. **Pengendalian per kategori:** Anggaran ditentukan untuk setiap kategori (bisa menggunakan kategori bawaan maupun menambah kategori kustom sendiri).
3. **Fleksibilitas 2 Tipe Anggaran:** 
   - **Anggaran Tetap:** Pengeluaran rutin bulanan (kos, uang makan pokok, wifi) otomatis sama setiap bulannya tanpa repot input ulang.
   - **Anggaran Sementara:** Alokasi insidental yang hanya berlaku khusus pada bulan yang ditentukan (misal servis motor, beli kado).
4. **Peringatan dini:** Sistem memberi peringatan saat penggunaan anggaran mencapai 80% atau lebih, sebelum anggaran benar-benar habis.
5. **Panduan belanja harian (manfaat utama):** Fitur **Daily Spending Limit** menghitung batas belanja yang aman per hari dari sisa anggaran dan sisa hari.
6. **Evaluasi bulanan:** Laporan per bulan membantu mahasiswa melihat pola pengeluaran melalui grafik dan menyusun anggaran yang lebih realistis.

---

## 4. Daftar Fitur Inti

| No | Fitur | Deskripsi singkat | Prioritas |
|---|---|---|---|
| 1 | Register dan Login | Akun dengan password ter-hash (`bcrypt`) dan autentikasi `JWT` | Wajib |
| 2 | Kategori Belanja | Kategori bawaan dan fitur kustomisasi kategori baru mandiri | Wajib |
| 3 | Pencatatan Pemasukan | Tambah, ubah, hapus, dan filter daftar pemasukan bulanan | Wajib |
| 4 | Pencatatan Pengeluaran | Tambah, ubah, hapus, dan filter daftar pengeluaran per kategori | Wajib |
| 5 | Pengaturan Budget | Pengaturan 2 tipe anggaran: Anggaran Tetap (rutin) dan Anggaran Sementara | Wajib |
| 6 | Pemantauan Anggaran | Persentase penggunaan, progress bar, dan 4 ambang batas status | Wajib |
| 7 | Peringatan Anggaran | Pesan peringatan otomatis saat penggunaan mencapai 80% atau lebih | Wajib |
| 8 | **Daily Spending Limit** | Batas belanja harian dari sisa anggaran dan sisa hari (fitur pembeda) | Wajib |
| 9 | Dashboard | Ringkasan saldo kas, total anggaran, sisa anggaran, dan kartu maskot | Wajib |
| 10 | Laporan Bulanan | Evaluasi bulanan dengan diagram batang per kategori (*Chart.js*) | Wajib |
| 11 | Pengujian | Rangkaian unit test logika bisnis terotomatisasi (*Vitest*) | Wajib |
| 12 | Dokumentasi & Publikasi | Panduan lokal (*HowToRun.md*) dan panduan deploy online (*PUBLISH_GUIDE.md*) | Wajib |

---

## 5. Fitur yang Sengaja Tidak Dikerjakan

Fitur berikut sengaja tidak dikerjakan agar website tetap fokus pada kebutuhan inti mahasiswa dan selesai tepat waktu:

- Aplikasi mobile native (proyek berfokus penuh pada **Website Responsif** yang dapat diakses langsung via browser)
- Integrasi otomatis mutasi bank / e-wallet API (saldo dan transaksi diinput manual)
- Pemindaian struk berbasis AI/OCR
- Chatbot dan fitur investasi / crypto
- Notifikasi push di luar browser (WhatsApp, SMS gateway)
- Peran multi-admin / hirarki organisasi

---

## 6. Kriteria Website Dinyatakan Berhasil

Website dinyatakan berhasil jika seluruh kriteria berikut terpenuhi:

### A. Fungsional
1. Pengguna dapat register, login, dan logout. Halaman privat terlindungi middleware JWT.
2. Pengguna dapat mengelola pemasukan, pengeluaran, kategori kustom, dan budget (tetap & sementara).
3. Dashboard otomatis ter-update secara real-time saat terjadi perubahan data keuangan.
4. Status anggaran tampil akurat sesuai 4 ambang batas: Aman (<60%), Perlu Perhatian (60-79.9%), Mendekati Batas (80-99.9%), dan Melebihi Anggaran (>=100%).
5. Peringatan dini muncul saat anggaran mencapai 80% ke atas.
6. Daily Spending Limit akurat untuk skenario baku: Budget Rp1.000.000, Pengeluaran Rp750.000, Sisa 10 hari menghasilkan limit tepat Rp25.000/hari.

### B. Teknis dan Publikasi
1. Seluruh 61 unit test lolos verifikasi 100%.
2. Website dapat di-build tanpa error (`npm run build`) dan siap dipublikasikan ke layanan hosting internet (seperti Vercel, Railway, atau VPS).
3. Antarmuka web responsif, rapi, dan nyaman diakses baik dari laptop maupun smartphone.
