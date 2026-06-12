# 🏫 Alhamra Attendance — Sistem Absensi Karyawan

> **Aplikasi PWA (Progressive Web App) untuk manajemen absensi karyawan** yang dibangun dengan **Next.js 16**, **Supabase Cloud**, dan **Tailwind CSS 4**. Sistem ini mendukung **QR Code scanning** untuk check-in/check-out, **offline-first**, **real-time notifications**, dan **admin dashboard** dengan ekspor laporan ke Excel.

**Status:** Production Ready ✅  
**Versi:** 0.1.0  
**License:** Private (Alhamra Internal)

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Fitur Utama](#fitur-utama)
3. [Tech Stack](#tech-stack)
4. [Arsitektur Aplikasi](#arsitektur-aplikasi)
5. [Database Schema](#database-schema)
6. [Sistem Autentikasi & Role](#sistem-autentikasi--role)
7. [Workflow Aplikasi](#workflow-aplikasi)
8. [Sistem QR Code](#sistem-qr-code)
9. [Offline-First Architecture](#offline-first-architecture)
10. [API Routes](#api-routes)
11. [Supabase Edge Functions](#supabase-edge-functions)
12. [Environment Variables](#environment-variables)
13. [Instalasi & Setup](#instalasi--setup)
14. [Development Workflow](#development-workflow)
15. [Testing](#testing)
16. [Deployment](#deployment)
17. [Git Flow](#git-flow)
18. [Troubleshooting](#troubleshooting)
19. [Kontak & Support](#kontak--support)

---

## 🎯 Overview

**Alhamra Attendance** adalah sistem absensi digital untuk karyawan Yayasan Alhamra. Aplikasi ini dirancang untuk **3 jenis pengguna**:

| Role | Deskripsi | Akses |
|------|-----------|-------|
| **Employee** | Karyawan biasa | Dashboard, QR Code, Pengajuan Cuti, Riwayat Absensi |
| **Kiosk Security** | Petugas keamanan | Halaman Kiosk untuk scan QR karyawan |
| **Admin** | HR/Admin | Dashboard Admin, Manajemen Karyawan, Approval, Laporan, Export Excel |

### 🌐 Production URL
- **Vercel Production:** `https://absen-karyawan-alhamra.vercel.app`
- **Supabase Project:** `https://wyewqgyldltujjunmfmp.supabase.co`

---

## ✨ Fitur Utama

### 🏢 Untuk Karyawan (Employee)
- ✅ **QR Code Check-in/Check-out** — QR Code dengan JWT encryption yang refresh setiap 30 detik
- ✅ **Dashboard Absensi** — Melihat status hadir, terlambat, atau alpa hari ini
- ✅ **Pengajuan Cuti/Sakit/Izin** — Upload lampiran (surat dokter, dll)
- ✅ **Riwayat Absensi** — Melihat log absensi bulanan
- ✅ **Notifikasi Real-time** — Notifikasi saat admin approve/reject pengajuan
- ✅ **Offline Support** — Bisa tetap kerja meski internet mati (data disimpan di IndexedDB)

### 🔒 Untuk Kiosk Security
- ✅ **QR Scanner** — Scan QR Code karyawan menggunakan kamera device
- ✅ **Auto Check-in/Check-out** — Sistem otomatis mendeteksi apakah karyawan check-in atau check-out
- ✅ **Feedback Visual & Audio** — Suara beep + visual feedback saat scan berhasil/gagal
- ✅ **Scan Log** — Riwayat semua scan yang dilakukan
- ✅ **Duplicate Prevention** — Mencegah double scan dalam waktu singkat

### 🎛️ Untuk Admin (HR)
- ✅ **Dashboard Overview** — Statistik karyawan hadir, sakit, izin, cuti, alpa
- ✅ **Manajemen Karyawan** — CRUD karyawan, import dari CSV, assign department & shift
- ✅ **Manajemen Department** — CRUD department (Guru, Musyrif, Security, Dapur, dll)
- ✅ **Manajemen Shift** — CRUD shift kerja (Pagi, Siang, Malam) dengan toleransi keterlambatan
- ✅ **Roster/Jadwal** — Atur jadwal shift karyawan per hari
- ✅ **Approval Pengajuan** — Approve/reject pengajuan cuti/sakit/izin
- ✅ **Export Excel** — Export laporan bulanan (2 sheet: Rekapitulasi + Log Kronologis)
- ✅ **Anomaly Dashboard** — Deteksi & resolve karyawan yang lupa check-out
- ✅ **Activity Log** — Audit trail semua aktivitas admin
- ✅ **Real-time Notifications** — Notifikasi saat ada pengajuan baru atau scan

### 🔄 Sistem Lanjutan
- ✅ **Auto-Flagging** — Cron job otomatis mendeteksi karyawan yang lupa check-out
- ✅ **Background Sync** — Sinkronisasi data offline ke Supabase saat internet kembali
- ✅ **PWA Installable** — Bisa install di Android/iOS seperti aplikasi native
- ✅ **Dual Auth Mode** — Supabase Auth (production) + localStorage demo (development)
- ✅ **JWT QR Encryption** — QR Code dienkripsi dengan JWT yang expired dalam 30 detik
- ✅ **Role-Based Access Control (RBAC)** — Setiap role hanya bisa akses data sesuai haknya
- ✅ **Row Level Security (RLS)** — Keamanan data di level database PostgreSQL

---

## 🛠️ Tech Stack

### Frontend
| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **Next.js** | 16.2.9 | Framework React dengan App Router |
| **React** | 19.2.4 | UI Library |
| **TypeScript** | 5.x | Type Safety |
| **Tailwind CSS** | 4.x | Styling |
| **shadcn/ui** | 4.11.0 | UI Component Library |
| **Radix UI** | 1.5.0 | Headless UI Primitives |
| **Lucide React** | 1.17.0 | Icon Library |
| **Sonner** | 2.0.7 | Toast Notifications |
| **React Hook Form** | 7.78.0 | Form Management |
| **Zod** | 4.4.3 | Schema Validation |

### Backend & Database
| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **Supabase** | 2.x | Backend-as-a-Service (PostgreSQL + Auth + Realtime) |
| **PostgreSQL** | 15+ | Relational Database |
| **Supabase Auth** | — | Authentication & Authorization |
| **Supabase Edge Functions** | — | Serverless functions (Deno) |
| **Row Level Security (RLS)** | — | Database-level security |

### QR & Scanning
| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **qrcode.react** | 4.2.0 | Generate QR Code (SVG) |
| **html5-qrcode** | 2.3.8 | Camera QR Scanner |
| **JWT (via Edge Functions)** | — | QR Code encryption & validation |

### Offline & Storage
| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **IndexedDB (idb)** | 8.0.3 | Local storage for offline data |
| **Service Worker** | — | PWA caching & background sync |
| **Web API** | — | Background sync, notifications |

### Export & Utilities
| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **xlsx** | 0.18.5 | Excel export (2-sheet format) |
| **date-fns** | 4.4.0 | Date manipulation & formatting |
| **clsx + tailwind-merge** | — | Conditional class merging |

### Testing
| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **Playwright** | 1.60.0 | E2E Testing |
| **TypeScript** | — | Type checking |

---

## 🏗️ Arsitektur Aplikasi

### Directory Structure

```
absen-karyawan-alhamra/
├── src/
│   ├── app/                          # Next.js App Router (pages)
│   │   ├── (admin)/                  # Route Group: Admin
│   │   │   ├── admin/                # Admin pages
│   │   │   │   ├── activity-log/
│   │   │   │   ├── approvals/
│   │   │   │   ├── departments/
│   │   │   │   ├── employees/
│   │   │   │   └── shifts/
│   │   │   └── layout.tsx            # Admin layout with sidebar
│   │   ├── (auth)/                   # Route Group: Auth
│   │   │   └── login/
│   │   ├── (kiosk)/                  # Route Group: Kiosk
│   │   │   └── kiosk/
│   │   │       └── page.tsx          # QR Scanner page
│   │   ├── (mobile)/                 # Route Group: Mobile/Employee
│   │   │   ├── dashboard/
│   │   │   └── leaves/
│   │   ├── api/                      # API Routes
│   │   │   ├── qr-generate/
│   │   │   ├── qr-validate/
│   │   │   ├── export-excel/
│   │   │   ├── change-password/
│   │   │   ├── reset-password/
│   │   │   └── upload-attachment/
│   │   ├── page.tsx                  # Root page (redirect based on role)
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css               # Global styles
│   │
│   ├── components/                   # React Components
│   │   ├── features/                 # Feature-specific components
│   │   │   ├── QRCodeDisplay.tsx     # QR Code generator (30s refresh)
│   │   │   ├── QRScanner.tsx         # Camera QR scanner
│   │   │   ├── AttendanceStatusCard.tsx
│   │   │   ├── LeaveRequestCard.tsx
│   │   │   ├── AdminStats.tsx
│   │   │   ├── ApprovalDetail.tsx
│   │   │   ├── AnomalyTable.tsx
│   │   │   ├── NotificationBell.tsx
│   │   │   ├── PWAInstallPrompt.tsx
│   │   │   └── ... (24+ features)
│   │   ├── layout/                   # Layout components
│   │   │   ├── KioskHeader.tsx
│   │   │   └── MobileBottomNav.tsx
│   │   ├── shared/                   # Shared UI components
│   │   │   ├── DataTable.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── PageHeader.tsx
│   │   └── ui/                       # shadcn/ui components
│   │       ├── button.tsx, card.tsx, dialog.tsx, ...
│   │
│   ├── hooks/                        # Custom React Hooks
│   │   ├── useOfflineSync.ts         # Offline sync logic
│   │   ├── useData.ts                # Data fetching hooks
│   │   ├── useAudioFeedback.ts       # Audio feedback for scan
│   │   └── useScanSimulator.ts       # Scan simulation (demo)
│   │
│   ├── lib/                          # Utilities & Libraries
│   │   ├── auth-context.tsx          # Auth context (demo mode)
│   │   ├── auth/actions.ts           # Auth server actions
│   │   ├── supabase/                 # Supabase clients
│   │   │   ├── client.ts             # Browser client
│   │   │   ├── server.ts             # Server client
│   │   │   └── provider.tsx          # Supabase provider
│   │   ├── data/                     # Data access layer
│   │   │   ├── employees.ts
│   │   │   ├── attendance.ts
│   │   │   ├── leaves.ts
│   │   │   ├── hybrid.ts             # Hybrid online/offline data
│   │   │   └── ...
│   │   ├── export/                   # Export utilities
│   │   │   └── excel.ts              # Excel generator (2-sheet)
│   │   ├── offline/                  # Offline utilities
│   │   │   └── sync.ts               # Background sync logic
│   │   ├── dummy-data.ts             # Dummy data (dev only)
│   │   └── utils.ts                  # Utility functions
│   │
│   └── types/                        # TypeScript Types
│       ├── index.ts                  # Application types
│       └── supabase.ts               # Supabase generated types
│
├── tests/                            # E2E Tests
│   └── e2e/
│       ├── login.spec.ts
│       ├── qr-code.spec.ts
│       ├── kiosk-scan.spec.ts
│       ├── leave-request.spec.ts
│       ├── admin-approval.spec.ts
│       ├── export.spec.ts
│       ├── anomaly.spec.ts
│       ├── pwa.spec.ts
│       ├── notifications.spec.ts
│       └── utils/
│           ├── auth.ts               # Test auth helpers
│           └── supabase.ts           # Test cleanup utilities
│
├── supabase/                         # Supabase Configuration
│   ├── functions/                    # Edge Functions (Deno)
│   │   ├── qr-generate/              # Generate JWT QR token
│   │   ├── qr-validate/              # Validate QR token
│   │   └── auto-flag/                # Auto flag lupa checkout
│   └── migrations/                   # Database migrations
│       └── 001_create_schema.sql    # Initial schema
│
├── public/                           # Static assets
│   ├── manifest.json                 # PWA manifest
│   └── icons/                        # PWA icons
│
├── .env.local                        # Environment variables (ignored by git)
├── next.config.ts                    # Next.js config
├── playwright.config.ts             # Playwright config
├── package.json
├── tsconfig.json
└── README.md                         # This file
```

### Route Groups

| Group | Routes | Layout | Access Control |
|-------|--------|--------|----------------|
| `(admin)` | `/admin/*` | Sidebar + Header | `role === 'admin'` |
| `(kiosk)` | `/kiosk` | Fullscreen Scanner | `role === 'kiosk_security'` |
| `(mobile)` | `/dashboard`, `/leaves` | Bottom Navigation | `role === 'employee'` |
| `(auth)` | `/login` | Minimal | Public |

### Data Flow Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │     │   API Routes     │     │   Supabase      │
│   (Next.js)     │────▶│   (Next.js)      │────▶│   (PostgreSQL)  │
│                 │     │                  │     │                 │
│ - React Hooks   │     │ - /api/qr-       │     │ - Edge Functions│
│ - IndexedDB     │     │   generate       │     │ - RLS Policies  │
│ - Service Worker│     │ - /api/qr-       │     │ - Realtime      │
│                 │     │   validate       │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                                               │
         │                                               │
         ▼                                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Offline Sync Layer                        │
│         (IndexedDB → Background Sync → Supabase)              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Tables (10 tabel)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| **employees** | Data karyawan | `id`, `auth_id`, `nik`, `name`, `email`, `phone`, `department_id`, `default_shift_id`, `role`, `avatar_url`, `joined_at`, `is_active` |
| **departments** | Departemen | `id`, `name`, `description` |
| **shifts** | Shift kerja | `id`, `name`, `start_time`, `end_time`, `late_tolerance_minutes`, `is_default` |
| **attendance_logs** | Log absensi | `id`, `employee_id`, `date`, `shift_id`, `check_in`, `check_out`, `status_in`, `anomaly_flag` |
| **leave_requests** | Pengajuan cuti | `id`, `employee_id`, `leave_type`, `start_date`, `end_date`, `reason`, `attachment_url`, `status` |
| **rosters** | Jadwal shift | `id`, `employee_id`, `date`, `shift_id` |
| **admin_activities** | Audit trail | `id`, `type`, `description`, `user_id`, `user_name`, `metadata` |
| **notifications** | Notifikasi | `id`, `employee_id`, `title`, `description`, `type`, `read`, `link` |
| **scan_records** | Log scan | `id`, `employee_id`, `employee_name`, `kiosk_id`, `scanned_at`, `status`, `type`, `qr_token` |
| **holidays** | Hari libur | `id`, `date`, `name`, `type` |

### Relationships

```
employees.auth_id ──► auth.users (Supabase Auth)
employees.department_id ──► departments.id
employees.default_shift_id ──► shifts.id
attendance_logs.employee_id ──► employees.id
attendance_logs.shift_id ──► shifts.id
leave_requests.employee_id ──► employees.id
rosters.employee_id ──► employees.id
rosters.shift_id ──► shifts.id
notifications.employee_id ──► employees.id
scan_records.employee_id ──► employees.id
admin_activities.user_id ──► employees.id
```

### Row Level Security (RLS) Policies

Setiap tabel memiliki RLS policies yang ketat:

- **Admin**: Full access ke semua tabel
- **Employee**: Hanya bisa lihat/edit data miliknya sendiri
- **Kiosk Security**: Bisa scan dan lihat scan records
- **Public**: Hanya bisa read departments, shifts, holidays

---

## 🔐 Sistem Autentikasi & Role

### Dual Auth Mode

Aplikasi mendukung 2 mode autentikasi:

#### 1. Supabase Auth (Production)
- Menggunakan **Supabase Auth** dengan email/password
- JWT token disimpan secara aman
- Session management otomatis
- **Tidak ada self-signup** — admin harus membuat akun karyawan

#### 2. Demo Mode (Development)
- Menggunakan **localStorage** untuk demo
- Tidak memerlukan backend
- Berguna untuk testing & development
- Diaktifkan dengan klik tombol "Demo Login" di halaman login

### Role-Based Access Control

```typescript
type Role = 'employee' | 'admin' | 'kiosk_security';
```

| Role | Redirect After Login | Permissions |
|------|---------------------|-------------|
| `employee` | `/dashboard` | QR Code, Riwayat, Pengajuan, Profile |
| `admin` | `/admin` | Dashboard, CRUD, Approval, Export, Settings |
| `kiosk_security` | `/kiosk` | QR Scanner, Scan Log |

### Auth Flow

```
1. User login dengan email/password
2. Supabase Auth validasi credentials
3. Cek role dari tabel `employees` (berdasarkan `auth_id`)
4. Redirect sesuai role
5. Semua request berikutnya dicek via RLS policies
```

---

## 🔄 Workflow Aplikasi

### 1. Check-in/Check-out (Karyawan)

```
Karyawan ──► Buka Dashboard ──► Lihat QR Code (refresh 30s)
     │
     │ (alternatif)
     ▼
Karyawan ──► Ke Kiosk ──► Scan QR Code ──► Validasi
     │
     ▼
Sistem ──► Cek shift & jam ──► Check-in / Check-out
     │
     ▼
Simpan ke attendance_logs ──► Update status (tepat_waktu/terlambat)
```

### 2. Pengajuan Cuti/Sakit/Izin

```
Karyawan ──► Buka Leaves ──► Form Pengajuan
     │
     ▼
Upload Lampiran (opsional) ──► Submit
     │
     ▼
Simpan ke leave_requests (status: pending)
     │
     ▼
Admin ──► Terima Notifikasi ──► Review ──► Approve/Reject
     │
     ▼
Karyawan ──► Terima Notifikasi ──► Update status
```

### 3. Export Laporan (Admin)

```
Admin ──► Buka Reports ──► Pilih Bulan
     │
     ▼
Generate Excel ──► 2 Sheet:
     │
     ├── Sheet 1: Rekapitulasi (Ringkasan per karyawan)
     │   ├── Total Hadir, Sakit, Izin, Cuti, Alpa, Terlambat
     │   └── Total Jam Kerja
     │
     └── Sheet 2: Log Kronologis (Detail per hari)
         ├── Tanggal, Check-in, Check-out, Status
         └── Keterangan
```

### 4. Auto-Flagging (Sistem)

```
Cron Job (setiap hari jam 00:00) ──► Cek attendance_logs
     │
     ▼
Cari karyawan yang:
     ├── Sudah check-in tapi belum check-out
     └── Shift sudah berakhir > 2 jam
     │
     ▼
Auto set anomaly_flag = 'lupa_checkout'
     │
     ▼
Admin ──► Buka Anomaly Dashboard ──► Resolve (edit checkout time)
```

---

## 📱 Sistem QR Code

### QR Code Generation

```
1. Karyawan buka Dashboard ──► Panggil API /api/qr-generate
2. Server generate JWT token:
   {
     "employee_id": "...",
     "name": "...",
     "iat": 1234567890,
     "exp": 1234567890 + 30s  // Expired dalam 30 detik
   }
3. Return JWT token
4. Frontend render QR Code (SVG) dengan token
5. QR Code auto-refresh setiap 30 detik
```

### QR Code Validation

```
1. Kiosk scan QR Code ──► Decode JWT token
2. Cek expiry (harus < 30 detik dari generation)
3. Cek apakah karyawan sudah check-in hari ini
4. Jika sudah check-in ──► Check-out
   Jika belum ──► Check-in
5. Cek shift & jam ──► Tepat waktu / Terlambat
6. Simpan ke attendance_logs
7. Return feedback (success/terlambat/expired/error)
```

### Keamanan QR Code
- **JWT Encryption**: Token dienkripsi dengan secret key
- **30-second expiry**: QR Code tidak bisa dipakai setelah 30 detik
- **Duplicate Prevention**: Sistem cek apakah karyawan sudah scan dalam waktu dekat
- **Audit Trail**: Semua scan tercatat di `scan_records`

---

## 📴 Offline-First Architecture

Aplikasi dirancang untuk tetap berfungsi meskipun internet mati.

### Offline Strategy

```
Online Mode ──► Data langsung ke Supabase (real-time)
     │
     ▼ (Internet mati)
Offline Mode ──► Data disimpan ke IndexedDB (local)
     │
     ▼ (Internet kembali)
Background Sync ──► Sinkronisasi IndexedDB → Supabase
```

### IndexedDB Stores

| Store | Data | Sync Priority |
|-------|------|---------------|
| `attendance_logs` | Absensi offline | High |
| `leave_requests` | Pengajuan offline | High |
| `scan_records` | Scan offline | High |
| `employees` | Cache data karyawan | Medium |
| `settings` | Preferensi user | Low |

### Service Worker

- **Caching**: Cache assets & API responses
- **Background Sync**: Sync data saat internet kembali
- **PWA Install**: Prompt install untuk Android/iOS

---

## 🛣️ API Routes

| Route | Method | Purpose | Auth Required |
|-------|--------|---------|---------------|
| `/api/qr-generate` | POST | Generate JWT QR token | ✅ (Employee) |
| `/api/qr-validate` | POST | Validate QR & record attendance | ✅ (Kiosk) |
| `/api/export-excel` | GET | Export monthly report to Excel | ✅ (Admin) |
| `/api/change-password` | POST | Change user password | ✅ (Any) |
| `/api/reset-password` | POST | Reset password (admin) | ✅ (Admin) |
| `/api/upload-attachment` | POST | Upload file lampiran | ✅ (Any) |

### API Response Format

```typescript
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": "Error message"
}
```

---

## ⚡ Supabase Edge Functions

Edge Functions dijalankan di Deno runtime di server Supabase.

| Function | Trigger | Purpose |
|----------|---------|---------|
| `qr-generate` | HTTP POST | Generate JWT token untuk QR Code |
| `qr-validate` | HTTP POST | Validasi JWT token & record attendance |
| `auto-flag` | Cron (daily 00:00) | Auto detect karyawan lupa check-out |

### Deployment

```bash
# Deploy edge functions
supabase functions deploy qr-generate
supabase functions deploy qr-validate
supabase functions deploy auto-flag

# Set secrets
supabase secrets set JWT_SECRET=your-secret-key
supabase secrets set SUPABASE_URL=...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 🔧 Environment Variables

### File `.env.local` (local development)

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://wyewqgyldltujjunmfmp.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_t4CBJVhKd0LpgzJOXubqGg_wuDG-IGb
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Secret (for QR Code encryption)
# Note: Set via Supabase Secrets (supabase secrets set JWT_SECRET=...)
# NOT in .env.local for security
```

### Production (Vercel)

Semua environment variables harus di-set di **Vercel Dashboard**:

1. Go to **Project Settings** → **Environment Variables**
2. Add all variables above
3. Vercel akan redeploy otomatis

### ⚠️ Security Notes

- **Jangan pernah** commit `.env.local` ke GitHub (sudah di `.gitignore`)
- **SUPABASE_SERVICE_ROLE_KEY** adalah secret — jangan expose ke client
- **JWT_SECRET** untuk QR Code harus diset via Supabase Secrets

---

## 🚀 Instalasi & Setup

### Prerequisites

- **Node.js** 18+ (recommended: 20 LTS)
- **npm** 9+ atau **pnpm**
- **Git**
- **Supabase Account** (free tier cukup)
- **Vercel Account** (untuk deployment)

### Step 1: Clone Repository

```bash
git clone https://github.com/username/absen-karyawan-alhamra.git
cd absen-karyawan-alhamra
```

### Step 2: Install Dependencies

```bash
npm install
# atau
pnpm install
```

### Step 3: Setup Environment Variables

```bash
# Copy file .env.local
cp .env.local.example .env.local

# Edit .env.local dengan credentials Anda
nano .env.local
```

### Step 4: Setup Supabase

1. Buat project di [Supabase](https://supabase.com)
2. Copy Project URL dan API keys
3. Jalankan migrations:
   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```
4. Deploy edge functions:
   ```bash
   supabase functions deploy
   ```

### Step 5: Run Development Server

```bash
npm run dev
# atau
pnpm dev
```

Aplikasi akan berjalan di `http://localhost:3000`

### Step 6: Seeding Data (Opsional)

```bash
# Import seed data
supabase seed
```

---

## 💻 Development Workflow

### Daily Development

```bash
# 1. Pull latest changes
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/nama-fitur

# 3. Develop + commit
git add .
git commit -m "feat: deskripsi fitur"

# 4. Push ke GitHub
git push origin feature/nama-fitur

# 5. Buat Pull Request di GitHub (merge ke develop)

# 6. Test di Preview URL (Vercel)

# 7. Merge ke develop
```

### Running Tests

```bash
# E2E Tests (Playwright)
npx playwright test

# E2E dengan UI
npx playwright test --ui

# Run specific test
npx playwright test tests/e2e/login.spec.ts

# Generate report
npx playwright show-report
```

### Build for Production

```bash
# Build locally
npm run build

# Start production server
npm start
```

---

## 🧪 Testing

### Test Coverage

| Suite | Tests | Status |
|-------|-------|--------|
| Login Flow | 6 | ✅ Pass |
| QR Code Generation | 3 | ✅ Pass |
| Kiosk Scan | 3 | ✅ Pass |
| Leave Request | 1 | ✅ Pass |
| Admin Approval | 1 | ✅ Pass |
| Export Excel | 1 | ✅ Pass |
| Anomaly Dashboard | 1 | ✅ Pass |
| PWA Features | 1 | ✅ Pass |
| Notifications | 1 | ✅ Pass |
| **Total** | **18** | **✅ 18/18 Pass** |

### Test Configuration

- **Framework**: Playwright 1.60.0
- **Workers**: 3 (parallel)
- **Timeout**: 30s
- **Browsers**: Chromium (primary)
- **Demo Auth**: Menggunakan localStorage untuk reliability

### Test Utilities

```typescript
// tests/e2e/utils/auth.ts
- Demo login helper
- Role-based login (admin, employee, kiosk)

// tests/e2e/utils/supabase.ts
- Supabase client for test cleanup
- Database cleanup utilities
```

---

## 🚀 Deployment

### Architecture

```
GitHub Repository
├── main branch ──► Vercel Production
├── develop branch ──► Vercel Preview
└── feature/xxx ──► Vercel Preview (temporary)
```

### Vercel Deployment Steps

1. **Login ke Vercel**
   ```bash
   npx vercel login
   ```

2. **Import Project**
   ```bash
   npx vercel
   # Pilih "Import existing project"
   # Pilih repository GitHub
   ```

3. **Configure Environment Variables**
   ```bash
   npx vercel env add NEXT_PUBLIC_SUPABASE_URL
   npx vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
   npx vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```

4. **Deploy Production**
   ```bash
   npx vercel --prod
   ```

### Auto-Deploy

Vercel akan **auto-deploy** setiap kali ada push ke:
- `main` → Production URL
- `develop` → Preview URL
- `feature/xxx` → Temporary Preview URL

---

## 🔄 Git Flow

### Branch Structure

```
main        (production)
  │
  ▼
develop     (staging/development)
  │
  ├── feature/qr-scan
  ├── feature/leave-request
  ├── feature/admin-dashboard
  └── ...
```

### Workflow

#### 1. Feature Development

```bash
# Dari develop, buat feature branch
git checkout develop
git pull origin develop
git checkout -b feature/nama-fitur

# Develop & commit
git add .
git commit -m "feat: deskripsi fitur"

# Push
git push origin feature/nama-fitur

# Buat Pull Request: feature/nama-fitur → develop
# Review → Merge → Auto deploy ke Preview URL
```

#### 2. Release to Production

```bash
# Update develop
git checkout develop
git pull origin develop

# Merge ke main
git checkout main
git merge develop

# Push
git push origin main

# Auto deploy ke Production URL
```

#### 3. Hotfix (Jika ada bug di production)

```bash
# Dari main, buat hotfix branch
git checkout main
git pull origin main
git checkout -b hotfix/nama-bug

# Fix & commit
git add .
git commit -m "fix: deskripsi bug"

# Push
git push origin hotfix/nama-bug

# PR ke main (langsung)
# Merge → Auto deploy ke Production

# Juga merge ke develop
git checkout develop
git merge hotfix/nama-bug
git push origin develop
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. QR Code Tidak Muncul
```
Cause: API route /api/qr-generate error
Fix: 
  - Cek environment variables
  - Cek Supabase Edge Function (qr-generate) sudah deploy
  - Cek browser console untuk error detail
```

#### 2. Kiosk Scan Gagal
```
Cause: Camera permission denied atau QR expired
Fix:
  - Pastikan browser punya permission camera
  - Cek QR Code masih dalam 30 detik (tidak expired)
  - Cek API route /api/qr-validate berjalan
```

#### 3. Data Tidak Sync (Offline)
```
Cause: Background sync gagal
Fix:
  - Cek Service Worker aktif di DevTools → Application → Service Workers
  - Cek IndexedDB di DevTools → Application → IndexedDB
  - Refresh halaman untuk trigger sync
```

#### 4. Login Gagal
```
Cause: Employee tidak ada di tabel employees
Fix:
  - Cek auth_id di tabel employees sesuai dengan auth.users.id
  - Pastikan email sudah diverifikasi (Supabase Auth)
  - Cek role di tabel employees
```

#### 5. Export Excel Error
```
Cause: Memory issue atau data terlalu banyak
Fix:
  - Cek console untuk error
  - Batasi range tanggal
  - Cek library xlsx terinstall
```

### Debug Commands

```bash
# Check Supabase connection
npx supabase status

# Check Edge Functions
npx supabase functions list

# Tail logs
npx supabase functions tail qr-generate

# Check database
npx supabase db dump
```

---

## 📞 Kontak & Support

### Development Team

| Role | Name | Contact |
|------|------|---------|
| **Developer** | Ammar Al Haidar | ammar.alhaidar@ibsalhamra.sch.id |
| **Project Manager** | Alhamra IT Team | it@ibsalhamra.sch.id |

### Useful Links

- **Production App**: https://absen-karyawan-alhamra.vercel.app
- **Supabase Dashboard**: https://supabase.com/dashboard/project/wyewqgyldltujjunmfmp
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repository**: https://github.com/username/absen-karyawan-alhamra

### Documentation

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com

---

## 🙏 Credits

- **Yayasan Alhamra** — Pemilik project
- **Next.js Team** — Framework
- **Supabase** — Backend-as-a-Service
- **shadcn/ui** — UI Components
- **Vercel** — Hosting Platform

---

## 📝 Changelog

### v0.1.0 (Production Release)

**Features:**
- ✅ QR Code Check-in/Check-out dengan JWT encryption
- ✅ Kiosk Scanner dengan kamera
- ✅ Admin Dashboard dengan CRUD
- ✅ Pengajuan Cuti/Sakit/Izin
- ✅ Export Excel (2-sheet)
- ✅ Auto-Flagging (lupa check-out)
- ✅ Offline-First support
- ✅ PWA Installable
- ✅ Real-time Notifications
- ✅ 18 E2E Tests (100% pass)

---

## 🎓 Guide untuk Developer Baru

### Day 1: Setup Environment

1. Clone repo
2. Install dependencies
3. Setup `.env.local`
4. Run `npm run dev`
5. Login dengan demo account (tombol "Demo Login" di halaman login)

### Day 2: Understand Codebase

1. Baca `src/types/index.ts` — pahami data structures
2. Baca `src/lib/data/` — pahami data access layer
3. Baca `src/components/features/` — pahami komponen utama
4. Coba jalankan E2E tests: `npx playwright test`

### Day 3: First Feature

1. Buat branch dari `develop`: `git checkout -b feature/my-first-feature`
2. Edit code
3. Test locally
4. Commit & push
5. Buat Pull Request

### Tips

- **Selalu** baca AGENTS.md untuk instruksi khusus agent
- **Selalu** jalankan tests sebelum commit
- **Selalu** buat branch dari `develop`, bukan dari `main`
- **Selalu** gunakan TypeScript strict mode

---

> **Built with ❤️ for Yayasan Alhamra**  
> **© 2026 Alhamra IT Team**
