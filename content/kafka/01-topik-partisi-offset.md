---
track: kafka
nomor: 1
judul: "Kafka: topik, partisi, dan offset — tiga kata yang menjelaskan semuanya"
slug: topik-partisi-offset
estimasi_menit: 13
prasyarat:
  - fondasi/sql
  - go/goroutine-dan-channel
latihan:
  - id: kafka-01-latihan-1
    jenis: web
    bahasa: python
    soal: "Hitung lag (ketertinggalan) tiap partisi: lag = offset terakhir produsen dikurangi offset terakhir yang dibaca consumer. Cetak '<partisi> lag <n>' per partisi, lalu 'total lag <n>' di baris terakhir."
    kode_awal: |-
      PARTISI = [
          ("p0", 1200, 1500),
          ("p1", 800, 800),
          ("p2", 340, 610),
      ]
      # tiap baris: (nama partisi, offset consumer, offset produsen)

      # lag = produsen - consumer. Cetak per partisi lalu total.
    output_harapan: |-
      p0 lag 300
      p1 lag 0
      p2 lag 270
      total lag 570
    solusi: |-
      PARTISI = [
          ("p0", 1200, 1500),
          ("p1", 800, 800),
          ("p2", 340, 610),
      ]

      total = 0
      for nama, consumer, produsen in PARTISI:
          lag = produsen - consumer
          total += lag
          print(f"{nama} lag {lag}")

      print(f"total lag {total}")
    catatan_solusi: "Lag adalah ukuran paling berguna di Kafka: ia menjawab 'seberapa tertinggal konsumenku' dalam satu angka. Lag 0 berarti sudah menyusul; lag yang terus naik berarti laju masuk lebih cepat daripada laju proses. Perhatikan p1 lag 0 tidak berarti sehat dengan sendirinya — bisa jadi partisi itu memang sepi, bisa juga konsumennya macet tapi tidak ada pesan baru. Karena itu lag harus dibaca bersama laju masuk."
  - id: kafka-01-latihan-2
    jenis: laptop
    soal: "Jalankan Kafka lokal dengan Docker Compose, buat topik tiga partisi, kirim enam pesan dengan kunci berbeda, lalu buktikan bahwa pesan berkunci sama selalu masuk partisi yang sama."
    kebutuhan:
      - "Docker Desktop atau Docker Engine (docker --version)"
      - "Terminal (git-bash / PowerShell)"
      - "Docker Compose (termasuk di Docker Desktop)"
    langkah:
      - perintah: "mkdir latihan-kafka && cd latihan-kafka"
        penjelasan: "Folder kerja terpisah supaya berkas compose tidak tercampur proyek lain."
      - perintah: "notepad docker-compose.yml"
        penjelasan: "Tempel isi compose dari bagian 'Kafka lokal untuk belajar' di atas. Di Linux/macOS ganti nano docker-compose.yml."
      - perintah: "docker compose up -d"
        penjelasan: "Menjalankan Kafka dalam mode KRaft (tanpa ZooKeeper, cara sejak Kafka 3.3). Tunggu sekitar 15 detik sampai broker siap."
      - perintah: "docker compose exec kafka kafka-topics.sh --create --topic pesanan --partitions 3 --replication-factor 1 --bootstrap-server localhost:9092"
        penjelasan: "Membuat topik dengan TIGA partisi. Jumlah partisi menentukan batas paralelisme konsumen — tidak bisa ditambah tanpa memikirkan ulang pembagian kunci."
      - perintah: "printf 'a:1\\na:2\\nb:3\\na:4\\nb:5\\nc:6\\n' | docker compose exec -T kafka kafka-console-producer.sh --topic pesanan --property 'parse.key=true' --property 'key.separator=:' --bootstrap-server localhost:9092"
        penjelasan: "Mengirim enam pesan dengan kunci a, a, b, a, b, c. parse.key=true membuat Kafka memakai bagian sebelum ':' sebagai kunci."
      - perintah: "docker compose exec kafka kafka-console-consumer.sh --topic pesanan --from-beginning --property print.key=true --property print.partition=true --bootstrap-server localhost:9092 --timeout-ms 5000"
        penjelasan: "Membaca ulang semua pesan beserta partisinya. Semua pesan berkunci 'a' harus berada di partisi yang sama, begitu juga 'b' dan 'c'."
    hasil: |-
      Partition:0	a	1
      Partition:0	a	2
      Partition:1	b	3
      Partition:0	a	4
      Partition:1	b	5
      Partition:2	c	6
    cek_berhasil:
      - "Keenam pesan terbaca kembali"
      - "Semua pesan berkunci 'a' ada di partisi yang sama"
      - "Kunci berbeda boleh berada di partisi berbeda, tapi satu kunci tidak pernah berpindah partisi"
    kalau_gagal:
      - error: "docker: command not found"
        arti: "Docker belum terpasang atau tidak ada di PATH."
        perbaikan:
          - "Pasang Docker Desktop, lalu buka terminal baru"
          - "Cek dengan docker --version"
      - error: "Error response from daemon: ports are not available"
        arti: "Port 9092 sudah dipakai proses lain."
        perbaikan:
          - "Hentikan container lama: docker compose down"
          - "Atau ubah port host jadi 9093:9092 di compose"
      - error: "Topic pesanan already exists"
        arti: "Topik dibuat dua kali. Bukan masalah — lanjut ke langkah berikutnya."
        perbaikan:
          - "Abaikan pesan itu, atau hapus dulu dengan kafka-topics.sh --delete"
      - error: "Consumer tidak menampilkan apa pun"
        arti: "Broker belum siap saat producer mengirim, atau --from-beginning tidak disertakan."
        perbaikan:
          - "Tunggu lebih lama setelah 'docker compose up -d', lalu ulangi langkah 5 dan 6"
          - "Pastikan --from-beginning ada di perintah consumer"
    buktikan:
      perubahan: "Kirim tiga pesan baru dengan kunci 'a' saja, lalu baca ulang."
      hasil_diharapkan: "Ketiganya masuk ke partisi yang SAMA dengan pesan 'a' sebelumnya (Partition:0). Inilah bukti bahwa Kafka memakai hash kunci untuk menentukan partisi — jaminan urutan per kunci bergantung sepenuhnya pada hal ini."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Apa yang menentukan partisi tempat sebuah pesan disimpan kalau pesan punya kunci?"
    opsi:
      a: "Waktu pengiriman"
      b: "Hash kunci, sehingga kunci yang sama selalu ke partisi yang sama"
      c: "Ukuran pesan"
      d: "Urutan acak"
    jawaban: b
    penjelasan: "Kafka menghitung hash kunci lalu memetakannya ke salah satu partisi. Kunci sama berarti partisi sama, selalu. Inilah yang memberi jaminan urutan per kunci: semua pesan untuk satu pesanan diproses berurutan karena berada di satu partisi. Tanpa kunci, pesan disebar bergiliran dan urutannya tidak dijamin."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Kamu punya topik 3 partisi dan memakai 6 konsumen dalam satu grup. Apa yang terjadi?"
    opsi:
      a: "Semua konsumen bekerja, masing-masing dapat separuh beban"
      b: "Hanya 3 konsumen yang mendapat partisi; 3 sisanya menganggur"
      c: "Kafka menolak grup itu"
      d: "Pesan diduplikasi ke semua konsumen"
    jawaban: b
    penjelasan: "Satu partisi hanya boleh dibaca satu konsumen dalam satu grup — itu yang mencegah pemrosesan ganda. Dengan 3 partisi, konsumen keempat dan seterusnya menganggur. Menambah partisi adalah satu-satunya cara menaikkan paralelisme, dan itu harus dilakukan sebelum data menumpuk karena menambah partisi mengubah pemetaan kunci."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Angka yang menunjukkan posisi terakhir yang sudah dibaca konsumen pada satu partisi disebut ... (satu kata)"
    jawaban: "offset"
    penjelasan: "Offset adalah nomor urut pesan dalam satu partisi yang terus bertambah dan tidak pernah dipakai ulang. Karena konsumen menyimpan offset-nya sendiri (di topik internal Kafka), ia bisa berhenti, mati, lalu lanjut dari titik yang sama. Menyetel offset mundur adalah cara sah untuk memproses ulang data."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Lag sebuah partisi terus naik selama berjam-jam. Apa kemungkinan penyebab yang paling perlu diperiksa lebih dulu?"
    opsi:
      a: "Broker kehabisan disk"
      b: "Laju masuk pesan lebih cepat daripada laju proses konsumen"
      c: "Jumlah partisi terlalu banyak"
      d: "Pesan terlalu kecil"
    jawaban: b
    penjelasan: "Lag naik berarti produsen menulis lebih cepat daripada konsumen membaca. Penyebabnya biasanya di sisi konsumen: terlalu banyak kerja per pesan, panggilan jaringan lambat di dalam loop, atau konsumen kurang (dan partisi tidak cukup untuk menambah). Disk penuh juga mungkin, tapi lag yang naik perlahan-lahan lebih sering berarti laju proses yang kurang."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Menambah konsumen melebihi jumlah partisi tidak menambah kecepatan. Dengan 3 partisi, berapa konsumen maksimal yang berguna? (tulis angka)"
    jawaban: "3"
    penjelasan: "Satu partisi dibaca satu konsumen per grup, jadi batas paralelisme sama dengan jumlah partisi. Ini keputusan desain di awal: menentukan jumlah partisi berarti menentukan batas kecepatan yang tidak bisa dinaikkan tanpa mengubah topik. Untuk topik bervolume tinggi, hitung kebutuhan paralelisme sejak awal, bukan setelah produksi."
    tingkat: menengah
