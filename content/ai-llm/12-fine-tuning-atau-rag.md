---
track: ai-llm
nomor: 12
judul: "Fine-tuning atau RAG: pilih berdasarkan gejalanya, bukan trennya"
slug: fine-tuning-atau-rag
estimasi_menit: 12
prasyarat: ["ai-llm/retrieval-dan-rag", "ai-llm/evaluasi"]
latihan:
  - id: ai-llm-12-latihan-1
    jenis: web
    bahasa: python
    soal: "Diberi tiga keluhan pengguna, tentukan perbaikannya: 'rag' kalau masalahnya pengetahuan yang tidak dimiliki model, 'fine_tuning' kalau masalahnya gaya/format yang harus selalu sama, 'prompt' kalau masalahnya instruksi yang belum jelas. Cetak satu baris per keluhan."
    kode_awal: |
      keluhan = [
          ("Model tidak tahu harga produk kami bulan ini", "rag"),
          ("Jawabannya selalu beda gaya, padahal formatnya harus persis SOP", "fine_tuning"),
          ("Model kadang lupa menyebutkan sumber", "prompt"),
          ("Model mengarang kebijakan yang tidak ada di dokumen", "rag"),
          ("Kami ingin ia selalu menjawab dalam format JSON yang sama", "fine_tuning"),
      ]

      # cetak "<keluhan> -> <perbaikan>" untuk tiap baris
    output_harapan: |
      Model tidak tahu harga produk kami bulan ini -> rag
      Jawabannya selalu beda gaya, padahal formatnya harus persis SOP -> fine_tuning
      Model kadang lupa menyebutkan sumber -> prompt
      Model mengarang kebijakan yang tidak ada di dokumen -> rag
      Kami ingin ia selalu menjawab dalam format JSON yang sama -> fine_tuning
    solusi: |
      keluhan = [
          ("Model tidak tahu harga produk kami bulan ini", "rag"),
          ("Jawabannya selalu beda gaya, padahal formatnya harus persis SOP", "fine_tuning"),
          ("Model kadang lupa menyebutkan sumber", "prompt"),
          ("Model mengarang kebijakan yang tidak ada di dokumen", "rag"),
          ("Kami ingin ia selalu menjawab dalam format JSON yang sama", "fine_tuning"),
      ]

      for teks, perbaikan in keluhan:
          print(f"{teks} -> {perbaikan}")
    catatan_solusi: "Polanya: kalau masalahnya model TIDAK TAHU sesuatu, tambahkan pengetahuannya (RAG). Kalau model TAHU tapi caranya tidak konsisten, ubah perilakunya (fine-tuning). Kalau masalahnya cuma instruksi yang kurang jelas, perbaiki prompt — ini yang paling murah dan paling sering terlewat karena orang langsung melompat ke fine-tuning."
  - id: ai-llm-12-latihan-2
    jenis: laptop
    soal: "Hitung biaya dua pendekatan dari angka nyata: RAG menambah token konteks di setiap permintaan, fine-tuning menambah biaya sekali di awal tapi tidak menambah token konteks. Tentukan pada jumlah permintaan berapa fine-tuning mulai lebih murah."
    kebutuhan:
      - "Python 3.10 atau lebih baru"
      - "Terminal (git-bash / PowerShell)"
    langkah:
      - perintah: "mkdir biaya-lokal && cd biaya-lokal"
        penjelasan: "Folder kerja terpisah supaya berkas latihan tidak tercampur."
      - perintah: "python -c \"konteks=1500; prompt=300; keluar=200; n=10000; print((konteks+prompt+keluar)*n)\""
        penjelasan: "Total token RAG untuk 10.000 permintaan. Konteks 1.500 token (potongan dokumen) ikut dibayar di SETIAP permintaan. Output 20000000."
      - perintah: "python -c \"konteks=0; prompt=300; keluar=200; n=10000; latih=3000000; print((konteks+prompt+keluar)*n + latih)\""
        penjelasan: "Total token fine-tuning: tanpa konteks di tiap permintaan, tapi ada 3.000.000 token sekali di awal untuk pelatihan. Output 8000000."
      - perintah: "python -c \"selisih_per_req=1500; latih=3000000; print(latih/selisih_per_req)\""
        penjelasan: "Titik impas: berapa permintaan yang dibutuhkan supaya penghematan 1.500 token per permintaan menutup biaya pelatihan. Output 2000.0 — di bawah 2.000 permintaan, fine-tuning lebih mahal."
      - perintah: "python -c \"for n in (500, 2000, 5000): print(n, (1500+300+200)*n, (300+200)*n+3000000)\""
        penjelasan: "Membandingkan tiga skenario. Pada 500 permintaan RAG jauh lebih murah; pada 2.000 keduanya sama; pada 5.000 fine-tuning lebih murah. Titik impas bukan soal selera, tapi aritmetika."
    hasil: |
      20000000
      8000000
      2000.0
      500 1000000 3250000
      2000 4000000 4000000
      5000 10000000 5500000
    cek_berhasil:
      - "Langkah 4 mencetak 2000.0 — titik impas"
      - "Langkah 5 baris kedua: 4000000 dan 4000000, angkanya sama persis di titik impas"
      - "Langkah 5 baris pertama: RAG lebih murah (1 juta vs 3,25 juta)"
      - "Langkah 5 baris ketiga: fine-tuning lebih murah (5,5 juta vs 10 juta)"
    kalau_gagal:
      - error: "SyntaxError: invalid syntax"
        arti: "Kutip di dalam perintah bentrok dengan kutip shell."
        perbaikan:
          - "Jalankan di git-bash seperti contoh, atau tulis ke biaya.py lalu python biaya.py"
      - error: "Hasilnya 0.0 atau angka aneh"
        arti: "Pembagian dengan nol, atau urutan operasi salah (kurung hilang)."
        perbaikan:
          - "Pastikan pembagi 1500, bukan (1500+300+200)"
    buktikan:
      perubahan: "Ubah konteks dari 1.500 menjadi 6.000 token (dokumen lebih besar), lalu ulangi langkah 4."
      hasil_diharapkan: "Titik impas turun jadi 500 — konteks yang lebih besar membuat RAG lebih mahal per permintaan, sehingga fine-tuning menang lebih cepat."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Model tidak tahu kebijakan retur yang baru berlaku bulan ini. Perbaikan mana yang paling tepat?"
    opsi:
      a: "Fine-tuning dengan 500 contoh jawaban"
      b: "RAG: masukkan dokumen kebijakan ke indeks, ambil saat menjawab"
      c: "Naikkan temperature"
      d: "Ganti ke model yang lebih besar"
    jawaban: b
    penjelasan: "Masalahnya pengetahuan yang tidak dimiliki model, bukan perilaku. RAG menambahkan pengetahuan tanpa melatih ulang apa pun — dan saat kebijakan berubah bulan depan, cukup ganti dokumen di indeks. Fine-tuning untuk fakta yang berubah berarti melatih ulang setiap kali ada perubahan."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Jawaban model selalu keluar dalam format yang sedikit berbeda, padahal harus persis mengikuti SOP. Apa yang sebaiknya dicoba paling awal?"
    opsi:
      a: "Langsung fine-tuning dengan 10.000 contoh"
      b: "Perbaiki prompt dulu dengan contoh format yang jelas dan validasi keluaran"
      c: "Ganti model"
      d: "Tambahkan lebih banyak dokumen ke RAG"
    jawaban: b
    penjelasan: "Urutan biaya dari murah ke mahal: perbaiki prompt, lalu few-shot contoh, lalu validasi dan coba ulang, baru fine-tuning. Sebagian besar masalah format selesai di langkah pertama atau kedua. Melompat ke fine-tuning membuang waktu berminggu-minggu untuk masalah yang bisa selesai dalam satu jam."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Teknik menambahkan pengetahuan baru ke sistem tanpa melatih ulang model, dengan mengambil dokumen relevan saat menjawab, disingkat apa? (tiga huruf)"
    jawaban: "rag"
    penjelasan: "RAG (Retrieval-Augmented Generation) memisahkan pengetahuan dari model: dokumen disimpan di indeks, diambil saat dibutuhkan, lalu disisipkan ke prompt. Keuntungan utamanya bukan mutu, tapi kemudahan pembaruan — ganti satu dokumen, tidak perlu melatih apa pun."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "RAG menambah 1.500 token konteks di setiap permintaan. Fine-tuning butuh 3 juta token sekali di awal. Pada 2.000 permintaan, mana yang lebih murah?"
    opsi:
      a: "RAG jauh lebih murah"
      b: "Fine-tuning jauh lebih murah"
      c: "Keduanya sama — 2.000 permintaan adalah titik impasnya"
      d: "Tidak bisa dihitung"
    jawaban: c
    penjelasan: "RAG: (1.500+300+200)×2.000 = 4.000.000 token. Fine-tuning: (300+200)×2.000 + 3.000.000 = 4.000.000 token. Sama persis. Di bawah 2.000 permintaan RAG lebih murah; di atasnya fine-tuning lebih murah — tapi itu baru biaya token, belum termasuk waktu dan kerumitan melatih ulang."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Kalau konteks RAG naik dari 1.500 menjadi 6.000 token dan biaya latih tetap 3 juta, titik impas turun menjadi berapa permintaan? (tulis angkanya)"
    jawaban: "500"
    penjelasan: "3.000.000 / 6.000 = 500. Konteks yang lebih besar membuat RAG lebih mahal per permintaan, sehingga fine-tuning menang lebih cepat. Inilah alasan memangkas chunk dan memilih top_k kecil bukan sekadar soal mutu — ia langsung menentukan biaya per permintaan."
    tingkat: lanjutan
