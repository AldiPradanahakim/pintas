---
track: ai-llm
nomor: 1
judul: "Apa itu LLM dan kenapa ia salah dengan yakin"
slug: apa-itu-llm
estimasi_menit: 9
prasyarat: []
latihan:
  - id: ai-llm-01-latihan-1
    jenis: web
    bahasa: python
    soal: "Hitung berapa banyak kata yang bisa ditampung 8192 token bila rata-rata 1 token = 0,75 kata. Cetak hasilnya sebagai bilangan bulat."
    kode_awal: |
      token = 8192
      kata_per_token = 0.75
      # hitung dan cetak hasilnya di sini
    output_harapan: |
      6144
    solusi: |
      token = 8192
      kata_per_token = 0.75
      print(int(token * kata_per_token))
    catatan_solusi: "int() membuang bagian desimal. 8192 × 0,75 = 6144,0 → 6144."
  - id: ai-llm-01-latihan-2
    jenis: laptop
    soal: "Pastikan kamu punya alat untuk mengukur token sebelum menulis prompt."
    kebutuhan:
      - "Python 3.10 atau lebih baru"
      - "Koneksi internet (hanya sekali, untuk memasang paket)"
      - "Terminal (PowerShell / bash)"
    langkah:
      - perintah: "python -m venv .venv"
        penjelasan: "Membuat lingkungan Python terpisah supaya paket tidak mengotori sistem."
      - perintah: "source .venv/bin/activate    # Windows: .venv\\Scripts\\activate"
        penjelasan: "Mengaktifkan lingkungan tersebut di terminal ini."
      - perintah: "pip install tiktoken"
        penjelasan: "Memasang tokenizer yang dipakai model GPT untuk menghitung token."
      - perintah: 'python -c "import tiktoken; e=tiktoken.get_encoding(\"cl100k_base\"); print(len(e.encode(\"Halo dunia\")))"'
        penjelasan: "Menghitung token untuk teks pendek tanpa membuat berkas."
    hasil: |
      (python -m venv .venv tidak mencetak apa pun)
      (.venv) $ python -c "import tiktoken; ..."
      3
    cek_berhasil:
      - "Prompt terminal diawali (.venv)"
      - "Angka 3 tercetak — 'Halo dunia' menjadi 3 token, bukan 2 kata"
    kalau_gagal:
      - error: "'python' is not recognized as an internal or external command"
        arti: "Python tidak ada di PATH Windows."
        perbaikan:
          - "Pasang Python dari python.org, centang 'Add python.exe to PATH' saat instalasi"
          - "Tutup dan buka ulang terminal"
      - error: "error: externally-managed-environment"
        arti: "Python sistem (Linux/macOS baru) menolak pip di luar venv."
        perbaikan:
          - "Pastikan venv sudah aktif: prompt diawali (.venv)"
          - "Kalau belum, ulangi langkah 2"
      - error: "ModuleNotFoundError: No module named 'tiktoken'"
        arti: "pip memasang paket ke Python lain, bukan yang dipakai perintah python."
        perbaikan:
          - "Jalankan python -m pip install tiktoken (memakai python yang sama)"
          - "Cek dengan python -c \"import sys; print(sys.executable)\""
    buktikan:
      perubahan: "Ganti teksnya jadi \"Halo dunia, apa kabar?\" lalu hitung lagi."
      hasil_diharapkan: "Angka bertambah (biasanya 7), bukan tetap 3."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa LLM bisa memberi jawaban salah dengan nada yakin?"
    opsi:
      a: "Karena model sengaja menipu pengguna"
      b: "Karena model memprediksi token berikutnya, bukan memeriksa kebenaran"
      c: "Karena koneksi internet putus saat menjawab"
      d: "Karena suhu (temperature) selalu 0"
    jawaban: b
    penjelasan: "LLM dioptimasi untuk menghasilkan lanjutan teks yang paling mungkin, bukan untuk mengetahui fakta. Kelancaran kalimat dan kebenaran isi adalah dua hal berbeda."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Apa yang terjadi pada teks sebelum masuk ke model?"
    opsi:
      a: "Diubah menjadi gambar"
      b: "Dipotong menjadi token lalu jadi angka"
      c: "Dikirim apa adanya sebagai teks"
    jawaban: b
    penjelasan: "Model hanya memproses angka. Tokenizer memotong teks menjadi token, lalu tiap token dipetakan ke satu ID angka."
    tingkat: dasar
  - tipe: isian_singkat
    pertanyaan: "Apa nama batas jumlah token yang bisa diproses model dalam satu percakapan?"
    jawaban: "context window"
    penjelasan: "Context window adalah jumlah token (prompt + jawaban) yang muat sekaligus. Lewat batas ini, bagian paling awal percakapan terbuang."
    tingkat: dasar
  - tipe: isian_singkat
    pertanyaan: "Parameter yang mengatur seberapa acak model memilih token berikutnya disebut apa?"
    jawaban: "temperature"
    penjelasan: "Temperature rendah (0) membuat pilihan hampir selalu token paling mungkin; temperature tinggi menyebar peluang ke token lain."
    tingkat: menengah
---

# Apa itu LLM dan kenapa ia salah dengan yakin

Kamu akan bisa:
- Menjelaskan apa yang sebenarnya dilakukan model bahasa saat menjawab.
- Menghitung perkiraan token dari sebuah teks dan tahu kenapa itu penting.
- Menjelaskan kenapa jawaban salah tetap terdengar meyakinkan, dan cara menutupinya.

## Model bahasa memprediksi satu token ke depan

