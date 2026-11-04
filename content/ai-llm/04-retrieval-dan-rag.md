---
track: ai-llm
nomor: 4
judul: "Retrieval dan RAG: memberi model dokumen yang tepat"
slug: retrieval-dan-rag
estimasi_menit: 11
prasyarat: ["ai-llm/embedding"]
latihan:
  - id: ai-llm-04-latihan-1
    jenis: web
    bahasa: python
    soal: "Tiga chunk dan satu kueri sudah disiapkan. Hitung skor tiap chunk = jumlah kata kueri yang muncul di chunk itu, lalu cetak indeks chunk terbaik dan skornya dengan format indeks:skor."
    kode_awal: |
      kueri = "cara reset password akun"
      chunk = [
          "cara mengganti password akun yang lupa",
          "cara memasak nasi goreng spesial",
          "reset akun lewat verifikasi email",
      ]

      # hitung skor tiap chunk lalu cetak chunk terbaik
    output_harapan: |
      0:3
    solusi: |
      kueri = "cara reset password akun"
      chunk = [
          "cara mengganti password akun yang lupa",
          "cara memasak nasi goreng spesial",
          "reset akun lewat verifikasi email",
      ]

      kata_kueri = set(kueri.split())
      skor = [len(kata_kueri & set(c.split())) for c in chunk]
      terbaik = max(range(len(skor)), key=lambda i: skor[i])
      print(f"{terbaik}:{skor[terbaik]}")
    catatan_solusi: "Chunk 0 memuat cara, password, akun (3 kata); chunk 2 hanya reset, akun (2). max() mengembalikan indeks pertama yang skornya tertinggi, jadi seri tidak pernah menghasilkan dua jawaban."
  - id: ai-llm-04-latihan-2
    jenis: laptop
    soal: "Bangun indeks pencarian teks penuh (full-text) dengan SQLite FTS5 — lapisan lexical retrieval yang dipakai sebelum vektor."
    kebutuhan:
      - "Python 3.10 atau lebih baru (modul sqlite3 sudah ikut)"
      - "Terminal (PowerShell / bash)"
    langkah:
      - perintah: "mkdir rag-lokal && cd rag-lokal"
        penjelasan: "Membuat folder kerja supaya rag.db tidak tercampur berkas lain."
      - perintah: 'python -c "import sqlite3; c=sqlite3.connect(\"rag.db\"); c.execute(\"CREATE VIRTUAL TABLE chunk USING fts5(isi)\"); c.commit(); print(\"tabel siap\")"'
        penjelasan: "Membuat tabel virtual FTS5 — SQLite membangun indeks kata otomatis, tanpa layanan tambahan."
      - perintah: 'python -c "import sqlite3; c=sqlite3.connect(\"rag.db\"); c.executemany(\"INSERT INTO chunk(isi) VALUES (?)\", [(\"cara reset password akun yang lupa\",), (\"cara memasak nasi goreng spesial\",), (\"reset akun lewat verifikasi email\",)]); c.commit(); print(c.execute(\"SELECT count(*) FROM chunk\").fetchone()[0])"'
        penjelasan: "Mengisi tiga chunk dan mencetak jumlah baris sebagai bukti data masuk."
      - perintah: 'python -c "import sqlite3; c=sqlite3.connect(\"rag.db\"); [print(r[0]) for r in c.execute(\"SELECT isi FROM chunk WHERE chunk MATCH ? ORDER BY rank\", (\"password\",))]"'
        penjelasan: "Mencari kata password; ORDER BY rank mengurutkan dari yang paling relevan menurut BM25."
      - perintah: 'python -c "import sqlite3; c=sqlite3.connect(\"rag.db\"); [print(r[0]) for r in c.execute(\"SELECT isi FROM chunk WHERE chunk MATCH ? ORDER BY rank\", (\"akun\",))]"'
        penjelasan: "Mencari kata akun yang muncul di dua chunk — inilah bentuk hasil retrieval yang nanti dimasukkan ke prompt."
    hasil: |
      tabel siap
      3
      cara reset password akun yang lupa
      reset akun lewat verifikasi email
      cara reset password akun yang lupa
    cek_berhasil:
      - "Tabel dibuat tanpa error dan jumlah baris 3"
      - "Kueri password mengembalikan tepat satu baris"
      - "Kueri akun mengembalikan dua baris (urutannya bisa berbeda antar versi SQLite)"
    kalau_gagal:
      - error: "sqlite3.OperationalError: no such module: fts5"
        arti: "Modul SQLite yang dipakai tidak dibangun dengan dukungan FTS5."
        perbaikan:
          - "Cek dengan python -c \"import sqlite3; print(sqlite3.sqlite_version)\" — versi 3.9+ hampir selalu punya FTS5"
          - "Pasang Python resmi dari python.org (build-nya menyertakan FTS5)"
          - "Alternatif sementara: pakai tabel biasa + LIKE '%kata%' (lambat, tapi cukup untuk latihan)"
      - error: "sqlite3.OperationalError: no such table: chunk"
        arti: "Perintah INSERT/SELECT dijalankan pada database yang tabelnya belum dibuat."
        perbaikan:
          - "Jalankan ulang langkah 2 di folder yang sama"
          - "Pastikan tidak ada rag.db lain — cek dengan ls -l rag.db"
      - error: "sqlite3.OperationalError: unable to open database file"
        arti: "Folder kerja tidak bisa ditulisi, atau path salah."
        perbaikan:
          - "Pastikan sudah cd rag-lokal"
          - "Hindari menjalankan dari folder yang dilindungi (Program Files)"
      - error: "SyntaxError: unexpected character after line continuation character"
        arti: "Kutip di dalam perintah bentrok dengan kutip shell (umum di PowerShell)."
        perbaikan:
          - "Jalankan di git-bash seperti contoh, atau"
          - "Tulis perintahnya ke berkas rag.py lalu jalankan python rag.py"
    buktikan:
      perubahan: "Ubah kueri jadi \"nasi\" pada perintah SELECT terakhir."
      hasil_diharapkan: "Hanya satu baris muncul: cara memasak nasi goreng spesial."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Dalam alur RAG, apa yang terjadi sebelum model dipanggil?"
    opsi:
      a: "Dokumen dipotong jadi chunk, di-embed, lalu disimpan di indeks"
      b: "Model di-fine-tune dengan dokumen tersebut"
      c: "Seluruh dokumen disalin ke dalam prompt sistem"
    jawaban: a
    penjelasan: "RAG memisahkan pekerjaan mencari dari pekerjaan menjawab. Pencarian butuh indeks yang dibangun lebih dulu; tanpa itu tidak ada yang bisa diambil saat pengguna bertanya."
    tingkat: dasar
  - tipe: isian_singkat
    pertanyaan: "Parameter yang menentukan berapa banyak chunk teratas yang dimasukkan ke prompt disebut apa?"
    jawaban: "top_k"
    penjelasan: "top_k mengatur jumlah chunk yang diambil. Terlalu kecil membuat jawaban kehilangan konteks; terlalu besar memenuhi prompt dengan hal tak relevan dan menaikkan biaya."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Dokumen yang benar ada di indeks, tetapi tidak muncul di hasil pencarian. Metrik apa yang mengukur kegagalan ini?"
    opsi:
      a: "Precision"
      b: "Recall"
      c: "Latency"
      d: "Throughput"
    jawaban: b
    penjelasan: "Recall mengukur berapa banyak dokumen relevan yang berhasil diambil. Precision mengukur berapa banyak hasil yang diambil benar-benar relevan — dua masalah berbeda dengan perbaikan berbeda."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Pencarian yang menggabungkan pencarian kata kunci (BM25) dengan pencarian vektor disebut pencarian apa?"
    jawaban: "hybrid"
    penjelasan: "Pencarian hybrid menutup kelemahan masing-masing: BM25 unggul untuk nama diri, kode, dan angka yang tidak punya kemiripan makna; vektor unggul untuk parafrase."
    tingkat: menengah
