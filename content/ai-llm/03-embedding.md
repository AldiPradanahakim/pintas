---
track: ai-llm
nomor: 3
judul: "Embedding: mengubah teks jadi angka yang bisa dibandingkan"
slug: embedding
estimasi_menit: 10
prasyarat: ["ai-llm/apa-itu-llm", "ai-llm/token-dan-konteks"]
latihan:
  - id: ai-llm-03-latihan-1
    jenis: web
    bahasa: python
    soal: "Dua vektor 3 dimensi: a = [1, 2, 3] dan b = [1, 2, 3]. Hitung kemiripan kosinusnya (dot product dibagi hasil kali panjang vektor) dan cetak dengan 4 angka desimal."
    kode_awal: |
      import math

      a = [1, 2, 3]
      b = [1, 2, 3]

      # hitung kemiripan kosinus di sini
    output_harapan: |
      1.0000
    solusi: |
      import math

      a = [1, 2, 3]
      b = [1, 2, 3]

      dot = sum(x * y for x, y in zip(a, b))
      panjang_a = math.sqrt(sum(x * x for x in a))
      panjang_b = math.sqrt(sum(y * y for y in b))
      print(f"{dot / (panjang_a * panjang_b):.4f}")
    catatan_solusi: "Dua vektor identik selalu punya kosinus 1.0 — sudut 0 derajat, arah sama persis."
  - id: ai-llm-03-latihan-2
    jenis: laptop
    soal: "Jalankan pencarian kemiripan sederhana di SQLite tanpa layanan vektor."
    kebutuhan:
      - "SQLite 3.40 atau lebih baru (bawaan Python 3.11+ sudah cukup)"
      - "Terminal (PowerShell / bash)"
    langkah:
      - perintah: "sqlite3 --version"
        penjelasan: "Memastikan SQLite tersedia."
      - perintah: 'sqlite3 latihan.db "CREATE TABLE dok(id INTEGER PRIMARY KEY, teks TEXT); INSERT INTO dok(teks) VALUES (\"cara memasak nasi\"), (\"cara membuat kopi\"); SELECT * FROM dok;"'
        penjelasan: "Membuat tabel kecil dan mengisinya, lalu membacanya kembali."
    hasil: |
      3.4x.x ...
      1|cara memasak nasi
      2|cara membuat kopi
    cek_berhasil:
      - "sqlite3 --version mencetak 3.40 atau lebih baru"
      - "Dua baris dokumen muncul"
    kalau_gagal:
      - error: "sqlite3: command not found"
        arti: "SQLite CLI tidak terpasang (Python biasanya membawa modulnya, bukan programnya)."
        perbaikan:
          - "Windows: unduh sqlite-tools dari sqlite.org/download.html, taruh sqlite3.exe di PATH"
          - "macOS: brew install sqlite"
          - "Linux: sudo apt install sqlite3"
      - error: "Error: in prepare, no such table: dok"
        arti: "Perintah SELECT dijalankan pada database yang belum punya tabel."
        perbaikan:
          - "Jalankan seluruh perintah dalam satu tanda kutip seperti contoh, atau"
          - "Buka sqlite3 latihan.db lalu tempel perintahnya satu per satu"
      - error: "Parse error near \"(\""
        arti: "Kutip ganda di dalam perintah bentrok dengan kutip shell."
        perbaikan:
          - "Gunakan kutip tunggal di luar dan kutip ganda di dalam, seperti contoh"
    buktikan:
      perubahan: "Tambahkan satu dokumen ketiga tentang \"cara menyeduh teh\", lalu tampilkan semua baris."
      hasil_diharapkan: "Tiga baris muncul, id 3 berisi dokumen baru."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Apa fungsi utama embedding dalam sistem RAG?"
    opsi:
      a: "Mengubah teks menjadi vektor angka agar kemiripan makna bisa dihitung"
      b: "Meringkas dokumen panjang menjadi satu paragraf"
      c: "Mengompres gambar agar hemat penyimpanan"
    jawaban: a
    penjelasan: "Embedding memetakan teks ke vektor; teks bermakna mirip menghasilkan vektor yang berdekatan, sehingga pencarian bisa dilakukan dengan jarak, bukan kecocokan kata."
    tingkat: dasar
  - tipe: isian_singkat
    pertanyaan: "Ukuran kemiripan yang membandingkan sudut dua vektor (bukan panjangnya) disebut kemiripan apa?"
    jawaban: "kosinus"
    penjelasan: "Kemiripan kosinus mengabaikan panjang vektor dan hanya melihat arahnya, sehingga dokumen panjang tidak otomatis menang hanya karena lebih panjang."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa potongan dokumen (chunk) perlu dibuat dengan tumpang tindih (overlap)?"
    opsi:
      a: "Agar penyimpanan lebih hemat"
      b: "Agar kalimat yang terpotong di batas chunk tetap utuh di salah satu chunk"
      c: "Agar model berjalan lebih cepat"
      d: "Agar biaya embedding lebih murah"
    jawaban: b
    penjelasan: "Tanpa overlap, satu kalimat bisa terbelah di antara dua chunk dan tidak pernah utuh di hasil pencarian. Overlap kecil (10–20%) menutup celah itu."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Singkatan sistem yang mengambil dokumen relevan dulu, lalu memasukkannya ke prompt sebelum model menjawab?"
    jawaban: "rag"
    penjelasan: "RAG (Retrieval-Augmented Generation) memisahkan 'mencari sumber' dari 'menulis jawaban', sehingga jawaban bisa dilacak ke dokumen aslinya."
    tingkat: dasar
