---
track: docker
nomor: 1
judul: "Image & layer: kenapa urutan baris Dockerfile menentukan waktu build"
slug: image-dan-layer
estimasi_menit: 14
prasyarat:
  - fondasi/cli
latihan:
  - id: docker-01-latihan-1
    jenis: web
    bahasa: python
    soal: "Simulasikan cache layer Docker. Diberi enam instruksi Dockerfile (nama, ukuran MB, berkas yang disentuh), untuk tiap daftar berkas yang berubah cetak satu baris: '<berkas> -> bangun ulang <n> lapis (<mb> MB)'. Aturannya: lapis pertama yang menyentuh berkas yang berubah dan semua lapis sesudahnya dibangun ulang; lapis sebelumnya dipakai dari cache. Instruksi tanpa berkas yang disentuh tidak pernah memicu pembangunan ulang, tapi ikut dibangun ulang kalau ada lapis di atasnya yang berubah."
    kode_awal: |
      LAPIS = [
          ("FROM python:3.12-slim", 120, []),
          ("WORKDIR /app", 0, []),
          ("COPY requirements.txt .", 3, ["requirements.txt"]),
          ("RUN pip install -r requirements.txt", 95, []),
          ("COPY . .", 2, ["app.py", "requirements.txt"]),
          ('CMD ["python", "app.py"]', 0, []),
      ]

      BERUBAH = [["app.py"], ["requirements.txt"]]

      # untuk tiap daftar di BERUBAH:
      # 1. cari indeks lapis pertama yang menyentuh salah satu berkas itu
      # 2. semua lapis dari indeks itu sampai akhir dibangun ulang
      # 3. cetak "<berkas> -> bangun ulang <n> lapis (<mb> MB)"
    output_harapan: |
      app.py -> bangun ulang 2 lapis (2 MB)
      requirements.txt -> bangun ulang 4 lapis (100 MB)
    solusi: |
      LAPIS = [
          ("FROM python:3.12-slim", 120, []),
          ("WORKDIR /app", 0, []),
          ("COPY requirements.txt .", 3, ["requirements.txt"]),
          ("RUN pip install -r requirements.txt", 95, []),
          ("COPY . .", 2, ["app.py", "requirements.txt"]),
          ('CMD ["python", "app.py"]', 0, []),
      ]

      BERUBAH = [["app.py"], ["requirements.txt"]]


      def bangun_ulang(berubah):
          mulai = len(LAPIS)
          for i, (_, _, sentuh) in enumerate(LAPIS):
              if set(sentuh) & set(berubah):
                  mulai = i
                  break
          sisa = LAPIS[mulai:]
          return len(sisa), sum(ukuran for _, ukuran, _ in sisa)


      for berkas in BERUBAH:
          n, mb = bangun_ulang(berkas)
          print(f"{', '.join(berkas)} -> bangun ulang {n} lapis ({mb} MB)")
    catatan_solusi: "Mengubah app.py hanya membatalkan COPY . . dan CMD — dua lapis, 2 MB. Mengubah requirements.txt membatalkan COPY requirements.txt dan semua di atasnya: empat lapis, 100 MB, termasuk pip install yang paling mahal. Inilah seluruh alasan Dockerfile ditulis dengan urutan tertentu: yang paling jarang berubah diletakkan paling atas."
  - id: docker-01-latihan-2
    jenis: laptop
    soal: "Bangun image dari Dockerfile, ubah satu berkas kode, lalu bangun ulang. Buktikan lewat keluaran build bahwa lapis RUN pip install memakai cache sementara lapis COPY . . dibangun ulang, dan lihat lapisnya dengan docker image history."
    kebutuhan:
      - "Docker terpasang dan daemon berjalan (docker version menampilkan bagian Server)"
      - "Terminal (git-bash / PowerShell)"
    langkah:
      - perintah: "mkdir latihan-layer && cd latihan-layer && printf 'import requests\\nprint(\"halo versi satu, requests\", requests.__version__)\\n' > app.py && printf 'requests==2.32.3\\n' > requirements.txt"
        penjelasan: "Membuat dua berkas: satu skrip yang benar-benar memakai dependensi, dan satu daftar dependensi. Keduanya sengaja dipisah karena berubah pada waktu yang berbeda."
      - perintah: "printf 'FROM python:3.12-slim\\nWORKDIR /app\\nCOPY requirements.txt .\\nRUN pip install --no-cache-dir -r requirements.txt\\nCOPY . .\\nCMD [\"python\", \"app.py\"]\\n' > Dockerfile"
        penjelasan: "Dockerfile enam baris. Urutannya penting: dependensi disalin dan dipasang sebelum kode, supaya perubahan kode tidak membatalkan lapis pip install."
      - perintah: "docker build -t latihan-layer . && docker image history latihan-layer"
        penjelasan: "Build pertama tidak ada cache sama sekali — semua lapis dibuat. image history menampilkan tiap lapis beserta ukurannya; lapis RUN pip install akan menjadi salah satu yang terbesar."
      - perintah: "printf 'import requests\\nprint(\"halo versi dua, requests\", requests.__version__)\\n' > app.py && docker build -t latihan-layer ."
        penjelasan: "Mengubah kode lalu build ulang dengan tag yang sama. Perhatikan keluaran: baris FROM, WORKDIR, COPY requirements.txt, dan RUN pip install bertanda CACHED; hanya COPY . . dan CMD yang dijalankan ulang."
      - perintah: "docker run --rm latihan-layer"
        penjelasan: "Menjalankan image hasil build. Yang tercetak adalah versi kedua — membuktikan lapis COPY . . memang dibangun ulang dengan isi baru, sementara dependensi tetap dari lapis lama."
      - perintah: "docker image history latihan-layer | head -8"
        penjelasan: "Melihat lapis dari yang terbaru. Ada dua lapis COPY . . dan dua CMD — masing-masing dari build pertama dan kedua; lapis lama tidak dihapus, hanya tidak lagi dirujuk tag terbaru."
    hasil: |
      halo versi dua, requests 2.32.3
      IMAGE          CREATED         CREATED BY                                      SIZE
      <id>           2 seconds ago   CMD ["python" "app.py"]                         0B
      <id>           2 seconds ago   COPY . . # buildkit                             <kecil>
      <id>           5 minutes ago   RUN /bin/sh -c pip install --no-cache-dir ...   <besar>
      <id>           5 minutes ago   COPY requirements.txt . # buildkit              <kecil>
    cek_berhasil:
      - "Build kedua menampilkan CACHED pada baris RUN pip install"
      - "docker run mencetak 'halo versi dua, requests 2.32.3'"
      - "docker image history menunjukkan dua lapis COPY . . dengan waktu berbeda"
    kalau_gagal:
      - error: "Cannot connect to the Docker daemon at unix:///var/run/docker.sock"
        arti: "Daemon Docker tidak berjalan, atau shell ini tidak punya izin ke socket-nya."
        perbaikan:
          - "Windows/macOS: buka Docker Desktop dan tunggu sampai statusnya Running"
          - "Linux: sudo systemctl start docker"
          - "Linux: tambahkan user ke grup docker (sudo usermod -aG docker $USER) lalu login ulang"
      - error: "docker: command not found"
        arti: "Docker CLI tidak ada di PATH."
        perbaikan:
          - "Pasang Docker Desktop (Windows/macOS) atau docker-ce (Linux)"
          - "Di Windows, buka terminal baru setelah instalasi supaya PATH dimuat ulang"
          - "Di git-bash, coba jalankan lewat 'C:/Program Files/Docker/Docker/resources/bin/docker.exe'"
      - error: "ERROR: failed to solve: python:3.12-slim: failed to resolve source metadata ... dial tcp: lookup registry-1.docker.io"
        arti: "Tidak bisa menghubungi Docker Hub — jaringan atau DNS bermasalah."
        perbaikan:
          - "Cek koneksi: curl -I https://registry-1.docker.io/v2/"
          - "Kalau di belakang proxy, set HTTP_PROXY/HTTPS_PROXY untuk daemon Docker"
          - "Coba jaringan lain untuk memastikan bukan pemblokiran DNS lokal"
      - error: "failed to compute cache key: \"/app.py\": not found"
        arti: "COPY . . dijalankan dari folder yang tidak memuat berkas yang disebut, atau build dijalankan dari folder induk."
        perbaikan:
          - "Pastikan build dijalankan di folder yang berisi Dockerfile dan app.py"
          - "Tambahkan .dockerignore yang tidak mengecualikan app.py"
          - "Cek dengan ls -a sebelum build"
    buktikan:
      perubahan: "Pindahkan baris COPY . . ke atas RUN pip install, lalu build ulang setelah mengubah app.py."
      hasil_diharapkan: "Lapis RUN pip install ikut dibangun ulang (tidak lagi CACHED) — build kembali memakan waktu seperti build pertama."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Apa yang sebenarnya disimpan sebagai satu lapis (layer) pada image Docker?"
    opsi:
      a: "Daftar perintah yang dijalankan saat container start"
      b: "Selisih isi filesystem setelah satu instruksi Dockerfile dijalankan"
      c: "Seluruh isi image setelah instruksi itu"
      d: "Berkas Dockerfile yang sudah dikompresi"
    jawaban: b
    penjelasan: "Setiap instruksi yang mengubah filesystem (RUN, COPY, ADD) menghasilkan satu lapis berisi selisihnya saja terhadap lapis di bawahnya. Karena itu image tidak menyimpan salinan penuh berulang kali: lapis dasar dipakai bersama oleh semua image yang memakai base yang sama."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa COPY requirements.txt . dan RUN pip install diletakkan sebelum COPY . . ?"
    opsi:
      a: "Supaya image lebih kecil"
      b: "Supaya perubahan kode tidak membatalkan cache lapis instalasi dependensi"
      c: "Karena Docker mewajibkan urutan itu"
      d: "Supaya container start lebih cepat"
    jawaban: b
    penjelasan: "Cache Docker diperiksa per lapis, dari atas ke bawah, dan begitu satu lapis berubah semua lapis sesudahnya dibangun ulang. Kalau kode disalin lebih dulu, setiap perubahan satu baris kode akan memaksa pip install dijalankan lagi — pekerjaan termahal di build."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Perintah untuk melihat daftar lapis sebuah image beserta ukurannya adalah docker image ... (satu kata)"
    jawaban: "history"
    penjelasan: "docker image history menampilkan tiap lapis dari yang terbaru, termasuk perintah yang menghasilkannya dan ukurannya. Ini cara tercepat menemukan lapis mana yang membuat image membengkak, sebelum mulai menebak-nebak."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Dua image dibangun dari base yang sama dan keduanya memakai python:3.12-slim. Bagaimana pemakaian disk-nya?"
    opsi:
      a: "Lapis base disimpan sekali dan dipakai bersama kedua image"
      b: "Lapis base disalin, jadi disk terpakai dua kali"
      c: "Tergantung apakah image diberi tag"
      d: "Tergantung sistem operasi host"
    jawaban: a
    penjelasan: "Lapis bersifat read-only dan dialamatkan berdasarkan hash isinya, jadi lapis yang identik hanya disimpan sekali di disk. Container menambahkan lapis tipis yang bisa ditulis di atasnya — itulah kenapa menjalankan sepuluh container dari satu image tidak memakan sepuluh kali ukuran image."
    tingkat: menengah
  - tipe: pilihan_ganda
    pertanyaan: "Satu lapis RUN mengunduh berkas besar, lalu lapis RUN berikutnya menghapusnya: RUN curl -O besar.tar.gz, lalu RUN rm besar.tar.gz. Apa efeknya pada ukuran image?"
    opsi:
      a: "Ukuran image berkurang sebesar berkas yang dihapus"
      b: "Ukuran image tidak berkurang: penghapusan hanya tercatat di lapis baru"
      c: "Image gagal dibangun karena berkas tidak ditemukan"
      d: "Berkas benar-benar hilang dari semua lapis"
    jawaban: b
    penjelasan: "Lapis bersifat read-only dan tidak bisa diubah. Menghapus berkas di lapis berikutnya hanya menambahkan penanda 'dihapus' — byte aslinya tetap ada di lapis bawah dan tetap ikut terunduh. Karena itu unduh dan hapus harus berada di satu instruksi RUN yang sama, dan berkas besar sebaiknya tidak pernah masuk build context (pakai .dockerignore)."
    tingkat: lanjutan
