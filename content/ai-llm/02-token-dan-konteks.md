---
track: ai-llm
nomor: 2
judul: "Token, context window, dan biaya percakapan"
slug: token-dan-konteks
estimasi_menit: 10
prasyarat: ["ai-llm/apa-itu-llm"]
latihan:
  - id: ai-llm-02-latihan-1
    jenis: web
    bahasa: javascript
    soal: "Hitung biaya satu panggilan: 1200 token input dengan harga 0,15 per 1 juta token, 300 token output dengan harga 0,60 per 1 juta token. Cetak totalnya dalam dolar dengan 6 angka desimal."
    kode_awal: |
      const inputToken = 1200;
      const outputToken = 300;
      const hargaInput = 0.15 / 1_000_000;
      const hargaOutput = 0.60 / 1_000_000;
      // hitung dan cetak total biaya di sini
    output_harapan: |
      0.000360
    solusi: |
      const inputToken = 1200;
      const outputToken = 300;
      const hargaInput = 0.15 / 1_000_000;
      const hargaOutput = 0.60 / 1_000_000;
      const total = inputToken * hargaInput + outputToken * hargaOutput;
      console.log(total.toFixed(6));
    catatan_solusi: "toFixed(6) mengunci 6 desimal supaya perbandingan dengan output harapan tidak bergantung pada pembulatan bawaan."
  - id: ai-llm-02-latihan-2
    jenis: laptop
    soal: "Ukur berapa token yang dipakai prompt sistem milikmu sendiri sebelum dikirim ke API."
    kebutuhan:
      - "Node.js 20 atau lebih baru"
      - "Terminal (PowerShell / bash)"
    langkah:
      - perintah: "node --version"
        penjelasan: "Memastikan Node terpasang dan versinya cukup baru."
      - perintah: "npm install gpt-tokenizer"
        penjelasan: "Memasang tokenizer JavaScript yang jalan tanpa API."
      - perintah: 'node -e "const {encode}=require(\"gpt-tokenizer\"); console.log(encode(\"Kamu adalah asisten yang menjawab singkat.\").length)"'
        penjelasan: "Menghitung token dari satu kalimat prompt sistem."
    hasil: |
      v20.x.x
      (npm install mencetak added N packages)
      11
    cek_berhasil:
      - "node --version mencetak v20 atau lebih baru"
      - "Angka terakhir muncul (bukan error)"
    kalau_gagal:
      - error: "Cannot find module 'gpt-tokenizer'"
        arti: "Paket dipasang di folder lain, atau perintah node dijalankan dari direktori berbeda."
        perbaikan:
          - "Jalankan npm install gpt-tokenizer di folder yang sama dengan tempat kamu menjalankan node"
          - "Cek dengan ls node_modules/gpt-tokenizer"
      - error: "SyntaxError: Cannot use import statement outside a module"
        arti: "Paket ESM dipanggil dengan require di proyek yang belum siap."
        perbaikan:
          - "Pakai node --input-type=module -e \"import {encode} from 'gpt-tokenizer'; ...\""
      - error: "npm ERR! code EACCES"
        arti: "Hak tulis ke folder instalasi global tidak ada."
        perbaikan:
          - "Jangan pakai -g; pasang lokal di folder proyek"
          - "Atau perbaiki izin folder npm (Linux/macOS)"
    buktikan:
      perubahan: "Tambahkan satu kalimat lagi ke prompt sistem, lalu hitung ulang."
      hasil_diharapkan: "Angka bertambah — dan kamu bisa menebak kira-kira berapa banyak sebelum menjalankannya."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Context window menghitung apa saja?"
    opsi:
      a: "Hanya jawaban model"
      b: "Hanya prompt yang dikirim pengguna"
      c: "Prompt dan jawaban sekaligus"
    jawaban: c
    penjelasan: "Context window adalah ruang total untuk prompt + jawaban. Riwayat percakapan ikut memakan ruang ini, bukan gratis."
    tingkat: dasar
  - tipe: isian_singkat
    pertanyaan: "Apa yang terjadi pada bagian paling awal percakapan ketika total token melewati context window?"
    jawaban: "terbuang"
    penjelasan: "Bagian paling awal dibuang lebih dulu. Karena itu instruksi penting sebaiknya diulang di akhir prompt, bukan hanya di awal."
    tingkat: menengah
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa biaya percakapan bertambah mahal di putaran-putaran akhir?"
    opsi:
      a: "Karena harga per token naik seiring waktu"
      b: "Karena seluruh riwayat ikut dikirim ulang tiap putaran"
      c: "Karena model berjalan lebih lambat"
    jawaban: b
    penjelasan: "Setiap putaran mengirim ulang seluruh riwayat. Percakapan 10 putaran membayar riwayat yang sama berkali-kali."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Istilah untuk memotong dokumen panjang menjadi bagian kecil sebelum dikirim ke model?"
    jawaban: "chunking"
    penjelasan: "Chunking memecah dokumen jadi potongan yang muat di context window dan bisa diambil satu per satu sesuai pertanyaan."
    tingkat: dasar
---

# Token, context window, dan biaya percakapan

