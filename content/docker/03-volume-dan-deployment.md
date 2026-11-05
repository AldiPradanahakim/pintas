---
track: docker
nomor: 3
judul: "Volume & deployment: ke mana data pergi saat container dihapus, dan bagaimana image sampai ke server"
slug: volume-dan-deployment
estimasi_menit: 15
prasyarat:
  - fondasi/cli
  - docker/compose-dan-jaringan
latihan:
  - id: docker-03-latihan-1
    jenis: web
    bahasa: python
    soal: "Simulasikan umur data pada tiga jenis penyimpanan. Aturannya: (1) berkas yang ditulis tanpa mount masuk ke lapisan tulis container dan hilang saat container dihapus; (2) volume bernama bertahan sampai volumenya dihapus lewat down-v; (3) bind mount adalah folder di host, tidak pernah dihapus Docker; (4) up berarti container dihapus lalu dibuat ulang. Untuk tiap aksi cetak satu baris '<aksi> <servis> -> <hasil>', dengan hasil salah satu dari: sementara (tulis ke lapisan tulis), permanen (tulis ke volume atau bind), hilang, tetap ada, kosong."
    kode_awal: |-
      SERVIS = {
          # nama layanan: jenis penyimpanan
          "web": "lapisan-tulis",
          "db": "volume",
          "api": "bind",
      }
      VOLUME = "pgdata"

      AKSI = [
          ("tulis", "web"),
          ("tulis", "db"),
          ("tulis", "api"),
          ("rm", "web"),
          ("rm", "db"),
          ("down-v", "db"),
          ("rm", "api"),
          ("up", "web"),
      ]

      # lapisan-tulis : ikut mati bersama container
      # volume        : bertahan sampai dihapus (down -v / volume rm)
      # bind          : folder di host, tidak dihapus docker
      ada_berkas = {"pgdata": False, "./data": False}

      # tulis simpan(), lalu loop AKSI dan cetak tiap baris
    output_harapan: |-
      tulis web -> sementara
      tulis db -> permanen
      tulis api -> permanen
      rm web -> hilang
      rm db -> tetap ada
      down-v db -> hilang
      rm api -> tetap ada
      up web -> kosong
    solusi: |-
      SERVIS = {
          "web": "lapisan-tulis",
          "db": "volume",
          "api": "bind",
      }
      VOLUME = "pgdata"

      AKSI = [
          ("tulis", "web"),
          ("tulis", "db"),
          ("tulis", "api"),
          ("rm", "web"),
          ("rm", "db"),
          ("down-v", "db"),
          ("rm", "api"),
          ("up", "web"),
      ]

      ada_berkas = {"pgdata": False, "./data": False}


      def simpan(servis):
          if SERVIS[servis] == "volume":
              return VOLUME
          if SERVIS[servis] == "bind":
              return "./data"
          return None


      for aksi, servis in AKSI:
          simpanan = simpan(servis)
          if aksi == "tulis":
              if simpanan:
                  ada_berkas[simpanan] = True
              hasil = "permanen" if simpanan else "sementara"
          elif aksi == "rm":
              hasil = "tetap ada" if simpanan else "hilang"
          elif aksi == "down-v":
              if SERVIS[servis] == "volume":
                  ada_berkas[simpanan] = False
                  hasil = "hilang"
              else:
                  hasil = "tetap ada"
          else:  # up: container dihapus lalu dibuat ulang
              hasil = "kosong" if SERVIS[servis] == "lapisan-tulis" else "tetap ada"
          print(f"{aksi} {servis} -> {hasil}")
    catatan_solusi: "Perhatikan pasangan baris 1 dan 4: menulis ke lapisan tulis terlihat berhasil ('sementara'), dan datanya memang ada selama container itu hidup — tapi rm menghapus container beserta lapisan itu. Baris 2 dan 5 menunjukkan bedanya volume: rm tidak menyentuhnya, hanya down-v (atau docker volume rm) yang menghapusnya. Baris 3 dan 7 menunjukkan bind mount lebih kuat lagi: ./data adalah folder di host, jadi Docker tidak pernah punya alasan untuk menghapusnya. Baris terakhir adalah jebakan yang paling sering terjadi di produksi: container dibuat ulang, dan aplikasi mencari datanya di folder yang sejak awal kosong."
  - id: docker-03-latihan-2
    jenis: laptop
    soal: "Buktikan tiga nasib data dalam satu sesi: berkas di volume bernama bertahan setelah container dihapus, berkas di lapisan tulis hilang, dan berkas di bind mount muncul di folder laptopmu."
    kebutuhan:
      - "Docker terpasang dan daemon berjalan (docker version menampilkan bagian Server)"
      - "Terminal (git-bash / PowerShell)"
    langkah:
      - perintah: "mkdir latihan-volume && cd latihan-volume"
        penjelasan: "Folder kerja baru. Bind mount nanti memakai folder ini sebagai sisi host, jadi lokasinya penting."
      - perintah: "docker run --rm -v data-web:/data alpine sh -c 'echo halo > /data/catatan.txt && cat /data/catatan.txt'"
        penjelasan: "Menjalankan container sementara yang menulis ke /data, yang dipetakan ke volume bernama data-web. --rm menghapus container begitu selesai; volumenya tidak ikut terhapus."
      - perintah: "docker run --rm -v data-web:/data alpine cat /data/catatan.txt"
        penjelasan: "Container BARU, image sama, volume sama. Kalau 'halo' tercetak, berarti berkasnya tidak pernah berada di container — ia berada di volume."
      - perintah: "docker run --rm alpine sh -c 'echo halo > catatan.txt'"
        penjelasan: "Tanpa -v. Berkas ditulis ke lapisan tulis container, yang hanya hidup selama container itu hidup."
      - perintah: "docker run --rm alpine cat catatan.txt"
        penjelasan: "Container lain membaca berkas yang sama. Ini gagal — bukti bahwa lapisan tulis tidak diwariskan ke container berikutnya."
      - perintah: "docker run --rm -v \"${PWD}:/kerja\" alpine sh -c 'echo dari-container > /kerja/hasil.txt' && cat hasil.txt"
        penjelasan: "Bind mount: /kerja di dalam container adalah folder kerja di laptop. Berkas yang ditulis container langsung muncul sebagai berkas biasa di host."
    hasil: |-
      halo
      halo
      cat: can't open 'catatan.txt': No such file or directory
      dari-container
    cek_berhasil:
      - "Langkah 3 mencetak halo — volume bertahan melewati penghapusan container"
      - "Langkah 5 gagal dengan 'No such file or directory' — lapisan tulis hilang bersama container"
      - "hasil.txt ada di folder latihan-volume dan isinya 'dari-container'"
    kalau_gagal:
      - error: "cat: can't open 'catatan.txt': No such file or directory"
        arti: "INI HASIL YANG DIHARAPKAN di langkah 5. Kalau error ini muncul di langkah 3, berarti -v data-web:/data tidak terpasang."
        perbaikan:
          - "Periksa penulisan -v: nama volume di kiri, path absolut di kanan, dipisah titik dua"
          - "docker volume ls harus memuat data-web"
          - "Jangan pakai path relatif seperti -v data-web:data tanpa garis miring depan"
      - error: "docker: Error response from daemon: Mounts denied: The path /Users/... is not shared from the host"
        arti: "Docker Desktop tidak diberi izin membagikan folder host itu (khas macOS/Windows dengan folder di luar home)."
        perbaikan:
          - "Docker Desktop → Settings → Resources → File sharing, tambahkan folder proyek"
          - "Atau pindahkan folder latihan ke dalam direktori home"
      - error: "docker: invalid reference format"
        arti: "Kutip ganda pada ${PWD} hilang atau path Windows terbaca sebagai nama image."
        perbaikan:
          - "Bungkus variabelnya: -v \"${PWD}:/kerja\" (bash) atau -v \"${PWD}:/kerja\" (PowerShell)"
          - "Kalau masih gagal, tulis path absolut: -v C:/latihan/latihan-volume:/kerja"
      - error: "Error response from daemon: remove data-web: volume is in use"
        arti: "Masih ada container (hidup atau berhenti) yang memakai volume itu."
        perbaikan:
          - "docker ps -a untuk melihat container yang memakainya"
          - "Hentikan dan hapus container itu, baru docker volume rm data-web"
      - error: "Permission denied saat menulis ke folder bind mount (Linux)"
        arti: "Proses di container berjalan sebagai root, berkas di host jadi milik root."
        perbaikan:
          - "Jalankan container dengan --user $(id -u):$(id -g)"
          - "Atau perbaiki kepemilikan setelahnya: sudo chown -R $USER hasil.txt"
    buktikan:
      perubahan: "Hapus volumenya dengan 'docker volume rm data-web', lalu ulangi langkah 3 persis seperti tadi."
      hasil_diharapkan: "Perintah itu gagal dengan 'cat: No such file or directory' — Docker membuat volume bernama yang belum ada secara otomatis, dan volume baru itu kosong. Setelah itu 'docker volume ls' menunjukkan data-web kembali ada, tapi tanpa isi. Inilah kenapa volume yang salah nama tidak memunculkan error, hanya data yang hilang."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa berkas yang ditulis aplikasi ke /app/unggahan hilang setelah container dibuat ulang, padahal tidak ada yang menghapusnya?"
    opsi:
      a: "Karena image tidak memuat folder itu"
      b: "Karena semua tulisan ke filesystem container masuk ke lapisan tulis yang dimiliki container tersebut, dan lapisan itu dibuang bersama container"
      c: "Karena Docker memakai filesystem hanya-baca"
      d: "Karena berkas di container selalu dihapus setiap 24 jam"
    jawaban: b
    penjelasan: "Image bersifat hanya-baca; setiap container menambahkan satu lapisan tulis di atasnya. Lapisan itu hidup selama container hidup. Jadi container boleh dibuat ulang kapan saja — tapi apa pun yang ditulis ke dalamnya ikut hilang. Data yang harus bertahan diberi volume, dan itu keputusan desain, bukan efek samping."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Apa beda utama volume bernama dan bind mount?"
    opsi:
      a: "Volume lebih cepat, bind lebih lambat"
      b: "Volume dikelola Docker di lokasi miliknya; bind mount menunjuk folder yang kamu tentukan sendiri di host"
      c: "Volume hanya untuk Linux, bind mount hanya untuk Windows"
      d: "Bind mount tidak bisa dipakai di Compose"
    jawaban: b
    penjelasan: "Volume dibuat dan ditempatkan Docker (di Linux: /var/lib/docker/volumes), jadi ia portabel, bisa di-backup dengan perintah Docker, dan tidak bergantung pada struktur folder host. Bind mount menunjuk path yang kamu tentukan, berguna saat pengembangan karena kode di host langsung terlihat di container — tapi ia bergantung pada path, izin, dan OS host. Aturan praktis: data aplikasi di volume, kode saat mengembangkan di bind mount."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Perintah untuk menghapus semua volume yang tidak dipakai container mana pun (dua kata setelah 'docker volume')"
    jawaban: "prune"
    penjelasan: "docker volume prune menghapus volume yang tidak terpasang ke container mana pun. Ia berguna untuk membersihkan sisa percobaan, dan berbahaya justru karena itu: volume yang tertinggal karena container sedang berhenti bisa ikut terhapus, dan isinya data. Docker akan meminta konfirmasi; baca daftarnya sebelum mengetik y."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Apa yang dilakukan image multi-stage, dan kenapa ia membuat image lebih kecil?"
    opsi:
      a: "Mengompres image dengan gzip saat build"
      b: "Memakai beberapa FROM, dan hanya hasil dari stage terakhir yang dikirim — kompilator dan dependensi build tidak ikut"
      c: "Menjalankan beberapa container dari satu image"
      d: "Menghapus berkas besar secara otomatis di akhir build"
    jawaban: b
    penjelasan: "Setiap FROM memulai stage baru. Yang masuk image akhir hanya stage terakhir beserta apa pun yang sengaja kamu salin dengannya (COPY --from=build). Kompilator, cache paket, dan source code tinggal di stage sebelumnya dan dibuang. Efeknya bukan hanya ukuran: image yang lebih kecil punya lebih sedikit program, jadi lebih sedikit celah keamanan yang bisa dieksploitasi."
    tingkat: menengah
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa tag :latest berbahaya untuk deployment?"
    opsi:
      a: "Karena :latest selalu image terbesar"
      b: "Karena nama itu tidak menunjuk versi tertentu — server bisa menarik image berbeda dari yang kamu uji, dan rollback jadi tidak jelas"
      c: "Karena registry menolak push ke tag :latest"
      d: "Karena :latest tidak bisa dipakai di Compose"
    jawaban: b
    penjelasan: "Tag adalah penunjuk yang bisa dipindahkan; yang benar-benar tetap adalah digest (@sha256:...). Kalau server menjalankan :latest, 'image apa yang sedang jalan?' tidak punya jawaban pasti, dan rollback berarti menebak. Praktiknya: tag versi atau hash commit (mis. app:2026-11-05-a1b2c3), dan pakai digest kalau butuh jaminan isi yang sama persis."
    tingkat: lanjutan
