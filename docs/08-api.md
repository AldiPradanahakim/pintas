# 08 — Desain API

## Pintas

Hanya **4 endpoint**. Semua yang bisa dihitung saat build tidak dibuat endpoint.
Spesifikasi mesin: `08-openapi.yaml`.

Versi 1.0 — 2026-11-05

---

## 1. Prinsip

| # | Prinsip | Alasan |
|---|---|---|
| A1 | Endpoint hanya untuk hal yang **tidak boleh** diketahui klien atau butuh proses | Kunci jawaban, solusi, eksekusi kode |
| A2 | Tidak ada autentikasi | Tidak ada akun. Pengamanan = validasi input + rate limit + allowlist |
| A3 | Semua input divalidasi Zod di server | Klien tidak dipercaya |
| A4 | Output harapan & kunci jawaban **tidak pernah** dikirim ke klien | Mencegah pemalsuan kelulusan |
| A5 | Bentuk error seragam | Klien punya satu penangan error |

## 2. Daftar endpoint

| Method | Rute | Fungsi | Rate limit |
|---|---|---|---|
| `GET` | `/api/kuis/{slug}` | Ambil soal satu modul, tanpa kunci | 60/menit/IP |
| `POST` | `/api/kuis/{slug}/jawab` | Nilai satu jawaban | 20/menit/IP |
| `POST` | `/api/latihan/jalankan` | Jalankan kode di penyedia eksekusi | 20/menit/IP |
| `GET` | `/api/latihan/{id}/solusi` | Ambil kode solusi | 10/menit/IP |
| `GET` | `/api/health` | Status layanan + DB | 60/menit/IP |

Tidak ada endpoint untuk: daftar track, daftar modul, isi modul, daftar stack, bank interview, panduan. Semuanya statis hasil build.

## 3. Bentuk umum

### 3.1 Sukses
```json
{ "ok": true, "data": { } }
```

### 3.2 Gagal
```json
{
  "ok": false,
  "error": {
    "kode": "RATE_LIMIT",
    "pesan": "Terlalu banyak permintaan. Coba lagi dalam 12 detik.",
    "detail": null
  }
}
```

### 3.3 Kode error

| Kode | HTTP | Arti | Yang harus dilakukan klien |
|---|---|---|---|
| `VALIDASI_GAGAL` | 400 | Input tidak sesuai skema | Tampilkan `detail` per field |
| `BAHASA_TIDAK_DIDUKUNG` | 400 | Bahasa di luar allowlist | Nonaktifkan pilihan bahasa itu |
| `SLUG_TIDAK_VALID` | 400 | Slug tidak cocok `^[a-z0-9-]+$` | Bug internal; laporkan |
| `SOAL_TIDAK_DITEMUKAN` | 404 | `soal_id` tidak ada untuk modul itu | Muat ulang daftar soal |
| `LATIHAN_TIDAK_DITEMUKAN` | 404 | `latihan_id` tidak dikenal | Muat ulang halaman |
| `SOLUSI_TIDAK_ADA` | 404 | Latihan ini tidak punya solusi | Sembunyikan tombol |
| `KODE_TERLALU_BESAR` | 413 | Kode > 64 KB | Tampilkan batas ukuran |
| `RATE_LIMIT` | 429 | Melebihi batas per menit | Tunggu sesuai `detail.tunggu_detik` |
| `RUNNER_GAGAL` | 502 | Penyedia eksekusi error | Tampilkan pesan penyedia |
| `RUNNER_TIMEOUT` | 504 | Eksekusi > 15 detik | Sarankan kurangi loop/input |
| `DB_GAGAL` | 500 | Query DB gagal | Tampilkan pesan umum + tautan beranda |

---

## 4. `GET /api/kuis/{slug}`

Ambil daftar soal satu modul. **Tanpa** `jawaban` dan **tanpa** `penjelasan`.

**Path:** `slug` — slug modul, pola `^[a-z0-9-]+$`, maks 100 karakter.