Kamu akan bisa:
- Menghitung biaya satu panggilan API dari jumlah token.
- Menjelaskan kenapa percakapan panjang makin mahal padahal pesan barunya pendek.
- Memilih kapan memotong dokumen (chunking) dan kapan memakai model berkonteks besar.

## Biaya dihitung per token, dua arah

Setiap panggilan membayar dua kali: token yang masuk (input) dan token yang dihasilkan (output). Harga output biasanya 3–4× harga input, karena menghasilkan token jauh lebih berat daripada membacanya.

```javascript
const inputToken = 1200;
const outputToken = 300;
const hargaInput = 0.15 / 1_000_000;
const hargaOutput = 0.60 / 1_000_000;
const total = inputToken * hargaInput + outputToken * hargaOutput;
console.log(total.toFixed(6));
```

**Output yang diharapkan**

```
0.000360
```

Baris demi baris:
- `hargaInput` — harga per token, bukan per 1 juta. Membagi di awal membuat rumusnya tidak lagi menyimpan satuan yang berbeda.
- `inputToken * hargaInput` — 1200 × 0,00000015 = 0,00018.
- `outputToken * hargaOutput` — 300 × 0,0000006 = 0,00018.
- `toFixed(6)` — mengunci 6 desimal; tanpa ini, angka seperti `3.6e-7` sulit dibandingkan.
- `console.log` — menulis ke stdout.

## Riwayat ikut ditagih, setiap putaran

Percakapan bukan state di server. Setiap permintaan mengirim ulang seluruh riwayat. Di putaran ke-10, kamu membayar ulang 9 putaran sebelumnya.

| Putaran | Pesan baru | Token terkirim | Yang dibayar |
|---|---|---|---|
| 1 | 200 | 200 | 200 |
| 5 | 200 | 1.000 | 1.000 |
| 10 | 200 | 2.000 | 2.000 |

Total setelah 10 putaran ≈ 11.000 token input, padahal pengguna hanya mengetik 2.000. Inilah alasan aplikasi nyata memotong riwayat: kirim N putaran terakhir, sisanya diringkas menjadi satu paragraf.

## Context window adalah anggaran, bukan target

Muat 100.000 token bukan berarti sebaiknya mengirim 100.000 token. Tiga alasan:

1. **Biaya naik linear**, kualitas tidak.
2. **Informasi di tengah dokumen panjang sering terlewat** — model cenderung memperhatikan awal dan akhir.
3. **Waktu respons bertambah**, dan itu terasa oleh pengguna.

Aturan praktis: kirim bagian yang benar-benar relevan, taruh instruksi penting di akhir prompt.

## Di pekerjaan, ini dipakai untuk apa

Menentukan ukuran chunk saat membangun RAG, dan memperkirakan biaya bulanan sebelum fitur diluncurkan — bukan setelah tagihan datang.

## Lapis 2

### Rumus biaya lengkap

| Komponen | Rumus | Catatan |
|---|---|---|
| Input | `token_input × harga_input` | Termasuk prompt sistem + riwayat + dokumen |
| Output | `token_output × harga_output` | Termasuk token "reasoning" bila model memakainya |
| Cache hit | `token_cache × harga_cache` | Beberapa penyedia mendiskon prompt yang identik & berulang |
| Total | jumlah ketiganya | Dibulatkan per panggilan oleh penyedia |

### Kenapa begini, bukan begitu

Alternatif "simpan percakapan di server agar tidak perlu kirim ulang" tidak dipakai kebanyakan API karena server model tidak menyimpan state antar-permintaan — ia tanpa memori. Konsekuensinya diterima: klien bertanggung jawab mengelola riwayat, dan itu justru memberi kendali penuh atas biaya.

### Error umum

| Pesan | Arti | Cara memperbaiki |
|---|---|---|
| `context_length_exceeded` | Total token melewati batas model | Potong riwayat, ringkas, atau pilih model berkonteks lebih besar |
| `insufficient_quota` | Kredit akun habis (beda dengan 429) | Isi ulang kredit; 429 berarti terlalu cepat, bukan kehabisan saldo |
| `rate_limit_exceeded` dengan `retry-after` | Batas per menit | Hormati header `retry-after`, jangan langsung ulang |
| Tagihan jauh lebih besar dari perkiraan | Riwayat ikut terkirim tiap putaran | Batasi jumlah putaran yang dikirim; aktifkan cache prompt |

### Rujukan resmi

- [OI] — harga per model: <https://openai.com/api/pricing/>
- Anthropic — pricing & prompt caching: <https://docs.anthropic.com/en/docs/about-claude/pricing>

## Latihan

Latihan 1 di web: hitung biaya satu panggilan. Latihan 2 di laptop: ukur token prompt sistem milikmu sendiri — setelah itu perkiraan "1 token = 0,75 kata" berubah jadi angka yang bisa kamu pertanggungjawabkan.

## Kamu sudah bisa ini kalau…

- [ ] Bisa menghitung biaya 10 putaran percakapan tanpa kalkulator eksternal.
- [ ] Bisa menjelaskan kenapa memuat 100.000 token bukan tujuan.
- [ ] Latihan 1 lulus dan latihan 2 berhasil dijalankan.
