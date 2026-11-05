---
track: dotnet
nomor: 3
judul: "EF Core & migrasi: skema sebagai riwayat, bukan tebakan"
slug: ef-core-migrasi
estimasi_menit: 15
prasyarat:
  - dotnet/aspnet-core-minimal-api
latihan:
  - id: dotnet-03-latihan-1
    jenis: web
    bahasa: python
    soal: "Simulasikan cara EF Core menerapkan migrasi. Diberi empat migrasi berurutan dan dua yang sudah diterapkan, cetak tiga baris: 'sekarang: ...' berisi kolom tabel saat ini (urut abjad), 'tertunda: ...' berisi id migrasi yang belum diterapkan, dan 'sesudah: ...' berisi kolom setelah semua migrasi dijalankan. Operasi 'tambah' menambah kolom, 'hapus' membuangnya."
    kode_awal: |
      MIGRASI = [
          ("20260101_awal",  [("tambah", "Id"), ("tambah", "Nama"), ("tambah", "Harga")]),
          ("20260108_stok",  [("tambah", "Stok")]),
          ("20260112_judul", [("hapus", "Nama"), ("tambah", "Judul")]),
          ("20260120_sku",   [("tambah", "Sku")]),
      ]
      DITERAPKAN = ["20260101_awal", "20260108_stok"]

      # 1. jalankan hanya migrasi yang ada di DITERAPKAN, berurutan -> skema "sekarang"
      # 2. tertunda = id yang tidak ada di DITERAPKAN
      # 3. jalankan sisanya -> skema "sesudah"
      # 4. cetak: "sekarang: A, B, C" / "tertunda: id1 id2" / "sesudah: A, B, C"
    output_harapan: |
      sekarang: Harga, Id, Nama, Stok
      tertunda: 20260112_judul 20260120_sku
      sesudah: Harga, Id, Judul, Sku, Stok
    solusi: |
      MIGRASI = [
          ("20260101_awal",  [("tambah", "Id"), ("tambah", "Nama"), ("tambah", "Harga")]),
          ("20260108_stok",  [("tambah", "Stok")]),
          ("20260112_judul", [("hapus", "Nama"), ("tambah", "Judul")]),
          ("20260120_sku",   [("tambah", "Sku")]),
      ]
      DITERAPKAN = ["20260101_awal", "20260108_stok"]


      def jalankan(skema, operasi):
          for aksi, kolom in operasi:
              if aksi == "tambah":
                  skema.append(kolom)
              elif aksi == "hapus":
                  skema.remove(kolom)
              else:
                  raise ValueError(f"aksi tidak dikenal: {aksi}")


      skema = []
      for id_migrasi, operasi in MIGRASI:
          if id_migrasi in DITERAPKAN:
              jalankan(skema, operasi)

      tertunda = [(i, op) for i, op in MIGRASI if i not in DITERAPKAN]

      print("sekarang: " + ", ".join(sorted(skema)))
      print("tertunda: " + " ".join(i for i, _ in tertunda))

      for _, operasi in tertunda:
          jalankan(skema, operasi)

      print("sesudah: " + ", ".join(sorted(skema)))
    catatan_solusi: "EF Core menyimpan daftar migrasi yang sudah dijalankan di satu tabel (__EFMigrationsHistory) berisi id-nya. Saat `database update`, ia hanya menjalankan migrasi yang id-nya belum ada di tabel itu — persis seperti perulangan di atas. Perhatikan migrasi ketiga: ia menghapus kolom Nama lalu menambah Judul. Kalau itu maksudnya mengganti nama kolom, EF Core tidak tahu — ia benar-benar menulis DropColumn lalu AddColumn, dan data di kolom Nama hilang. Karena itu rename harus dibuat dengan tangan di berkas migrasi (RenameColumn), bukan dibiarkan hasil generate."
  - id: dotnet-03-latihan-2
    jenis: laptop
    soal: "Buat proyek dengan EF Core + SQLite, buat migrasi pertama, terapkan ke database, lalu tambah satu properti dan buat migrasi kedua. Buktikan bahwa riwayat migrasi — bukan tebakan dari model — yang membentuk skema."
    kebutuhan:
      - ".NET SDK 8 atau lebih baru (dotnet --list-sdks)"
      - "Terminal (PowerShell, cmd, atau git-bash)"
      - "Paket NuGet Microsoft.EntityFrameworkCore.Sqlite dan Microsoft.EntityFrameworkCore.Design"
    langkah:
      - perintah: "dotnet --list-sdks && dotnet tool install --global dotnet-ef"
        penjelasan: "Perintah kedua memasang CLI migrasi. Ia terpisah dari SDK, jadi harus dipasang sekali per mesin. Kalau sudah ada, pesannya 'already installed' dan itu bukan kegagalan."
      - perintah: "dotnet new web -o latihan-ef && cd latihan-ef && dotnet add package Microsoft.EntityFrameworkCore.Sqlite && dotnet add package Microsoft.EntityFrameworkCore.Design"
        penjelasan: "Sqlite adalah providernya. Design dibutuhkan tool migrasi untuk membangun DbContext saat desain — tanpa paket ini `dotnet ef` berhenti dengan pesan yang menyebut Design."
      - perintah: "Buat Model.cs berisi: public class Produk { public int Id { get; set; } public string Nama { get; set; } = \"\"; public decimal Harga { get; set; } } dan public class AppDb : DbContext { public AppDb(DbContextOptions<AppDb> o) : base(o) {} public DbSet<Produk> Produk => Set<Produk>(); }"
        penjelasan: "DbContext adalah jembatan antara kelas C# dan tabel. DbSet<Produk> berarti 'ada tabel Produk'. Properti Id dikenali sebagai primary key karena namanya Id — tanpa atribut apa pun."
      - perintah: "Ganti Program.cs menjadi: var builder = WebApplication.CreateBuilder(args); builder.Services.AddDbContext<AppDb>(o => o.UseSqlite(\"Data Source=app.db\")); var app = builder.Build(); app.MapGet(\"/produk\", (AppDb db) => db.Produk.ToList()); app.Run();"
        penjelasan: "AddDbContext mendaftarkan AppDb ke container, jadi handler bisa memintanya sebagai parameter. Connection string menunjuk berkas app.db di folder proyek."
      - perintah: "dotnet ef migrations add Awal"
        penjelasan: "MEMBANDINGKAN model dengan snapshot migrasi terakhir, lalu menulis berkas migrasi. Perintah ini TIDAK menyentuh database — tidak ada tabel yang berubah. Ia hanya menulis dua berkas baru di folder Migrations (migrasinya sendiri dan berkas Designer) plus memperbarui snapshot model."
      - perintah: "dotnet ef database update && dotnet ef migrations list"
        penjelasan: "Baru di sini database berubah: app.db dibuat dan tabel Produk lahir. `migrations list` menandai migrasi yang sudah diterapkan. Tambahkan properti Stok ke kelas Produk, jalankan `dotnet ef migrations add TambahStok` lalu `dotnet ef database update` sekali lagi untuk melihat alur yang sama berulang."
    hasil: |
      <daftar SDK, mis. 10.0.100>
      Tool 'dotnet-ef' was successfully installed.
      Build succeeded.
      Done. To undo this action, use 'ef migrations remove'
      Applying migration '20260101120000_Awal'.
      Done.
      20260101120000_Awal (Applied)
    cek_berhasil:
      - "Folder Migrations berisi satu berkas .cs per migrasi, plus AppDbContextModelSnapshot.cs"
      - "Setelah `migrations add`, app.db BELUM berubah — migrasi hanya berkas"
      - "Setelah `database update`, app.db ada dan `migrations list` menandainya (Applied)"
      - "Migrasi kedua hanya berisi satu AddColumn Stok, bukan seluruh skema diulang"
    kalau_gagal:
      - error: "Could not execute because the specified command or file was not found. Possible reasons: you misspelled a built-in dotnet command, you intended to execute a .NET program but dotnet-ef does not exist"
        arti: "CLI migrasi belum terpasang, atau folder tool-nya belum ada di PATH."
        perbaikan:
          - "dotnet tool install --global dotnet-ef"
          - "Tutup dan buka ulang terminal supaya PATH diperbarui"
          - "Kalau sudah terpasang tapi tetap tidak ketemu, jalankan lewat dotnet ef dan pastikan %USERPROFILE%\\.dotnet\\tools ada di PATH"
      - error: "Your startup project 'latihan-ef' doesn't reference Microsoft.EntityFrameworkCore.Design."
        arti: "Paket Design tidak ada, jadi tool tidak bisa membangun DbContext saat desain."
        perbaikan:
          - "dotnet add package Microsoft.EntityFrameworkCore.Design"
          - "Jalankan ulang perintah dotnet ef dari folder proyek, bukan dari folder induk"
      - error: "Unable to create a 'DbContext' of type 'AppDb'. The exception 'Unable to resolve service for type DbContextOptions' was thrown"
        arti: "AppDb dibuat tanpa opsi, biasanya karena AddDbContext belum dipanggil di Program.cs atau Program.cs sedang error."
        perbaikan:
          - "Pastikan builder.Services.AddDbContext<AppDb>(...) ada sebelum builder.Build()"
          - "Jalankan dotnet build dulu — error kompilasi di Program.cs membuat tool gagal dengan pesan yang menyesatkan"
          - "Kalau DbContext punya konstruktor tanpa parameter, hapus; EF Core butuh konstruktor yang menerima DbContextOptions"
      - error: "SQLite Error 1: 'table \"Produk\" already exists'."
        arti: "Tabel dibuat di luar sistem migrasi — biasanya karena sempat memanggil EnsureCreated()."
        perbaikan:
          - "Hapus app.db, lalu dotnet ef database update"
          - "Hapus pemanggilan EnsureCreated() dari kode — ia dan migrasi tidak boleh dipakai bersama"
          - "Kalau ragu, migrasi ulang dari database kosong lebih aman daripada menambal"
      - error: "No migrations were found in assembly 'latihan-ef'."
        arti: "Perintah dijalankan di folder atau proyek yang salah, atau belum ada migrasi sama sekali."
        perbaikan:
          - "cd ke folder yang berisi berkas .csproj"
          - "Buat migrasi dulu: dotnet ef migrations add Awal"
          - "Kalau ada beberapa proyek, tunjuk eksplisit: dotnet ef database update --project latihan-ef"
    buktikan:
      perubahan: "Hapus app.db, lalu jalankan dotnet ef database update sekali lagi tanpa mengubah model."
      hasil_diharapkan: "Database terbentuk utuh dari nol — semua migrasi dijalankan berurutan dan kolom dari migrasi kedua ikut ada. Ini buktinya: yang menentukan skema adalah riwayat migrasi, bukan keadaan model saat ini. Karena itu migrasi yang sudah dibagikan ke orang lain tidak boleh disunting; buat migrasi baru untuk memperbaikinya."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Apa yang terjadi pada database saat kamu menjalankan `dotnet ef migrations add TambahStok`?"
    opsi:
      a: "Tabel langsung mendapat kolom Stok"
      b: "Tidak ada yang berubah di database; hanya tiga berkas migrasi yang ditulis"
      c: "Database dihapus lalu dibuat ulang"
      d: "Semua data di tabel dihapus"
    jawaban: b
    penjelasan: "`migrations add` hanya menghasilkan kode: berkas migrasi (berisi operasi Up/Down) dan snapshot model. Perubahan database baru terjadi saat `database update`, yang menjalankan operasi itu. Memisahkan 'menulis rencana' dan 'menjalankan rencana' penting: rencana bisa diperiksa dan disunting sebelum menyentuh data siapa pun."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa `EnsureCreated()` tidak boleh dipakai bersama migrasi?"
    opsi:
      a: "EnsureCreated membuat tabel tanpa mencatat migrasi mana pun, sehingga `database update` berikutnya gagal atau salah kira"
      b: "EnsureCreated lebih lambat"
      c: "EnsureCreated hanya bekerja di SQL Server"
      d: "EnsureCreated menghapus tabel lain"
    jawaban: a
    penjelasan: "EnsureCreated membangun skema langsung dari model dan tidak menulis ke tabel riwayat migrasi. Akibatnya database terlihat 'kosong' bagi EF Core, lalu migrasi pertama mencoba membuat tabel yang sudah ada dan gagal. Ia memang berguna untuk prototipe dan tes sekali jalan — tapi pilih satu jalur, jangan keduanya."
    tingkat: menengah
  - tipe: pilihan_ganda
    pertanyaan: "Kamu mengganti nama properti `Nama` menjadi `Judul` lalu membuat migrasi baru. Apa isi migrasi itu, dan apa akibatnya pada data?"
    opsi:
      a: "RenameColumn; data tetap"
      b: "DropColumn Nama lalu AddColumn Judul; isi kolom Nama hilang"
      c: "Tidak ada perubahan karena EF Core mengikuti nama properti"
      d: "AlterColumn yang mempertahankan data"
    jawaban: b
    penjelasan: "EF Core membandingkan snapshot dengan model dan hanya melihat 'kolom Nama hilang, kolom Judul muncul' — ia tidak punya cara tahu itu maksudnya rename. Hasilnya DropColumn lalu AddColumn, dan datanya hilang. Perbaikannya: sunting berkas migrasi hasil generate, ganti dua operasi itu dengan migrationBuilder.RenameColumn(name: \"Nama\", table: \"Produk\", newName: \"Judul\")."
    tingkat: lanjutan
  - tipe: isian_singkat
    pertanyaan: "Perintah untuk menerapkan migrasi yang belum dijalankan ke database: dotnet ef ... update (satu kata)"
    jawaban: "database"
    penjelasan: "`dotnet ef database update` menjalankan semua migrasi yang belum tercatat, berurutan. Bisa juga diberi nama migrasi sebagai target untuk maju atau mundur ke titik tertentu — `dotnet ef database update Awal` akan menjalankan operasi Down dari migrasi sesudahnya."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa `AsNoTracking()` dipakai pada query yang hanya dibaca?"
    opsi:
      a: "Supaya hasilnya di-cache selamanya"
      b: "Supaya EF Core tidak menyimpan salinan entitas untuk mendeteksi perubahan, sehingga lebih hemat memori dan lebih cepat"
      c: "Supaya query dijalankan di database, bukan di memori"
      d: "Supaya kolom relasi otomatis ikut dimuat"
    jawaban: b
    penjelasan: "Secara default EF Core menyimpan setiap entitas yang dibaca ke ChangeTracker, supaya perubahan properti bisa dideteksi saat SaveChanges. Pemantauan itu ada biayanya: memori dan waktu perbandingan. Untuk daftar yang hanya ditampilkan, tidak ada yang perlu dilacak — AsNoTracking melewatinya."
    tingkat: menengah