LLM (Large Language Model) tidak "mencari jawaban". Ia melakukan satu hal: diberi urutan token, ia menebak token berikutnya. Jawaban panjang dihasilkan dengan mengulang tebakan itu, satu token demi satu token.

```python
# Perkiraan kasar: 1 token kira-kira 0,75 kata dalam bahasa Indonesia/Inggris.
token = 8192
kata_per_token = 0.75
print(int(token * kata_per_token))
```

**Output yang diharapkan**

```
6144
```

Baris demi baris:
- `token = 8192` — jumlah token yang muat di context window; angka ini milik model tertentu, bukan angka ajaib.
- `kata_per_token = 0.75` — rasio rata-rata. Bukan konstanta: teks Indonesia dengan banyak istilah teknis bisa jauh lebih boros token.
- `int(...)` — membuang bagian desimal, karena "6144,0 kata" tidak berguna sebagai jawaban.
- `print()` — menulis hasilnya ke stdout; terminal menampilkannya lalu pindah baris.

## Token bukan kata

Tokenizer memotong teks dengan aturan statistik, bukan spasi. Akibatnya:

- `"Halo dunia"` (2 kata) bisa jadi 3 token.
- Kata panjang dan jarang seperti `"menginternasionalisasikan"` dipecah jadi beberapa token.
- Angka sering dipecah per digit, sehingga `"12345"` bisa lebih dari satu token.

Ini bukan detail teknis yang bisa diabaikan: biaya API dihitung per token, dan context window juga dihitung per token. Prompt yang "cuma 2 paragraf" bisa memakan ruang jauh lebih besar dari perkiraan.

## Kenapa ia salah dengan yakin

Model dioptimasi agar teks lanjutannya masuk akal secara statistik. "Masuk akal" dan "benar" adalah dua hal berbeda. Ketika informasinya tidak ada di data latih, model tetap menghasilkan lanjutan yang paling wajar — dan lanjutan yang wajar biasanya berbentuk kalimat percaya diri, bukan "saya tidak tahu".

Tiga penawar yang bisa langsung dipakai:

1. **Beri sumbernya.** Tempelkan dokumen yang relevan di prompt, lalu minta jawaban hanya dari situ.
2. **Minta bukti.** "Sebutkan bagian mana dari teks di atas yang mendukung jawabanmu."
3. **Jangan pakai untuk yang harus tepat.** Hitungan, tanggal, nomor rekening: minta model memanggil alat (kalkulator, database), bukan mengarang.

## Di pekerjaan, ini dipakai untuk apa

Menentukan berapa besar konteks yang bisa kamu kirim sebelum memotong dokumen, dan memutuskan kapan sebuah tugas butuh RAG (mengambil dokumen dulu) alih-alih mengandalkan ingatan model.

## Lapis 2

### Parameter yang mengubah jawaban

| Parameter | Nilai umum | Arti |
|---|---|---|
| `temperature` | 0 – 2 | Sebaran pilihan token. 0 = hampir selalu yang paling mungkin |
| `top_p` | 0 – 1 | Batasi pilihan ke token paling mungkin sampai total peluangnya `top_p` |
| `max_tokens` | 1 – batas model | Batas panjang jawaban; jawaban terpotong bila kena |
| `stop` | string[] | Berhenti begitu salah satu string muncul |
| `presence_penalty` | -2 – 2 | Positif = dorong model membahas hal baru |
| `frequency_penalty` | -2 – 2 | Positif = tekan pengulangan token yang sudah dipakai |

`temperature` dan `top_p` sebaiknya tidak diubah bersamaan: keduanya mengatur hal yang sama dari sudut berbeda, dan efeknya jadi sulit ditebak.

### Kenapa begini, bukan begitu

Alternatif "model mencari di database jawaban" ditolak karena tidak bisa menangani pertanyaan bebas. Konsekuensinya diterima: model butuh sumber yang ditempelkan (RAG) untuk hal yang harus akurat, dan biaya token naik sebesar panjang sumber itu.

### Error umum

| Pesan | Arti | Cara memperbaiki |
|---|---|---|
| `This model's maximum context length is 8192 tokens. However, your messages resulted in 9120 tokens` | Prompt + riwayat percakapan melebihi context window | Potong riwayat lama, ringkas, atau pindah model berkonteks lebih besar |
| `429 Too Many Requests` | Batas laju penyedia tercapai | Beri jeda + coba ulang dengan backoff; kurangi permintaan paralel |
| `401 Unauthorized` | Kunci API salah/tidak terkirim | Cek header `Authorization: Bearer ...` dan apakah kuncinya masih aktif |
| Jawaban terpotong di tengah kalimat | `max_tokens` habis | Naikkan `max_tokens` atau minta jawaban lebih ringkas |

### Rujukan resmi

- OpenAI — tokenizer & perhitungan token: <https://platform.openai.com/tokenizer>
- Anthropic — context window & batas token: <https://docs.anthropic.com/en/docs/about-claude/models>

## Latihan

Latihan 1 dijalankan di web. Latihan 2 diikuti di laptop: memasang `tiktoken` dan mengukur token sungguhan — angka perkiraan 0,75 kata baru berguna setelah kamu melihat selisihnya sendiri.

## Kamu sudah bisa ini kalau…

- [ ] Bisa menjelaskan kenapa "2 kata" belum tentu "2 token" tanpa membuka dokumentasi.
- [ ] Bisa menyebut dua cara mengurangi jawaban salah yang meyakinkan.
- [ ] Latihan 1 lulus dan latihan 2 berhasil dijalankan.
