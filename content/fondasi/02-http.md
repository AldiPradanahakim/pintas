---
track: fondasi
nomor: 2
judul: "HTTP: apa yang sebenarnya terjadi saat kamu membuka satu URL"
slug: http
estimasi_menit: 12
prasyarat: ["fondasi/git"]
latihan:
  - id: fondasi-02-latihan-1
    jenis: web
    bahasa: python
    soal: "Diberi daftar kode status HTTP, kelompokkan jadi 'sukses' (2xx), 'dialihkan' (3xx), 'salah klien' (4xx), 'salah server' (5xx). Cetak satu baris per kode: '<kode> -> <kelompok>'."
    kode_awal: |
      kode = [200, 201, 301, 304, 400, 401, 403, 404, 422, 500, 502, 503]

      # cetak "<kode> -> <kelompok>"
    output_harapan: |
      200 -> sukses
      201 -> sukses
      301 -> dialihkan
      304 -> dialihkan
      400 -> salah klien
      401 -> salah klien
      403 -> salah klien
      404 -> salah klien
      422 -> salah klien
      500 -> salah server
      502 -> salah server
      503 -> salah server
    solusi: |
      kode = [200, 201, 301, 304, 400, 401, 403, 404, 422, 500, 502, 503]

      def kelompok(k):
          if 200 <= k < 300:
              return "sukses"
          if 300 <= k < 400:
              return "dialihkan"
          if 400 <= k < 500:
              return "salah klien"
          return "salah server"

      for k in kode:
          print(f"{k} -> {kelompok(k)}")
    catatan_solusi: "Digit pertama menentukan kelasnya: 2 = sukses, 3 = dialihkan, 4 = klien yang salah, 5 = server yang salah. Perbedaan 4xx dan 5xx penting saat menangani kegagalan: 4xx berarti mengulang permintaan yang sama tidak akan berhasil (perbaikannya di sisi klien), 5xx berarti boleh dicoba lagi nanti."
  - id: fondasi-02-latihan-2
    jenis: laptop
    soal: "Lihat header HTTP yang sebenarnya dari satu permintaan, lalu buktikan bahwa server memberi jawaban berbeda untuk berkas yang tidak ada."
    kebutuhan:
      - "curl (tersedia di Windows 10+, Linux, macOS)"
      - "Terminal (git-bash / PowerShell)"
    langkah:
      - perintah: "curl -sI https://example.com | head -5"
        penjelasan: "Mengambil header saja (-I = HEAD). Output memuat baris status, tipe isi, dan panjang. Inilah yang diterima peramban sebelum isi halaman dikirim."
      - perintah: "curl -s -o /dev/null -w '%{http_code}\\n' https://example.com"
        penjelasan: "Mencetak HANYA kode status. -o /dev/null membuang isi respons. Ini cara paling cepat memeriksa kesehatan satu URL di skrip."
      - perintah: "curl -s -o /dev/null -w '%{http_code}\\n' https://example.com/halaman-tidak-ada-xyz"
        penjelasan: "Meminta halaman yang tidak ada. Output 404 — kode yang menyatakan 'alamat ini tidak punya apa pun', bukan 'server rusak'."
      - perintah: "curl -s -o /dev/null -w '%{http_code}\\n' -X POST https://example.com"
        penjelasan: "Mengirim POST ke alamat yang hanya menerima GET. Output 405 atau 404 tergantung server — bukti bahwa metode permintaan juga bagian dari kontrak, bukan sekadar detail."
      - perintah: "curl -s -o /dev/null -w '%{time_total}\\n' https://example.com"
        penjelasan: "Mencetak total waktu permintaan dalam detik. Angka ini yang dipakai untuk mengukur latensi nyata, bukan perkiraan."
    hasil: |
      HTTP/2 200
      content-type: text/html; charset=UTF-8
      200
      404
      404
      0.0xxx
    cek_berhasil:
      - "Langkah 1 menampilkan baris 'HTTP/2 200'"
      - "Langkah 2 mencetak 200"
      - "Langkah 3 mencetak 404 — bukan 200, bukan 500"
      - "Langkah 5 mencetak angka detik (misalnya 0.082)"
    kalau_gagal:
      - error: "curl: (6) Could not resolve host"
        arti: "Nama domain tidak bisa diterjemahkan ke alamat IP — biasanya tidak ada koneksi internet atau DNS bermasalah."
        perbaikan:
          - "Cek koneksi: curl -sI https://1.1.1.1"
          - "Coba alamat IP langsung untuk memastikan DNS-nya yang bermasalah"
      - error: "curl: (60) SSL certificate problem"
        arti: "Sertifikat HTTPS tidak bisa diverifikasi. Jangan diabaikan di produksi."
        perbaikan:
          - "Perbarui sistem operasi atau periksa jam sistem — sertifikat bergantung pada tanggal"
          - "Hindari -k (melewati verifikasi) kecuali untuk pengujian lokal"
      - error: "'curl' is not recognized as an internal or external command"
        arti: "curl tidak ada di PATH. Windows 10 ke atas biasanya sudah menyertakannya."
        perbaikan:
          - "Pakai curl.exe untuk membedakan dari alias PowerShell"
          - "Atau pasang curl dari curl.se/windows"
    buktikan:
      perubahan: "Minta alamat yang pasti tidak ada di domain lokal yang kamu jalankan sendiri (misalnya http://127.0.0.1:9999/tidak-ada)."
      hasil_diharapkan: "Kalau tidak ada server di port itu, curl mencetak 000 dan pesan 'Failed to connect'. Ini beda penting: 000 berarti tidak ada yang menjawab, 404 berarti ada yang menjawab tapi tidak punya halamannya."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Server mengembalikan 401. Apa artinya?"
    opsi:
      a: "Halaman tidak ditemukan"
      b: "Pengguna belum terautentikasi — identitasnya belum diketahui"
      c: "Pengguna sudah terautentikasi tapi tidak berhak"
      d: "Server mengalami kesalahan internal"
    jawaban: b
    penjelasan: "401 Unauthorized artinya 'aku tidak tahu kamu siapa'. 403 Forbidden artinya 'aku tahu kamu siapa, tapi kamu tidak boleh'. Perbedaan ini menentukan perbaikannya: 401 butuh login, 403 butuh izin tambahan. Menukar keduanya membuat pengguna bingung harus berbuat apa."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Permintaan mengembalikan 503. Apa tindakan yang masuk akal di sisi klien?"
    opsi:
      a: "Ubah data yang dikirim, pasti salah"
      b: "Coba lagi setelah jeda — server sedang tidak bisa melayani"
      c: "Ganti alamat URL"
      d: "Hapus cache peramban"
    jawaban: b
    penjelasan: "5xx berarti masalahnya di server, bukan di permintaanmu. Mengulang dengan data yang sama bisa berhasil saat server pulih. Sebaliknya, mengulang 4xx dengan data yang sama tidak akan pernah berhasil — yang salah adalah permintaannya. Karena itu pustaka HTTP biasanya hanya mengulang otomatis pada 5xx dan 429."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Metode HTTP yang dipakai untuk mengambil data tanpa mengubah apa pun di server adalah ... (satu kata)"
    jawaban: "get"
    penjelasan: "GET hanya membaca. Karena itu ia aman diulang dan hasilnya boleh di-cache. POST, PUT, DELETE mengubah keadaan — mengulangnya bisa menimbulkan akibat ganda, seperti dua pesanan terbentuk dari satu klik yang terkirim dua kali."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa header Content-Type penting?"
    opsi:
      a: "Supaya permintaan lebih cepat"
      b: "Supaya penerima tahu cara membaca isi — JSON, HTML, atau biner"
      c: "Supaya URL lebih pendek"
      d: "Supaya koneksi tetap terbuka"
    jawaban: b
    penjelasan: "Isi respons hanyalah deret byte. Tanpa Content-Type, penerima harus menebak apakah itu teks, JSON, gambar, atau berkas unduhan. Salah tebak menghasilkan galat yang membingungkan — misalnya JSON dibaca sebagai HTML lalu tampil sebagai teks mentah di halaman."
    tingkat: dasar
  - tipe: isian_singkat
    pertanyaan: "Kode status yang berarti 'permintaan berhasil dan sumber daya baru dibuat' adalah ... (tiga digit)"
    jawaban: "201"
    penjelasan: "201 Created dipakai setelah POST yang berhasil membuat sesuatu, dan biasanya disertai header Location berisi alamat sumber daya baru. Mengembalikan 200 untuk pembuatan berhasil tidak salah secara teknis, tapi 201 memberi tahu klien bahwa ada sesuatu yang baru dan di mana menemukannya."
    tingkat: menengah
