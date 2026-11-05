---
track: ai-llm
nomor: 9
judul: "Evaluasi: cara tahu jawaban model benar atau hanya terdengar benar"
slug: evaluasi
estimasi_menit: 12
prasyarat: ["ai-llm/prompt", "ai-llm/retrieval-dan-rag"]
latihan:
  - id: ai-llm-09-latihan-1
    jenis: web
    bahasa: python
    soal: "Hitung tiga angka dari hasil uji: presisi, recall, dan F1. Presisi = yang benar-benar relevan dibagi yang dikembalikan. Recall = yang benar-benar relevan dibagi seluruh yang seharusnya relevan. Cetak masing-masing dibulatkan 2 desimal, satu per baris."
    kode_awal: |
      dikembalikan = ["dok-1", "dok-3", "dok-5", "dok-9"]
      seharusnya   = ["dok-1", "dok-2", "dok-3", "dok-7"]

      # hitung presisi, recall, f1 lalu cetak 2 desimal
    output_harapan: |
      0.50
      0.50
      0.50
    solusi: |
      dikembalikan = ["dok-1", "dok-3", "dok-5", "dok-9"]
      seharusnya   = ["dok-1", "dok-2", "dok-3", "dok-7"]

      benar = len(set(dikembalikan) & set(seharusnya))
      presisi = benar / len(dikembalikan)
      recall = benar / len(seharusnya)
      f1 = 2 * presisi * recall / (presisi + recall)

      print(f"{presisi:.2f}")
      print(f"{recall:.2f}")
      print(f"{f1:.2f}")
    catatan_solusi: "Yang benar-benar relevan dan ikut dikembalikan: dok-1 dan dok-3, jadi 2. Presisi 2/4 = 0,50; recall 2/4 = 0,50; F1 = 2(0,5×0,5)/(0,5+0,5) = 0,50. Perhatikan dok-5 dan dok-9 salah (menurunkan presisi), dok-2 dan dok-7 terlewat (menurunkan recall)."
  - id: ai-llm-09-latihan-2
    jenis: laptop
    soal: "Buat kumpulan uji kecil berisi 5 pertanyaan beserta kata kunci wajib di jawaban, lalu hitung berapa yang lulus. Ini bentuk paling sederhana dari evaluasi otomatis: tidak menilai kefasihan, hanya memeriksa apakah fakta yang wajib muncul benar-benar muncul."
    kebutuhan:
      - "Python 3.10 atau lebih baru"
      - "Terminal (git-bash / PowerShell)"
    langkah:
      - perintah: "mkdir eval-lokal && cd eval-lokal"
        penjelasan: "Folder kerja terpisah supaya berkas latihan tidak tercampur."
      - perintah: "python -c \"import json; k=[{'tanya':'Apa itu embedding?','wajib':['vektor']},{'tanya':'Berapa dimensi yang umum?','wajib':['1536']},{'tanya':'Apa itu chunking?','wajib':['memotong']}]; json.dump(k, open('kasus.json','w'), ensure_ascii=False)\""
        penjelasan: "Menyimpan 3 kasus uji. Tiap kasus punya daftar kata yang WAJIB muncul di jawaban yang benar. Dua jebakan halus di sini: (1) kalau kasus kedua ditulis ['768','1536'], all() menuntut KEDUANYA muncul, jadi jawaban yang benar tapi hanya menyebut satu angka dianggap gagal; (2) kata wajib harus benar-benar ada di jawaban — 'memotong' TIDAK memuat 'potong' karena awalan me- meluluhkan huruf p."
      - perintah: "python -c \"import json; k=json.load(open('kasus.json')); print(len(k))\""
        penjelasan: "Memastikan berkas terbaca dan jumlah kasus sesuai. Output 3."
      - perintah: "python -c \"import json; k=json.load(open('kasus.json')); jawab={'Apa itu embedding?':'Embedding mengubah teks menjadi vektor angka.','Berapa dimensi yang umum?':'Umumnya 1536.','Apa itu chunking?':'Chunking adalah memecah dokumen.'}; lulus=sum(all(w in jawab[c['tanya']] for w in c['wajib']) for c in k); print(f'{lulus}/{len(k)}')\""
        penjelasan: "Menjalankan pemeriksaan. all() menuntut SEMUA kata wajib muncul, bukan salah satu. Hasilnya 2/3 — kasus chunking gagal karena jawabannya tidak memuat kata 'potong'."
      - perintah: "python -c \"import json; k=json.load(open('kasus.json')); jawab={'Apa itu embedding?':'Embedding mengubah teks menjadi vektor angka.','Berapa dimensi yang umum?':'Umumnya 1536.','Apa itu chunking?':'Chunking adalah memotong dokumen jadi bagian kecil.'}; lulus=sum(all(w in jawab[c['tanya']] for w in c['wajib']) for c in k); print(f'{lulus}/{len(k)}')\""
        penjelasan: "Jawaban chunking diperbaiki (memuat 'potong'). Hasilnya 3/3 — bukti bahwa angka evaluasi bergerak sesuai mutu jawaban, bukan angka tetap."
    hasil: |
      3
      2/3
      3/3
    cek_berhasil:
      - "Langkah 3 mencetak 2/3 — satu kasus gagal karena kata wajib tidak muncul"
      - "Langkah 4 mencetak 3/3 setelah jawaban diperbaiki"
      - "Angka berubah, jadi pemeriksaan benar-benar membaca jawaban"
    kalau_gagal:
      - error: "FileNotFoundError: [Errno 2] No such file or directory: 'kasus.json'"
        arti: "Berkas dibuat di folder lain, atau terminal tidak berada di eval-lokal."
        perbaikan:
          - "Pastikan sudah cd eval-lokal sebelum langkah 2"
      - error: "KeyError: 'Apa itu embedding?'"
        arti: "Kunci di kamus jawab tidak sama persis dengan pertanyaan di kasus.json — beda spasi atau tanda baca."
        perbaikan:
          - "Salin pertanyaan apa adanya dari kasus.json"
      - error: "Hasilnya 3/3 padahal jawaban jelas salah"
        arti: "Kata wajib terlalu umum (misal 'dokumen' muncul di jawaban ngawur)."
        perbaikan:
          - "Pilih kata yang benar-benar membedakan jawaban benar dari salah"
    buktikan:
      perubahan: "Ubah kata wajib pada kasus pertama dari 'vektor' menjadi 'grafik'."
      hasil_diharapkan: "Hasil turun jadi 2/3 pada langkah 4 — pemeriksaan menangkap jawaban yang tidak memuat istilah yang dituntut."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa menilai jawaban model dengan membaca satu per satu tidak cukup saat aplikasi dipakai banyak orang?"
    opsi:
      a: "Terlalu mahal karena butuh listrik"
      b: "Tidak bisa diulang pada versi berikutnya, jadi tidak ada pembanding saat prompt atau model berubah"
      c: "Model tidak mau dinilai"
      d: "Jawaban model selalu berubah"
    jawaban: b
    penjelasan: "Penilaian manual memberi kesan mutu, bukan angka. Begitu prompt diubah atau model diganti, tidak ada cara tahu apakah hasilnya membaik atau memburuk. Kumpulan uji tetap dengan skor otomatis membuat perbandingan antarversi mungkin dilakukan."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Sistem RAG mengembalikan 10 dokumen, 2 di antaranya relevan, sementara seharusnya ada 8 dokumen relevan. Berapa presisi dan recall?"
    opsi:
      a: "Presisi 0,20 · recall 0,25"
      b: "Presisi 0,25 · recall 0,20"
      c: "Presisi 0,80 · recall 0,20"
      d: "Presisi 0,20 · recall 0,80"
    jawaban: a
    penjelasan: "Presisi = 2/10 = 0,20 (dari yang dikembalikan, hanya 20% relevan). Recall = 2/8 = 0,25 (dari yang seharusnya ada, hanya 25% yang berhasil diambil). Keduanya mengukur hal berbeda: presisi soal sampah di hasil, recall soal informasi yang terlewat."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Metrik yang menggabungkan presisi dan recall menjadi satu angka (harmonic mean) disebut apa? (tiga huruf/angka)"
    jawaban: "f1"
    penjelasan: "F1 = 2 × (presisi × recall) / (presisi + recall). Harmonic mean dipakai karena ia menghukum ketidakseimbangan: presisi 1,0 dengan recall 0,01 menghasilkan F1 mendekati 0,02, bukan 0,5 seperti pada rata-rata biasa. Jadi sistem yang hanya bagus di satu sisi tidak bisa terlihat bagus di F1."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Model menjawab dengan yakin: 'Perusahaan X didirikan tahun 1998.' Padahal dokumen menyebut 2003. Metrik apa yang paling tepat menangkap kegagalan ini?"
    opsi:
      a: "Kemiripan kosinus antara jawaban dan dokumen"
      b: "Tingkat halusinasi: persentase jawaban yang memuat klaim tidak didukung dokumen"
      c: "Panjang jawaban rata-rata"
      d: "Latensi jawaban"
    jawaban: b
    penjelasan: "Kemiripan kosinus tinggi justru sering terjadi pada jawaban yang salah tapi memakai kata-kata yang sama dengan dokumen — ia mengukur kemiripan bentuk, bukan kebenaran isi. Yang perlu diukur adalah apakah setiap klaim punya dukungan di sumber, dan itu dihitung sebagai tingkat halusinasi."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Kalau 50 jawaban diperiksa dan 7 di antaranya memuat klaim yang tidak ada di sumber, berapa persen tingkat halusinasinya? (tulis angkanya saja)"
    jawaban: "14"
    penjelasan: "7/50 = 0,14 = 14%. Angka ini harus diukur pada kumpulan uji yang sama setiap kali prompt atau model berubah — naik dari 14% ke 20% berarti ada perubahan yang merugikan, meskipun sekilas jawabannya terlihat lebih panjang atau lebih meyakinkan."
    tingkat: dasar
