---
track: ai-llm
nomor: 6
judul: "Vector database: menyimpan jutaan vektor dan tetap cepat"
slug: vector-database
estimasi_menit: 12
prasyarat: ["ai-llm/embedding", "ai-llm/chunking"]
latihan:
  - id: ai-llm-06-latihan-1
    jenis: web
    bahasa: python
    soal: "Satu kueri dan empat dokumen (masing-masing vektor 2 dimensi) tersedia. Hitung cosine similarity kueri dengan tiap dokumen, lalu cetak tiga hasil teratas urut skor tertinggi dengan format indeks:skor, skor dua angka desimal."
    kode_awal: |
      kueri = [1.0, 1.0]
      dokumen = [
          [0.2, 1.0],
          [0.9, 1.4],
          [-1.0, 0.4],
          [0.5, 0.5],
      ]

      # hitung cosine similarity, urutkan, cetak tiga teratas
    output_harapan: |
      3:1.00
      1:0.98
      0:0.83
    solusi: |
      kueri = [1.0, 1.0]
      dokumen = [
          [0.2, 1.0],
          [0.9, 1.4],
          [-1.0, 0.4],
          [0.5, 0.5],
      ]

      def cosine(a, b):
          atas = sum(x * y for x, y in zip(a, b))
          bawah = (sum(x * x for x in a) ** 0.5) * (sum(y * y for y in b) ** 0.5)
          return atas / bawah

      skor = sorted(((cosine(kueri, d), i) for i, d in enumerate(dokumen)), reverse=True)
      for s, i in skor[:3]:
          print(f"{i}:{s:.2f}")
    catatan_solusi: "Dokumen 3 arahnya persis sama dengan kueri, jadi skornya 1.00 — panjang vektor tidak berpengaruh karena cosine membagi dengan panjang keduanya. Dokumen 2 arahnya berlawanan, skornya negatif (-0.39), dan karena itu tidak pernah muncul di tiga teratas."
  - id: ai-llm-06-latihan-2
    jenis: laptop
    soal: "Simpan vektor di SQLite lalu ukur sendiri kenapa penyimpanan tanpa indeks tidak bisa dipakai di produksi: setiap pertanyaan memaksa SQLite membaca semua baris."
    kebutuhan:
      - "Python 3.10 atau lebih baru (modul sqlite3 sudah termasuk)"
      - "Terminal (PowerShell / bash)"
    langkah:
      - perintah: "mkdir vektor-lokal && cd vektor-lokal"
        penjelasan: "Folder kerja supaya berkas latihan tidak tercampur dengan proyek lain."
      - perintah: "python -c \"import sqlite3; db=sqlite3.connect('vektor.db'); db.execute('create table vektor (id integer primary key, isi text, vec text)'); db.executemany('insert into vektor (isi, vec) values (?,?)', [('reset password lewat email','[1.0,0.0]'),('cara masak nasi goreng','[0.0,1.0]'),('ganti kata sandi akun','[0.9,0.1]')]); db.commit(); print(db.execute('select count(*) from vektor').fetchone()[0])\""
        penjelasan: "Membuat tabel dan mengisi tiga vektor 2 dimensi. Vektor disimpan sebagai teks JSON karena SQLite tidak punya tipe vektor bawaan."
      - perintah: "python -c \"import sqlite3, json, math; db=sqlite3.connect('vektor.db'); q=[1.0, 0.0]; cos=lambda a, b: sum(x*y for x, y in zip(a, b)) / (math.sqrt(sum(x*x for x in a)) * math.sqrt(sum(y*y for y in b))); baris=sorted(((cos(q, json.loads(v)), t) for t, v in db.execute('select isi, vec from vektor')), reverse=True); [print(f'{t} -> {s:.2f}') for s, t in baris]\""
        penjelasan: "Membaca semua baris, menghitung cosine di Python, mengurutkan, lalu mencetak isi beserta skornya. Ini bentuk paling sederhana dari vector search — dan persis yang dilakukan database sebelum ada indeks ANN."
      - perintah: "python -c \"import sqlite3; db=sqlite3.connect('vektor.db'); print(db.execute('explain query plan select isi, vec from vektor').fetchall()[0][3])\""
        penjelasan: "Meminta rencana eksekusi SQLite. Kalau hasilnya SCAN (bukan SEARCH), tidak ada indeks yang dipakai: seluruh tabel dibaca."
    hasil: |
      3
      reset password lewat email -> 1.00
      ganti kata sandi akun -> 0.99
      cara masak nasi goreng -> 0.00
      SCAN vektor
    cek_berhasil:
      - "Langkah 2 mencetak 3"
      - "Langkah 3 mencetak tiga baris, yang teratas 'reset password lewat email -> 1.00'"
      - "Baris 'ganti kata sandi akun' mendapat 0.99 karena arah vektornya dekat dengan kueri, walau angkanya tidak sama persis — inilah beda mencari dengan vektor dan mencari dengan kata kunci"
      - "Langkah 4 mencetak SCAN vektor, bukan SEARCH"
    kalau_gagal:
      - error: "sqlite3.OperationalError: table vektor already exists"
        arti: "Langkah 2 dijalankan dua kali di folder yang sama."
        perbaikan:
          - "Hapus berkasnya lalu ulangi: del vektor.db (PowerShell) atau rm vektor.db (bash)"
          - "Atau ganti nama berkas di langkah 2 menjadi vektor2.db"
      - error: "FileNotFoundError: [Errno 2] No such file or directory: 'vektor.db'"
        arti: "Terminal tidak berada di folder vektor-lokal, jadi langkah 3 membuat/membuka database di tempat lain."
        perbaikan:
          - "Jalankan cd vektor-lokal lebih dulu"
          - "Cek dengan ls — vektor.db harus terlihat"
      - error: "json.decoder.JSONDecodeError: Expecting value: line 1 column 1 (char 0)"
        arti: "Kolom vec berisi teks yang bukan JSON — biasanya karena tanda kutip di dalam perintah rusak saat disalin."
        perbaikan:
          - "Jalankan perintah langkah 2 apa adanya di git-bash, jangan di PowerShell"
          - "Kalau tetap gagal, tulis kodenya ke berkas .py lalu jalankan python berkas.py"
      - error: "SyntaxError: unterminated string literal"
        arti: "Shell memakan tanda kutip di dalam perintah satu baris."
        perbaikan:
          - "Pakai git-bash seperti contoh"
          - "Kalau tetap gagal, tulis kode langkah 3 ke berkas cari.py lalu jalankan python cari.py"
      - error: "Langkah 4 mencetak SEARCH vektor bukan SCAN vektor"
        arti: "Kamu menambahkan indeks pada kolom lain (misalnya id), sehingga SQLite memakai indeks untuk bagian yang tidak relevan."
        perbaikan:
          - "Pastikan query-nya select isi, vec from vektor tanpa where"
          - "Hapus indeks yang tidak sengaja dibuat, lalu ulangi langkah 4"
    buktikan:
      perubahan: "Ubah kueri di langkah 3 menjadi [0.0, 1.0] lalu jalankan lagi."
      hasil_diharapkan: "Baris teratas berganti jadi 'cara masak nasi goreng -> 1.00'. Kueri yang sama sekali berbeda topik memilih dokumen yang berbeda — inilah satu-satunya pekerjaan yang dilakukan vector database sebelum penyaringan metadata."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa pencarian brute force (membandingkan kueri dengan semua vektor) tidak cukup untuk 10 juta chunk?"
    opsi:
      a: "Karena hasilnya tidak akurat"
      b: "Karena biayanya naik sebanding jumlah vektor — setiap pertanyaan membaca seluruh indeks"
      c: "Karena cosine hanya bekerja untuk vektor di bawah 1000 dimensi"
      d: "Karena database relasional tidak bisa menyimpan teks JSON"
    jawaban: b
    penjelasan: "Brute force akurat sempurna (exact search), tapi jumlah operasi naik lurus dengan jumlah vektor. Di jutaan vektor, satu pertanyaan berarti miliaran perkalian; indeks ANN menukar sedikit akurasi dengan lompatan kecepatan."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Apa yang sebenarnya ditukar saat kamu memakai indeks HNSW alih-alih pencarian exact?"
    opsi:
      a: "Kecepatan pencarian ditukar dengan sedikit penurunan recall"
      b: "Akurasi sempurna ditukar dengan penyimpanan yang lebih kecil"
      c: "Bahasa pemrograman ditukar dengan latensi jaringan"
      d: "Dimensi vektor ditukar dengan jumlah dokumen"
    jawaban: a
    penjelasan: "HNSW adalah approximate nearest neighbor: ia menelusuri graf, bukan seluruh data, jadi jauh lebih cepat tetapi bisa melewatkan tetangga terdekat yang sebenarnya. Seberapa banyak yang terlewat diukur sebagai recall@k."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Parameter HNSW yang menentukan banyaknya kandidat yang diperiksa saat pencarian (bukan saat membangun indeks) adalah…"
    jawaban: "ef_search"
    penjelasan: "ef_search dinaikkan saat query untuk memperbaiki recall dengan biaya waktu; M dan ef_construction hanya dipakai ketika indeks dibangun. Karena itu menaikkan recall tidak selalu perlu membangun ulang indeks."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Mengubah panjang vektor menjadi 1 tanpa mengubah arahnya disebut apa?"
    jawaban: "normalisasi"
    penjelasan: "Setelah normalisasi, cosine similarity dan dot product memberi urutan yang sama (dot product sama dengan cosine), sehingga perkalian titik yang jauh lebih murah bisa dipakai. Tanpa normalisasi, dokumen panjang cenderung menang hanya karena vektornya besar."
    tingkat: menengah
  - tipe: pilihan_ganda
    pertanyaan: "Setelah menambah 100 ribu chunk baru, hasil pencarian jadi buruk dan makin lambat. Penyebab paling mungkin?"
    opsi:
      a: "Temperature model perlu dinaikkan"
      b: "Indeks perlu dibangun ulang dan parameternya disesuaikan dengan jumlah data yang baru"
      c: "Metadata chunk harus dihapus"
      d: "Model embedding perlu diganti ke versi yang lebih besar"
    jawaban: b
    penjelasan: "Struktur ANN (jumlah list IVF, graf HNSW) dibentuk dari data yang ada saat indeks dibuat. Setelah data bertambah banyak, indeks lama tidak lagi mewakili sebarannya — recall turun dan query harus menelusuri lebih banyak. Bangun ulang indeks, lalu ukur lagi recall@k."
    tingkat: lanjutan
