---
track: ai-llm
nomor: 7
judul: "Prompt: instruksi yang bisa diuji, bukan yang terdengar bagus"
slug: prompt
estimasi_menit: 12
prasyarat: ["ai-llm/apa-itu-llm", "ai-llm/token-dan-konteks"]
latihan:
  - id: ai-llm-07-latihan-1
    jenis: web
    bahasa: python
    soal: "Susun prompt dari bagian-bagiannya. Diberi daftar bagian (peran, tugas, batasan, format), gabungkan menjadi satu string dengan pemisah baris kosong, lalu cetak jumlah karakter dan jumlah baris."
    kode_awal: |
      bagian = [
          "PERAN: kamu asisten teknis untuk pengembang pemula.",
          "TUGAS: jelaskan satu istilah dalam dua kalimat.",
          "BATASAN: jangan memakai istilah lain yang belum dijelaskan.",
          "FORMAT: dua kalimat, tanpa bullet.",
      ]

      # gabungkan bagian dengan "\n\n", lalu cetak:
      # baris 1: jumlah karakter
      # baris 2: jumlah baris (baris kosong ikut dihitung)
    output_harapan: |
      197
      7
    solusi: |
      bagian = [
          "PERAN: kamu asisten teknis untuk pengembang pemula.",
          "TUGAS: jelaskan satu istilah dalam dua kalimat.",
          "BATASAN: jangan memakai istilah lain yang belum dijelaskan.",
          "FORMAT: dua kalimat, tanpa bullet.",
      ]

      prompt = "\n\n".join(bagian)
      print(len(prompt))
      print(len(prompt.split("\n")))
    catatan_solusi: "Empat bagian digabung dengan pemisah dua baris baru menghasilkan 3 pemisah, jadi total 4 + 3 = 7 baris. Karakter dihitung termasuk tanda baca dan spasi — inilah yang dibayar sebagai token, bukan jumlah kata."
  - id: ai-llm-07-latihan-2
    jenis: laptop
    soal: "Buat berkas prompt sebagai template dengan placeholder, isi placeholder-nya dari kode, lalu uji bahwa tidak ada placeholder yang tertinggal. Ini cara menyimpan prompt di repositori: prompt adalah kode, bukan teks yang diketik ulang tiap kali."
    kebutuhan:
      - "Python 3.10 atau lebih baru"
      - "Terminal (git-bash / PowerShell)"
    langkah:
      - perintah: "mkdir prompt-lokal && cd prompt-lokal"
        penjelasan: "Folder kerja terpisah supaya berkas latihan tidak tercampur proyek lain."
      - perintah: "python -c \"open('prompt.txt','w').write('Kamu analis data. Jawab dalam {bahasa}. Maksimal {kata} kata. Pertanyaan: {tanya}')\""
        penjelasan: "Menyimpan template prompt dengan tiga placeholder. Perintah ini tidak mencetak apa pun bila berhasil."
      - perintah: "python -c \"t=open('prompt.txt').read(); print(t.format(bahasa='Bahasa Indonesia', kata=50, tanya='Apa itu embedding?'))\""
        penjelasan: "str.format mengisi semua placeholder. Hasilnya prompt utuh yang siap dikirim."
      - perintah: "python -c \"t=open('prompt.txt').read(); import re; sisa=re.findall(r'\\{[a-z]+\\}', t.format(bahasa='Indonesia', kata=50, tanya='x')); print('sisa:', sisa)\""
        penjelasan: "Memeriksa apakah masih ada {placeholder} yang belum terisi. Output 'sisa: []' berarti bersih."
      - perintah: "python -c \"t=open('prompt.txt').read(); print(t.format(bahasa='Indonesia'))\""
        penjelasan: "Sengaja mengisi satu placeholder saja. Perintah ini HARUS gagal — itu buktinya placeholder yang kurang langsung terdeteksi, bukan diam-diam lolos."
    hasil: |
      Kamu analis data. Jawab dalam Bahasa Indonesia. Maksimal 50 kata. Pertanyaan: Apa itu embedding?
      sisa: []
      KeyError: 'kata'
    cek_berhasil:
      - "Baris pertama: prompt utuh tanpa tanda { } tersisa"
      - "Baris kedua: sisa: [] — tidak ada placeholder tertinggal"
      - "Baris ketiga: KeyError menyebut nama placeholder yang kurang (kata)"
    kalau_gagal:
      - error: "KeyError: 'kata'"
        arti: "Ini hasil yang DIHARAPKAN di langkah 5. Kalau muncul di langkah 3, berarti ada placeholder yang belum diisi."
        perbaikan:
          - "Pastikan langkah 3 mengisi ketiga nama: bahasa, kata, tanya"
      - error: "IndexError: Replacement index 0 out of range"
        arti: "Template memakai {} kosong, bukan {nama}."
        perbaikan:
          - "Ganti {} menjadi {nama} supaya urutan tidak menentukan hasil"
      - error: "SyntaxError: f-string: expecting '}'"
        arti: "Kutip di dalam perintah bentrok dengan kutip shell."
        perbaikan:
          - "Jalankan di git-bash seperti contoh, atau tulis ke prompt.py lalu python prompt.py"
    buktikan:
      perubahan: "Tambahkan placeholder keempat {gaya} di akhir template, lalu ulangi langkah 4 tanpa mengisinya."
      hasil_diharapkan: "Output berubah dari 'sisa: []' menjadi \"sisa: ['{gaya}']\" — pemeriksa menangkap placeholder yang lupa diisi."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa prompt sebaiknya disimpan sebagai berkas di repositori, bukan diketik langsung di kode?"
    opsi:
      a: "Supaya lebih cepat dieksekusi"
      b: "Supaya perubahannya bisa ditinjau, diuji, dan dikembalikan seperti kode lain"
      c: "Supaya model membacanya lebih cepat"
      d: "Supaya tidak dihitung sebagai token"
    jawaban: b
    penjelasan: "Prompt menentukan perilaku produk sama seperti logika kode. Disimpan di berkas, perubahannya masuk riwayat git, bisa ditinjau sebelum dirilis, dan bisa dikembalikan kalau hasilnya memburuk. Diketik langsung di kode, perubahan prompt tidak terlihat di diff yang rapi dan tidak bisa diuji."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Model sering mengabaikan batasan 'maksimal 100 kata'. Perbaikan mana yang paling mungkin berhasil lebih dulu?"
    opsi:
      a: "Tulis batasannya dengan huruf kapital semua"
      b: "Pindahkan batasan ke akhir prompt, dekat dengan pertanyaan, dan sebutkan cara memeriksanya"
      c: "Naikkan temperature"
      d: "Ulangi kalimat batasan lima kali"
    jawaban: b
    penjelasan: "Model cenderung lebih patuh pada instruksi yang dekat dengan bagian yang diproses terakhir. Menaruh batasan tepat sebelum pertanyaan, ditambah cara memeriksa ('hitung kata sebelum menjawab'), jauh lebih efektif daripada menaikkan nada atau mengulang. Kapital berlebihan tidak menambah kepatuhan."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Teknik memberi contoh beberapa pasangan masukan-keluaran di dalam prompt supaya model meniru polanya disebut apa? (dua kata, bahasa Inggris)"
    jawaban: "few shot"
    penjelasan: "Few-shot prompting menaruh 2–5 contoh sebelum pertanyaan sebenarnya. Model meniru pola contoh itu — termasuk panjang, nada, dan formatnya. Efektif untuk format keluaran yang sulit dijelaskan dengan kata, tapi memakan token: tiap contoh ikut dibayar di setiap permintaan."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Kamu mengubah satu kalimat di prompt dan hasilnya membaik untuk satu kasus. Apa langkah berikutnya yang benar?"
    opsi:
      a: "Langsung rilis, hasilnya sudah lebih baik"
      b: "Uji ulang pada kumpulan kasus yang sama seperti sebelumnya, lalu bandingkan jumlah yang benar"
      c: "Tambahkan lebih banyak perubahan sekaligus supaya lebih cepat"
      d: "Hapus kasus yang hasilnya memburuk"
    jawaban: b
    penjelasan: "Satu kasus membaik tidak membuktikan prompt lebih baik — bisa jadi kasus lain justru rusak. Tanpa kumpulan uji tetap dan pembandingan angka, setiap perubahan prompt hanya tebakan. Mengubah beberapa hal sekaligus juga membuat penyebab perbaikan tidak diketahui."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Kalau prompt 400 token dikirim 10.000 kali, berapa total token masukan yang dibayar? (tulis angkanya saja)"
    jawaban: "4000000"
    penjelasan: "400 × 10.000 = 4.000.000 token. Prompt yang tampak 'cuma panjang sedikit' menjadi biaya besar saat dikalikan jumlah permintaan — alasan lain untuk memangkas contoh dan instruksi yang tidak terbukti berpengaruh."
    tingkat: dasar
