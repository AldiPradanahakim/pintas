---
track: ai-llm
nomor: 10
judul: "Agent: model yang memilih langkah, kodemu yang menjaga batas"
slug: agent
estimasi_menit: 13
prasyarat: ["ai-llm/function-calling", "ai-llm/evaluasi"]
latihan:
  - id: ai-llm-10-latihan-1
    jenis: web
    bahasa: python
    soal: "Jalankan satu loop agent dengan tiga penjaga: batas putaran, deteksi langkah berulang, dan deteksi langkah selesai. Cetak satu baris hasil untuk tiap jejak di bawah."
    kode_awal: |
      MAKS = 5

      jejak_1 = [("cari", "harga kabel"), ("baca", "dok-1"), ("selesai", "Rp 45.000")]
      jejak_2 = [("cari", "harga kabel"), ("baca", "dok-1"), ("baca", "dok-1")]
      jejak_3 = [("cari", "a"), ("baca", "b"), ("cari", "c"), ("baca", "d"), ("cari", "e"), ("baca", "f")]

      # untuk tiap jejak cetak satu baris:
      #   selesai di putaran N: <hasil>
      #   berulang di putaran N: <alat>(<arg>)
      #   batas 5 putaran tercapai
    output_harapan: |
      selesai di putaran 3: Rp 45.000
      berulang di putaran 3: baca(dok-1)
      batas 5 putaran tercapai
    solusi: |
      MAKS = 5

      jejak_1 = [("cari", "harga kabel"), ("baca", "dok-1"), ("selesai", "Rp 45.000")]
      jejak_2 = [("cari", "harga kabel"), ("baca", "dok-1"), ("baca", "dok-1")]
      jejak_3 = [("cari", "a"), ("baca", "b"), ("cari", "c"), ("baca", "d"), ("cari", "e"), ("baca", "f")]

      def jalankan(jejak):
          terlihat = set()
          for i, (alat, arg) in enumerate(jejak, 1):
              if i > MAKS:
                  return f"batas {MAKS} putaran tercapai"
              if alat == "selesai":
                  return f"selesai di putaran {i}: {arg}"
              if (alat, arg) in terlihat:
                  return f"berulang di putaran {i}: {alat}({arg})"
              terlihat.add((alat, arg))
          return f"batas {MAKS} putaran tercapai"

      for j in (jejak_1, jejak_2, jejak_3):
          print(jalankan(j))
    catatan_solusi: "jejak_2 gagal di putaran 3 karena baca(dok-1) sudah pernah dijalankan di putaran 2 — hasilnya pasti sama, jadi mengulanginya hanya membuang waktu dan token. jejak_3 punya 6 langkah berbeda semua, jadi tidak terdeteksi berulang; yang menghentikannya adalah batas putaran. Dua penjaga ini menangkap masalah berbeda: yang satu mendeteksi lingkaran, yang lain mendeteksi kerja tanpa akhir."
  - id: ai-llm-10-latihan-2
    jenis: laptop
    soal: "Buat log langkah agent sebagai JSON Lines — satu baris JSON per langkah. Format ini dipilih karena bisa ditambahi tanpa membaca ulang seluruh berkas, dan tiap baris bisa diproses sendiri."
    kebutuhan:
      - "Python 3.10 atau lebih baru"
      - "Terminal (git-bash / PowerShell)"
    langkah:
      - perintah: "mkdir agent-lokal && cd agent-lokal"
        penjelasan: "Folder kerja terpisah supaya berkas latihan tidak tercampur."
      - perintah: "python -c \"import json; f=open('log.jsonl','a'); [f.write(json.dumps({'putaran':i,'alat':a,'arg':b,'ms':m}, ensure_ascii=False)+chr(10)) for i,(a,b,m) in enumerate([('cari','kabel',120),('baca','dok-1',45),('selesai','Rp 45.000',0)],1)]; f.close()\""
        penjelasan: "Menulis tiga baris JSON, satu per langkah. chr(10) dipakai sebagai baris baru karena \\n di dalam python -c bisa terurai oleh shell."
      - perintah: "python -c \"import json; [print(json.loads(b)['alat']) for b in open('log.jsonl')]\""
        penjelasan: "Membaca kembali log. Tiap baris berdiri sendiri — bisa diproses tanpa memuat seluruh berkas ke memori."
      - perintah: "python -c \"import json; t=sum(json.loads(b)['ms'] for b in open('log.jsonl')); print(t)\""
        penjelasan: "Menjumlahkan durasi seluruh langkah. Output 165 — angka yang dipakai untuk tahu di mana waktu habis."
      - perintah: "python -c \"import json; b=[json.loads(x) for x in open('log.jsonl')]; print(max(b, key=lambda d: d['ms'])['alat'])\""
        penjelasan: "Mencari langkah terlama. Output cari — di sinilah optimasi pertama harus diarahkan, bukan di langkah yang paling sering dipanggil."
    hasil: |
      cari
      baca
      selesai
      165
      cari
    cek_berhasil:
      - "Langkah 3 mencetak tiga nama alat, satu per baris"
      - "Langkah 4 mencetak 165 (120 + 45 + 0)"
      - "Langkah 5 mencetak cari — langkah dengan durasi terbesar"
    kalau_gagal:
      - error: "FileNotFoundError: [Errno 2] No such file or directory: 'log.jsonl'"
        arti: "Berkas dibuat di folder lain, atau terminal tidak berada di agent-lokal."
        perbaikan:
          - "Pastikan sudah cd agent-lokal sebelum langkah 2"
      - error: "json.decoder.JSONDecodeError: Expecting value: line 1 column 1"
        arti: "Ada baris kosong di akhir berkas. Iterasi open() ikut membaca baris kosong terakhir."
        perbaikan:
          - "Lewati baris kosong: [b for b in open('log.jsonl') if b.strip()]"
      - error: "Output hanya 'cari' satu baris, bukan tiga"
        arti: "Mode 'a' menambahkan ke berkas yang sudah ada; kalau dijalankan dua kali, isinya bertambah dan hasilnya berubah."
        perbaikan:
          - "Hapus log.jsonl lalu ulangi langkah 2"
    buktikan:
      perubahan: "Jalankan langkah 2 sekali lagi, lalu ulangi langkah 4."
      hasil_diharapkan: "Total berubah dari 165 menjadi 330 — membuktikan mode 'a' menambahkan, bukan menimpa. Inilah yang membuat log agent bisa tumbuh sepanjang hari tanpa kehilangan riwayat."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Apa perbedaan utama agent dengan satu panggilan function calling biasa?"
    opsi:
      a: "Agent memakai model yang lebih besar"
      b: "Agent mengulang siklus pilih-alat-jalankan-baca-hasil beberapa kali sampai memutuskan selesai"
      c: "Agent tidak memakai model sama sekali"
      d: "Agent selalu lebih murah"
    jawaban: b
    penjelasan: "Satu panggilan function calling berakhir setelah satu putaran: usul alat, jalankan, jawab. Agent menjadikan itu sebuah loop — hasil satu alat menjadi masukan untuk memutuskan langkah berikutnya. Karena itu agent butuh penjaga yang tidak dibutuhkan pemanggilan tunggal: batas putaran dan deteksi lingkaran."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Agent memanggil alat pencarian yang sama empat kali dengan kata kunci identik dan hasil identik. Apa yang sebenarnya terjadi?"
    opsi:
      a: "Agent sedang memverifikasi hasilnya"
      b: "Agent berputar tanpa kemajuan — harus dihentikan dan dilaporkan"
      c: "Agent butuh model yang lebih besar"
      d: "Agent sedang menghemat token"
    jawaban: b
    penjelasan: "Panggilan identik dengan hasil identik tidak menambah informasi apa pun. Model tidak punya memori tentang apa yang sudah dicoba kecuali ditulis di riwayat percakapan, jadi ia bisa mengulang tanpa sadar. Deteksi langkah berulang menghentikannya sebelum biaya menumpuk."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Format log satu baris JSON per kejadian, yang bisa ditambahi tanpa membaca ulang seluruh berkas, disebut apa? (dua kata, bahasa Inggris)"
    jawaban: "json lines"
    penjelasan: "JSON Lines (.jsonl) menulis satu objek JSON per baris. Karena tiap baris berdiri sendiri, penambahan di akhir berkas murah, dan pembacaan bisa dilakukan sepotong-sepotong. Ini format standar untuk log agent yang tumbuh terus, berbeda dari satu array JSON besar yang harus ditulis ulang seluruhnya."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa alat yang bisa menghapus data sebaiknya TIDAK diberikan ke agent tanpa persetujuan manusia?"
    opsi:
      a: "Karena terlalu lambat"
      b: "Karena agent bisa salah memahami permintaan dan akibatnya tidak bisa dibatalkan"
      c: "Karena alat hapus tidak bisa dibuat"
      d: "Karena memakan token lebih banyak"
    jawaban: b
    penjelasan: "Agent memutuskan berdasarkan teks, dan teks bisa disalahtafsirkan — oleh model, atau oleh penyerang yang menyisipkan instruksi. Membaca data yang salah bisa diulang; menghapus data yang salah tidak. Alat destruktif butuh konfirmasi manusia atau harus bisa dibatalkan (soft delete, bukan delete)."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Kalau tiap putaran agent rata-rata 1,5 detik dan agent butuh 6 putaran, berapa detik total waktu tunggu pengguna? (tulis angkanya)"
    jawaban: "9"
    penjelasan: "6 × 1,5 = 9 detik. Angka ini menjelaskan kenapa agent terasa lambat: tiap putaran adalah satu panggilan model penuh ditambah satu panggilan alat. Karena itu streaming (menampilkan kemajuan) dan batas putaran yang ketat bukan hiasan — keduanya yang membuat agent bisa dipakai."
    tingkat: dasar
