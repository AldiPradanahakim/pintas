---
track: ai-llm
nomor: 8
judul: "Function calling: model yang memilih alat, kodemu yang menjalankan"
slug: function-calling
estimasi_menit: 12
prasyarat: ["ai-llm/prompt"]
latihan:
  - id: ai-llm-08-latihan-1
    jenis: web
    bahasa: python
    soal: "Tiga panggilan alat datang dari model. Validasi masing-masing terhadap SKEMA, lalu cetak satu baris per panggilan: 'jalankan: nama(argumen)' kalau sah, atau 'tolak: <alasan>' kalau tidak. Alat yang tidak ada di SKEMA ditolak lebih dulu, sebelum argumen diperiksa."
    kode_awal: |
      import json

      SKEMA = {"cari_cuaca": ["kota"]}

      panggilan = [
          '{"nama": "cari_cuaca", "argumen": {"kota": "Bandung"}}',
          '{"nama": "cari_cuaca", "argumen": {}}',
          '{"nama": "hapus_data", "argumen": {"id": 1}}',
      ]

      # untuk tiap panggilan, cetak satu baris:
      #   jalankan: cari_cuaca(Bandung)
      #   tolak: argumen kurang: kota
      #   tolak: alat tidak dikenal (hapus_data)
    output_harapan: |
      jalankan: cari_cuaca(Bandung)
      tolak: argumen kurang: kota
      tolak: alat tidak dikenal (hapus_data)
    solusi: |
      import json

      SKEMA = {"cari_cuaca": ["kota"]}

      panggilan = [
          '{"nama": "cari_cuaca", "argumen": {"kota": "Bandung"}}',
          '{"nama": "cari_cuaca", "argumen": {}}',
          '{"nama": "hapus_data", "argumen": {"id": 1}}',
      ]

      for p in panggilan:
          d = json.loads(p)
          nama = d.get("nama")
          arg = d.get("argumen", {})

          if nama not in SKEMA:
              print(f"tolak: alat tidak dikenal ({nama})")
              continue

          kurang = [k for k in SKEMA[nama] if k not in arg]
          if kurang:
              print("tolak: argumen kurang: " + ", ".join(kurang))
          else:
              print(f"jalankan: {nama}({arg['kota']})")
    catatan_solusi: "Urutannya penting: cek nama alat DULU, baru argumen. Kalau dibalik, panggilan ke alat yang tidak ada akan dilaporkan sebagai 'argumen kurang' — pesan yang menyesatkan dan menyembunyikan percobaan memanggil alat berbahaya. Perhatikan juga bahwa model tidak pernah menjalankan apa pun: ia hanya mengusulkan, kodemu yang memutuskan."
  - id: ai-llm-08-latihan-2
    jenis: laptop
    soal: "Buat satu alat nyata yang bisa dipanggil model: fungsi yang mencari baris di berkas CSV lokal. Daftarkan alat itu dalam bentuk skema JSON, jalankan satu panggilan, dan buktikan bahwa alat menolak argumen yang tidak sah."
    kebutuhan:
      - "Python 3.10 atau lebih baru"
      - "Terminal (git-bash / PowerShell)"
    langkah:
      - perintah: "mkdir alat-lokal && cd alat-lokal"
        penjelasan: "Folder kerja terpisah supaya berkas latihan tidak tercampur."
      - perintah: "python -c \"open('stok.csv','w').write('nama,jumlah\\nKabel HDMI,4\\nMouse,0\\nKeyboard,12\\n')\""
        penjelasan: "Membuat data uji tiga baris. Kolom jumlah bernilai 0 pada Mouse — berguna untuk menguji pencarian stok habis."
      - perintah: "python -c \"import csv; b=list(csv.DictReader(open('stok.csv'))); print([r['nama'] for r in b if int(r['jumlah'])==0])\""
        penjelasan: "Mencari barang dengan stok habis. Output ['Mouse'] membuktikan pembacaan CSV benar sebelum dibungkus jadi alat."
      - perintah: "python -c \"import json; skema={'nama':'cari_stok','deskripsi':'Cari barang dengan stok habis','parameter':{'tipe':'object','wajib':['batas'],'properti':{'batas':{'tipe':'integer'}}}}; print(json.dumps(skema, ensure_ascii=False))\""
        penjelasan: "Skema alat dalam bentuk yang dikirim ke model. Model membaca ini untuk tahu alat apa yang tersedia dan argumen apa yang wajib."
      - perintah: "python -c \"import csv; cek=lambda b: 'batas tidak sah' if (not isinstance(b,int) or isinstance(b,bool) or b<1) else [r['nama'] for r in csv.DictReader(open('stok.csv')) if int(r['jumlah'])==0][:b]; print(cek(0)); print(cek(5)); print(cek(True))\""
        penjelasan: "Alat lengkap dengan penjaga argumen dalam satu baris. cek(0) ditolak karena batas minimal 1; cek(5) mengembalikan barang habis; cek(True) juga ditolak — di Python True adalah int, jadi tanpa isinstance(b,bool) ia akan lolos sebagai batas 1."
    hasil: |
      ['Mouse']
      {"nama": "cari_stok", "deskripsi": "Cari barang dengan stok habis", "parameter": {"tipe": "object", "wajib": ["batas"], "properti": {"batas": {"tipe": "integer"}}}}
      batas tidak sah
      ['Mouse']
      batas tidak sah
    cek_berhasil:
      - "Langkah 3 mencetak ['Mouse'] — data terbaca benar"
      - "Langkah 4 mencetak skema JSON yang sah dan bisa dibaca model"
      - "Langkah 5 mencetak tiga baris: batas tidak sah, ['Mouse'], batas tidak sah"
      - "Baris ketiga penting: cek(True) ditolak, bukan lolos sebagai batas 1"
    kalau_gagal:
      - error: "FileNotFoundError: [Errno 2] No such file or directory: 'stok.csv'"
        arti: "Berkas dibuat di folder lain, atau terminal tidak berada di alat-lokal."
        perbaikan:
          - "Pastikan sudah cd alat-lokal sebelum langkah 2"
          - "Cek dengan ls — stok.csv harus muncul"
      - error: "ValueError: invalid literal for int() with base 10: 'jumlah'"
        arti: "Baris pertama CSV ikut terbaca sebagai data. Ini terjadi kalau memakai csv.reader, bukan DictReader."
        perbaikan:
          - "Pakai csv.DictReader supaya baris pertama jadi nama kolom"
      - error: "KeyError: 'batas'"
        arti: "Model mengirim panggilan tanpa argumen wajib. Inilah kegagalan yang harus ditangkap validator, bukan dibiarkan naik jadi error 500."
        perbaikan:
          - "Periksa semua kunci di daftar wajib sebelum memakai argumen"
    buktikan:
      perubahan: "Ubah data: beri Mouse jumlah 3, lalu jalankan langkah 3 lagi."
      hasil_diharapkan: "Output berubah dari ['Mouse'] menjadi [] — pencarian benar-benar membaca data, bukan mengembalikan nilai tetap."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Pada function calling, siapa yang benar-benar menjalankan fungsi?"
    opsi:
      a: "Model bahasa, di dalam prosesnya sendiri"
      b: "Kode aplikasi milikmu, setelah model hanya mengusulkan nama dan argumen"
      c: "Penyedia API, secara otomatis"
      d: "Basis data, lewat pemicu"
    jawaban: b
    penjelasan: "Model hanya menghasilkan usulan dalam bentuk terstruktur: nama alat dan argumennya. Tidak ada kode yang dijalankan di sisi model. Aplikasimu yang memutuskan apakah usulan itu sah, lalu memanggil fungsinya sendiri. Karena itu validasi argumen adalah tanggung jawabmu, bukan model."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Model mengirim panggilan ke alat 'hapus_semua' yang tidak pernah kamu daftarkan. Apa yang harus dilakukan aplikasimu?"
    opsi:
      a: "Jalankan saja, mungkin model punya alasan"
      b: "Tolak dan catat di log — alat di luar daftar tidak boleh dieksekusi"
      c: "Coba cari fungsi dengan nama mirip lalu jalankan itu"
      d: "Kirim ulang ke model supaya ia memutuskan sendiri"
    jawaban: b
    penjelasan: "Daftar alat adalah batas keamanan, bukan saran. Nama yang tidak ada di daftar berarti model berhalusinasi atau prompt-nya disusupi penyerang. Menjalankannya — atau menebak fungsi mirip — mengubah model yang keliru menjadi kerusakan data nyata."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Siapa yang harus memvalidasi argumen yang dikirim model sebelum fungsi dijalankan? (satu kata)"
    jawaban: "aplikasi"
    penjelasan: "Model tidak menjamin tipe data, kelengkapan, atau rentang nilai. Aplikasi harus memeriksa semua itu sebelum memanggil fungsi — sama seperti memeriksa input dari pengguna. Model adalah sumber input yang tidak dipercaya, bukan bagian dari sistem yang dipercaya."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa hasil fungsi dikirim balik ke model sebagai pesan baru, bukan langsung ditampilkan ke pengguna?"
    opsi:
      a: "Supaya biayanya lebih murah"
      b: "Supaya model bisa memakai hasilnya untuk menyusun jawaban atau memanggil alat berikutnya"
      c: "Supaya hasilnya tersimpan di database"
      d: "Karena API mewajibkan"
    jawaban: b
    penjelasan: "Hasil fungsi biasanya berupa data mentah — angka, baris tabel, kode error. Model perlu melihatnya untuk mengubahnya menjadi jawaban yang bisa dibaca, atau untuk memutuskan langkah berikutnya. Ini juga dasar dari pola agent: beberapa putaran panggil-alat lalu jawab."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Berapa putaran panggilan alat yang wajar dibatasi untuk satu permintaan pengguna? (tulis angka bulat, biasanya 5-10)"
    jawaban: "10"
    penjelasan: "Tanpa batas, model bisa memanggil alat berulang kali tanpa pernah menyimpulkan — menghabiskan biaya dan waktu, kadang tanpa akhir. Batas 5–10 putaran cukup untuk sebagian besar tugas, dan saat tercapai aplikasi berhenti dengan pesan jelas alih-alih menggantung."
    tingkat: dasar
