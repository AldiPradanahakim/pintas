---
track: go
nomor: 1
judul: "Goroutine & channel: banyak pekerja, satu antrean"
slug: goroutine-dan-channel
estimasi_menit: 14
prasyarat:
  - fondasi/cli
latihan:
  - id: go-01-latihan-1
    jenis: web
    bahasa: python
    soal: "Simulasikan worker pool: 3 worker mengambil tugas dari satu antrean berisi 6 tugas. Aturan: satu worker hanya memegang satu tugas pada satu waktu; tugas diambil berurutan; tugas berikutnya diambil worker yang paling cepat selesai (kalau seri, nomor worker terkecil). Setiap tugas punya durasi tetap. Cetak satu baris per tugas: '<nama> selesai di worker <w> pada detik <t>', lalu satu baris terakhir 'makespan <t>' berisi waktu selesai paling akhir."
    kode_awal: |-
      ANTREAN = [
          ("unduh-a", 3),
          ("unduh-b", 1),
          ("unduh-c", 4),
          ("unduh-d", 2),
          ("unduh-e", 6),
          ("unduh-f", 1),
      ]
      JUMLAH_WORKER = 3

      selesai = [0] * JUMLAH_WORKER

      # untuk tiap tugas: pilih worker dengan selesai[w] terkecil (seri -> indeks terkecil),
      # tambahkan durasinya, cetak barisnya. Akhiri dengan makespan.
    output_harapan: |-
      unduh-a selesai di worker 0 pada detik 3
      unduh-b selesai di worker 1 pada detik 1
      unduh-c selesai di worker 2 pada detik 4
      unduh-d selesai di worker 1 pada detik 3
      unduh-e selesai di worker 0 pada detik 9
      unduh-f selesai di worker 1 pada detik 4
      makespan 9
    solusi: |-
      ANTREAN = [
          ("unduh-a", 3),
          ("unduh-b", 1),
          ("unduh-c", 4),
          ("unduh-d", 2),
          ("unduh-e", 6),
          ("unduh-f", 1),
      ]
      JUMLAH_WORKER = 3

      selesai = [0] * JUMLAH_WORKER

      for nama, durasi in ANTREAN:
          w = min(range(JUMLAH_WORKER), key=lambda i: (selesai[i], i))
          selesai[w] += durasi
          print(f"{nama} selesai di worker {w} pada detik {selesai[w]}")

      print("makespan", max(selesai))
    catatan_solusi: "Perhatikan baris `min(..., key=(selesai[i], i))`: itulah seluruh isi penjadwalnya. Worker yang sudah paling lama menganggur mendapat tugas berikutnya, dan pasangan (selesai[i], i) memastikan seri dimenangkan nomor worker terkecil — tanpa itu urutan baris bisa berubah. Bandingkan dua angka di akhir: jumlah seluruh durasi adalah 17 detik kalau dikerjakan satu per satu, sedangkan makespan 9 detik. Yang menentukan lama pekerjaan bukan total kerja, melainkan worker yang paling akhir selesai. Inilah alasan menambah goroutine hanya menolong selama masih ada worker yang menganggur."
  - id: go-01-latihan-2
    jenis: laptop
    soal: "Jalankan program Go yang menyebar 5 perhitungan ke 5 goroutine dan mengumpulkan hasilnya lewat satu channel. Buktikan hasilnya benar, dan bahwa pemeriksa bawaan Go tidak menemukan kesalahan."
    kebutuhan:
      - "Go 1.21 atau lebih baru (go version)"
      - "Terminal (git-bash / PowerShell)"
    langkah:
      - perintah: "go version"
        penjelasan: "Menampilkan versi Go yang aktif. Kalau perintah ini tidak dikenal, Go belum terpasang atau belum ada di PATH."
      - perintah: "mkdir latihan-goroutine && cd latihan-goroutine && go mod init latihan"
        penjelasan: "Membuat folder kerja dan modul Go. go mod init menulis go.mod berisi nama modul; sejak Go 1.16 hampir semua perintah menolak jalan tanpa berkas ini."
      - perintah: "notepad main.go"
        penjelasan: "Buat berkas main.go dan tempel isi program dari blok kode di bagian 'Satu antrean, banyak pekerja' di atas. Di Linux/macOS ganti dengan nano main.go."
      - perintah: "go run main.go"
        penjelasan: "Kompilasi lalu jalankan. Lima goroutine mengirim hasil ke satu channel; main menjumlahkan apa pun yang masuk. Urutan masuknya tidak dijamin, tapi jumlahnya selalu sama."
      - perintah: "go vet main.go"
        penjelasan: "Pemeriksa bawaan Go: mencari pemakaian yang mencurigakan, termasuk pola menangkap variabel loop. Perintah ini SENYAP kalau tidak ada temuan — keluar tanpa mencetak apa pun berarti lulus."
      - perintah: "Ubah batas loop dari i <= 5 menjadi i <= 10, lalu go run main.go"
        penjelasan: "Menambah pekerjaan tanpa mengubah bentuk program: cukup batas loop. Jumlah hasilnya naik, dan tidak ada kode tambahan untuk menunggu goroutine — wg.Wait dan close(out) sudah menanganinya."
    hasil: |-
      total: 55
    cek_berhasil:
      - "Langkah 4 mencetak total: 55"
      - "Langkah 5 tidak mencetak apa pun (go vet senyap berarti lulus)"
      - "Langkah 6 mencetak total: 385"
    kalau_gagal:
      - error: "go: command not found  /  'go' is not recognized as an internal or external command"
        arti: "Go belum terpasang atau foldernya tidak ada di PATH."
        perbaikan:
          - "Pasang dari go.dev/dl, pilih installer untuk sistem operasimu"
          - "Tutup terminal lalu buka lagi — PATH hanya dibaca saat terminal dimulai"
          - "Ulangi go version; kalau masih gagal, cek folder bin Go ada di PATH"
      - error: "go: go.mod file not found in current directory or any parent directory"
        arti: "Perintah go dijalankan di folder yang belum punya go.mod."
        perbaikan:
          - "cd latihan-goroutine dulu, lalu go mod init latihan"
          - "Cek dengan ls — go.mod harus terlihat"
      - error: "fatal error: all goroutines are asleep - deadlock!"
        arti: "Semua goroutine menunggu sesuatu yang tidak akan pernah datang. Biasanya karena channel tidak pernah ditutup, jadi range di main menunggu selamanya."
        perbaikan:
          - "Pastikan ada go func() { wg.Wait(); close(out) }() setelah loop peluncuran"
          - "Pastikan setiap goroutine memanggil defer wg.Done() di baris pertama"
          - "Jumlah wg.Add harus sama dengan jumlah goroutine yang diluncurkan"
      - error: "undefined: sync"
        arti: "Paket sync dipakai tapi belum diimpor."
        perbaikan:
          - "Tambahkan sync ke blok import"
          - "Jalankan gofmt -w main.go — ia merapikan blok import, tapi tidak menambahkannya"
      - error: "go: -race requires cgo; enable cgo by setting CGO_ENABLED=1"
        arti: "Race detector butuh kompilator C. Di Windows ini sering muncul karena gcc tidak ada di PATH."
        perbaikan:
          - "Lewati langkah ini — untuk modul ini go vet sudah cukup"
          - "Kalau memang butuh -race di Windows, pasang gcc (mis. lewat MSYS2) lalu ulangi dengan CGO_ENABLED=1"
    buktikan:
      perubahan: "Ubah batas loop dari i <= 5 menjadi i <= 10, lalu jalankan go run main.go."
      hasil_diharapkan: "total: 385 — jumlah kuadrat 1 sampai 10. Perhatikan tidak ada satu baris pun yang perlu diubah selain batas loop: channel dan WaitGroup menyesuaikan sendiri, dan urutan masuknya tetap tidak dijamin sementara jumlahnya selalu tepat."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Apa yang dilakukan pengiriman ke channel tanpa buffer (make(chan int)) kalau belum ada yang menerima?"
    opsi:
      a: "Mengembalikan error"
      b: "Membuang nilainya"
      c: "Menghentikan goroutine pengirim sampai ada penerima"
      d: "Menyimpannya di buffer tersembunyi"
    jawaban: c
    penjelasan: "Channel tanpa buffer adalah titik temu: pengirim dan penerima harus bertemu. Pengirim berhenti di baris itu sampai ada goroutine yang membaca. Inilah yang membuat channel sekaligus menjadi alat sinkronisasi, bukan hanya pipa data — dan juga sumber deadlock kalau penerimanya tidak pernah datang."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Enam tugas dengan total durasi 17 detik dibagi ke 3 worker yang berjalan bersamaan. Waktu yang dibutuhkan sampai semua selesai paling dekat dengan apa?"
    opsi:
      a: "17 detik, karena total kerja tetap 17 detik"
      b: "Sekitar 9 detik, ditentukan worker yang paling akhir selesai"
      c: "Selalu 6 detik, yaitu 17 dibagi 3"
      d: "Tergantung jumlah CPU, tidak bisa diperkirakan"
    jawaban: b
    penjelasan: "Waktu selesai ditentukan makespan: worker yang paling akhir. Pembagian 17 dibagi 3 menghasilkan 6 hanya kalau tugas bisa dipotong seadanya — di sini tugas tidak bisa dibelah, jadi worker yang kebagian tugas 6 detik baru selesai paling akhir. Menambah worker menolong hanya selama masih ada worker menganggur."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Kata kunci satu kata yang mengubah pemanggilan fungsi menjadi goroutine baru adalah ... (tanpa tanda kurung)"
    jawaban: "go"
    penjelasan: "Cukup go di depan pemanggilan: go hitung(5). Seluruh model konkurensi Go dibangun dari satu kata kunci ini ditambah channel. Yang perlu diingat: pemanggilan itu langsung kembali, jadi nilainya tidak bisa ditangkap — hasil harus dikirim lewat channel."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa channel perlu ditutup (close) setelah semua pengirim selesai?"
    opsi:
      a: "Supaya memorinya dibebaskan"
      b: "Supaya range pada channel berhenti, bukan menunggu selamanya"
      c: "Supaya goroutine pengirim berhenti"
      d: "Supaya channel bisa dipakai lagi"
    jawaban: b
    penjelasan: "range pada channel membaca sampai channel ditutup. Tanpa close, penerima menunggu selamanya dan program berakhir dengan deadlock. Aturannya: hanya pengirim yang boleh menutup, dan hanya kalau semua pengirim sudah selesai — menutup dari penerima, atau dua kali, adalah panic."
    tingkat: menengah
  - tipe: pilihan_ganda
    pertanyaan: "Dua goroutine menambah variabel yang sama tanpa sinkronisasi. Apa masalahnya dan bagaimana Go menunjukkannya?"
    opsi:
      a: "Tidak ada masalah, Go mengunci variabel otomatis"
      b: "Nilainya bisa salah karena baca-tulis bertumpang tindih; go run -race melaporkannya"
      c: "Program menolak dikompilasi"
      d: "Nilainya benar tapi lebih lambat"
    jawaban: b
    penjelasan: "Penambahan bukan satu operasi tak terbagi: baca, tambah, tulis. Dua goroutine bisa membaca nilai lama yang sama, lalu keduanya menulis hasil yang sama — satu penambahan hilang. Kompilator tidak bisa menangkapnya karena baru terjadi saat berjalan; race detector (go run -race, go test -race) yang menemukannya, dengan harga program jauh lebih lambat — jadi pakai saat menguji, bukan di produksi."
    tingkat: lanjutan
