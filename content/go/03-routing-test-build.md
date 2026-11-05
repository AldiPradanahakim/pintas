---
track: go
nomor: 3
judul: "Routing, test, dan build: dari satu handler ke layanan yang bisa dirilis"
slug: routing-test-build
estimasi_menit: 14
prasyarat:
  - go/http-server-dan-middleware
latihan:
  - id: go-03-latihan-1
    jenis: web
    bahasa: python
    soal: "Simulasikan pencocokan rute gaya ServeMux. Diberi tabel rute (metode, pola) dan lima permintaan. Pola boleh memuat segmen berparameter berawalan ':'. Aturan: kalau tidak ada pola yang cocok sama sekali -> 404; kalau pola cocok tapi metodenya tidak terdaftar -> 405; selain itu 200 (atau 201 untuk POST). Cetak '<metode> <jalur> -> <kode>' satu per baris."
    kode_awal: |-
      RUTE = [("GET", "/produk"), ("GET", "/produk/:id"), ("POST", "/produk")]

      PERMINTAAN = [
          ("GET", "/produk"),
          ("GET", "/produk/7"),
          ("DELETE", "/produk"),
          ("GET", "/pelanggan"),
          ("POST", "/produk"),
      ]

      # cocokkan pola per segmen; ':' berarti segmen apa pun
      # cetak "<metode> <jalur> -> <kode>"
    output_harapan: |-
      GET /produk -> 200
      GET /produk/7 -> 200
      DELETE /produk -> 405
      GET /pelanggan -> 404
      POST /produk -> 201
    solusi: |-
      RUTE = [("GET", "/produk"), ("GET", "/produk/:id"), ("POST", "/produk")]

      PERMINTAAN = [
          ("GET", "/produk"),
          ("GET", "/produk/7"),
          ("DELETE", "/produk"),
          ("GET", "/pelanggan"),
          ("POST", "/produk"),
      ]

      def cocok(pola, jalur):
          a = pola.split("/")
          b = jalur.split("/")
          if len(a) != len(b):
              return False
          return all(p.startswith(":") or p == q for p, q in zip(a, b))

      def layani(metode, jalur):
          pola_ada = [p for m, p in RUTE if cocok(p, jalur)]
          if not pola_ada:
              return 404
          for m, p in RUTE:
              if cocok(p, jalur) and m == metode:
                  return 201 if metode == "POST" else 200
          return 405

      for metode, jalur in PERMINTAAN:
          print(f"{metode} {jalur} -> {layani(metode, jalur)}")
    catatan_solusi: "Perhatikan urutan pemeriksaan: cocokkan POLA dulu, baru METODE. Kalau dibalik, DELETE /produk akan dilaporkan 404 padahal rutenya jelas ada — yang salah cuma metodenya. Bedanya penting bagi klien: 404 berarti 'alamat salah, jangan coba lagi', 405 berarti 'alamat benar, metodenya yang salah' dan responsnya wajib menyertakan header Allow berisi metode yang didukung."
  - id: go-03-latihan-2
    jenis: laptop
    soal: "Bangun layanan Go kecil yang lengkap: rute berparameter, test dengan httptest, lalu build jadi satu binary. Buktikan ketiganya bekerja tanpa membuka port untuk menguji."
    kebutuhan:
      - "Go 1.21 atau lebih baru (go version)"
      - "Terminal (git-bash / PowerShell)"
      - "curl untuk uji manual"
    langkah:
      - perintah: "mkdir latihan-rilis && cd latihan-rilis && go mod init latihanrilis"
        penjelasan: "Folder kerja dan modul Go. go.mod wajib ada sebelum perintah go lain berjalan."
      - perintah: "notepad main.go"
        penjelasan: "Tempel program dari bagian 'Rute berparameter tanpa framework' di atas. Di Linux/macOS ganti nano main.go."
      - perintah: "go test -v ./..."
        penjelasan: "Menjalankan test di main_test.go (buat dengan notepad juga, isi dari bagian 'Test tanpa membuka port'). Harus lulus tanpa membuka port apa pun."
      - perintah: "go build -o layanan.exe main.go"
        penjelasan: "Menghasilkan satu berkas binary yang bisa dijalankan di mesin lain tanpa memasang Go. Di Linux/macOS ganti namanya jadi 'layanan'. Inilah kelebihan Go yang paling sering disebut: satu berkas, tanpa runtime."
      - perintah: "go run main.go"
        penjelasan: "Menjalankan server di :8080. Biarkan terbuka, lalu jalankan langkah berikutnya di jendela kedua."
      - perintah: "curl -s -o /dev/null -w '%{http_code}\\n' http://127.0.0.1:8080/produk/7"
        penjelasan: "Menguji rute berparameter. Output 200 — segmen ':id' menangkap '7'."
    hasil: |-
      === RUN   TestProduk
      --- PASS: TestProduk (0.00s)
      PASS
      ok  	latihanrilis	0.00Xs
      200
    cek_berhasil:
      - "Langkah 3 mencetak PASS dan 'ok' tanpa membuka port"
      - "Langkah 4 menghasilkan layanan.exe (cek dengan ls)"
      - "Langkah 6 mencetak 200 untuk /produk/7"
    kalau_gagal:
      - error: "no Go files in ..."
        arti: "Perintah dijalankan di folder tanpa berkas .go, atau nama berkasnya bukan main.go."
        perbaikan:
          - "Pastikan sudah cd latihan-rilis"
          - "Cek dengan ls — main.go dan main_test.go harus ada"
      - error: "undefined: tangkapID"
        arti: "Fungsi pembantu didefinisikan di main.go tapi test memanggilnya dari paket lain, atau nama fungsinya beda."
        perbaikan:
          - "Kedua berkas harus 'package main' dan berada di folder yang sama"
      - error: "go: cannot find main module"
        arti: "go.mod tidak ada — biasanya karena folder kerja salah atau go mod init belum dijalankan."
        perbaikan:
          - "Jalankan go mod init latihanrilis di folder kerja"
      - error: "listen tcp :8080: bind: address already in use"
        arti: "Port 8080 dipakai proses lain, sering sisa percobaan sebelumnya."
        perbaikan:
          - "Tekan Ctrl+C di jendela server yang lama"
          - "Atau ganti alamat dengar ke :8081"
    buktikan:
      perubahan: "Ubah pola rute dari /produk/:id menjadi /barang/:id, lalu jalankan ulang go test."
      hasil_diharapkan: "Test GAGAL karena /produk/7 sekarang 404. Membuktikan test benar-benar memeriksa routing, bukan sekadar lulus tanpa memeriksa apa pun."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Sejak Go 1.22, apa yang bisa dilakukan ServeMux bawaan yang sebelumnya harus memakai framework?"
    opsi:
      a: "Mengubah isi database"
      b: "Mencocokkan metode HTTP dan segmen berparameter seperti /produk/{id}"
      c: "Merender HTML"
      d: "Mengelola sesi pengguna"
    jawaban: b
    penjelasan: "Go 1.22 menambahkan pola seperti 'GET /produk/{id}' ke ServeMux: metode ikut dicocokkan, dan {id} ditangkap lewat r.PathValue(\"id\"). Sebelumnya ini alasan utama orang memasang Gin atau Chi. Untuk API biasa, ServeMux sekarang cukup."
    tingkat: menengah
  - tipe: pilihan_ganda
    pertanyaan: "Apa keuntungan utama Go menghasilkan satu binary tanpa dependensi?"
    opsi:
      a: "Kode jadi lebih pendek"
      b: "Bisa disalin ke server tanpa memasang runtime atau pustaka lain"
      c: "Otomatis lebih cepat"
      d: "Tidak butuh konfigurasi"
    jawaban: b
    penjelasan: "Binary Go sudah memuat seluruh kode dan runtime-nya. Menyalin satu berkas ke server Linux lalu menjalankannya sudah cukup — tanpa JVM, tanpa node_modules, tanpa interpreter. Ini menyederhanakan deployment secara nyata, bukan sekadar soal kecepatan."
    tingkat: dasar
  - tipe: isian_singkat
    pertanyaan: "Fungsi dari paket net/http/httptest yang menangkap respons handler tanpa membuka port bernama New... (satu kata)"
    jawaban: "recorder"
    penjelasan: "httptest.NewRecorder() mengembalikan *httptest.ResponseRecorder yang merekam status, header, dan isi. Dipasangkan dengan httptest.NewRequest(), kamu bisa menguji handler seolah-olah ada permintaan sungguhan — tanpa port, tanpa jaringan, tanpa race antar-test."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Test gagal dengan pesan 'kode = 200, ingin 404'. Apa yang sebenarnya terjadi?"
    opsi:
      a: "Server crash"
      b: "Handler tidak menulis status error — ia menulis 200 (atau tidak menulis apa pun, yang default-nya 200)"
      c: "Test-nya yang salah"
      d: "Port sudah dipakai"
    jawaban: b
    penjelasan: "Handler yang tidak menulis apa pun menghasilkan 200 dengan isi kosong. Handler harus menulis 404 dan return secara eksplisit. Pesan test seperti ini justru bukti test bekerja — ia menangkap handler yang lupa menangani cabang error, bug yang tidak terlihat saat menguji manual di jalur sukses."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Kalau pola rute cocok tapi metodenya tidak terdaftar, kode status yang tepat adalah ... (tiga digit)"
    jawaban: "405"
    penjelasan: "405 Method Not Allowed, bukan 404. Bedanya penting: 404 berarti alamatnya tidak ada sama sekali, 405 berarti alamatnya ada tapi metodenya salah. Respons 405 wajib menyertakan header Allow berisi metode yang didukung. Menjawab 404 untuk metode salah membuat klien mengira alamatnya berubah."
    tingkat: menengah