---

## Lapis 1

### Model tidak bisa menyentuh dunia nyata

Model bahasa hanya menghasilkan teks. Ia tidak tahu jam berapa sekarang, tidak bisa membaca database, tidak bisa mengirim email. Kalau kamu bertanya "berapa stok Mouse?", ia akan mengarang angka — bukan karena rusak, tapi karena memang tidak punya aksesnya.

**Function calling** menutup celah itu. Kamu memberi model daftar fungsi yang tersedia. Ketika model butuh salah satunya, ia tidak menjalankannya — ia **mengusulkan** panggilan dalam bentuk terstruktur:

```json
{"nama": "cari_stok", "argumen": {"batas": 5}}
```

Kodemu yang memeriksa usulan itu, memutuskan boleh atau tidak, menjalankan fungsinya, lalu mengirim hasilnya kembali ke model. Model memakai hasil itu untuk menjawab.

Pembagian tugasnya jelas dan tidak boleh dikaburkan:

| Model | Aplikasimu |
|---|---|
| Memilih fungsi mana yang relevan | Memutuskan fungsi itu boleh dipanggil |
| Menyusun argumen | Memvalidasi tipe, kelengkapan, rentang |
| Membaca hasil dan menyimpulkan | Menjalankan fungsi dan mengembalikan hasil |

