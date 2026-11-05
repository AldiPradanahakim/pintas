---
track: dotnet
nomor: 2
judul: "ASP.NET Core minimal API: rute, hasil, dan pipeline"
slug: aspnet-core-minimal-api
estimasi_menit: 14
prasyarat:
  - dotnet/csharp-dasar-tipe
latihan:
  - id: dotnet-02-latihan-1
    jenis: web
    bahasa: python
    soal: "Tiru pencocokan rute ASP.NET Core. Diberi empat rute terdaftar dan lima permintaan, cetak satu baris per permintaan berisi status yang akan dikembalikan: 200, 204, 404 (tidak ada rute yang cocok), atau 405 (jalurnya ada tapi metodenya tidak). Lalu cetak rekap jumlah per status."
    kode_awal: |
      ENDPOINT = [
          ("GET", "/produk"),
          ("POST", "/produk"),
          ("GET", "/produk/{id}"),
          ("DELETE", "/produk/{id}"),
      ]

      PERMINTAAN = [
          ("GET", "/produk"),
          ("GET", "/produk/7"),
          ("PUT", "/produk/7"),
          ("GET", "/produk/7/harga"),
          ("DELETE", "/produk/7"),
      ]

      # 1. cocokkan pola ke path: segmen {nama} cocok dengan satu segmen apa pun
      # 2. tidak ada pola cocok -> 404; pola cocok tapi metode lain -> 405
      # 3. GET -> 200, DELETE -> 204
      # 4. cetak "<METODE> <path> -> <status>", lalu rekap "<status>: <jumlah>"
    output_harapan: |
      GET /produk -> 200
      GET /produk/7 -> 200 id=7
      PUT /produk/7 -> 405
      GET /produk/7/harga -> 404
      DELETE /produk/7 -> 204 id=7
      ---
      200: 2
      204: 1
      404: 1
      405: 1
    solusi: |
      ENDPOINT = [
          ("GET", "/produk"),
          ("POST", "/produk"),
          ("GET", "/produk/{id}"),
          ("DELETE", "/produk/{id}"),
      ]

      PERMINTAAN = [
          ("GET", "/produk"),
          ("GET", "/produk/7"),
          ("PUT", "/produk/7"),
          ("GET", "/produk/7/harga"),
          ("DELETE", "/produk/7"),
      ]


      def cocok(pola, path):
          a, b = pola.strip("/").split("/"), path.strip("/").split("/")
          if len(a) != len(b):
              return None
          nilai = {}
          for p, q in zip(a, b):
              if p.startswith("{") and p.endswith("}"):
                  nilai[p[1:-1]] = q
              elif p != q:
                  return None
          return nilai


      hitung = {"200": 0, "204": 0, "404": 0, "405": 0}
      for metode, path in PERMINTAAN:
          jalur_ada = [(m, pola) for m, pola in ENDPOINT if cocok(pola, path) is not None]
          if not jalur_ada:
              print(f"{metode} {path} -> 404")
              hitung["404"] += 1
              continue
          pas = [(m, pola) for m, pola in jalur_ada if m == metode]
          if not pas:
              print(f"{metode} {path} -> 405")
              hitung["405"] += 1
              continue
          m, pola = pas[0]
          nilai = cocok(pola, path)
          kode = 204 if m == "DELETE" else 200
          tambahan = "".join(f" {k}={v}" for k, v in nilai.items())
          print(f"{metode} {path} -> {kode}{tambahan}")
          hitung[str(kode)] += 1

      print("---")
      for k in sorted(hitung):
          print(f"{k}: {hitung[k]}")
    catatan_solusi: "Tiga jawaban berbeda untuk tiga kegagalan yang berbeda, dan bedanya penting saat menelusuri bug: 404 berarti tidak ada rute yang cocok sama sekali — path-nya salah atau belum didaftarkan. 405 berarti path-nya ada tapi metode itu tidak didaftarkan di situ, biasanya karena klien memakai PUT ke endpoint yang hanya menerima GET. Framework yang membedakan keduanya memaksa kamu mendaftarkan metode secara eksplisit, dan itu justru menghemat waktu debug. Perhatikan /produk/7/harga: jumlah segmennya beda, jadi 404 — bukan 405, karena tidak ada pola berelemen tiga yang cocok."
  - id: dotnet-02-latihan-2
    jenis: laptop
    soal: "Buat proyek minimal API, daftarkan empat endpoint, lalu buktikan sendiri tiga kode status: 200 untuk data yang ada, 404 untuk id yang tidak ada, dan 405 untuk metode yang tidak didaftarkan pada jalur itu."
    kebutuhan:
      - ".NET SDK 8 atau lebih baru (dotnet --list-sdks)"
      - "Terminal (PowerShell, cmd, atau git-bash)"
      - "curl (sudah ada di Windows 10 ke atas)"
    langkah:
      - perintah: "dotnet --list-sdks"
        penjelasan: "Memastikan SDK ada dan menampilkan versinya. Versi utama menentukan template apa yang tersedia — kalau tidak ada baris apa pun, SDK belum terpasang."
      - perintah: "dotnet new web -o latihan-api && cd latihan-api"
        penjelasan: "Template 'web' adalah ASP.NET Core kosong: satu berkas Program.cs berisi empat baris. Template 'webapi' menambahkan contoh cuaca dan (di .NET 9 ke atas) endpoint OpenAPI — untuk belajar, yang kosong lebih baik."
      - perintah: "dotnet run"
        penjelasan: "Menjalankan server Kestrel. Perhatikan baris 'Now listening on: http://localhost:5xxx' — nomor port berbeda tiap proyek, jadi bacalah dari keluaran ini, jangan menebak. Biarkan terminal ini terbuka; perintah berikutnya di terminal kedua."
      - perintah: "Buka Program.cs dan ganti seluruh isinya dengan: var builder = WebApplication.CreateBuilder(args); var app = builder.Build(); var produk = new Dictionary<int, string> { [1] = \"Kopi\", [3] = \"Teh\" }; app.MapGet(\"/produk\", () => produk); app.MapGet(\"/produk/{id:int}\", (int id) => produk.TryGetValue(id, out var nama) ? Results.Ok(nama) : (IResult)Results.NotFound()); app.MapPost(\"/produk\", () => Results.Created(\"/produk/1\", null)); app.MapDelete(\"/produk/{id:int}\", (int id) => produk.Remove(id) ? Results.NoContent() : (IResult)Results.NotFound()); app.Run();"
        penjelasan: "Empat endpoint, satu dictionary sebagai penyimpanan sementara. {id:int} adalah batasan tipe: hanya segmen yang bisa dibaca sebagai int yang cocok, sisanya 404 sebelum handler dipanggil."
      - perintah: "Di terminal kedua: curl -i http://localhost:5xxx/produk ; curl -i http://localhost:5xxx/produk/99 ; curl -i -X PUT http://localhost:5xxx/produk/7"
        penjelasan: "Tiga permintaan, tiga status. Ganti 5xxx dengan port yang muncul di langkah 3. Baris pertama respons selalu 'HTTP/1.1 <kode>'."
      - perintah: "Ubah rute menjadi /produk/{id} (tanpa :int), jalankan ulang, lalu curl -i http://localhost:5xxx/produk/abc"
        penjelasan: "Tanpa batasan, rute cocok untuk 'abc' tapi pengikatan ke int gagal — hasilnya 400 Bad Request, bukan 404. Dengan :int, permintaan itu tidak pernah sampai ke handler."
    hasil: |
      <versi SDK, mis. 10.0.100>
      Now listening on: http://localhost:5217
      HTTP/1.1 200 OK
      HTTP/1.1 404 Not Found
      HTTP/1.1 405 Method Not Allowed
      HTTP/1.1 400 Bad Request
    cek_berhasil:
      - "dotnet --list-sdks mencetak minimal satu baris berisi versi 8.0 atau lebih baru"
      - "Server mencetak 'Now listening on' dan terminal tidak kembali ke prompt"
      - "GET /produk menjawab 200, GET /produk/99 menjawab 404"
      - "PUT /produk/7 menjawab 405, bukan 404 — bukti jalurnya terdaftar tapi metodenya tidak"
      - "Setelah :int dibuang, GET /produk/abc menjawab 400"
    kalau_gagal:
      - error: "'dotnet' is not recognized as an internal or external command"
        arti: "SDK tidak terpasang, atau PATH belum diperbarui di terminal yang sedang terbuka."
        perbaikan:
          - "Pasang dari https://dotnet.microsoft.com/download, lalu tutup dan buka ulang terminal"
          - "Cek dengan where dotnet — harus menunjuk ke folder dotnet di Program Files"
          - "Kalau baru dipasang, terminal lama menyimpan PATH lama dan tidak akan menemukannya"
      - error: "System.IO.IOException: Failed to bind to address http://localhost:5xxx: address already in use."
        arti: "Port itu sedang dipakai proses lain — sering karena dotnet run sebelumnya belum dimatikan."
        perbaikan:
          - "Hentikan proses lama dengan Ctrl+C di terminalnya, atau tutup terminal itu"
          - "Jalankan di port lain: dotnet run --urls http://localhost:5080"
          - "Di Windows, cari pemakainya: netstat -ano | findstr :5217, lalu lihat PID-nya"
      - error: "error CS8803: Top-level statements must precede namespace and type declarations."
        arti: "Ada deklarasi class atau namespace di atas baris-baris Minimal API di Program.cs."
        perbaikan:
          - "Pindahkan deklarasi tipe ke berkas terpisah, mis. Produk.cs"
          - "Atau bungkus semuanya dalam class Program dengan static void Main"
      - error: "curl: (7) Failed to connect to localhost port 5xxx: Connection refused"
        arti: "Server tidak berjalan, atau port yang dipakai berbeda dari yang kamu ketik."
        perbaikan:
          - "Pastikan terminal pertama masih menjalankan dotnet run dan belum di-Ctrl+C"
          - "Baca ulang baris 'Now listening on' — port HTTPS dan HTTP bisa berbeda"
          - "Kalau memakai https, sertifikat dev belum dipercaya: dotnet dev-certs https --trust"
      - error: "error NETSDK1045: The current .NET SDK does not support targeting .NET ..."
        arti: "Proyek meminta versi .NET lebih baru daripada SDK yang terpasang."
        perbaikan:
          - "Lihat versi dengan dotnet --list-sdks, pasang SDK yang sesuai"
          - "Atau turunkan <TargetFramework> di berkas .csproj"
          - "Kalau ada global.json di folder induk, ia mengunci versi SDK — hapus atau sesuaikan"
    buktikan:
      perubahan: "Bandingkan /produk/abc pada rute /produk/{id} dan pada rute /produk/{id:int}."
      hasil_diharapkan: "Tanpa batasan: 400 Bad Request — rute cocok, tapi 'abc' tidak bisa diubah menjadi int. Dengan :int: 404 Not Found — rute tidak dianggap cocok sejak awal. Bedanya bukan kosmetik: 400 menyalahkan klien yang mengirim data salah, 404 menyatakan sumber dayanya tidak ada."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Klien mengirim PUT /produk/7 ke API yang hanya mendaftarkan GET dan DELETE pada jalur itu. Status apa yang benar?"
    opsi:
      a: "404, karena tidak ada endpoint PUT"
      b: "405, karena jalurnya ada tapi metodenya tidak didaftarkan"
      c: "200 dengan badan kosong"
      d: "500, karena server tidak siap"
    jawaban: b
    penjelasan: "405 Method Not Allowed memisahkan dua kesalahan yang berbeda: klien memakai metode yang salah pada sumber daya yang benar. 404 akan menyesatkan — klien akan mengira produknya tidak ada, lalu mencoba endpoint lain yang juga gagal. Respons 405 yang baik menyertakan header Allow berisi metode yang tersedia."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Apa beda `/produk/{id}` dan `/produk/{id:int}`?"
    opsi:
      a: "Yang kedua hanya cocok kalau segmennya bisa dibaca sebagai int; kalau tidak, rute tidak cocok dan hasilnya 404"
      b: "Yang kedua mengubah parameter menjadi int di dalam database"
      c: "Tidak ada beda, hanya penulisan singkat"
      d: "Yang kedua menerima semua tipe termasuk teks"
    jawaban: a
    penjelasan: "Batasan rute diperiksa sebelum handler dipanggil. Tanpa batasan, rute cocok lalu pengikatan parameter gagal dan hasilnya 400. Dengan :int, permintaan yang tidak sesuai tidak dianggap cocok sama sekali, sehingga bisa jatuh ke rute lain atau 404. Ini juga mencegah handler menerima nilai yang tidak masuk akal."
    tingkat: menengah
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa `dotnet new web` lebih cocok untuk belajar Minimal API daripada `dotnet new webapi`?"
    opsi:
      a: "webapi tidak bisa dijalankan tanpa database"
      b: "webapi membawa contoh endpoint cuaca dan konfigurasi tambahan yang harus dibaca dulu sebelum kode sendiri"
      c: "web hanya bisa dipakai di Linux"
      d: "webapi tidak mendukung routing"
    jawaban: b
    penjelasan: "Template webapi memberi contoh siap pakai plus OpenAPI, yang berguna di proyek nyata tapi menyembunyikan bagian yang perlu dipahami. Template web memberi empat baris: builder, build, satu endpoint, run. Dari situ setiap baris yang kamu tambahkan bisa kamu jelaskan sendiri."
    tingkat: dasar
  - tipe: isian_singkat
    pertanyaan: "Nama template CLI untuk membuat proyek ASP.NET Core kosong: dotnet new ... (satu kata)"
    jawaban: "web"
    penjelasan: "dotnet new web menghasilkan proyek ASP.NET Core tanpa halaman, tanpa contoh, tanpa OpenAPI. dotnet new webapi menghasilkan yang sama plus contoh dan OpenAPI. dotnet new list menampilkan semua template yang terpasang di mesinmu."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Endpoint mengembalikan `Results.NotFound()`. Apa yang dikirim server?"
    opsi:
      a: "Status 404 dengan badan kosong"
      b: "Status 200 dengan teks 'NotFound'"
      c: "Status 500 karena exception"
      d: "Status 302 redirect ke halaman error"
    jawaban: a
    penjelasan: "Results.NotFound() adalah hasil yang sudah berbentuk respons: kode 404, tanpa badan. Ia tidak melempar exception dan tidak menghentikan aplikasi — handler selesai normal, hanya hasilnya berbeda. Di Minimal API, mengembalikan hasil (Results.Ok, Results.NotFound, Results.Created) adalah cara biasa memberi kode status yang tepat tanpa menulis respons manual."
    tingkat: menengah
