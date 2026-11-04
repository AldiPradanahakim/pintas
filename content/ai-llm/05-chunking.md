---
track: ai-llm
nomor: 5
judul: "Chunking: memotong dokumen tanpa membelah makna"
slug: chunking
estimasi_menit: 11
prasyarat: ["ai-llm/embedding", "ai-llm/retrieval-dan-rag"]
latihan:
  - id: ai-llm-05-latihan-1
    jenis: web
    bahasa: python
    soal: "Potong teks berikut dengan jendela tetap: ukuran 4 kata, tumpang tindih 1 kata. Cetak jumlah chunk di baris pertama, lalu satu chunk per baris (kata dipisah satu spasi)."
    kode_awal: |
      teks = "satu dua tiga empat lima enam tujuh delapan sembilan sepuluh"
      ukuran = 4
      overlap = 1

      # potong teks lalu cetak jumlah chunk dan isinya
    output_harapan: |
      4
      satu dua tiga empat
      empat lima enam tujuh
      tujuh delapan sembilan sepuluh
      sepuluh
    solusi: |
      teks = "satu dua tiga empat lima enam tujuh delapan sembilan sepuluh"
      ukuran = 4
      overlap = 1

      kata = teks.split()
      chunk = [" ".join(kata[i:i + ukuran]) for i in range(0, len(kata), ukuran - overlap)]
      print(len(chunk))
      for c in chunk:
          print(c)
    catatan_solusi: "Langkah maju tiap chunk = ukuran - overlap = 3 kata, jadi chunk mulai di kata ke-1, 4, 7, dan 10. Kata ke-10 sendirian jadi chunk terakhir yang isinya cuma satu kata — inilah harga tumpang tindih."
  - id: ai-llm-05-latihan-2
    jenis: laptop
    soal: "Potong dokumen markdown berdasarkan heading (section-aware), bukan berdasarkan jumlah kata — cara yang dipakai di produksi karena tiap chunk tetap utuh secara topik."
    kebutuhan:
      - "Python 3.10 atau lebih baru"
      - "Terminal (PowerShell / bash)"
      - "Satu berkas markdown kecil (dibuat di langkah 2)"
    langkah:
      - perintah: "mkdir chunk-lokal && cd chunk-lokal"
        penjelasan: "Folder kerja supaya berkas latihan tidak tercampur."
      - perintah: "python -c \"open('dokumen.md','w').write('## Reset password\\nLupa password bisa direset lewat email.\\n\\n## Pembayaran\\nPembayaran lewat transfer bank.\\n\\n## Pengiriman\\nPengiriman dua hari kerja.\\n')\""
        penjelasan: "Membuat dokumen uji berisi tiga bagian berheading — bentuk yang paling umum di dokumentasi nyata. Perintah ini tidak mencetak apa pun bila berhasil."
      - perintah: "python -c \"import re; isi=open('dokumen.md').read(); bagian=[b.strip() for b in re.split(r'(?=^## )', isi, flags=re.M) if b.strip()]; print(len(bagian))\""
        penjelasan: "Memotong dokumen tepat sebelum setiap heading ##. Lookahead (?=^## ) membelah tanpa menghapus headingnya."
      - perintah: "python -c \"import re; isi=open('dokumen.md').read(); bagian=[b.strip() for b in re.split(r'(?=^## )', isi, flags=re.M) if b.strip()]; [print(b.splitlines()[0]) for b in bagian]\""
        penjelasan: "Mencetak baris pertama tiap chunk — bukti bahwa setiap chunk mulai dari judul bagiannya sendiri."
    hasil: |
      3
      ## Reset password
      ## Pembayaran
      ## Pengiriman
    cek_berhasil:
      - "Angka 3 tercetak: satu chunk per bagian"
      - "Setiap baris berikutnya dimulai dengan ##, jadi tidak ada chunk yang mulai di tengah kalimat"
    kalau_gagal:
      - error: "FileNotFoundError: [Errno 2] No such file or directory: 'dokumen.md'"
        arti: "Berkas dibuat di folder lain, atau terminal tidak berada di chunk-lokal."
        perbaikan:
          - "Pastikan sudah cd chunk-lokal sebelum langkah 2"
          - "Cek dengan ls — dokumen.md harus muncul di daftar"
      - error: "SyntaxError: unexpected character after line continuation character"
        arti: "Kutip di dalam perintah bentrok dengan kutip shell (paling sering di PowerShell atau cmd)."
        perbaikan:
          - "Jalankan di git-bash seperti contoh"
          - "Atau tulis kodenya ke chunk.py lalu jalankan python chunk.py"
      - error: "ValueError: not enough values to unpack"
        arti: "Kamu memakai b.split('\\n', 1) pada chunk yang tidak punya baris kedua."
        perbaikan:
          - "Pakai splitlines()[0] seperti contoh — aman untuk chunk satu baris"
      - error: "Tidak ada error, tapi hasilnya 1 bukan 3"
        arti: "Regex-nya ditulis '^## ' tanpa (?=...), sehingga delimiternya ikut terbuang dan hanya terbelah sekali."
        perbaikan:
          - "Pastikan memakai re.split(r'(?=^## )', ...) dengan tanda kurung lookahead utuh"
      - error: "'python' is not recognized as an internal or external command"
        arti: "Python tidak ada di PATH Windows."
        perbaikan:
          - "Pasang Python dari python.org, centang 'Add python.exe to PATH'"
          - "Atau pakai perintah python3 di Linux/macOS"
    buktikan:
      perubahan: "Tambahkan bagian keempat '## Refund' beserta satu kalimat isinya, lalu ulangi langkah 3."
      hasil_diharapkan: "Angka berubah jadi 4, dan baris '## Refund' muncul sebagai chunk tersendiri."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa chunk dibuat dengan tumpang tindih (overlap)?"
    opsi:
      a: "Agar biaya embedding lebih murah"
      b: "Agar kalimat yang terbelah di batas chunk tetap utuh di salah satu chunk"
      c: "Agar model menjawab lebih cepat"
      d: "Agar jumlah chunk berkurang"
    jawaban: b
    penjelasan: "Tanpa overlap, satu kalimat bisa terpotong di dua chunk dan tidak pernah utuh di hasil pencarian. Overlap kecil (10–20%) menutup celah itu dengan biaya penyimpanan yang masih wajar."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Chunk selalu memuat dua topik sekaligus sehingga skor kemiripannya kabur. Apa perbaikan yang paling tepat lebih dulu?"
    opsi:
      a: "Naikkan top_k"
      b: "Perkecil ukuran chunk atau potong per bagian/heading"
      c: "Ganti model embedding"
      d: "Naikkan temperature"
    jawaban: b
    penjelasan: "Masalahnya ada di pemotongan, bukan di pencarian. Memperkecil chunk atau memotong mengikuti struktur dokumen memperbaiki akar masalah; menaikkan top_k hanya menambah hasil kabur, dan ganti model berarti membangun ulang indeks tanpa alasan."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Metode chunking yang memotong dokumen mengikuti heading atau struktur aslinya (bukan jumlah karakter) disebut chunking apa? (dua kata)"
    jawaban: "section aware"
    penjelasan: "Section-aware chunking menjaga satu bagian tetap satu chunk, sehingga batas topik di dokumen menjadi batas chunk. Hasilnya chunk lebih utuh maknanya dan judul bagian bisa ikut disertakan sebagai konteks."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Kalau ukuran chunk 500 token dan overlap 100 token, berapa token langkah maju antar-chunk?"
    jawaban: "400"
    penjelasan: "Langkah maju = ukuran - overlap = 500 - 100 = 400 token. Angka inilah yang menentukan jumlah chunk: makin besar overlap, makin banyak chunk dan makin mahal embedding-nya."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Apa akibat nyata dari overlap yang terlalu besar (misalnya 50%)?"
    opsi:
      a: "Chunk jadi lebih pendek dari yang diminta"
      b: "Indeks membengkak: lebih banyak chunk, biaya embedding naik, dan hasil pencarian berisi duplikat"
      c: "Model embedding menolak potongan yang isinya berulang"
      d: "Judul bagian hilang dari tiap chunk"
    jawaban: b
    penjelasan: "Overlap 50% berarti separuh isi tiap chunk sudah ada di chunk sebelumnya. Jumlah chunk dan biaya embedding naik, sementara hasil pencarian jadi berisi potongan yang sama berulang — memakan tempat di prompt tanpa menambah informasi."
    tingkat: menengah
