# 05 — Arsitektur

## Pintas

Komponen, tech stack, lapisan, dan deployment.

Versi 1.0 — 2026-11-05

---

## 1. Ringkasan arsitektur

Pintas adalah **aplikasi Next.js satu proses** yang menyajikan halaman statis hasil build, dengan tiga route handler server untuk hal yang harus dirahasiakan atau butuh proses (nilai kuis, jalankan kode, ambil solusi). Tidak ada worker, tidak ada queue, tidak ada cache eksternal.

```
┌────────────────────────── Browser ──────────────────────────┐
│  React (App Router)  ·  Search Client  ·  Progress (LS)     │
│  Editor latihan (CodeMirror)  ·  Tema                       │
└───────────────┬──────────────────────────────┬──────────────┘
                │ HTML/JS statis               │ POST /api/*
┌───────────────▼──────────────────────────────▼──────────────┐
│                      Next.js (node)                          │
│  App Router · Server Components · Route Handlers             │
│  ┌────────────┐ ┌────────────┐ ┌────────────────────────┐   │
│  │ Quiz Svc   │ │ Runner GW  │ │ Prisma (SQLite)        │   │
│  └─────┬──────┘ └─────┬──────┘ └───────────┬────────────┘   │
└────────┼──────────────┼────────────────────┼────────────────┘
         │              │                    │
    ┌────▼────┐    ┌────▼─────┐        ┌─────▼──────┐
    │ SQLite  │    │ Wandbox   │        │ data.db    │
    │ data.db │    │ (HTTPS)   │        │ (berkas)   │
    └─────────┘    └───────────┘        └────────────┘
```

## 2. Tech stack

| Lapisan | Pilihan | Versi | Alasan | Alternatif yang ditolak |
|---|---|---|---|---|
| Framework | Next.js (App Router) | 15.x | Sudah dikenal pemilik (proyek laragon), SSG + route handler dalam satu proses | Django/FastAPI (pemilik belum menguasai Python), Laravel (ekosistem JS lebih dekat ke konten Markdown) |
| Bahasa | TypeScript | 5.x | Tipe pada objek modul mencegah bug konten | JavaScript (kehilangan validasi tipe saat build) |
| Styling | Tailwind CSS | 4.x | Cepat, konsisten, tanpa CSS terpisah per komponen | CSS Modules (lebih banyak file), styled-components (runtime cost) |
| Konten | Markdown + `gray-matter` + `remark`/`rehype` | — | Format yang bisa ditulis dan di-diff | MDX (mengeksekusi kode di build — risiko & lebih berat) |
| Sanitasi | `rehype-sanitize` | — | Wajib: konten bisa datang dari kontributor | Tanpa sanitasi (XSS) |
| Syntax highlight | Shiki | — | Highlight saat build, nol JS di klien | Prism runtime (JS di klien) |
| Pencarian | Indeks JSON + `fuse.js`/`minisearch` | — | Nol layanan, jalan di klien | Algolia/Meilisearch (biaya, layanan tambahan) |
| Editor latihan | CodeMirror 6 | — | Ringan (~120 KB), tanpa worker berat | Monaco (~2 MB, terlalu berat) |
| DB | SQLite via Prisma | 6.x | Satu berkas, migrasi otomatis, jalur pindah ke PostgreSQL | PostgreSQL sejak awal (butuh service) |
| Validasi skema | Zod | — | Satu schema dipakai untuk frontmatter, API, dan impor progres | Manual (mudah terlewat) |
| Sandbox kode | Wandbox API | — | Gratis, tanpa key, 176 compiler | Piston publik (whitelist-only sejak 15 Feb 2026), Judge0 (butuh self-host) |
| Admin konten | Keystatic | — | MIT, edit Markdown langsung, hanya dev | Panel admin buatan sendiri (3–5 hari kerja) |
| Test | Vitest + Playwright | — | Unit untuk logika penilaian, e2e untuk alur utama | — |

## 3. Lapisan aplikasi

| Lapisan | Isi | Aturan |
|---|---|---|
| **Konten** | `content/**/*.md`, `content/_data/tracks.ts` | Sumber kebenaran materi. Tidak dieksekusi sebagai kode. |
| **Domain** | `lib/content`, `lib/search`, `lib/quiz`, `lib/runner`, `lib/progress` | Fungsi murni, tanpa akses jaringan langsung kecuali `runner/provider`. |
| **Penyajian** | `app/**` (page, layout, komponen) | Tidak mengandung aturan bisnis; hanya memanggil domain. |
| **API** | `app/api/**` | Validasi input (Zod) → panggil domain → bentuk respons. Tidak ada logika UI. |
| **Data** | `prisma/schema.prisma`, `lib/db.ts` | Hanya diakses lewat fungsi domain, bukan dari komponen. |

## 4. Struktur folder

