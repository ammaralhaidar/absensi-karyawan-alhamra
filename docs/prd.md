# PRODUCT REQUIREMENT DOCUMENT (PRD)

**Nama Proyek:** Alhamra Attendance PWA

**Platform:** Progressive Web App (Mobile & Tablet Kiosk) + Web Dashboard (Desktop)

**Tech Stack Utama:** Next.js (App Router), Tailwind CSS, Shadcn UI, Supabase (PostgreSQL, Auth, Storage)

**Target Migrasi Masa Depan:** Odoo v16

## 1. Ringkasan Eksekutif

Aplikasi ini adalah sistem absensi berbasis PWA yang dirancang *offline-first* dan antikecurangan. Menggunakan mekanisme *Dynamic QR Code* dari perangkat pengguna yang dipindai oleh Kiosk sentral di lobi, aplikasi ini meminimalisir manipulasi data. Sistem ini juga dilengkapi dengan manajemen *shift* hibrida (otomatis dan manual) serta sistem pengajuan cuti/izin mandiri untuk memangkas beban administratif HR.

## 2. Target Pengguna (User Personas)

1. **Karyawan (termasuk Siswa PKL/Magang):** Mengakses PWA di *smartphone* untuk menghasilkan QR Code absensi dan mengajukan ketidakhadiran (Cuti/Sakit/Izin).
2. **Security / Resepsionis:** Bertanggung jawab atas Tablet Kiosk di lobi yang berfungsi sebagai alat pemindai (*scanner*) *real-time*.
3. **Admin / HR:** Mengelola jadwal dinamis, menyetujui pengajuan izin, dan mengekspor laporan akhir bulan untuk *payroll*.

## 3. Fitur Utama & Kebutuhan Fungsional (Functional Requirements)

### 3.1. Autentikasi & Manajemen Akun

* **Login Standard:** Pengguna masuk menggunakan Email dan Password *default*.
* **Self-Service Password:** Karyawan wajib dapat mengganti *password* di dalam menu profil.
* **Lupa Password:** Integrasi *reset password* via email menggunakan Supabase Auth.

### 3.2. PWA Mobile (Sisi Karyawan)

* **Dynamic QR Code Generator:** * Halaman utama (Dashboard Karyawan) langsung menampilkan QR Code besar.
* QR Code mengandung *payload* terenkripsi (ID Karyawan + *Timestamp*).
* QR Code wajib melakukan *auto-refresh* setiap 30 detik untuk mencegah kecurangan (*screenshot*/titip absen).


* **Pengajuan Ketidakhadiran (Leave Request):**
* Karyawan dapat mengajukan Cuti, Sakit, atau Izin.
* Formulir mencakup: Pilihan Tanggal (Mulai - Selesai), Tipe Izin, Alasan, dan fitur *Upload* Dokumen/Foto (wajib untuk tipe "Sakit").
* Status pengajuan (Pending/Approved/Rejected) dapat dipantau *real-time*.



### 3.3. PWA Kiosk Tablet (Sisi Security)

* **Continuous Scanner:** Kamera (depan/belakang) selalu aktif memindai tanpa perlu menekan tombol jeda antar karyawan.
* **Visual & Audio Feedback:** Menampilkan layar Hijau + bunyi "Beep" (jika sukses/tepat waktu), Kuning (jika terlambat), dan Merah (jika QR *expired*/salah).
* **Recent Scan Log:** Panel di sisi layar yang menampilkan riwayat 5 orang terakhir yang baru saja berhasil dipindai (Nama, Jam, Status).
* **Offline Mode:** Jika koneksi terputus, Kiosk tetap bisa memindai QR dan menyimpan data *check-in/out* ke *IndexedDB* (lokal). Begitu *online*, sistem melakukan *background sync* ke Supabase.

### 3.4. Dashboard Admin / HR (Web Desktop)

* **Smart Scheduling (Manajemen Jadwal):**
* **Default Shift:** Pengaturan jam kerja otomatis (misal: 08:00 - 17:00) yang berlaku untuk mayoritas karyawan tanpa perlu di-*setting* setiap bulan.
* **Custom Roster:** Matriks kalender khusus untuk divisi dengan jam kerja dinamis (Dapur & Security). Memiliki tombol "Copy from Previous Month" untuk mempercepat *input* jadwal.
* **Toleransi Keterlambatan:** Parameter `late_tolerance_minutes` (default: 0) yang dapat diubah HR untuk menentukan batas aman keterlambatan.


* **Approval Center:** Halaman untuk meninjau, melihat lampiran foto, dan memberikan *Approve/Reject* pada pengajuan cuti/sakit karyawan. Saat di-*approve*, data langsung memotong kalender kehadiran karyawan tersebut.
* **Anomaly Dashboard (Lupa Absen):** Sistem *auto-flagging* pada pukul 23:59. Jika ada karyawan yang *check-in* tapi tidak *check-out*, datanya dilabeli "Lupa Checkout" agar HR bisa melakukan intervensi manual.

### 3.5. Modul Laporan & Ekspor (Excel)

* **Export to Excel (`.xlsx`):** Fitur unduh laporan absensi dengan format multi-sheet (penamaan *file* standar: `Rekap_Absensi_All_[Bulan][Tahun].xlsx`).
* **Sheet 1 (Rekapitulasi Bulanan):** Matriks daftar nama karyawan ke bawah, dan tanggal (1-31) ke samping. Menggunakan kode huruf (H=Hadir, S=Sakit, I=Izin, C=Cuti, A=Alpa/Kosong, T=Terlambat). Terdapat kolom total akumulasi jam kerja dan jumlah tiap kode.
* **Sheet 2 (Log Kronologis):** Data mentah pergerakan absensi harian (Nama, Divisi, Jadwal Shift, Jam Scan Masuk, Jam Scan Keluar, Status Terlambat).



## 4. Kriteria Penerimaan (Acceptance Criteria)

* Aplikasi dapat diinstal di *homescreen* HP/Tablet (PWA *Installable*).
* QR Code yang kedaluwarsa (lebih dari 30 detik) secara konsisten ditolak oleh Kiosk.
* Data karyawan yang "Sakit/Cuti" yang sudah di-*approve* HR tidak akan terhitung sebagai "Alpa" di laporan Excel akhir bulan.
* *Export* Excel memproses data di sisi klien (*client-side processing*) agar responsif dan tidak membebani *server* saat karyawan berjumlah banyak.

---
