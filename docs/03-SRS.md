# 03 — SRS (Software Requirement Specification)

## Pintas

Kebutuhan fungsional (FR) dan non-fungsional (NFR), masing-masing ber-ID dan dapat diuji.
Setiap FR memetakan ke fitur di `02-PRD.md`.

Versi 1.0 — 2026-11-05

---

## 1. Kebutuhan fungsional

### 1.1 Konten dan rendering

| ID | Kebutuhan | Kriteria uji | PRD |
|---|---|---|---|
| FR-01 | Sistem membaca modul dari file Markdown di `content/<track>/<nomor>-<slug>.md` dan merendernya ke HTML saat build. | Menambah file `.md` baru lalu build ulang → halaman modul tersedia tanpa perubahan kode. | F-04 |
| FR-02 | Frontmatter modul wajib memuat: `track`, `nomor`, `judul`, `slug`, `estimasi_menit`, `prasyarat[]`, `latihan[]`. Frontmatter tidak valid → build gagal dengan pesan yang menyebut file dan field. | Menghapus `judul` dari satu file → `npm run build` gagal, pesan menyebut nama file dan field `judul`. | F-04 |
| FR-03 | Sistem memisahkan lapis 1 dan lapis 2 berdasarkan penanda di file: isi sebelum heading `## Lapis 2` = lapis 1; sesudahnya dirender di dalam `<details>`. | Modul tanpa heading `## Lapis 2` gagal validasi. | F-04 |
| FR-04 | Setiap heading level 2 dan 3 mendapat `id` yang stabil (dari slug heading) untuk deep link. | Membuka `#error-umum` menggulir ke heading yang benar. | F-04 |
| FR-05 | Blok kode dirender dengan label bahasa, tombol salin, dan blok "Output yang diharapkan" bila diberi penanda `output`. | Klik salin menyalin isi blok persis tanpa nomor baris. | F-04 |
| FR-06 | Daftar isi otomatis dibuat dari heading lapis 1 + pintasan lapis 2, latihan, kuis. | Modul 10 heading → daftar isi memuat semua heading lapis 1. | F-04 |

### 1.2 Pencarian

| ID | Kebutuhan | Kriteria uji | PRD |
|---|---|---|---|
| FR-07 | Pencarian mencari di judul modul, judul heading, isi teks, dan isi blok kode. | Kueri yang hanya muncul di dalam blok kode tetap menghasilkan modul tersebut. | F-02 |
| FR-08 | Indeks pencarian dibangun saat build dan dimuat sebagai satu berkas statis; tidak ada permintaan jaringan per ketikan. | DevTools: mengetik 10 karakter → 0 permintaan jaringan. | F-02 |
| FR-09 | Pencarian dijalankan di klien dengan debounce 200 ms, maksimal 8 hasil, dikelompokkan per track, kata kunci di-highlight. | Mengetik cepat 5 karakter → hasil muncul sekali setelah berhenti. | F-02 |
| FR-10 | Pencarian toleran salah ketik ringan: jarak edit 1 untuk kata lebih dari 4 huruf. | "midleware" menemukan "middleware". | F-02 |
| FR-11 | Panel pencarian bisa dibuka dengan `Ctrl+K`/`Cmd+K`, ditutup `Esc`, dinavigasi `↑`/`↓`, dibuka `Enter`. | Semua tombol bekerja tanpa mouse. | F-02 |
| FR-12 | Tidak ada hasil → pesan eksplisit + 3 saran modul. Riwayat 5 kueri terakhir tersimpan di localStorage dan bisa dihapus. | Kueri acak → pesan tampil, bukan panel kosong. | F-02 |
| FR-13 | `Enter` tanpa memilih hasil membuka `/cari?q=` berisi hasil lengkap dengan paginasi 20 per halaman. | 50 hasil → 3 halaman. | F-02 |

### 1.3 Kuis

| ID | Kebutuhan | Kriteria uji | PRD |
|---|---|---|---|
| FR-14 | Soal kuis diambil dari DB per `modul_slug`; payload ke browser hanya berisi `id`, `tipe`, `soal`, `opsi` — tanpa `jawaban` dan tanpa `penjelasan`. | `grep` pada HTML/JS bundle tidak menemukan kunci jawaban. | F-07 |
| FR-15 | Penilaian dilakukan di server. Respons berisi `benar` (boolean), `jawaban_benar`, dan `penjelasan`. | POST jawaban salah → `benar:false` + `jawaban_benar` + `penjelasan`. | F-07 |
| FR-16 | Tipe soal: `pilihan_ganda` (satu benar) dan `isian_singkat`. Isian dinormalisasi: trim, lowercase, spasi beruntun dirapatkan, tanda baca di ujung dibuang. | `"  SELECT  "` dan `"select"` sama-sama benar. | F-07 |
| FR-17 | Kuis dapat diulang tanpa batas; hanya skor terakhir yang disimpan (localStorage). | Mengulang 3x → hanya skor terakhir yang tampil. | F-07 |
| FR-18 | Setelah semua soal dijawab, tampil skor dan tautan ke bagian modul untuk setiap soal yang salah. | 2 salah → 2 tautan anchor tampil. | F-07 |

