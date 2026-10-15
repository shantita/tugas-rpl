# 5 User Story & Kriteria Penerimaan (Acceptance Criteria) - MVP

**Aplikasi:** Monthly Budgeting App  
**Tema:** Pengelolaan Anggaran Bulanan Mahasiswa dengan Daily Spending Limit  

Dokumen ini mendefinisikan 5 User Story inti yang menjadi ruang lingkup Minimum Viable Product (MVP) beserta Kriteria Penerimaan (*Acceptance Criteria*) yang terukur dan telah diimplementasikan dalam kode produksi serta divalidasi oleh rangkaian unit test.

---

## 1. US-01: Autentikasi Pengguna Mahasiswa (Registrasi & Login)

* **User Story:**  
  Sebagai **mahasiswa pengguna aplikasi**,  
  Saya ingin **mendaftar akun baru dan masuk (login) ke sistem dengan aman**,  
  Agar **seluruh data keuangan, pemasukan, pengeluaran, dan anggaran saya bersifat privat dan terisolasi dari pengguna lain**.

* **Kriteria Penerimaan (Acceptance Criteria):**
  1. Pengguna dapat mendaftarkan akun dengan memasukkan Nama, Email yang valid, dan Password minimal 8 karakter.
  2. Sistem menolak pendaftaran jika format email tidak valid atau email sudah pernah terdaftar (duplikat) dengan mengembalikan HTTP `400 Bad Request`.
  3. Password pengguna wajib di-hash menggunakan algoritma aman (`bcrypt` dengan salt rounds) sebelum disimpan ke basis data MySQL (tidak boleh disimpan dalam bentuk teks biasa/plain text).
  4. Pengguna dapat melakukan login menggunakan email dan password yang terdaftar, dan sistem mengembalikan JSON Web Token (JWT) yang valid untuk sesi pengguna.
  5. Sistem menolak percobaan login dengan email yang tidak terdaftar atau password yang tidak cocok dengan mengembalikan HTTP `401 Unauthorized`.
  6. Seluruh rute API operasional (Anggaran, Pemasukan, Pengeluaran, Ringkasan Dashboard, Laporan) wajib dilindungi oleh middleware verifikasi token JWT; akses tanpa token atau dengan token yang tidak valid/kadaluarsa wajib ditolak dengan HTTP `401 Unauthorized`.

---

## 2. US-02: Pencatatan & Manajemen Pemasukan Bulanan (Income Management)

* **User Story:**  
  Sebagai **mahasiswa**,  
  Saya ingin **mencatat dan mengelola riwayat pemasukan bulanan (seperti uang saku dari orang tua, beasiswa, atau gaji kerja paruh waktu)**,  
  Agar **total saldo kas dan ketersediaan dana saya untuk bulan berjalan dapat terpantau secara akurat**.

* **Kriteria Penerimaan (Acceptance Criteria):**
  1. Pengguna dapat menambahkan catatan pemasukan baru dengan mengisi field: Jumlah Uang (`Amount`), Tanggal (`Date`), dan Keterangan (`Description`).
  2. Field `Amount` wajib berupa angka positif lebih dari 0 (`Amount > 0`); sistem menolak nilai 0 atau negatif dengan HTTP `400 Bad Request`.
  3. Field `Description` wajib diisi dan dibersihkan dari spasi berlebih (*trim*); field `Date` wajib berformat tanggal yang valid.
  4. Pengguna dapat melihat daftar pemasukan dengan filter opsional Bulan (`Month` 1-12) dan Tahun (`Year`), di mana sistem menggunakan batas rentang tanggal UTC ketat (`Date >= awal_bulan` dan `Date < awal_bulan_berikutnya`) sehingga tidak terjadi kebocoran data antar-bulan.
  5. Pengguna dapat melihat detail, memperbarui (*update*), dan menghapus (*delete*) data pemasukan miliknya sendiri.
  6. Sistem menerapkan isolasi data pengguna (*multi-tenant user isolation*); pengguna tidak dapat mengakses, mengubah, atau menghapus pemasukan milik pengguna lain (sistem mengembalikan HTTP `404 Not Found`).

---

## 3. US-03: Pencatatan & Manajemen Pengeluaran per Kategori (Expense Management)

* **User Story:**  
  Sebagai **mahasiswa**,  
  Saya ingin **mencatat setiap pengeluaran harian dan mengaitkannya ke kategori tertentu (Makanan, Transportasi, Kos/Kontrakan, Hiburan, Lainnya)**,  
  Agar **saya mengetahui ke mana saja uang saku saya terpakai dan pos pengeluaran mana yang paling besar**.

* **Kriteria Penerimaan (Acceptance Criteria):**
  1. Pengguna dapat mencatat pengeluaran baru dengan menentukan Kategori (`CategoryId`), Jumlah Uang (`Amount`), Tanggal (`Date`), dan Keterangan (`Description`).
  2. Field `Amount` wajib lebih dari 0 (`Amount > 0`); sistem menolak pengeluaran dengan nominal 0 atau negatif dengan HTTP `400 Bad Request`.
  3. Kategori yang dipilih (`CategoryId`) wajib terdaftar dalam data master sistem; jika kategori tidak valid/tidak ditemukan, request ditolak dengan HTTP `400 Bad Request`.
  4. Pengguna dapat memfilter daftar pengeluaran berdasarkan Bulan dan Tahun secara akurat sesuai rentang tanggal bulan tersebut.
  5. Pengguna dapat memperbarui dan menghapus pengeluaran miliknya sendiri dengan konfirmasi dan isolasi akses per-user (`UserId`).