---

## Lapis 1

### Model adalah kode, skema adalah hasil

Di EF Core, kamu menulis kelas C# biasa dan menyebutnya entitas. Dari kelas itu EF Core tahu bentuk tabelnya:

```csharp
public class Produk
{
    public int Id { get; set; }              // primary key: dikenali dari nama "Id"
    public string Nama { get; set; } = "";
    public decimal Harga { get; set; }       // decimal -> kolom NUMERIC/TEXT, bukan float
}

public class AppDb : DbContext
{
    public AppDb(DbContextOptions<AppDb> opsi) : base(opsi) { }
    public DbSet<Produk> Produk => Set<Produk>();
}
```

`DbContext` adalah sesi kerja dengan database: ia memegang koneksi, melacak entitas yang kamu baca, dan menerjemahkan LINQ menjadi SQL. `DbSet<Produk>` berarti "ada tabel Produk di sini".

Yang perlu dipahami sejak awal: **database tidak berubah karena kamu mengubah kelas.** Kelas hanya mengubah apa yang EF Core *kira* seharusnya ada. Yang benar-benar mengubah database adalah migrasi.

### Migrasi: rencana tertulis, bukan sihir

```
model C#  --(migrations add)-->  berkas migrasi  --(database update)-->  skema database
             menulis rencana        (bisa dibaca,           menjalankan
                                     bisa disunting)         rencana
```

