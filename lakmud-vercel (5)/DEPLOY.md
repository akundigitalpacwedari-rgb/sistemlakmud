# SISTEM LAKMUD - Panduan deploy ke Vercel

Isi folder ini:
- index.html      halaman aplikasi
- api/state.js    penyimpanan bersama (fungsi serverless)
- package.json

## Langkah

1. Buat proyek baru di vercel.com lalu unggah folder ini
   (Add New > Project > unggah folder, atau hubungkan repositori GitHub).

2. Tambahkan database bersama: buka proyek > Storage > tambahkan Upstash Redis (KV) dan hubungkan ke proyek.
   Ini otomatis menambahkan variabel KV_REST_API_URL dan KV_REST_API_TOKEN.

3. Buka Settings > Environment Variables dan tambahkan:
   LAKMUD_KODE = kode akses yang akan dibagikan ke panitia (pilih kode yang sulit ditebak).

4. Deploy ulang (Deployments > Redeploy). Buka alamat proyek, lalu masukkan kode akses.

## Catatan
- Data disimpan di server. Setiap perangkat yang memasukkan kode yang sama melihat data yang sama.
- Kode akses adalah gerbang sederhana, bukan login per orang. Peran tetap memakai sandi BPHL26.
- Dua orang yang mengubah data bersamaan: perubahan terakhir yang menang.
- Batas data bersama sekitar 900 KB. Unduh CSV secara berkala sebagai cadangan.