---

## Lapis 1

### Agent = loop, bukan model ajaib

Istilah "agent" sering dibungkus misteri. Kenyataannya sederhana: **agent adalah loop yang memutuskan langkah berikutnya berdasarkan hasil langkah sebelumnya.**

```
pengguna bertanya
  ↓
model memilih alat + argumen
  ↓
kodemu menjalankan alat itu
  ↓
hasil dikirim balik ke model
  ↓
model memutuskan: alat lain lagi, atau jawab?
  ↓
(diulang sampai menjawab, atau sampai batas)
```

Itu saja. Tidak ada komponen rahasia. Yang membuatnya berguna adalah kemampuannya menyesuaikan langkah: kalau pencarian pertama tidak menemukan apa pun, ia bisa mengubah kata kunci atau mencari di tempat lain — tanpa kamu menuliskan aturan itu satu per satu.

Yang membuatnya berbahaya adalah hal yang sama: **kamu tidak tahu berapa langkah yang akan diambilnya.**

### Tiga penjaga yang wajib ada

Tanpa penjaga ini, agent bukan alat, tapi sumber tagihan tak terbatas.

**1. Batas putaran.** Angka tetap, misalnya 8. Saat tercapai, hentikan dan laporkan apa yang sudah dicoba. Tanpa ini, model bisa memanggil alat selamanya.