---

## Lapis 1

### Dari handler tunggal ke layanan

Modul sebelumnya berakhir dengan satu endpoint. Layanan nyata butuh tiga hal lagi:

1. **Routing** — beberapa alamat, sebagian berparameter.
2. **Test** — membuktikan perilakunya tanpa membuka port.
3. **Build** — satu berkas yang bisa disalin ke server.

Ketiganya tersedia di pustaka standar. Tidak ada yang perlu dipasang.

### Routing: ServeMux sejak Go 1.22

```go
mux := http.NewServeMux()
mux.HandleFunc("GET /produk", daftarProduk)
mux.HandleFunc("POST /produk", buatProduk)
mux.HandleFunc("GET /produk/{id}", ambilProduk)
```

Tiga hal yang berubah dibanding versi lama:

- **Metode ikut dicocokkan.** `GET /produk` tidak akan melayani `DELETE /produk`; Go membalas 405 otomatis, lengkap dengan header `Allow`.
- **`{id}` menangkap segmen.** Di handler, ambil dengan `r.PathValue("id")`.
- **Pola lebih spesifik menang.** `/produk/{id}` mengalahkan `/produk/{apa}` tanpa perlu urutan pendaftaran.

Untuk sebagian besar API, ini sudah cukup. Framework seperti Chi atau Gin masih berguna untuk pengelompokan rute dengan middleware bersama, tapi bukan lagi keharusan hanya untuk rute berparameter.