---

## Lapis 1

### Container memang dirancang untuk dibuang

Modul pertama membangun image; modul kedua menyusun beberapa container. Keduanya belum menjawab satu hal yang akan langsung terasa begitu aplikasi dipakai orang: **di mana datanya tinggal?**

Image bersifat hanya-baca. Saat container dijalankan, Docker menambahkan satu **lapisan tulis** di atasnya. Aplikasi boleh menulis ke mana saja — dan semua tulisan itu masuk ke lapisan tersebut, yang dimiliki container itu saja.

```
image (hanya-baca)
  └── lapisan tulis (milik container ini)
        └── hilang saat container dihapus
```

Ini bukan kekurangan, melainkan inti dari idenya. Container bisa dimatikan, dibuat ulang, dan dipindah ke mesin lain kapan saja justru karena tidak menyimpan apa pun yang penting. Yang penting disimpan di luar.

### Tiga tempat data bisa tinggal

| Tempat | Ditulis dengan | Bertahan saat container dihapus? | Cocok untuk |
|---|---|---|---|
| Lapisan tulis | tanpa mount | tidak | berkas sementara, cache |
| Volume bernama | `-v namavolume:/path` | ya, sampai volumenya dihapus | database, unggahan pengguna |
| Bind mount | `-v /path/host:/path` | ya, folder host tidak disentuh Docker | kode saat mengembangkan, berkas konfigurasi |