---

# Chunking: memotong dokumen tanpa membelah makna

Kamu akan bisa:
- Menghitung jumlah chunk dan batas tiap chunk dari ukuran serta overlap.
- Memilih strategi potong yang sesuai bentuk dokumen (paragraf, heading, kode).
- Menjelaskan kenapa potongan yang salah membuat RAG gagal meski modelnya bagus.

Prasyarat: [modul 03 — embedding](/modul/ai-llm/embedding) dan [modul 04 — retrieval dan RAG](/modul/ai-llm/retrieval-dan-rag). Chunking adalah langkah pertama di alur RAG, dan kesalahannya tidak bisa diperbaiki di langkah berikutnya.

## Dokumen tidak muat, dan tidak boleh dipotong sembarangan

Model punya batas konteks, dan biaya dihitung per token. Jadi dokumen harus dipotong. Tapi potongan yang salah menghasilkan dua kegagalan sekaligus: jawaban terbelah (informasinya ada, tapi tidak utuh di chunk mana pun) dan pencarian kabur (satu chunk membahas tiga topik, sehingga skornya tidak menonjol untuk topik mana pun).

Aturan potong paling sederhana: jendela tetap sejumlah kata/token, digeser dengan tumpang tindih.

```python
teks = "satu dua tiga empat lima enam tujuh delapan sembilan sepuluh"
ukuran = 4
overlap = 1

kata = teks.split()
chunk = [" ".join(kata[i:i + ukuran]) for i in range(0, len(kata), ukuran - overlap)]
print(len(chunk))
for c in chunk:
    print(c)
```

