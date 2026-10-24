# Zaqsture — Platform Layanan NOKOS Terbaik

Starter project Next.js untuk deploy ke Vercel, dengan tema gelap seperti referensi, katalog layanan, order API, invoice QRIS AverPay, saldo SMSPool, dan dashboard admin.

## Penting sebelum dipakai
- Saya tidak bisa deploy ke akun Vercel Anda dari sini; project ini disiapkan agar bisa Anda deploy.
- Kunci API yang Anda kirim di chat sudah terekspos. **Segera cabut/rotasi kedua API key tersebut** dari dashboard provider dan gunakan kunci baru di Environment Variables. Jangan menaruh API key di frontend, GitHub, atau chat.
- Jangan menganggap transaksi berhasil sebelum respons provider diverifikasi. Endpoint pembelian SMSPool menggunakan `POST /purchase/sms` dan memeriksa `success` pada respons. Tetap uji service ID/nama, kode negara, harga, dan respons akun Anda sebelum menerima order sungguhan. Endpoint API provider bisa berubah.
- Dashboard saat ini memakai satu akun admin dari environment, bukan sistem akun pelanggan lengkap. Tabel `users` disediakan agar statistik pengguna bisa dipakai ketika pendaftaran pelanggan dibuat.
- QRIS membuat invoice AverPay, tetapi saldo pengguna belum otomatis bertambah. Verifikasi status pembayaran di server dan buat mekanisme ledger/webhook sebelum mengkredit saldo.
- API withdraw hanya membaca metode penarikan di admin; penarikan uang sungguhan tidak otomatis diaktifkan.

## Aplikasi yang diperlukan
1. **GitHub** — menyimpan kode.
2. **Supabase** — database permanen untuk order dan pengguna.
3. **Vercel** — hosting/deploy.
4. Browser untuk membuka dashboard provider SMSPool dan AverPay.

## Langkah 1 — Buat database Supabase
1. Buat project di https://supabase.com/.
2. Buka **SQL Editor**.
3. Salin seluruh isi `supabase/schema.sql`, lalu jalankan.
4. Di Project Settings → API, salin Project URL dan `service_role` key. Simpan rahasia ini hanya di environment server.

## Langkah 2 — Siapkan project dan API key
1. Ekstrak `zaqsture-nokos.zip`.
2. Salin `.env.example` menjadi `.env.local` untuk tes lokal.
3. Isi `ADMIN_USERNAME=zaqsture`.
4. Isi `ADMIN_PASSWORD` dengan password admin yang kuat. Demi keamanan, jangan gunakan password yang dibagikan di percakapan untuk deployment publik.
5. Buat `SESSION_SECRET` acak minimal 32 karakter.
6. Isi `SMSPOOL_API_KEY`, `AVERPay_API_KEY`, `SUPABASE_URL`, dan `SUPABASE_SECRET_KEY` dengan kunci baru/rahasia Anda. URL dan publishable key project Supabase yang Anda kirim sudah dicantumkan pada `.env.example`. Publishable key hanya untuk penggunaan publik dan tidak cukup untuk akses admin/database dari server; ambil `sb_secret_...` dari Supabase Settings → API Keys.
7. Jangan pernah awali nama variabel rahasia dengan `NEXT_PUBLIC_`.

## Langkah 3 — Jalankan di komputer
Install Node.js LTS dari https://nodejs.org/ lalu di folder project jalankan:

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`. Untuk cek build sebelum deploy:

```bash
npm run build
```

## Langkah 4 — Upload ke GitHub
1. Buat repository baru di https://github.com/.
2. Upload isi folder project (jangan upload `.env.local`).
3. Pastikan `.env.local` tidak ikut commit; sudah tercakup di `.gitignore`.

## Langkah 5 — Deploy di Vercel
1. Buka https://vercel.com/ dan login dengan GitHub.
2. Pilih **Add New → Project**, lalu impor repository.
3. Di Project → Settings → Environment Variables, tambahkan semua variabel dari `.env.example` (tanpa tanda kutip).
4. Pastikan environment Production dipilih, lalu Deploy. Untuk Supabase, masukkan `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL`, dan `SUPABASE_SECRET_KEY` sesuai `.env.example`.
5. Setelah mengganti env, lakukan Redeploy.
6. Buka URL Vercel yang diberikan.

## Login admin
Akses dashboard melalui `/panel-zaqsture-7x29`. Di halaman utama, menu admin disamarkan; ketuk logo Z sebanyak 5 kali untuk membuka form login admin. Username dibaca dari `ADMIN_USERNAME`. Jika username/password salah, API mengembalikan tulisan **“Akun belum dibuat”**. Password tidak disimpan di kode sumber.

## Fitur
- Landing page responsif bertema gelap.
- Katalog layanan dan pencarian.
- Login admin berbasis cookie HttpOnly + JWT (masa sesi 8 jam).
- Dashboard admin tersembunyi di `/panel-zaqsture-7x29` untuk ringkasan order, order terbaru, dan pengguna terbaru. Semua endpoint admin tetap wajib memverifikasi sesi di server.
- Endpoint server untuk saldo SMSPool, invoice QRIS, status invoice, dan metode withdraw.
- Data order permanen via Supabase.

## API routes
- `GET /api/services`
- `GET /api/balance`
- `POST /api/orders`
- `GET /api/orders` (admin)
- `POST /api/payments/invoice`
- `GET /api/payments/status?invoice_id=...`
- `GET /api/admin/stats` (admin)
- `GET /api/admin/orders` (admin)
- `GET /api/admin/users` (admin)
- `GET /api/admin/withdraw` (admin)

## Batasan yang perlu diselesaikan sebelum live
1. Cocokkan endpoint/parameter SMSPool pembelian, pengecekan OTP, cancel dan refund dengan dokumentasi resmi: https://api.smspool.net/docs.
2. Tambahkan validasi server untuk ID layanan/negara dari data provider (saat ini katalog cadangan untuk desain UI).
3. Implementasikan webhook/verifikasi invoice di server dan ledger saldo; jangan mengkredit saldo hanya berdasarkan data dari browser.
4. Tambahkan rate limiting untuk login/order dan perlindungan penyalahgunaan.
5. Tambahkan autentikasi pelanggan dan kebijakan privasi/ketentuan layanan bila perlu.


## Integrasi tabel Supabase yang sudah ada
Anda menyebut tabel `app_setting`, `orders`, `profiles`, `refund`, `toups`, `wallet_transaction`, dan `wallets`. Project ini saat ini membaca/menulis `orders` dan membaca `users` dengan kolom contoh. Nama tabel saja belum cukup untuk memastikan kompatibilitas: kolom, tipe data, foreign key, dan RLS policy harus cocok. Jangan jalankan schema contoh secara membabi buta pada tabel yang sudah ada. Sebelum menyambungkan tabel wallet/refund atau mengkredit saldo, cocokkan schema tabel yang ada dan buat validasi server-side.


### Menu admin disamarkan
Tidak ada tombol Admin di navbar maupun Profil. Form login dapat dibuka dengan mengetuk logo Z di header sebanyak 5 kali, atau membuka URL dashboard khusus `/panel-zaqsture-7x29`. URL tersembunyi bukan pengganti autentikasi; gunakan password kuat dan rahasia server di environment Vercel.
