---
track: fondasi
nomor: 3
judul: "SQL: bertanya ke data, bukan mengambil semua lalu menyaring di kode"
slug: sql
estimasi_menit: 12
prasyarat: ["fondasi/http"]
latihan:
  - id: fondasi-03-latihan-1
    jenis: web
    bahasa: python
    soal: "Diberi daftar pesanan, hitung total belanja per pelanggan yang nilainya di atas 100.000, urut dari terbesar. Cetak satu baris per pelanggan: '<nama> <total>'."
    kode_awal: |
      pesanan = [
          ("Ani", 45000), ("Budi", 120000), ("Ani", 80000),
          ("Citra", 95000), ("Budi", 30000), ("Dewi", 200000),
      ]

      # jumlahkan per pelanggan, saring > 100000, urut terbesar
    output_harapan: |
      Dewi 200000
      Budi 150000
      Ani 125000
    solusi: |
      pesanan = [
          ("Ani", 45000), ("Budi", 120000), ("Ani", 80000),
          ("Citra", 95000), ("Budi", 30000), ("Dewi", 200000),
      ]

      total = {}
      for nama, nilai in pesanan:
          total[nama] = total.get(nama, 0) + nilai

      hasil = [(n, v) for n, v in total.items() if v > 100000]
      hasil.sort(key=lambda x: -x[1])

      for n, v in hasil:
          print(f"{n} {v}")
    catatan_solusi: "Ini padanan Python dari GROUP BY + HAVING + ORDER BY. Ani 45000+80000 = 125000, Budi 120000+30000 = 150000, Citra 95000 (tersaring), Dewi 200000. Perhatikan bahwa Citra punya pesanan tapi totalnya di bawah ambang — HAVING menyaring SETELAH pengelompokan, berbeda dari WHERE yang menyaring baris sebelum dikelompokkan."
  - id: fondasi-03-latihan-2
    jenis: laptop
    soal: "Buat basis data SQLite, isi dua tabel, lalu jalankan satu kueri yang menggabungkan keduanya. Buktikan bahwa JOIN mengembalikan data yang tidak bisa didapat dari satu tabel saja."
    kebutuhan:
      - "Python 3.10 atau lebih baru (modul sqlite3 sudah termasuk)"
      - "Terminal (git-bash / PowerShell)"
    langkah:
      - perintah: "mkdir latihan-sql && cd latihan-sql"
        penjelasan: "Folder kerja terpisah supaya berkas basis data tidak tercampur."
      - perintah: "python -c \"import sqlite3; c=sqlite3.connect('toko.db'); c.executescript('CREATE TABLE pelanggan(id INTEGER PRIMARY KEY, nama TEXT); CREATE TABLE pesanan(id INTEGER PRIMARY KEY, pelanggan_id INTEGER, nilai INTEGER);'); c.commit()\""
        penjelasan: "Membuat dua tabel. Perhatikan pesanan menyimpan pelanggan_id, bukan nama — nama cukup disimpan sekali di tabel pelanggan."
      - perintah: "python -c \"import sqlite3; c=sqlite3.connect('toko.db'); c.executescript(\\\"INSERT INTO pelanggan VALUES (1,'Ani'),(2,'Budi'),(3,'Citra'); INSERT INTO pesanan VALUES (1,1,45000),(2,1,80000),(3,2,120000),(4,2,30000);\\\"); c.commit()\""
        penjelasan: "Mengisi data. Citra tidak punya pesanan — itu disengaja, untuk melihat perilaku JOIN terhadap data yang tidak punya pasangan."
      - perintah: "python -c \"import sqlite3; c=sqlite3.connect('toko.db'); [print(r) for r in c.execute('SELECT p.nama, SUM(o.nilai) FROM pelanggan p JOIN pesanan o ON o.pelanggan_id=p.id GROUP BY p.nama ORDER BY 2 DESC')]\""
        penjelasan: "JOIN + GROUP BY. Hasil hanya Ani dan Budi — Citra hilang, karena JOIN biasa membuang baris yang tidak punya pasangan."
      - perintah: "python -c \"import sqlite3; c=sqlite3.connect('toko.db'); [print(r) for r in c.execute('SELECT p.nama, COALESCE(SUM(o.nilai),0) FROM pelanggan p LEFT JOIN pesanan o ON o.pelanggan_id=p.id GROUP BY p.nama ORDER BY 2 DESC')]\""
        penjelasan: "LEFT JOIN + COALESCE. Citra muncul dengan nilai 0. Inilah beda penting antara JOIN dan LEFT JOIN: yang pertama membuang pelanggan tanpa pesanan, yang kedua mempertahankannya."
    hasil: |
      ('Budi', 150000)
      ('Ani', 125000)
      ('Budi', 150000)
      ('Ani', 125000)
      ('Citra', 0)
    cek_berhasil:
      - "Langkah 4 mencetak dua baris (Citra hilang)"
      - "Langkah 5 mencetak tiga baris (Citra muncul dengan 0)"
      - "Angka Budi 150000 dan Ani 125000 konsisten di kedua kueri"
    kalau_gagal:
      - error: "sqlite3.OperationalError: table pelanggan already exists"
        arti: "Berkas toko.db sudah ada dari percobaan sebelumnya."
        perbaikan:
          - "Hapus toko.db lalu ulangi, atau pakai DROP TABLE IF EXISTS sebelum CREATE"
      - error: "sqlite3.OperationalError: no such table: pesanan"
        arti: "executescript membuat dua tabel sekaligus; kalau perintahnya terpotong, tabel kedua tidak terbuat."
        perbaikan:
          - "Jalankan ulang langkah 2 dan pastikan kedua CREATE ada di dalam string"
      - error: "Hasilnya kosong padahal data ada"
        arti: "Kunci JOIN tidak cocok — misalnya membandingkan o.pelanggan_id dengan p.nama."
        perbaikan:
          - "Pastikan ON o.pelanggan_id = p.id, bukan nama"
    buktikan:
      perubahan: "Ubah JOIN menjadi LEFT JOIN pada langkah 4 tanpa COALESCE."
      hasil_diharapkan: "Citra muncul dengan nilai None (bukan 0) — SUM dari himpunan kosong menghasilkan NULL, bukan nol. COALESCE(NULL, 0) mengubahnya jadi 0. Ini penyebab nyata angka 'null' muncul di laporan keuangan."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Apa beda WHERE dan HAVING?"
    opsi:
      a: "Keduanya sama, hanya beda nama"
      b: "WHERE menyaring baris sebelum dikelompokkan; HAVING menyaring hasil pengelompokan"
      c: "WHERE untuk angka, HAVING untuk teks"
      d: "HAVING lebih cepat"
    jawaban: b
    penjelasan: "Urutan eksekusi SQL: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. Karena WHERE berjalan sebelum pengelompokan, ia tidak bisa memakai hasil agregat seperti SUM atau COUNT. Inilah kenapa 'WHERE SUM(nilai) > 100' selalu gagal, dan yang benar adalah HAVING."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Kamu ingin menampilkan semua pelanggan, termasuk yang belum pernah memesan. JOIN mana yang dipakai?"
    opsi:
      a: "JOIN biasa"
      b: "LEFT JOIN dari tabel pelanggan"
      c: "RIGHT JOIN dari tabel pesanan"
      d: "CROSS JOIN"
    jawaban: b
    penjelasan: "LEFT JOIN mempertahankan semua baris tabel kiri. Dengan pelanggan di kiri, pelanggan tanpa pesanan tetap muncul — kolom pesanan bernilai NULL. JOIN biasa akan membuang mereka, dan itulah penyebab laporan 'jumlah pelanggan' yang lebih kecil dari kenyataan."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Perintah SQL untuk mengambil data dari tabel adalah ... (satu kata)"
    jawaban: "select"
    penjelasan: "SELECT menentukan kolom apa yang dikembalikan. Bersama FROM ia membentuk kueri paling dasar. Yang membedakan kueri baik dari yang buruk biasanya bukan SELECT-nya, tapi apakah ia menyaring di database (WHERE) atau mengambil semua lalu menyaring di kode aplikasi."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa mengambil seluruh tabel lalu menyaringnya di kode aplikasi adalah kebiasaan buruk?"
    opsi:
      a: "Karena kode Python lebih lambat dari SQL dalam segala hal"
      b: "Karena seluruh data harus melewati jaringan dan masuk ke memori, padahal yang dibutuhkan hanya sebagian kecil"
      c: "Karena SQL tidak bisa menyaring"
      d: "Karena tabel tidak boleh dibaca penuh"
    jawaban: b
    penjelasan: "Dengan 1.000 baris, bedanya tidak terasa. Dengan 10 juta baris, aplikasi kehabisan memori sebelum sempat menyaring. Database dirancang untuk menyaring dengan indeks — pekerjaan itu jauh lebih murah dilakukan di sana daripada memindahkan semua data lalu membuang 99% di sisi aplikasi."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Kalau sebuah pelanggan tidak punya pesanan dan kamu memakai LEFT JOIN, nilai SUM(nilai) untuk pelanggan itu adalah ... (bukan angka)"
    jawaban: "null"
    penjelasan: "SUM dari himpunan kosong menghasilkan NULL, bukan 0. NULL berarti 'tidak diketahui', berbeda dari nol yang berarti 'jumlahnya nol'. Perbedaan ini penting di laporan: menampilkan NULL sebagai 0 bisa menyembunyikan data yang hilang, sementara membiarkannya NULL membuat masalahnya terlihat."
    tingkat: lanjutan
