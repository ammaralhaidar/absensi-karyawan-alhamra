# 🔧 Plan Perbaikan: Login Redirect Loop & Demo Buttons

> **Status:** Plan Mode | **Target:** Production Fix

---

## 🐛 Bug 1: Login Berhasil tapi Layar Putih + Kembali ke Loading

### Gejala
1. User login dengan email/password (Supabase Auth)
2. Login berhasil (tidak ada error message)
3. Halaman redirect ke `/dashboard` (atau `/admin`/`/kiosk`)
4. **Layar putih** muncul sebentar
5. **Terpental kembali** ke loading screen (spinner) atau halaman login

### Root Cause Analysis

#### **1. Tidak ada `proxy.ts` / `middleware.ts` (Next.js 16)**
Next.js 16 menggunakan `proxy.ts` untuk session validation di edge. Aplikasi kita **tidak punya** file ini, sehingga:
- Server tidak bisa cek session sebelum render page
- Server Component (`page.tsx`) cek `supabase.auth.getUser()` tapi gagal karena cookie tidak ter-set dengan benar
- Redirect loop: Client → Server → Client → Server (infinite)

#### **2. `server.ts` Cookie Handling Bermasalah**
File `src/lib/supabase/server.ts` menggunakan `@supabase/ssr` v0.12.0. Di dalamnya:
```javascript
setAll(cookiesToSet, _headers) {
  try {
    cookiesToSet.forEach(({ name, value, options }) =>
      cookieStore.set(name, value, options)  // ← INI MUNGkin GAGAL di Next.js 16
    )
  } catch {
    // Called from Server Component, ignore  // ← ERROR DI-SILENT!
  }
}
```
- `cookieStore.set()` di Next.js 16 bisa jadi **read-only** untuk Server Components
- Error di-catch dan di-ignore, sehingga **auth cookies TIDAK tersimpan**
- Setelah `signIn` redirect, server tidak melihat session = redirect balik ke login

#### **3. Race Condition di `SupabaseProvider`**
```javascript
// 2 callback berjalan bersamaan:
// Callback A: getSession()
supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
    setIsLoading(false);  // ← isLoading false TAPI profile masih null!
});

// Callback B: onAuthStateChange
supabase.auth.onAuthStateChange(async (_event, session) => {
    setUser(session?.user ?? null);
    if (session?.user) {
        const { data } = await supabase.from('employees')... // fetch profile
        setProfile({...});  // ← profile di-set setelah delay
    }
    setIsLoading(false);  // ← isLoading false
});
```
- **Race**: `getSession()` selesai lebih dulu → `isLoading` = false, `profile` = null
- **AuthGuard** melihat: `user` ada, `profile` null → `activeSession` = `{ role: "employee", userId: user.id }`
- Tapi kalau `allowedRoles` tidak cocok, AuthGuard redirect ke `/dashboard`
- Tapi `profile` masih null, sehingga `page.tsx` (Server Component) juga gagal
- **Hasil**: Redirect loop atau layar putih

#### **4. `signIn` Server Action + `redirect()` Bermasalah**
File `src/lib/auth/actions.ts`:
```javascript
export async function signIn(email: string, password: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({...})
  // ...
  redirect('/dashboard')  // ← Next.js 16 redirect mungkin tidak set cookie dengan benar
}
```
- `redirect()` dari `next/navigation` di Server Action mungkin tidak memastikan cookies tersimpan
- Seharusnya gunakan `NextResponse` untuk redirect sambil set cookie

---

## 🎨 Bug 2: Demo Login Buttons Masih Tampil di Production

### Gejala
- Tombol "Demo Mode" dan 3 button (Karyawan, Security, Admin) masih tampil di production
- Harusnya dihapus atau hanya tampil di development

### Root Cause
File `src/app/(auth)/login/page.tsx` line 147-165:
```jsx
<p className="text-center text-sm text-slate-500">
  Demo Mode — Login langsung sebagai:
</p>
<div className="grid grid-cols-3 gap-2">
  <Button ... onClick={() => handleDemoLogin("employee")}>Karyawan</Button>
  <Button ... onClick={() => handleDemoLogin("kiosk_security")}>Security</Button>
  <Button ... onClick={() => handleDemoLogin("admin")}>Admin</Button>
</div>
```
- Tidak ada conditional rendering berdasarkan environment (`process.env.NODE_ENV`)
- Seharusnya: `process.env.NODE_ENV === 'development'` baru tampil

---

## ✅ Plan Perbaikan

### Langkah 1: Buat `proxy.ts` (Next.js 16 Middleware)

**File baru:** `src/proxy.ts`

**Tujuan:** Validate session di edge sebelum render. Kalau user sudah login, redirect ke route yang sesuai. Kalau belum login, redirect ke `/login`.