**2. Deteksi langkah berulang.** Kalau model memanggil alat yang sama dengan argumen yang sama dua kali, hasilnya pasti sama. Ia sedang berputar. Hentikan.

**3. Batas biaya/waktu.** Selain jumlah putaran, batasi total token atau total detik. Satu putaran bisa memakan 10.000 token kalau hasil alatnya panjang — batas putaran saja tidak cukup.

### Kapan agent tidak diperlukan

Sebagian besar tugas yang disebut "agent" sebenarnya cukup dengan **alur tetap**:

- Ambil dokumen → jawab. Itu RAG, bukan agent.
- Klasifikasikan → jalankan aksi. Itu satu panggilan, bukan agent.
- Cari → ringkas → selesai. Tiga langkah tetap, bisa ditulis sebagai fungsi biasa.

Agent baru masuk akal ketika **jumlah dan urutan langkahnya bergantung pada isi hasil**. Contoh: "cari tahu kenapa penjualan turun bulan ini" — jawabannya mungkin butuh tiga kueri, mungkin butuh dua belas, dan kamu tidak bisa menebak sebelumnya.

Kalau kamu bisa menuliskan alurnya sebagai diagram dengan panah yang tidak bercabang, jangan pakai agent. Lebih murah, lebih cepat, lebih mudah diuji.