---

# Retrieval dan RAG: memberi model dokumen yang tepat

Kamu akan bisa:
- Menjelaskan empat langkah RAG dan apa yang rusak kalau satu langkah salah.
- Menghitung skor relevansi chunk secara sederhana dan memilih yang terbaik.
- Membedakan masalah recall dan precision saat pencarian tidak menemukan jawaban.

Prasyarat: [modul 03 — embedding](/modul/ai-llm/embedding). RAG memakai vektor, tapi bukan hanya vektor.

## Model tidak tahu isi dokumenmu

Model hanya tahu apa yang ada di data latihannya. Kalau kamu bertanya "berapa lama pengembalian dana di perusahaan kami", jawabannya tidak ada di sana. Model tetap menjawab — dengan tebakan yang terdengar yakin.

RAG (Retrieval-Augmented Generation) menyelesaikan ini tanpa melatih ulang model: cari dulu potongan dokumen yang relevan, lalu suruh model menjawab **hanya** dari potongan itu.

## Empat langkah RAG

1. **Index** — dokumen dipotong jadi chunk, diubah jadi vektor, disimpan bersama teks aslinya.
2. **Retrieve** — pertanyaan pengguna dicari ke indeks; ambil `top_k` chunk teratas.
3. **Augment** — chunk itu ditempel ke prompt sebagai konteks, dengan instruksi menjawab hanya dari konteks.
4. **Generate** — model menulis jawaban, idealnya menyebut chunk mana yang dipakai.

