---
track: dotnet
nomor: 1
judul: "C# dasar & tipe"
slug: csharp-dasar-tipe
estimasi_menit: 13
prasyarat: []
latihan:
  - id: dotnet-01-latihan-1
    jenis: web
    bahasa: python
    soal: "Dua perilaku tipe angka C# yang paling sering mengejutkan: pembagian int membuang sisa ke arah NOL, dan int 32-bit meluap diam-diam. Tiru keduanya di Python, cetak hasilnya dalam bentuk '<a> / <b> = <hasil>', lalu satu baris luapan."
    kode_awal: |
      BATAS = 2 ** 31  # int C# = 32 bit, rentangnya -2147483648 .. 2147483647

      pasangan = [(7, 2), (-7, 2), (-7, -2), (7, -2)]

      # 1. bagi tiap pasangan seperti C#: buang sisa, membulatkan ke arah nol
      # 2. tambahkan 1 ke 2147483647, bungkus hasilnya ke rentang int32
      # 3. cetak "2147483647 + 1 = <hasil>"
    output_harapan: |
      7 / 2 = 3
      -7 / 2 = -3
      -7 / -2 = 3
      7 / -2 = -3
      2147483647 + 1 = -2147483648
    solusi: |
      BATAS = 2 ** 31

      pasangan = [(7, 2), (-7, 2), (-7, -2), (7, -2)]


      def bagi_alacsharp(a, b):
          """Bagi dua int, buang sisa, membulatkan ke arah NOL."""
          hasil = abs(a) // abs(b)
          if (a < 0) != (b < 0):
              hasil = -hasil
          return hasil


      def ke_int32(x):
          """Bungkus nilai ke rentang int C#; inilah yang terjadi saat meluap."""
          return ((x + BATAS) % (2 * BATAS)) - BATAS


      for a, b in pasangan:
          print(f"{a} / {b} = {bagi_alacsharp(a, b)}")

      print(f"2147483647 + 1 = {ke_int32(2147483647 + 1)}")
    catatan_solusi: "Pembagian int di C# membulatkan ke arah nol: -7 / 2 menghasilkan -3, sedangkan Python // menghasilkan -4 karena membulatkan ke bawah. Ini bukan bug di salah satu bahasa, hanya aturan yang berbeda — dan sumber selisih hitungan yang sulit dilacak saat memindahkan rumus antara dua bahasa. Baris luapan menjelaskan kenapa: int hanya 32 bit, jadi 2147483648 tidak punya tempat dan nilainya berbalik menjadi -2147483648 tanpa pesan error. C# hanya melempar OverflowException kalau kamu memintanya lewat checked."
  - id: dotnet-01-latihan-2
    jenis: laptop
    soal: "Pasang .NET SDK, buat aplikasi console, lalu buktikan sendiri bahwa luapan int terjadi diam-diam dan berubah begitu tipenya diganti long."
    kebutuhan:
      - "Windows/macOS/Linux dengan .NET SDK 8 atau lebih baru"
      - "Terminal (PowerShell, cmd, atau bash)"
      - "Editor teks apa pun (VS Code sudah cukup)"
    langkah:
      - perintah: "dotnet --list-sdks"
        penjelasan: "Menampilkan SDK yang terpasang beserta foldernya. Kalau perintah ini tidak dikenal, SDK belum ada di PATH — lihat bagian 'Kalau gagal'."
      - perintah: "dotnet new console -o latihan-csharp && cd latihan-csharp"
        penjelasan: "Membuat proyek console. Isinya dua berkas penting: latihan-csharp.csproj (target framework) dan Program.cs (kode). Sejak .NET 6 tidak ada class Program pembungkus — kode ditulis langsung di tingkat atas berkas ('top-level statements')."
      - perintah: "dotnet run"
        penjelasan: "Kompilasi lalu jalankan. Output pertama adalah 'Hello, World!' dari template. Perhatikan tidak ada langkah kompilasi terpisah seperti pada Java — dotnet run melakukan keduanya."
      - perintah: "Buka Program.cs, ganti seluruh isinya dengan: int x = 2147483647; x = x + 1; Console.WriteLine($\"2147483647 + 1 = {x}\"); Console.WriteLine($\"7 / 2 = {7 / 2}\"); Console.WriteLine($\"-7 / 2 = {-7 / 2}\");"
        penjelasan: "Variabel x ditugaskan dulu baru ditambah. Ini penting: kalau keduanya konstanta, kompilator menolak di waktu kompilasi (CS0220). Lewat variabel, luapan lolos dan terjadi saat program berjalan."
      - perintah: "dotnet run"
        penjelasan: "Output menunjukkan luapan: 2147483648 tidak muat di int, jadi hasilnya negatif. Dua baris berikutnya menunjukkan pembagian int membuang sisa, dan -7 / 2 menjadi -3 (bukan -4 seperti di Python)."
      - perintah: "Ubah int menjadi long pada baris pertama, jalankan dotnet run lagi"
        penjelasan: "long adalah 64 bit, jadi 2147483648 muat. Hasilnya berubah jadi positif — bukti bahwa masalahnya lebar tipe, bukan aturan bahasa."
    hasil: |
      <versi SDK, mis. 10.0.100>
      Hello, World!
      2147483647 + 1 = -2147483648
      7 / 2 = 3
      -7 / 2 = -3
      2147483647 + 1 = 2147483648
    cek_berhasil:
      - "dotnet --list-sdks mencetak minimal satu baris berisi versi 8.0 atau lebih baru"
      - "Run pertama mencetak Hello, World!"
      - "Run kedua mencetak -2147483648 pada baris luapan, dan -3 untuk -7 / 2"
      - "Setelah diganti long, angka luapan menjadi 2147483648 (positif)"
    kalau_gagal:
      - error: "'dotnet' is not recognized as an internal or external command"
        arti: "SDK tidak terpasang, atau PATH belum diperbarui di terminal yang sedang terbuka."
        perbaikan:
          - "Pasang dari https://dotnet.microsoft.com/download lalu tutup dan buka ulang terminal"
          - "Di Windows, cek dengan where dotnet — harus menunjuk ke folder dotnet di Program Files"
          - "Kalau baru saja memasang: terminal lama menyimpan PATH lama, tidak akan pernah menemukannya"
      - error: "error NETSDK1045: The current .NET SDK does not support targeting .NET ..."
        arti: "Proyek meminta versi .NET yang lebih baru daripada SDK yang terpasang."
        perbaikan:
          - "Lihat versi SDK dengan dotnet --list-sdks"
          - "Pasang SDK yang lebih baru, atau turunkan TargetFramework di berkas .csproj"
          - "Kalau ada global.json di folder induk, ia mengunci versi SDK — hapus atau sesuaikan"
      - error: "error CS0220: The operation overflows at compile time in checked mode"
        arti: "Kamu menjumlahkan dua konstanta yang sudah pasti meluap; kompilator menangkapnya sebelum program jalan."
        perbaikan:
          - "Simpan dulu ke variabel: int x = 2147483647; lalu x = x + 1;"
          - "Atau pakai long supaya rentangnya cukup"
      - error: "error CS0029: Cannot implicitly convert type 'string' to 'int'"
        arti: "Menugaskan teks ke variabel angka. C# tidak mengonversi diam-diam seperti JavaScript."
        perbaikan:
          - "Pakai int.Parse(\"42\") atau Convert.ToInt32 untuk mengubah teks menjadi angka"
          - "Atau simpan sebagai string kalau memang tidak akan dihitung"
      - error: "error CS0165: Use of unassigned local variable 'x'"
        arti: "Variabel lokal dideklarasikan tanpa nilai lalu dibaca."
        perbaikan:
          - "Beri nilai saat deklarasi: int x = 0;"
          - "C# mewajibkan variabel lokal punya nilai sebelum dibaca — ini yang mencegah bug 'undefined' di bahasa lain"
    buktikan:
      perubahan: "Setelah melihat luapan pada int, ganti tipe x menjadi long (dan tambahkan huruf L pada 2147483647L kalau perlu), lalu jalankan ulang."
      hasil_diharapkan: "Angka yang tadinya -2147483648 berubah menjadi 2147483648. Tidak ada perubahan kode lain — hanya lebar tipe. Ini menjelaskan kenapa kolom id dan uang di sistem produksi tidak boleh memakai int."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Berapa hasil -7 / 2 pada dua variabel bertipe int di C#?"
    opsi:
      a: "-3"
      b: "-4"
      c: "-3.5"
      d: "error saat kompilasi"
    jawaban: a
    penjelasan: "Pembagian int membuang sisa dan membulatkan ke arah nol, jadi -3,5 menjadi -3. Python membulatkan ke bawah sehingga -7 // 2 menghasilkan -4. Menyalin rumus antara dua bahasa tanpa menyadari perbedaan ini menghasilkan selisih satu yang sulit dilacak, terutama pada perhitungan pembagian rata atau paginasi."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa harga uang sebaiknya disimpan sebagai decimal, bukan double?"
    opsi:
      a: "decimal lebih cepat dihitung"
      b: "double menyimpan pecahan biner sehingga 0,1 + 0,2 tidak tepat sama dengan 0,3"
      c: "double tidak bisa menyimpan angka besar"
      d: "decimal bisa menyimpan teks"
    jawaban: b
    penjelasan: "double adalah pecahan biner IEEE 754: banyak angka desimal tidak punya bentuk biner yang tepat, dan selisihnya menumpuk setelah penjumlahan berulang. decimal menyimpan basis 10, jadi 0,1 + 0,2 tepat sama dengan 0,3 — dan itulah yang dibutuhkan saat mencocokkan total faktur dengan pembayaran."
    tingkat: menengah
  - tipe: pilihan_ganda
    pertanyaan: "Apa yang terjadi saat variabel int bernilai 2147483647 ditambah 1 di dalam blok unchecked (keadaan bawaan C#)?"
    opsi:
      a: "Program berhenti dengan OverflowException"
      b: "Nilainya menjadi 2147483648"
      c: "Nilainya berbalik menjadi -2147483648 tanpa pesan"
      d: "Kompilator menolak kode itu"
    jawaban: c
    penjelasan: "int adalah 32 bit dua-komplemen dengan rentang -2147483648 sampai 2147483647. Lewat dari batas atas, bitnya berputar ke batas bawah tanpa peringatan. Bungkus perhitungan dengan checked { } kalau kamu lebih suka program berhenti daripada menyimpan angka salah — untuk perhitungan uang, berhenti lebih baik."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Kata kunci untuk mendeklarasikan variabel yang tipenya disimpulkan kompilator, tanpa menghapus tipe statisnya, adalah ..."
    jawaban: "var"
    penjelasan: "var bukan dynamic. Tipenya ditetapkan sekali saat kompilasi dari nilai di sebelah kanan, dan setelah itu tidak bisa berubah: var x = 1; lalu x = \"teks\"; ditolak kompilator. Ia hanya menghemat penulisan tipe yang panjang seperti Dictionary<string, List<int>>, bukan melemahkan pengecekan tipe."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Apa yang dilakukan `int? umur = null;` yang tidak bisa dilakukan `int umur = null;`?"
    opsi:
      a: "Mengubah int menjadi string"
      b: "Mengizinkan int menyimpan nilai kosong lewat Nullable<int>"
      c: "Membuat variabel menjadi global"
      d: "Mematikan pemeriksaan tipe untuk variabel itu"
    jawaban: b
    penjelasan: "int adalah tipe nilai: ia selalu punya nilai, dan 'tidak ada' bukan salah satunya. Tanda ? membungkusnya menjadi Nullable<int> — sebuah struct dengan dua field, nilai dan penanda hasValue. Sejak C# 8, referensi null pada tipe yang tidak nullable juga diperingatkan kompilator, dan itulah cara C# memindahkan sebagian besar bug null dari produksi ke waktu kompilasi."
    tingkat: lanjutan