---

## Lapis 1

### Satu berkas, empat baris

Minimal API menghapus lapisan yang dulu wajib di ASP.NET: tidak ada `Startup.cs`, tidak ada controller, tidak ada atribut rute. Seluruh aplikasi bisa muat di `Program.cs`.

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Halo");

app.Run();
```

Baris demi baris:
- `CreateBuilder` — menyiapkan konfigurasi, logging, dan container dependency injection.
- `Build()` — mengunci konfigurasi dan menghasilkan aplikasi yang siap menerima permintaan.
- `MapGet("/", ...)` — mendaftarkan rute: "kalau ada GET ke /, jalankan lambda ini".
- `Run()` — mulai mendengarkan. Baris ini tidak pernah selesai sampai proses dihentikan.

Template `dotnet new web` menghasilkan persis ini. Tidak ada yang disembunyikan.

### Rute: pola, bukan daftar if

| Pola | Cocok dengan | Tidak cocok dengan |
|---|---|---|
| `/produk` | `GET /produk` | `GET /produk/7` |
| `/produk/{id}` | `/produk/7`, `/produk/abc` | `/produk` |
| `/produk/{id:int}` | `/produk/7` | `/produk/abc`, `/produk/7/harga` |

Segmen `{nama}` menangkap satu segmen path dan memberinya nama. Nama itu menjadi parameter lambda dengan nama yang sama — itulah cara nilai dari URL masuk ke kode tanpa `Request.QueryString["id"]`.

Batasan (`:int`, `:guid`, `:min(1)`) diperiksa **sebelum** handler dipanggil. Rute yang batasannya gagal tidak dianggap cocok, jadi permintaan bisa jatuh ke rute lain atau berakhir 404.

### Tiga kegagalan yang berbeda

Klien perlu tahu *kenapa* permintaannya gagal, dan tiga kode ini menyampaikannya:

| Kode | Arti | Contoh penyebab |
|---|---|---|
| `404` | Tidak ada rute yang cocok | Salah ketik path, atau endpoint belum didaftarkan |
| `405` | Jalurnya ada, metodenya tidak | `PUT` ke endpoint yang hanya menerima `GET` |
| `400` | Rute cocok, tapi nilainya tidak bisa dibaca | `/produk/abc` pada `{id}` tanpa `:int` |

`405` sering dianggap remeh, padahal ia yang paling sering muncul saat integrasi: frontend mengirim `PUT` padahal backend hanya punya `POST`. Tanpa `405`, kamu akan melihat `404` dan mencari di tempat yang salah.

### Mengembalikan hasil, bukan menulis respons

```csharp
app.MapGet("/produk/{id:int}", (int id) =>
    produk.TryGetValue(id, out var nama)
        ? Results.Ok(nama)
        : Results.NotFound());