Langkah 2 adalah yang paling menentukan. Kalau chunk yang diambil salah, langkah 4 tidak bisa menyelamatkannya.

```python
kueri = "cara reset password akun"
chunk = [
    "cara mengganti password akun yang lupa",
    "cara memasak nasi goreng spesial",
    "reset akun lewat verifikasi email",
]

kata_kueri = set(kueri.split())
skor = [len(kata_kueri & set(c.split())) for c in chunk]
terbaik = max(range(len(skor)), key=lambda i: skor[i])
print(f"{terbaik}:{skor[terbaik]}")
```

**Output yang diharapkan**

```
0:3
```

Baris demi baris:
- `set(kueri.split())` — kata unik kueri: `cara`, `reset`, `password`, `akun`.
- `kata_kueri & set(c.split())` — irisan; hasilnya kata yang muncul di kueri **dan** di chunk.
- `len(...)` — skor chunk = jumlah kata yang cocok. Chunk 0 dapat 3 (`cara`, `password`, `akun`), chunk 2 dapat 2 (`reset`, `akun`).
- `max(..., key=...)` — memilih indeks dengan skor tertinggi; pada skor seri, indeks terkecil menang, jadi hasilnya selalu satu.
- `f"{terbaik}:{skor[terbaik]}"` — `0:3`: chunk pertama, tiga kata cocok.

Perhatikan kelemahannya: chunk 0 menang meski tidak memuat kata `reset`, dan chunk 2 yang justru membahas reset kalah. Pencocokan kata tidak tahu bahwa "mengganti" dan "reset" itu maksudnya sama.

## Kenapa hasil pencarian menentukan segalanya

Tiga kegagalan RAG yang sering disalahkan pada model, padahal asalnya di retrieval:

| Gejala | Penyebab sebenarnya |
|---|---|
| "Model bilang tidak tahu" | Chunk relevan tidak terambil (masalah recall) |
| Jawaban benar tapi setengah | Chunk terpotong di tengah penjelasan |
| Jawaban membahas topik lain | Chunk terambil tapi tidak relevan (masalah precision) |

## Di pekerjaan, ini dipakai untuk apa

