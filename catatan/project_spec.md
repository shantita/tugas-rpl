Aplikasi web full-stack sederhana bernama **Monthly Budgeting App**.

Tujuan:
Membantu mahasiswa mengatur uang saku bulanan. Mahasiswa mencatat pemasukan dan pengeluaran, menentukan anggaran (budget) per kategori
untuk setiap bulan, memantau penggunaan anggaran, dan melihat **Daily Spending Limit** yang menunjukkan berapa uang yang aman
dibelanjakan per hari sampai akhir bulan. Aplikasi ini adalah proyek mata kuliah Rekayasa Perangkat Lunak (RPL), sehingga kode harus
tetap sederhana, mudah dibaca, dan mudah dijelaskan.

Gunakan stack berikut:

* Frontend: React + TypeScript + Vite + Tailwind CSS
* Backend: Node.js + TypeScript + Express
* Database: MySQL
* ORM: Prisma
* Gaya API: REST API
* Autentikasi: JWT (jsonwebtoken) dengan password hashing (bcrypt)
* Validasi: Zod (validasi request di backend)
* Testing: Vitest (unit test service perhitungan dan API test di backend)
* Chart: Chart.js dengan react-chartjs-2 (hanya untuk laporan bulanan)
* Gunakan Docker Compose untuk MySQL
* Gunakan `.env.example` untuk URL database dan JWT secret

Aturan kode:

* Jangan menambahkan komentar kecuali benar-benar perlu. Komentar hanya diperbolehkan untuk aturan Daily Spending Limit.
* Gunakan PascalCase untuk semua class, type, interface, enum, komponen React, model database, DTO API, dan nama properti JSON.
* Variabel lokal boleh menggunakan camelCase.
* Usahakan panjang baris kode kurang dari 150 karakter.
* Gunakan struktur folder yang bersih dan sederhana.
* Jangan over-engineering. Tanpa microservices, tanpa design pattern rumit, tanpa lapisan abstraksi yang tidak perlu.

Entitas utama:

1. User

   * Id
   * Name
   * Email (unik)
   * PasswordHash
   * CreatedAt

2. Category (master data global, tidak dimiliki oleh user tertentu)

   * Id
   * Name (unik)

3. Budget

   * Id
   * UserId
   * CategoryId
   * Amount
   * Month
   * Year
   * CreatedAt

4. Income

   * Id
   * UserId
   * Amount
   * Date
   * Description
   * CreatedAt

5. Expense

   * Id
   * UserId
   * CategoryId
   * Amount
   * Date
   * Description
   * CreatedAt

Relasi:

* User 1:N Budget, User 1:N Income, User 1:N Expense
* Category 1:N Budget, Category 1:N Expense

Aturan database:

* Simpan semua nilai uang sebagai Prisma `Decimal` (`@db.Decimal(12, 2)`), jangan pernah memakai Float.
* Budget harus unik berdasarkan `UserId`, `CategoryId`, `Month`, dan `Year`.
* Jangan menyimpan nilai turunan (sisa anggaran, persentase penggunaan, daily limit, saldo). Selalu hitung dari data mentah.
* Setiap query pada Budget, Income, dan Expense harus difilter berdasarkan `UserId` milik user yang sedang login.
* User tidak boleh dapat membaca, mengubah, atau menghapus data milik user lain. Kembalikan 404 untuk data yang bukan miliknya.
* Query berbasis periode harus memakai rentang tanggal (`Date >= tanggal 1 bulan tersebut` dan `Date < tanggal 1 bulan berikutnya`),
  sehingga data September tidak pernah menyertakan data Agustus atau Oktober.
* Category yang masih dipakai oleh Budget atau Expense tidak boleh dihapus.
* Gunakan Prisma migration dan seed kategori default: Makanan, Transportasi, Kos/Kontrakan, Hiburan, Lainnya.
  Opsional: seed satu user demo beserta contoh income, budget, dan expense.

Fitur backend:

1. Autentikasi

   * Register dengan Name, Email, Password. Email harus valid dan belum digunakan. Password minimal 8 karakter.
   * Login dengan Email dan Password, mengembalikan JWT.
   * Mengambil data user yang sedang login.
   * Middleware autentikasi melindungi semua route kecuali register dan login.