---

## Lapis 1

### Database menyaring, bukan aplikasi

Kebiasaan yang paling mahal saat belajar: mengambil seluruh tabel ke aplikasi, lalu menyaringnya dengan loop.

```python
# Buruk: mengambil 10 juta baris untuk memakai 200
semua = db.execute("SELECT * FROM pesanan").fetchall()
mahal = [p for p in semua if p.nilai > 100000]
```

```python
# Benar: database yang menyaring
mahal = db.execute("SELECT * FROM pesanan WHERE nilai > 100000").fetchall()
```

Dengan 1.000 baris, keduanya terasa sama. Dengan 10 juta baris, cara pertama menghabiskan memori dan waktu jaringan sebelum sampai ke logika yang kamu tulis.

Database punya indeks, cache, dan optimizer. Membiarkannya bekerja adalah keputusan yang benar hampir selalu.

### Empat bagian kueri

```sql
SELECT nama, SUM(nilai) AS total    -- 3. apa yang dikembalikan
FROM pesanan                        -- 1. dari mana
WHERE nilai > 0                     -- 2. saring baris
GROUP BY nama                       -- 4. kelompokkan
HAVING SUM(nilai) > 100000          -- 5. saring kelompok
ORDER BY total DESC                 -- 6. urutkan
LIMIT 10;                           -- 7. batasi
```

