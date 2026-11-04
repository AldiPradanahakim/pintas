# 02 — PRD (Product Requirement Document)

## Pintas

Fitur, alur kerja, aturan bisnis, dan kriteria terima. Masalah dan tujuan ada di `01-BRD.md`.

Versi 1.0 — 2026-11-05 · Status: fiks

---

## 1. Ringkasan produk

Pintas adalah situs belajar berbahasa Indonesia yang memecah satu stack teknologi menjadi modul-modul pendek. Setiap modul punya dua lapis: **lapis 1** (ringkas, ~10 menit, langsung bisa dipraktikkan) dan **lapis 2** (detail penuh: parameter, opsi, error, alasan desain). Tidak ada urutan wajib; pembaca bebas mulai dari modul mana pun.

Tidak ada akun. Progres disimpan di browser. Kunci jawaban kuis disimpan di server.

## 2. Persona

| Persona | Perilaku | Yang dibutuhkan produk |
|---|---|---|
| **Praktisi yang tidak suka baca panjang** (pengguna utama) | Langsung cari modul, baca 10 menit, coba kode, lanjut | Lapis 1 padat, tombol jalankan kode, live search cepat |
| **Pembelajar terstruktur** | Ikuti peta track dari awal, cek prasyarat, catat progres | Peta track, penanda prasyarat, halaman progres |
| **Pencari jawaban** | Datang dari Google untuk satu error/API tertentu | URL per modul stabil, pencarian isi, lapis 2 berisi error umum |
| **Kontributor open source** | Mau menambah/mengoreksi modul | Format file baku, panduan kontribusi, validasi otomatis |

## 3. Peta halaman

| # | Rute | Halaman | Tujuan |
|---|---|---|---|
| H1 | `/` | Beranda | Daftar track per tier, pencarian, lanjutkan belajar |
| H2 | `/track/[slug]` | Track | Daftar modul, estimasi waktu, progres, capstone |
| H3 | `/modul/[track]/[slug]` | Modul | Materi 2 lapis, kuis, navigasi |
| H4 | `/latihan/[slug]` | Latihan | Editor kode, jalankan, hasil uji |
| H5 | `/project/[track]` | Project | Rubrik capstone, syarat lulus |
| H6 | `/interview/[track]` | Tanya jawab interview | Bank pertanyaan per track |
| H7 | `/progres` | Progres | Ringkasan kemajuan lokal |
| H8 | `/panduan` | Panduan platform | Cara memakai situs |
| H9 | `/stack` | Daftar bahasa & framework | Semua stack + satu baris kegunaan |

Halaman tambahan wajib: `/404` (tidak ditemukan) dan `/cari?q=` (hasil pencarian penuh, dipakai saat Enter ditekan di kotak pencarian).

## 4. Fitur

### F-01 — Daftar track dan tier (H1)
**Peran:** semua. **Prioritas:** wajib.

Beranda menampilkan track yang dikelompokkan per tier (Tier 0 Fondasi, Tier 1 MVP, Tier 2, Tier 3). Track yang kontennya belum ada ditampilkan dengan label `Segera` dan tidak bisa diklik.

**Kriteria terima:**
- Setiap kartu track menampilkan: nama, satu baris kegunaan, jumlah modul, estimasi total jam, status (tersedia/segera).
- Track `Segera` tidak menghasilkan tautan mati (tetap `<a>` dengan `aria-disabled` dan tanpa `href`).
- Urutan tier konsisten dengan `docs/02-PRD.md` § 6.

### F-02 — Live search (global, semua halaman)
**Peran:** semua. **Prioritas:** wajib.

