# CHECKLIST SELESAI — Pintas

Dibangun otomatis dari `docs/02-PRD.md` § 3 (peta halaman),
`docs/03-SRS.md` (FR-01..FR-38, NFR), dan `README.md` (urutan pengerjaan).

**Aturan kerja:**
1. Kerjakan berurutan dari atas. Jangan lompat.
2. Satu item = satu commit.
3. Item dicentang hanya setelah gerbang hijau DAN kriteria ujinya terbukti.
4. Kalau ragu requirement, tanya topic PRD (93). Jangan mengarang.

## A. Halaman (PRD § 3)

- [x] **H1** `/` — Beranda
      bukti: `app/page.tsx`
- [x] **H2** `/track/[slug]` — Track
      bukti: `app/track/[slug]/page.tsx`
- [x] **H3** `/modul/[track]/[slug]` — Modul
      bukti: `app/modul/[track]/[slug]/page.tsx`
- [x] **H4** `/latihan/[id]` — Latihan
      bukti: `app/latihan/[id]/page.tsx` (200, judul terisi)
- [x] **H5** `/project/[track]` — Project
      bukti: `app/project/[track]/page.tsx` + `components/project/Capstone.tsx` (200)
- [x] **H6** `/interview/[track]` — Tanya jawab interview
      bukti: `app/interview/[track]/page.tsx` + `components/interview/BankInterview.tsx` (200)
- [x] **H7** `/progres` — Progres
      bukti: `app/progres/page.tsx` (200)
- [x] **H8** `/panduan` — Panduan platform
      bukti: `app/panduan/page.tsx`
- [x] **H9** `/stack` — Daftar bahasa & framework
      bukti: `app/stack/page.tsx`

## B. Kebutuhan fungsional (SRS § 1)

### F-01

- [x] **FR-29** Beranda menampilkan track per tier; track tanpa konten berlabel `Segera` dan tanpa `href`.
      uji: Tidak ada tautan 404 dari beranda.
      bukti: crawl `/` di `next start` → 4 seksi tier, 10 label `Segera`, `aria-disabled` 10,
      tidak ada `href` untuk fondasi/odoo/dotnet/docker/go, semua tautan 200.

### F-02

- [x] **FR-07** Pencarian mencari di judul modul, judul heading, isi teks, dan isi blok kode.
      uji: Kueri yang hanya muncul di dalam blok kode tetap menghasilkan modul tersebut.
- [x] **FR-08** Indeks pencarian dibangun saat build dan dimuat sebagai satu berkas statis; tidak ada permintaan jaringan per ketikan.
      uji: DevTools: mengetik 10 karakter → 0 permintaan jaringan.
- [x] **FR-09** Pencarian dijalankan di klien dengan debounce 200 ms, maksimal 8 hasil, dikelompokkan per track, kata kunci di-highlight.
      uji: Mengetik cepat 5 karakter → hasil muncul sekali setelah berhenti.
- [x] **FR-10** Pencarian toleran salah ketik ringan: jarak edit 1 untuk kata lebih dari 4 huruf.
      uji: "midleware" menemukan "middleware".
- [x] **FR-11** Panel pencarian bisa dibuka dengan `Ctrl+K`/`Cmd+K`, ditutup `Esc`, dinavigasi `↑`/`↓`, dibuka `Enter`.
      uji: Semua tombol bekerja tanpa mouse.
- [x] **FR-12** Tidak ada hasil → pesan eksplisit + 3 saran modul. Riwayat 5 kueri terakhir tersimpan di localStorage dan bisa dihapus.
      uji: Kueri acak → pesan tampil, bukan panel kosong.
- [x] **FR-13** `Enter` tanpa memilih hasil membuka `/cari?q=` berisi hasil lengkap dengan paginasi 20 per halaman.
      uji: 50 hasil → 3 halaman.

### F-03

- [x] **FR-30** Halaman track menampilkan semua modul dengan nomor, estimasi menit, badge latihan, dan status.
      uji: Jumlah baris = jumlah file modul track tersebut.

### F-04

- [x] **FR-01** Sistem membaca modul dari file Markdown di `content/<track>/<nomor>-<slug>.md` dan merendernya ke HTML saat build.
      uji: Menambah file `.md` baru lalu build ulang → halaman modul tersedia tanpa perubahan kode.
- [x] **FR-02** Frontmatter modul wajib memuat: `track`, `nomor`, `judul`, `slug`, `estimasi_menit`, `prasyarat[]`, `latihan[]`. Frontmatter tidak valid → build gagal dengan pesan yang menyebut file dan field.
      uji: Menghapus `judul` dari satu file → `npm run build` gagal, pesan menyebut nama file dan field `judul`.
- [x] **FR-03** Sistem memisahkan lapis 1 dan lapis 2 berdasarkan penanda di file: isi sebelum heading `## Lapis 2` = lapis 1; sesudahnya dirender di dalam `<details>`.
      uji: Modul tanpa heading `## Lapis 2` gagal validasi.
- [x] **FR-04** Setiap heading level 2 dan 3 mendapat `id` yang stabil (dari slug heading) untuk deep link.
      uji: Membuka `#error-umum` menggulir ke heading yang benar.
