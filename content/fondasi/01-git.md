---
track: fondasi
nomor: 1
judul: "Git: menyimpan keadaan yang bisa dikembalikan"
slug: git
estimasi_menit: 11
prasyarat: []
latihan:
  - id: fondasi-01-latihan-1
    jenis: web
    bahasa: python
    soal: "Diberi daftar perintah git, kelompokkan ke tiga tahap: 'kerja' (mengubah berkas), 'siap' (menandai yang akan di-commit), 'simpan' (membuat commit). Cetak satu baris per perintah: '<perintah> -> <tahap>'."
    kode_awal: |
      perintah = [
          ("git status", "kerja"),
          ("git add .", "siap"),
          ("git commit -m 'pesan'", "simpan"),
          ("git diff", "kerja"),
          ("git add -p", "siap"),
          ("git log --oneline", "simpan"),
      ]

      # cetak "<perintah> -> <tahap>" untuk tiap baris
    output_harapan: |
      git status -> kerja
      git add . -> siap
      git commit -m 'pesan' -> simpan
      git diff -> kerja
      git add -p -> siap
      git log --oneline -> simpan
    solusi: |
      perintah = [
          ("git status", "kerja"),
          ("git add .", "siap"),
          ("git commit -m 'pesan'", "simpan"),
          ("git diff", "kerja"),
          ("git add -p", "siap"),
          ("git log --oneline", "simpan"),
      ]

      for p, tahap in perintah:
          print(f"{p} -> {tahap}")
    catatan_solusi: "Tiga tahap ini menjelaskan hampir semua kebingungan soal git. Berkas yang kamu ubah ada di folder kerja. git add memindahkannya ke area siap (staging). git commit menyimpannya sebagai riwayat. git status menunjukkan di tahap mana tiap berkas berada — itulah kenapa ia perintah yang paling sering dipakai."
  - id: fondasi-01-latihan-2
    jenis: laptop
    soal: "Buat repositori, simpan satu commit, ubah berkas, lalu kembalikan ke keadaan commit tadi. Buktikan bahwa perubahan hilang dan isi berkas kembali seperti semula."
    kebutuhan:
      - "Git terpasang (git --version)"
      - "Terminal (git-bash / PowerShell)"
    langkah:
      - perintah: "mkdir latihan-git && cd latihan-git && git init"
        penjelasan: "Membuat folder dan menjadikannya repositori. Git membuat folder .git yang menyimpan seluruh riwayat."
      - perintah: "printf 'baris pertama\\n' > catatan.txt && git add catatan.txt && git commit -m 'awal'"
        penjelasan: "Menyimpan keadaan pertama. Tiga langkah: tulis berkas, tandai untuk disimpan, simpan dengan pesan."
      - perintah: "printf 'baris kedua\\n' >> catatan.txt && cat catatan.txt"
        penjelasan: "Menambah baris kedua. Output menunjukkan dua baris — berkas sudah berubah dari keadaan commit."
      - perintah: "git checkout -- catatan.txt && cat catatan.txt"
        penjelasan: "Mengembalikan berkas ke keadaan commit terakhir. Output kembali satu baris — perubahan yang belum di-commit hilang."
      - perintah: "git log --oneline"
        penjelasan: "Menampilkan riwayat. Hanya satu commit 'awal' — perubahan tadi tidak pernah masuk riwayat, karena itu ia bisa dibuang tanpa jejak."
    hasil: |
      baris pertama
      baris kedua
      baris pertama
      <hash> awal
    cek_berhasil:
      - "Langkah 3 mencetak dua baris"
      - "Langkah 4 mencetak satu baris — perubahan hilang"
      - "Langkah 5 hanya menampilkan satu commit"
    kalau_gagal:
      - error: "fatal: not a git repository (or any of the parent directories): .git"
        arti: "Perintah git dijalankan di folder yang bukan repositori."
        perbaikan:
          - "Pastikan sudah cd latihan-git sebelum perintah git"
          - "Cek dengan ls -a — folder .git harus ada"
      - error: "Author identity unknown"
        arti: "Git belum tahu nama dan email untuk mencatat commit."
        perbaikan:
          - "git config --global user.name \"Nama Kamu\""
          - "git config --global user.email \"email@contoh.com\""
      - error: "error: pathspec 'catatan.txt' did not match any file(s) known to git"
        arti: "Berkas belum pernah di-commit, jadi tidak ada keadaan lama untuk dikembalikan."
        perbaikan:
          - "Commit dulu: git add catatan.txt && git commit -m 'awal'"
    buktikan:
      perubahan: "Ulangi langkah 3 dan 4, tapi kali ini commit dulu setelah menambah baris kedua, baru jalankan git checkout -- catatan.txt."
      hasil_diharapkan: "Isi berkas TETAP dua baris — karena perubahan sudah masuk riwayat, checkout mengembalikan ke commit terakhir yang berisi dua baris. Inilah bedanya 'belum disimpan' dan 'sudah disimpan'."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Kamu mengubah tiga berkas, lalu menjalankan git add satu berkas saja dan commit. Apa yang tersimpan?"
    opsi:
      a: "Ketiga berkas, karena git menyimpan semua perubahan"
      b: "Hanya berkas yang di-add; dua lainnya tetap sebagai perubahan belum tersimpan"
      c: "Tidak ada yang tersimpan"
      d: "Semua berkas kecuali yang di-add"
    jawaban: b
    penjelasan: "git add menentukan apa yang masuk commit berikutnya. Dua berkas lain tetap ada di folder kerja dengan perubahan utuh, tapi tidak masuk riwayat. Ini justru fitur: kamu bisa memisahkan perubahan yang tidak berhubungan menjadi beberapa commit yang rapi."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa commit sebaiknya kecil dan satu topik, bukan satu commit besar berisi sepuluh perubahan?"
    opsi:
      a: "Supaya lebih cepat di-push"
      b: "Supaya perubahan yang merusak bisa ditemukan dan dikembalikan tanpa membuang perubahan lain"
      c: "Karena git membatasi ukuran commit"
      d: "Supaya riwayat terlihat panjang"
    jawaban: b
    penjelasan: "Kalau satu commit berisi sepuluh perubahan dan salah satunya merusak, mengembalikannya berarti membuang sembilan perubahan yang benar. Commit kecil membuat git bisect bisa menunjuk commit penyebab dalam beberapa langkah, dan revert hanya membatalkan satu hal."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Perintah untuk melihat riwayat commit dalam bentuk satu baris per commit adalah git ... --oneline (satu kata)"
    jawaban: "log"
    penjelasan: "git log menampilkan riwayat; --oneline memadatkannya jadi satu baris per commit berisi hash pendek dan pesan. Ini bentuk yang paling sering dipakai untuk melihat apa yang sudah terjadi tanpa membanjiri layar."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Apa akibat menjalankan git checkout -- berkas.txt pada berkas yang punya perubahan belum di-commit?"
    opsi:
      a: "Perubahan disimpan ke commit baru"
      b: "Perubahan hilang tanpa bisa dikembalikan lewat git"
      c: "Berkas dihapus dari folder"
      d: "Perubahan dipindah ke berkas lain"
    jawaban: b
    penjelasan: "checkout mengembalikan berkas ke keadaan commit terakhir. Perubahan yang belum di-commit tidak pernah masuk riwayat, jadi git tidak punya salinannya. Karena itu: commit dulu sebelum melakukan operasi yang menimpa, atau pakai git stash kalau ingin menyimpannya sementara."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Folder yang dibuat git init untuk menyimpan seluruh riwayat disebut apa? (tiga huruf dengan titik)"
    jawaban: ".git"
    penjelasan: "Folder .git berisi semua objek, referensi, dan konfigurasi repositori. Menghapusnya berarti menghapus seluruh riwayat — berkas tetap ada, tapi git tidak lagi mengenalnya. Inilah kenapa .git tidak boleh ikut dicadangkan sebagai berkas biasa, tapi sebagai repositori."
    tingkat: dasar