Tiga perintah yang cukup:

| Perintah | Menyentuh database? | Gunanya |
|---|---|---|
| `dotnet ef migrations add <Nama>` | tidak | Menulis berkas migrasi dari selisih model vs snapshot |
| `dotnet ef database update` | ya | Menjalankan migrasi yang belum tercatat |
| `dotnet ef migrations list` | tidak | Menampilkan mana yang sudah dan belum diterapkan |

Perhatikan kolom kedua. `migrations add` tidak membuat tabel apa pun — ia hanya menulis kode. Ini bukan detail teknis kecil: artinya kamu bisa membaca rencananya lebih dulu, dan membatalkannya dengan `dotnet ef migrations remove` tanpa risiko.

### Cara EF Core tahu mana yang sudah dijalankan

Ada satu tabel bernama `__EFMigrationsHistory` berisi satu baris per migrasi yang sudah diterapkan, dengan id seperti `20260101120000_Awal`. Saat `database update`, EF Core:

1. membaca id yang ada di tabel itu,
2. memilih migrasi yang id-nya belum ada, **berurutan menurut nama**,
3. menjalankan `Up()` masing-masing di dalam transaksi.

Karena urutannya menurut nama berkas, awalan tanggal-waktu itu wajib: itulah yang menentukan urutan. Migrasi yang dibuat belakangan selalu berjalan setelah yang lebih dulu, di mesin mana pun.