2. CRUD Category

   * Lihat daftar, tambah, ubah, hapus.

3. CRUD Income

   * Lihat daftar (filter opsional Month dan Year), detail, tambah, ubah, hapus.
   * Amount harus lebih dari 0. Date harus valid.

4. CRUD Expense

   * Lihat daftar (filter opsional Month dan Year), detail, tambah, ubah, hapus.
   * Amount harus lebih dari 0. Date harus valid. CategoryId harus ada.

5. CRUD Budget

   * Lihat daftar (filter opsional Month dan Year), detail, tambah, ubah, hapus.
   * Amount harus lebih dari 0. Month harus 1 sampai 12. Year harus valid. CategoryId harus ada.
   * Budget ganda untuk kategori dan periode yang sama mengembalikan 400 dengan pesan yang jelas.

6. Service perhitungan budget (satu tempat untuk semua rumus)

   * TotalIncome, TotalExpense, Balance = TotalIncome - TotalExpense
   * RemainingBudget = Budget - Expense
   * UsagePercentage = Expense / Budget * 100
   * TotalBudget dan RemainingBudget pada ringkasan hanya menghitung pengeluaran dari kategori yang memiliki budget pada periode tersebut.
     Pengeluaran di kategori tanpa budget tetap dihitung dalam TotalExpense dan Balance.
   * Semua perhitungan dibatasi pada Month dan Year yang dipilih. Default-nya adalah bulan dan tahun saat ini.

7. Aturan status budget

   * `SAFE`: penggunaan di bawah 60%
   * `WARNING`: penggunaan dari 60% sampai di bawah 80%
   * `NEAR_LIMIT`: penggunaan dari 80% sampai di bawah 100%
   * `EXCEEDED`: penggunaan 100% atau lebih
   * Label Indonesia: Aman, Perlu Perhatian, Mendekati Batas, Melebihi Anggaran.
   * Kategori dengan status `NEAR_LIMIT` atau `EXCEEDED` mengembalikan pesan peringatan.

8. Daily Spending Limit (fitur utama)

   * RemainingDays termasuk hari ini: hari terakhir bulan - hari ini + 1.
   * Jika periode yang dipilih adalah bulan yang sudah lewat: RemainingDays = 0.
   * Jika periode yang dipilih adalah bulan yang akan datang: RemainingDays = jumlah hari pada bulan tersebut.
   * DailyLimit = RemainingBudget / RemainingDays, dibulatkan ke bawah ke Rupiah utuh.
   * Hitung per kategori dan untuk total seluruh budget.
   * Jangan pernah membagi dengan nol.
   * Evaluasi pesan dengan urutan berikut:
     1. Tidak ada budget: DailyLimit 0, Status `NO_BUDGET`, "Budget belum diatur untuk kategori ini."
     2. RemainingDays sama dengan 0: DailyLimit 0, Status `PERIOD_ENDED`, "Periode anggaran telah berakhir."
     3. Expense lebih besar dari budget: DailyLimit 0, Status `BUDGET_EXCEEDED`, "Budget telah melebihi batas."
     4. Sisa budget sama dengan 0: DailyLimit 0, Status `BUDGET_EMPTY`, "Budget sudah habis."
     5. Selain itu: Status `NORMAL`, DailyLimit = RemainingBudget / RemainingDays.
   * Contoh: Budget 1.000.000, Expense 750.000, Sisa 250.000, RemainingDays 10, DailyLimit 25.000.

9. Dashboard API

   * Summary: TotalIncome, TotalExpense, Balance, TotalBudget, RemainingBudget.
   * Categories: per kategori berisi CategoryId, CategoryName, BudgetAmount, ExpenseAmount, UsagePercentage, Status, WarningMessage.
   * Daily limit: total dan per kategori dengan DailyLimit, RemainingBudget, RemainingDays, Status, Message.

10. Monthly Report API

    * Input: Month dan Year.
    * Mengembalikan TotalIncome, TotalExpense, Balance, TotalBudget, RemainingBudget, dan ExpenseByCategory.