---

## Lapis 1

### Bahasa yang menolak dulu, bukan nanti

C# adalah bahasa bertipe statis: setiap variabel punya tipe yang ditetapkan saat kompilasi, dan kompilator menolak kode yang mencampur tipe tanpa aturan. JavaScript baru memberitahu kesalahan tipe saat baris itu dijalankan — kadang berbulan-bulan kemudian, di server produksi, pada data pelanggan. C# memberitahunya saat kamu menekan build.

Bedanya terasa pada satu hal: di C#, "kode berhasil dikompilasi" sudah berarti sebagian besar kesalahan sepele tidak ada.

```csharp
int umur = "tiga puluh";   // ditolak kompilator: CS0029
```

### Tipe angka: pilih berdasarkan rentang dan ketepatan

| Tipe | Ukuran | Rentang / ketepatan | Dipakai untuk |
|---|---|---|---|
| `byte` | 8 bit | 0 – 255 | data biner, warna |
| `int` | 32 bit | -2147483648 – 2147483647 | hitungan, id kecil, paginasi |
| `long` | 64 bit | ±9,2 × 10¹⁸ | id database, timestamp |
| `float` | 32 bit | ~7 digit | grafis, bukan uang |
| `double` | 64 bit | ~15 digit | ilmu hitung, bukan uang |
| `decimal` | 128 bit | 28–29 digit basis 10 | uang, pajak, kurs |

