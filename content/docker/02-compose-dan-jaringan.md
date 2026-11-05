---
track: docker
nomor: 2
judul: "Compose & jaringan: nama layanan, port yang di-publish, dan siapa boleh memanggil siapa"
slug: compose-dan-jaringan
estimasi_menit: 15
prasyarat:
  - fondasi/cli
  - docker/image-dan-layer
latihan:
  - id: docker-02-latihan-1
    jenis: web
    bahasa: python
    soal: "Simulasikan aturan koneksi Docker Compose. Diberi tiga layanan (port internal, port yang di-publish ke host, dan jaringan yang diikutinya) serta tujuh percobaan koneksi, cetak untuk tiap percobaan satu baris '<pengirim> -> <tujuan>:<port> = tersambung' atau '= gagal: <alasan>'. Aturannya: (1) host hanya bisa lewat port yang di-publish; (2) nama layanan hanya bisa dipakai container yang berbagi jaringan dengan layanan itu; (3) localhost di dalam container menunjuk container itu sendiri; (4) port harus sama dengan port yang didengarkan proses tujuan."
    kode_awal: |-
      SERVIS = {
          "web": {"port": 3000, "publish": 8080, "jaringan": {"depan"}},
          "api": {"port": 8000, "publish": None, "jaringan": {"depan", "belakang"}},
          "db": {"port": 5432, "publish": None, "jaringan": {"belakang"}},
      }

      COBA = [
          ("host", "localhost", 8080),
          ("host", "localhost", 8000),
          ("web", "api", 8000),
          ("web", "db", 5432),
          ("api", "db", 5432),
          ("web", "localhost", 8000),
          ("web", "api", 8080),
      ]

      # tulis cek(dari, ke, port) lalu cetak tiap baris COBA
    output_harapan: |
      host -> localhost:8080 = tersambung
      host -> localhost:8000 = gagal: tidak ada port yang di-publish di host
      web -> api:8000 = tersambung
      web -> db:5432 = gagal: tidak berbagi jaringan
      api -> db:5432 = tersambung
      web -> localhost:8000 = gagal: localhost adalah container itu sendiri
      web -> api:8080 = gagal: proses tidak mendengarkan port itu
    solusi: |-
      SERVIS = {
          "web": {"port": 3000, "publish": 8080, "jaringan": {"depan"}},
          "api": {"port": 8000, "publish": None, "jaringan": {"depan", "belakang"}},
          "db": {"port": 5432, "publish": None, "jaringan": {"belakang"}},
      }

      COBA = [
          ("host", "localhost", 8080),
          ("host", "localhost", 8000),
          ("web", "api", 8000),
          ("web", "db", 5432),
          ("api", "db", 5432),
          ("web", "localhost", 8000),
          ("web", "api", 8080),
      ]


      def cek(dari, ke, port):
          if dari == "host":
              if any(s["publish"] == port for s in SERVIS.values()):
                  return "tersambung"
              return "gagal: tidak ada port yang di-publish di host"

          if ke == "localhost":
              if SERVIS[dari]["port"] == port:
                  return "tersambung"
              return "gagal: localhost adalah container itu sendiri"

          if not (SERVIS[dari]["jaringan"] & SERVIS[ke]["jaringan"]):
              return "gagal: tidak berbagi jaringan"

          if SERVIS[ke]["port"] != port:
              return "gagal: proses tidak mendengarkan port itu"

          return "tersambung"


      for dari, ke, port in COBA:
          print(f"{dari} -> {ke}:{port} = {cek(dari, ke, port)}")
    catatan_solusi: "Tujuh percobaan itu memuat empat kegagalan yang berbeda, dan dua di antaranya adalah kesalahan paling sering di Compose. Baris kedua: 8000 adalah port internal api, bukan port yang di-publish, jadi dari host tidak ada pintunya. Baris keempat: web di jaringan depan, db di belakang, jadi nama 'db' bahkan tidak bisa di-resolve. Baris keenam: dari dalam web, localhost adalah web itu sendiri — container sendiri, bukan db. Baris terakhir: api memang bisa dipanggil sebagai api:8000, tapi 8080 adalah port host untuk web, bukan port yang didengarkan api."
  - id: docker-02-latihan-2
    jenis: laptop
    soal: "Jalankan dua layanan dengan Compose, lalu buktikan bahwa di dalam container web nama layanan 'cache' bisa dipanggil sementara 'localhost' menunjuk container itu sendiri."
    kebutuhan:
      - "Docker terpasang dan daemon berjalan (docker version menampilkan bagian Server)"
      - "Terminal (git-bash / PowerShell)"
    langkah:
      - perintah: "mkdir latihan-compose && cd latihan-compose && printf 'services:\\n  web:\\n    image: python:3.12-slim\\n    command: python -m http.server 8000\\n    ports:\\n      - \"8080:8000\"\\n  cache:\\n    image: redis:7-alpine\\n' > docker-compose.yml"
        penjelasan: "Membuat satu berkas berisi dua layanan: web (server HTTP Python) dan cache (Redis). Tidak ada argumen docker run sama sekali — semuanya dideklarasikan di sini."
      - perintah: "docker compose up -d"
        penjelasan: "Menarik image yang belum ada, membuat jaringan khusus proyek, lalu menjalankan kedua layanan di latar belakang. Tanpa -d, terminal akan terkunci menampilkan log."
      - perintah: "docker compose ps"
        penjelasan: "Menampilkan layanan proyek ini saja, bukan semua container di mesin. Keduanya harus berstatus running, dan hanya web yang punya pemetaan port 8080->8000."
      - perintah: "docker compose exec web python -c \"import socket; print(socket.gethostbyname('cache'))\""
        penjelasan: "Menanyakan alamat IP untuk nama 'cache' dari dalam container web. Berhasil berarti DNS internal Compose bekerja: nama layanan menjadi nama host."
      - perintah: "docker compose exec web python -c \"import socket; socket.create_connection(('localhost', 6379), 2)\""
        penjelasan: "Mencoba menyambung ke Redis lewat localhost. Ini gagal — dan kegagalannya justru bukti: di dalam container web, localhost adalah web, bukan cache."
      - perintah: "docker compose down"
        penjelasan: "Menghentikan dan menghapus kedua container beserta jaringannya. Tanpa -v, volume bernama tetap disimpan."
    hasil: |
      [+] Running 3/3
       ✔ Network latihan-compose_default  Created
       ✔ Container latihan-compose-cache-1  Started
       ✔ Container latihan-compose-web-1    Started
      NAME                    IMAGE               SERVICE   STATUS    PORTS
      latihan-compose-cache-1 redis:7-alpine      cache     running   6379/tcp
      latihan-compose-web-1   python:3.12-slim    web       running   0.0.0.0:8080->8000/tcp
      <ip-container-cache>
      Traceback (most recent call last):
        File "<string>", line 1, in <module>
      ConnectionRefusedError: [Errno 111] Connection refused
    cek_berhasil:
      - "docker compose ps menampilkan dua layanan running, dan hanya web yang punya kolom PORTS terisi"
      - "gethostbyname('cache') mencetak sebuah alamat IP, bukan error"
      - "Percobaan ke localhost:6379 ditolak dengan ConnectionRefusedError"
    kalau_gagal:
      - error: "Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?"
        arti: "Daemon Docker tidak berjalan di mesin ini."
        perbaikan:
          - "Windows/macOS: buka Docker Desktop, tunggu sampai status Running"
          - "Linux: sudo systemctl start docker"
      - error: "no configuration file provided: not found"
        arti: "Compose dijalankan dari folder yang tidak memuat berkas compose. Ia mencari compose.yaml, compose.yml, docker-compose.yaml, atau docker-compose.yml di folder kerja."
        perbaikan:
          - "Pastikan sudah cd latihan-compose, lalu ls untuk melihat berkasnya"
          - "Periksa nama berkas tidak berakhiran .txt atau .yml.bak"
          - "Atau tunjuk langsung: docker compose -f docker-compose.yml up -d"
      - error: "service \"web\" is not running"
        arti: "Container web tidak hidup, jadi exec tidak punya apa pun untuk dimasuki. Biasanya proses di dalamnya langsung mati."
        perbaikan:
          - "docker compose ps -a untuk melihat status keluar dan kode keluarnya"
          - "docker compose logs web untuk membaca kenapa prosesnya berhenti"
          - "Perbaiki penyebabnya, lalu docker compose up -d lagi"
      - error: "Error response from daemon: Ports are not available: exposing port TCP 0.0.0.0:8080 -> bind: address already in use"
        arti: "Port 8080 di host sudah dipakai proses lain."
        perbaikan:
          - "Cari pemakainya: netstat -ano | findstr :8080 (Windows) atau ss -ltnp | grep 8080 (Linux)"
          - "Atau ganti sisi kiri pemetaan: - \"8081:8000\""
      - error: "socket.gaierror: [Errno -2] Name or service not known"
        arti: "Nama layanan tidak bisa di-resolve: salah ketik, layanan tidak ada di berkas compose, atau keduanya tidak berbagi jaringan."
        perbaikan:
          - "Cocokkan nama di perintah dengan kunci di bawah services: persis, huruf kecil"
          - "Pastikan kedua layanan ikut jaringan yang sama (default: semuanya satu jaringan)"
    buktikan:
      perubahan: "Tambahkan blok networks: — web hanya ikut jaringan depan, cache hanya belakang — lalu jalankan docker compose up -d --force-recreate dan ulangi langkah 4."
      hasil_diharapkan: "gethostbyname('cache') sekarang gagal dengan socket.gaierror. Nama layanan hanya di-resolve di antara container yang berbagi jaringan, jadi memisahkan jaringan benar-benar memutus jalur — bukan sekadar dokumentasi."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Mengapa container web bisa memanggil 'cache:6379' tanpa tahu alamat IP cache?"
    opsi:
      a: "Compose menuliskan IP-nya ke /etc/hosts setiap kali container start"
      b: "DNS internal Docker memetakan nama layanan ke container yang sedang berjalan di jaringan yang sama"
      c: "Kedua container memakai alamat IP yang sama"
      d: "Redis menyiarkan alamatnya ke semua container"
    jawaban: b
    penjelasan: "Docker menjalankan resolver internal di 127.0.0.11 yang menjawab nama layanan dengan IP container yang aktif. Karena jawabannya mengikuti container yang hidup, nama itu tetap benar setelah container dibuat ulang dan IP-nya berubah — itulah kenapa alamat IP tidak boleh ditulis di konfigurasi aplikasi."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Layanan db punya ports: - \"5432:5432\" dan api memanggil db:5432. Apa yang berubah kalau pemetaan port itu dihapus?"
    opsi:
      a: "api kehilangan koneksi ke db"
      b: "api tetap tersambung; hanya host yang kehilangan akses ke 5432"
      c: "db tidak mau start"
      d: "api harus memakai localhost:5432"
    jawaban: b
    penjelasan: "ports hanya membuka pintu dari host ke container. Di antara container di jaringan yang sama, port yang didengarkan proses sudah bisa dihubungi tanpa dipetakan apa pun. Karena itu di produksi biasanya hanya reverse proxy yang punya ports, sementara database tidak di-publish sama sekali — makin sedikit pintu ke host, makin kecil permukaan serangan."
    tingkat: menengah
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa db:5432 berhasil dari api tapi gagal dari web, padahal keduanya ada di satu berkas compose?"
    opsi:
      a: "Karena web belum di-build"
      b: "Karena web dan db tidak berada di jaringan yang sama, sedangkan api ada di keduanya"
      c: "Karena port 5432 hanya boleh dipakai satu container"
      d: "Karena urutan start di compose salah"
    jawaban: b
    penjelasan: "Nama layanan hanya bisa di-resolve di antara container yang berbagi minimal satu jaringan. api sengaja di dua jaringan (depan dan belakang) supaya bisa menjembatani web ke db, sementara web hanya di depan — pola ini yang membuat database tidak bisa dipanggil langsung dari lapisan yang menghadap pengguna."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Perintah untuk melihat berkas compose setelah semua variabel dan default diselesaikan, tanpa menjalankan apa pun (dua kata setelah 'docker compose')"
    jawaban: "config"
    penjelasan: "docker compose config mencetak hasil akhir yang benar-benar dipakai: nilai ${VAR} sudah terisi, path volume sudah absolut, jaringan dan dependensi sudah tergambar. Ini cara termurah memastikan variabel dari .env benar sebelum menyalahkan aplikasi."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "api punya depends_on: db. Container db butuh beberapa detik sebelum siap menerima koneksi. Apa yang terjadi?"
    opsi:
      a: "api menunggu sampai db benar-benar siap menerima koneksi"
      b: "api baru dijalankan setelah container db dibuat, tapi bisa gagal karena db belum siap"
      c: "Compose menjalankan ulang api sampai berhasil"
      d: "depends_on tidak berpengaruh apa pun, termasuk urutan start"
    jawaban: b
    penjelasan: "depends_on hanya mengatur urutan start dan stop, bukan kesiapan. Container yang sudah running belum tentu siap menerima koneksi. Untuk menunggu kesiapan, db diberi healthcheck dan api memakai depends_on dengan condition: service_healthy — atau aplikasinya sendiri yang mencoba ulang saat menyambung, yang lebih tahan banting karena tetap benar saat db restart di tengah jalan."
    tingkat: lanjutan