---

## Lapis 1

### Dua masalah yang berbeda

Pertanyaan "pakai RAG atau fine-tuning?" tidak bisa dijawab tanpa tahu masalahnya. Keduanya memperbaiki hal yang berbeda:

| Masalah | Yang kurang | Perbaikan |
|---|---|---|
| Model tidak tahu kebijakan/harga/dokumen kita | **Pengetahuan** | RAG |
| Model tahu, tapi gayanya tidak konsisten | **Perilaku** | Fine-tuning |
| Model salah paham tugasnya | **Instruksi** | Perbaiki prompt |
| Model terlalu lambat atau mahal | **Efisiensi** | Model lebih kecil, cache, potong konteks |

Menggunakan fine-tuning untuk masalah pengetahuan adalah kesalahan paling umum dan paling mahal. Kamu melatih model menghafal fakta yang akan berubah bulan depan, lalu harus melatih ulang setiap kali ada perubahan.

Menggunakan RAG untuk masalah gaya juga salah. Menyisipkan 2.000 token contoh format di setiap permintaan jauh lebih mahal daripada melatih model sekali untuk mengikuti format itu.

### Urutan percobaan, dari murah ke mahal

1. **Perbaiki prompt.** Gratis, selesai dalam menit. Sebagian besar masalah berhenti di sini.
2. **Tambah contoh di prompt (few-shot).** Murah, selesai dalam jam. Menambah token per permintaan, tapi tidak butuh pelatihan.
3. **Tambah RAG.** Kalau masalahnya pengetahuan. Butuh indeks dan pipeline, tapi tidak melatih model.
4. **Validasi keluaran + coba ulang.** Kalau masalahnya format. Skrip 20 baris sering lebih efektif daripada pelatihan.
5. **Fine-tuning.** Terakhir, setelah empat langkah di atas terbukti tidak cukup.