**Respons 200:**
```json
{
  "ok": true,
  "data": {
    "modul_slug": "03-embedding",
    "jumlah": 4,
    "soal": [
      {
        "id": 12,
        "nomor": 1,
        "tipe": "pilihan_ganda",
        "pertanyaan": "Apa fungsi utama embedding dalam sistem RAG?",
        "opsi": [
          { "kunci": "a", "teks": "Mengubah teks menjadi vektor angka" },
          { "kunci": "b", "teks": "Meringkas dokumen" },
          { "kunci": "c", "teks": "Mengompres gambar" }
        ]
      },
      {
        "id": 13,
        "nomor": 2,
        "tipe": "isian_singkat",
        "pertanyaan": "Perintah SQL untuk mengambil semua baris dari tabel users?"
      }
    ]
  }
}
```

**Kegagalan:** `400 SLUG_TIDAK_VALID`, `404` bila modul tidak punya soal, `429`.

**Catatan:** respons boleh di-cache `public, max-age=300` karena tidak mengandung rahasia.

---

## 5. `POST /api/kuis/{slug}/jawab`

**Body:**
```json
{ "soal_id": 12, "jawaban": "a" }
```

| Field | Tipe | Wajib | Aturan |
|---|---|---|---|
| `soal_id` | integer | ya | > 0 |
| `jawaban` | string | ya | 1–500 karakter setelah trim |

**Respons 200 (benar):**
```json
{
  "ok": true,
  "data": {
    "benar": true,
    "jawaban_benar": "a",
    "penjelasan": "Embedding mengubah teks menjadi vektor agar kemiripan makna bisa dihitung dengan jarak kosinus."
  }
}
```

**Respons 200 (salah):**
```json
{
  "ok": true,
  "data": {
    "benar": false,
    "jawaban_benar": "a",
    "penjelasan": "Embedding mengubah teks menjadi vektor agar kemiripan makna bisa dihitung dengan jarak kosinus."
  }
}
```

**Aturan penilaian:**

| Tipe | Aturan |
|---|---|
| `pilihan_ganda` | Bandingkan `jawaban` (lowercase, trim) dengan kunci opsi. Huruf di luar a–d → salah, bukan error. |
| `isian_singkat` | Normalisasi: trim → lowercase → rapatkan spasi beruntun → buang `;` dan `.` di ujung → bandingkan persis. Tidak ada pencocokan fuzzy. |

**Kegagalan:** `400 VALIDASI_GAGAL`, `404 SOAL_TIDAK_DITEMUKAN`, `429`.

---

## 6. `POST /api/latihan/jalankan`

**Body:**
```json
{
  "latihan_id": "ai-llm-03-latihan-1",
  "bahasa": "python",
  "kode": "print(1+1)\n"
}
```

| Field | Tipe | Wajib | Aturan |
|---|---|---|---|
| `latihan_id` | string | ya | pola `^[a-z0-9-/]+$`, maks 100 |
| `bahasa` | string | ya | harus di allowlist (lihat § 6.2) |
| `kode` | string | ya | 1 byte – 64 KB |

**Respons 200 (lulus):**
```json
{
  "ok": true,
  "data": {
    "status": "lulus",
    "stdout": "2\n",
    "stderr": "",
    "exit_code": 0,
    "durasi_ms": 412,
    "output_harapan": "2\n",
    "pesan": null
  }
}
```

**Respons 200 (gagal):**
```json
{
  "ok": true,
  "data": {
    "status": "gagal",
    "stdout": "3\n",
    "stderr": "",
    "exit_code": 0,
    "durasi_ms": 388,
    "output_harapan": "2\n",
    "pesan": "Output tidak sesuai. Periksa operator yang dipakai."
  }
}
```

**Respons 200 (error runtime):**
```json
{
  "ok": true,
  "data": {
    "status": "error",
    "stdout": "",
    "stderr": "Traceback (most recent call last):\n  ...\nZeroDivisionError: division by zero\n",
    "exit_code": 1,
    "durasi_ms": 355,
    "output_harapan": "2\n",
    "pesan": null
  }
}
```