### Kenapa bukan `EnsureCreated()`

`EnsureCreated()` membangun seluruh skema dari model dalam satu tembakan, tanpa menulis riwayat. Terlihat lebih sederhana, sampai kamu perlu mengubah skema: tidak ada jalan dari skema lama ke skema baru. Database produksi yang sudah berisi data tidak bisa "dibuat ulang" — ia harus diubah di tempat, dan itulah pekerjaan migrasi.

Aturan praktis: `EnsureCreated()` untuk tes yang selalu mulai dari kosong. Migrasi untuk segala hal yang datanya harus bertahan.

### Yang ditulis di dalam migrasi

```csharp
public partial class TambahStok : Migration
{
    protected override void Up(MigrationBuilder mb) =>
        mb.AddColumn<int>(name: "Stok", table: "Produk", nullable: false, defaultValue: 0);

    protected override void Down(MigrationBuilder mb) =>
        mb.DropColumn(name: "Stok", table: "Produk");
}
```

`Up` = cara maju, `Down` = cara kembali. `nullable: false` pada kolom baru mewajibkan `defaultValue`, karena baris yang sudah ada butuh nilai — tanpa itu migrasi gagal di database berisi data, walau sukses di database kosong. Ini contoh pertama dari pola yang akan berulang: **migrasi yang lolos di laptop kosong belum tentu lolos di produksi.**

