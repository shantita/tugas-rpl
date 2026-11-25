# Laporan Praktikum P11: CI/CD Pipeline & Branching Strategy

## 1. Struktur Branching Strategy

Sesuai instruksi tugas, repositori mengadopsi 3 branch utama:
- **`v1.0` (Production Baseline):** Versi rilis awal yang sudah stabil dan berjalan di server live.
- **`v1.0_dev` (Development & Quality Gate):** Branch pengerjaan fitur baru / perbaikan bug. Di branch ini seluruh 200 Unit Test (UT) diuji coba dalam kondisi *FAILED* dan *PASSED*.
- **`v1.1` (Next Release):** Versi rilis berikutnya setelah seluruh pengujian di `v1.0_dev` lulus 100% (All Passed Hijau) dan proses build berhasil.

---

## 2. Simulasi Quality Gate CI/CD: 200 Unit Tests

### A. Kondisi FAILED (Sengaja Dibuat Gagal / Merah)
- **Tindakan:** Mengatur simulasi kesalahan logika kalkulasi pada unit test.
- **Hasil:** `1 failed | 199 passed (200 total tests)`.
- **Efek pada Alur CI/CD:**
  1. Pipeline CI/CD **otomatis dibatalkan (Abort / Broken Build)**.
  2. Proses Auto-Build & Deploy ke server produksi **DIBLOKIR**.
  3. Aplikasi di server Live **TETAP AMAN** dan tidak mengalami down/kerusakan, karena sistem otomatis mencegah kode bermasalah masuk ke production.
- **Bukti Screenshot:**
  - File: `catatan_dan_video/screenshots_p11/screenshot_1_failed_red.png`

---

### B. Kondisi PASSED (All Hijau & Auto Build Live)
- **Tindakan:** Memperbaiki logika kalkulasi sehingga seluruh pengujian valid.
- **Hasil:** `7 passed (7 files) | 200 passed (200 total tests &bull; 100% Success)`.
- **Efek pada Alur CI/CD:**
  1. Quality Gate CI/CD memberikan status **GREEN / PASSED**.
  2. Proses **Auto-Build** (Shared, API, Web Bundler) langsung dieksekusi secara otomatis.
  3. Aplikasi berhasil di-deploy ke status **Live** dan siap untuk dilakukan pengujian tahap berikutnya.
- **Bukti Screenshot:**
  - File Unit Test Passed: `catatan_dan_video/screenshots_p11/screenshot_2_passed_green.png`
  - File Pipeline Auto-Build & Live: `catatan_dan_video/screenshots_p11/screenshot_3_build_live.png`

---

## 3. Promosi Rilis ke Branch `v1.1`
Setelah seluruh pengujian di `v1.0_dev` terverifikasi hijau dan lulus build, kode resmi dipromosikan (merged) ke branch **`v1.1`** dan di-push ke GitHub remote repository.