### Tiga langkah satu putaran

1. **Kirim** pertanyaan pengguna + daftar alat ke model.
2. **Terima** usulan panggilan. Validasi. Jalankan. 
3. **Kirim balik** hasilnya sebagai pesan baru. Model menjawab pengguna.

Kalau model meminta alat lain lagi di langkah 3, ulangi. Tapi batasi jumlah putarannya — 5 sampai 10 sudah banyak. Tanpa batas, model bisa berputar tanpa pernah menyimpulkan.

### Validasi bukan formalitas

Model bisa keliru dengan yakin. Ia bisa:

- Mengirim argumen yang wajib tapi kosong.
- Mengirim angka padahal kamu mengharapkan teks.
- Meminta alat yang tidak pernah kamu daftarkan — karena halusinasi, atau karena prompt-nya disusupi penyerang.
- Mengirim `batas: -1`, yang membuat `LIMIT -1` di SQL mengembalikan **semua** baris.

Semua ini harus ditolak **sebelum** fungsinya jalan. Perlakuan terhadap argumen model sama persis dengan perlakuan terhadap input pengguna: tidak dipercaya sampai diperiksa.

### Daftar alat adalah batas keamanan

Alat yang tidak kamu daftarkan tidak boleh bisa dipanggil. Kalau model meminta `hapus_semua` dan kodemu "mencari yang mirip", kamu baru saja mengubah halusinasi menjadi kehilangan data.