Dua aturan yang menyelamatkan banyak proyek:

1. **Uang selalu `decimal`.** `double` menyimpan pecahan biner, sehingga `0.1 + 0.2` tidak pernah tepat `0.3`. Pada satu baris selisihnya tidak terlihat; setelah ribuan penjumlahan, total faktur tidak cocok dengan pembayaran dan tidak ada yang tahu kenapa.
2. **Id dan timestamp selalu `long`.** `int` hanya sampai sekitar 2,1 miliar — bisa terlampaui oleh tabel yang tumbuh cepat, dan kolom id yang harus diubah tipenya di produksi adalah migrasi yang mahal.

### `int` meluap tanpa suara

```csharp
int x = 2147483647;
x = x + 1;
Console.WriteLine(x);   // -2147483648
```

Tidak ada error, tidak ada peringatan. Nilainya berputar ke batas bawah karena `int` hanya 32 bit dua-komplemen. Perhatikan bahwa `x` ditugaskan lebih dulu: kalau kamu menulis `int x = 2147483647 + 1;`, kompilator menolaknya karena kedua sisi konstanta dan luapannya sudah pasti.

Kalau kamu lebih suka program berhenti daripada menyimpan angka salah:

```csharp
checked
{
    x = x + 1;   // melempar OverflowException
}
```