### Query: LINQ yang menjadi SQL

```csharp
app.MapGet("/produk", async (AppDb db) =>
    await db.Produk
        .Where(p => p.Harga > 100_000)
        .OrderBy(p => p.Nama)
        .AsNoTracking()
        .ToListAsync());
```

`Where` dan `OrderBy` tidak dijalankan di memori — keduanya diterjemahkan menjadi `WHERE` dan `ORDER BY`, dan database yang mengerjakannya. Ini perbedaan yang menentukan: menyaring sejuta baris di C# berarti mengangkut sejuta baris lewat jaringan lebih dulu.

`AsNoTracking()` mematikan pelacakan perubahan untuk query yang hanya dibaca. Tanpa itu, EF Core menyimpan salinan setiap entitas yang dibaca supaya bisa tahu apa yang berubah saat `SaveChanges`. Untuk daftar yang cuma ditampilkan, pelacakan itu murni ongkos.

### Menyimpan perubahan

```csharp
var p = await db.Produk.FindAsync(id);
if (p is null) return Results.NotFound();

p.Harga = 150_000;
await db.SaveChangesAsync();     // di sini baru ada UPDATE
```

EF Core membandingkan nilai properti dengan salinan yang ia simpan saat membaca, lalu menulis `UPDATE` hanya untuk kolom yang berubah. Tidak ada `db.Update(p)` yang diperlukan untuk entitas yang dibaca lewat context yang sama — memanggilnya justru menandai semua kolom sebagai berubah.

