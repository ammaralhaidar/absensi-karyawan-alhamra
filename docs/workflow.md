# WORKFLOW (ALUR KERJA SISTEM)

**Nama Proyek:** Alhamra Attendance PWA

## 1. Alur Karyawan Harian (Absensi Masuk & Pulang)

1. **Buka Aplikasi:** Karyawan tiba di kantor dan membuka PWA absensi di *smartphone* mereka.
2. **Auto-Generate QR:** Sistem langsung memuat `/dashboard` dan me-render *Dynamic QR Code* berbasis ID Karyawan dan waktu saat ini (terenkripsi). *Timer* 30 detik mulai berjalan.
3. **Proses Scan:** Karyawan menunjukkan layar HP ke kamera Kiosk Tablet di meja Security.
4. **Validasi:**
* Kiosk membaca data. Jika QR kedaluwarsa, muncul notifikasi merah di tablet ("QR Expired, Silakan Refresh").
* Jika valid, sistem membandingkan waktu *scan* dengan `start_time` di *Shift* karyawan tersebut.


5. **Sukses:** Layar Kiosk menampilkan warna Hijau (Tepat Waktu) atau Kuning (Terlambat) disertai bunyi "Beep". Nama karyawan muncul di panel "5 Log Terakhir".
6. **Selesai:** Karyawan menutup aplikasi. Proses yang sama persis diulang saat jam pulang kantor (sistem otomatis mencatatnya sebagai `check_out`).

## 2. Alur Operasional Kiosk Security (Handling Online & Offline)

1. **Persiapan Pagi:** Security membuka PWA di tablet, *login* sebagai akun Kiosk, dan masuk ke menu Scanner. Kamera otomatis aktif.
2. **Continuous Scanning:** Kamera terus siaga. Setiap kali mendeteksi QR, ia mengeksekusi validasi tanpa perlu ditekan tombol apa pun.
3. **Skenario Internet Putus (Offline):**
* Indikator PWA berubah menjadi "Offline Mode".
* Kiosk tetap bisa memindai QR Code. Validasi kedaluwarsa 30 detik tetap berjalan (karena menggunakan jam internal perangkat).
* Data *scan* berhasil disimpan sementara di *IndexedDB* tablet.


4. **Background Sync:** Saat koneksi internet kembali ("Online Mode"), sistem otomatis mengirim seluruh antrean data dari *IndexedDB* ke *database* Supabase secara *background*, lalu mengosongkan *storage* lokal.

## 3. Alur Pengajuan Cuti & Izin (Self-Service)

1. **Inisiasi Karyawan:** Karyawan membuka PWA, masuk ke menu "Pengajuan Izin", dan mengisi *form* (Pilih rentang tanggal, tipe absen misal "Sakit", dan *upload* foto surat dokter).
2. **Notifikasi HR:** Status pengajuan masuk ke *database* dengan label `pending`. Di web *dashboard* HR, muncul indikator pengajuan baru.
3. **Approval HR:** HR meninjau pengajuan dan foto lampiran. Jika sesuai, HR menekan tombol "Approve".
4. **Auto-Update Kalender:** Sistem mengubah status di `leave_requests` menjadi `approved` dan secara otomatis mengunci tanggal tersebut di laporan agar tidak terhitung "Alpa". Status di PWA karyawan berubah menjadi "Disetujui".

## 4. Alur Resolusi Lupa Absen (Anomaly Flagging)

1. **Sistem Sweeping (Tengah Malam):** Tepat pukul 23:59, *cron job* mengecek karyawan yang hanya memiliki jam masuk tanpa jam pulang. Sistem melabeli data tersebut dengan `lupa_checkout`.
2. **Review HR (Pagi Hari):** HR membuka *dashboard*, melihat tab "Perlu Perhatian / Anomali".
3. **Tindakan:** HR melakukan konfirmasi ke karyawan terkait, lalu menginput jam pulang secara manual (atau membiarkannya kosong sesuai kebijakan), lalu menekan tombol "Resolve" agar data tersebut bersih dari status anomali.

## 5. Alur Akhir Bulan (Roster & Payroll)

1. **Update Shift (Khusus Dapur/Security):** HR masuk ke menu "Roster Management", memilih departemen Dapur, klik "Copy Previous Month", menyesuaikan jadwal yang bertukar/libur untuk bulan depan, lalu klik "Save".
2. **Export Laporan:** HR masuk ke menu "Report", memilih rentang 1-31 bulan tersebut, lalu klik "Download Excel".
3. **Hasil:** Sistem mengunduh `Rekap_Absensi_All_BulanTahun.xlsx` dalam hitungan detik. Sheet 1 siap diserahkan ke *Finance/Payroll*, Sheet 2 digunakan sebagai arsip *log* pergerakan.

---

### Langkah Eksekusi Praktis Selanjutnya

Sekarang Anda sudah memiliki "Tritunggal" dokumen yang sempurna: **PRD**, **SRS**, dan **Workflow**. Dokumen-dokumen ini sangat ramah untuk dikonsumsi oleh AI.

Langkah terbaik selanjutnya yang bisa Anda lakukan di *environment* pengembangan lokal mesin Apple Silicon Anda adalah:

1. **Setup Project Dasar:** Buka terminal, jalankan `npx create-next-app@latest cendana-attendance-pwa` (pilih App Router, Tailwind, TypeScript).
2. **Install Komponen Utama:** Jalankan inisialisasi `shadcn-ui` dan instal *library* *scanner* (misal `html5-qrcode`).
3. **Setup Supabase Local/Cloud:** Buat *project* di Supabase, ambil URL dan Anon Key-nya, letakkan di `.env.local`.
4. **Prompting ke AI Agent:** Anda bisa menggunakan Cursor, GitHub Copilot, atau Claude/Gemini di jendela terpisah.

Apakah Anda ingin saya buatkan draf **"Master Prompt"** (instruksi awal yang sangat kuat) untuk membungkus ketiga dokumen ini agar AI Coding Agent Anda bisa langsung melakukan *scaffolding* (membuat struktur folder, tabel *database*, dan *routing* awal) tanpa membuat kesalahan?