### Alat yang aman diberikan ke agent

Urutkan alat berdasarkan akibatnya:

| Jenis | Contoh | Boleh otomatis? |
|---|---|---|
| Baca | cari dokumen, baca stok, ambil cuaca | Ya |
| Tulis yang bisa dibatalkan | simpan draf, tambah catatan | Ya, dengan log |
| Tulis yang sulit dibatalkan | kirim email, buat pesanan | Butuh konfirmasi |
| Hapus | hapus data, batalkan langganan | Jangan, atau soft-delete |

Aturan praktis: **kalau akibatnya tidak bisa dibatalkan dengan satu perintah, jangan biarkan agent melakukannya sendiri.**

### Yang harus dicatat di log

Agent tanpa log tidak bisa diperbaiki, karena kamu tidak tahu apa yang terjadi. Minimal, per langkah:

- Putaran ke berapa
- Alat apa, argumen apa
- Berapa lama
- Berhasil atau gagal
- Ringkasan hasil (bukan seluruh isinya)

Dengan itu, saat pengguna melapor "jawabannya aneh", kamu bisa membuka log dan melihat persis langkah mana yang salah.

## Lapis 2

### Loop dengan penjaga lengkap

```python
import time

MAKS_PUTARAN = 8
MAKS_DETIK = 30
MAKS_TOKEN = 60_000

def jalankan_agent(tanya: str, alat: dict) -> str:
    pesan = [{"peran": "pengguna", "isi": tanya}]
    sudah = set()
    mulai = time.monotonic()
    token = 0

    for putaran in range(1, MAKS_PUTARAN + 1):
        if time.monotonic() - mulai > MAKS_DETIK:
            raise RuntimeError(f"melewati {MAKS_DETIK} detik di putaran {putaran}")
        if token > MAKS_TOKEN:
            raise RuntimeError(f"melewati {MAKS_TOKEN} token")

        jawab = panggil_model(pesan, daftar_alat=alat)
        token += jawab.token_masuk + jawab.token_keluar

        if not jawab.panggilan_alat:
            return jawab.isi

        for p in jawab.panggilan_alat:
            kunci = (p.nama, tuple(sorted(p.argumen.items())))
            if kunci in sudah:
                return f"Berhenti: langkah berulang {p.nama}({p.argumen})"
            sudah.add(kunci)

            if p.nama not in alat:
                return f"Berhenti: alat tidak dikenal {p.nama}"

            hasil = jalankan_aman(alat[p.nama], p.argumen)
            pesan.append({"peran": "alat", "id_panggilan": p.id, "isi": hasil})

    return "Berhenti: batas putaran tercapai"
```

Perhatikan `tuple(sorted(...))` untuk kunci: dua dict dengan isi sama harus dianggap sama. Tanpa `sorted`, urutan kunci yang berbeda menghasilkan kunci berbeda, dan deteksi berulang gagal.

### Kenapa `jalankan_aman` dipisah

```python
def jalankan_aman(fn, argumen: dict) -> str:
    try:
        hasil = fn(**argumen)
        return ringkas(hasil)
    except Exception as e:
        # Detail teknis TIDAK dikirim ke model — bisa membocorkan struktur internal
        catat_galat(e)
        return "Alat gagal dijalankan. Coba pendekatan lain atau laporkan bahwa data tidak tersedia."
```

Tiga hal yang dilakukan fungsi ini:

1. **Tidak membocorkan detail.** Pesan error database memuat nama tabel dan potongan query. Kalau itu masuk ke model dan model meneruskannya ke pengguna, struktur internalmu bocor.
2. **Mengembalikan teks, bukan melempar exception.** Agent harus bisa bereaksi terhadap kegagalan — mencoba alat lain, atau menyimpulkan bahwa data tidak tersedia.
3. **Meringkas hasil.** Mengirim 10.000 baris ke model menghabiskan token dan mengubur informasi penting.