Perbedaan volume dan bind mount bukan soal kecepatan, melainkan **siapa yang memiliki lokasinya**. Volume dibuat dan ditempatkan Docker; bind mount menunjuk folder yang kamu tentukan sendiri.

### Memasang volume

```bash
docker volume create pgdata
docker run -d --name db -v pgdata:/var/lib/postgresql/data postgres:16
```

```bash
docker volume ls
docker volume inspect pgdata
```

Bentuk `-v nama:/path` di dalam container. Kalau `nama` belum ada, Docker membuatnya otomatis — dan inilah sumber kesalahan yang paling mahal: **salah ketik nama volume tidak memunculkan error, ia hanya membuat volume baru yang kosong.** Aplikasi lalu berjalan normal dengan database kosong, dan data lama tetap ada di volume yang tidak lagi dipakai siapa pun.

Bentuk yang lebih eksplisit dan lebih sulit disalahartikan:

```bash
docker run -d --name db \
  --mount type=volume,source=pgdata,target=/var/lib/postgresql/data \
  postgres:16
```

`--mount` menolak kalau volumenya tidak ada; `-v` membuatnya diam-diam. Untuk data yang penting, `--mount` lebih aman karena kegagalannya berisik.

### Yang tidak boleh dilakukan dengan volume

Volume adalah tempat data yang seharusnya bertahan. Dua perintah ini menghapusnya:

```bash
docker compose down -v      # -v = hapus volume juga
docker volume prune         # hapus semua volume tanpa container
```

Keduanya tidak bisa dibatalkan. `down` biasa tidak menyentuh volume; `down -v` menghapusnya. Selisih satu huruf itu adalah selisih antara "restart" dan "data hilang".

### Backup: satu container sekali pakai

Volume tidak muncul sebagai folder biasa yang bisa kamu kopi dengan drag-and-drop. Cara membacanya adalah dengan memasangnya ke container sementara:

```bash
docker run --rm \
  -v pgdata:/data \
  -v "${PWD}:/backup" \
  alpine tar czf /backup/pgdata.tgz -C /data .
```

Yang terjadi: satu container sekali pakai, dua mount, satu perintah `tar`. Hasilnya berkas `pgdata.tgz` di folder tempat kamu menjalankan perintah. Memulihkan berarti membalik arahnya — pasang volume tujuan dan ekstrak arsipnya.

Perintah ini juga cara tercepat memeriksa isi volume kalau kamu curiga aplikasi menulis ke tempat yang salah:

```bash
docker run --rm -v pgdata:/data alpine ls -la /data
```

### Dari laptop ke server

Sampai di sini image hanya ada di mesinmu. Server tidak bisa membaca folder laptop, jadi image harus melewati sebuah registry:

```bash
docker build -t namamu/app:2026-11-05 .
docker tag namamu/app:2026-11-05 namamu/app:latest
docker push namamu/app:2026-11-05
```

Di server:

```bash
docker pull namamu/app:2026-11-05
docker run -d -p 80:3000 namamu/app:2026-11-05
```

Atau, cara yang lebih bisa diulang, dengan Compose dan berkas yang sama seperti di laptop:

```yaml
services:
  app:
    image: namamu/app:2026-11-05
    ports:
      - "80:3000"
```

Perhatikan yang tidak ikut: folder kerja, `.env` lokal, dan data. Tiga hal itu harus disiapkan terpisah di server — dan itu justru kabar baik, karena berarti kamu tahu persis apa yang dibutuhkan aplikasimu untuk hidup.

## Lapis 2

### Tag, digest, dan kenapa `:latest` menipu

Tag adalah penunjuk yang bisa dipindahkan. `namamu/app:latest` hari ini dan besok bisa menunjuk image yang berbeda, dan tidak ada cara mengetahui yang mana tanpa memeriksa.

```bash
docker image inspect namamu/app:2026-11-05 --format '{{.Id}}'
docker images --digests
```

Digest (`sha256:...`) adalah sidik jari isi image: kalau isinya berubah, digest berubah. Di produksi, tag versi sudah cukup; kalau butuh jaminan bahwa yang dijalankan benar-benar sama dengan yang diuji, pakai digest:

```yaml
services:
  app:
    image: namamu/app@sha256:<digest>
```

Praktik yang bertahan lama: tag memuat versi atau hash commit (`app:2026-11-05-a1b2c3`), supaya pertanyaan "versi apa yang sedang jalan?" bisa dijawab tanpa menebak, dan rollback berarti menjalankan tag sebelumnya.

### Multi-stage build: yang membuat image layak dikirim

Image hasil build naif memuat kompilator, cache paket, dan source code — sering berkali-kali lebih besar dari yang dibutuhkan untuk menjalankan aplikasi.

```dockerfile
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
CMD ["node", "dist/server.js"]
```

