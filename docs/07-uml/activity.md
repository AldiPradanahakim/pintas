# 07 — UML: Activity

## Pintas

Alur aktivitas untuk proses yang punya percabangan penting. Versi 1.0 — 2026-11-05

---

## 1. Aktivitas: Mengerjakan satu modul (alur utama pengguna)

```mermaid
flowchart TD
  A([Mulai]) --> B[Buka beranda / cari modul]
  B --> C{Modul ditemukan?}
  C -- tidak --> C1[Tampilkan saran + pencarian ulang] --> B
  C -- ya --> D[Baca lapis 1]
  D --> E{Butuh detail?}
  E -- ya --> E1[Buka lapis 2: parameter, error, alasan] --> F
  E -- tidak --> F{Ada latihan?}
  F -- ya --> G{Jenis latihan?}
  G -- web --> G1[Edit kode di editor]
  G1 --> G2[Tekan Jalankan]
  G2 --> G3{Validasi server lolos?}
  G3 -- tidak --> G4[Tampilkan 429/413/400] --> G1
  G3 -- ya --> G5[Kirim ke Wandbox]
  G5 --> G6{Wandbox merespons < 15 s?}
  G6 -- tidak --> G7[Status error: timeout] --> G1
  G6 -- ya --> G8{stdout == output harapan?}
  G8 -- tidak --> G9[Tampilkan stdout/stderr + verdict gagal] --> G1
  G8 -- ya --> G10[Verdict lulus, simpan di localStorage] --> H
  G -- laptop --> G11[Ikuti 6 langkah panduan]
  G11 --> G12{Hasil sesuai?}
  G12 -- tidak --> G13[Buka bagian 'Kalau gagal', perbaiki] --> G11
  G12 -- ya --> G14[Tandai latihan selesai] --> H
  F -- tidak --> H
  H[Kerjakan kuis 3-5 soal] --> I[Jawab per soal]
  I --> J[Server menilai]
  J --> K{Semua soal terjawab?}
  K -- tidak --> I
  K -- ya --> L[Tampilkan skor + tautan soal salah]
  L --> M{Semua dijawab & >=1 latihan lulus?}
  M -- ya --> N[Status modul: selesai]
  M -- tidak --> O[Status modul: sedang]
  N --> P([Selesai])
  O --> P
```

## 2. Aktivitas: Pencarian

```mermaid
flowchart TD
  A([Ctrl+K]) --> B[Panel terbuka, fokus input]
  B --> C{Kueri >= 2 karakter?}
  C -- tidak --> C1[Tampilkan riwayat 5 terakhir] --> C
  C -- ya --> D[Tunggu 200 ms sejak ketikan terakhir]
  D --> E[Filter track?]
  E -- ada --> E1[Saring hasil per track] --> F
  E -- tidak --> F[Cocokkan judul + heading + teks + kode]
  F --> G{Ada hasil?}
  G -- tidak --> G1[Pesan 'Tidak ada hasil' + 3 saran] --> H
  G -- ya --> G2[Tampilkan maks 8 hasil, sorot kata kunci]
  G2 --> H{Aksi pengguna}
  H -- Enter pada hasil --> I[Buka modul] --> Z([Selesai])
  H -- Enter tanpa hasil --> J[Buka /cari?q=] --> Z
  H -- Esc --> K[Tutup panel] --> Z
  H -- mengetik lagi --> D
```

## 3. Aktivitas: Penilaian kuis (server)

```mermaid
flowchart TD
  A([POST /api/kuis/:slug/jawab]) --> B{Input valid? pola soal_id, jawaban <= 500 char}
  B -- tidak --> B1[400 VALIDASI_GAGAL] --> Z([Selesai])
  B -- ya --> C{Rate limit < 20/menit/IP?}
  C -- tidak --> C1[429 RATE_LIMIT] --> Z
  C -- ya --> D[Ambil soal dari DB]
  D --> E{Soal ada?}
  E -- tidak --> E1[404 SOAL_TIDAK_DITEMUKAN] --> Z
  E -- ya --> F{Tipe soal?}
  F -- pilihan_ganda --> G[Bandingkan huruf opsi]
  F -- isian_singkat --> H[Normalisasi: trim, lowercase, rapatkan spasi, buang tanda baca ujung]
  G --> I[Hasil benar/salah]
  H --> I
  I --> J[Respons: benar, jawaban_benar, penjelasan]
  J --> Z
```

## 4. Aktivitas: Latihan web (server)