**Output yang diharapkan**

```
4
satu dua tiga empat
empat lima enam tujuh
tujuh delapan sembilan sepuluh
sepuluh
```

Baris demi baris:
- `kata = teks.split()` — memotong per spasi; di produksi satuannya token, bukan kata, tapi bentuk kodenya sama.
- `ukuran - overlap` — langkah maju per chunk = 4 - 1 = 3 kata. Inilah satu-satunya angka yang menentukan posisi awal chunk.
- `kata[i:i + ukuran]` — mengambil jendela 4 kata; `join` mengembalikannya jadi teks.
- `range(0, len(kata), 3)` — posisi awal 0, 3, 6, 9. Empat chunk dari sepuluh kata.
- `print(len(chunk))` lalu isi tiap chunk — `4` diikuti empat baris.

Perhatikan chunk terakhir: `sepuluh`, satu kata. Tumpang tindih membuat sisa teks pendek di ujung, dan chunk sekecil itu hampir tidak berguna untuk pencarian. Di produksi, chunk yang jauh lebih pendek dari ukuran normal biasanya digabung ke chunk sebelumnya.

## Tiga strategi potong yang benar-benar dipakai

| Strategi | Cara kerja | Cocok untuk | Kelemahan |
|---|---|---|---|
| Jendela tetap | Potong tiap N token, geser N-overlap | Teks tanpa struktur jelas (transkrip, log) | Bisa membelah kalimat dan tabel |
| Per bagian (section-aware) | Potong di heading, subjudul, atau batas artikel | Dokumentasi, wiki, markdown, buku | Bagian panjang tetap perlu dipotong lagi |
| Per unit semantik | Potong saat topik berganti (kalimat mirip dikelompokkan) | Prosa panjang tanpa heading | Perlu model tambahan, lebih lambat |

Urutan pemakaian yang wajar: coba section-aware dulu; kalau dokumennya tidak berheading, pakai jendela tetap dengan overlap 10–20%; baru pertimbangkan pemotongan semantik kalau hasil pencarian masih buruk.

## Di pekerjaan, ini dipakai untuk apa