---

## Lapis 1

### Image bukan satu berkas besar

Image Docker adalah tumpukan lapis (layer) read-only. Setiap instruksi Dockerfile yang mengubah isi filesystem — `RUN`, `COPY`, `ADD` — menghasilkan satu lapis yang hanya memuat **selisihnya** terhadap lapis di bawahnya.

```
lapis 6  CMD ["python", "app.py"]           0 B       ← perintah default
lapis 5  COPY . .                           2 MB      ← kode kamu
lapis 4  RUN pip install -r requirements   95 MB      ← dependensi
lapis 3  COPY requirements.txt .            3 MB
lapis 2  WORKDIR /app                       0 B
lapis 1  FROM python:3.12-slim             120 MB      ← base, dipakai bersama
```

Enam angka ini sama dengan daftar `LAPIS` di latihan 1, jadi hasil hitunganmu bisa langsung dicocokkan dengan gambar ini. Ukuran persisnya berbeda di mesin lain — yang tidak berubah adalah bentuknya: base paling besar, dependensi berikutnya, kode kamu paling kecil.

Karena lapis dialamatkan berdasarkan hash isinya, lapis yang identik hanya disimpan sekali. Sepuluh image yang memakai base yang sama berbagi satu salinan lapis base di disk dan di registry.

### Container menambah satu lapis di atasnya