---

# Vector database: menyimpan jutaan vektor dan tetap cepat

Kamu akan bisa:
- Menghitung cosine similarity dan memilih `top_k` hasil teratas dengan benar.
- Membedakan pencarian exact (brute force) dan approximate (IVF, HNSW) serta biayanya.
- Menjelaskan kenapa normalisasi vektor dan pilihan metrik menentukan hasil pencarian.
- Membaca rencana eksekusi database untuk membuktikan sebuah query belum memakai indeks.

Prasyarat: [modul 03 — embedding](/modul/ai-llm/embedding) dan [modul 05 — chunking](/modul/ai-llm/chunking). Vektor yang sudah dibuat harus disimpan di suatu tempat, dan cara menyimpannya menentukan berapa lama pencarian berlangsung.

## Vektor tanpa tempat penyimpanan bukan indeks

Setelah embedding, kamu punya daftar pasangan: teks chunk dan vektor 1536 angka. Menyimpannya di variabel Python hanya bertahan selama proses hidup. Menyimpannya di tabel biasa membuat pencarian lambat, karena untuk satu pertanyaan database harus membaca **semua** baris — 1 juta chunk × 1536 dimensi = 1,5 miliar perkalian per pertanyaan.

Pencarian yang benar dulu dihitung seperti ini: satu fungsi, satu perulangan, satu pengurutan.