---

## Lapis 1

### Satu berkas untuk banyak container

Modul sebelumnya membangun satu image. Aplikasi nyata terdiri dari beberapa bagian yang harus hidup bersama: aplikasi web, API, database, cache. Menjalankan empat `docker run` panjang dengan urutan yang benar adalah pekerjaan yang tidak bisa diulang orang lain tanpa salah.

Compose menggantinya dengan satu berkas deklaratif:

```yaml
services:
  web:
    image: python:3.12-slim
    command: python -m http.server 8000
    ports:
      - "8080:8000"
  cache:
    image: redis:7-alpine
```

```bash
docker compose up -d      # jalankan semua
docker compose ps         # status layanan proyek ini
docker compose logs -f web
docker compose exec web sh
docker compose down
```

Lima perintah itu menutup hampir seluruh pekerjaan harian. Berkas di atas tidak menyebut jaringan sama sekali, dan justru di situ letak kemudahannya: Compose membuat satu jaringan untuk proyek ini dan memasukkan semua layanan ke dalamnya.

### Nama layanan adalah nama host

Ini bagian yang paling mengubah cara menulis konfigurasi aplikasi. Di dalam Compose, **kunci di bawah `services:` otomatis bisa dipakai sebagai nama host** oleh layanan lain di proyek yang sama.