Aturan praktisnya: **tolak, catat, jangan tebak.**

### Kapan sebaiknya tidak memakai function calling

Kalau tugasnya bisa diselesaikan dengan satu panggilan API biasa, jangan pakai model sebagai perantara. Menyuruh model memilih di antara dua alat yang jelas ("ambil cuaca" vs "ambil waktu") hanya menambah biaya, latensi, dan satu titik kegagalan. Panggil langsung.

Function calling berguna ketika **pilihan alatnya bergantung pada isi pertanyaan** dan tidak bisa ditentukan dengan aturan sederhana.

## Lapis 2

### Bentuk skema alat

Penyedia berbeda-beda nama field-nya, tapi isinya sama:

```json
{
  "nama": "cari_stok",
  "deskripsi": "Cari barang berdasarkan stok habis. Pakai saat pengguna bertanya barang yang perlu dipesan ulang.",
  "parameter": {
    "tipe": "object",
    "wajib": ["batas"],
    "properti": {
      "batas": {
        "tipe": "integer",
        "minimum": 1,
        "maximum": 100,
        "deskripsi": "Jumlah maksimum barang yang dikembalikan."
      }
    }
  }
}
```

Tiga hal yang menentukan berhasil tidaknya:

**Deskripsi menentukan kapan alat dipilih.** Model memilih berdasarkan deskripsi, bukan nama. `"Cari stok"` tidak memberi tahu kapan memakainya. `"Cari barang berdasarkan stok habis. Pakai saat pengguna bertanya barang yang perlu dipesan ulang."` memberi konteks pemakaian. Deskripsi yang buruk menghasilkan pemilihan yang buruk, dan itu bukan salah model.

**`wajib` harus benar-benar wajib.** Kalau `batas` punya nilai default, jangan masukkan ke `wajib` — beri `default` di skema. Menandai field opsional sebagai wajib membuat model mengarang nilai hanya untuk meloloskan validasi.

**Batasi domain nilai.** `minimum` dan `maximum` di skema mengurangi panggilan tidak sah, tapi **tidak menggantikan validasi di kode**. Skema adalah petunjuk bagi model; validator adalah penjaga. Keduanya diperlukan.

### Validator yang menolak dengan jelas

```python
SKEMA = {
    "cari_stok": {"wajib": ["batas"], "tipe": {"batas": int}},
}

class Tolak(Exception):
    pass

def validasi(nama: str, arg: dict) -> dict:
    if nama not in SKEMA:
        raise Tolak(f"alat tidak dikenal: {nama}")
    skema = SKEMA[nama]

    kurang = [k for k in skema["wajib"] if k not in arg]
    if kurang:
        raise Tolak(f"argumen kurang: {', '.join(kurang)}")

    for k, tipe in skema["tipe"].items():
        if k in arg and not isinstance(arg[k], tipe):
            raise Tolak(f"{k} harus {tipe.__name__}, bukan {type(arg[k]).__name__}")

    batas = arg.get("batas")
    if batas is not None and not (1 <= batas <= 100):
        raise Tolak(f"batas di luar rentang: {batas}")

    return {k: arg[k] for k in skema["wajib"]}
```