```python
kueri = [1.0, 0.0]
dokumen = [
    [1.0, 0.0],
    [0.0, 1.0],
    [0.9, 0.1],
]

def cosine(a, b):
    atas = sum(x * y for x, y in zip(a, b))
    bawah = (sum(x * x for x in a) ** 0.5) * (sum(y * y for y in b) ** 0.5)
    return atas / bawah

skor = sorted(((cosine(kueri, d), i) for i, d in enumerate(dokumen)), reverse=True)
for s, i in skor[:2]:
    print(f"{i}:{s:.2f}")
```

**Output yang diharapkan**

```
0:1.00
2:0.99
```

Baris demi baris:
- `zip(a, b)` — memasangkan angka pada posisi yang sama dari dua vektor; `sum(x * y ...)` adalah dot product.
- `(sum(x * x ...) ** 0.5)` — panjang (norm) vektor: akar dari jumlah kuadrat.
- `atas / bawah` — cosine: dot product dibagi panjang kedua vektor, hasilnya hanya soal **arah**, bukan panjang.
- `sorted(..., reverse=True)` — urut skor tertinggi dulu; `enumerate` menyimpan indeks asli supaya hasilnya bisa dilacak ke chunk.
- `skor[:2]` — inilah `top_k`: dua hasil teratas saja yang akan dikirim ke model.
- `f"{i}:{s:.2f}"` — indeks dan skor dua desimal.

Perhatikan dokumen 2: `[0.9, 0.1]` mendapat 0.99 meski angkanya berbeda dari kueri, karena arahnya hampir sama. Itu perilaku yang kita inginkan. Tapi perhatikan juga: kode ini membandingkan **semua** dokumen. Di 3 dokumen tidak terasa; di 10 juta dokumen inilah masalahnya.

