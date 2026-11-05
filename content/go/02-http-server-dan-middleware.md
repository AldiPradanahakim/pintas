---
track: go
nomor: 2
judul: "HTTP server & middleware: satu handler membungkus handler lain"
slug: http-server-dan-middleware
estimasi_menit: 15
prasyarat:
  - go/goroutine-dan-channel
  - fondasi/http
latihan:
  - id: go-02-latihan-1
    jenis: web
    bahasa: python
    soal: "Rantai middleware dijalankan berlapis: masuk dari lapis terluar ke terdalam, sampai di handler, lalu keluar lagi dari terdalam ke terluar. Diberi 4 middleware berurutan (log, auth, rate-limit, recover) dengan biaya masing-masing, dan handler berbiaya 12 ms. Cetak satu baris untuk tiap middleware saat masuk dan saat keluar beserta total waktu berjalan, lalu total keseluruhan dan biaya overhead middleware (yang dihitung dua kali karena masuk dan keluar)."
    kode_awal: |-
      MIDDLEWARE = [("log", 1), ("auth", 3), ("rate-limit", 2), ("recover", 1)]
      BIAYA_HANDLER = 12

      t = 0

      # 1. untuk tiap middleware (urutan daftar = luar ke dalam):
      #    t += biaya, cetak "masuk <nama> +<biaya> ms (total <t>)"
      # 2. t += BIAYA_HANDLER, cetak "handler +12 ms (total <t>)"
      # 3. untuk tiap middleware dengan urutan TERBALIK: sama seperti langkah 1,
      #    tapi kata "masuk" diganti "keluar"
      # 4. cetak "total <t> ms"
      # 5. cetak "overhead <dua kali jumlah biaya middleware> ms dikali dua = <angka> ms"
    output_harapan: |-
      masuk log +1 ms (total 1)
      masuk auth +3 ms (total 4)
      masuk rate-limit +2 ms (total 6)
      masuk recover +1 ms (total 7)
      handler +12 ms (total 19)
      keluar recover +1 ms (total 20)
      keluar rate-limit +2 ms (total 22)
      keluar auth +3 ms (total 25)
      keluar log +1 ms (total 26)
      total 26 ms
      overhead 7 ms dikali dua = 14 ms
    solusi: |-
      MIDDLEWARE = [("log", 1), ("auth", 3), ("rate-limit", 2), ("recover", 1)]
      BIAYA_HANDLER = 12

      t = 0
      for nama, biaya in MIDDLEWARE:
          t += biaya
          print(f"masuk {nama} +{biaya} ms (total {t})")

      t += BIAYA_HANDLER
      print(f"handler +{BIAYA_HANDLER} ms (total {t})")

      for nama, biaya in reversed(MIDDLEWARE):
          t += biaya
          print(f"keluar {nama} +{biaya} ms (total {t})")

      print(f"total {t} ms")
      overhead = sum(b for _, b in MIDDLEWARE)
      print(f"overhead {overhead} ms dikali dua = {overhead * 2} ms")
    catatan_solusi: "Baris `reversed(MIDDLEWARE)` adalah seluruh isi idenya. Saat masuk, lapis terluar (log) berjalan lebih dulu; saat keluar, lapis terdalam (recover) yang lebih dulu selesai. Itulah yang membuat middleware logging bisa mengukur durasi total tanpa tahu apa pun tentang auth atau rate-limit. Perhatikan 26 ms dibagi rata: handler 12 ms, sisanya 14 ms overhead middleware yang dihitung dua kali. Rantai sepuluh middleware yang masing-masing 2 ms berarti 40 ms per request — itulah alasan jumlah middleware perlu dijaga, bukan sekadar dipasang."
  - id: go-02-latihan-2
    jenis: laptop
    soal: "Buat server Go dengan dua rute dan dua middleware (log dan kunci). Buktikan request tanpa header kunci ditolak 401, dengan kunci benar dibalas 200, dan urutan middleware menentukan apakah request yang ditolak tetap tercatat di log."
    kebutuhan:
      - "Go 1.22 atau lebih baru (go version) — pola rute 'GET /halo/{nama}' butuh versi ini"
      - "Dua jendela terminal (satu untuk server, satu untuk curl)"
    langkah:
      - perintah: "go version"
        penjelasan: "Memastikan versi Go 1.22 atau lebih baru. Di bawah 1.22 pola rute berisi spasi dan metode akan dibaca sebagai path biasa, dan semua request jadi 404."
      - perintah: "mkdir latihan-http && cd latihan-http && go mod init latihanhttp"
        penjelasan: "Membuat folder kerja dan berkas go.mod. go run main.go sebenarnya jalan tanpa go.mod karena berkasnya disebut langsung, tapi modul dibutuhkan begitu kamu menambah paket lain atau menjalankan go build . — dan membuatnya sekarang menghindari kejutan itu nanti."
      - perintah: "notepad main.go"
        penjelasan: "Buat berkas main.go dan tempel program dari blok 'Program lengkap' di atas. Di Linux/macOS ganti dengan nano main.go."
      - perintah: "go vet main.go"
        penjelasan: "Pemeriksa bawaan Go. Perintah ini SENYAP kalau tidak ada temuan — tidak mencetak apa pun berarti lulus."
      - perintah: "go run main.go"
        penjelasan: "Jalankan di terminal pertama; biarkan menyala. Di terminal kedua: curl -s -i http://localhost:8099/halo/aldi lalu curl -s -i -H \"X-Kunci: rahasia\" http://localhost:8099/halo/aldi. Yang pertama 401, yang kedua 200 berisi 'halo, aldi'."
      - perintah: "Ubah urutan pemasangan: taruh h = denganLog(h) SEBELUM h = denganKunci(...), lalu ulangi go run main.go dan kedua curl tadi"
        penjelasan: "Sekarang kunci ada di lapis terluar. Request tanpa kunci ditolak sebelum sempat menyentuh log — di terminal server hanya terlihat satu baris log, bukan dua."
    hasil: |-
      HTTP/1.1 401 Unauthorized
      Content-Type: text/plain; charset=utf-8
      Content-Length: 12

      kunci salah

      HTTP/1.1 200 OK
      Content-Length: 10
      Content-Type: text/plain; charset=utf-8

      halo, aldi
    cek_berhasil:
      - "Request tanpa header X-Kunci dijawab 401 dengan badan 'kunci salah' (12 byte)"
      - "Request dengan X-Kunci: rahasia dijawab 200 dengan badan 'halo, aldi' (10 byte)"
      - "Terminal server mencetak dua baris log untuk dua request itu, dan go vet tidak mencetak apa pun"
    kalau_gagal:
      - error: "listen tcp :8099: bind: Only one usage of each socket address is normally permitted."
        arti: "Port 8099 sudah dipakai proses lain — biasanya sisa go run sebelumnya yang belum dimatikan."
        perbaikan:
          - "Matikan server lama dengan Ctrl+C di terminalnya"
          - "Atau ganti angka port di dua tempat: log.Println dan http.ListenAndServe, misalnya :8770"
          - "Cari pemakainya: netstat -ano | findstr :8099, lalu taskkill /PID <pid> /F"
      - error: "go: go.mod file not found in current directory or any parent directory"
        arti: "Perintah go dijalankan di folder tanpa go.mod."
        perbaikan:
          - "cd latihan-http dulu"
          - "go mod init latihanhttp, lalu ulangi go run"
      - error: "404 page not found untuk /halo/aldi, padahal rutenya ada"
        arti: "Pola rute 'GET /halo/{nama}' hanya dikenal Go 1.22 ke atas. Di versi lebih lama, seluruh string itu dianggap path literal."
        perbaikan:
          - "Cek go version; kalau di bawah 1.22, perbarui Go dari go.dev/dl"
          - "Alternatif tanpa memperbarui: daftarkan mux.HandleFunc(\"/halo/\", ...) lalu ambil nama dengan strings.TrimPrefix(r.URL.Path, \"/halo/\")"
      - error: "curl: (7) Failed to connect to localhost port 8099"
        arti: "Server belum berjalan, atau berjalan di port lain."
        perbaikan:
          - "Pastikan go run main.go masih menyala di terminal pertama — tidak ada pesan error di sana"
          - "Cocokkan angka port di perintah curl dengan angka di program"
          - "Di Windows, curl bawaan tersedia sejak Windows 10 1803; kalau tidak ada, pakai browser"
    buktikan:
      perubahan: "Setelah langkah 6, kembalikan urutan seperti semula (kunci di dalam, log di luar), jalankan lagi, dan perhatikan jumlah baris log saat request tanpa kunci ditolak."
      hasil_diharapkan: "Dua baris log lagi, bukan satu. Dengan log di lapis terluar, request yang ditolak 401 pun tercatat — itulah gunanya menaruh logging paling luar: kamu melihat percobaan yang gagal, bukan hanya yang berhasil."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa middleware ditulis sebagai func(http.Handler) http.Handler, bukan sebagai daftar perintah yang dipanggil berurutan di dalam satu handler besar?"
    opsi:
      a: "Supaya lebih cepat dieksekusi"
      b: "Supaya tiap middleware bisa dipasang, dilepas, dan diuji sendiri tanpa menyentuh handler lain"
      c: "Karena Go tidak mengizinkan pemanggilan fungsi berurutan"
      d: "Supaya tidak perlu menulis http.HandlerFunc"
    jawaban: b
    penjelasan: "Bentuk itu membuat middleware menjadi nilai yang bisa dikomposisi: h = denganLog(denganKunci(h)). Satu handler besar berisi if berlapis-lapis sulit diuji sebagian, dan menambah satu lapis berarti menyunting fungsi yang sama dengan semua lapis lainnya. Dengan pembungkusan, tiap lapis punya satu tanggung jawab dan bisa diperiksa terpisah."
    tingkat: dasar
  - tipe: isian_singkat
    pertanyaan: "Agar sebuah tipe bisa dipakai sebagai http.Handler, ia wajib punya satu method bernama ... (satu kata, tanpa tanda kurung)"
    jawaban: "ServeHTTP"
    penjelasan: "Interface http.Handler hanya berisi ServeHTTP(http.ResponseWriter, *http.Request). http.HandlerFunc adalah trik kecil di pustaka standar: tipe fungsi dengan method ServeHTTP, sehingga fungsi biasa bisa memenuhi interface itu tanpa membuat struct."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Sebuah middleware menulis http.Error(w, \"ditolak\", 401) lalu tetap memanggil next.ServeHTTP(w, r). Apa yang terjadi?"
    opsi:
      a: "Client menerima 401 dan badan ditolak, lalu badan handler diabaikan"
      b: "Status 401 terkirim lebih dulu; tulisan handler ikut masuk ke badan respons sehingga body memuat dua teks dan status tetap 401"
      c: "Server panic dan mati"
      d: "Go otomatis membatalkan pemanggilan next"
    jawaban: b
    penjelasan: "Header dan status dikirim saat tulisan pertama keluar. Setelah itu WriteHeader kedua diabaikan (Go mencetak peringatan 'superfluous response.WriteHeader call'), tapi badan respons tetap bertambah. Karena itu setiap cabang penolakan wajib berakhir dengan return — memanggil next setelah menolak adalah bug yang tidak terlihat sampai ada yang membaca responsnya."
    tingkat: menengah
  - tipe: pilihan_ganda
    pertanyaan: "Log dipasang paling luar, kunci di dalamnya. Request tanpa header kunci ditolak 401. Berapa baris log yang muncul di terminal server?"
    opsi:
      a: "Nol — request ditolak jadi tidak dicatat"
      b: "Satu — log berjalan lebih dulu, mencatat request yang akhirnya ditolak"
      c: "Dua — satu untuk masuk, satu untuk keluar"
      d: "Tergantung apakah handler sempat dipanggil"
    jawaban: b
    penjelasan: "Lapis terluar berjalan lebih dulu dan tetap menyelesaikan pencatatannya, apa pun yang diputuskan lapis di dalamnya. Karena kunci mengembalikan sebelum handler, hanya ada satu baris. Balik urutannya dan jumlahnya jadi nol — itulah sebabnya posisi logging adalah keputusan, bukan detail: mau melihat percobaan yang gagal atau hanya yang berhasil."
    tingkat: menengah
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa http.Server sebaiknya diberi ReadHeaderTimeout alih-alih memakai http.ListenAndServe(alamat, h) langsung?"
    opsi:
      a: "Supaya respons lebih cepat"
      b: "Supaya koneksi yang mengirim header lambat tidak menahan sumber daya server selamanya"
      c: "Supaya HTTPS otomatis aktif"
      d: "Supaya jumlah goroutine dibatasi"
    jawaban: b
    penjelasan: "Tanpa batas waktu, client bisa membuka koneksi lalu berhenti mengirim header; goroutine-nya menunggu tanpa batas dan memorinya tidak kembali. Beberapa koneksi seperti itu cukup untuk menghabiskan server kecil — serangan slowloris. ReadHeaderTimeout menutup koneksi seperti itu tanpa mengganggu request normal, dan itu sebabnya ia satu-satunya batas waktu yang disarankan selalu diisi."
    tingkat: lanjutan
---

## Lapis 1

### Server Go dalam sebelas baris

```go
mux := http.NewServeMux()
mux.HandleFunc("GET /halo", func(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "halo")
})
http.ListenAndServe(":8080", mux)
```

Tiga hal yang terjadi, berurutan:

- `NewServeMux()` membuat **router**: tabel pola rute ke handler.
- `HandleFunc` mendaftarkan pola. Sejak Go 1.22 pola boleh memuat metode (`GET`) dan variabel path (`{nama}`).
- `ListenAndServe` membuka port, lalu untuk **setiap** koneksi menjalankan handler di goroutine baru.

Baris terakhir itu menjelaskan banyak hal sekaligus: kenapa `net/http` sudah konkuren tanpa konfigurasi, dan kenapa state bersama di level paket adalah bug yang menunggu waktu — dua request bisa menyentuhnya bersamaan.

### Dua parameter yang isinya bukan sekadar data

```go
func(w http.ResponseWriter, r *http.Request)
```

- `w` — **bukan** badan respons. Ia tujuan tulisan: `fmt.Fprint(w, ...)` mengirim byte ke client, `w.Header().Set(...)` menyiapkan header, `w.WriteHeader(404)` mengirim status. Status dan header hanya bisa dikirim **sekali**; setelah byte pertama keluar, keduanya terkunci.
- `r` — permintaan yang sudah diurai: `r.Method`, `r.URL.Path`, `r.Header`, `r.Body`, dan `r.Context()`.

`r` juga membawa pembatalan. Kalau client menutup koneksi, `r.Context().Done()` ditutup — itulah cara handler yang memanggil database tahu harus berhenti.

### Middleware: handler yang membungkus handler

Middleware adalah fungsi yang menerima handler, mengembalikan handler lain:

```go
func denganLog(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("→ %s %s", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)      // panggil lapis berikutnya
	})
}
```

Tidak ada yang ajaib di sini. `http.HandlerFunc` adalah tipe fungsi dengan method `ServeHTTP`, jadi fungsi biasa bisa memenuhi interface `http.Handler`. Pembungkusan terjadi karena `next` disimpan di dalam closure.

Memasangnya:

```go
var h http.Handler = mux
h = denganKunci("rahasia", h)   // dijalankan kedua
h = denganLog(h)                // dijalankan pertama
http.ListenAndServe(":8099", h)
```

Perhatikan arahnya: yang dipasang **terakhir** berjalan **pertama**. Setiap baris membungkus hasil baris sebelumnya, seperti kertas yang dilapisi.

### Program lengkap

Semua bagian di atas, dirangkai jadi satu berkas `main.go`:

```go
package main

import (
	"fmt"
	"log"
	"net/http"
	"time"
)

// denganLog mencatat setiap request yang lewat, termasuk yang ditolak lapis lain.
func denganLog(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		mulai := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s selesai dalam %s", r.Method, r.URL.Path, time.Since(mulai))
	})
}

// denganKunci menolak request yang tidak membawa header X-Kunci yang benar.
func denganKunci(rahasia string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("X-Kunci") != rahasia {
			http.Error(w, "kunci salah", http.StatusUnauthorized)
			return // wajib: tanpa ini handler tetap jalan dan menulis ke badan respons
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /halo/{nama}", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "halo, %s", r.PathValue("nama"))
	})

	mux.HandleFunc("GET /sehat", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	})

	var h http.Handler = mux
	h = denganKunci("rahasia", h) // dijalankan kedua
	h = denganLog(h)              // dijalankan pertama: paling luar

	log.Println("mendengar di :8099")
	log.Fatal(http.ListenAndServe(":8099", h))
}
```

Tiga request: satu tanpa header, satu dengan header, satu ke `/sehat`:

```
2026/11/05 15:17:02 mendengar di :8099
2026/11/05 15:17:04 GET /halo/aldi selesai dalam 0s
2026/11/05 15:17:04 GET /halo/aldi selesai dalam 0s
2026/11/05 15:17:05 GET /sehat selesai dalam 0s
```

Tanggal dan jam akan berbeda di mesinmu; yang perlu sama adalah **jumlah dan urutan** barisnya. Tiga baris log untuk tiga request — yang ditolak pun tercatat, karena `log` ada di lapis terluar. Jawabannya: `401` berisi `kunci salah` (12 byte), `200` berisi `halo, aldi` (10 byte), dan `/sehat` menjawab `204 No Content` tanpa badan.

### Urutan itu bukan detail

Request masuk lewat lapis terluar, turun sampai handler, lalu naik lagi:

```
log masuk → auth masuk → rate-limit masuk → handler → ... keluar
```

Konsekuensi praktis:

| Posisi | Yang kamu dapat |
|---|---|
| Log paling luar | semua request tercatat, termasuk yang ditolak lapis lain |
| Kunci paling luar | request tak berizin ditolak sebelum menyentuh apa pun — lebih murah, tapi tak terlihat di log |
| Recover paling luar | panic di lapis mana pun tetap jadi 500, server tidak mati |

Tidak ada urutan yang benar untuk semua orang. Yang salah adalah memasang tanpa tahu akibatnya.

### Kalau lupa `return` setelah menolak

```go
if r.Header.Get("X-Kunci") != rahasia {
	http.Error(w, "kunci salah", http.StatusUnauthorized)
	// TIDAK ada return di sini
}
next.ServeHTTP(w, r)
```

Status 401 sudah terkirim, tapi handler tetap dijalankan dan menambahkan isinya ke badan respons. Client menerima 401 dengan badan campuran. Go mencetak peringatan `superfluous response.WriteHeader call` di log — itulah satu-satunya petunjuk, dan mudah terlewat kalau log tidak dipasang di lapis terluar.

### Kenapa ini penting untuk pekerjaan

Hampir setiap kebutuhan lintas-rute berbentuk sama: catat, batasi, autentikasi, kompresi, CORS, timeout. Semuanya menyentuh **semua** rute dan tidak dimiliki rute mana pun. Menulisnya sebagai middleware berarti satu tempat untuk satu kebijakan — dan satu uji untuk satu kebijakan. Menyalin `if` yang sama ke dua puluh handler adalah cara paling umum membuat kebijakan menyimpang antar-endpoint.

## Lapis 2

### Meneruskan nilai ke handler: `context`

Middleware sering perlu memberi sesuatu kepada handler: id user hasil autentikasi, id request untuk korelasi log.

```go
type kunciKonteks struct{}

func denganUser(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user := ambilUser(r.Header.Get("Authorization"))
		ctx := context.WithValue(r.Context(), kunciKonteks{}, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// di handler:
user := r.Context().Value(kunciKonteks{}).(User)
```

Dua aturan yang tidak boleh dilanggar:

1. **Kunci konteks bertipe, bukan string.** `context.WithValue(r.Context(), "user", u)` bisa bertabrakan dengan paket lain yang memakai kunci `"user"`; struct kosong milik paketmu tidak bisa bertabrakan.
2. **`WithValue` untuk data request, bukan parameter wajib.** Kalau handler tidak bisa jalan tanpanya, jadikan argumen biasa — konteks tidak terlihat di tanda tangan fungsi, jadi ketiadaannya baru terasa saat runtime (`panic` karena type assertion gagal).

### Menangkap status respons

`http.ResponseWriter` tidak punya cara membaca status yang sudah dikirim. Untuk mencatat `200`/`404`/`500` di log, bungkus dulu:

```go
type pencatat struct {
	http.ResponseWriter
	status int
}

func (p *pencatat) WriteHeader(kode int) {
	p.status = kode
	p.ResponseWriter.WriteHeader(kode)
}
```

Lalu di middleware: `p := &pencatat{ResponseWriter: w, status: 200}; next.ServeHTTP(p, r)`.

Jebakan yang sering menggigit: `*pencatat` hanya memenuhi `http.ResponseWriter`, bukan `http.Flusher` atau `http.Hijacker`. Middleware yang membungkus dengan cara ini mematikan streaming (SSE) dan WebSocket pada rute di bawahnya. Solusinya `http.ResponseController` (Go 1.20+) atau implementasi `Unwrap() http.ResponseWriter` pada struct pembungkus.

### Batas waktu dan penghentian yang rapi

```go
srv := &http.Server{
	Addr:              ":8099",
	Handler:           h,
	ReadHeaderTimeout: 5 * time.Second,
	ReadTimeout:       15 * time.Second,
	WriteTimeout:      15 * time.Second,
	IdleTimeout:       60 * time.Second,
}

go func() { log.Fatal(srv.ListenAndServe()) }()

<-sinyalBerhenti()                        // SIGINT / SIGTERM
ctx, batal := context.WithTimeout(context.Background(), 10*time.Second)
defer batal()
srv.Shutdown(ctx)                         // berhenti menerima, tunggu request berjalan
```

`srv.Shutdown` berhenti menerima koneksi baru lalu menunggu request yang sedang berjalan selesai — berbeda dari `os.Exit` yang memotong semuanya di tengah jalan. Di container, ini yang membuat deploy tanpa request gagal.

Urutan batas waktu yang masuk akal: `ReadHeaderTimeout` paling ketat (header seharusnya tiba segera), `WriteTimeout` lebih longgar dari waktu handler terlama, `IdleTimeout` paling longgar. Kalau `WriteTimeout` lebih pendek dari waktu handler, respons panjang akan terpotong tanpa error yang jelas di sisi handler.

### Middleware yang menghabiskan memori

Rantai middleware berjalan **per request**, jadi biaya yang tampak kecil berlipat dengan trafik:

| Kebiasaan | Akibat |
|---|---|
| Membaca seluruh `r.Body` untuk logging | body besar masuk memori dua kali |
| `json.Marshal` seluruh respons untuk audit | alokasi sebesar respons, tiap request |
| Buffer `bytes.Buffer` tanpa ukuran maksimum | satu request jahat bisa memakan RAM |
| Membuat `http.Client` baru di dalam handler | koneksi tidak pernah dipakai ulang |

Untuk yang terakhir: `http.Client` aman dipakai banyak goroutine dan sebaiknya dibuat sekali di level paket. Membuatnya per request berarti membuang connection pool setiap kali.

### Error umum

| Pesan | Arti | Cara memperbaiki |
|---|---|---|
| `http: superfluous response.WriteHeader call` | `WriteHeader` dipanggil dua kali | pastikan cabang penolakan berakhir `return` |
| `listen tcp :8099: bind: Only one usage of each socket address...` | port sudah dipakai | matikan proses lama, atau ganti port |
| `404 page not found` padahal rute terdaftar | pola memakai fitur Go 1.22 di versi lebih lama | perbarui Go, atau pakai `HandleFunc("/halo/")` + `TrimPrefix` |
| `panic: interface conversion: interface {} is nil` | `Context().Value` kosong karena middleware tidak terpasang | pasang middleware-nya, atau pakai type assertion dua nilai `v, ok :=` |
| `http: named cookie not present` | `r.Cookie` untuk cookie yang tidak dikirim client | periksa nama cookie, dan tangani ketiadaannya sebagai kasus normal |

### Rujukan resmi

- `pkg.go.dev/net/http` — dokumentasi `ServeMux`, `Handler`, dan pola rute 1.22.
- `pkg.go.dev/net/http#Server` — daftar lengkap field batas waktu dan artinya.

## Latihan

Lihat frontmatter `latihan[]`. Latihan 1 dijalankan di web (menghitung biaya rantai middleware); latihan 2 diikuti di laptop dengan 6 langkah baku dan menghasilkan server Go yang benar-benar menjawab curl.

## Kamu sudah bisa ini kalau…

- [ ] Bisa menjelaskan kenapa `h = denganLog(h)` yang dipasang terakhir berjalan lebih dulu.
- [ ] Bisa menyebut akibat lupa `return` setelah `http.Error`, tanpa membuka dokumentasi.
- [ ] Bisa memilih posisi logging dan posisi autentikasi, dan menyebut konsekuensi tiap pilihan.
- [ ] Tahu kenapa `ReadHeaderTimeout` hampir selalu perlu diisi.
- [ ] Latihan 1 lulus dan latihan 2 memberi 401 tanpa kunci, 200 dengan kunci, lalu satu baris log lebih sedikit setelah urutan middleware ditukar.
