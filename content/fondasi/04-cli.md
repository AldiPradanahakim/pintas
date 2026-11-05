---
track: fondasi
nomor: 4
judul: "CLI: menyambung program kecil, bukan mencari satu program besar"
slug: cli
estimasi_menit: 12
prasyarat: ["fondasi/git"]
latihan:
  - id: fondasi-04-latihan-1
    jenis: web
    bahasa: python
    soal: "Padanan pipe di Python: diberi daftar baris perintah, ambil kata pertamanya (nama program), hitung berapa kali tiap program dipakai, lalu cetak urut dari yang paling sering; kalau jumlahnya sama, urut abjad. Format satu baris: '<program> <jumlah>'."
    kode_awal: |
      perintah = [
          "git status", "git add -A", "npm test",
          "git commit -m x", "npm run build", "grep -r TODO .",
      ]

      # ambil kata pertama tiap baris, hitung, urut (-jumlah, nama)
    output_harapan: |
      git 3
      npm 2
      grep 1
    solusi: |
      perintah = [
          "git status", "git add -A", "npm test",
          "git commit -m x", "npm run build", "grep -r TODO .",
      ]

      jumlah = {}
      for baris in perintah:
          program = baris.split()[0]
          jumlah[program] = jumlah.get(program, 0) + 1

      for nama, n in sorted(jumlah.items(), key=lambda x: (-x[1], x[0])):
          print(nama, n)
    catatan_solusi: "Ini `cut -d' ' -f1 | sort | uniq -c | sort -rn` yang ditulis di Python. Kunci urutan adalah tuple (-n, nama): angka dibalik supaya besar di atas, nama tetap naik supaya hasilnya tidak berubah-ubah antar-jalan. Tanpa kunci kedua, urutan program berjumlah sama bergantung pada urutan penyisipan kamus."
  - id: fondasi-04-latihan-2
    jenis: laptop
    soal: "Latih tiga hal yang membuat CLI berguna: pipe untuk menyambung program, kode keluar untuk tahu berhasil atau tidak, dan redirect untuk memisahkan data dari pesan galat. Semua perintah dijalankan di git-bash."
    kebutuhan:
      - "git-bash (ikut terpasang bersama Git for Windows) atau bash di Linux/macOS"
      - "awk, grep, sort — sudah ada di git-bash"
    langkah:
      - perintah: "mkdir latihan-cli && cd latihan-cli"
        penjelasan: "Folder kerja terpisah. `mkdir` gagal kalau folder sudah ada — itu kode keluar bukan nol, bukan bencana."
      - perintah: "printf 'ani 45000\\nbudi 120000\\nani 80000\\n' > pesanan.txt"
        penjelasan: "Tanda > mengalihkan keluaran printf ke berkas. Tidak ada yang tercetak di layar karena keluarannya masuk ke berkas, bukan ke terminal."
      - perintah: "awk '{s[$1]+=$2} END {for (n in s) print n, s[n]}' pesanan.txt | sort -k2 -nr"
        penjelasan: "awk menjumlahkan kolom kedua per nama, lalu pipa | menyerahkan hasilnya ke sort. -k2 berarti urutkan menurut kolom kedua, -n angka, -r menurun. Dua program kecil, satu hasil yang tidak dibuat salah satunya sendirian."
      - perintah: "grep -c ani pesanan.txt; echo \"exit=$?\""
        penjelasan: "grep -c menghitung baris yang cocok. $? berisi kode keluar perintah sebelumnya: 0 berarti berhasil. Inilah cara skrip tahu hasilnya tanpa membaca teks."
      - perintah: "grep -c citra pesanan.txt; echo \"exit=$?\""
        penjelasan: "Tidak ada baris yang cocok. grep mencetak 0 DAN keluar dengan kode 1 — 'tidak ditemukan' dianggap kegagalan. Ini jebakan nyata: skrip yang memakai grep di dalam if akan menganggap 'tidak ada' sebagai error."
      - perintah: "wc -l < pesanan.txt"
        penjelasan: "Redirect masuk < memberi isi berkas sebagai masukan wc. Bedanya dengan `wc -l pesanan.txt`: yang ini hanya mencetak angka, tanpa nama berkas, karena wc tidak tahu nama berkasnya."
    hasil: |
      ani 125000
      budi 120000
      2
      exit=0
      0
      exit=1
      3
    cek_berhasil:
      - "Langkah 3 mencetak ani 125000 lalu budi 120000 — ani di atas karena 45000+80000 lebih besar"
      - "Langkah 4 mencetak 2 dan exit=0"
      - "Langkah 5 mencetak 0 dan exit=1 — bukan exit=0"
      - "Langkah 6 mencetak 3 saja, tanpa nama berkas"
    kalau_gagal:
      - error: "mkdir: cannot create directory 'latihan-cli': File exists"
        arti: "Folder sudah ada dari percobaan sebelumnya."
        perbaikan:
          - "Masuk saja: cd latihan-cli"
          - "Atau pakai nama lain: mkdir latihan-cli-2"
      - error: "awk: cmd. line:1: fatal: cannot open file `pesanan.txt' for reading"
        arti: "Berkas tidak ada di folder sekarang — biasanya karena cd ke folder lain atau langkah 2 terlewat."
        perbaikan:
          - "Cek dengan ls, pastikan pesanan.txt ada"
          - "Ulangi langkah 2 di folder yang sama"
      - error: "sort: -k2: invalid option"
        arti: "Kamu memakai sort dari Windows (bukan git-bash), yang punya opsi berbeda."
        perbaikan:
          - "Jalankan di git-bash, bukan cmd.exe atau PowerShell"
          - "Kalau tetap gagal, ganti ke: sort -t' ' -k2,2nr"
    buktikan:
      perubahan: "Hapus `| sort -k2 -nr` dari langkah 3 dan jalankan ulang."
      hasil_diharapkan: "Urutannya berubah mengikuti urutan kemunculan di berkas (ani lalu budi di sini kebetulan sama), dan yang lebih penting: tidak ada lagi jaminan urutan. Tambahkan baris baru ke pesanan.txt lalu jalankan dua versi — versi ber-pipe tetap urut menurut nilai, versi tanpa pipe mengikuti urutan baris."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Apa yang dilakukan tanda pipa `|`?"
    opsi:
      a: "Menjalankan dua perintah bersamaan di dua terminal"
      b: "Menyerahkan keluaran program kiri sebagai masukan program kanan"
      c: "Menyimpan keluaran program kiri ke berkas"
      d: "Menggabungkan dua berkas"
    jawaban: b
    penjelasan: "Pipe menyambung stdout program kiri ke stdin program kanan, tanpa berkas perantara. Ini ide inti Unix: banyak program kecil yang melakukan satu hal, disambung menjadi alur. Menyimpan ke berkas adalah tugas `>`, bukan `|`."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Sebuah perintah selesai dan `echo $?` mencetak 0. Apa artinya?"
    opsi:
      a: "Perintah tidak menghasilkan keluaran"
      b: "Perintah berhasil"
      c: "Perintah gagal dengan satu galat"
      d: "Perintah belum dijalankan"
    jawaban: b
    penjelasan: "Kode keluar 0 berarti berhasil; selain 0 berarti gagal, dan angkanya menunjukkan jenis kegagalan (1 kesalahan umum, 2 salah pemakaian, 127 perintah tidak ditemukan). Skrip dan CI mengambil keputusan dari angka ini, bukan dari teks yang tercetak — karena itu perintah yang 'cetakannya bagus' tetap bisa dianggap gagal."
    tingkat: dasar
  - tipe: isian_singkat
    pertanyaan: "Kode keluar yang muncul saat perintah yang kamu tulis tidak ada di PATH adalah ... (tiga digit)"
    jawaban: "127"
    penjelasan: "127 berarti shell tidak menemukan programnya. 126 berarti berkasnya ada tapi tidak bisa dieksekusi (misalnya izinnya kurang). Membedakan keduanya langsung menunjuk penyebabnya: salah ketik nama, atau salah izin berkas."
    tingkat: menengah
  - tipe: pilihan_ganda
    pertanyaan: "Kamu menjalankan `grep -c citra pesanan.txt` dan hasilnya 0 baris. Kenapa skrip yang memeriksa `if grep ...; then` menganggap ini kegagalan?"
    opsi:
      a: "Karena grep selalu keluar dengan kode 1"
      b: "Karena grep keluar dengan kode 1 saat tidak ada baris yang cocok, dan if membaca kode keluar"
      c: "Karena angka 0 dianggap salah oleh bash"
      d: "Karena berkasnya kosong"
    jawaban: b
    penjelasan: "grep memakai kode keluar sebagai hasil pencarian: 0 ada yang cocok, 1 tidak ada, 2 terjadi galat. `if` menilai kode keluar, bukan keluarannya. Jadi 'tidak ditemukan' dan 'berkas rusak' harus dibedakan — karena itu kode 2 ada, dan karena itu banyak skrip memakai `grep -q` plus pemeriksaan kode secara eksplisit."
    tingkat: menengah
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa `rm -rf $DIR/` berbahaya padahal terlihat wajar?"
    opsi:
      a: "Karena rm tidak bisa menghapus folder"
      b: "Karena kalau variabel DIR kosong, perintahnya menjadi `rm -rf /`"
      c: "Karena -r dan -f tidak boleh dipakai bersama"
      d: "Karena $DIR selalu berisi spasi"
    jawaban: b
    penjelasan: "Variabel yang kosong dan tidak dikutip akan hilang dari perintah, menyisakan `rm -rf /`. Kebiasaan yang mencegahnya: kutip variabel (`\"$DIR\"`), pakai `set -u` supaya variabel kosong langsung jadi galat, dan uji dulu dengan `echo` sebelum menjalankan perintah yang menghapus."
    tingkat: lanjutan