Melompat ke langkah 5 adalah pola yang mahal: berminggu-minggu kerja untuk masalah yang bisa selesai dengan satu jam memperbaiki prompt.

### Yang sebenarnya dilakukan fine-tuning

Fine-tuning tidak "menambahkan pengetahuan". Ia mengubah **kecenderungan** model dalam merespons: gaya, format, panjang, nada, dan pola jawaban.

Fakta yang dipelajari saat fine-tuning cenderung:
- Melekat pada pola permukaan, bukan pemahaman.
- Menjadi usang tanpa tanda apa pun saat dunia berubah.
- Sulit dikoreksi — memperbaiki satu fakta berarti melatih ulang.

Karena itu fine-tuning cocok untuk hal yang **stabil**: gaya penulisan perusahaan, format keluaran yang ketat, kosakata domain yang tidak berubah, atau tugas sempit yang berulang.

### Pola yang sering dipakai: keduanya

Bukan pilihan salah satu. Pola yang umum di produksi:

```
RAG  → memberi model fakta yang benar dan terbaru
FT   → mengajari model cara memakai fakta itu (format, gaya, kapan menolak)
```

Contoh: asisten hukum. RAG memasok pasal dan putusan yang relevan. Fine-tuning mengajari model menulis jawaban dengan struktur "Dasar hukum → Analisis → Kesimpulan" dan menolak menjawab kalau tidak ada dasar hukum yang ditemukan.

### Cara memutuskan tanpa menebak

Ukur dulu dengan kumpulan uji:

1. Jalankan kasus uji dengan prompt sekarang. Catat skornya.
2. Perbaiki prompt, jalankan lagi. Naik berapa?
3. Tambah RAG, jalankan lagi. Naik berapa?
4. Kalau setelah ketiganya masih kurang, dan kegagalannya **berpola sama** (selalu soal format/gaya), baru pertimbangkan fine-tuning.

Kalau kegagalannya acak dan beragam, fine-tuning tidak akan menolong — yang kurang adalah pengetahuan atau instruksi.

## Lapis 2

### Aritmetika biaya, bukan perasaan

Dua model biaya yang berbeda bentuk:

**RAG** — biaya per permintaan, sebanding dengan ukuran konteks:

```
biaya = (token_konteks + token_prompt + token_keluar) × jumlah_permintaan × harga
```

**Fine-tuning** — biaya tetap di awal, lalu biaya per permintaan tanpa konteks:

```
biaya = (token_prompt + token_keluar) × jumlah_permintaan × harga + biaya_pelatihan
```

Titik impasnya:

```
jumlah_permintaan_impas = biaya_pelatihan / token_konteks
```

Dengan konteks 1.500 token dan pelatihan 3 juta token: 3.000.000 / 1.500 = **2.000 permintaan**.