**Perilaku:**
- Kotak pencarian di header, bisa dibuka dengan `Ctrl+K` / `Cmd+K`, ditutup dengan `Esc`.
- Hasil muncul saat mengetik, jeda 200 ms setelah ketikan terakhir (debounce).
- Mencari di **judul modul, judul bagian (heading), dan isi teks**. Kode di dalam blok kode ikut diindeks.
- Hasil dikelompokkan per track, maksimal 8 hasil di panel cepat, dengan potongan teks di sekitar kata kunci.
- Kata kunci di-highlight di judul dan potongan teks.
- Filter per track (chip) di panel pencarian.
- Navigasi hasil dengan `↑`/`↓`, buka dengan `Enter`.
- Keadaan kosong: teks "Tidak ada hasil untuk «kata»" + 3 saran modul populer.
- Riwayat 5 pencarian terakhir, disimpan di localStorage, bisa dihapus.
- Tekan `Enter` tanpa memilih hasil → buka `/cari?q=`.
- Pencarian tidak case-sensitive dan toleran terhadap salah ketik ringan (jarak edit 1 untuk kata > 4 huruf).

**Kriteria terima:**
- Mengetik "middleware" memunculkan modul yang memuat kata itu di isi, bukan hanya di judul.
- Panel tidak menampilkan lebih dari 8 hasil dan tidak pernah kosong tanpa pesan.
- Indeks dibangun saat build; tidak ada permintaan jaringan saat mengetik.

### F-03 — Halaman track (H2)
**Peran:** semua. **Prioritas:** wajib.

- Header: nama track, satu paragraf "track ini untuk siapa", estimasi total jam, jumlah modul selesai.
- Peta alur: daftar modul berurutan dengan penanda prasyarat (saran, bukan gerbang).
- Setiap baris modul: nomor, judul, estimasi menit, badge jenis latihan (`Di web` / `Di laptop` / `Tanpa latihan`), status (belum/sedang/selesai).
- Tombol menuju capstone project (H5) dan bank interview (H6).
- Semua modul bisa diklik tanpa syarat.

### F-04 — Halaman modul (H3)
**Peran:** semua. **Prioritas:** wajib.

**Struktur wajib modul (urutan tampil):**
1. Judul, track, nomor, estimasi menit.
2. Kotak "Kamu akan bisa" — 3–5 butir hasil belajar, dapat diuji.
3. Prasyarat (tautan, berlabel "saran").
4. **Lapis 1** — materi ringkas: konsep, analogi, kode yang berjalan, output yang diharapkan, penjelasan tiap baris/fungsi.
5. **Lapis 2** — blok `<details>`: semua parameter & opsi, alasan desain, perbandingan dengan dokumentasi resmi, daftar error + arti + cara memperbaiki + langkah perbaikan, catatan versi.
6. Latihan (satu atau lebih), masing-masing berbadge `Di web` atau `Di laptop`.
7. Kuis (3–5 soal).
8. "Kamu sudah bisa ini kalau…" — checklist mandiri.
9. Navigasi modul sebelumnya/berikutnya + tautan ke capstone.

**Aturan tampil:**
- Lapis 2 tertutup secara default, dengan ringkasan isi (jumlah parameter, jumlah error yang dibahas).
- Blok kode punya label bahasa, tombol salin, dan (untuk latihan web) tombol "Jalankan".
- Setiap blok kode yang punya output menampilkan output yang diharapkan persis di bawahnya.
- Judul bagian punya `id` untuk deep link (`/modul/ai-llm/03-embedding#error-umum`).
- Daftar isi otomatis di sidebar kanan (desktop) berisi heading lapis 1 + pintasan ke lapis 2, latihan, kuis.
- Modul ditandai selesai otomatis setelah kuis dijawab semua dan minimal 1 latihan lulus (bisa juga ditandai manual).

**Kriteria terima:**
- Lapis 1 bisa dibaca dalam ≤ 10 menit (diuji dengan membaca nyata, bukan perkiraan).
- Setiap fungsi/kata kunci yang dipakai di contoh kode dijelaskan di lapis 1 minimal satu baris.
- Setiap blok kode punya output yang diharapkan.
- Tidak ada tautan mati ke dokumentasi resmi.

### F-05 — Latihan di web (H4, badge `Di web`)
**Peran:** semua. **Prioritas:** wajib.