Untuk perhitungan uang, berhenti lebih baik daripada diam-diam salah.

### `string`: objek yang tidak bisa diubah

`string` di C# immutable. Setiap operasi yang "mengubah" teks sebenarnya membuat string baru:

```csharp
string a = "halo";
string b = a.ToUpper();   // "HALO", tapi a tetap "halo"
```

Konsekuensinya: menggabung teks di dalam loop dengan `+` membuat satu string baru per putaran. Untuk ratusan ribu baris, pakai `StringBuilder` — bukan karena gaya, tapi karena biayanya nyata.

String interpolation `$"..."` adalah cara menulis gabungan teks yang bisa dibaca:

```csharp
Console.WriteLine($"Total: {total:N0} rupiah");
```

`N0` adalah format angka dengan pemisah ribuan dan tanpa desimal — ditangani runtime, bukan dihitung sendiri.

### `var` bukan `dynamic`

```csharp
var daftar = new List<string>();   // tipenya List<string>, tetap statis
```

`var` hanya meminta kompilator menyimpulkan tipe dari nilai di kanan. Setelah itu tipenya terkunci: `var x = 1;` lalu `x = "teks";` ditolak. Yang dihemat cuma pengetikan tipe panjang — pengecekan tipe tetap penuh.

### Null: kesalahan miliaran dolar, ditangani di kompilasi

Tipe nilai seperti `int` selalu punya nilai; "tidak ada" bukan salah satunya. Kalau sebuah kolom boleh kosong, tipenya ditulis dengan tanda tanya:

```csharp
int? umur = null;              // Nullable<int>
string? catatan = null;        // referensi yang boleh null
```

Sejak C# 8, proyek baru mengaktifkan nullable reference types: kompilator memperingatkan saat kamu membaca sesuatu yang mungkin null tanpa memeriksanya dulu. Ini memindahkan bug null yang biasanya muncul di produksi ke waktu build.

### Di pekerjaan, ini dipakai untuk apa

Hampir setiap bug uang yang pernah saya lihat di sistem keuangan berasal dari satu keputusan awal: memakai `double` untuk harga. Dan hampir setiap bug "angka jadi negatif" berasal dari `int` yang meluap pada id atau counter. Dua keputusan tipe di awal proyek lebih murah daripada dua migrasi di tengah jalan.

## Lapis 2

### `struct` dan `class`: di mana datanya tinggal

| | `struct` | `class` |
|---|---|---|
| Disimpan di | stack / dalam objek induk | heap, diakses lewat referensi |
| Penugasan | menyalin seluruh nilai | menyalin referensi |
| Bisa null | tidak (kecuali `struct?`) | ya |
| Cocok untuk | nilai kecil, tidak berubah (titik, uang, rentang) | entitas dengan identitas |

```csharp
struct Titik { public int X; public int Y; }

var a = new Titik { X = 1, Y = 2 };
var b = a;        // salinan utuh
b.X = 99;         // a.X tetap 1
```

Aturan praktis: kalau dua nilai dengan isi sama memang harus dianggap sama, `struct` atau `record struct`. Kalau objek itu punya identitas (dua pelanggan dengan nama sama tetap dua pelanggan), `class`.

### `record`: kesamaan berdasarkan isi