Angka ini menjelaskan dua hal sekaligus:

- Aplikasi internal dengan 200 permintaan sehari? RAG jelas lebih murah.
- Produk dengan 100.000 permintaan sehari? Selisihnya besar, tapi ingat: pelatihan harus diulang setiap kali data berubah.

Yang sering dilupakan dalam hitungan: **biaya melatih ulang**. Kalau kebijakan berubah setiap bulan, biaya pelatihan bukan sekali, tapi dua belas kali setahun. Dengan angka di atas, titik impasnya naik dua belas kali lipat.

### Kualitas data lebih menentukan daripada metode

Untuk fine-tuning, 500 contoh yang konsisten mengalahkan 10.000 contoh yang saling bertentangan.

Ciri data latih yang berguna:

- **Konsisten.** Dua contoh dengan masukan mirip tapi gaya keluaran berbeda mengajari model kebingungan.
- **Mewakili kasus nyata.** Termasuk kasus tepi: masukan kosong, masukan sangat panjang, masukan di luar cakupan.
- **Memuat penolakan.** Kalau kamu ingin model menolak saat tidak tahu, data latih harus memuat contoh penolakan. Model yang hanya dilatih menjawab akan selalu menjawab.
- **Bebas kebocoran.** Pastikan data uji tidak ada di data latih. Kalau ada, skor ujimu tidak berarti.

Kesalahan yang paling merusak: melatih pada data yang sama dengan data uji. Skornya terlihat 95%, lalu di produksi 60%.

### Format data latih

Bentuknya mengikuti format percakapan:

```json
{"pesan": [
  {"peran": "sistem", "isi": "Kamu asisten yang menjawab dalam format: Dasar → Analisis → Kesimpulan."},
  {"peran": "pengguna", "isi": "Apakah barang bisa diretur setelah 30 hari?"},
  {"peran": "asisten", "isi": "Dasar: Kebijakan Retur pasal 3.\nAnalisis: Batas retur 14 hari sejak diterima.\nKesimpulan: Tidak bisa, karena melewati batas 14 hari."}
]}
```

Satu objek per baris (JSON Lines), karena alasan yang sama seperti log agent: mudah ditambahi, tahan rusak.

### Evaluasi setelah fine-tuning

Wajib, dan wajib memakai **kumpulan uji yang tidak dipakai saat melatih**.

Yang harus dibandingkan:

| Metrik | Sebelum | Sesudah | Yang dicari |
|---|---|---|---|
| Kepatuhan format | 71% | 98% | Naik tajam — ini yang diharapkan |
| Ketepatan fakta | 88% | 88% | **Tidak boleh turun** |
| Halusinasi | 9% | 9% | **Tidak boleh naik** |
| Penolakan saat tidak tahu | 40% | 85% | Naik — kalau turun, data latih kurang contoh penolakan |

Baris kedua dan ketiga adalah yang paling sering diabaikan. Fine-tuning bisa menaikkan format sambil **menurunkan** ketepatan, karena model menjadi lebih percaya diri meniru gaya data latih. Kalau itu terjadi, perbaikannya bukan menambah data, tapi memperbaiki kualitas data.

### Kapan fine-tuning benar-benar tepat

- Format keluaran harus persis, dan prompt sudah dicoba dengan contoh serta validasi.
- Gaya bahasa perusahaan yang sulit dijelaskan dengan aturan (nada, pilihan kata).
- Tugas sempit berulang dengan pola stabil — klasifikasi tiket, ekstraksi field dari dokumen sejenis.
- Ingin model lebih kecil (lebih murah, lebih cepat) tapi tetap kompeten di satu tugas. Model kecil yang di-fine-tune untuk satu tugas sering mengalahkan model besar serba bisa pada tugas itu.

Poin terakhir yang paling sering terlewat dan paling menguntungkan: fine-tuning memungkinkan **model lebih kecil** dipakai, dan itu memangkas biaya per permintaan secara permanen.

### Daftar periksa sebelum memutuskan

1. Masalahnya sudah dinyatakan spesifik: pengetahuan, perilaku, atau instruksi?
2. Prompt sudah diperbaiki dan diukur.
3. Few-shot contoh sudah dicoba dan diukur.
4. RAG sudah dicoba kalau masalahnya pengetahuan.
5. Validasi keluaran sudah dicoba kalau masalahnya format.
6. Kegagalan yang tersisa berpola sama, bukan acak.
7. Titik impas biaya dihitung, termasuk biaya melatih ulang.
8. Data latih konsisten, mewakili kasus tepi, dan memuat contoh penolakan.
9. Kumpulan uji terpisah dari data latih.
10. Setelah fine-tuning, ketepatan fakta dan tingkat halusinasi diukur ulang — bukan hanya format.