### 6.1 Normalisasi output
1. `\r\n` → `\n`
2. Trim spasi/tab di ujung setiap baris
3. Buang baris kosong di akhir
4. Bandingkan persis dengan `output_harapan` yang sudah dinormalisasi sama
5. Bila `assert` tambahan ada, jalankan setelah perbandingan stdout

### 6.2 Allowlist bahasa (MVP)

| Kode API | Runtime di penyedia | Catatan |
|---|---|---|
| `python` | `cpython-3.12.7` | terverifikasi: `print(1+1)` → `2` |
| `javascript` | `nodejs-20.17.0` | terverifikasi |
| `typescript` | `typescript-5.6.2` | terverifikasi |
| `csharp` | `dotnetcore-6.0.425` atau `mono-6.12.0.199` | **`dotnetcore-8.0.402` gagal** (`File size limit exceeded`); satu file `Program.cs`, tanpa NuGet |
| `go` | `go-1.23.2` | terverifikasi; satu file `main.go`, tanpa modul |
| `php` | `php-8.3.12` | terverifikasi |
| `java` | `openjdk-jdk-21+35` | terverifikasi. Berkas selalu `prog.java`, jadi kelas `public` harus bernama `prog`; alternatifnya `class Main` **tanpa** `public` |
| `sql` | `sqlite-3.46.1` | terverifikasi: `create`/`insert`/`select` jalan |

Di luar daftar ini → `400 BAHASA_TIDAK_DIDUKUNG`. Bahasa tanpa dukungan penyedia **tidak boleh** dipakai untuk latihan web; wajib latihan laptop.

**Kegagalan:** `400 VALIDASI_GAGAL`, `400 BAHASA_TIDAK_DIDUKUNG`, `413 KODE_TERLALU_BESAR`, `429`, `502 RUNNER_GAGAL`, `504 RUNNER_TIMEOUT`.

---

## 7. `GET /api/latihan/{id}/solusi`

**Query:** `?bahasa=python` (opsional; default bahasa pertama latihan).

**Respons 200:**
```json
{
  "ok": true,
  "data": {
    "latihan_id": "ai-llm-03-latihan-1",
    "bahasa": "python",
    "kode": "print(1 + 1)\n",
    "catatan": "print menerima ekspresi dan menuliskan hasilnya ke stdout."
  }
}
```

**Kegagalan:** `404 SOLUSI_TIDAK_ADA`, `429`.

**Catatan:** setiap permintaan dicatat di log server (id, bahasa, waktu) — bukan untuk membatasi, untuk melihat latihan mana yang paling sering dibuka solusinya (indikasi soal terlalu sulit).

---

## 8. `GET /api/health`

```json
{ "ok": true, "data": { "status": "sehat", "db": "ok", "runner": "wandbox", "waktu": "2026-11-05T10:00:00Z" } }
```

Tidak memanggil penyedia eksekusi (agar tidak kena rate limit mereka). `runner` hanya melaporkan konfigurasi.

---

## 9. Rate limit

| Aspek | Keputusan |
|---|---|
| Algoritma | Fixed window per menit, disimpan di memori proses |
| Kunci | IP dari `x-forwarded-for` (paling kiri) atau koneksi langsung |
| Header respons | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After` |
| Kelemahan yang diterima | Reset saat proses restart; tidak akurat bila di belakang proxy bersama |

Catatan: rate limit di memori cukup untuk satu proses. Bila nanti multi-instance, pindah ke Redis — dicatat sebagai batasan, bukan dikerjakan sekarang.

---

## 10. Header dan keamanan

| Header | Nilai |
|---|---|
| `Content-Type` | `application/json; charset=utf-8` |
| `Cache-Control` | `no-store` untuk `jawab`, `jalankan`, `solusi`; `public, max-age=300` untuk `kuis`, `health` |
| `X-Content-Type-Options` | `nosniff` |
| `Content-Security-Policy` | `default-src 'self'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'` |
| CORS | Tidak diaktifkan — hanya dipakai dari origin sendiri |

Tidak ada endpoint yang menerima `multipart/form-data`, tidak ada unggahan berkas, tidak ada cookie.