```

`Results` adalah kumpulan hasil siap pakai: `Ok`, `NotFound`, `Created`, `NoContent`, `BadRequest`, `Problem`. Masing-masing menetapkan kode status yang benar, dan sebagian menambah header (mis. `Created` butuh `Location`).

Nilainya juga bisa dikembalikan langsung — `() => "Halo"` otomatis menjadi `200` dengan `text/plain`. Tapi begitu ada dua kemungkinan hasil (ada / tidak ada), kembalikan `Results` secara eksplisit. Kode yang jujur soal kemungkinan gagal lebih mudah dipercaya.

### Dependency injection sudah menyala

```csharp
builder.Services.AddSingleton<IPenyimpanan, PenyimpananMemori>();

app.MapGet("/produk", (IPenyimpanan db) => db.Semua());
```

Parameter lambda yang tipenya terdaftar di container akan diisi otomatis. Inilah yang membuat Minimal API tetap terstruktur walau tidak ada controller: penyimpanan, jam, dan klien HTTP tidak perlu dibuat di dalam handler, cukup didaftarkan sekali.

### Yang perlu diketahui sebelum menulis endpoint pertama

1. **Data hilang saat restart.** `Dictionary` di dalam memori bukan database. Untuk belajar itu cukup; untuk apa pun yang harus bertahan, gunakan penyimpanan nyata (modul berikutnya).
2. **Tidak ada validasi otomatis.** Minimal API tidak memeriksa `[Required]` seperti controller MVC. Kalau input harus valid, periksa sendiri dan kembalikan `Results.BadRequest`.
3. **Port bukan angka tetap.** `dotnet run` memilih port dari `launchSettings.json` atau port acak. Selalu baca dari baris `Now listening on`.

## Lapis 2

### Urutan pipeline: middleware berjalan sebelum rute

```csharp
var app = builder.Build();