## Tiga cara menyimpan, tiga tingkat kecepatan

| Cara | Cara kerja | Cocok untuk | Kelemahan |
|---|---|---|---|
| Brute force (flat) | Bandingkan kueri dengan semua vektor | < 100 ribu vektor, atau butuh akurasi 100% | Waktu naik lurus dengan jumlah data |
| IVF (inverted file) | Vektor dikelompokkan jadi beberapa list; hanya beberapa list terdekat yang dibuka | Jutaan vektor, data relatif stabil | Perlu "melatih" pembagian list; data baru bisa masuk kelompok yang salah |
| HNSW (graf) | Vektor disusun jadi graf bertingkat; pencarian menyusuri tetangga terdekat | Pencarian tercepat untuk data yang sering dibaca | Memakan RAM besar dan lambat dibangun |
| Kuantisasi (PQ/SQ) | Vektor dipadatkan jadi kode pendek | Data sangat besar, RAM terbatas | Akurasi turun; hasil teratas sering perlu dihitung ulang dengan vektor asli |

Semua cara di atas (kecuali flat) adalah **approximate**: hasilnya belum tentu tetangga terdekat yang sebenarnya. Itu bukan bug, itu harga yang dibayar untuk kecepatan. Yang perlu diukur bukan "akurat atau tidak", tapi berapa banyak tetangga benar yang berhasil diambil:

`recall@k = (jumlah dokumen relevan yang muncul di k hasil) / (jumlah dokumen relevan yang seharusnya ada)`

Jika dari 5 chunk yang benar hanya 4 yang muncul di `top_k`, recall@k = 4/5 = 0,8. Angka ini diukur pada 20–50 pertanyaan nyata, bukan dirasakan.

## Metrik harus cocok dengan model embedding

Tiga metrik yang tersedia di hampir semua vector database:

| Metrik | Menghitung | Kapan dipakai |
|---|---|---|
| Cosine | Sudut antar vektor | Model yang keluarannya tidak dinormalisasi (umum pada model teks) |
| Dot product | Panjang × sudut | Vektor yang sudah dinormalisasi, atau model yang dilatih dengan dot product |
| L2 (euclidean) | Jarak lurus antar ujung vektor | Model yang dilatih dengan L2, misalnya beberapa model gambar |

Aturan praktisnya: **ikuti metrik yang dipakai saat model itu dilatih**. Memakai L2 pada vektor yang tidak dinormalisasi membuat vektor panjang selalu terlihat "jauh", dan hasil pencarian jadi acak. Kalau ragu, normalisasi semua vektor ke panjang 1 saat menyimpan, lalu cosine dan dot product memberi urutan yang sama persis.

## Di pekerjaan, ini dipakai untuk apa

Memilih vector database adalah keputusan yang jauh lebih murah dibatalkan daripada memilih model embedding. Yang menentukan biaya produksi bukan merek databasenya, melainkan tiga angka: jumlah vektor × dimensi × ukuran tipe data. 1 juta chunk × 1536 dimensi × 4 byte ≈ 6 GB hanya untuk vektornya, sebelum indeks HNSW yang biasanya menambah 1,5–2 kali lipat. Mengetahui angka ini lebih dulu mencegah kejutan tagihan RAM.

## Lapis 2

### Parameter yang wajib kamu tahu

| Parameter | Arti | Nilai awal yang wajar | Bila terlalu kecil | Bila terlalu besar |
|---|---|---|---|---|
| `metric` | Cara mengukur kemiripan | `cosine` | Vektor tidak berskala sama jadi tidak bisa dibandingkan | — (ini pilihan, bukan angka) |
| `dim` | Jumlah angka per vektor | sesuai model (1536 / 3072) | Error saat menyimpan | Dimensi tidak boleh ditebak; harus sama dengan keluaran model |
| `M` (HNSW) | Jumlah tetangga per simpul graf | 16 | Graf terlalu jarang, recall turun | RAM dan waktu build naik tajam |
| `ef_construction` | Kandidat saat membangun graf | 100–200 | Graf buruk, recall rendah selamanya | Build lambat |
| `ef_search` | Kandidat saat query | 50–100 | Hasil teratas meleset | Query lambat |
| `nlist` (IVF) | Jumlah kelompok | ± √jumlah vektor (untuk > 1 juta vektor) | Tiap kelompok terlalu besar, sama dengan brute force | Banyak kelompok kosong, recall turun |
| `nprobe` (IVF) | Kelompok yang dibuka saat query | 1–5% dari `nlist` | Recall rendah | Mendekati brute force |