---

## Lapis 1

### CLI bukan kumpulan perintah hafalan

Kebanyakan orang belajar CLI sebagai daftar hafalan: `ls`, `cd`, `cp`, `mv`, lalu berhenti di situ dan kembali membuka file manager untuk hal yang sedikit lebih rumit.

Yang membuat CLI kuat bukan jumlah perintahnya, tapi satu sifat: **setiap program membaca dari stdin, menulis ke stdout, dan melaporkan hasil lewat kode keluar.** Karena semuanya memakai bentuk yang sama, program apa pun bisa disambung dengan program apa pun.

```
catatan.txt  →  grep TODO  →  sort  →  wc -l
              (saring)       (urut)    (hitung)
```

Tiga program kecil, masing-masing tidak tahu apa-apa tentang yang lain, menghasilkan satu jawaban. Tidak ada yang perlu "mengerti" keseluruhan alur.

### Tiga saluran, bukan satu

Setiap program punya tiga saluran:

| Saluran | Nomor | Isinya | Diarahkan dengan |
|---|---|---|---|
| stdin | 0 | masukan | `<` |
| stdout | 1 | hasil normal | `>` atau `\|` |
| stderr | 2 | pesan galat | `2>` |

Pemisahan ini bukan detail kosmetik. Kalau galat ikut masuk ke stdout, hasil pencarianmu akan tercampur pesan seperti "berkas tidak ditemukan" dan skrip yang memprosesnya akan salah hitung.