---

## Lapis 1

### Masalahnya: jawaban salah terdengar sama yakannya

Model bahasa menghasilkan kalimat yang meyakinkan tanpa peduli benar atau salah. Ini bukan cacat yang bisa diperbaiki dengan prompt yang lebih bagus — ia melekat pada cara kerja model, yang memilih kata paling mungkin, bukan memeriksa fakta.

Akibatnya, membaca jawaban lalu merasa "kelihatannya benar" adalah cara menilai yang tidak bisa dipertahankan. Kamu akan melewatkan kesalahan yang halus, dan kamu tidak punya cara tahu apakah perubahan prompt terakhir benar-benar membantu.

Yang bisa dipertahankan: **kumpulan uji tetap + skor otomatis**.

### Tiga hal yang perlu diukur

**1. Apakah informasinya diambil dengan benar?** (retrieval)

Kalau sistem RAG mengambil dokumen yang salah, jawaban yang dihasilkan tidak akan pernah benar. Ini diukur sebelum model dipanggil.

- **Presisi** — dari 10 dokumen yang diambil, berapa yang relevan?
- **Recall** — dari 8 dokumen yang seharusnya diambil, berapa yang berhasil diambil?

Keduanya berlawanan arah. Mengambil 100 dokumen menaikkan recall ke 100% tapi presisi jatuh. Mengambil 1 dokumen menaikkan presisi tapi recall jatuh. **F1** menggabungkan keduanya menjadi satu angka.