---

## Lapis 1

### Satu kata kunci, satu antrean

Di bahasa lain, menjalankan dua hal bersamaan berarti memilih: thread (mahal, perlu kunci), proses (mahal, perlu berbagi data lewat pipa), atau event loop (satu utas, mudah tersumbat). Go mengambil jalan lain: goroutine yang murah, dan **channel** sebagai satu-satunya cara aman mengirim data antar goroutine.

```go
go hitung(5)          // jalankan hitung di goroutine baru
```

Itu seluruh sintaksisnya. Fungsi yang dipanggil dengan `go` langsung kembali; pemanggil tidak menunggu dan tidak menerima nilai kembaliannya.

Karena tidak ada nilai kembalian, hasil harus lewat jalur lain:

```go
hasil := make(chan int)
go func() { hasil <- 42 }()
angka := <-hasil       // menerima; menunggu kalau belum ada yang mengirim
```

- `ch <- v` — kirim.
- `<-ch` — terima.
- Panah menunjuk arah data.

### Channel yang tidak punya buffer adalah janji temu

```go
ch := make(chan int)        // tanpa buffer
ch <- 1                     // berhenti di sini sampai ada yang menerima
```

Pengirim dan penerima harus bertemu. Konsekuensinya sering mengejutkan pemula: `ch <- 1` pada goroutine utama **memblokir seluruh program** kalau tidak ada penerima. Itu bukan bug, itu memang aturannya — dan itulah yang membuat channel bisa dipakai sebagai alat sinkronisasi, bukan hanya pipa data.

