---
track: ai-llm
nomor: 0
judul: "Template modul — jangan dihapus, contoh format baku"
slug: template-modul
estimasi_menit: 10
prasyarat: []
# latihan: web = satu file, dijalankan di penyedia. laptop = panduan 6 langkah.
latihan:
  - id: contoh-latihan-1
    jenis: web
    bahasa: python
    soal: "Tulis satu baris kode yang mencetak hasil 1 + 1."
    kode_awal: |
      # tulis di sini
    output_harapan: |
      2
    solusi: |
      print(1 + 1)
    catatan_solusi: "print() menerima ekspresi dan menulis hasilnya ke stdout."
  - id: contoh-latihan-2
    jenis: laptop
    soal: "Pastikan Python terpasang dan bisa dijalankan dari terminal."
    kebutuhan:
      - "Python 3.12 atau lebih baru"
      - "Terminal (PowerShell / bash)"
    langkah:
      - perintah: "python --version"
        penjelasan: "Menampilkan versi Python yang aktif di PATH."
      - perintah: 'python -c "print(1+1)"'
        penjelasan: "Menjalankan kode satu baris tanpa membuat berkas."
    hasil: |
      Python 3.12.x
      2
    cek_berhasil:
      - "Versi yang muncul 3.12 atau lebih baru"
      - "Angka 2 tercetak di baris kedua"
    kalau_gagal:
      - error: "'python' is not recognized as an internal or external command"
        arti: "Python tidak ada di PATH Windows."
        perbaikan:
          - "Buka Settings → Apps → Advanced app settings → App execution aliases"
          - "Matikan alias python.exe dan python3.exe"
          - "Buka terminal baru, ulangi perintah"
      - error: "command not found: python"
        arti: "Di Linux/macOS perintahnya biasanya python3."
        perbaikan:
          - "Jalankan python3 --version"
    buktikan:
      perubahan: "Cetak hasil 7 * 6 alih-alih 1 + 1."
      hasil_diharapkan: "42"
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Apa keluaran dari print(1 + 1)?"
    opsi:
      a: "2"
      b: "11"
      c: "error"
    jawaban: a
    penjelasan: "Operator + pada dua angka melakukan penjumlahan, bukan penggabungan teks."
    tingkat: dasar
  - tipe: isian_singkat
    pertanyaan: "Perintah SQL untuk mengambil semua kolom dari tabel users?"
    jawaban: "select * from users"
    penjelasan: "Tanda * berarti semua kolom; FROM menentukan tabelnya."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Apa nilai yang dikembalikan print(1)?"
    opsi:
      a: "1"
      b: "None"
      c: "teks '1'"
    jawaban: b
    penjelasan: "print() menulis ke stdout lalu mengembalikan None."
    tingkat: menengah
---

# Template modul

Kamu akan bisa:
- Menjelaskan apa itu `print()` dan apa yang dilakukannya.
- Menjalankan kode Python dari terminal.

Prasyarat: tidak ada. (Ini contoh — modul sungguhan menyebut nomor modul prasyarat.)

## Apa itu `print()`

`print()` adalah fungsi bawaan Python yang menuliskan nilai ke stdout (keluaran standar). Terminal menampilkannya sebagai teks.

```python
print(1 + 1)
```

**Output yang diharapkan**

```
2
```

Baris demi baris:
- `print` — nama fungsi bawaan; tidak perlu diimpor.
- `(1 + 1)` — argumen; `+` menjumlahkan dua bilangan bulat.
- Hasil `2` dikirim ke stdout, terminal menampilkannya lalu pindah baris.

## Di pekerjaan, ini dipakai untuk apa

Mencetak nilai antara saat menelusuri bug — cara termurah memastikan sebuah variabel berisi yang kamu kira.

## Lapis 2

### Parameter `print()`

| Parameter | Default | Arti |
|---|---|---|
| `sep` | `' '` | Pemisah antar argumen |
| `end` | `'\n'` | Karakter di akhir keluaran |
| `file` | `sys.stdout` | Tujuan keluaran |
| `flush` | `False` | Paksa tulis segera |

### Kenapa begini, bukan begitu

`print()` bukan fungsi murni: ia punya efek samping (menulis ke stdout) dan mengembalikan `None`. Karena itu `x = print(1)` membuat `x` bernilai `None`, bukan `1` — kesalahan pemula yang sering terjadi.

### Error umum

| Pesan | Arti | Cara memperbaiki |
|---|---|---|
| `SyntaxError: Missing parentheses in call to 'print'` | Gaya Python 2 (`print "x"`) | Pakai `print("x")` |
| `TypeError: can only concatenate str (not "int") to str` | Menggabung teks dengan angka | `print("umur: " + str(20))` atau f-string `f"umur: {20}"` |

### Rujukan resmi

`TODO: tautan dokumentasi resmi Python untuk print()`

## Latihan

Lihat frontmatter `latihan[]`. Latihan 1 dijalankan di web; latihan 2 diikuti di laptop dengan 6 langkah baku.

## Kamu sudah bisa ini kalau…

- [ ] Bisa menjelaskan beda `print(1+1)` dan `print("1+1")` tanpa membuka dokumentasi.
- [ ] Bisa menyebut dua parameter `print()` dan efeknya.
- [ ] Latihan 1 lulus dan latihan 2 berhasil dijalankan.