- Editor kode (CodeMirror/Monaco) dengan pilihan bahasa terbatas pada yang didukung runner.
- Tombol "Jalankan" mengirim kode ke server (route handler), server meneruskan ke Wandbox.
- Menampilkan: stdout, stderr, status keluar, waktu eksekusi.
- Uji otomatis: perbandingan stdout dengan output yang diharapkan (setelah normalisasi spasi di ujung baris) + maksimal satu uji `assert` tambahan per latihan.
- Status: `lulus` / `gagal` / `error`. Hasil disimpan di localStorage per latihan.
- Batas: waktu eksekusi 10 detik, ukuran kode 64 KB, satu permintaan sekaligus per tab.
- Tombol "Kembalikan ke kode awal" dan "Lihat solusi" (solusi tersimpan di DB, tidak ada di HTML awal).

**Kriteria terima:**
- Kode salah → pesan error asli dari compiler/runtime ditampilkan apa adanya, tidak disamarkan.
- Kode benar → status `lulus` dan output sama persis dengan yang diharapkan.
- Tombol jalankan tidak bisa ditekan dua kali bersamaan.

### F-06 — Latihan di laptop (badge `Di laptop`)
**Peran:** semua. **Prioritas:** wajib.

Bukan editor, melainkan panduan bertahap dengan 6 bagian baku:
1. **Yang dibutuhkan** — versi runtime/tool + perintah cek versi.
2. **Langkah** — perintah copy-paste, satu perintah per langkah + penjelasan satu baris.
3. **Hasil yang harus muncul** — output/URL persis.
4. **Cek berhasil** — kriteria objektif.
5. **Kalau gagal** — 3–5 error tersering + arti + langkah perbaikan.
6. **Buktikan kamu paham** — satu perubahan yang harus dicoba sendiri + hasil yang diharapkan.

**Kriteria terima:**
- Setiap langkah punya perintah yang bisa disalin apa adanya.
- Setiap bagian "Kalau gagal" memuat minimal 3 error nyata (bukan hipotetis).

### F-07 — Kuis (bagian dari H3)
**Peran:** semua. **Prioritas:** wajib.

- 3–5 soal per modul, tipe: pilihan ganda (satu jawaban benar) dan isian singkat (jawaban dinormalisasi: trim, lowercase, spasi dirapatkan).
- Soal diambil dari DB lewat server; jawaban benar **tidak pernah** dikirim ke browser sebelum dijawab.
- Penilaian di server (`POST /api/kuis/[id]/jawab`), respons hanya berisi benar/salah + penjelasan.
- Bisa diulang; skor terakhir yang disimpan di localStorage, riwayat percobaan tidak disimpan.
- Setelah semua soal dijawab, tampilkan skor dan tautan ke bagian yang relevan untuk soal yang salah.

**Kriteria terima:**
- Melihat source HTML tidak memperlihatkan kunci jawaban.
- Isian singkat menerima variasi kapitalisasi dan spasi berlebih.
- Menjawab salah tidak mengunci percobaan berikutnya.

### F-08 — Capstone project (H5)
**Peran:** semua. **Prioritas:** wajib (tanpa penilaian otomatis).

- Menampilkan: ringkasan project, daftar fitur wajib, rubrik penilaian (bobot per kriteria), syarat lulus (contoh: semua fitur wajib + skor rubrik ≥ 70%), dan langkah pengerjaan.
- Field untuk menyimpan tautan repo GitHub di localStorage + status `belum direview`.
- **Tidak ada** pengiriman, penilaian otomatis, atau review dari server di MVP.
- Tautan ke issue template GitHub untuk minta review manual.

### F-09 — Bank tanya jawab interview (H6)
**Peran:** semua. **Prioritas:** wajib.

- ~20 pertanyaan per track, dikelompokkan per topik.
- Jawaban tersembunyi di balik `<details>`.
- Pencarian dalam halaman (filter teks) dan penanda "sudah dikuasai" di localStorage.
- Setiap pertanyaan diberi label tingkat: dasar / menengah / lanjutan.