Hanya stage terakhir yang masuk image akhir. `COPY --from=build` adalah satu-satunya jembatan antar-stage, jadi apa pun yang tidak kamu salin akan dibuang.

Yang membuat ini berhasil adalah **urutan lapisan**. `COPY package*.json` sebelum `COPY . .` berarti lapisan `npm ci` hanya dibangun ulang kalau dependensi berubah, bukan setiap kali satu berkas kode berubah. Menukar dua baris itu menambah menit ke setiap build tanpa terlihat salah.

### `.dockerignore`: satu baris yang menghemat banyak

```gitignore
node_modules
.git
.env
dist
```

Tanpa berkas ini, `COPY . .` menyalin `node_modules` dan `.git` ke dalam build context — memperlambat build, dan pada kasus `.env` bisa membocorkan rahasia ke dalam image. Lapisan image tersimpan di registry; rahasia yang pernah masuk ke satu lapisan tetap ada di riwayat lapisan itu meskipun dihapus di lapisan berikutnya.

Aturan: `.dockerignore` diperlakukan seperti kode. Kalau ada berkas yang tidak boleh dibaca orang lain, pastikan berkas itu tidak pernah masuk context.

### Healthcheck: membedakan "running" dan "siap"

```yaml
services:
  app:
    image: namamu/app:2026-11-05
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
      interval: 15s
      timeout: 3s
      retries: 3
      start_period: 20s
```

Container yang running belum tentu bisa melayani. Healthcheck mengubah status container menjadi `healthy` atau `unhealthy`, dan `start_period` memberi waktu aplikasi menyala sebelum kegagalan dihitung.

Yang penting dipahami: healthcheck **tidak** me-restart apa pun dengan sendirinya di Compose biasa. Ia memberi informasi; yang bertindak adalah orchestrator, atau `depends_on` dengan `condition: service_healthy`, atau kamu sendiri saat membaca `docker compose ps`.

### Membaca pemakaian disk

```bash
docker system df              # ringkasan image, container, volume, cache
docker system df -v           # per objek, urut dari yang terbesar
```

Tiga penyebab disk penuh yang paling sering: image lama dari build berulang, cache build, dan volume yatim — volume yang container-nya sudah dihapus tapi volumenya tidak. `docker system prune` membersihkan dua yang pertama; volume hanya ikut terhapus kalau kamu menambahkan `--volumes`, dan itu perlu dibaca dua kali sebelum Enter.

### Deployment yang bisa diulang

Urutan yang bisa dijalankan siapa pun, dan diulang tanpa berpikir:

```bash
# di mesin build
docker build -t namamu/app:2026-11-05 .
docker push namamu/app:2026-11-05

# di server
docker pull namamu/app:2026-11-05
docker compose up -d
docker compose ps
docker compose logs --tail=100 app
```

Rahasia tidak ikut dalam image. Ia diberikan lewat environment di server (berkas `.env` yang tidak di-commit, atau secret milik platform), dan dirujuk dengan `${VAR}` di compose — sama seperti di modul sebelumnya.

Perbedaan yang paling sering menjatuhkan deployment pertama: di laptop database-nya `db:5432` di jaringan Compose, di server database-nya layanan terkelola dengan nama host lain. Karena itu string koneksi harus datang dari environment, bukan ditulis di kode.

### Rollback: satu baris, kalau tag-nya benar

```bash
docker compose down
# ubah image: ke tag versi sebelumnya
docker compose up -d
```

Rollback hanya semudah ini kalau setiap rilis punya tag sendiri. Kalau semuanya `:latest`, rollback berarti membangun ulang dari commit lama dan berdoa hasilnya sama. Itu alasan sebenarnya kenapa tag yang baik bukan soal kerapian, tapi soal apakah kamu bisa pulih saat jam dua pagi.

Perhatikan juga: rollback **kode** tidak otomatis me-rollback **skema database**. Migrasi yang sudah jalan harus kompatibel mundur, atau rollback butuh langkah tersendiri. Ini keputusan yang diambil saat menulis migrasi, bukan saat panik.