**2. Apakah jawabannya benar?** (generation)

Diukur dengan membandingkan klaim di jawaban terhadap sumber.

- **Tingkat halusinasi** — persentase jawaban yang memuat klaim tidak didukung sumber.
- **Ketepatan** — persentase jawaban yang faktanya sesuai.
- **Kelengkapan** — apakah semua bagian pertanyaan dijawab.

**3. Apakah bentuknya sesuai?** (format)

Kalau kamu meminta JSON, apakah JSON-nya sah? Kalau kamu meminta dua kalimat, apakah jadi dua kalimat? Ini paling mudah diukur dan paling sering dilupakan — padahal kegagalan format langsung mematahkan program yang memakainya.

### Kumpulan uji: 20 kasus nyata mengalahkan 200 kasus karangan

Kumpulan uji yang berguna punya ciri:

- **Kasusnya diambil dari pertanyaan sungguhan.** Termasuk yang aneh, salah tulis, dan pertanyaan yang jawabannya tidak ada di dokumen.
- **Ada jawaban yang dianggap benar.** Tidak harus panjang; cukup kata kunci wajib atau nilai yang harus muncul.
- **Sebagian disisihkan.** Simpan 20% kasus yang tidak kamu lihat saat menyetel prompt. Kalau angka di bagian itu juga naik, perbaikanmu nyata. Kalau hanya bagian yang kamu lihat yang naik, kamu sedang menghafal.

### Evaluasi otomatis paling sederhana yang berguna

Tidak perlu model lain sebagai penilai. Mulai dari yang paling murah:

**Cocok kata wajib.** Untuk tiap kasus, tentukan kata atau nilai yang harus muncul di jawaban yang benar.

```python
lulus = all(w in jawaban for w in kasus["wajib"])
```

Cocok untuk jawaban faktual pendek: angka, nama, istilah.