## Lapis 2

### Connection string: jangan di kode

```json
// appsettings.json
{ "ConnectionStrings": { "AppDb": "Data Source=app.db" } }
```

```csharp
builder.Services.AddDbContext<AppDb>(o =>
    o.UseSqlite(builder.Configuration.GetConnectionString("AppDb")));
```

Untuk produksi, nilainya datang dari environment variable atau secrets manager, bukan dari berkas yang ikut ter-commit. Connection string memuat kata sandi — memperlakukannya sebagai kode berarti menyimpannya di riwayat git selamanya.

### Menjalankan migrasi di produksi

Ada dua jalur, dan bedanya penting:

| Cara | Kapan cocok | Risiko |
|---|---|---|
| `dotnet ef database update` manual | Satu server, kamu yang mengawasi | Lupa dijalankan saat deploy |
| SQL script (`dotnet ef migrations script --idempotent`) | Tim dengan proses deploy terkontrol | Perlu langkah tambahan di pipeline |
| Otomatis saat startup (`db.Database.Migrate()`) | Prototipe, satu instance | Dua instance start bersamaan → migrasi balapan |

Jebakan yang paling sering: `Database.Migrate()` di `Program.cs` pada aplikasi yang di-scale ke beberapa instance. Dua proses start pada detik yang sama akan mencoba menjalankan migrasi yang sama; salah satunya gagal, atau lebih buruk, keduanya menulis setengah jalan. Kalau tetap ingin otomatis, jalankan sebagai langkah terpisah sebelum aplikasi dinyalakan, bukan di dalamnya.

`--idempotent` membuat script yang memeriksa `__EFMigrationsHistory` sebelum menjalankan tiap migrasi, jadi aman dijalankan berulang.

### Masalah N+1

```csharp
// 1 query untuk pesanan, lalu 1 query untuk SETIAP pesanan
var pesanan = await db.Pesanan.ToListAsync();
foreach (var p in pesanan)
    Console.WriteLine(p.Pelanggan.Nama);
```

Kalau navigasi tidak dimuat lebih dulu, EF Core mengambil `Pelanggan` satu per satu — sepuluh pesanan berarti sebelas query. Perbaikannya satu baris:

```csharp
var pesanan = await db.Pesanan.Include(p => p.Pelanggan).ToListAsync();
```

Ini menjadi `JOIN`, satu query. Gejalanya khas: halaman yang benar tapi lambat, dan query yang jumlahnya tumbuh seiring jumlah baris.

### Perubahan skema yang berbahaya

| Perubahan | Yang ditulis EF Core | Aman? |
|---|---|---|
| Tambah kolom nullable | `AddColumn` | Ya |
| Tambah kolom wajib | `AddColumn` + `defaultValue` | Ya, kalau default masuk akal |
| Ganti nama kolom | `DropColumn` + `AddColumn` | **Tidak** — data hilang |
| Ganti tipe kolom | `AlterColumn` | Tergantung — sebagian provider membangun ulang tabel |
| Hapus kolom | `DropColumn` | Ya, tapi tidak bisa dibatalkan |

Untuk rename, sunting migrasinya dan pakai `RenameColumn`. Untuk perubahan yang merusak (memecah tabel), pakai pola tiga langkah: tambah kolom baru, isi datanya, baru hapus yang lama di migrasi terpisah — supaya ada titik di mana kedua bentuk tersedia dan kode lama masih jalan.

### Konkurensi: dua orang menyimpan bersamaan