Buffer melonggarkan janji itu:

```go
ch := make(chan int, 3)     // muat 3 nilai
ch <- 1                     // tidak menunggu
ch <- 2                     // tidak menunggu
ch <- 3                     // tidak menunggu
ch <- 4                     // penuh: menunggu sampai ada yang mengambil
```

Buffer bukan "lebih cepat". Ia hanya mengizinkan pengirim mendahului sejauh kapasitasnya, lalu tetap berhenti. Kalau kamu tidak bisa menjelaskan kenapa angkanya 3 dan bukan 30, kemungkinan besar buffer itu tidak dibutuhkan — channel tanpa buffer lebih mudah dibuktikan benar.

### Satu antrean, banyak pekerja

Pola yang paling sering dipakai di produksi: sejumlah goroutine tetap mengambil tugas dari satu channel.

```go
package main

import (
	"fmt"
	"sync"
)

func kuadrat(n int, out chan<- int, wg *sync.WaitGroup) {
	defer wg.Done()
	out <- n * n
}

func main() {
	out := make(chan int)
	var wg sync.WaitGroup

	for i := 1; i <= 5; i++ {
		wg.Add(1)
		go kuadrat(i, out, &wg)
	}

	go func() {
		wg.Wait()
		close(out)
	}()

	total := 0
	for v := range out {
		total += v
	}
	fmt.Println("total:", total)
}
```