### 1.4 Latihan

| ID | Kebutuhan | Kriteria uji | PRD |
|---|---|---|---|
| FR-19 | Latihan bertipe `web` dijalankan lewat route handler server yang meneruskan ke Wandbox API. Kunci API (bila ada) tidak pernah sampai ke browser. | DevTools Network: tidak ada permintaan langsung ke `wandbox.org` dari browser. | F-05 |
| FR-20 | Server menolak permintaan latihan dengan kode > 64 KB, lebih dari 1 permintaan per detik per IP, atau bahasa di luar allowlist. | 100 permintaan cepat → 429 setelah yang pertama. | F-05 |
| FR-21 | Hasil uji: bandingkan stdout dengan `output_harapan` setelah normalisasi (`\r\n`→`\n`, trim tiap baris, buang baris kosong di akhir) dan jalankan maksimal satu `assert` tambahan. | Output benar dengan spasi di ujung baris tetap lulus. | F-05 |
| FR-22 | Status latihan (`lulus`/`gagal`/`error`) dan kode terakhir pengguna disimpan di localStorage per `latihan_id`. | Muat ulang halaman → kode terakhir dan status tetap ada. | F-05 |
| FR-23 | Solusi latihan hanya diambil dari server saat tombol "Lihat solusi" ditekan, dan setiap pengambilan dicatat di log server. | Solusi tidak ada di payload awal. | F-05 |
| FR-24 | Latihan bertipe `laptop` dirender sebagai panduan 6 bagian baku (kebutuhan, langkah, hasil, cek berhasil, kalau gagal, buktikan paham). Validasi konten gagal bila salah satu bagian kosong. | Modul dengan latihan laptop tanpa bagian "kalau gagal" gagal validasi. | F-06 |

### 1.5 Progres

| ID | Kebutuhan | Kriteria uji | PRD |
|---|---|---|---|
| FR-25 | Semua state pengguna disimpan di localStorage dengan prefiks `pintas:v1:`. | Tidak ada cookie yang diset selain preferensi tema. | F-10 |
| FR-26 | Progres dapat diekspor ke JSON (satu berkas, berisi versi skema) dan diimpor kembali dengan validasi skema; impor yang tidak valid ditolak dengan pesan. | Impor berkas acak → ditolak, data lama utuh. | F-10 |
| FR-27 | Reset progres hanya jalan setelah pengguna mengetik `HAPUS`. | Tombol reset tanpa konfirmasi tidak berpengaruh. | F-10 |
| FR-28 | Modul dianggap selesai bila semua soal kuis dijawab dan minimal satu latihan berstatus `lulus`; pengguna dapat menandai manual. | Menandai manual langsung mengubah status. | F-04 |

### 1.6 Navigasi dan halaman

| ID | Kebutuhan | Kriteria uji | PRD |
|---|---|---|---|
| FR-29 | Beranda menampilkan track per tier; track tanpa konten berlabel `Segera` dan tanpa `href`. | Tidak ada tautan 404 dari beranda. | F-01 |
| FR-30 | Halaman track menampilkan semua modul dengan nomor, estimasi menit, badge latihan, dan status. | Jumlah baris = jumlah file modul track tersebut. | F-03 |
| FR-31 | Halaman `/stack` menampilkan semua bahasa & framework dengan kolom: nama, jenis, kegunaan, track terkait, cara konek DB, cara buat REST API, cara menyambung dari bahasa lain. | Setiap entri punya 7 kolom terisi atau ditandai `TODO: konfirmasi`. | F-12 |
| FR-32 | Halaman `/panduan` memuat 11 bagian wajib sesuai PRD F-11. | Checklist review: 11 bagian ada. | F-11 |
| FR-33 | `/404` menampilkan tautan ke beranda, pencarian, dan 3 modul populer. | URL acak → 404 dengan tautan berfungsi. | — |
| FR-34 | Rute `/keystatic` hanya ada saat `NODE_ENV=development`. | Build produksi → `/keystatic` = 404. | F-14 |

### 1.7 Tampilan dan aksesibilitas

| ID | Kebutuhan | Kriteria uji | PRD |
|---|---|---|---|
| FR-35 | Tema gelap/terang mengikuti `prefers-color-scheme`, dapat diubah manual, tanpa kedip saat muat. | Reload 10x → tidak ada kilatan putih pada mode gelap. | F-13 |
| FR-36 | Seluruh interaksi dapat dilakukan dengan keyboard; fokus selalu terlihat. | Tab dari awal halaman → semua kontrol terjangkau, fokus terlihat. | — |
| FR-37 | Tombol berikon punya `aria-label`; blok `<details>` memakai elemen asli (bukan div). | Audit axe: 0 pelanggaran serius. | — |
| FR-38 | Setiap halaman punya `<title>` dan meta description unik. | Cek 9 halaman → 9 judul berbeda. | — |