---

## Lapis 1

### Satu URL, satu percakapan

Saat kamu mengetik alamat di peramban, yang terjadi bukan "mengambil halaman". Yang terjadi adalah percakapan singkat:

```
KAMU  →  GET /modul/ai-llm/embedding HTTP/1.1
         Host: contoh.com
         Accept: text/html

SERVER →  HTTP/1.1 200 OK
          Content-Type: text/html; charset=utf-8
          Content-Length: 4821
          Cache-Control: max-age=3600

          <!doctype html>...
```

Tiga bagian respons:

1. **Baris status** — berhasil atau tidak, dan kodenya.
2. **Header** — metadata: tipe isi, panjang, aturan cache, cookie.
3. **Isi (body)** — datanya, bisa HTML, JSON, gambar, apa saja.

Memahami tiga bagian ini menjelaskan sebagian besar bug web: halaman kosong padahal status 200 (header benar, isi salah), data tidak ter-update (cache), API mengembalikan HTML padahal diharapkan JSON (Content-Type salah).

### Metode: kata kerja permintaan

| Metode | Gunanya | Aman diulang? |
|---|---|---|
| `GET` | Baca | Ya |
| `POST` | Buat sesuatu baru | Tidak — bisa membuat duplikat |
| `PUT` | Ganti seluruh isi | Ya |
| `PATCH` | Ubah sebagian | Tidak selalu |
| `DELETE` | Hapus | Ya (menghapus yang sudah terhapus = tidak ada perubahan) |