```text
total: 55
```

Baris demi baris, karena hampir setiap bagiannya punya alasan:

- `out chan<- int` — channel **hanya untuk mengirim**. Kompilator menolak kalau fungsi ini mencoba menerima; tipe yang lebih sempit mencegah kesalahan sejak kompilasi.
- `defer wg.Done()` — dijalankan apa pun yang terjadi di dalam goroutine, termasuk saat panic.
- `wg.Add(1)` **sebelum** `go` — kalau ditaruh di dalam goroutine, `wg.Wait()` bisa berjalan lebih dulu dan mengira semuanya sudah selesai.
- `go func() { wg.Wait(); close(out) }()` — satu goroutine khusus yang menutup channel setelah semua pengirim selesai.
- `for v := range out` — berhenti sendiri saat channel ditutup.

Hasilnya selalu 55. Urutan masuknya tidak dijamin, dan memang tidak perlu: yang dijumlahkan, bukan urutannya. Kalau urutan penting, kirim indeksnya bersama nilainya.

### Deadlock: kesalahan yang paling sering

```text
fatal error: all goroutines are asleep - deadlock!
```

Artinya: semua goroutine menunggu sesuatu yang tidak akan pernah datang. Tiga sebab yang mencakup hampir semua kasus:

| Sebab | Gejala | Perbaikan |
|---|---|---|
| Channel tidak pernah ditutup | `range` menggantung setelah data terakhir | `close` setelah semua pengirim selesai |
| `wg.Wait()` di goroutine utama, `wg.Add` di dalam goroutine | selesai terlalu cepat, atau menggantung | `Add` sebelum `go` |
| Mengirim ke channel tanpa penerima | berhenti tepat di baris kirim | pastikan ada penerima, atau pakai buffer |