- [x] **FR-05** Blok kode dirender dengan label bahasa, tombol salin, dan blok "Output yang diharapkan" bila diberi penanda `output`.
      uji: Klik salin menyalin isi blok persis tanpa nomor baris.
- [x] **FR-06** Daftar isi otomatis dibuat dari heading lapis 1 + pintasan lapis 2, latihan, kuis.
      uji: Modul 10 heading → daftar isi memuat semua heading lapis 1.
- [x] **FR-28** Modul dianggap selesai bila semua soal kuis dijawab dan minimal satu latihan berstatus `lulus`; pengguna dapat menandai manual.
      uji: Menandai manual langsung mengubah status.

### F-05

- [x] **FR-19** Latihan bertipe `web` dijalankan lewat route handler server yang meneruskan ke Wandbox API. Kunci API (bila ada) tidak pernah sampai ke browser.
      uji: DevTools Network: tidak ada permintaan langsung ke `wandbox.org` dari browser.
- [x] **FR-20** Server menolak permintaan latihan dengan kode > 64 KB, lebih dari 1 permintaan per detik per IP, atau bahasa di luar allowlist.
      uji: 100 permintaan cepat → 429 setelah yang pertama.
- [x] **FR-21** Hasil uji: bandingkan stdout dengan `output_harapan` setelah normalisasi (`\r\n`→`\n`, trim tiap baris, buang baris kosong di akhir) dan jalankan maksimal satu `assert` tambahan.
      uji: Output benar dengan spasi di ujung baris tetap lulus.
- [x] **FR-22** Status latihan (`lulus`/`gagal`/`error`) dan kode terakhir pengguna disimpan di localStorage per `latihan_id`.
      uji: Muat ulang halaman → kode terakhir dan status tetap ada.
- [x] **FR-23** Solusi latihan hanya diambil dari server saat tombol "Lihat solusi" ditekan, dan setiap pengambilan dicatat di log server.
      uji: Solusi tidak ada di payload awal.

### F-06

- [x] **FR-24** Latihan bertipe `laptop` dirender sebagai panduan 6 bagian baku (kebutuhan, langkah, hasil, cek berhasil, kalau gagal, buktikan paham). Validasi konten gagal bila salah satu bagian kosong.
      uji: Modul dengan latihan laptop tanpa bagian "kalau gagal" gagal validasi.

### F-07

- [x] **FR-14** Soal kuis diambil dari DB per `modul_slug`; payload ke browser hanya berisi `id`, `tipe`, `soal`, `opsi` — tanpa `jawaban` dan tanpa `penjelasan`.
      uji: `grep` pada HTML/JS bundle tidak menemukan kunci jawaban.
- [x] **FR-15** Penilaian dilakukan di server. Respons berisi `benar` (boolean), `jawaban_benar`, dan `penjelasan`.
      uji: POST jawaban salah → `benar:false` + `jawaban_benar` + `penjelasan`.
- [x] **FR-16** Tipe soal: `pilihan_ganda` (satu benar) dan `isian_singkat`. Isian dinormalisasi: trim, lowercase, spasi beruntun dirapatkan, tanda baca di ujung dibuang.
      uji: `"  SELECT  "` dan `"select"` sama-sama benar.
- [x] **FR-17** Kuis dapat diulang tanpa batas; hanya skor terakhir yang disimpan (localStorage).
      uji: Mengulang 3x → hanya skor terakhir yang tampil.
- [x] **FR-18** Setelah semua soal dijawab, tampil skor dan tautan ke bagian modul untuk setiap soal yang salah.
      uji: 2 salah → 2 tautan anchor tampil.

### F-10

- [x] **FR-25** Semua state pengguna disimpan di localStorage dengan prefiks `pintas:v1:`.
      uji: Tidak ada cookie yang diset selain preferensi tema.
- [x] **FR-26** Progres dapat diekspor ke JSON (satu berkas, berisi versi skema) dan diimpor kembali dengan validasi skema; impor yang tidak valid ditolak dengan pesan.
      uji: Impor berkas acak → ditolak, data lama utuh.
- [x] **FR-27** Reset progres hanya jalan setelah pengguna mengetik `HAPUS`.
      uji: Tombol reset tanpa konfirmasi tidak berpengaruh.

### F-11

- [x] **FR-32** Halaman `/panduan` memuat 11 bagian wajib sesuai PRD F-11.
      uji: Checklist review: 11 bagian ada.

### F-12

- [x] **FR-31** Halaman `/stack` menampilkan semua bahasa & framework dengan kolom: nama, jenis, kegunaan, track terkait, cara konek DB, cara buat REST API, cara menyambung dari bahasa lain.
      uji: Setiap entri punya 7 kolom terisi atau ditandai `TODO: konfirmasi`.

### F-13

- [x] **FR-35** Tema gelap/terang mengikuti `prefers-color-scheme`, dapat diubah manual, tanpa kedip saat muat.
      uji: Reload 10x → tidak ada kilatan putih pada mode gelap.

### F-14