app.Use(async (ctx, next) =>
{
    var mulai = DateTime.UtcNow;
    await next();
    var ms = (DateTime.UtcNow - mulai).TotalMilliseconds;
    app.Logger.LogInformation("{Metode} {Path} {Status} {Ms}ms",
        ctx.Request.Method, ctx.Request.Path, ctx.Response.StatusCode, ms);
});

app.UseExceptionHandler("/error");
app.MapGet("/produk", () => "ok");
app.Run();
```

Setiap `Use` membungkus yang berikutnya, seperti bawang. Middleware pencatat di atas melihat permintaan **sebelum** handler dan status **sesudah** handler — karena itu `await next()` berada di tengah. Kalau kamu lupa `await next()`, permintaan berhenti di situ dan handler tidak pernah jalan; ini penyebab "endpoint mengembalikan 200 kosong" yang membingungkan.

Urutan penting: `UseExceptionHandler` harus dipasang sebelum middleware yang mungkin melempar, supaya ia bisa menangkapnya.

### Grup rute: satu awalan, satu tempat

```csharp
var api = app.MapGroup("/api/v1");
api.MapGet("/produk", () => "daftar");
api.MapGet("/produk/{id:int}", (int id) => $"produk {id}");
```

Grup juga tempat menaruh hal yang berlaku untuk semua anggotanya — `.AddEndpointFilter(...)` untuk validasi, `.RequireAuthorization()` untuk login. Ini pengganti `[Route]` dan `[Authorize]` di tingkat controller, tanpa kelas tambahan.

### Filter endpoint: validasi yang tidak diulang

```csharp
api.MapPost("/produk", (Produk p) => Results.Created($"/produk/{p.Id}", p))
   .AddEndpointFilter(async (ctx, next) =>
   {
       var p = ctx.GetArgument<Produk>(0);
       if (string.IsNullOrWhiteSpace(p.Nama))
           return Results.BadRequest(new { pesan = "nama wajib diisi" });
       return await next(ctx);
   });