Saat container berjalan, Docker menambahkan lapis tipis yang bisa ditulis (copy-on-write) di atas semua lapis read-only. Berkas yang diubah container disalin ke lapis itu dulu, baru diubah. Itulah kenapa:

- Menjalankan container tidak mengubah image.
- Menghapus container membuang semua perubahan di dalamnya.
- Data yang harus bertahan perlu volume, bukan disimpan di filesystem container (dibahas di modul 3).

### Cache: kenapa urutan baris menentukan waktu build

Docker menyimpan hasil tiap lapis. Saat build berikutnya, ia memeriksa lapis dari atas ke bawah: kalau instruksi dan isi berkas yang disalin **sama persis** dengan build sebelumnya, lapis itu dipakai dari cache. Begitu satu lapis tidak cocok, **semua lapis sesudahnya dibangun ulang** — cache tidak bisa "melompati" satu lapis yang berubah.

Konsekuensinya langsung terasa:

| Yang diubah | Lapis dibangun ulang | Biaya |
|---|---|---|
| Satu baris kode | `COPY . .` dan sesudahnya | detik |
| Satu dependensi baru | `COPY requirements.txt`, `pip install`, dan sesudahnya | menit |

Karena itu Dockerfile yang baik disusun dari **yang paling jarang berubah ke yang paling sering**:

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .                 # jarang berubah
RUN pip install --no-cache-dir -r requirements.txt
COPY . .                                # sering berubah
CMD ["python", "app.py"]
```

Kalau dua baris `COPY` itu ditukar, setiap kali kamu menyunting satu baris kode, `pip install` ikut dijalankan lagi — dan itu bagian yang paling lama.

### Instruksi mana yang membuat lapis

| Instruksi | Membuat lapis? | Catatan |
|---|---|---|
| `FROM` | ya (lapis base) | selalu dari cache kalau image-nya sudah ada |
| `RUN` | ya | perintah shell dijalankan, hasilnya disimpan |
| `COPY` / `ADD` | ya | cache dibatalkan kalau isi berkas berubah |
| `WORKDIR` | ya (metadata) | ukurannya nol |
| `ENV`, `LABEL`, `EXPOSE` | ya (metadata) | ukurannya nol |
| `CMD`, `ENTRYPOINT` | ya (metadata) | hanya perintah default, tidak dijalankan saat build |

`CMD` tidak dijalankan saat build — ia hanya dicatat sebagai perintah default saat container start. Kesalahan pemula: menaruh `RUN npm install` **setelah** `CMD`, mengira urutannya bebas.

### Menghapus berkas tidak mengecilkan image

```dockerfile
RUN curl -O https://contoh.com/data-besar.tar.gz && tar xf data-besar.tar.gz && rm data-besar.tar.gz
```

Kalau `rm` ada di instruksi `RUN` yang **berbeda**, byte berkas itu tetap tersimpan di lapis sebelumnya dan tetap ikut terunduh. Lapis read-only: penghapusan hanya tambahan catatan "berkas ini dihapus" di lapis baru.

Dua cara yang benar:
1. Unduh, pakai, dan hapus dalam satu `RUN` (seperti contoh di atas).
2. Jangan masukkan berkas itu ke build context sejak awal — `.dockerignore`.

## Lapis 2

### `.dockerignore`: apa yang tidak perlu dikirim

Sebelum build dimulai, Docker mengirim seluruh isi folder (build context) ke daemon. Folder `node_modules` berisi puluhan ribu berkas yang tidak dipakai image, tapi tetap dikirim dan tetap membatalkan cache `COPY . .` setiap kali berubah.

```
node_modules
.git
.next
dist
*.log
.env
```

`.env` bukan cuma soal ukuran: apa pun yang masuk build context bisa berakhir di lapis image, dan image bisa dibaca siapa pun yang menariknya. Rahasia tidak pernah masuk image; ia diberikan saat runtime lewat environment variable atau secret.

Efek samping penting: `.dockerignore` yang tepat membuat cache `COPY . .` hanya batal ketika berkas yang benar-benar dipakai berubah. Pada proyek Node, `node_modules` yang berubah tanpa `.dockerignore` membatalkan lapis salin kode di hampir setiap build, padahal isinya tidak pernah dipakai image.

### Multi-stage: memisahkan alat build dari hasil

Masalah umum: compiler, SDK, dan dependensi build hanya dibutuhkan saat build, tidak saat jalan. Kalau semuanya di satu image, image akhirnya membawa ratusan MB yang tidak pernah dipakai.

```dockerfile
# tahap 1 — build
FROM golang:1.23 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /keluar/app ./cmd/app