Pesan panic-nya menyebut "all goroutines", jadi jangan mencari satu baris yang salah — cari pasangan kirim/terima yang tidak pernah bertemu.

### Kenapa ini penting untuk pekerjaan

Layanan web menghabiskan sebagian besar waktunya menunggu: database, API lain, berkas. Satu request yang menunggu 200 ms tidak memakai CPU sama sekali — ia hanya menahan goroutine. Karena goroutine murah, server Go melayani ribuan request bersamaan dengan beberapa utas sistem. Itu sebabnya `net/http` sudah konkuren sejak baris pertama, tanpa konfigurasi apa pun.

Untuk track ini, konsekuensinya praktis: setiap handler berjalan di goroutine sendiri, jadi **state bersama di level paket adalah bug yang menunggu waktu**. Data yang dibagi harus lewat channel, `sync.Mutex`, atau lebih baik lagi: tidak dibagi sama sekali.

## Lapis 2

### `select`: menunggu beberapa channel sekaligus

```go
select {
case v := <-data:
	fmt.Println("data:", v)
case <-waktuHabis.C:
	fmt.Println("berhenti: waktu habis")
}
```

`select` menunggu case mana pun yang siap lebih dulu; kalau beberapa siap bersamaan, salah satu dipilih **secara acak** — bukan yang pertama ditulis. Itu disengaja: menjamin keadilan, dan mencegah satu channel yang selalu siap membuat case lain kelaparan.

Pola yang paling berguna adalah penghentian:

```go
for {
	select {
	case <-ctx.Done():
		return ctx.Err()
	case t := <-antrean:
		proses(t)
	}
}
```

`ctx.Done()` adalah channel yang ditutup saat konteks dibatalkan. Bentuk ini membuat pekerjaan panjang bisa dihentikan tanpa menambahkan flag yang diperiksa di banyak tempat.

### `close` bukan "matikan"

Menutup channel berarti: **tidak akan ada nilai lagi**. Setelah ditutup:

- `<-ch` langsung mengembalikan nilai nol, tanpa menunggu.
- `v, ok := <-ch` memberi `ok == false`.
- Mengirim ke channel tertutup = `panic: send on closed channel`.

Karena itu aturannya sempit: **hanya pengirim yang menutup, dan hanya sekali**. Kalau beberapa goroutine mengirim, tutup di satu tempat setelah semuanya selesai — seperti pola `wg.Wait(); close(out)` di atas. Menutup channel bukan cara menghentikan goroutine penerima; untuk itu pakai pembatalan lewat `context`.

### Tabel pilihan alat

| Kebutuhan | Alat | Catatan |
|---|---|---|
| Kirim hasil dari banyak pekerja | `chan T` + `close` | pola paling umum |
| Menunggu sekumpulan goroutine selesai | `sync.WaitGroup` | tidak membawa nilai |
| Melindungi variabel bersama | `sync.Mutex` | tetap sah; channel bukan satu-satunya jalan |
| Membatalkan pekerjaan | `context.Context` | satu `Done()` untuk seluruh pohon goroutine |
| Ambil data dengan batas waktu | `select` + `time.After` | jangan `time.After` di dalam loop ketat — timer-nya menumpuk |

Aturan yang sering dikutip dari dokumentasi Go: *jangan berkomunikasi dengan membagi memori; bagilah memori dengan berkomunikasi.* Tapi itu bukan larangan memakai `Mutex`. Untuk penghitung sederhana atau peta yang dibaca banyak goroutine (`sync.RWMutex`), kunci lebih jelas dan lebih cepat daripada mengirim struct lewat channel.