```

Filter berjalan sebelum handler, bisa menolak permintaan, dan hasilnya tetap berupa `IResult` biasa. Ini cara termurah menghindari pemeriksaan yang sama ditulis di sepuluh endpoint. Untuk aturan yang lebih rumit, validasi manual di handler lebih jujur daripada filter yang menyembunyikan alurnya.

### Body JSON dan pengikatan parameter

| Sumber nilai | Cara | Catatan |
|---|---|---|
| Segmen path | `{id:int}` + parameter `int id` | Diperiksa sebelum handler |
| Query string | `[FromQuery] int halaman` | Atau tangkap `HttpRequest` |
| Body JSON | parameter bertipe kompleks, mis. `Produk p` | Hanya satu parameter body per handler |
| Service | tipe yang terdaftar di `builder.Services` | Diisi container |
| Header | `[FromHeader(Name = "X-Kunci")] string kunci` | Nama header peka huruf besar-kecil di sebagian klien |

Kalau body tidak bisa dibaca sebagai JSON yang sah, ASP.NET Core menjawab `400` sebelum handler dipanggil — tanpa pesan yang berguna bagi pemanggil kecuali kamu menambahkan penanganan sendiri. Untuk API yang dipakai tim lain, kembalikan `Results.Problem` berisi keterangan field yang salah.

### Sertifikat HTTPS saat pengembangan

`dotnet dev-certs https --trust` membuat sertifikat lokal dan memercayainya. Tanpa itu, `curl` menolak koneksi HTTPS dan browser menampilkan peringatan. Ini hanya untuk pengembangan — di server, sertifikat berasal dari pengelola secrets atau reverse proxy.

### Error umum

| Pesan | Arti | Cara memperbaiki |
|---|---|---|
| `CS8803: Top-level statements must precede namespace and type declarations` | Ada `class` di atas kode Minimal API | Pindahkan tipe ke berkas sendiri |
| `Failed to bind to address ... address already in use` | Port dipakai proses lain | Ctrl+C proses lama, atau `dotnet run --urls http://localhost:5080` |
| `curl: (7) Failed to connect` | Server mati atau port salah | Baca ulang `Now listening on`; pastikan terminal pertama masih jalan |
| `An unhandled exception ... AmbiguousMatchException` | Dua rute cocok untuk permintaan yang sama | Beri batasan (`:int`) atau hapus salah satunya |
| `405` padahal endpoint terlihat ada | Metode berbeda (mis. `POST` didaftarkan sebagai `GET`) | Periksa `MapGet`/`MapPost` — bukan hanya path-nya |
| `NullReferenceException` di handler | Service belum didaftarkan, parameter diisi `null` | Daftarkan di `builder.Services`, atau pakai `?? throw` agar gagal cepat |