# tahap 2 — jalan
FROM gcr.io/distroless/static-debian12
COPY --from=build /keluar/app /app
ENTRYPOINT ["/app"]
```

Image akhir hanya memuat binary dan base minimal — bukan toolchain Go. `COPY --from=build` menyalin dari tahap lain, dan tahap yang tidak dirujuk tidak ikut ke image akhir.

Pola yang sama dipakai di Node (`npm ci` + `npm run build` di tahap build, lalu `COPY --from=build /app/dist`), dan di Python (wheel dibangun di tahap build, dipasang di tahap akhir).

### Membaca lapis untuk mencari pembengkakan

```bash
docker image history --no-trunc myapp:latest     # perintah lengkap tiap lapis
docker image inspect myapp:latest --format '{{.Size}}'
docker build --progress=plain .                   # urutan langkah & cache hit
```

`image history` menunjukkan lapis mana yang besar. Kalau ada lapis `RUN apt-get install ...` yang jauh lebih besar daripada isi aplikasimu, itu tanda dependensi build bocor ke image akhir — kandidat multi-stage.

`--no-trunc` penting: tanpa itu perintahnya dipotong dan kamu tidak tahu `RUN` mana yang dimaksud.

### Cache mount: tanpa mengorbankan cache

Cache BuildKit bisa menyimpan folder dependensi lintas build tanpa memasukkannya ke lapis image:

```dockerfile
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt
```

Isi `/root/.cache/pip` disimpan di sisi builder, bukan di image. Hasilnya: image tetap bersih, tapi unduhan paket tidak diulang setiap kali `requirements.txt` berubah satu baris.

### Base image: pilih yang sesuai, bukan yang terbiasa

| Base | Ciri | Kapan dipakai |
|---|---|---|
| `debian:12` | lengkap: apt dan pustaka sistem tersedia | butuh banyak paket sistem |
| `python:3.12-slim` | Python tanpa compiler | Python murni atau wheel sudah tersedia |
| `alpine` | paling kecil, memakai musl libc | biner statis; sering merepotkan untuk wheel Python |
| `distroless` | tanpa shell, tanpa package manager | produksi |

Angka ukuran sengaja tidak ditulis di sini: ia berubah tiap rilis. Lihat sendiri dengan `docker image ls` setelah menarik base yang kandidat — itu angka yang benar untuk mesin dan versimu.

Alpine sering dipilih karena paling kecil, lalu memakan waktu lama karena `pip install` harus mengompilasi dari sumber saat wheel musl tidak tersedia. Base kecil bukan tujuan akhir; base yang **cocok dengan dependensimu** yang menghemat waktu.

Untuk produksi, `distroless` atau `slim` lebih baik daripada `latest`: tanpa shell, penyerang yang sudah masuk tidak punya `curl` dan `bash` untuk lanjut. Dan `latest` berubah tanpa pemberitahuan — pin versi.

### Error umum

| Pesan | Arti | Cara memperbaiki |
|---|---|---|
| `Cannot connect to the Docker daemon` | Daemon mati atau izin socket kurang | Jalankan Docker Desktop / `systemctl start docker`; tambahkan user ke grup `docker` |
| `failed to compute cache key: "/x": not found` | `COPY` menunjuk berkas yang tidak ada di context | Cek path relatif terhadap folder build; periksa `.dockerignore` |
| `no space left on device` | Lapis menumpuk | `docker system prune` (hati-hati: menghapus image & container yang tidak dipakai) |
| `exec format error` | Image dibangun untuk arsitektur lain | `docker build --platform linux/amd64` |
| Build selalu penuh walau kode tidak berubah | Ada berkas yang berubah sendiri di context (log, `.next`, `node_modules`) | Perbaiki `.dockerignore` |
| Image besar padahal kode kecil | Dependensi build ikut ke image akhir | Pakai multi-stage |
| `permission denied` saat `COPY` | User di image tidak punya izin | `COPY --chown=app:app`, atau `USER` setelah `COPY` |

### Daftar periksa Dockerfile

1. Urutan instruksi: yang paling jarang berubah di atas.
2. `.dockerignore` ada dan memuat `.git`, dependensi, hasil build, `.env`.
3. Base image dipin versinya, bukan `latest`.
4. Unduh-dan-hapus berada dalam satu `RUN`.
5. Tahap build dipisahkan dari tahap jalan (multi-stage) kalau ada compiler.
6. Image berjalan sebagai user non-root (`USER app`).
7. `docker image history` pernah dibaca — tahu lapis mana yang paling besar dan kenapa.
8. Rahasia tidak ada di Dockerfile maupun di build context.

### Rujukan resmi

`TODO: tautan dokumentasi resmi Docker untuk image, layer, dan cache build`

## Latihan

Latihan 1 menghitung sendiri apa yang biasanya hanya terlihat sebagai tulisan `CACHED` di terminal: berapa lapis yang batal, dan berapa MB yang harus dibangun ulang. Setelah angkanya keluar, aturan "taruh yang jarang berubah di atas" berhenti menjadi hafalan — ia jadi konsekuensi aritmetika.

Latihan 2 melakukannya dengan Docker sungguhan: build, ubah kode, build lagi, dan baca `docker image history`. Yang dibuktikan bukan bahwa build berhasil, tapi bahwa lapis `pip install` **tidak** dijalankan ulang.

## Kamu sudah bisa ini kalau…

- [ ] Bisa menjelaskan kenapa image tidak menyimpan salinan penuh di setiap lapis.
- [ ] Bisa menebak, tanpa menjalankan build, lapis mana yang batal kalau sebuah berkas berubah.
- [ ] Tahu kenapa `rm` di `RUN` terpisah tidak mengecilkan image.
- [ ] Bisa menjelaskan apa yang dilakukan multi-stage dan masalah apa yang ia selesaikan.
- [ ] Tahu kenapa `.dockerignore` memengaruhi waktu build, bukan hanya ukuran context.
- [ ] Latihan 1 lulus dan latihan 2 berhasil dijalankan.