### Test: handler adalah fungsi biasa

Karena handler hanya fungsi, ia bisa dipanggil langsung:

```go
req := httptest.NewRequest(http.MethodGet, "/produk/7", nil)
rec := httptest.NewRecorder()
handler.ServeHTTP(rec, req)
// rec.Code, rec.Body
```

Tidak ada port. Tidak ada jaringan. Test jalan dalam milidetik dan bisa berjalan paralel tanpa saling ganggu.

Kuncinya: **rakit handler di fungsi terpisah**, bukan di `main`.

```go
func buatHandler() http.Handler {
    mux := http.NewServeMux()
    // ...
    return mux
}
```

`main` hanya memanggil `buatHandler()` lalu mendengarkan. Test memanggil `buatHandler()` langsung.

### Build: satu berkas, tanpa runtime

```bash
go build -o layanan.exe main.go
```

Hasilnya satu berkas yang memuat seluruh kode dan runtime Go. Salin ke server, jalankan, selesai. Tidak ada `node_modules`, tidak ada JVM, tidak ada interpreter.

Ini menyederhanakan deployment secara nyata — dan juga membuat image Docker sangat kecil, karena kamu bisa membangun di satu tahap lalu menyalin satu berkas ke tahap akhir.

### Tiga kesalahan yang paling sering

**Lupa `return` setelah `http.Error`.** Kode di bawahnya tetap jalan: menulis 401, lalu tetap menulis 200. Respons jadi rusak dan sulit dilacak.

**Tidak menulis status sama sekali.** Handler yang tidak menulis apa pun menghasilkan 200 kosong. Klien mengira berhasil.

**Merakit handler di `main`.** Handler jadi tidak bisa diuji tanpa membuka port, dan test akhirnya dilewati.

## Lapis 2

### Rute berparameter tanpa framework

```go
package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"
)

type Produk struct {
	ID   string `json:"id"`
	Nama string `json:"nama"`
}

var gudang = map[string]Produk{
	"1": {ID: "1", Nama: "Kabel HDMI"},
	"7": {ID: "7", Nama: "Mouse"},
}

// buatHandler dirakit terpisah supaya bisa diuji tanpa membuka port.
func buatHandler() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /produk", func(w http.ResponseWriter, r *http.Request) {
		daftar := make([]Produk, 0, len(gudang))
		for _, p := range gudang {
			daftar = append(daftar, p)
		}
		tulisJSON(w, http.StatusOK, daftar)
	})

	mux.HandleFunc("GET /produk/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id") // ← sejak Go 1.22
		p, ada := gudang[id]
		if !ada {
			http.Error(w, "produk tidak ditemukan", http.StatusNotFound)
			return
		}
		tulisJSON(w, http.StatusOK, p)
	})

	return mux
}

func tulisJSON(w http.ResponseWriter, kode int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(kode)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("gagal menulis JSON: %v", err)
	}
}

func main() {
	srv := &http.Server{
		Addr:              ":8080",
		Handler:           buatHandler(),
		ReadHeaderTimeout: 5 * time.Second,
	}
	log.Println("dengar di", srv.Addr)
	log.Fatal(srv.ListenAndServe())
}
```