---

## Lapis 1

### Masalah yang Kafka pecahkan

Dua layanan perlu bertukar data. Cara paling sederhana: satu memanggil yang lain lewat HTTP.

Cara itu punya tiga kelemahan yang muncul bersamaan begitu sistemnya membesar:

1. **Kalau penerima mati, pengirim gagal.** Panggilan langsung menuntut keduanya hidup pada saat yang sama.
2. **Pengirim harus tahu alamat penerima.** Menambah penerima baru berarti mengubah pengirim.
3. **Puncak beban langsung menimpa penerima.** Seribu pesanan per detik berarti seribu panggilan per detik.

Kafka memecahkan ketiganya dengan satu perubahan: **pengirim menulis ke log, bukan memanggil penerima.**

- Penerima boleh mati; pesan tetap tersimpan dan dibaca nanti.
- Pengirim tidak perlu tahu siapa yang membaca.
- Pesan menumpuk saat sibuk dan diproses perlahan setelahnya.

### Tiga kata yang menjelaskan semuanya

**Topik** — nama aliran. Seperti tabel, tapi isinya kejadian yang terus bertambah dan tidak pernah diubah.

**Partisi** — topik dibagi menjadi beberapa bagian. Setiap partisi adalah antrean berurutan sendiri. Inilah sumber paralelisme: tiga partisi berarti tiga konsumen bisa bekerja bersamaan.