Perhatikan pembagian peran: `M` dan `ef_construction` dibekukan saat indeks dibangun; `ef_search` bisa diubah per query. Jadi menaikkan recall untuk sementara cukup dengan `ef_search` — tanpa membangun ulang apa pun.

### Kenapa begini, bukan begitu

Alternatifnya: tidak memakai vector database sama sekali, cukup menyimpan vektor di kolom JSON dan menghitung cosine di aplikasi. Untuk 5.000 chunk ini pilihan yang benar — nol infrastruktur tambahan, akurasi sempurna, dan mudah di-debug. Batas praktisnya sekitar ratusan ribu vektor: setelah itu waktu query melewati ratusan milidetik dan memori aplikasi ikut membengkak.

Konsekuensi yang diterima saat pindah ke ANN: hasil pencarian menjadi tidak deterministik antar versi indeks, dan "kenapa chunk ini tidak muncul" jadi pertanyaan yang harus dijawab dengan angka recall, bukan dengan membaca kode. Karena itu, sebelum mengganti apa pun, ukur dulu: ambil 20 pertanyaan, catat chunk benar, hitung recall@k dan latensi. Tanpa angka awal, setiap perubahan hanya terasa lebih baik.

### Error umum

| Gejala / pesan | Arti | Cara memperbaiki |
|---|---|---|
| `expected 1536 dimensions, got 3072` | Vektor disimpan dari model berbeda, atau model di-upgrade | Bangun ulang seluruh indeks dengan satu model; jangan campur |
| Hasil relevan tidak pernah muncul padahal datanya ada | Recall ANN rendah | Naikkan `ef_search` / `nprobe`, lalu ukur recall@k lagi |
| Skor selalu 1.00 untuk semua dokumen | Vektor tidak dinormalisasi lalu memakai dot product | Normalisasi saat menyimpan, atau ganti metrik ke cosine |
| Query lambat setelah menambah filter metadata | Filter diterapkan setelah pencarian, jadi database mengambil `top_k` besar dulu | Gunakan filter yang didukung indeks (pre-filter), atau tambah indeks pada kolom filter |
| Indeks HNSW butuh RAM lebih besar dari data | Graf menyimpan tetangga tiap simpul | Turunkan `M`, atau pakai kuantisasi |
| Hasil berubah drastis setelah reindex | Parameter indeks berubah atau data bertambah banyak | Bekukan parameter di konfigurasi dan catat versinya bersama indeks |

### Catatan versi

- `pgvector` mendukung HNSW sejak 0.5 dan `halfvec` (float16) sejak 0.7 — setengah RAM, penurunan akurasi kecil.
- `sqlite-vec` masih pra-1.0; API-nya bisa berubah antar versi, jadi kunci versinya di dependensi.
- Sebagian layanan (Pinecone, Qdrant Cloud) memisahkan parameter build dan query di dua endpoint berbeda; jangan tertukar.

### Rujukan resmi

- pgvector — README (HNSW, IVFFlat, operator jarak): <https://github.com/pgvector/pgvector>
- sqlite-vec — ekstensi vektor untuk SQLite: <https://github.com/asg017/sqlite-vec>
- Qdrant — konsep indexing dan pemilihan parameter: <https://qdrant.tech/documentation/concepts/indexing/>
- HNSW — makalah aslinya (Malkov & Yashunin): <https://arxiv.org/abs/1603.09320>
- SQLite — membaca `EXPLAIN QUERY PLAN`: <https://www.sqlite.org/eqp.html>
- Panduan embeddings — metrik jarak dan normalisasi vektor: <https://platform.openai.com/docs/guides/embeddings>

## Latihan

Latihan 1 di web: hitung cosine dan ambil tiga teratas — perhatikan bahwa satu dokumen bisa mendapat skor negatif dan tidak akan pernah masuk hasil. Latihan 2 di laptop: simpan vektor di SQLite, lalu buktikan lewat `EXPLAIN QUERY PLAN` bahwa tanpa indeks setiap query membaca seluruh tabel. Itu alasan vector database ada.

## Kamu sudah bisa ini kalau…

- [ ] Bisa menjelaskan kenapa brute force akurat tapi tidak cukup untuk jutaan vektor.
- [ ] Bisa menyebut beda peran `ef_construction` dan `ef_search` tanpa membuka dokumentasi.
- [ ] Bisa menghitung `recall@k` dari daftar chunk relevan dan hasil pencarian.
- [ ] Bisa menjelaskan kenapa metrik harus cocok dengan cara model dilatih.
- [ ] Latihan 1 lulus dan latihan 2 berhasil dijalankan sampai langkah `EXPLAIN QUERY PLAN`.