### F-10 — Progres (H7)
**Peran:** semua. **Prioritas:** wajib.

- Ringkasan: modul selesai per track, skor kuis terakhir, latihan lulus, checklist interview.
- Tombol "Ekspor progres" (unduh JSON) dan "Impor progres" (unggah JSON) — pengganti login untuk pindah device.
- Tombol "Reset progres" dengan konfirmasi ketik `HAPUS`.
- Data disimpan di localStorage dengan kunci berversi (`pintas:v1:*`) agar bisa dimigrasi.

**Kriteria terima:**
- Ekspor lalu impor di browser lain menghasilkan progres identik.
- Reset tidak bisa dilakukan tanpa mengetik konfirmasi.

### F-11 — Panduan platform (H8)
**Peran:** semua. **Prioritas:** wajib.

Isi wajib:
- Apa itu Pintas, untuk siapa, dan apa yang **tidak** dijanjikan.
- Cara mulai (pilih track / cari langsung).
- Cara membaca modul: lapis 1 vs lapis 2, arti setiap badge, arti prasyarat.
- Cara mengerjakan kuis dan arti skor.
- Cara menjalankan latihan di web (batas waktu, kenapa output harus sama persis).
- Cara mengerjakan latihan di laptop (6 langkah baku).
- Cara memakai capstone dan rubriknya.
- Arti semua status.
- Keyboard shortcut, mode gelap/terang, glosarium istilah.
- Tautan ke README untuk menjalankan lokal / berkontribusi.

### F-12 — Daftar stack (H9)
**Peran:** semua. **Prioritas:** wajib.

- Tabel semua bahasa & framework: nama, jenis (bahasa/framework/tool), kegunaan satu baris, track terkait, status (ada track / segera).
- Untuk setiap bahasa: cara konek DB (driver, ORM, connection string, migration) dan cara membuat REST API (framework, satu contoh endpoint).
- Untuk setiap framework: cara menyambung dari bahasa lain (contoh: Python memanggil API .NET).

### F-13 — Mode gelap/terang
**Peran:** semua. **Prioritas:** wajib.

- Mengikuti preferensi sistem pada kunjungan pertama, bisa diubah manual, pilihan disimpan di localStorage.
- Tanpa kedip tema saat muat (kelas tema diset sebelum render).

### F-14 — Keystatic (admin lokal)
**Peran:** penulis konten. **Prioritas:** wajib (lokal saja).

- Berjalan di `/keystatic` **hanya** pada `NODE_ENV=development`; pada build produksi rute tidak ada (404).
- Mengedit file Markdown di `content/` dan file data track di `content/_data/`.
- Validasi schema: field wajib, tipe benar, slug unik.
- Tidak ada unggahan file ke server; gambar disimpan di repo.

**Kriteria terima:**
- `npm run build && npm start` lalu buka `/keystatic` → 404.
- Menambah modul lewat Keystatic menghasilkan file `.md` valid yang lolos `npm run validate:content`.

## 5. Alur kerja utama

### A5.1 — Belajar satu modul
1. Pengguna membuka beranda → memilih track, atau `Ctrl+K` → mengetik kata kunci.
2. Halaman modul terbuka, lapis 1 tampil.
3. Pengguna menekan "Jalankan" pada blok kode (latihan web) atau mengikuti langkah (latihan laptop).
4. Latihan lulus → status latihan tersimpan.
5. Kuis dijawab → server menilai → skor tampil.
6. Modul ditandai selesai → progres di localStorage diperbarui.

### A5.2 — Mencari jawaban spesifik
1. Pengguna datang dari mesin pencari ke `/modul/...` dengan anchor.
2. Halaman langsung menggulir ke bagian yang dituju, lapis 2 dibuka otomatis bila anchor berada di dalamnya.
3. Pengguna menyalin kode, selesai.

