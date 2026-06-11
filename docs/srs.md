# SOFTWARE REQUIREMENT SPECIFICATION (SRS)

**Nama Proyek:** Alhamra Attendance PWA

**Environment Target:** Node.js (Kompatibel penuh untuk pengembangan lokal di arsitektur Apple Silicon M1), Supabase (Cloud/Local)

**Tujuan Desain:** *Offline-first capability*, *High Security (Anti-Fraud)*, *Odoo v16 Migration Readiness*

---

## 1. Arsitektur Sistem & Infrastruktur

* **Frontend:** Next.js (App Router) dengan TypeScript.
* **Styling & UI:** Tailwind CSS, Shadcn UI (untuk tabel, form, modal, kalender).
* **State Management & Data Fetching:** React Query / SWR (opsional, disarankan untuk *caching* ringan) atau langsung menggunakan Supabase Client *real-time subscriptions*.
* **Offline Support:** *Service Worker* (PWA) dipadukan dengan *IndexedDB* (menggunakan `idb` atau `localforage`) untuk menampung antrean *scan* QR saat Kiosk kehilangan koneksi internet.
* **Backend & Database:** Supabase (PostgreSQL). Memanfaatkan Supabase Auth, Storage (untuk unggah bukti sakit), dan Edge Functions / pg_cron (untuk *scheduler* otomatis).

---

## 2. Skema Database (PostgreSQL / Supabase)

Struktur tabel ini didesain sedemikian rupa agar nantinya mudah dipetakan (*mapping*) ke modul HR di Odoo v16 (`hr.employee`, `hr.attendance`, `hr.holidays`, `resource.calendar`).

**Catatan untuk AI Agent:** Wajib mengaktifkan **Row Level Security (RLS)** di Supabase. Karyawan hanya bisa melihat data mereka sendiri, Admin/HR bisa melihat semua data.

### 2.1. Tabel `departments`

*Odoo Mapping: `hr.department*`

* `id` (UUID, Primary Key)
* `name` (Varchar) — *Contoh: "Web Developer", "Dapur", "Security"*
* `created_at` (Timestamptz)

### 2.2. Tabel `shifts` (Master Jam Kerja)

*Odoo Mapping: `resource.calendar*`

* `id` (UUID, Primary Key)
* `name` (Varchar) — *Contoh: "Shift Pagi", "Shift Reguler"*
* `start_time` (Time) — *Jam masuk standar*
* `end_time` (Time) — *Jam pulang standar*
* `late_tolerance_minutes` (Integer) — *Default: 0*
* `is_default` (Boolean) — *Penanda jadwal otomatis untuk mayoritas divisi*

### 2.3. Tabel `employees`

*Odoo Mapping: `hr.employee*`

* `id` (UUID, Primary Key) — *Digunakan sebagai NIK*
* `user_id` (UUID, Foreign Key $\rightarrow$ `auth.users` Supabase)
* `name` (Varchar)
* `department_id` (UUID, Foreign Key $\rightarrow$ `departments`)
* `default_shift_id` (UUID, Foreign Key $\rightarrow$ `shifts`)
* `role` (Enum: `employee`, `admin`, `kiosk_security`)
* `is_active` (Boolean) — *Default: true*

### 2.4. Tabel `custom_rosters` (Pengecualian Jadwal / Shifting)

* `id` (UUID, Primary Key)
* `employee_id` (UUID, Foreign Key $\rightarrow$ `employees`)
* `date` (Date)
* `shift_id` (UUID, Foreign Key $\rightarrow$ `shifts`)

### 2.5. Tabel `leave_requests` (Pengajuan Cuti/Sakit)

*Odoo Mapping: `hr.leave*`

* `id` (UUID, Primary Key)
* `employee_id` (UUID, Foreign Key $\rightarrow$ `employees`)
* `leave_type` (Enum: `cuti_tahunan`, `sakit`, `izin`)
* `start_date` (Date)
* `end_date` (Date)
* `reason` (Text)
* `attachment_url` (Varchar, Nullable) — *Link ke Supabase Storage*
* `status` (Enum: `pending`, `approved`, `rejected`) — *Default: pending*

### 2.6. Tabel `attendance_logs`

*Odoo Mapping: `hr.attendance*`

* `id` (UUID, Primary Key)
* `employee_id` (UUID, Foreign Key $\rightarrow$ `employees`)
* `date` (Date)
* `shift_id` (UUID, Foreign Key $\rightarrow$ `shifts`) — *Menyimpan snapshot shift yang berlaku hari itu*
* `check_in` (Timestamptz, Nullable)
* `check_out` (Timestamptz, Nullable)
* `status_in` (Enum: `tepat_waktu`, `terlambat`)
* `anomaly_flag` (Enum: `null`, `lupa_checkout`, `sistem_auto_close`)