Perhatikan `isinstance(True, int)` bernilai `True` di Python. Kalau `batas` bisa berupa boolean dari model, periksa `type(x) is int`, bukan `isinstance`. Ini contoh kecil yang menentukan benar atau tidaknya validasi.

### Mengirim hasil kembali ke model

Hasil fungsi dikirim sebagai pesan dengan peran khusus — biasanya `tool` atau `function`, tergantung penyedia:

```python
pesan = [
    {"peran": "pengguna", "isi": "Barang apa yang perlu dipesan ulang?"},
    {"peran": "asisten", "panggilan_alat": [{"id": "c1", "nama": "cari_stok", "argumen": {"batas": 5}}]},
    {"peran": "alat", "id_panggilan": "c1", "isi": '[{"nama": "Mouse", "jumlah": 0}]'},
]
```

`id_panggilan` menghubungkan hasil dengan usulannya. Kalau model meminta dua alat sekaligus, tanpa id ini hasilnya bisa tertukar.

Hasil sebaiknya **ringkas dan terstruktur**. Mengirim seluruh isi tabel 10.000 baris menghabiskan token dan mengubur informasi yang penting. Kirim yang relevan saja — itulah gunanya `batas` di skema.

### Penanganan kegagalan

Tiga jenis kegagalan, tiga perlakuan berbeda:

| Kegagalan | Perlakuan |
|---|---|
| Argumen tidak sah | Tolak, kirim pesan kesalahan kembali ke model, beri satu kesempatan memperbaiki |
| Fungsi error (DB mati, timeout) | Jangan kirim detail internal ke model — kirim pesan umum, catat detailnya di log |
| Alat tidak dikenal | Tolak tanpa kesempatan memperbaiki, catat sebagai anomali |

Poin kedua penting untuk keamanan: pesan error database sering memuat nama tabel, nama kolom, bahkan potongan query. Kalau itu dikirim ke model dan model meneruskannya ke pengguna, kamu membocorkan struktur internal.

### Batas putaran dan deteksi lingkaran

```python
MAKS_PUTARAN = 8

for putaran in range(MAKS_PUTARAN):
    jawab = panggil_model(pesan)
    if not jawab.panggilan_alat:
        return jawab.isi
    for p in jawab.panggilan_alat:
        hasil = jalankan(validasi(p.nama, p.argumen))
        pesan.append({"peran": "alat", "id_panggilan": p.id, "isi": hasil})

raise RuntimeError(f"melewati {MAKS_PUTARAN} putaran tanpa jawaban akhir")
```

Selain batas putaran, deteksi juga **panggilan yang berulang persis**. Model yang memanggil `cari_stok({"batas": 5})` tiga kali berturut-turut dengan hasil sama sedang berputar, bukan bekerja. Kalau terdeteksi, hentikan dan laporkan.

### Daftar periksa

1. Setiap alat punya deskripsi yang menyebut **kapan** dipakainya, bukan hanya apa fungsinya.
2. `wajib` hanya berisi field yang benar-benar tidak punya default.
3. Validator memeriksa nama alat lebih dulu, lalu kelengkapan, lalu tipe, lalu rentang.
4. Alat di luar daftar ditolak tanpa upaya menebak.
5. Pesan error internal tidak pernah diteruskan ke model.
6. Ada batas putaran, dan ada deteksi panggilan berulang.
7. Hasil alat dikirim ringkas, bukan seluruh isi database.
8. Setiap panggilan dicatat di log: nama alat, argumen, hasil (ringkas), dan durasi.