---

## Lapis 1

### Prompt bukan mantra

Kebanyakan orang memperlakukan prompt seperti mantra: coba-coba sampai hasilnya kelihatan bagus, lalu disimpan. Cara itu tidak bisa dipertahankan, karena kamu tidak tahu **kenapa** hasilnya bagus dan tidak akan tahu kalau suatu hari hasilnya memburuk.

Cara yang bisa dipertahankan sederhana: perlakukan prompt sebagai **kode**.

- Disimpan di berkas, masuk riwayat git.
- Punya bagian yang jelas: peran, tugas, batasan, format.
- Diuji pada kumpulan kasus yang tetap, bukan pada satu contoh yang kebetulan kamu suka.

### Empat bagian yang selalu ada

Prompt yang bekerja hampir selalu memuat empat hal, dalam urutan ini:

1. **Peran** — model harus bersikap sebagai apa. Satu kalimat cukup. "Kamu asisten teknis untuk pengembang pemula."
2. **Tugas** — apa yang harus dihasilkan. Kata kerja yang jelas: jelaskan, ringkas, klasifikasikan, tulis.
3. **Batasan** — apa yang tidak boleh. Panjang maksimal, istilah yang dilarang, sumber yang harus dipakai.
4. **Format** — bentuk keluarannya. Dua kalimat, JSON dengan kunci tertentu, tabel tiga kolom.