---

# Embedding: mengubah teks jadi angka yang bisa dibandingkan

Kamu akan bisa:
- Menjelaskan apa yang dilakukan embedding dan kenapa ia dipakai untuk mencari, bukan untuk menjawab.
- Menghitung kemiripan kosinus dua vektor dengan tangan.
- Menjelaskan kenapa chunk perlu tumpang tindih.

## Mencari dengan makna, bukan dengan kata

Pencarian biasa mencocokkan kata. Kalau pengguna mengetik "cara bikin kopi", dokumen berjudul "menyeduh espresso" tidak akan ketemu — tidak ada satu kata pun yang sama.

Embedding mengubah setiap teks menjadi vektor angka. Teks yang maknanya mirip menghasilkan vektor yang arahnya berdekatan. Pencarian lalu dilakukan dengan mengukur sudut antar-vektor, bukan kecocokan huruf.

```python
import math

a = [1, 2, 3]
b = [1, 2, 3]

dot = sum(x * y for x, y in zip(a, b))
panjang_a = math.sqrt(sum(x * x for x in a))
panjang_b = math.sqrt(sum(y * y for y in b))
print(f"{dot / (panjang_a * panjang_b):.4f}")
```

**Output yang diharapkan**

```
1.0000
```

Baris demi baris:
- `zip(a, b)` — memasangkan elemen pada posisi yang sama, supaya tiap pasangan bisa dikalikan.
- `dot` — hasil kali titik; makin besar, makin searah kedua vektor.
- `panjang_a`, `panjang_b` — panjang (norma) masing-masing vektor; membaginya menghapus pengaruh panjang.
- `f"{...:.4f}"` — format 4 desimal, supaya hasilnya mudah dibandingkan mata.
- Dua vektor identik menghasilkan 1,0000: sudut 0°, arah sama persis.

Nilai kosinus selalu antara -1 dan 1. Di ruang embedding teks nyata, nilainya biasanya sempit di 0,6–0,9 — yang penting adalah urutannya, bukan angka mutlaknya.

## Chunking: memotong tanpa merusak makna

Satu dokumen utuh biasanya terlalu panjang untuk di-embed dan terlalu umum untuk dicari. Dokumen dipotong menjadi chunk 300–800 token.

Jebakan utamanya: potongan tepat di tengah kalimat. Karena itu chunk dibuat tumpang tindih 10–20% dengan chunk sebelumnya — kalimat yang terbelah tetap utuh di salah satunya.

## Di pekerjaan, ini dipakai untuk apa

Membangun pencarian dokumen internal, FAQ, dan basis pengetahuan — tempat jawaban sudah ada di dokumen perusahaan, dan yang dibutuhkan hanyalah menemukannya.

## Lapis 2

### Pilihan ukuran dan strategi

| Parameter | Nilai awal yang wajar | Efek bila terlalu kecil | Efek bila terlalu besar |
|---|---|---|---|
| Ukuran chunk | 300–800 token | Konteks hilang, jawaban terpotong | Satu chunk memuat banyak topik, pencarian jadi kabur |
| Overlap | 10–20% | Kalimat terbelah | Penyimpanan & biaya embedding naik tanpa manfaat |
| `top_k` | 3–5 | Jawaban tidak ketemu | Prompt penuh hal tak relevan, biaya naik |
| Ambang skor | 0,7 (tergantung model) | Hasil sampah ikut masuk | Hasil relevan ikut terbuang |

### Kenapa begini, bukan begitu

Alternatif "kirim seluruh dokumen ke model, biar model yang mencari" ditolak karena context window terbatas dan biaya per pertanyaan meledak. Konsekuensinya diterima: kualitas jawaban sekarang bergantung pada kualitas pemotongan dan pencarian — dua hal yang harus diukur, bukan ditebak.

### Error umum

| Pesan | Arti | Cara memperbaiki |
|---|---|---|
| `expected 1536 dimensions, got 3072` | Vektor dari model embedding berbeda dicampur di satu indeks | Satu indeks = satu model. Bangun ulang indeks bila ganti model |
| Hasil pencarian selalu dokumen yang sama | Chunk terlalu besar atau terlalu umum | Perkecil chunk, tambah metadata (judul bagian) ke teks chunk |
| `413 Payload Too Large` saat embed | Batch chunk melebihi batas penyedia | Kirim per 100 chunk, bukan sekaligus |
| Skor tinggi tapi jawaban salah | Kemiripan kata, bukan kemiripan makna | Tambahkan reranker, atau sertakan judul bagian di teks yang di-embed |

### Rujukan resmi

- [OI] — panduan embedding: <https://platform.openai.com/docs/guides/embeddings>
- Anthropic — contextual retrieval: <https://www.anthropic.com/news/contextual-retrieval>

## Latihan

Latihan 1 di web: hitung kemiripan kosinus dengan tangan — setelah ini, semua library vektor terasa jauh lebih jelas. Latihan 2 di laptop: jalankan pencarian sederhana di SQLite, tanpa layanan vektor apa pun.

## Kamu sudah bisa ini kalau…

- [ ] Bisa menjelaskan kenapa "cara bikin kopi" bisa menemukan "menyeduh espresso".
- [ ] Bisa menyebut satu akibat chunk terlalu besar dan satu akibat terlalu kecil.
- [ ] Latihan 1 lulus dan latihan 2 berhasil dijalankan.