Hampir setiap perbaikan mutu RAG yang dilaporkan "jawaban jadi jauh lebih baik" berasal dari sini, bukan dari ganti model. Menyertakan judul bagian di awal tiap chunk adalah perubahan satu baris yang sering menaikkan akurasi pencarian, karena judul memberi konteks yang tidak ada di dalam kalimatnya sendiri.

## Lapis 2

### Angka awal yang wajar

| Parameter | Nilai awal | Bila terlalu kecil | Bila terlalu besar |
|---|---|---|---|
| Ukuran chunk | 300–800 token | Konteks hilang, jawaban menggantung | Banyak topik dalam satu chunk, skor kabur |
| Overlap | 10–20% dari ukuran | Kalimat terbelah di batas chunk | Jumlah chunk dan biaya embedding membengkak |
| Panjang minimum chunk | 50–100 token | Chunk sampah masuk indeks | Chunk berguna ikut dibuang |
| Metadata per chunk | judul bagian + nomor | Hasil tidak bisa dilacak ke sumber | Penyimpanan naik tanpa manfaat |

### Kenapa begini, bukan begitu

Alternatifnya adalah tidak memotong sama sekali dan mengirim dokumen utuh. Itu ditolak bukan karena mustahil, tapi karena tiga hal sekaligus: context window tetap terbatas, biaya per pertanyaan naik sebanding panjang dokumen, dan model cenderung melewatkan bagian tengah dokumen yang sangat panjang. Konsekuensinya diterima: mutu sekarang bergantung pada batas potong, dan batas potong harus diuji ke set pertanyaan, bukan dirasakan.

Cara menguji yang paling murah: ambil 20 pertanyaan yang jawabannya kamu tahu ada di dokumen mana. Ubah ukuran chunk, jalankan ulang, hitung berapa yang chunk benarnya masuk `top_k`. Angka itu yang dibandingkan — bukan kesan "kelihatannya lebih rapi".

### Error umum

| Gejala / pesan | Arti | Cara memperbaiki |
|---|---|---|
| Jawaban selalu setengah, kalimatnya menggantung | Chunk terpotong di tengah kalimat | Naikkan overlap, atau potong di batas kalimat/paragraf |
| `expected 1536 dimensions, got 3072` | Indeks diisi dua model embedding berbeda setelah chunk diubah | Bangun ulang seluruh indeks dengan satu model |
| Hasil pencarian selalu chunk yang sama | Satu chunk terlalu besar dan memuat hampir semua kata kunci | Perkecil chunk, potong per heading |
| Chunk berisi tabel yang terbelah | Pemisahan berbasis karakter memotong di dalam tabel | Perlakukan tabel/kode sebagai satu unit yang tidak dipotong |
| Banyak chunk satu baris di indeks | Overlap besar pada teks pendek, atau sisa ujung dokumen | Gabungkan chunk di bawah panjang minimum ke chunk sebelumnya |

### Rujukan resmi

- Anthropic — contextual retrieval (menyertakan konteks bagian ke tiap chunk): <https://www.anthropic.com/news/contextual-retrieval>
- Python — `re.split` dengan lookahead: <https://docs.python.org/3/library/re.html#re.split>
- LlamaIndex — daftar strategi chunking: <https://docs.llamaindex.ai/en/stable/module_guides/loading/node_parsers/>

## Latihan

Latihan 1 di web: hitung sendiri batas chunk dan lihat kenapa ujung teks jadi chunk pendek. Latihan 2 di laptop: potong markdown per heading — strategi yang paling sering dipakai untuk dokumentasi, dan hanya perlu `re.split` dari stdlib.

## Kamu sudah bisa ini kalau…

- [ ] Bisa menghitung jumlah chunk dari panjang teks, ukuran, dan overlap tanpa menjalankan kode.
- [ ] Bisa menjelaskan kenapa chunk terakhir bisa berisi satu kata, dan apa yang harus dilakukan.
- [ ] Bisa memilih strategi potong yang tepat untuk dokumentasi berheading vs transkrip rapat.
- [ ] Latihan 1 lulus dan latihan 2 berhasil dijalankan.