---

## 4. US-04: Alokasi & Pemantauan Status Anggaran (Budget Management & Threshold Monitoring)

* **User Story:**  
  Sebagai **mahasiswa**,  
  Saya ingin **menetapkan batas anggaran per kategori untuk bulan tertentu serta memantau persentase penggunaannya**,  
  Agar **satu pos kebutuhan tidak menghabiskan jatah pos kebutuhan lain dan saya memperoleh peringatan dini sebelum anggaran habis**.

* **Kriteria Penerimaan (Acceptance Criteria):**
  1. Pengguna dapat membuat anggaran baru dengan menentukan Kategori (`CategoryId`), Bulan (`Month` 1 s.d. 12), Tahun (`Year`), dan Jumlah Anggaran (`Amount > 0`).
  2. Sistem menolak pembuatan anggaran duplikat untuk kategori, bulan, dan tahun yang sama oleh pengguna yang sama dengan mengembalikan pesan error informatif dan HTTP `400 Bad Request`.
  3. Sistem menghitung persentase penggunaan anggaran:  
     $$\text{UsagePercentage} = \frac{\text{Total Pengeluaran Kategori}}{\text{Jumlah Anggaran Kategori}} \times 100$$
  4. Sistem menentukan status anggaran secara dinamis berdasarkan 4 ambang batas (*thresholds*):
     - `SAFE` (Aman): Penggunaan di bawah 60% (`< 60%`).
     - `WARNING` (Perlu Perhatian): Penggunaan mulai dari 60% sampai di bawah 80% (`60% - 79.99%`).
     - `NEAR_LIMIT` (Mendekati Batas): Penggunaan mulai dari 80% sampai di bawah 100% (`80% - 99.99%`).
     - `EXCEEDED` (Melebihi Anggaran): Penggunaan 100% atau lebih (`>= 100%`).
  5. Sistem secara otomatis menghasilkan pesan peringatan (*warning message*) pada kategori yang berada pada status `NEAR_LIMIT` dan `EXCEEDED` untuk ditampilkan pada antarmuka dashboard.
  6. Perhitungan total anggaran dan sisa anggaran pada ringkasan dashboard hanya menghitung pengeluaran dari kategori yang memiliki anggaran pada bulan tersebut, sementara pengeluaran kategori non-anggaran tetap dicatat pada Total Pengeluaran dan Saldo Kas.

---

## 5. US-05: Perhitungan Daily Spending Limit (Batas Belanja Harian - Fitur Pembeda)

* **User Story:**  
  Sebagai **mahasiswa perantau**,  
  Saya ingin **mengetahui batas pengeluaran harian yang aman secara riil berdasarkan sisa anggaran dan sisa hari sampai akhir bulan**,  
  Agar **saya tidak kehabisan uang di pertengahan bulan dan dapat membuat keputusan belanja harian yang terukur**.

* **Kriteria Penerimaan (Acceptance Criteria):**
  1. Sistem menghitung Sisa Hari (`RemainingDays`) secara inklusif (termasuk hari ini):  
     $$\text{Sisa Hari} = \text{Hari Terakhir Bulan} - \text{Hari Ini} + 1$$
  2. Jika periode yang dipilih adalah bulan yang telah lewat, Sisa Hari bernilai 0. Jika periode adalah bulan mendatang, Sisa Hari adalah jumlah total hari dalam bulan tersebut.
  3. Pada kondisi normal, batas belanja harian dihitung dengan rumus:  
     $$\text{DailyLimit} = \left\lfloor \frac{\text{Sisa Anggaran}}{\text{Sisa Hari}} \right\rfloor$$  
     dibulatkan ke bawah ke Rupiah utuh dengan status `NORMAL`.
  4. **Kasus Khusus 1 - `NO_BUDGET`:** Jika kategori belum memiliki anggaran yang diatur, `DailyLimit = 0`, status `NO_BUDGET`, dengan pesan: *"Budget belum diatur untuk kategori ini."*
  5. **Kasus Khusus 2 - `PERIOD_ENDED`:** Jika sisa hari bernilai 0 (periode telah berakhir), `DailyLimit = 0`, status `PERIOD_ENDED`, dengan pesan: *"Periode anggaran telah berakhir."* Sistem menjamin tidak terjadi pembagian dengan nol (*zero division safe*).
  6. **Kasus Khusus 3 - `BUDGET_EXCEEDED`:** Jika pengeluaran telah melampaui jumlah anggaran, `DailyLimit = 0`, status `BUDGET_EXCEEDED`, dengan pesan: *"Budget telah melebihi batas."*
  7. **Kasus Khusus 4 - `BUDGET_EMPTY`:** Jika sisa anggaran tepat bernilai 0, `DailyLimit = 0`, status `BUDGET_EMPTY`, dengan pesan: *"Budget sudah habis."*
  8. Sistem lulus kasus uji standar spesifikasi: Anggaran Rp1.000.000, Pengeluaran Rp750.000, Sisa 10 hari menghasilkan Daily Limit tepat Rp25.000/hari.