Hampir semua fitur "tanya dokumen internal", "chatbot CS dari FAQ", dan "asisten kode dari repo sendiri" adalah RAG. Yang dikerjakan sehari-hari bukan menulis prompt, tapi memperbaiki retrieval: chunk lebih rapi, metadata lebih lengkap, tambah reranker.

## Lapis 2

### Parameter yang menentukan mutu retrieval

| Parameter | Nilai awal wajar | Bila terlalu kecil | Bila terlalu besar |
|---|---|---|---|
| `top_k` | 3–5 | Konteks kurang, jawaban menggantung | Prompt penuh sampah, biaya naik |
| Ukuran chunk | 300–800 token | Jawaban terpotong, konteks hilang | Satu chunk banyak topik, skor jadi kabur |
| Overlap | 10–20% | Kalimat terbelah di batas chunk | Duplikat di hasil, biaya embedding naik |
| Ambang skor | 0,7 (tergantung model) | Chunk sampah ikut masuk | Chunk relevan ikut dibuang |
| Bobot hybrid | 0,5 BM25 / 0,5 vektor | Salah satu sinyal hilang | Sinyal lemah mendominasi |

### Kenapa begini, bukan begitu

Alternatif "taruh seluruh dokumen di prompt" ditolak bukan karena mustahil — context window besar memang muat — tapi karena biaya per pertanyaan naik puluhan kali dan model makin mudah melewatkan bagian tengah dokumen panjang. RAG menerima konsekuensi lain: mutu jawaban sekarang bergantung pada dua hal yang harus **diukur** (recall dan precision), bukan dirasakan.

Itu sebabnya sistem RAG serius menyimpan set pertanyaan uji: 20–50 pertanyaan dengan jawaban yang diketahui. Setiap perubahan chunking atau `top_k` diuji ulang ke set itu. Tanpa set uji, "terasa lebih baik" adalah satu-satunya metrik — dan itu bukan metrik.

### Error umum

| Pesan / gejala | Arti | Cara memperbaiki |
|---|---|---|
| Hasil pencarian selalu kosong | Kueri dan indeks memakai model embedding berbeda, atau indeks belum diisi | Satu indeks = satu model; cek jumlah baris di indeks |
| Jawaban mengabaikan konteks | Instruksi tidak tegas, atau konteks ditaruh sebelum instruksi | Taruh instruksi "jawab hanya dari konteks di bawah" setelah konteks, dan minta model menyebut sumber |
| `no such column: rank` (SQLite) | `rank` hanya ada pada tabel FTS5, bukan tabel biasa | Pakai `CREATE VIRTUAL TABLE ... USING fts5(...)` |
| Jawaban beda tiap kali ditanya | Suhu model terlalu tinggi untuk tugas retrieval | Turunkan `temperature` ke 0–0,2 untuk jawaban berbasis dokumen |
| Konteks saling bertentangan | Dua chunk dari versi dokumen berbeda ikut terambil | Simpan metadata versi/tanggal di chunk, filter saat retrieve |

### Rujukan resmi

- Lewis dkk. — paper asli RAG: <https://arxiv.org/abs/2005.11401>
- SQLite — dokumentasi FTS5: <https://sqlite.org/fts5.html>
- Anthropic — contextual retrieval: <https://www.anthropic.com/news/contextual-retrieval>

## Latihan

Latihan 1 di web: hitung skor relevansi dengan tangan — setelah ini, "retrieval" berhenti jadi kotak hitam. Latihan 2 di laptop: bangun indeks full-text FTS5 dan lihat sendiri bahwa BM25 mengurutkan hasil tanpa satu pun vektor.

## Kamu sudah bisa ini kalau…

- [ ] Bisa menyebut empat langkah RAG dan menunjuk langkah mana yang paling menentukan mutu.
- [ ] Bisa menjelaskan kenapa chunk dengan kata cocok terbanyak belum tentu chunk yang benar.
- [ ] Bisa membedakan gejala recall dan precision dari jawaban yang salah.
- [ ] Latihan 1 lulus dan latihan 2 berhasil dijalankan.