```csharp
public class Produk
{
    public int Id { get; set; }
    public decimal Harga { get; set; }

    [Timestamp]                       // di SQLite: butuh penanganan sendiri
    public byte[] Versi { get; set; } = Array.Empty<byte>();
}
```

Dengan token konkurensi, EF Core menambahkan `WHERE Versi = @versiLama` pada setiap `UPDATE`. Kalau tidak ada baris yang terpengaruh, artinya orang lain sudah mengubahnya lebih dulu, dan EF Core melempar `DbUpdateConcurrencyException`. Itu bukan error yang perlu disembunyikan — itu sinyal bahwa keputusan pengguna didasarkan pada data yang sudah basi.

### Error umum

| Pesan | Arti | Cara memperbaiki |
|---|---|---|
| `doesn't reference Microsoft.EntityFrameworkCore.Design` | Paket Design tidak ada | `dotnet add package Microsoft.EntityFrameworkCore.Design` |
| `Unable to create a 'DbContext' of type` | `AddDbContext` tidak ada, atau Program.cs gagal dikompilasi | Perbaiki `dotnet build` dulu; pastikan `AddDbContext` sebelum `Build()` |
| `table "X" already exists` | `EnsureCreated()` pernah dipakai bersama migrasi | Hapus berkas `.db`, jalankan `database update` |
| `SQLite Error 1: 'no such table: X'` | Migrasi belum diterapkan | `dotnet ef database update` |
| `The property 'X' could not be mapped` | Tipe properti tidak dikenal provider | Tambah `[NotMapped]`, konversi nilai, atau ubah tipenya |
| `DbUpdateConcurrencyException` | Baris sudah diubah proses lain | Muat ulang, gabungkan perubahan, ulangi — jangan timpa buta |
| Migrasi terlihat "hilang" setelah pull | Berkas migrasi tidak ikut ter-commit | Commit folder `Migrations/` bersama kodenya |

### Daftar periksa sebelum migrasi menyentuh data sungguhan

1. Berkas migrasi dibaca, bukan hanya di-generate — terutama kalau ada rename atau hapus kolom.
2. Kolom wajib baru punya `defaultValue`.
3. `Down()` masuk akal: kalau migrasi ini dibatalkan, apakah datanya masih bisa dipulihkan?
4. Migrasi yang sudah di-push tidak pernah disunting; perbaikan dibuat sebagai migrasi baru.
5. Sudah dicoba pada salinan database berisi data, bukan hanya database kosong.
6. Folder `Migrations/` ter-commit.
7. Backup diambil sebelum migrasi yang menghapus atau mengubah tipe kolom.
8. Aplikasi yang sedang berjalan masih cocok dengan skema selama migrasi berlangsung (atau ada downtime yang direncanakan).

### Rujukan resmi

`TODO: tautan dokumentasi resmi Microsoft untuk EF Core migrations dan DbContext`

## Latihan

Latihan 1 meniru cara EF Core memilih migrasi: kamu menjalankan yang sudah tercatat, mencetak yang tertunda, lalu menerapkan sisanya. Setelah menulisnya, tabel riwayat migrasi berhenti terasa seperti bagian internal framework — ia hanya daftar id, dan urutan nama adalah urutan eksekusi. Latihan 2 melakukannya dengan EF Core sungguhan di SQLite, termasuk membuktikan bahwa `migrations add` tidak menyentuh database.

## Kamu sudah bisa ini kalau…

- [ ] Bisa menjelaskan kenapa `migrations add` tidak mengubah database.
- [ ] Tahu di tabel mana EF Core mencatat migrasi yang sudah diterapkan, dan kenapa urutan nama berkas penting.
- [ ] Bisa menyebut kenapa rename properti menghasilkan `DropColumn` + `AddColumn`, dan cara memperbaikinya.
- [ ] Tahu kapan `EnsureCreated()` boleh dipakai dan kapan tidak.
- [ ] Bisa menjelaskan apa yang dilakukan `AsNoTracking()` dan kenapa ia menghemat.
- [ ] Latihan 1 lulus dan latihan 2 berhasil dijalankan.