**Offset** — nomor urut pesan **di dalam satu partisi**. Mulai 0, terus bertambah, tidak pernah dipakai ulang.

Tiga hal ini cukup untuk memahami hampir semua perilaku Kafka.

### Urutan hanya dijamin di dalam satu partisi

Ini yang paling sering disalahpahami.

Kafka **tidak** menjamin urutan pesan dalam satu topik. Ia hanya menjamin urutan **di dalam satu partisi**.

Karena itu kunci pesan penting. Pesan dengan kunci `pesanan-42` selalu masuk partisi yang sama, jadi semua kejadian untuk pesanan itu diproses berurutan. Pesan tanpa kunci disebar bergiliran, dan urutannya tidak bisa diandalkan.

Praktisnya: **kalau urutan penting, beri kunci.** Kalau tidak, biarkan tanpa kunci supaya bebannya merata.

### Konsumen berkelompok

Konsumen yang memakai `group.id` sama membentuk satu grup dan membagi partisi di antara mereka.

| Partisi | Konsumen dalam grup | Yang terjadi |
|---|---|---|
| 3 | 3 | Ideal — satu partisi per konsumen |
| 3 | 6 | 3 menganggur |
| 3 | 1 | Satu konsumen mengerjakan semuanya |
| 6 | 3 | Satu konsumen memegang 2 partisi |