```
pintas/
├─ app/
│  ├─ layout.tsx                 # header, pencarian, tema
│  ├─ page.tsx                   # H1 beranda
│  ├─ track/[slug]/page.tsx      # H2
│  ├─ modul/[track]/[slug]/page.tsx  # H3
│  ├─ latihan/[id]/page.tsx      # H4
│  ├─ project/[track]/page.tsx   # H5
│  ├─ interview/[track]/page.tsx # H6
│  ├─ progres/page.tsx           # H7
│  ├─ panduan/page.tsx           # H8
│  ├─ stack/page.tsx             # H9
│  ├─ cari/page.tsx              # hasil pencarian penuh
│  ├─ keystatic/[[...params]]/   # M12 (dev only)
│  ├─ api/
│  │  ├─ kuis/[slug]/route.ts
│  │  ├─ kuis/[slug]/jawab/route.ts
│  │  ├─ latihan/jalankan/route.ts
│  │  └─ latihan/[id]/solusi/route.ts
│  └─ not-found.tsx
├─ components/
│  ├─ kode/CodeBlock.tsx · CodeRunner.tsx · Editor.tsx
│  ├─ kuis/Quiz.tsx · Soal.tsx · Hasil.tsx
│  ├─ cari/SearchDialog.tsx · Highlight.tsx
│  ├─ modul/Lapis2.tsx · DaftarIsi.tsx · Badge.tsx
│  └─ ui/…                       # tombol, kartu, chip, tema
├─ lib/
│  ├─ content/{load.ts,validate.ts,render.ts,types.ts}
│  ├─ search/{index.ts,query.ts}
│  ├─ quiz/{grade.ts,normalize.ts}
│  ├─ runner/{gateway.ts,provider.wandbox.ts,allowlist.ts}
│  ├─ progress/{store.ts,schema.ts,merge.ts}
│  └─ db.ts
├─ content/
│  ├─ _data/tracks.ts            # daftar track + tier
│  ├─ _data/stack.ts             # H9: daftar bahasa & framework
│  ├─ fondasi/                   # Tier 0
│  └─ ai-llm/                    # track pertama
├─ prisma/{schema.prisma,migrations/,seed.ts}
├─ scripts/{build-index.ts,validate-content.ts}
├─ public/
├─ docs/                         # 9 dokumen ini
└─ README.md
```

## 5. Strategi render

| Halaman | Strategi | Alasan |
|---|---|---|
| H1, H2, H3, H5, H6, H8, H9, /cari | Static (SSG, `generateStaticParams`) | Konten tidak berubah saat runtime |
| H4 | Static shell + komponen klien | Editor butuh JS |
| H7 | Klien penuh | Data di localStorage |
| `/api/kuis/*` | Dinamis | Harus baca DB |
| `/api/latihan/*` | Dinamis | Panggilan jaringan |

Tidak ada ISR, tidak ada revalidasi — konten berubah lewat deploy baru. Ini menghapus satu kelas bug.

## 6. Konfigurasi

```env
# .env
DATABASE_URL="file:./data.db"
RUNNER_PROVIDER="wandbox"          # wandbox | piston
RUNNER_TIMEOUT_MS="15000"
RUNNER_MAX_BYTES="65536"
RATE_LIMIT_PER_MIN="20"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Semua variabel dibaca di server. Tidak ada yang berawalan `NEXT_PUBLIC_` kecuali `NEXT_PUBLIC_SITE_URL` (bukan rahasia).

## 7. Deployment

### 7.1 MVP — lokal
```
npm install
npx prisma migrate dev
npm run dev          # http://localhost:3000
```
Syarat: Node.js 20+, tidak ada layanan lain.

### 7.2 Produksi (belum diputuskan — lihat BRD B1)
Dua jalur, konsekuensi berbeda:

| Jalur | Cocok untuk | Catatan penting |
|---|---|---|
| **VPS + Node + SQLite** | Pengguna sedikit, kontrol penuh, biaya tetap | SQLite aman karena satu proses. Wajib backup berkas `data.db`. Butuh reverse proxy + HTTPS. |
| **Vercel/Netlify + PostgreSQL** | Pengguna banyak, nol perawatan server | **SQLite tidak bisa dipakai** — filesystem serverless sementara. Ganti `provider` Prisma ke `postgresql` (satu baris) dan isi `DATABASE_URL`. |

Catatan keras: **SQLite + Vercel tidak akan jalan.** Ini batasan platform, bukan pilihan. Karena itu skema Prisma ditulis agar pindah provider tidak menyentuh kode aplikasi.

### 7.3 Sebelum deploy publik (wajib)
1. Audit Security Review (topic 190) → verdict LULUS.
2. Pastikan `/keystatic` 404 di build produksi.
3. `npm audit` bersih dari high/critical.
4. Header keamanan aktif (NFR-09).
5. Backup `data.db` terjadwal.

## 8. Observabilitas

| Hal | MVP | Nanti |
|---|---|---|
| Log | stdout terstruktur (JSON): rute, durasi, status | agregator log |
| Error | `error.tsx` per segmen + log 5xx | Sentry |
| Metrik | tidak ada | uptime check + metrik latihan |
| Backup | salin `data.db` manual | cron + simpan di luar server |

## 9. Batasan yang diketahui

| # | Batasan | Dampak | Jalur keluar |
|---|---|---|---|
| L1 | Wandbox adalah layanan pihak ketiga tanpa SLA | Latihan web bisa gagal saat mereka down | `runner/provider` bisa ditukar ke Piston self-host |
| L2 | Satu proses Node | Tidak bisa multi-instance dengan SQLite | Pindah PostgreSQL |
| L3 | Tanpa login | Progres per browser | Ekspor/impor JSON; login di fase 2 |
| L4 | Build penuh tiap perubahan konten | Build makin lama seiring modul bertambah | ISR/cache saat modul > 200 |
