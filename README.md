# Pintas

Situs belajar pemrograman berbahasa Indonesia yang mengupas satu stack sampai ke detail terkecil — supaya kamu bisa langsung kerja tanpa mulai dari nol.

**Status:** tahap 1 jalan — H1/H2/H3, kuis auto-grade server-side, live search Ctrl+K, latihan web lewat proxy Wandbox.

---

## Apa ini

Setiap modul punya **dua lapis**:

- **Lapis 1** — ringkas, ~10 menit baca. Konsep, analogi, kode yang berjalan, output yang diharapkan, penjelasan tiap fungsi.
- **Lapis 2** — detail penuh di balik `<details>`. Semua parameter, alasan desain, perbandingan dengan dokumentasi resmi, daftar error + arti + cara memperbaiki.

Tidak ada urutan wajib. Prasyarat hanya saran, bukan gerbang — kamu bisa mulai dari modul mana pun.

## Dokumen rancangan

Sembilan dokumen di `docs/`, dibaca berurutan:

| # | Berkas | Isi |
|---|---|---|
| 1 | `docs/01-BRD.md` | Masalah, tujuan, stakeholder, risiko |
| 2 | `docs/02-PRD.md` | Fitur per halaman, alur kerja, aturan bisnis, kriteria terima |
| 3 | `docs/03-SRS.md` | 38 kebutuhan fungsional + 21 non-fungsional, ber-ID |
| 4 | `docs/04-BSD.md` | 13 modul perangkat lunak, alur data, batas modul |
| 5 | `docs/05-arsitektur.md` | Stack, lapisan, struktur folder, deployment |
| 6 | `docs/06-erd.md` + `.mmd` | Skema DB (4 tabel), aturan integritas |
| 7 | `docs/07-uml/` | `use-case.md` (20 UC), `activity.md` (7 alur), `sequence.md` (7 alur), masing-masing + berkas `.mmd` |
| 8 | `docs/08-api.md` + `08-openapi.yaml` | 5 endpoint, kode error, rate limit |
| 9 | `README.md` | Berkas ini |

## Ringkasan teknis

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Konten:** Markdown di `content/`, bukan di database
- **DB:** SQLite via Prisma — hanya untuk soal kuis, kunci jawaban, solusi latihan, log
- **Login:** tidak ada. Progres di localStorage, pindah device lewat ekspor/impor JSON
- **Admin:** Keystatic, **hanya** aktif saat development
- **Latihan kode:** Wandbox API (lewat proxy server, tanpa key)
- **Pencarian:** indeks dibangun saat build, dijalankan di klien (`Ctrl+K`)

## Menjalankan

```bash
npm install
npx prisma migrate dev      # buat prisma/data.db (4 tabel)
npm run db:seed             # isi soal kuis + solusi dari frontmatter
npm run dev                 # http://localhost:3000
```

Syarat: Node.js 20+. Tidak ada layanan lain yang perlu dipasang.

Perintah lain:

| Perintah | Guna |
|---|---|
| `npm run validate:content` | cek schema, slug unik, prasyarat, tautan internal |
| `npm test` | 19 cek logika: normalisasi jawaban/output, slug heading, sanitasi, pencarian |
| `npm run build` | build produksi (ikut `prisma generate`) |
| `npm run typecheck` | `tsc --noEmit` |

## Yang sudah jadi (tahap 1)

- **H1 beranda** — track per tier, dihitung dari konten; track kosong berlabel `Segera` tanpa `href`.
- **H2 track** — daftar modul + badge latihan; semua modul bisa dibuka tanpa syarat.
- **H3 modul** — lapis 1, lapis 2 di balik `<details>`, blok kode berlabel + tombol salin, daftar isi, navigasi sebelumnya/berikutnya.
- **Kuis** — soal dari DB, dinilai di server (`POST /api/kuis/[slug]/jawab`); kunci jawaban tidak ada di HTML hasil build.
- **Latihan web** — CodeMirror (dimuat lazy), proxy server ke Wandbox, allowlist 8 bahasa, output dibandingkan di server.
- **Latihan laptop** — panduan 6 bagian baku dari frontmatter.
- **Live search** — `Ctrl+K`, indeks statis hasil build, debounce 200 ms, highlight, filter track, riwayat 5 kueri.
- **Lain-lain** — `/cari` penuh, `/stack`, `/panduan`, 404, mode gelap/terang tanpa kedip, header keamanan (CSP tanpa `unsafe-eval`).

Belum ada: H4–H7 (latihan standalone, project, interview, progres), Keystatic, e2e Playwright.

## Struktur repo (target)

```
app/           halaman + route handler
components/    komponen UI
lib/           logika domain (content, search, quiz, runner, progress)
content/       materi Markdown  ← sudah ada: _template-modul.md
prisma/        skema + migrasi + seed
scripts/       validate-content, build-index
docs/          9 dokumen rancangan
```

Template modul baku (format yang wajib diikuti setiap modul baru):
`content/_template-modul.md`. Sudah berisi contoh lapis 1, lapis 2, kuis, dan
latihan web + laptop lengkap dengan 6 bagiannya.

Detail lengkap: `docs/05-arsitektur.md` § 4.

## Urutan pengerjaan

1. ✅ Rancangan (dokumen ini)
2. ⬜ Platform jalan dengan 3 modul contoh → review gaya bahasa
3. ⬜ Track AI & LLM Engineer lengkap (12–16 modul + capstone)
4. ⬜ Track Odoo Developer
5. ⬜ Track .NET/C#
6. ⬜ Track Docker
7. ⬜ Go, Kafka, Angular

## Yang sengaja tidak ada di versi pertama

Penilaian repo GitHub otomatis · komentar · sertifikat · panel admin daring · hosting produksi · reset password lewat email.

Alasan dan jalur penambahannya ada di `docs/04-BSD.md` § 7.

## Kontribusi

Konten ditulis dalam bahasa Indonesia; nama kode, API, dan istilah teknis tetap bahasa asli. Setiap modul wajib punya lapis 1, lapis 2, 3–5 soal kuis, dan minimal satu latihan. Aturan lengkap: `docs/02-PRD.md` § 7.

## Lisensi

MIT (belum dibuat — `TODO: konfirmasi`).