```mermaid
flowchart TD
  A([POST /api/latihan/jalankan]) --> B{Body valid? bahasa, latihan_id, kode}
  B -- tidak --> B1[400 VALIDASI_GAGAL] --> Z([Selesai])
  B -- ya --> C{Bahasa di allowlist?}
  C -- tidak --> C1[400 BAHASA_TIDAK_DIDUKUNG] --> Z
  C -- ya --> D{Ukuran kode <= 64 KB?}
  D -- tidak --> D1[413 KODE_TERLALU_BESAR] --> Z
  D -- ya --> E{Rate limit <= 20/menit/IP?}
  E -- tidak --> E1[429 RATE_LIMIT] --> Z
  E -- ya --> F[Ambil output_harapan dari konten server]
  F --> G[Panggil penyedia eksekusi, timeout 15 s]
  G --> H{Berhasil?}
  H -- timeout --> H1[504 RUNNER_TIMEOUT, catat log] --> Z
  H -- error penyedia --> H2[502 RUNNER_GAGAL, catat log] --> Z
  H -- ya --> I[Normalkan stdout/stderr]
  I --> J{stdout == output_harapan?}
  J -- ya --> K[status lulus]
  J -- tidak --> L[status gagal]
  K --> M[Catat LogLatihan: bahasa, ukuran, durasi, status]
  L --> M
  M --> N[Respons: status, stdout, stderr, exit_code, durasi_ms]
  N --> Z
```

## 5. Aktivitas: Build dan validasi konten

```mermaid
flowchart TD
  A([npm run build]) --> B[Scan content/**/*.md]
  B --> C{Ada file .md?}
  C -- tidak --> C1[Gagal: konten kosong] --> Z([Build berhenti])
  C -- ya --> D[Parse frontmatter tiap file]
  D --> E{Schema valid?}
  E -- tidak --> E1[Gagal: sebut file + field] --> Z
  E -- ya --> F{Slug unik dalam track?}
  F -- tidak --> F1[Gagal: slug duplikat] --> Z
  F -- ya --> G{Ada heading '## Lapis 2'?}
  G -- tidak --> G1[Gagal: lapis 2 wajib] --> Z
  G -- ya --> H{Kuis 3-5 & latihan >= 1?}
  H -- tidak --> H1[Gagal: kuis/latihan tidak lengkap] --> Z
  H -- ya --> I{Tautan internal valid?}
  I -- tidak --> I1[Gagal: tautan mati] --> Z
  I -- ya --> J[Render Markdown + sanitasi]
  J --> K[Bangun indeks pencarian]
  K --> L[Seed soal & solusi ke DB]
  L --> M[Seed cek: soal yatim, opsi tidak cocok]
  M --> N{Seed valid?}
  N -- tidak --> N1[Gagal: data tidak konsisten] --> Z
  N -- ya --> O[Tulis halaman statis + search-index.json]
  O --> P([Build sukses])
```

## 6. Aktivitas: Menulis modul baru (penulis)

```mermaid
flowchart TD
  A([Buka /keystatic - dev only]) --> B[Buat entri modul]
  B --> C[Isi frontmatter: track, nomor, slug, estimasi, prasyarat, latihan]
  C --> D[Tulis lapis 1]
  D --> E[Tulis '## Lapis 2' + detail: parameter, error, alasan]
  E --> F[Tulis kuis 3-5 + penjelasan tiap jawaban]
  F --> G[Jalankan npm run validate:content]
  G --> H{Lolos?}
  H -- tidak --> I[Perbaiki sesuai pesan] --> G
  H -- ya --> J[Jalankan setiap latihan web di halaman modul]
  J --> K{Semua lulus?}
  K -- tidak --> L[Perbaiki kode/output harapan] --> J
  K -- ya --> M[Periksa tampilan di mobile + desktop]
  M --> N[Commit + push]
  N --> O([Modul siap])
```

## 7. Aktivitas: Ekspor dan impor progres

```mermaid
flowchart TD
  subgraph Ekspor
    A([H7: tombol Ekspor]) --> B[Baca semua kunci pintas:v1:*]
    B --> C[Serialisasi JSON + versi skema]
    C --> D[Unduh pintas-progres-YYYYMMDD.json]
  end
  subgraph Impor
    E([H7: tombol Impor]) --> F[Pilih berkas]
    F --> G{JSON valid?}
    G -- tidak --> G1[Tolak: berkas tidak valid, data lama utuh] --> Z([Selesai])
    G -- ya --> H{Versi skema didukung?}
    H -- tidak --> H1[Tolak: versi tidak didukung] --> Z
    H -- ya --> I{Skema cocok?}
    I -- tidak --> I1[Tolak: skema tidak cocok] --> Z
    I -- ya --> J[Konfirmasi: data sekarang akan diganti]
    J --> K{Pengguna setuju?}
    K -- tidak --> Z
    K -- ya --> L[Tulis ke localStorage] --> Z
  end
```