Kalau hasilnya tidak konsisten, biasanya salah satu dari empat ini hilang. Model mengisi kekosongan dengan tebakan — dan tebakan berbeda tiap kali.

### Taruh yang paling penting di dekat akhir

Model memproses prompt secara berurutan. Instruksi yang berada dekat dengan bagian yang harus dikerjakan lebih sering dipatuhi daripada instruksi yang terkubur di tengah paragraf panjang.

Praktisnya: batasan dan format ditulis **setelah** konteks, tepat sebelum pertanyaan sebenarnya.

### Contoh mengalahkan penjelasan

Kalau kamu kesulitan menjelaskan format keluaran dengan kata-kata, tunjukkan dua atau tiga contoh. Ini disebut *few-shot*.

```
Ubah kalimat ini menjadi tiket bug.

Contoh 1:
Masuk: "tombol simpan tidak jalan kalau nama kosong"
Keluar: {"judul": "Tombol simpan gagal saat nama kosong", "tingkat": "tinggi"}

Contoh 2:
Masuk: "halaman lambat sekali sejak pagi"
Keluar: {"judul": "Halaman lambat sejak pagi", "tingkat": "sedang"}

Sekarang:
Masuk: "grafik tidak muncul di hp"
Keluar:
```

Harganya: setiap contoh ikut dibayar sebagai token **di setiap permintaan**. Dua contoh pendek biasanya cukup; sepuluh contoh jarang sepadan.

### Menguji prompt, bukan mengagumi prompt

Kumpulkan 20–50 masukan nyata. Untuk masing-masing, tulis jawaban yang kamu anggap benar. Simpan sebagai berkas. Setiap kali prompt berubah, jalankan ulang seluruh kumpulan itu dan catat berapa yang benar.

Tanpa angka ini, "prompt-nya sudah bagus" hanya perasaan. Dengan angka, kamu bisa bilang: versi lama 34/50, versi baru 41/50 — dan tahu perubahannya benar-benar membantu.

### Tiga kesalahan yang paling sering

**Menumpuk semua saran.** Prompt jadi 800 token berisi dua belas aturan, sebagian saling bertentangan. Model bingung, hasilnya justru lebih buruk daripada prompt pendek. Aturan yang tidak terbukti memperbaiki angka sebaiknya dihapus.

**Mengubah lima hal sekaligus.** Hasil membaik, tapi kamu tidak tahu mana yang bekerja — dan salah satunya mungkin merugikan tanpa terlihat. Ubah satu hal, ukur, ulangi.

**Menguji pada kasus yang sudah kamu lihat.** Kamu tanpa sadar menyesuaikan prompt agar lolos kasus itu. Sisakan sebagian kasus yang tidak dipakai saat menyetel, dan uji di situ.