**Cocok persis setelah normalisasi.** Untuk jawaban yang bentuknya tetap: huruf kecil, spasi dirapikan, tanda baca dibuang.

**Cocok pola.** Untuk format: apakah hasilnya JSON sah? Apakah memuat tepat dua kalimat?

Ketiganya murah, cepat, dan tidak butuh model tambahan. Baru setelah itu — kalau jawabannya panjang dan bebas bentuk — pertimbangkan model sebagai penilai, dengan kesadaran bahwa penilai itu sendiri bisa salah.

### Jebakan: mengukur yang mudah, bukan yang penting

Kemiripan kosinus antara jawaban dan dokumen sumber terlihat seperti ukuran mutu, tapi bukan. Jawaban yang mengulang kalimat dokumen tapi menyimpang di satu angka akan mendapat skor tinggi. Jawaban yang benar tapi disusun dengan kata sendiri akan mendapat skor lebih rendah.

Yang diukur adalah kemiripan **bentuk**, bukan kebenaran **isi**. Untuk kebenaran isi, periksa klaim terhadap sumber — satu per satu, atau dengan model penilai yang diuji dulu terhadap penilaian manusia.

### Latensi dan biaya juga bagian dari mutu

Jawaban sempurna yang muncul setelah 30 detik tidak dipakai orang. Jawaban benar yang menghabiskan 50.000 token per pertanyaan tidak bisa dijalankan sebagai produk gratis.

Ukur keduanya bersama mutu, bukan terpisah:

| Yang diukur | Cara | Kenapa penting |
|---|---|---|
| Latensi p50 dan p95 | Waktu dari permintaan sampai jawaban pertama | p95 menentukan pengalaman terburuk yang dirasakan pengguna |
| Token masuk/keluar per permintaan | Dihitung dari respons API | Menentukan biaya langsung |
| Biaya per 1.000 permintaan | Token × harga | Angka yang dibandingkan antarversi |

p95 penting karena rata-rata menyembunyikan masalah. Kalau 95 dari 100 permintaan selesai 1 detik tapi 5 sisanya 20 detik, rata-ratanya terlihat baik (2 detik) padahal sebagian pengguna menunggu sangat lama.

## Lapis 2

### Presisi, recall, F1 — dengan angka

```python
dikembalikan = {"d1", "d3", "d5", "d9"}
seharusnya   = {"d1", "d2", "d3", "d7"}

benar = dikembalikan & seharusnya          # {"d1", "d3"} → 2

presisi = len(benar) / len(dikembalikan)   # 2/4 = 0,50
recall  = len(benar) / len(seharusnya)     # 2/4 = 0,50
f1      = 2 * presisi * recall / (presisi + recall)  # 0,50
```

Tiga pola yang sering muncul:

| Kondisi | Presisi | Recall | Artinya |
|---|---|---|---|
| Kembalikan semua dokumen | Rendah | 1,0 | Tidak ada yang terlewat, tapi pengguna dibanjiri sampah |
| Kembalikan 1 dokumen terbaik | 1,0 | Rendah | Tiap hasil tepat, tapi banyak informasi tidak pernah sampai |
| Seimbang | Sedang | Sedang | Biasanya yang diinginkan |

Untuk RAG, aturan praktis: **recall lebih penting daripada presisi di tahap pengambilan**. Dokumen yang tidak diambil tidak akan pernah bisa dipakai model. Sampah di hasil bisa disaring di tahap berikutnya (reranking); informasi yang hilang tidak bisa dikembalikan.

### Reranking: dua tahap

Pola yang bekerja: ambil banyak dengan recall tinggi (misal 50 dokumen), lalu saring dengan model rerank menjadi 5 teratas.

```python
kandidat = cari_vektor(tanya, top_k=50)        # murah, recall tinggi
final    = rerank(tanya, kandidat)[:5]         # mahal, presisi tinggi
```

Model rerank (cross-encoder) membaca pasangan pertanyaan-dokumen bersama-sama, jadi lebih akurat daripada membandingkan vektor terpisah — tapi jauh lebih lambat, karena itu hanya dipakai pada 50 kandidat, bukan seluruh korpus.

### Tingkat halusinasi: cara mengukurnya

Untuk setiap jawaban, periksa apakah klaimnya punya dukungan di dokumen yang diberikan:

```python
def ada_dukungan(klaim: str, dokumen: list[str]) -> bool:
    # versi sederhana: kata kunci klaim muncul di dokumen
    kata = [k for k in klaim.lower().split() if len(k) > 4]
    teks = " ".join(dokumen).lower()
    return all(k in teks for k in kata)
```