Perhatikan `tulisJSON`: header **dulu**, lalu status, lalu isi. Urutan ini tidak bisa ditukar — setelah `WriteHeader`, header berikutnya diabaikan diam-diam.

`make([]Produk, 0, len(gudang))` bukan `var daftar []Produk`. Kalau `gudang` kosong, versi kedua menghasilkan `null`, sementara versi pertama menghasilkan `[]`. Klien yang mengharapkan array akan gagal pada `null` — perbedaan satu baris yang menyebabkan bug nyata di produksi.

### Test tanpa membuka port

```go
package main

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestProduk(t *testing.T) {
	kasus := []struct {
		nama   string
		metode string
		jalur  string
		kode   int
	}{
		{"daftar", http.MethodGet, "/produk", http.StatusOK},
		{"satu ada", http.MethodGet, "/produk/7", http.StatusOK},
		{"satu tidak ada", http.MethodGet, "/produk/999", http.StatusNotFound},
		{"metode salah", http.MethodDelete, "/produk", http.StatusMethodNotAllowed},
	}

	h := buatHandler()

	for _, k := range kasus {
		t.Run(k.nama, func(t *testing.T) {
			req := httptest.NewRequest(k.metode, k.jalur, nil)
			rec := httptest.NewRecorder()

			h.ServeHTTP(rec, req)

			if rec.Code != k.kode {
				t.Fatalf("%s %s: kode = %d, ingin %d", k.metode, k.jalur, rec.Code, k.kode)
			}
		})
	}
}

func TestBuatProduk(t *testing.T) {
	body := strings.NewReader(`{"nama":"Keyboard"}`)
	req := httptest.NewRequest(http.MethodPost, "/produk", body)
	rec := httptest.NewRecorder()

	buatHandler().ServeHTTP(rec, req)

	if rec.Code != http.StatusCreated && rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("kode tak terduga: %d", rec.Code)
	}
}
```

Tabel kasus (`[]struct{...}`) adalah pola idiomatik Go: satu test, banyak kasus, tiap kasus muncul sebagai sub-test bernama. Saat gagal, nama sub-test langsung menunjukkan kasus mana.

### Menguji JSON yang dikembalikan

Membandingkan string JSON rapuh — urutan kunci bisa berbeda. Dekode dulu:

```go
var hasil Produk
if err := json.NewDecoder(rec.Body).Decode(&hasil); err != nil {
	t.Fatalf("JSON tidak sah: %v", err)
}
if hasil.Nama != "Mouse" {
	t.Fatalf("nama = %q, ingin \"Mouse\"", hasil.Nama)
}
```

Juga periksa header-nya, karena itu bagian dari kontrak:

```go
if ct := rec.Header().Get("Content-Type"); !strings.HasPrefix(ct, "application/json") {
	t.Fatalf("Content-Type = %q", ct)
}
```

### Build untuk target lain

```bash
GOOS=linux go build -o layanan main.go
```

Menghasilkan binary Linux dari mesin Windows. Ini yang membuat deployment ke server Linux cepat: bangun di mesin mana pun, salin satu berkas.

Untuk binary yang lebih kecil, tambahkan `-ldflags="-s -w"` yang membuang tabel debug. Ukurannya bisa turun 25–30%.

### Daftar periksa

1. Setiap rute punya metode eksplisit (`GET /produk`, bukan `/produk`).
2. Handler dirakit di fungsi terpisah, bukan di `main`.
3. Setiap cabang error memanggil `http.Error` **dan** `return`.
4. `Content-Type` diset sebelum `WriteHeader`.
5. Slice kosong dibuat dengan `make([]T, 0, n)` supaya menghasilkan `[]`, bukan `null`.
6. Test memakai tabel kasus dan memeriksa kode status, bukan hanya "tidak panic".
7. JSON diuji dengan dekode lalu bandingkan field, bukan perbandingan string.
8. `ReadHeaderTimeout` diset pada `http.Server`.