---

## 3. Logika Backend & API (Business Logic)

### 3.1. Dynamic QR Code Generation (Client-Side)

* **Library:** `qrcode.react` (atau sejenisnya).
* **Payload Encryption:** Data `employee_id` dan `current_timestamp` dibungkus menggunakan enkripsi (misal AES via `crypto-js`) atau ditandatangani menggunakan JWT.
* **Refresh Rate:** Komponen Next.js menggunakan `setInterval` untuk memperbarui *timestamp* dan me-render ulang QR Code setiap **30 detik**.

### 3.2. QR Validation Logic (Saat Kiosk Melakukan Scan)

Ketika Kiosk berhasil membaca QR, fungsi `handleScan` dieksekusi:

1. **Dekripsi Payload:** Sistem memecah string QR.
2. **Validasi Kedaluwarsa:** `Waktu_Sekarang - timestamp_di_QR`. Jika hasilnya $> 30$ detik, *return Error: "QR Expired"*.
3. **Tentukan Shift Hari Ini:**
* Cek tabel `custom_rosters` untuk `employee_id` pada `current_date`.
* Jika ada, gunakan `shift_id` tersebut.
* Jika tidak ada, gunakan `default_shift_id` dari tabel `employees`.


4. **Eksekusi Absensi (Upsert):**
* *Jika belum ada record di `attendance_logs` untuk hari ini:* Catat sebagai `check_in`. Hitung selisih waktu `check_in` dengan `start_time` dari shift (ditambah `late_tolerance_minutes`). Jika melebihi, set `status_in` = `terlambat`. Jika tidak, `tepat_waktu`.
* *Jika sudah ada record `check_in` tetapi `check_out` masih kosong:* Catat sebagai `check_out`.
* *Jika Kiosk Offline:* Simpan objek validasi ke *IndexedDB* dengan format `{ payload, scanned_at }`.



### 3.3. Background Sync (Offline to Online)

* Aplikasi Kiosk mendengarkan *event* `window.addEventListener('online', syncData)`.
* Saat *online*, iterasi seluruh data di *IndexedDB*, kirim ke Supabase Endpoint secara *batch*, lalu hapus data lokal yang berhasil dikirim.

### 3.4. Auto-Flagging Lupa Absen (Cron Job)

* **Pemicu:** Setiap pukul 23:59 waktu lokal.
* **Eksekusi:** Supabase Edge Function atau `pg_cron` melakukan *query* ke `attendance_logs` mencari semua *record* hari itu yang `check_in` *IS NOT NULL* tetapi `check_out` *IS NULL*.
* **Tindakan:** Update *record* tersebut. Set `anomaly_flag` = `lupa_checkout`.

---

## 4. Kebutuhan Frontend (Komponen Utama Next.js)

### 4.1. Mobile PWA (Karyawan)

* `/dashboard`: Menampilkan QR Code besar di tengah layar. Terdapat *timer progress bar* (30 detik) di bawah QR Code yang me-reset ulang gambar.
* `/leaves`: Tabel riwayat pengajuan (TanStack Table). Tombol "Ajukan Baru" membuka modal form (React Hook Form + Zod untuk validasi). Ada input file untuk kamera/galeri khusus dokumen bukti sakit.

### 4.2. Kiosk App (Security Tablet)

* `/kiosk`: Membutuhkan *permission* kamera. Komponen kamera di sisi kiri/tengah mendominasi layar. Gunakan `html5-qrcode` dengan mode `continuous`.
* **UI Sidebar:** Menampilkan *Real-time Log* (5 data terakhir).
* **Audio Feedback:** HTML Audio API untuk memutar suara `success.mp3` atau `error.mp3` setiap proses *scan* selesai.

### 4.3. Admin Web Dashboard (HR)

* `/admin/roster`: Grid kalender. Menggunakan Shadcn Calendar/Date Picker. Fungsi *Bulk Update* dan tombol "Copy Previous Month Roster".
* `/admin/approvals`: Tabel data dari `leave_requests` berstatus `pending`. Klik baris untuk melihat modal detail (termasuk *preview* gambar `attachment_url`). Tombol *Approve*/*Reject*.
* `/admin/reports`: Pemilih rentang tanggal (Date Range Picker). Tombol ekspor mengeksekusi library `xlsx` di sisi klien untuk menggabungkan `attendance_logs` dan data ketidakhadiran (dari `leave_requests` yang *approved*) menjadi 2 Sheet Excel seperti yang didefinisikan di PRD.