Jadi di dalam container `web`, ini bekerja:

```python
socket.gethostbyname("cache")   # sebuah alamat IP
socket.create_connection(("cache", 6379), 2)
```

Padahal alamat IP container berubah setiap kali container dibuat ulang. Yang dipakai bukan IP-nya, melainkan nama: setiap kali aplikasi bertanya, Docker menjawab dengan alamat container `cache` yang sedang hidup.

Konsekuensi praktisnya besar. String koneksi database di Compose tidak berisi IP dan tidak berisi `localhost`:

```
postgresql://app:<sandi>@db:5432/app
                        ^^ nama layanan, bukan localhost
```

### `localhost` di dalam container adalah container itu sendiri

Kesalahan nomor satu saat memindahkan aplikasi ke Docker: kode yang tadinya jalan di laptop memakai `localhost:5432` untuk database, lalu di dalam container `web` ia mencari database **di dalam container web** — dan tidak menemukan apa pun.

```
host      localhost:5432  →  hanya kalau 5432 di-publish
container localhost:5432  →  container itu sendiri
container db:5432         →  container db, lewat jaringan internal
```

Aturan yang bisa dihafal: `localhost` berarti "mesin tempat kode ini berjalan". Di dalam container, mesin itu adalah container.

### `ports` membuka pintu, bukan membuat koneksi