## Lapis 2

### Temperature, top_p, dan kenapa hasilnya berubah-ubah

Model tidak memilih kata paling mungkin secara mutlak; ia memilih dari sebaran peluang. Dua parameter mengatur seberapa liar pilihannya.

| Parameter | Rentang | Efek | Kapan dipakai |
|---|---|---|---|
| `temperature` | 0 – 2 | 0 = hampir selalu pilih yang paling mungkin; 1+ = makin beragam | 0–0.3 untuk klasifikasi, ekstraksi, kode; 0.7–1 untuk menulis kreatif |
| `top_p` | 0 – 1 | Batasi pilihan ke sejumlah token teratas yang peluangnya berjumlah p | Biasanya 1.0; turunkan hanya kalau perlu sangat konsisten |
| `top_k` | 1 – n | Hanya n token teratas yang dipertimbangkan | Jarang perlu diubah |

Aturan praktis: **atur salah satu, jangan dua-duanya**. Mengubah `temperature` dan `top_p` bersamaan membuat efeknya tidak bisa dipisahkan saat hasilnya aneh.

`temperature: 0` **tidak menjamin** keluaran identik. Penyedia tetap bisa memberi hasil berbeda karena pembulatan angka desimal di GPU, urutan penjumlahan yang tidak tetap, dan versi model yang berganti di balik nama yang sama. Untuk tugas yang butuh hasil persis sama (misalnya uji otomatis), jangan bergantung pada itu — uji **bentuk** keluarannya, bukan teks persisnya.

### Struktur prompt yang bisa diuji

Pisahkan prompt menjadi bagian yang bisa diperiksa sendiri-sendiri:

```python
BAGIAN = {
    "peran": "Kamu asisten teknis untuk pengembang pemula.",
    "tugas": "Jelaskan satu istilah dalam dua kalimat.",
    "batasan": [
        "Jangan memakai istilah lain yang belum dijelaskan.",
        "Jangan mengarang angka atau nama pustaka.",
    ],
    "format": "Dua kalimat, tanpa bullet, tanpa judul.",
}

def susun(pertanyaan: str) -> str:
    return (
        BAGIAN["peran"] + "\n\n"
        + BAGIAN["tugas"] + "\n\n"
        + "BATASAN:\n" + "\n".join(f"- {b}" for b in BAGIAN["batasan"]) + "\n\n"
        + BAGIAN["format"] + "\n\n"
        + f"ISTILAH: {pertanyaan}"
    )
```

Keuntungannya: kamu bisa menguji satu bagian tanpa menyentuh yang lain. Menambah satu batasan tidak menggeser peran dan format, jadi perbandingan antarversi tetap masuk akal.

### Batasan yang benar-benar dipatuhi

Batasan yang samar tidak dipatuhi. Bandingkan:

| Samar | Bisa diperiksa |
|---|---|
| "Jawab singkat" | "Maksimal 40 kata" |
| "Jangan terlalu teknis" | "Setiap istilah teknis harus diikuti penjelasan dalam tanda kurung" |
| "Pakai bahasa Indonesia yang baik" | "Bahasa Indonesia baku, tanpa kata asing kecuali nama produk" |
| "Jangan mengarang" | "Kalau dokumen tidak memuat jawabannya, tulis: TIDAK ADA DI DOKUMEN" |

Yang kanan punya ciri sama: **bisa diperiksa secara mekanis**. Kalau kamu tidak bisa memeriksanya dengan skrip, model juga tidak bisa mematuhinya dengan konsisten.

Batasan terakhir — jalan keluar eksplisit — adalah yang paling sering dilupakan dan paling mahal akibatnya. Tanpa itu, model yang tidak menemukan jawaban akan mengarang, karena mengarang selalu lebih mudah daripada menolak.

### Format keluaran: JSON dan jebakannya

Meminta JSON adalah cara paling umum membuat keluaran bisa diproses program. Tiga hal yang harus disiapkan:

**1. Model membungkus JSON dalam pagar kode.**

```
```json
{"judul": "...", "tingkat": "tinggi"}
```
```

Kalau kamu `json.loads()` langsung, ini gagal. Bersihkan pagar dulu:

```python
import json, re

def ambil_json(teks: str) -> dict:
    teks = teks.strip()
    # buang pagar ```json ... ```
    teks = re.sub(r"^```(?:json)?\s*|\s*```$", "", teks, flags=re.M).strip()
    return json.loads(teks)
```