Halaman frontend:

1. Register dan Login

   * Form sederhana dengan validasi. Setelah login, arahkan ke Dashboard.
   * Simpan JWT di localStorage dan kirim sebagai Bearer token pada setiap request.
   * User yang belum login diarahkan ke halaman Login. Token kedaluwarsa atau tidak valid akan membuat user logout otomatis.

2. Dashboard

   * Pemilih bulan dan tahun, default bulan berjalan.
   * Kartu ringkasan: Total Pemasukan, Total Pengeluaran, Saldo, Total Anggaran, Sisa Anggaran.
   * Kartu Daily Spending Limit, contohnya "Rp25.000 / hari", dengan keterangan
     "Jumlah maksimal yang disarankan untuk digunakan per hari berdasarkan sisa anggaran dan sisa hari."
   * Budget overview per kategori: nama, "Rp750.000 / Rp1.000.000", progress bar, persentase, dan badge status.
   * Kotak peringatan untuk setiap kategori dengan status `NEAR_LIMIT` atau `EXCEEDED`, contohnya "Perhatian! Penggunaan budget Makanan sudah mencapai 82%."
   * Empty state ketika belum ada budget, dengan tombol menuju halaman Budget.

3. Manajemen Pemasukan

   * Tabel: Tanggal, Keterangan, Jumlah, Aksi.
   * Form untuk menambah dan mengubah pemasukan. Dialog konfirmasi sebelum menghapus.

4. Manajemen Pengeluaran

   * Tabel: Tanggal, Kategori, Keterangan, Jumlah, Aksi.
   * Form dengan dropdown kategori untuk menambah dan mengubah pengeluaran. Dialog konfirmasi sebelum menghapus.
   * Filter bulan dan tahun.

5. Manajemen Budget

   * Tabel: Kategori, Bulan, Tahun, Jumlah Anggaran, Aksi.
   * Form: kategori, jumlah, bulan, tahun. Dialog konfirmasi sebelum menghapus.

6. Laporan Bulanan

   * Pemilih bulan dan tahun.
   * Kartu: Total Pemasukan, Total Pengeluaran, Saldo, Total Anggaran, Sisa Anggaran.
   * Tabel pengeluaran per kategori dan satu bar chart sederhana.

Kebutuhan UI:

* Gunakan bahasa Indonesia untuk semua label, tombol, pesan, dan validasi.
* Format uang sebagai Rupiah, contohnya `Rp1.000.000`.
* Buat layout yang bersih, sederhana, dan responsif dengan sidebar atau navbar: Dashboard, Pemasukan, Pengeluaran, Budget, Laporan, Logout.
* Gunakan card, tabel, progress bar, badge, alert, form, dialog konfirmasi sebelum hapus, loading state, dan empty state yang sederhana.
* Tampilkan pesan error yang ramah, contohnya "Gagal mengambil data. Silakan coba lagi."
* Warna badge status:

  * Aman: hijau
  * Perlu Perhatian: kuning
  * Mendekati Batas: oranye
  * Melebihi Anggaran: merah

Format response API (semua response):

* Sukses: `{ "Success": true, "Message": "...", "Data": {} }`
* Error: `{ "Success": false, "Message": "..." }`
* Gunakan status code yang sesuai: 200, 201, 400, 401, 404, 422, 500.
* Tangani error validasi dan error tak terduga dalam satu error handler terpusat dengan format yang sama.

Route API yang wajib ada:

* `POST /api/auth/register`
* `POST /api/auth/login`
* `GET /api/auth/me`
* `GET /api/categories`
* `POST /api/categories`
* `PUT /api/categories/:Id`
* `DELETE /api/categories/:Id`
* `GET /api/incomes`
* `GET /api/incomes/:Id`
* `POST /api/incomes`
* `PUT /api/incomes/:Id`
* `DELETE /api/incomes/:Id`
* `GET /api/expenses`
* `GET /api/expenses/:Id`
* `POST /api/expenses`
* `PUT /api/expenses/:Id`
* `DELETE /api/expenses/:Id`
* `GET /api/budgets`
* `GET /api/budgets/:Id`
* `POST /api/budgets`
* `PUT /api/budgets/:Id`
* `DELETE /api/budgets/:Id`
* `GET /api/dashboard/summary?Month=&Year=`
* `GET /api/dashboard/categories?Month=&Year=`
* `GET /api/dashboard/daily-limit?Month=&Year=`
* `GET /api/reports/monthly?Month=&Year=`