### Biaya goroutine, dan kapan berhenti menambah

Goroutine murah, tapi tidak gratis. Tiga hal yang tetap perlu dijaga:

1. **Batas jumlah.** Seribu goroutine per request menjadi seribu kali lipat saat trafik naik. Worker pool dengan jumlah tetap adalah pola yang bisa dipertanggungjawabkan.
2. **Goroutine yang tidak pernah berhenti.** Setiap goroutine yang menunggu di channel tanpa pembatalan adalah kebocoran — memorinya tidak kembali. Beri setiap loop sebuah jalan keluar (`ctx.Done()`).
3. **`-race` saat menguji, bukan di produksi.** Detektornya memperlambat program berkali-kali lipat dan hanya melaporkan apa yang benar-benar terjadi pada eksekusi itu. Catatan praktis: `-race` butuh cgo dan kompilator C, jadi di Windows tanpa gcc ia menolak jalan (`-race requires cgo`). Itu keterbatasan alat, bukan kesalahan kode.

### Error di dalam goroutine

Nilai kembalian hilang begitu fungsi dijalankan dengan `go`. Pilihan yang tersedia:

```go
type hasil struct {
	nilai int
	err   error
}
```

Kirim `hasil` lewat channel, lalu putuskan di pemanggil. Ini lebih eksplisit daripada `panic` di dalam goroutine — panic di goroutine yang bukan milik `main` **mematikan seluruh program**, tanpa bisa ditangkap pemanggilnya, dan jejak errornya sering tidak menunjuk ke penyebabnya.

Untuk kasus banyak goroutine yang harus berhenti bersama-sama saat satu gagal, paket `golang.org/x/sync/errgroup` menyediakan `errgroup.WithContext` — di luar pustaka standar, tapi cukup kecil untuk dibaca seluruhnya.

### Error umum

| Pesan | Arti | Cara memperbaiki |
|---|---|---|
| `fatal error: all goroutines are asleep - deadlock!` | pasangan kirim/terima tidak pernah bertemu | tutup channel setelah semua pengirim selesai; periksa `wg.Add` sebelum `go` |
| `panic: send on closed channel` | ada yang mengirim setelah `close` | tutup hanya di satu tempat, setelah semua pengirim selesai |
| `panic: close of closed channel` | `close` dipanggil dua kali | pindahkan `close` ke satu goroutine penutup |
| `WARNING: DATA RACE` | dua goroutine menyentuh variabel yang sama tanpa sinkronisasi | kirim lewat channel, atau lindungi dengan `Mutex` |
| `index out of range` di dalam goroutine | goroutine menangkap variabel loop (Go < 1.22) | salin ke variabel lokal, atau naikkan versi Go |

### Rujukan resmi

- `go.dev/tour/concurrency` — tur interaktif, bisa dijalankan di browser.
- `go.dev/ref/mem` — model memori: apa yang dijamin terlihat oleh goroutine lain.
- `pkg.go.dev/sync` dan `pkg.go.dev/context` — dokumentasi paket yang dipakai di modul ini.

## Latihan

Lihat frontmatter `latihan[]`. Latihan 1 dijalankan di web (perhitungan penjadwalan); latihan 2 diikuti di laptop dengan 6 langkah baku dan menghasilkan program Go yang benar-benar berjalan.

## Kamu sudah bisa ini kalau…

- [ ] Bisa menjelaskan kenapa `ch <- 1` pada channel tanpa buffer menghentikan program, tanpa membuka dokumentasi.
- [ ] Bisa menulis worker pool dari nol: `wg.Add` sebelum `go`, `close` setelah `wg.Wait`.
- [ ] Bisa menyebut tiga penyebab `all goroutines are asleep - deadlock!`.
- [ ] Tahu kenapa `-race` dipakai saat menguji dan tidak di produksi.
- [ ] Latihan 1 lulus dan latihan 2 mencetak `total: 55`, lalu `total: 385` setelah batas loop diubah.