```bash
# hasil ke berkas, galat tetap di layar
grep -r TODO . > hasil.txt

# buang galat, simpan hasil
grep -r TODO . 2> /dev/null

# simpan keduanya, galat di berkas terpisah
grep -r TODO . > hasil.txt 2> galat.txt
```

### Kode keluar: bagaimana program bicara ke skrip

Setiap perintah mengembalikan satu angka 0–255. `0` berhasil, selain itu gagal.

```bash
npm test && git commit -m "lulus"      # commit hanya kalau test lulus
npm test || echo "test merah"          # jalankan kanan kalau kiri gagal
```

`&&` dan `||` membaca kode keluar, bukan teks. Inilah kenapa "cetakannya bagus" tidak berarti berhasil: program bisa mencetak ringkasan yang terlihat normal lalu keluar dengan kode 1.

Angka yang sering muncul: `1` kesalahan umum, `2` salah pemakaian argumen, `126` tidak bisa dieksekusi, `127` perintah tidak ditemukan, `130` dihentikan Ctrl+C, dan `128+n` berarti dihentikan sinyal nomor n.

### Tiga perintah yang menutup sebagian besar kebutuhan

**`grep` — mencari teks.**

```bash
grep -rn "TODO" src/          # -r rekursif, -n tampilkan nomor baris
grep -c "error" log.txt       # hitung baris yang cocok
grep -v "DEBUG" log.txt       # buang baris yang cocok
```

**`find` — mencari berkas.**

```bash
find . -name "*.md" -newer catatan.md
find . -type f -size +10M
```

**`xargs` — mengubah daftar menjadi argumen.**

```bash
find . -name "*.tmp" | xargs rm
```

Hati-hati: kalau nama berkas mengandung spasi, `xargs` memecahnya jadi dua argumen. Versi aman memakai `-print0` dan `xargs -0`.

### Kutip: sumber bug yang paling sering di terminal

```bash
nama="file saya.txt"
rm $nama        # SALAH: menghapus "file" dan "saya.txt"
rm "$nama"      # BENAR: menghapus satu berkas
```

Tanpa kutip, shell memecah nilai menurut spasi. Kutip tunggal (`'...'`) membuat semuanya harfiah; kutip ganda (`"..."`) tetap mengembangkan `$variabel`. Aturan praktis: **selalu kutip variabel**, kecuali kamu sengaja ingin pemecahan kata.

## Lapis 2