"Tidak aman diulang" bukan berarti tidak boleh dipakai. Artinya: kalau permintaan gagal di tengah jalan, kamu tidak tahu apakah server sempat memprosesnya. Karena itu POST yang penting (pembayaran, pembuatan pesanan) butuh **kunci idempotensi** — penanda unik supaya pengulangan tidak menciptakan data ganda.

### Kode status: satu digit pertama menentukan artinya

| Kelas | Arti | Perbaikannya di mana |
|---|---|---|
| 2xx | Berhasil | — |
| 3xx | Dialihkan | Ikuti alamat baru |
| 4xx | Klien salah | Di permintaannya |
| 5xx | Server salah | Di server; boleh coba lagi |

Kode yang paling sering kamu temui:

- **200** berhasil · **201** dibuat · **204** berhasil tanpa isi
- **301/308** pindah permanen · **304** tidak berubah, pakai cache
- **400** permintaan cacat · **401** belum login · **403** tidak berhak · **404** tidak ada · **409** bentrok · **422** bentuknya sah tapi nilainya salah · **429** terlalu banyak permintaan
- **500** galat tak tertangani · **502** server perantara menerima jawaban rusak · **503** sedang tidak tersedia · **504** batas waktu

Kode yang tepat menghemat waktu debug. Mengembalikan 200 untuk semua keadaan memaksa klien menebak dari isi respons — dan tebakan itu akan salah.

### Header yang menentukan perilaku

- `Content-Type` — cara membaca isi
- `Content-Length` — panjang isi dalam byte
- `Cache-Control` — boleh di-cache berapa lama
- `Set-Cookie` — menyimpan keadaan di peramban
- `Authorization` — identitas pengirim
- `Location` — alamat baru (untuk 3xx dan 201)

### Cache: sumber kebingungan yang paling sering

`Cache-Control: max-age=3600` berarti peramban boleh memakai salinan selama satu jam **tanpa bertanya ke server**.

Akibatnya: kamu mengubah berkas CSS, tapi tampilan tidak berubah. Server sudah mengirim versi baru, peramban belum memintanya.

Solusinya bukan menekan Ctrl+F5 terus-menerus, tapi menamai berkas dengan sidik isi (`app.a3f9c1.css`). Saat isinya berubah, namanya berubah, jadi peramban menganggapnya berkas baru.

## Lapis 2

### Satu permintaan, langkah demi langkah

```bash
curl -v https://contoh.com/modul
```

`-v` menampilkan seluruh percakapan: DNS, sambungan TCP, TLS, permintaan, respons. Urutannya selalu sama:

1. **DNS** — nama domain jadi alamat IP
2. **TCP** — sambungan ke port 443
3. **TLS** — kesepakatan enkripsi dan verifikasi sertifikat
4. **Permintaan** — baris permintaan + header + (opsional) isi
5. **Respons** — baris status + header + isi