Nomor di komentar menunjukkan **urutan eksekusi**, bukan urutan penulisan. Ini menjelaskan banyak hal yang tadinya terasa aneh:

- `WHERE` tidak bisa memakai `SUM()` karena ia berjalan sebelum pengelompokan.
- `HAVING` bisa, karena berjalan sesudahnya.
- Alias dari `SELECT` bisa dipakai di `ORDER BY` tapi tidak di `WHERE`.

### JOIN: menggabungkan dua tabel

Data yang baik tidak mengulang informasi. Nama pelanggan disimpan sekali di tabel pelanggan; tabel pesanan hanya menyimpan `pelanggan_id`.

Untuk menampilkan nama bersama pesanannya, keduanya digabung:

```sql
SELECT p.nama, o.nilai
FROM pesanan o
JOIN pelanggan p ON p.id = o.pelanggan_id;
```

Jenis JOIN menentukan baris mana yang dipertahankan:

| JOIN | Yang dipertahankan |
|---|---|
| `JOIN` (inner) | Hanya baris yang punya pasangan di kedua tabel |
| `LEFT JOIN` | Semua baris tabel kiri, pasangannya boleh kosong |
| `RIGHT JOIN` | Semua baris tabel kanan |

Perbedaan `JOIN` dan `LEFT JOIN` adalah penyebab paling umum laporan yang angkanya salah: pelanggan tanpa pesanan hilang dari daftar, sehingga "jumlah pelanggan aktif" terlihat lebih kecil dari kenyataan.

### Indeks: kenapa kueri bisa cepat atau lambat

Tanpa indeks, mencari satu baris berarti memeriksa seluruh tabel. Dengan indeks pada kolom yang dicari, database bisa melompat langsung.

```sql
CREATE INDEX idx_pesanan_pelanggan ON pesanan(pelanggan_id);
```

Aturan praktis: **indeks kolom yang sering dipakai di `WHERE`, `JOIN`, dan `ORDER BY`.** Jangan mengindeks semuanya — setiap indeks memperlambat penulisan dan memakan ruang.

### Transaksi: semua atau tidak sama sekali

Memindahkan uang antar rekening butuh dua operasi: kurangi di satu, tambah di yang lain. Kalau yang kedua gagal, yang pertama harus dibatalkan.