```yaml
ports:
  - "8080:8000"      # host:container
```

Sisi kiri adalah port di **host**; sisi kanan adalah port yang didengarkan proses **di dalam** container. Hanya yang dipublish yang bisa dihubungi dari luar Docker.

Di antara container, pemetaan ini tidak dibutuhkan sama sekali. Selama dua container berbagi jaringan, `nama-layanan:port-internal` langsung bekerja. Ini alasan pola produksi yang umum: hanya reverse proxy yang punya `ports`, sementara database dan cache tidak dibuka ke host sama sekali.

| Ditulis | Arti |
|---|---|
| `ports: ["8080:8000"]` | Host 8080 → container 8000 |
| `ports: ["8000"]` | Port acak di host → container 8000 |
| `ports: ["127.0.0.1:8080:8000"]` | Hanya bisa diakses dari mesin itu sendiri |
| `expose: ["8000"]` | Dokumentasi saja; tidak membuka apa pun |

Baris terakhir sering disalahpahami: `expose` tidak memberi izin dan tidak mengambil izin. Ia hanya catatan bahwa port itu dipakai. Akses antar-container ditentukan oleh jaringan, bukan oleh `expose`.

### Cara berpikir yang membuat Compose masuk akal

Tiga pertanyaan ini menyelesaikan hampir semua kebingungan:

1. **Siapa yang memanggil?** Host, atau container lain.
2. **Lewat nama apa?** Dari host: `localhost:<port publish>`. Antar-container: `<nama-layanan>:<port internal>`.
3. **Apakah mereka satu jaringan?** Kalau tidak, nama layanan tidak bisa di-resolve — apa pun isi konfigurasi port.

Latihan 1 di modul ini adalah ketiga pertanyaan itu dalam bentuk kode. Setelah bisa menjawabnya tanpa ragu, pesan error koneksi berhenti terasa seperti teka-teki.

## Lapis 2

### `depends_on` mengatur urutan, bukan kesiapan

```yaml
services:
  api:
    depends_on:
      - db          # api start setelah container db dibuat
```

`depends_on` sederhana hanya menjamin **container db sudah dibuat dan dijalankan** sebelum api. Ia tidak tahu apakah Postgres di dalamnya sudah menerima koneksi. Selisih beberapa detik itu cukup untuk membuat api crash saat start.

Dua perbaikan, dipakai sesuai situasi:

```yaml
services:
  db:
    image: postgres:16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      timeout: 3s
      retries: 5
  api:
    depends_on:
      db:
        condition: service_healthy
```

Cara kedua, yang lebih tahan lama: aplikasi mencoba ulang saat menyambung. Alasannya sederhana — healthcheck hanya menjaga saat start, sedangkan database bisa restart kapan saja saat aplikasi sudah berjalan. Aplikasi yang tidak punya logika coba-ulang akan tetap mati di kejadian itu.

### Jaringan: siapa boleh memanggil siapa

Jaringan default sudah cukup untuk proyek kecil. Begitu ada database, memisahkannya berbuah langsung: lapisan yang menghadap pengguna tidak bisa menyentuh database secara langsung, hanya lewat api.

```yaml
services:
  web:
    build: .
    networks: [depan]
  api:
    build: ./api
    networks: [depan, belakang]
  db:
    image: postgres:16
    networks: [belakang]

networks:
  depan:
  belakang:
```

Hasilnya: `web` bisa memanggil `api`, `api` bisa memanggil `db`, dan `web` **tidak** bisa memanggil `db` — resolve namanya pun gagal. Isolasi ini ditegakkan oleh jaringan, bukan oleh niat baik di kode.

Hal yang perlu diingat: dua layanan bisa berbagi jaringan tanpa saling memakai nama. Jaringan menentukan kemungkinan, bukan pemakaian.

### Nilai yang tidak boleh ditulis di berkas

