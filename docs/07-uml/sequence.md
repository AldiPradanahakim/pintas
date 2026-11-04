# 07 — UML: Sequence

## Pintas

Urutan pesan antar komponen untuk alur yang melibatkan server atau layanan luar.
Versi 1.0 — 2026-11-05

---

## 1. Membuka halaman modul (tanpa server)

```mermaid
sequenceDiagram
  autonumber
  actor P as Pembelajar
  participant B as Browser
  participant N as Next.js (statis)
  participant LS as localStorage

  P->>B: GET /modul/ai-llm/03-embedding
  B->>N: minta halaman
  N-->>B: HTML hasil build + CSS + JS
  B->>LS: baca pintas:v1:modul
  LS-->>B: status modul (belum/sedang/selesai)
  B-->>P: render lapis 1 + badge status
  P->>B: klik "Lapis 2"
  B-->>P: buka <details> (tanpa permintaan jaringan)
```

Catatan: tidak ada query DB saat membuka modul. DB hanya dipakai untuk kuis dan solusi.

## 2. Mengambil soal kuis

```mermaid
sequenceDiagram
  autonumber
  actor P as Pembelajar
  participant B as Browser
  participant A as Route /api/kuis/[slug]
  participant D as Prisma + SQLite

  P->>B: gulir ke bagian kuis
  B->>A: GET /api/kuis/03-embedding
  A->>A: validasi slug (pola ^[a-z0-9-]+$)
  A->>D: SELECT Soal + Opsi WHERE modulSlug = ?
  D-->>A: baris soal (termasuk kolom jawaban)
  A->>A: buang kolom jawaban & penjelasan dari payload
  A-->>B: [{id, tipe, pertanyaan, opsi[]}]
  B-->>P: render soal tanpa kunci
```

## 3. Menjawab satu soal

```mermaid
sequenceDiagram
  autonumber
  actor P as Pembelajar
  participant B as Browser
  participant A as Route /jawab
  participant G as lib/quiz/grade
  participant D as Prisma + SQLite
  participant LS as localStorage

  P->>B: pilih opsi / ketik jawaban, tekan "Periksa"
  B->>A: POST {soal_id, jawaban}
  A->>A: validasi Zod (soal_id int, jawaban <= 500 char)
  A->>A: rate limit 20/menit/IP
  A->>D: SELECT Soal WHERE id = ?
  D-->>A: {tipe, jawaban, penjelasan}
  A->>G: grade(tipe, jawaban_user, jawaban_benar)
  G-->>A: benar: boolean
  A-->>B: {benar, jawaban_benar, penjelasan}
  B->>LS: simpan hasil soal + skor sementara
  B-->>P: benar/salah + penjelasan
```

## 4. Menjalankan latihan web

```mermaid
sequenceDiagram
  autonumber
  actor P as Pembelajar
  participant B as Browser
  participant A as Route /api/latihan/jalankan
  participant GW as lib/runner/gateway
  participant PV as provider.wandbox
  participant W as Wandbox API
  participant D as Prisma + SQLite

  P->>B: tekan "Jalankan"
  B->>A: POST {latihan_id, bahasa, kode}
  A->>A: validasi Zod + allowlist + ukuran <= 64 KB
  A->>A: rate limit 20/menit/IP
  A->>GW: run({bahasa, kode, output_harapan})
  GW->>PV: execute(...)
  PV->>W: POST /api/compile.json (timeout 15 s)
  W-->>PV: {status, program_output, program_error, compiler_error}
  PV-->>GW: hasil mentah
  GW->>GW: normalisasi stdout/stderr, bandingkan output_harapan
  GW->>D: INSERT LogLatihan (tanpa isi kode)
  GW-->>A: {status, stdout, stderr, exit_code, durasi_ms}
  A-->>B: hasil
  B-->>P: verdict + output
```

Alur gagal penting:
- Timeout → `GW` mengembalikan `status: error`, kode 504. Browser menampilkan pesan, bukan menggantung.
- Penyedia down → `status: error`, kode 502, pesan penyedia diteruskan apa adanya.

## 5. Melihat solusi latihan

```mermaid
sequenceDiagram
  autonumber
  actor P as Pembelajar
  participant B as Browser
  participant A as Route /api/latihan/[id]/solusi
  participant D as Prisma + SQLite
  participant L as Log server

  P->>B: klik "Lihat solusi"
  B->>A: GET /api/latihan/ai-llm-03-latihan-1/solusi
  A->>A: rate limit
  A->>D: SELECT kode, catatan WHERE latihanId = ? AND bahasa = ?
  D-->>A: kode solusi
  A->>L: catat permintaan solusi (id, bahasa, waktu)
  A-->>B: {kode, catatan}
  B-->>P: tampilkan solusi + penjelasan
```

Catatan: solusi sengaja tidak ada di payload halaman agar pembaca mencoba dulu. Ini bukan pengamanan keras — orang tetap bisa memintanya. Tujuannya mencegah godaan, bukan mencegah akses.

## 6. Build dan deploy

```mermaid
sequenceDiagram
  autonumber
  participant Dev as Penulis
  participant G as Git
  participant CI as Build/CI
  participant V as lib/content/validate
  participant DB as SQLite
  participant Out as Artefak statis

  Dev->>G: commit content/**.md
  G->>CI: trigger build
  CI->>V: validateContent()
  V-->>CI: ok / errors[]
  alt ada error
    CI-->>Dev: build gagal + daftar error (file:field)
  else valid
    CI->>CI: render Markdown, bangun search-index.json
    CI->>DB: prisma migrate deploy + seed soal/solusi
    DB-->>CI: seed ok
    CI->>Out: tulis halaman statis
    Out-->>Dev: siap deploy
  end
```

## 7. Impor progres

```mermaid
sequenceDiagram
  autonumber
  actor P as Pembelajar
  participant B as Browser
  participant S as lib/progress/schema
  participant LS as localStorage

  P->>B: pilih berkas JSON
  B->>S: parse + validasi skema
  alt tidak valid
    S-->>B: {ok: false, alasan}
    B-->>P: tolak, data lama utuh
  else valid
    S-->>B: {ok: true, data}
    B-->>P: konfirmasi "data sekarang akan diganti"
    P->>B: setuju
    B->>LS: tulis semua kunci pintas:v1:*
    LS-->>B: ok
    B-->>P: progres diperbarui
  end
```