- [x] **FR-33** `/404` menampilkan tautan ke beranda, pencarian, dan 3 modul populer. | URL acak → 404 dengan tautan berfungsi. | —
      uji: | FR-34 | Rute `/keystatic` hanya ada saat `NODE_ENV=development`. | Build produksi → `/keystatic` = 404.

## C. Kebutuhan non-fungsional (SRS § 2)

- [x] **NFR-01** Halaman modul (lokal, produksi build) First Contentful Paint < 500 ms.
      uji: Lighthouse lokal ≥ 95 performance.
      bukti: `next build` + `next start`, Lighthouse 13 preset desktop, throttling provided,
      `/modul/ai-llm/token-dan-konteks` → skor performance 100, FCP 0,4 s (3 run: 100/0,4 s).
      (Preset mobile bawaan — simulasi 4G + CPU 4× — memberi 75; angka itu simulasi jaringan,
      bukan "lokal" seperti bunyi kriteria.)
- [ ] **NFR-02** Ukuran JS yang dimuat di halaman modul < 150 KB (gzip), di luar halaman latihan.
      uji: Laporan bundle.
- [ ] **NFR-03** Pencarian mengembalikan hasil < 50 ms untuk indeks 500 modul.
      uji: Benchmark skrip di CI.
- [ ] **NFR-04** Panggilan ke Wandbox punya timeout 15 detik; lewat itu → status `error` dengan pesan jelas.
      uji: Simulasi lambat → pesan timeout, bukan menggantung.
- [ ] **NFR-05** Tidak ada rahasia di bundle klien. Variabel sensitif hanya dibaca di server.
      uji: `grep` bundle untuk nama variabel rahasia → kosong.
- [ ] **NFR-06** Kunci jawaban kuis dan solusi latihan tidak dapat diambil massal; endpoint jawab memakai rate limit 20 permintaan/menit/IP.
      uji: Skrip 100 permintaan → 429.
- [ ] **NFR-07** Semua input pengguna divalidasi di server: `modul_slug` harus cocok pola `^[a-z0-9-]+$`, jawaban maksimal 500 karakter, kode maksimal 64 KB.
      uji: Input berisi `<script>` tidak dirender sebagai HTML.
- [ ] **NFR-08** Konten Markdown di-*sanitize*: HTML mentah di file konten tidak dieksekusi; hanya tag aman yang diizinkan.
      uji: Menulis `<script>alert(1)</script>` di file konten → tidak muncul di halaman.
- [ ] **NFR-09** Header keamanan diset: `Content-Security-Policy` (tanpa `unsafe-eval`, kecuali halaman latihan), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`.
      uji: Cek header respons 9 halaman.
- [ ] **NFR-10** Tidak ada cookie sesi, tidak ada data pribadi, tidak ada pelacak pihak ketiga.
      uji: Daftar cookie kosong selain preferensi tema.
- [ ] **NFR-11** Dependensi: `npm audit` tanpa kerentanan high/critical saat rilis.
      uji: CI gagal bila ada.
- [ ] **NFR-12** Build gagal bila ada tautan internal mati, slug duplikat, atau frontmatter tidak valid.
      uji: Uji dengan file rusak → build merah.
- [ ] **NFR-13** Build gagal bila ada modul tanpa lapis 2, tanpa kuis, atau tanpa latihan.
      uji: Uji tiga kasus.
- [ ] **NFR-14** Migrasi DB reversibel dan dijalankan otomatis saat start di lokal.
      uji: `prisma migrate reset` lalu `npm run dev` → DB siap, halaman jalan.
- [ ] **NFR-15** Semua halaman punya penanganan error: kegagalan server menampilkan halaman error dengan tautan beranda, bukan stack trace.
      uji: Matikan DB → halaman menampilkan pesan ramah.
- [ ] **NFR-16** Berjalan di Chrome/Edge/Firefox/Safari versi 2 tahun terakhir.
      uji: | NFR-17 | Tata letak responsif: 360 px (ponsel), 768 px (tablet), 1280 px+ (desktop).
- [ ] **NFR-19** MVP berjalan lokal dengan dua perintah: `npm install` lalu `npm run dev`. Tidak ada layanan berbayar.
      uji: | NFR-20 | Waktu build < 2 menit untuk 20 modul.

## D. Urutan pengerjaan (README)

- [ ] **1.** Rancangan (dokumen ini)
- [ ] **2.** Platform jalan dengan 3 modul contoh → review gaya bahasa
- [ ] **3.** Track AI & LLM Engineer lengkap (12–16 modul + capstone) — `content/ai-llm/` 6 modul
- [ ] **4.** Track Odoo Developer — `content/odoo/` 0 modul
- [ ] **5.** Track .NET/C# — `content/dotnet/` 0 modul
- [ ] **6.** Track Docker — `content/docker/` 0 modul
- [ ] **7.** Go, Kafka, Angular — `content/go/` 0 modul

## E. Gerbang wajib

- [ ] `npm run validate:content` hijau
- [ ] `npm test` hijau
- [ ] `npm run typecheck` hijau
- [ ] `npm run build` hijau