Aturan keras: **satu partisi hanya dibaca satu konsumen per grup.** Itu yang mencegah pemrosesan ganda.

Grup berbeda mendapat salinan penuh — itulah cara dua layanan berbeda sama-sama membaca aliran yang sama.

### Lag: satu angka yang paling berguna

```
lag = offset terakhir produsen − offset terakhir yang dibaca konsumen
```

Lag 0 berarti konsumen sudah menyusul. Lag yang terus naik berarti pemrosesan ketinggalan.

Angka ini lebih berguna daripada "konsumen hidup" atau "tidak ada error", karena ia menunjukkan seberapa jauh ketertinggalan, bukan hanya apakah sistemnya menyala.

## Lapis 2

### Kafka lokal untuk belajar

```yaml
services:
  kafka:
    image: apache/kafka:3.9.0
    container_name: kafka
    ports:
      - "9092:9092"
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_LISTENERS: PLAINTEXT://:9092,CONTROLLER://:9093
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@localhost:9093
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
    volumes:
      - kafka-data:/var/lib/kafka/data

volumes:
  kafka-data:
```

Ini mode **KRaft**: Kafka mengelola metadatanya sendiri, tanpa ZooKeeper. Sejak versi 3.3 ini cara yang dianjurkan; ZooKeeper sudah dihapus di 4.0.

`ADVERTISED_LISTENERS` adalah sumber kebingungan paling umum. Broker memberi tahu klien alamat mana yang harus dihubungi. Kalau nilainya `kafka:9092` padahal klien berjalan di mesin host, klien akan mencoba menghubungi nama yang hanya ada di dalam jaringan Docker — dan gagal dengan pesan timeout yang tidak menjelaskan apa pun. Untuk pemakaian dari host, pakai `localhost:9092`.

### Membaca dan menulis dari terminal

```bash
# daftar topik
docker compose exec kafka kafka-topics.sh --list --bootstrap-server localhost:9092

# detail satu topik: jumlah partisi, replika, ISR
docker compose exec kafka kafka-topics.sh --describe --topic pesanan --bootstrap-server localhost:9092

# kirim dengan kunci
printf 'a:1\nb:2\n' | docker compose exec -T kafka kafka-console-producer.sh \
  --topic pesanan --property parse.key=true --property key.separator=: \
  --bootstrap-server localhost:9092

# baca dari awal, tampilkan partisi
docker compose exec kafka kafka-console-consumer.sh \
  --topic pesanan --from-beginning \
  --property print.key=true --property print.partition=true \
  --bootstrap-server localhost:9092 --timeout-ms 5000
```

`--from-beginning` membaca dari offset 0. Tanpa itu, konsumen memakai posisi terakhir yang tersimpan — yang sering membuat orang mengira pesannya hilang padahal sudah dibaca sebelumnya.

### Produsen dengan kunci (Go, saracen/kafka-go)

```go
package main

import (
	"context"
	"log"
	"time"

	"github.com/segmentio/kafka-go"
)

func main() {
	w := &kafka.Writer{
		Addr:         kafka.TCP("localhost:9092"),
		Topic:        "pesanan",
		Balancer:     &kafka.Hash{},  // ← hash kunci, bukan round-robin
		RequiredAcks: kafka.RequireAll, // ← tunggu semua replika
		Async:        false,
	}
	defer w.Close()

	for _, id := range []string{"pesanan-42", "pesanan-43"} {
		err := w.WriteMessages(context.Background(), kafka.Message{
			Key:   []byte(id),  // ← kunci: menentukan partisi & urutan
			Value: []byte(`{"status":"dibuat"}`),
		})
		if err != nil {
			log.Fatalf("gagal kirim: %v", err)
		}
	}
	log.Println("terkirim")
}
```