**2. Model menambahkan kalimat pembuka.**

"Tentu, berikut hasilnya:" sebelum JSON. Cara paling andal: minta JSON **saja** tanpa kalimat lain, dan tetap tangani kegagalan.

**3. Kunci hilang atau tipe salah.**

`"tingkat": 3` padahal kamu mengharapkan `"tinggi"`. Validasi setelah parsing — jangan percaya bentuknya:

```python
def validasi(d: dict) -> dict:
    if not isinstance(d.get("judul"), str) or not d["judul"].strip():
        raise ValueError("judul kosong atau bukan string")
    if d.get("tingkat") not in {"rendah", "sedang", "tinggi"}:
        raise ValueError(f"tingkat tidak dikenal: {d.get('tingkat')!r}")
    return {"judul": d["judul"].strip(), "tingkat": d["tingkat"]}
```

Kalau penyedia mendukung *structured output* atau *JSON mode*, pakai itu — ia menjamin bentuknya di tingkat API, jadi tidak perlu membersihkan teks. Tetap validasi isinya; bentuk benar tidak berarti nilai benar.

### Mengukur prompt: kumpulan uji

Bentuk paling sederhana yang berguna: satu berkas JSON berisi kasus dan jawaban yang diharapkan.

```json
[
  {"masuk": "tombol simpan tidak jalan kalau nama kosong",
   "harap": {"tingkat": "tinggi"}},
  {"masuk": "warna tombol agak beda dengan desain",
   "harap": {"tingkat": "rendah"}}
]
```

Lalu skrip yang menjalankan semuanya dan mencetak satu angka:

```python
benar = 0
for kasus in kumpulan:
    hasil = panggil_model(susun(kasus["masuk"]))
    if ambil_json(hasil)["tingkat"] == kasus["harap"]["tingkat"]:
        benar += 1
print(f"{benar}/{len(kumpulan)}")
```

Yang penting bukan skripnya — itu dua puluh baris. Yang penting **kebiasaannya**: setiap perubahan prompt dijalankan pada kumpulan yang sama, dan angkanya dibandingkan.

Tiga hal yang membuat kumpulan uji ini berguna:

- **Kasusnya nyata.** Diambil dari masukan pengguna sungguhan, termasuk yang aneh. Kasus karangan hanya menguji kasus karangan.
- **Sebagian disisihkan.** Simpan 20% kasus yang tidak kamu lihat saat menyetel prompt. Kalau angka di bagian itu juga naik, perbaikanmu nyata. Kalau hanya bagian yang kamu lihat yang naik, kamu sedang menghafal.
- **Dijalankan otomatis.** Kalau harus dijalankan manual, ia akan ditinggalkan setelah minggu kedua.

### Biaya prompt yang tidak terlihat

Setiap permintaan membayar **seluruh** prompt, bukan hanya bagian yang berubah. Prompt 400 token yang dikirim 10.000 kali sehari = 4 juta token masukan per hari, hanya untuk instruksi yang sama.

Yang biasanya bisa dipangkas tanpa menurunkan mutu:

- Contoh few-shot yang tidak terbukti berpengaruh (uji dengan dan tanpa; kalau angkanya sama, buang).
- Aturan yang tumpang tindih — dua kalimat yang maksudnya sama hanya menambah token.
- Riwayat percakapan yang dikirim ulang utuh padahal hanya tiga pesan terakhir yang relevan.

Cara memeriksanya: cetak `len(prompt)` untuk setiap permintaan selama satu hari, lalu lihat bagian mana yang paling besar. Biasanya mengejutkan.

### Daftar periksa sebelum prompt dipakai produksi

1. Empat bagian ada: peran, tugas, batasan, format.
2. Setiap batasan bisa diperiksa secara mekanis.
3. Ada jalan keluar eksplisit untuk "tidak tahu".
4. Format keluaran divalidasi setelah parsing, bukan dipercaya.
5. Kumpulan uji 20+ kasus nyata ada, dengan sebagian disisihkan.
6. Angka sebelum dan sesudah setiap perubahan dicatat.
7. `temperature` disetel sesuai tugas, bukan dibiarkan default tanpa alasan.
8. Ukuran prompt diukur, dan bagian yang tidak terbukti berguna sudah dibuang.