### Daftar periksa sebelum API dianggap selesai

1. Setiap endpoint mengembalikan kode status yang tepat: `201` + `Location` untuk create, `204` untuk delete, `404` untuk sumber daya tidak ada.
2. Rute yang menerima id memakai batasan (`:int`, `:guid`), bukan mengandalkan `int.Parse` di dalam handler.
3. Body divalidasi; kesalahan input dijawab `400` dengan keterangan, bukan `500`.
4. Penyimpanan didaftarkan lewat DI, bukan dibuat di dalam handler.
5. Middleware pencatat dipasang paling luar, supaya permintaan yang gagal pun tercatat.
6. Tidak ada data rahasia di respons atau di log — termasuk connection string.
7. Sudah dicoba dengan `curl` untuk kasus berhasil **dan** gagal, bukan hanya yang berhasil.

### Rujukan resmi

`TODO: tautan dokumentasi resmi Microsoft untuk minimal API, routing, dan Results`

## Latihan

Latihan 1 meniru pencocokan rute di Python: kamu menulis sendiri aturan yang menentukan kapan sebuah permintaan mendapat `200`, `204`, `404`, atau `405`. Setelah menulisnya, kode `405` berhenti terasa seperti keajaiban framework. Latihan 2 menjalankan API sungguhan dan membuktikan tiga status itu dengan `curl`, plus satu perbedaan halus: `400` versus `404` pada parameter yang salah tipe.

## Kamu sudah bisa ini kalau…

- [ ] Bisa menjelaskan beda `404`, `405`, dan `400` pada satu contoh masing-masing.
- [ ] Bisa menjelaskan kenapa `/produk/{id:int}` lebih baik daripada mem-parse `id` di dalam handler.
- [ ] Tahu kenapa `await next()` wajib ada di middleware dan apa akibatnya kalau hilang.
- [ ] Bisa menyebut tiga sumber nilai parameter dan cara masing-masing diikat.
- [ ] Tahu kenapa data di dalam `Dictionary` hilang saat server restart.
- [ ] Latihan 1 lulus dan latihan 2 berhasil dijalankan.