### Ringkasan hasil: bagian yang menentukan biaya

```python
def ringkas(hasil, maks_baris=20, maks_char=4000) -> str:
    if isinstance(hasil, list):
        potong = hasil[:maks_baris]
        teks = "\n".join(str(x) for x in potong)
        if len(hasil) > maks_baris:
            teks += f"\n… dan {len(hasil) - maks_baris} baris lagi"
        return teks[:maks_char]
    return str(hasil)[:maks_char]
```

Angka `maks_baris` dan `maks_char` adalah keputusan produk, bukan teknis. Terlalu kecil: model kehilangan informasi yang dibutuhkan. Terlalu besar: biaya meledak dan model justru bingung karena terlalu banyak konteks.

Cara menentukannya: jalankan pada kumpulan uji, lihat pada titik mana mutu jawaban berhenti membaik.

### Log JSON Lines

```python
import json, time

def catat(path, **data):
    data["waktu"] = time.strftime("%Y-%m-%dT%H:%M:%S")
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(data, ensure_ascii=False) + "\n")
```

Dipanggil per langkah:

```python
catat("agent.jsonl", putaran=putaran, alat=p.nama, arg=p.argumen,
      ms=int((time.monotonic() - t0) * 1000), ok=True, hasil=ringkas(hasil)[:200])
```

Kenapa JSON Lines, bukan satu array JSON:

- **Penambahan murah.** Satu baris ditulis di akhir, tidak perlu membaca dan menulis ulang seluruh berkas.
- **Tahan rusak.** Kalau proses mati di tengah penulisan, hanya baris terakhir yang rusak — sisanya tetap terbaca.
- **Bisa diproses sepotong.** `grep`, `jq`, atau skrip Python bisa membaca baris demi baris tanpa memuat semuanya.

### Membaca log untuk menjawab pertanyaan nyata

```python
import json

baris = [json.loads(b) for b in open("agent.jsonl") if b.strip()]

# Langkah mana yang paling banyak menghabiskan waktu?
lambat = sorted(baris, key=lambda d: -d["ms"])[:5]
for d in lambat:
    print(d["putaran"], d["alat"], d["ms"], "ms")

# Berapa persen agent berakhir karena batas putaran?
selesai = sum(1 for d in baris if d.get("alat") == "selesai")
print(f"selesai normal: {selesai}/{len(baris)}")
```

Pertanyaan kedua itu yang paling berguna. Kalau 40% eksekusi berakhir karena batas putaran, prompt alat atau deskripsi alatmu bermasalah — model tidak cukup tahu kapan harus berhenti.

### Pola yang sering muncul dan artinya

| Gejala di log | Arti | Perbaikan |
|---|---|---|
| Banyak panggilan alat yang sama | Model tidak tahu hasil sebelumnya relevan | Perjelas ringkasan hasil; sebutkan di prompt bahwa hasil sudah diberikan |
| Selalu berhenti di batas putaran | Model tidak pernah yakin cukup | Tambahkan alat `selesai` eksplisit, atau instruksi kapan berhenti |
| Satu alat memakan 80% waktu | Alat itu lambat | Cache hasil, atau turunkan cakupannya |
| Banyak "alat gagal" | Argumen sering tidak sah | Perbaiki skema dan deskripsi alat |
| Token per putaran naik terus | Riwayat tidak dipangkas | Buang hasil alat lama, sisakan ringkasannya |

### Daftar periksa

1. Ada batas putaran, batas waktu, dan batas token.
2. Ada deteksi langkah berulang dengan kunci yang ternormalisasi.
3. Alat di luar daftar langsung menghentikan eksekusi.
4. Alat destruktif butuh konfirmasi manusia atau soft-delete.
5. Pesan error internal tidak pernah masuk ke model.
6. Hasil alat selalu diringkas sebelum dikirim.
7. Setiap langkah tercatat di log JSON Lines.
8. Log cukup untuk menjawab: langkah mana yang lambat, berapa persen berakhir di batas putaran.
9. Alur yang tidak bercabang tidak dibungkus jadi agent.