Testing:

* Gunakan Vitest untuk backend.
* Unit test untuk service perhitungan: Balance, RemainingBudget, UsagePercentage, batas status budget, dan Daily Spending Limit,
  termasuk contoh (1.000.000 / 750.000 / 10 hari = 25.000), tanpa budget, periode berakhir, melebihi budget, dan budget habis.
* API test: register berhasil, email duplikat ditolak, login berhasil, password salah ditolak, income negatif ditolak,
  expense negatif ditolak, kategori tidak valid ditolak, budget negatif ditolak, budget duplikat ditolak,
  user tidak dapat mengakses data user lain, dan filter periode tidak menyertakan bulan lain.
* Buat tanggal saat ini dapat di-inject pada service Daily Spending Limit agar test dapat memakai tanggal tetap.

Jangan menambahkan:

* Integrasi bank atau e-wallet, pembayaran online, OCR struk, prediksi AI, chatbot, investasi, cryptocurrency,
  notifikasi, sinkronisasi multi-device, fitur sosial, role, atau manajemen organisasi.

Deliverables:

* Source code frontend dan backend yang lengkap.
* Prisma schema, migration, dan seed data.
* File Docker Compose untuk MySQL.
* `.env.example`.
* README berisi deskripsi proyek, tujuan, target pengguna, fitur, penjelasan Daily Spending Limit, tech stack,
  struktur proyek, struktur database, endpoint API, instalasi, migrasi database, seed, cara menjalankan frontend dan backend,
  penggunaan Docker, testing, keterbatasan (termasuk JWT di localStorage), dan pengembangan selanjutnya.
* Pastikan aplikasi berhasil di-build, semua CRUD dasar berfungsi, dan dashboard ter-update dengan benar setelah setiap
  perubahan income, expense, atau budget.

Struktur proyek:

* Gunakan monorepo TypeScript dengan npm workspaces.
* Struktur:

monthly-budgeting-app/
  apps/
    web/
    api/
  packages/
    shared/

Kebutuhan package shared:

* Buat `packages/shared` sebagai `@monthly-budgeting-app/shared`.
* Simpan semua model domain bersama, enum, tipe response API, dan konstanta bersama di sini.
* `apps/web` dan `apps/api` wajib mengimpor tipe bersama dari package ini.
* Jangan menduplikasi definisi model domain antara frontend dan backend.

Contoh file shared:

packages/shared/src/
  models/
    User.ts
    Category.ts
    Budget.ts
    Income.ts
    Expense.ts
  enums/
    BudgetStatus.ts
    DailyLimitStatus.ts
  dto/
    ApiResponse.ts
    AuthResponse.ts
    DashboardSummary.ts
    CategoryUsage.ts
    DailyLimitResponse.ts
    MonthlyReport.ts
  constants/
    BudgetThresholds.ts
  index.ts

Aturan model:

* Definisikan interface atau type TypeScript bersama hanya sekali di `packages/shared`.
* Contoh: `Expense`, `Budget`, `BudgetStatus`, dan `DailyLimitStatus` harus diimpor oleh frontend dan backend
  dari `@monthly-budgeting-app/shared`.
* Batas status budget (60, 80, 100) didefinisikan sekali di konstanta shared dan dipakai oleh backend dan frontend.
* Model Prisma tetap berada di backend karena bersifat spesifik database.
* Backend memetakan entitas Prisma ke model API shared sebelum mengembalikan response. Ubah Decimal menjadi number dan jangan pernah mengembalikan PasswordHash.
* Frontend tidak boleh mengimpor tipe Prisma.
* Konfigurasikan TypeScript paths, dependensi workspace, script build, dan script development dengan benar agar semua package berhasil dikompilasi.