Tiga pilihan yang menentukan perilaku:

**`Balancer: &kafka.Hash{}`** — tanpa ini, hash setiap pesan dihitung berbeda dan pesan berkunci sama bisa berpindah partisi. Kunci menjadi tidak berguna.

**`RequiredAcks: kafka.RequireAll`** — produsen menunggu sampai semua replika menerima. Lebih lambat, tapi pesan tidak hilang kalau broker utama mati tepat setelah menulis. Untuk data yang tidak boleh hilang, ini wajib.

**`Async: false`** — mengirim satu per satu dan menunggu hasil. `Async: true` jauh lebih cepat untuk volume besar, tapi kegagalan hanya muncul di callback; kalau callback-nya diabaikan, pesan hilang tanpa jejak.

### Konsumen dengan commit manual

```go
func konsumsi() {
	r := kafka.NewReader(kafka.ReaderConfig{
		Brokers:  []string{"localhost:9092"},
		Topic:    "pesanan",
		GroupID:  "pemroses-pesanan",
		MinBytes: 1,
		MaxBytes: 10e6,
	})
	defer r.Close()

	for {
		m, err := r.FetchMessage(context.Background())
		if err != nil {
			log.Printf("fetch gagal: %v", err)
			return
		}

		if err := proses(m.Value); err != nil {
			log.Printf("proses gagal, offset TIDAK dicommit: %v", err)
			continue // ← pesan ini akan dibaca ulang
		}

		if err := r.CommitMessages(context.Background(), m); err != nil {
			log.Printf("commit gagal: %v", err)
		}
	}
}
```

Pola `FetchMessage` → proses → `CommitMessages` memberi **at-least-once**: pesan diproses minimal sekali, bisa lebih kalau gagal di tengah. Itu pilihan sadar — lebih baik memproses dua kali daripada kehilangan satu.

Konsekuensinya: **prosesmu harus idempoten.** Menyimpan pesanan harus memakai `INSERT ... ON CONFLICT DO NOTHING` dengan id dari pesan, bukan `INSERT` biasa yang membuat duplikat saat pesan dibaca ulang.

Kalau `CommitMessages` dipanggil otomatis setelah fetch (mode default banyak pustaka), kamu mendapat **at-most-once**: cepat, tapi pesan yang gagal diproses hilang saat commit sudah terlanjur.

### Kapan Kafka berlebihan

Kafka menambah satu sistem yang harus dijalankan, dipantau, dan dicadangkan. Untuk:

- Satu layanan dengan satu pekerjaan terjadwal → cron atau antrean sederhana cukup.
- Tugas dengan volume rendah dan tidak butuh riwayat → database dengan tabel antrean cukup.
- Komunikasi dua layanan yang selalu hidup → panggilan HTTP dengan retry cukup.

Kafka masuk akal ketika: beberapa konsumen independen butuh aliran yang sama, butuh riwayat yang bisa dibaca ulang, atau butuh menahan puncak beban tanpa kehilangan data.

### Daftar periksa

1. Jumlah partisi dipilih berdasarkan paralelisme yang dibutuhkan, bukan angka default.
2. Pesan yang urutannya penting diberi kunci.
3. Produsen memakai `Hash` balancer bila memakai kunci.
4. Untuk data yang tidak boleh hilang: `RequireAll` dan `Async: false`.
5. Konsumen memproses **lalu** commit, bukan sebaliknya.
6. Pemrosesan idempoten — pesan bisa datang lebih dari sekali.
7. Lag dipantau per partisi, bukan hanya "konsumen hidup".
8. `ADVERTISED_LISTENERS` disesuaikan dengan tempat klien berjalan.