Berkas compose biasanya ikut di-commit. Kata sandi database tidak boleh ikut.

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD:?DB_PASSWORD belum diisi}
```

```bash
# .env — masuk .gitignore
DB_PASSWORD=rahasia-lokal
```

Compose membaca `.env` di folder yang sama dan mengganti `${DB_PASSWORD}`. Bentuk `:?` membuat Compose **berhenti dengan pesan jelas** kalau variabelnya kosong, bukan diam-diam memakai string kosong sebagai kata sandi. Untuk produksi, rahasia diberikan lewat environment dari platform, atau lewat Docker secret — bukan berkas yang di-commit.

`docker compose config` mencetak hasil akhir setelah semua substitusi. Ini langkah yang paling sering dilewati dan paling cepat menemukan salah ketik nama variabel.

### Perintah yang sering dipakai

```bash
docker compose up -d --build        # bangun ulang image lalu jalankan
docker compose up -d web            # hanya web dan dependensinya
docker compose ps -a                # termasuk yang berhenti, dengan kode keluar
docker compose logs -f --tail=100 api
docker compose exec db psql -U app  # masuk ke layanan yang sedang jalan
docker compose run --rm web pytest  # container sekali pakai, bukan layanan
docker compose restart api
docker compose down                 # stop + hapus container & jaringan
docker compose down -v              # TAMBAH: hapus volume juga — data hilang
```

`exec` memakai container yang sudah berjalan; `run` membuat container baru dari definisi layanan yang sama. Untuk tugas sekali jalan (migrasi, test), `run --rm` yang benar — ia tidak mengganggu layanan yang sedang melayani.

`down -v` adalah perintah yang perlu dibaca dua kali sebelum Enter: ia menghapus volume, dan volume adalah tempat data yang seharusnya bertahan.

### Compose V2 tidak butuh `version:`

Berkas lama diawali `version: "3.8"`. Di Compose V2 kunci itu sudah tidak dipakai dan justru memunculkan peringatan. Kalau menemukan tutorial yang memakainya, sisanya biasanya juga sudah usang — versi `docker compose` (dengan spasi, sebagai plugin) bukan `docker-compose` (dengan tanda hubung, Python lama).

### Error umum

| Pesan | Arti | Cara memperbaiki |
|---|---|---|
| `Cannot connect to the Docker daemon` | Daemon mati | Jalankan Docker Desktop / `systemctl start docker` |
| `no configuration file provided` | Dijalankan di folder yang salah | `cd` ke folder berkas, atau `-f <berkas>` |
| `service "x" is not running` | Container mati, `exec` tak punya tujuan | `docker compose ps -a`, lalu `logs x` |
| `Ports are not available: ... address already in use` | Port host dipakai proses lain | Ganti sisi kiri pemetaan, atau hentikan pemakainya |
| `socket.gaierror: Name or service not known` | Nama layanan salah / beda jaringan | Cocokkan nama dengan kunci `services:`, periksa `networks:` |
| `Connection refused` ke `localhost:<port>` | Aplikasi memakai localhost, bukan nama layanan | Ganti `localhost` dengan nama layanan |
| `pull access denied` / `manifest unknown` | Nama image atau tag salah | Periksa ejaan image dan tag-nya |
| `invalid interpolation format` | `${...}` ditulis salah, sering karena `$` literal | Escape `$$`, atau perbaiki bentuk variabelnya |

### Daftar periksa

1. Nama layanan dipakai sebagai nama host di semua string koneksi — tidak ada `localhost` antar-layanan.
2. Hanya layanan yang memang perlu diakses dari host yang punya `ports`.
3. Kata sandi datang dari `.env` (yang di-.gitignore) atau environment, bukan ditulis di berkas compose.
4. `depends_on` yang penting memakai `healthcheck` + `condition: service_healthy`, atau aplikasi punya logika coba-ulang.
5. Database berada di jaringan terpisah dari lapisan yang menghadap pengguna.
6. `docker compose config` pernah dijalankan dan hasilnya masuk akal.
7. Tahu beda `down` dan `down -v`, dan tidak menjalankan yang kedua tanpa berpikir.
8. `docker compose ps` bersih setelah selesai bekerja — tidak ada container tertinggal.

### Rujukan resmi

`TODO: tautan dokumentasi resmi Docker Compose untuk networking, depends_on, dan variabel lingkungan`

## Latihan

Latihan 1 mengubah aturan jaringan menjadi fungsi yang bisa dijalankan: empat jenis kegagalan koneksi yang berbeda, dan kamu harus menebak mana yang muncul sebelum programnya dijalankan. Setelah itu, pesan `Connection refused` dan `Name or service not known` tidak lagi terasa sama.

Latihan 2 membuktikannya dengan Docker sungguhan: dari dalam container `web`, `cache` bisa dipanggil sementara `localhost` tidak. Itu satu percobaan yang menjelaskan kenapa semua dokumentasi Docker menulis nama layanan, bukan alamat IP.

## Kamu sudah bisa ini kalau…

- [ ] Bisa menjelaskan kenapa `localhost` di dalam container bukan host.
- [ ] Bisa menebak apakah sebuah koneksi berhasil hanya dari daftar layanan, jaringan, dan `ports`-nya.
- [ ] Tahu apa yang dilakukan `ports` dan apa yang **tidak** dilakukannya.
- [ ] Tahu beda `depends_on` biasa dan `depends_on` dengan `condition: service_healthy`.
- [ ] Bisa menjelaskan kenapa database sebaiknya tidak di-publish ke host.
- [ ] Latihan 1 lulus dan latihan 2 berhasil dijalankan.