### Error umum

| Pesan | Arti | Cara memperbaiki |
|---|---|---|
| `cat: can't open 'x': No such file or directory` setelah container dibuat ulang | Data ditulis ke lapisan tulis, bukan volume | Pasang volume di path yang ditulis aplikasi |
| Aplikasi jalan tapi database kosong | Nama volume salah ketik → Docker membuat volume baru yang kosong | `docker volume ls`, bandingkan namanya, pindahkan data atau perbaiki nama |
| `Error response from daemon: remove x: volume is in use` | Masih ada container yang memakai volume | `docker ps -a`, hapus container-nya dulu |
| `Mounts denied: The path ... is not shared from the host` | Folder host tidak dibagikan ke Docker Desktop | Settings → Resources → File sharing |
| `denied: requested access to the resource is denied` saat push | Belum `docker login`, atau nama image tidak memuat namespace yang benar | `docker login`, lalu pastikan tag `user/repo:versi` |
| `exec format error` saat container di server jalan | Image dibangun untuk arsitektur lain (mis. ARM di laptop Apple, server x86) | Build dengan `--platform linux/amd64`, atau build di CI |
| `no space left on device` saat build | Image lama, cache, dan volume yatim menumpuk | `docker system df -v`, lalu prune seperlunya |
| Container `unhealthy` padahal aplikasi jalan | Healthcheck menembak path/port yang salah | Uji perintah healthcheck-nya manual di dalam container |

### Daftar periksa sebelum menyerahkan ke server

1. Tidak ada data penting di lapisan tulis — semua yang harus bertahan punya volume.
2. Nama volume cocok dengan yang dimaksud (bukan nama baru yang kebetulan mirip).
3. `.dockerignore` memuat `.env`, `.git`, `node_modules`, hasil build.
4. Image memakai tag versi atau hash commit, bukan `:latest` saja.
5. Build memakai multi-stage kalau ada langkah kompilasi.
6. Rahasia datang dari environment server, tidak tertanam di image.
7. Ada healthcheck, dan `start_period`-nya cukup.
8. Backup volume pernah dicoba — termasuk memulihkannya, bukan hanya membuat arsipnya.
9. Tahu persis perintah rollback, dan tag sebelumnya masih ada di registry.

### Rujukan resmi

`TODO: tautan dokumentasi resmi Docker untuk volumes, bind mounts, multi-stage build, dan distribusi image`

## Latihan

Latihan 1 mengubah tiga jenis penyimpanan menjadi fungsi yang bisa dijalankan: delapan aksi, dan kamu harus menebak hasil tiap baris sebelum melihatnya. Kalau baris pertama dan keempat terasa membingungkan, itu justru inti modul ini — menulis berhasil bukan berarti data bertahan.

Latihan 2 membuktikannya dengan Docker sungguhan: volume yang sama dibaca dua container berbeda, lapisan tulis yang tidak diwariskan, dan bind mount yang berkasnya muncul sebagai berkas biasa di laptopmu. Tiga percobaan, tiga jawaban berbeda untuk pertanyaan "di mana data saya tinggal?".

## Kamu sudah bisa ini kalau…

- [ ] Bisa menjelaskan kenapa berkas yang ditulis container hilang saat container dibuat ulang.
- [ ] Bisa memilih antara volume, bind mount, dan lapisan tulis untuk sebuah kasus nyata.
- [ ] Tahu kenapa salah ketik nama volume lebih berbahaya daripada error.
- [ ] Tahu perintah untuk melihat isi volume yang tidak punya folder di host.
- [ ] Bisa menjelaskan apa yang dilakukan multi-stage build dan kenapa urutan `COPY` penting.
- [ ] Tahu kenapa `:latest` membuat rollback tidak bisa diandalkan.
- [ ] Latihan 1 lulus dan latihan 2 berhasil dijalankan.