```sql
BEGIN;
UPDATE rekening SET saldo = saldo - 50000 WHERE id = 1;
UPDATE rekening SET saldo = saldo + 50000 WHERE id = 2;
COMMIT;
```

Tanpa transaksi, kegagalan di tengah meninggalkan data yang tidak konsisten — uang hilang dari satu rekening tanpa pernah sampai ke yang lain.

## Lapis 2

### NULL bukan nol, bukan string kosong

Ini sumber bug yang paling sering dan paling sulit dilacak.

| Perbandingan | Hasil |
|---|---|
| `NULL = NULL` | `NULL` (bukan true!) |
| `NULL <> NULL` | `NULL` |
| `NULL + 5` | `NULL` |
| `SUM(kosong)` | `NULL` |
| `COUNT(*)` | menghitung baris |
| `COUNT(kolom)` | menghitung baris yang kolomnya tidak NULL |

Karena `NULL = NULL` bukan true, untuk memeriksa NULL dipakai `IS NULL`, bukan `= NULL`.

```sql
-- Salah: tidak pernah mengembalikan apa pun
SELECT * FROM pesanan WHERE catatan = NULL;

-- Benar
SELECT * FROM pesanan WHERE catatan IS NULL;
```

Untuk memberi nilai pengganti: `COALESCE(kolom, 0)`.

Perbedaan `COUNT(*)` dan `COUNT(kolom)` juga penting: yang pertama menghitung baris, yang kedua hanya baris yang kolomnya berisi. Pada tabel dengan banyak nilai kosong, keduanya menghasilkan angka yang sangat berbeda.

### N+1: masalah performa yang tidak terlihat

```python
# N+1: satu kueri untuk daftar, lalu satu kueri PER BARIS
for p in db.execute("SELECT * FROM pesanan").fetchall():
    nama = db.execute("SELECT nama FROM pelanggan WHERE id = ?", (p.pelanggan_id,)).fetchone()
```

Dengan 1.000 pesanan, ini menjalankan 1.001 kueri. Masing-masing cepat, tapi totalnya lambat — dan makin lambat seiring bertambahnya data.

```python
# Satu kueri dengan JOIN
db.execute("""
    SELECT p.nama, o.nilai
    FROM pesanan o JOIN pelanggan p ON p.id = o.pelanggan_id
""").fetchall()
```

N+1 adalah penyebab paling umum halaman yang "lambat padahal kodenya sederhana". Gejalanya khas: cepat dengan 10 baris data, lambat dengan 1.000.

### Mencegah SQL injection

```python
# SALAH — string disambung, input bisa mengubah kueri
db.execute(f"SELECT * FROM pengguna WHERE nama = '{nama}'")
# nama = "x' OR '1'='1" → mengembalikan SEMUA baris
```

```python
# BENAR — parameter terpisah dari kueri
db.execute("SELECT * FROM pengguna WHERE nama = ?", (nama,))
```

Parameter bukan sekadar "membersihkan tanda kutip". Nilai dikirim ke database secara terpisah dari kueri, jadi tidak mungkin ditafsirkan sebagai perintah. Ini pertahanan struktural, bukan penyaringan.

Aturan tanpa pengecualian: **jangan pernah menyambung input pengguna ke string SQL.** Kalau butuh nama tabel dinamis, pilih dari daftar putih di kode, jangan dari input.

### Melihat rencana kueri

```sql
EXPLAIN QUERY PLAN SELECT * FROM pesanan WHERE pelanggan_id = 5;
```

Hasilnya menunjukkan apakah database memakai indeks (`SEARCH ... USING INDEX`) atau memindai seluruh tabel (`SCAN`). `SCAN` pada tabel besar adalah tanda indeksnya belum ada.

Ini cara paling cepat menjawab "kenapa kueri ini lambat" tanpa menebak.

### Daftar periksa

1. Penyaringan dilakukan di database, bukan di loop aplikasi.
2. Tidak ada kueri di dalam loop (N+1).
3. Semua input pengguna lewat parameter, tidak pernah disambung ke string.
4. Kolom yang sering dipakai di `WHERE`/`JOIN`/`ORDER BY` punya indeks.
5. Operasi yang harus utuh dibungkus transaksi.
6. `NULL` ditangani dengan `IS NULL` dan `COALESCE`, bukan `= NULL`.
7. Kueri lambat diperiksa dengan `EXPLAIN`, bukan ditebak.
8. `COUNT(*)` dan `COUNT(kolom)` dipakai sesuai maksudnya.