### Globbing dan bahayanya

`*` dikembangkan oleh shell **sebelum** perintah dijalankan. `rm *.log` menjadi `rm a.log b.log c.log`. Kalau tidak ada yang cocok, bash meneruskan `*.log` apa adanya — dan perintahnya gagal dengan pesan aneh.

Yang berbahaya: `rm -rf $DIR/` dengan `DIR` kosong menjadi `rm -rf /`. Pencegahnya tiga lapis:

```bash
set -u                      # variabel kosong = galat, bukan string kosong
set -o pipefail             # kegagalan di tengah pipe ikut terdeteksi
echo "akan menghapus: $DIR" # lihat dulu sebelum menghapus
```

`set -euo pipefail` di awal skrip adalah kebiasaan yang layak dipakai: berhenti saat ada yang gagal, tolak variabel kosong, dan jangan sembunyikan kegagalan di tengah pipe.

### Pipe hanya meneruskan stdout

```bash
grep -r TODO . | wc -l
```

Kalau folder berisi berkas yang tidak bisa dibaca, pesan galatnya muncul di layar dan **tidak** ikut terhitung — karena stderr tidak melewati pipe. Ini sering disalahpahami sebagai "grep-nya bekerja sebagian"; sebenarnya ia bekerja, hanya saja sebagian masukannya tidak terbaca.

### Perintah panjang: baca bantuannya, jangan menebak

```bash
man grep        # halaman manual (di git-bash: kurang lengkap)
grep --help     # ringkasan opsi
tldr tar        # contoh praktis, kalau terpasang
```

Kebiasaan yang menghemat waktu: kalau sebuah perintah menolak argumen, baca `--help` sebelum mencoba variasi acak. Opsi yang kamu butuhkan hampir selalu ada di sana, dengan nama yang tidak akan kamu tebak.

### Riwayat dan pencarian riwayat

```bash
history | grep ssh        # cari perintah lama
Ctrl+R                    # cari riwayat secara interaktif
!!                        # ulangi perintah terakhir
sudo !!                   # ulangi perintah terakhir dengan sudo
```

`Ctrl+R` adalah satu-satunya hal di daftar ini yang mengubah cara kerja harian secara nyata: kamu berhenti mengetik ulang perintah panjang yang pernah berhasil.

### Variabel PATH: kenapa "command not found"

Shell mencari perintah di daftar folder pada `PATH`, dari kiri ke kanan.

```bash
echo "$PATH" | tr ':' '\n'    # lihat daftarnya, satu folder per baris
which node                    # folder mana yang dipakai
```

Kalau dua versi program terpasang, yang jalan adalah yang **paling kiri** di PATH. Ini penjelasan paling umum untuk "sudah install tapi versinya masih yang lama": versi baru masuk ke folder yang urutannya di belakang versi lama.

### Berkas konfigurasi shell

| Berkas | Kapan dibaca |
|---|---|
| `~/.bashrc` | setiap shell interaktif baru (bash) |
| `~/.bash_profile` | saat login (bash) |
| `~/.zshrc` | setiap shell interaktif (zsh) |

Alias dan perubahan `PATH` biasanya ditaruh di sini. Perubahan baru berlaku di shell berikutnya — jalankan `source ~/.bashrc` untuk memakainya di shell sekarang.

### Windows: git-bash, PowerShell, dan WSL

Tiga pilihan, masing-masing dengan aturan berbeda:

- **git-bash** — bash sungguhan dengan utilitas GNU. Path ditulis `/c/Users/...`. Paling dekat dengan tutorial Linux.
- **PowerShell** — shell bawaan Windows. Perintahnya beda (`Get-ChildItem`, bukan `ls`), pipe meneruskan objek, bukan teks.
- **WSL** — Linux sungguhan di dalam Windows. Paling dekat dengan server produksi.

Jangan mencampur: perintah yang jalan di satu belum tentu jalan di yang lain. Kalau panduan menyebut `awk`, `grep`, atau `sed`, jalankan di git-bash atau WSL — bukan di PowerShell.

### Daftar periksa

1. Setiap variabel dikutip; `set -euo pipefail` dipakai di skrip.
2. Galat dipisahkan dari hasil (`2>`), tidak dicampur ke stdout.
3. Keputusan skrip diambil dari kode keluar, bukan dari teks keluaran.
4. Perintah yang menghapus diuji dengan `echo` lebih dulu.
5. `PATH` diperiksa dengan `which` saat versi program tidak sesuai dugaan.
6. `--help` dibaca sebelum mencoba opsi acak.
7. Shell yang dipakai konsisten dengan sintaks panduan yang diikuti.