Waktu total = jumlah kelima langkah. Kalau permintaan terasa lambat, `curl -w` memecah waktunya:

```bash
curl -s -o /dev/null -w "dns=%{time_namelookup} tcp=%{time_connect} tls=%{time_appconnect} total=%{time_total}\n" https://contoh.com
```

Angka yang besar menunjukkan di mana masalahnya: `dns` besar berarti penerjemahan nama lambat, `tls` besar berarti jabat tangan TLS mahal, `total` jauh lebih besar dari `tls` berarti servernya yang lambat memproses.

### Idempotensi: kenapa POST butuh kunci

```http
POST /api/pesanan
Idempotency-Key: 7f3a-9c21-4b8e

{"produk": "kabel", "jumlah": 2}
```

Server menyimpan kunci itu. Kalau permintaan yang sama datang lagi (karena pengguna menekan tombol dua kali, atau jaringan memutus lalu klien mencoba ulang), server mengembalikan hasil yang **sama** tanpa membuat pesanan kedua.

Tanpa kunci ini, setiap pengulangan menciptakan data baru. Ini penyebab nyata pesanan ganda di toko online — bukan bug di tombol, tapi tidak adanya idempotensi di API.

### Menangani kegagalan dengan benar

Aturan yang bisa dipegang:

| Keadaan | Tindakan |
|---|---|
| 2xx | Selesai |
| 4xx (kecuali 429) | Jangan ulangi — perbaiki permintaannya |
| 429 | Ulangi setelah `Retry-After` detik |
| 5xx | Ulangi dengan jeda bertambah (1s, 2s, 4s, 8s) |
| Batas waktu / sambungan putus | Ulangi hanya kalau permintaan idempoten |

Jeda bertambah (exponential backoff) mencegah klien membanjiri server yang sedang pulih. Tanpa jeda, seribu klien yang mencoba ulang serentak akan memperparah masalahnya.

Batas percobaan juga wajib. Mengulang tanpa batas berarti satu permintaan gagal bisa menggantung selamanya.

### Cookie, sesi, dan token

Dua cara menyimpan keadaan:

**Cookie + sesi di server.** Peramban menyimpan satu ID; server menyimpan datanya.

```
Set-Cookie: sesi=abc123; HttpOnly; Secure; SameSite=Lax
```

`HttpOnly` mencegah JavaScript membaca cookie (bertahan terhadap pencurian lewat XSS). `Secure` berarti hanya dikirim lewat HTTPS. `SameSite=Lax` mencegah situs lain mengirim permintaan atas namamu (CSRF).

**Token di header.** Server tidak menyimpan sesi; setiap permintaan membawa bukti identitas.

```
Authorization: Bearer eyJhbGciOi...
```

Keuntungannya: tidak perlu penyimpanan sesi terpusat. Kerugiannya: token tidak bisa dicabut sebelum kedaluwarsa, jadi umurnya harus pendek dan disertai mekanisme perpanjangan.

### CORS: kenapa permintaan ditolak peramban

Kalau halaman di `app.com` memanggil API di `api.com`, peramban menolak kecuali API menyatakan mengizinkan:

```
Access-Control-Allow-Origin: https://app.com
Access-Control-Allow-Methods: GET, POST
```

Yang penting dipahami: **CORS adalah aturan peramban, bukan pengamanan server.** Ia mencegah halaman jahat membaca respons API atas namamu. Ia tidak mencegah orang memanggil API langsung dengan curl — untuk itu perlu autentikasi dan pembatasan laju.

Galat CORS di konsol sering disalahpahami sebagai "API rusak". Biasanya API baik-baik saja; ia hanya belum menyebutkan asal mana yang diizinkan.

### Daftar periksa

1. Setiap respons punya kode status yang tepat, bukan 200 untuk semuanya.
2. `Content-Type` sesuai isi sebenarnya.
3. Operasi yang mengubah data dan penting punya kunci idempotensi.
4. Klien mengulang hanya pada 429, 5xx, dan batas waktu — dengan jeda bertambah dan batas percobaan.
5. Cookie memakai `HttpOnly`, `Secure`, dan `SameSite`.
6. Berkas statis dinamai dengan sidik isi supaya cache tidak menyajikan versi lama.
7. CORS dibuka hanya untuk asal yang benar-benar perlu, bukan `*` pada API yang butuh login.