---

## Lapis 1

### Git menyimpan keadaan, bukan berkas

Kebanyakan orang mengira git menyimpan daftar perubahan pada berkas. Yang sebenarnya disimpan adalah **potret keadaan** — seluruh isi folder pada satu titik waktu, ditambah catatan siapa, kapan, dan kenapa.

Konsekuensinya penting: kamu bisa kembali ke keadaan mana pun, bukan hanya membatalkan satu perubahan terakhir.

### Tiga tahap yang menjelaskan semuanya

```
folder kerja  →  area siap (staging)  →  riwayat (commit)
   (ubah)          (git add)              (git commit)
```

- **Folder kerja** — berkas yang kamu sunting. Git melihat perubahannya, tapi belum menyimpannya.
- **Area siap** — berkas yang ditandai untuk masuk commit berikutnya. `git add`.
- **Riwayat** — potret yang tersimpan permanen. `git commit`.

Hampir semua kebingungan soal git hilang begitu tiga tahap ini jelas. `git status` menunjukkan berkas mana berada di tahap mana.

### Empat perintah yang cukup untuk 90% pekerjaan

| Perintah | Gunanya |
|---|---|
| `git status` | Apa yang berubah, apa yang sudah siap |
| `git diff` | Apa persisnya yang berubah, baris per baris |
| `git add <berkas>` | Tandai untuk commit berikutnya |
| `git commit -m "pesan"` | Simpan sebagai potret |

Empat ini cukup untuk bekerja. Perintah lain menambah kenyamanan, bukan kemampuan dasar.

### Commit yang baik

Pesan commit menjawab **kenapa**, bukan **apa**. "Ubah tombol" tidak berguna — git sudah tahu kamu mengubah tombol. "Perbaiki tombol simpan yang tidak jalan saat nama kosong" memberi tahu pembaca (termasuk kamu enam bulan nanti) alasan perubahannya.

Aturan praktis: satu commit, satu alasan. Kalau kamu kesulitan menulis pesannya dalam satu kalimat, mungkin itu dua commit.

### Yang tidak boleh masuk repositori

Berkas yang berubah sendiri atau memuat rahasia:

- `node_modules/` — bisa dipasang ulang dari `package.json`
- `.env` — memuat kunci API dan kata sandi
- Berkas hasil build (`dist/`, `.next/`) — dihasilkan dari kode

Daftarnya di `.gitignore`. Kesalahan yang paling mahal: `.env` sudah ter-commit. Menghapusnya dari commit terakhir tidak cukup — ia tetap ada di riwayat, dan siapa pun bisa membacanya. Kuncinya harus diganti.

### Kenapa ini penting untuk belajar

Tanpa git, satu-satunya cara kembali ke kode yang berfungsi adalah mengingat apa yang diubah. Dengan git, kamu bisa mencoba pendekatan berani, dan kalau gagal, kembali dalam satu perintah.

Itu mengubah cara belajar: kamu berani mencoba, karena percobaan tidak lagi berisiko.

## Lapis 2

### Alur kerja yang bisa dipertahankan

```bash
git status                    # apa yang berubah
git diff                      # baca perubahannya
git add berkas-yang-relevan   # tandai SATU topik
git diff --staged             # periksa apa yang akan disimpan
git commit -m "alasan perubahan"
```

`git diff --staged` adalah langkah yang paling sering dilewati dan paling berguna: ia menunjukkan persis apa yang akan masuk commit. Di sinilah kamu menangkap berkas yang tidak sengaja ter-add.

### `git add -p`: memilih sebagian perubahan

Kalau satu berkas memuat dua perubahan yang tidak berhubungan, `git add -p` memungkinkan memilih per potongan:

```bash
git add -p berkas.txt
# y = masukkan potongan ini
# n = lewati
# s = pecah jadi potongan lebih kecil
# q = berhenti
```

Hasilnya dua commit yang masing-masing satu topik, dari satu berkas yang sama. Ini yang membuat riwayat berguna saat mencari penyebab bug nanti.

### Membatalkan pada tiap tahap

Setiap tahap punya cara pembatalannya sendiri:

| Tahap | Perintah | Akibat |
|---|---|---|
| Folder kerja | `git checkout -- berkas` | Perubahan hilang, tidak bisa dikembalikan |
| Folder kerja (simpan dulu) | `git stash` | Perubahan disimpan, bisa diambil lagi |
| Area siap | `git restore --staged berkas` | Dikeluarkan dari staging, perubahan tetap ada |
| Commit terakhir (belum di-push) | `git reset --soft HEAD~1` | Commit dibatalkan, perubahan kembali ke staging |
| Commit yang sudah di-push | `git revert <hash>` | Membuat commit baru yang membatalkan yang lama |

`git revert` dipakai untuk commit yang sudah dibagikan, karena ia tidak menulis ulang riwayat. `git reset` menulis ulang — aman hanya pada commit yang belum pernah di-push ke orang lain.

### Branch: bekerja tanpa mengganggu yang berfungsi

```bash
git switch -c fitur-baru     # buat branch dan pindah ke sana
# ... kerja, commit ...
git switch main              # kembali ke main
git merge fitur-baru         # gabungkan
```

Branch adalah penunjuk ke satu commit, bukan salinan folder. Membuat branch nyaris gratis — itu sebabnya alur kerja yang umum adalah satu branch per fitur, bukan bekerja langsung di `main`.

Aturan praktis: `main` harus selalu dalam keadaan bisa dijalankan. Kalau sedang mengerjakan sesuatu yang belum selesai, kerjakan di branch.

### Konflik merge: apa yang sebenarnya terjadi

Konflik muncul ketika dua branch mengubah **baris yang sama**. Git tidak bisa memilih, jadi ia menyerahkan keputusan itu.

```
<<<<<<< HEAD
baris versi branch kamu
=======
baris versi branch lain
>>>>>>> fitur-baru
```

Penyelesaiannya: pilih satu, atau gabungkan keduanya, lalu hapus penandanya. Setelah itu `git add` dan `git commit`.

Yang perlu diingat: konflik bukan error, melainkan pertanyaan. Git sedang bertanya "maksudmu yang mana?".

### Melihat apa yang terjadi

```bash
git log --oneline --graph --all     # bentuk riwayat
git log -p berkas.txt               # riwayat satu berkas, dengan perubahannya
git blame berkas.txt                # siapa mengubah baris mana, kapan
git diff main..fitur-baru           # apa bedanya dua branch
```

`git blame` sering ditakuti karena terdengar seperti mencari kesalahan. Fungsinya sebenarnya berbeda: ia menunjukkan **kapan dan kenapa** sebuah baris menjadi seperti sekarang. Itu informasi yang tidak bisa didapat dari membaca kode saja.

### Daftar periksa

1. `.gitignore` ada dan memuat `.env`, dependensi, hasil build.
2. Tidak ada rahasia di riwayat (`git log -p | grep -i "api_key"`).
3. Commit kecil, satu topik, pesan menjelaskan alasan.
4. `git diff --staged` diperiksa sebelum commit.
5. `main` selalu bisa dijalankan.
6. Pekerjaan belum selesai dikerjakan di branch, bukan di `main`.
7. Tahu beda `reset` dan `revert`, dan kapan masing-masing aman.