```csharp
public record Pelanggan(string Nama, string Kota);

var p1 = new Pelanggan("Toko Sinar", "Bandung");
var p2 = new Pelanggan("Toko Sinar", "Bandung");

Console.WriteLine(p1 == p2);   // True
```

Dengan `class`, `p1 == p2` akan `False` karena yang dibandingkan alamat memori. `record` memberi kesamaan berdasarkan nilai, `ToString()` yang bisa dibaca, dan `with` untuk menyalin dengan satu field berubah:

```csharp
var pindah = p1 with { Kota = "Jakarta" };
```

Untuk DTO dan hasil query, `record` menghapus puluhan baris kode yang isinya hanya membandingkan field satu per satu.

### Boxing: kenapa `object` mahal

```csharp
object o = 42;      // boxing: int disalin ke heap
int n = (int)o;     // unboxing: disalin kembali
```

Setiap boxing mengalokasikan objek di heap dan menambah pekerjaan untuk garbage collector. Di dalam loop yang berjalan sejuta kali, ini terlihat di profiler. Sebab itu koleksi generik (`List<int>`) jauh lebih cepat daripada koleksi lama (`ArrayList`) yang menyimpan `object`.

### `switch` expression dan pattern matching

```csharp
string kelas = total switch
{
    < 100_000 => "kecil",
    < 1_000_000 => "sedang",
    _ => "besar",
};
```

Bentuk ini mengembalikan nilai, jadi tidak perlu variabel yang diisi di setiap `case` lalu dilupakan di satu cabang. `_` adalah pola "selain yang di atas" — dan kompilator memperingatkan kalau ada kemungkinan yang tidak tertangani.

`100_000` adalah penulisan angka yang sama dengan `100000`; garis bawah hanya pemisah mata.

### Error umum

| Pesan | Arti | Cara memperbaiki |
|---|---|---|
| `CS0029: Cannot implicitly convert type 'string' to 'int'` | Menugaskan teks ke angka | `int.Parse(s)` atau `Convert.ToInt32(s)` |
| `CS0220: The operation overflows at compile time in checked mode` | Penjumlahan dua konstanta yang pasti meluap | Simpan ke variabel dulu, atau pakai `long` |
| `CS0165: Use of unassigned local variable` | Variabel lokal dibaca sebelum diberi nilai | Beri nilai saat deklarasi |
| `CS8602: Dereference of a possibly null reference` | Membaca properti dari nilai yang bisa null | Periksa `!= null`, atau pakai `?.` dan `??` |
| `CS0128: A local variable named 'x' is already defined` | Deklarasi dua kali di blok yang sama | Ganti nama atau pakai ulang variabelnya |
| `NullReferenceException` saat runtime | Memanggil anggota pada referensi null | Pakai `?.`, atau pola `if (x is not null)` |

### Daftar periksa sebelum menulis model data baru

1. Uang memakai `decimal`, bukan `double` atau `float`.
2. Id dan timestamp memakai `long`, bukan `int`.
3. Kolom yang boleh kosong ditandai `?`, dan setiap pembacaannya diperiksa.
4. Nilai yang dibandingkan berdasarkan isi memakai `record`, bukan `class` dengan `==` yang tidak ditulis.
5. Tidak ada `object` di jalur panas; koleksi memakai tipe generik.
6. `checked` dipertimbangkan untuk perhitungan uang dan hitungan yang tidak boleh salah.
7. Proyek mengaktifkan `<Nullable>enable</Nullable>`.

### Rujukan resmi

`TODO: tautan dokumentasi resmi Microsoft untuk tipe bawaan C# dan nullable reference types`

## Latihan

Latihan 1 meniru dua perilaku tipe angka C# di Python — pembagian yang membulatkan ke nol dan luapan 32 bit — supaya selisihnya terlihat hitam di atas putih sebelum kamu menemuinya di kode. Latihan 2 membuktikannya di compiler sungguhan: `int` meluap diam-diam, `long` tidak.

## Kamu sudah bisa ini kalau…

- [ ] Bisa menjelaskan kenapa `-7 / 2` menghasilkan `-3` di C# dan `-4` di Python.
- [ ] Bisa menyebut tipe yang benar untuk harga, id, dan persentase diskon.
- [ ] Tahu apa yang terjadi saat `int` bernilai 2147483647 ditambah 1, dan cara membuatnya berhenti.
- [ ] Bisa menjelaskan kenapa `var` tidak melemahkan pengecekan tipe.
- [ ] Tahu beda `record` dan `class` saat membandingkan dua objek dengan isi sama.
- [ ] Latihan 1 lulus dan latihan 2 berhasil dijalankan.