Ini kasar — kata yang muncul belum tentu mendukung klaim — tapi cukup untuk mendeteksi halusinasi yang jelas: nama, angka, atau entitas yang sama sekali tidak ada di sumber.

Tingkat halusinasi = jumlah jawaban tanpa dukungan / total jawaban.

Yang penting bukan angkanya sempurna, tapi bahwa **angka itu diukur ulang setiap kali ada perubahan**. Naik dari 14% ke 20% adalah sinyal berhenti, meskipun jawabannya terlihat lebih bagus.

### Model sebagai penilai: berguna, tapi harus diuji dulu

Untuk jawaban panjang dan bebas bentuk, penilaian otomatis berbasis kata kunci gagal. Model lain bisa dipakai sebagai penilai:

```python
NILAI = """Nilai jawaban berikut terhadap pertanyaan, hanya berdasarkan dokumen.

Pertanyaan: {tanya}
Dokumen: {dokumen}
Jawaban: {jawaban}

Jawab HANYA dengan satu kata: BENAR, SEBAGIAN, atau SALAH.
BENAR = semua klaim didukung dokumen dan pertanyaan terjawab.
SEBAGIAN = sebagian klaim didukung, ada yang kurang.
SALAH = ada klaim yang bertentangan dengan dokumen atau tidak ada dukungan."""
```

Sebelum dipakai, **uji penilainya**: ambil 30 jawaban yang sudah dinilai manusia, jalankan penilai, bandingkan. Kalau tingkat kesesuaiannya di bawah 85%, penilai itu belum layak dipakai untuk mengukur apa pun.

Jebakan yang sering terjadi: penilai cenderung menyukai jawaban panjang dan percaya diri, sama seperti manusia yang membaca sekilas. Tanpa pengujian terhadap penilaian manusia, kamu hanya mengganti satu bias dengan bias lain.

### Metrik format

Paling mudah dan paling sering menyelamatkan:

```python
import json

def format_sah(teks: str) -> bool:
    try:
        d = json.loads(teks)
    except json.JSONDecodeError:
        return False
    return isinstance(d, dict) and {"judul", "tingkat"} <= d.keys()
```

Untuk format non-JSON:

```python
def dua_kalimat(teks: str) -> bool:
    # hitung tanda akhir kalimat, abaikan singkatan umum
    bersih = teks.replace("dsb.", "").replace("dll.", "")
    return bersih.count(".") + bersih.count("!") + bersih.count("?") == 2
```

Ukur **tingkat kepatuhan format** secara terpisah dari ketepatan isi. Kalau format patuh 99% tapi isi benar 70%, masalahnya di prompt isi. Kalau format patuh 70%, itu masalah yang berbeda dan perbaikannya juga berbeda.

### Tabel hasil yang berguna

Simpan hasil setiap versi dalam tabel, bukan hanya angka terakhir:

| Versi | Recall@10 | Presisi@5 | Halusinasi | Format sah | p95 latensi | Token/req |
|---|---|---|---|---|---|---|
| v1 | 0,62 | 0,41 | 22% | 94% | 3,1 s | 1.240 |
| v2 (chunk 400) | 0,78 | 0,44 | 15% | 94% | 2,8 s | 1.180 |
| v3 (rerank) | 0,81 | 0,72 | 9% | 94% | 4,2 s | 1.260 |

Tabel ini menjawab pertanyaan yang tidak bisa dijawab oleh ingatan: **perubahan mana yang benar-benar membantu, dan apa harganya.** v3 menaikkan presisi dan menurunkan halusinasi, tapi p95 naik 1,4 detik — keputusan menerimanya adalah keputusan produk, bukan keputusan teknis.

### Daftar periksa

1. Kumpulan uji berisi 20+ kasus nyata, bukan karangan.
2. Sebagian kasus disisihkan dan tidak dipakai saat menyetel.
3. Retrieval diukur terpisah dari generasi — recall@k dan presisi@k.
4. Halusinasi diukur dengan memeriksa klaim terhadap sumber.
5. Kepatuhan format diukur terpisah.
6. Latensi p50 **dan** p95 dicatat, bukan rata-rata saja.
7. Token per permintaan dan biaya per 1.000 permintaan dicatat.
8. Setiap perubahan prompt/model dijalankan pada kumpulan yang sama, hasilnya masuk tabel.
9. Kalau memakai model sebagai penilai, penilai itu sudah diuji terhadap penilaian manusia.