### A5.3 — Menulis modul baru (penulis)
1. Buka `/keystatic` di lokal.
2. Buat entri modul: isi frontmatter (track, nomor, prasyarat, estimasi, kuis).
3. Tulis lapis 1 dan lapis 2.
4. Jalankan `npm run validate:content` (cek schema, slug unik, tautan internal, contoh kode web).
5. Jalankan `npm run dev`, buka modul, jalankan setiap latihan web.
6. Commit.

### A5.4 — Pindah device tanpa login
1. H7 → "Ekspor progres" → file JSON terunduh.
2. Buka situs di device lain → H7 → "Impor progres" → pilih file.
3. Progres identik.

## 6. Cakupan stack (ruang lingkup konten)

| Tier | Isi |
|---|---|
| **Tier 0 — Fondasi** (ditulis sekali, dipakai semua track) | Git & GitHub · HTTP & REST · SQL · CLI/Linux · Docker · Testing · Auth & keamanan dasar · JSON/YAML · Environment & config |
| **Tier 1 — MVP** | Python · FastAPI · Django · JavaScript/TypeScript · Node.js/Express · Next.js · PostgreSQL |
| **Tier 2** | Odoo (Python + PostgreSQL + XML/QWeb + OWL + manifest & inheritance) · C# · .NET (ASP.NET Core, EF Core, Blazor, Minimal API) |
| **Tier 3** | Go (Gin/Fiber) · Kafka · Angular · PHP/Laravel · Java/Spring Boot · Redis · MongoDB · GraphQL · gRPC · RabbitMQ · CI/CD |

**Aturan wajib per bahasa/framework:** modul REST API dengan pola seragam — bikin endpoint → struktur request/response → auth (JWT/API key) → status code & error → versioning → OpenAPI/Swagger → cara menyambung dari bahasa lain. Plus tabel koneksi DB: driver, ORM, connection string, migration.

## 7. Aturan bisnis

| # | Aturan |
|---|---|
| BR-01 | Tidak ada urutan wajib. Prasyarat hanya saran; tidak ada modul yang terkunci. |
| BR-02 | Setiap modul wajib punya lapis 1 dan lapis 2. Modul tanpa salah satunya tidak boleh di-merge. |
| BR-03 | Setiap blok kode wajib punya output yang diharapkan, atau ditandai `tanpa output` dengan alasan. |
| BR-04 | Setiap modul wajib punya 3–5 soal kuis dan minimal satu latihan (web atau laptop). |
| BR-05 | Penjelasan dalam bahasa Indonesia; nama kode, API, istilah teknis tetap bahasa asli. |
| BR-06 | Satu bahasa utama per modul; tabel banding lintas bahasa hanya untuk konsep inti. |
| BR-07 | Kunci jawaban hanya di DB; tidak boleh muncul di HTML, JS bundle, atau file konten publik. |
| BR-08 | Keystatic tidak boleh aktif pada build produksi. |
| BR-09 | Tidak ada data pribadi yang dikumpulkan. Tidak ada cookie pelacak. |
| BR-10 | Progres hanya di localStorage; tidak dikirim ke server. |
| BR-11 | Jumlah modul per track 12–16 + 1 capstone. |
| BR-12 | Setiap klaim teknis harus dapat dilacak ke dokumentasi resmi (tautan di lapis 2). |
| BR-13 | Latihan web hanya untuk kode satu file yang bisa dijalankan runner; selain itu wajib latihan laptop. |

## 8. Kebutuhan non-fungsional (ringkas, detail di SRS)

- Halaman modul termuat < 500 ms di lokal, < 2 s di jaringan lambat (3G cepat).
- Bisa dipakai tanpa JavaScript untuk membaca materi dan melihat kuis (penilaian kuis butuh JS).
- Aksesibilitas: kontras WCAG AA, navigasi keyboard penuh, fokus terlihat, `aria-label` pada tombol ikon.
- Semua halaman punya `<title>` dan meta description unik.
- Tidak ada permintaan jaringan pihak ketiga selain Wandbox (saat latihan dijalankan).