**Logic:**
- Cek cookie `sb-access-token` (Supabase Auth cookie)
- Kalau ada token → user authenticated → lanjut
- Kalau tidak ada → redirect ke `/login`
- Kalau route = `/login` tapi user sudah login → redirect ke `/dashboard` (atau sesuai role)

### Langkah 2: Fix `server.ts` (Supabase Server Client)

**File:** `src/lib/supabase/server.ts`

**Tujuan:** Pastikan cookie bisa di-set dengan benar di Next.js 16.

**Perubahan:**
- Gunakan `headers()` dari `next/headers` untuk set response headers
- Atau gunakan `NextResponse` untuk redirect dengan cookie
- Atau: buat `createClient()` untuk Server Actions yang bisa set cookie

### Langkah 3: Fix `SupabaseProvider` (Race Condition)

**File:** `src/lib/supabase/provider.tsx`

**Tujuan:** Fix race condition antara `getSession()` dan `onAuthStateChange`.

**Perubahan:**
- Hapus `setIsLoading(false)` dari `getSession()` callback
- Hanya `onAuthStateChange` yang set `isLoading = false` setelah profile selesai di-fetch
- Atau: gunakan `Promise.all` untuk fetch session dan profile bersamaan

### Langkah 4: Fix `AuthGuard` (Loading State)

**File:** `src/components/AuthGuard.tsx`

**Tujuan:** Hindari redirect loop saat auth state sedang inisialisasi.

**Perubahan:**
- Tambahkan delay atau debounce untuk redirect
- Pastikan redirect hanya terjadi setelah `isLoading` benar-benar false dan `activeSession` stabil
- Tambahkan `console.log` untuk debug (bisa dihapus nanti)

### Langkah 5: Fix `login/page.tsx` (Hapus Demo Buttons)

**File:** `src/app/(auth)/login/page.tsx`

**Perubahan:**
- Wrap demo buttons dengan conditional: `process.env.NODE_ENV === 'development'`
- Atau hapus sama sekali (karena sudah tidak dipakai)

### Langkah 6: Fix `signIn` Server Action (Proper Cookie Setting)

**File:** `src/lib/auth/actions.ts`

**Perubahan:**
- Gunakan `NextResponse` untuk redirect dengan set cookie
- Atau: gunakan `revalidatePath` + `redirect` yang lebih aman
- Pastikan cookie tersimpan sebelum redirect

### Langkah 7: Fix `page.tsx` (Root Page)

**File:** `src/app/page.tsx`

**Perubahan:**
- Tambahkan fallback: kalau server-side auth gagal, jangan redirect ke `/login` secara agresif
- Biarkan client-side (`SupabaseProvider`) yang handle redirect
- Atau: gunakan `proxy.ts` untuk handle root redirect

---

## 🧪 Test Plan

### Test Case 1: Login dengan Supabase Auth
1. Buka halaman login
2. Masukkan email + password valid
3. Klik "Masuk"
4. **Expected:** Redirect ke `/dashboard` (atau `/admin`/`/kiosk`) dengan benar
5. **Expected:** Tidak ada layar putih atau redirect loop

### Test Case 2: Refresh Page Setelah Login
1. Login berhasil
2. Refresh browser (F5)
3. **Expected:** Tetap di halaman dashboard (tidak terpental ke login)

### Test Case 3: Direct Access ke Protected Route
1. Buka `/dashboard` langsung (tanpa login)
2. **Expected:** Redirect ke `/login`
3. Login
4. **Expected:** Redirect balik ke `/dashboard`

### Test Case 4: Demo Buttons
1. Buka halaman login
2. **Expected:** Tidak ada tombol "Demo Mode" (production)

### Test Case 5: Logout
1. Login berhasil
2. Klik logout
3. **Expected:** Redirect ke `/login` dan session benar-benar dihapus

---

## 📋 Checklist Eksekusi

- [ ] 1. Buat `src/proxy.ts`
- [ ] 2. Fix `src/lib/supabase/server.ts`
- [ ] 3. Fix `src/lib/supabase/provider.tsx`
- [ ] 4. Fix `src/components/AuthGuard.tsx`
- [ ] 5. Fix `src/app/(auth)/login/page.tsx`
- [ ] 6. Fix `src/lib/auth/actions.ts`
- [ ] 7. Fix `src/app/page.tsx`
- [ ] 8. Test locally (`npm run dev`)
- [ ] 9. Build (`npm run build`)
- [ ] 10. Commit & push
- [ ] 11. Deploy ke production
- [ ] 12. Test di production

---

## 🎯 Estimasi Waktu

- **Development & Testing:** 1-2 jam
- **Deploy & Verify:** 30 menit
- **Total:** ~2 jam

---

**Apakah Anda setuju dengan plan ini? Siap saya eksekusi?** 🚀