## 2. Kebutuhan non-fungsional

### 2.1 Kinerja

| ID | Kebutuhan | Kriteria uji |
|---|---|---|
| NFR-01 | Halaman modul (lokal, produksi build) First Contentful Paint < 500 ms. | Lighthouse lokal ≥ 95 performance. |
| NFR-02 | Ukuran JS yang dimuat di halaman modul < 150 KB (gzip), di luar halaman latihan. | Laporan bundle. |
| NFR-03 | Pencarian mengembalikan hasil < 50 ms untuk indeks 500 modul. | Benchmark skrip di CI. |
| NFR-04 | Panggilan ke Wandbox punya timeout 15 detik; lewat itu → status `error` dengan pesan jelas. | Simulasi lambat → pesan timeout, bukan menggantung. |

### 2.2 Keamanan

| ID | Kebutuhan | Kriteria uji |
|---|---|---|
| NFR-05 | Tidak ada rahasia di bundle klien. Variabel sensitif hanya dibaca di server. | `grep` bundle untuk nama variabel rahasia → kosong. |
| NFR-06 | Kunci jawaban kuis dan solusi latihan tidak dapat diambil massal; endpoint jawab memakai rate limit 20 permintaan/menit/IP. | Skrip 100 permintaan → 429. |
| NFR-07 | Semua input pengguna divalidasi di server: `modul_slug` harus cocok pola `^[a-z0-9-]+$`, jawaban maksimal 500 karakter, kode maksimal 64 KB. | Input berisi `<script>` tidak dirender sebagai HTML. |
| NFR-08 | Konten Markdown di-*sanitize*: HTML mentah di file konten tidak dieksekusi; hanya tag aman yang diizinkan. | Menulis `<script>alert(1)</script>` di file konten → tidak muncul di halaman. |
| NFR-09 | Header keamanan diset: `Content-Security-Policy` (tanpa `unsafe-eval`, kecuali halaman latihan), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`. | Cek header respons 9 halaman. |
| NFR-10 | Tidak ada cookie sesi, tidak ada data pribadi, tidak ada pelacak pihak ketiga. | Daftar cookie kosong selain preferensi tema. |
| NFR-11 | Dependensi: `npm audit` tanpa kerentanan high/critical saat rilis. | CI gagal bila ada. |

### 2.3 Keandalan dan pemeliharaan

| ID | Kebutuhan | Kriteria uji |
|---|---|---|
| NFR-12 | Build gagal bila ada tautan internal mati, slug duplikat, atau frontmatter tidak valid. | Uji dengan file rusak → build merah. |
| NFR-13 | Build gagal bila ada modul tanpa lapis 2, tanpa kuis, atau tanpa latihan. | Uji tiga kasus. |
| NFR-14 | Migrasi DB reversibel dan dijalankan otomatis saat start di lokal. | `prisma migrate reset` lalu `npm run dev` → DB siap, halaman jalan. |
| NFR-15 | Semua halaman punya penanganan error: kegagalan server menampilkan halaman error dengan tautan beranda, bukan stack trace. | Matikan DB → halaman menampilkan pesan ramah. |

### 2.4 Kompatibilitas

| ID | Kebutuhan |
|---|---|
| NFR-16 | Berjalan di Chrome/Edge/Firefox/Safari versi 2 tahun terakhir. |
| NFR-17 | Tata letak responsif: 360 px (ponsel), 768 px (tablet), 1280 px+ (desktop). |
| NFR-18 | Materi terbaca dan kuis tampil tanpa JavaScript; hanya penilaian kuis dan editor latihan yang butuh JS. |

### 2.5 Operasional

| ID | Kebutuhan |
|---|---|
| NFR-19 | MVP berjalan lokal dengan dua perintah: `npm install` lalu `npm run dev`. Tidak ada layanan berbayar. |
| NFR-20 | Waktu build < 2 menit untuk 20 modul. |
| NFR-21 | Log server mencatat: permintaan latihan (bahasa, ukuran, durasi), permintaan solusi, dan error 5xx. Tidak mencatat kode pengguna. |

## 3. Matriks keterlacakan

| PRD | FR |
|---|---|
| F-01 | FR-29 |
| F-02 | FR-07 … FR-13 |
| F-03 | FR-30 |
| F-04 | FR-01 … FR-06, FR-28 |
| F-05 | FR-19 … FR-23 |
| F-06 | FR-24 |
| F-07 | FR-14 … FR-18 |
| F-08 | — (tanpa penilaian otomatis; konten saja) |
| F-09 | — (halaman statis + filter lokal) |
| F-10 | FR-25 … FR-27 |
| F-11 | FR-32 |
| F-12 | FR-31 |
| F-13 | FR-35 |
| F-14 | FR-34 |

## 4. Di luar lingkup (eksplisit)

Login/akun · penilaian repo GitHub otomatis · komentar · notifikasi email · sertifikat · panel admin daring · hosting produksi · i18n selain Indonesia.
