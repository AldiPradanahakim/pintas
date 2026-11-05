/**
 * Bank tanya jawab interview per track (PRD F-09 / halaman H6).
 *
 * Jawaban disimpan di sini dan dirender di balik `<details>` — bukan karena rahasia,
 * tapi supaya pembaca bisa mencoba menjawab dulu. Berbeda dengan kunci kuis, isi ini
 * memang ikut ke HTML: sengaja, karena tujuannya belajar, bukan menilai.
 */

export type TingkatInterview = 'dasar' | 'menengah' | 'lanjutan';

export interface PertanyaanInterview {
  /** Id stabil, dipakai sebagai kunci localStorage "sudah dikuasai". */
  id: string;
  topik: string;
  tingkat: TingkatInterview;
  tanya: string;
  jawab: string;
}

export const INTERVIEW: Record<string, PertanyaanInterview[]> = {
  'ai-llm': [
    {
      id: 'ai-01',
      topik: 'Dasar model',
      tingkat: 'dasar',
      tanya: 'Apa itu token, dan kenapa jumlahnya penting?',
      jawab:
        'Token adalah potongan teks yang dihitung model — bisa satu kata, sebagian kata, atau tanda baca. Penting karena tiga hal diukur dengan token, bukan huruf: batas konteks (berapa banyak yang bisa masuk sekaligus), biaya (harga per 1.000 token), dan kecepatan (token per detik). Teks Indonesia umumnya memakai lebih banyak token per kata daripada bahasa Inggris karena tokenizer dilatih dominan pada teks Inggris, jadi biaya untuk konten Indonesia lebih tinggi dari perkiraan.',
    },
    {
      id: 'ai-02',
      topik: 'Dasar model',
      tingkat: 'dasar',
      tanya: 'Apa bedanya context window dengan memori percakapan?',
      jawab:
        'Context window adalah batas keras berapa token yang bisa diproses model dalam satu panggilan. Memori percakapan hanyalah ilusi yang dibuat aplikasi: setiap kali kamu mengirim pesan, aplikasi mengirim ulang seluruh riwayat yang muat di context window. Model sendiri tidak mengingat apa pun antar panggilan — begitu percakapan melewati batas, bagian paling lama harus dibuang atau diringkas, dan di situlah informasi hilang.',
    },
    {
      id: 'ai-03',
      topik: 'Dasar model',
      tingkat: 'menengah',
      tanya: 'Kenapa model bisa menghasilkan jawaban salah dengan sangat yakin?',
      jawab:
        'Karena model memprediksi token berikutnya berdasarkan pola, bukan memeriksa fakta. Tidak ada mekanisme internal yang membedakan "saya tahu ini" dari "ini terdengar masuk akal". Kelancaran kalimat dan kebenaran isi adalah dua hal terpisah, dan model hanya dioptimalkan untuk yang pertama. Karena itu aplikasi serius menambahkan verifikasi dari luar model: kutipan sumber, pemeriksaan skema, atau pencocokan dengan database.',
    },
    {
      id: 'ai-04',
      topik: 'Embedding',
      tingkat: 'dasar',
      tanya: 'Apa itu embedding, dan kenapa dua teks yang mirip punya jarak kecil?',
      jawab:
        'Embedding adalah vektor angka (biasanya 768–3072 dimensi) yang mewakili makna sebuah teks. Model embedding dilatih supaya teks dengan makna mirip menghasilkan vektor yang berdekatan. Jarak biasanya diukur dengan cosine similarity. Yang penting dipahami: kedekatan itu mengukur kemiripan makna, bukan kebenaran — dua kalimat yang saling membantah bisa sangat dekat karena membicarakan hal yang sama.',
    },
    {
      id: 'ai-05',
      topik: 'Embedding',
      tingkat: 'menengah',
      tanya: 'Kapan pencarian kata kunci lebih baik daripada pencarian vektor?',
      jawab:
        'Untuk nama diri, kode, angka, dan istilah persis. Nama fungsi seperti `useEffect`, kode error `EADDRINUSE`, atau nomor ayat tidak punya "makna" yang bisa di-embed — yang dicari adalah kecocokan persis. Vektor juga lemah untuk negasi ("tanpa", "kecuali") karena maknanya dekat dengan versi positifnya. Praktik yang lazim: gabungkan keduanya (hybrid), lalu gabungkan peringkatnya dengan reciprocal rank fusion.',
    },
    {
      id: 'ai-06',
      topik: 'RAG',
      tingkat: 'dasar',
      tanya: 'Jelaskan alur RAG dari pertanyaan sampai jawaban.',
      jawab:
        'Pertanyaan pengguna di-embed, lalu dicari chunk yang paling dekat di indeks (biasanya top-k). Chunk itu disisipkan ke prompt bersama pertanyaannya, dan model diminta menjawab berdasarkan chunk tersebut. Hasilnya dikembalikan bersama kutipan. Yang perlu ditegaskan: RAG tidak mengubah pengetahuan model, ia hanya memberi konteks pada satu panggilan. Kalau retrieval salah, jawabannya salah meski modelnya bagus.',
    },
    {
      id: 'ai-07',
      topik: 'RAG',
      tingkat: 'menengah',
      tanya: 'Jawaban RAG salah padahal dokumennya ada di indeks. Di mana kamu mulai memeriksa?',
      jawab:
        'Mulai dari retrieval, bukan dari prompt. Periksa: apakah chunk yang benar masuk ke top-k untuk pertanyaan itu. Kalau tidak masuk, masalahnya di embedding, chunking, atau query — bukan di model. Kalau masuk tapi jawabannya tetap salah, baru periksa prompt (apakah chunk-nya benar-benar disisipkan, apakah instruksinya jelas) dan baru model. Urutan ini penting: sebagian besar keluhan "RAG-nya bodoh" sebenarnya masalah retrieval.',
    },
    {
      id: 'ai-08',
      topik: 'RAG',
      tingkat: 'menengah',
      tanya: 'Bagaimana menentukan ukuran chunk?',
      jawab:
        'Tidak ada angka yang benar secara umum — yang menentukan adalah struktur dokumennya. Chunk terlalu kecil kehilangan konteks (satu paragraf terpotong di tengah argumen); terlalu besar mencampur banyak topik sehingga vektornya jadi kabur dan satu chunk memakan jatah konteks. Praktik awal: 300–800 token dengan overlap 10–15%, lalu ukur recall. Kalau dokumennya punya struktur jelas (heading, fungsi), potong di batas struktur itu, bukan di jumlah karakter.',
    },
    {
      id: 'ai-09',
      topik: 'Evaluasi',
      tingkat: 'menengah',
      tanya: 'Bagaimana kamu membuktikan sistem RAG-mu bekerja, bukan hanya "kelihatan bagus"?',
      jawab:
        'Dengan set evaluasi tetap: minimal 10–20 pasangan pertanyaan dan jawaban acuan yang dibuat sebelum sistem dibangun. Ukur dua hal terpisah — recall retrieval (apakah chunk yang benar masuk top-k) dan kebenaran jawaban akhir. Jalankan setiap kali ada perubahan, catat angkanya. Tanpa set tetap, setiap perubahan terasa seperti peningkatan karena kamu mengingat contoh yang berhasil.',
    },
    {
      id: 'ai-10',
      topik: 'Prompt',
      tingkat: 'dasar',
      tanya: 'Apa itu prompt injection, dan kenapa berbeda dari SQL injection?',
      jawab:
        'Prompt injection terjadi saat teks yang dimasukkan pengguna (atau isi dokumen) dibaca model sebagai instruksi. Bedanya dengan SQL injection: pada SQL ada pemisahan tegas antara kode dan data (parameter binding), sedangkan pada prompt keduanya memakai saluran yang sama — bahasa alami. Karena itu tidak ada perbaikan yang setara parameter binding. Mitigasinya bersifat mengurangi risiko: batasi wewenang (model tidak boleh melakukan aksi berbahaya tanpa konfirmasi), tandai sumber teks, dan jangan pernah memberi model akses tulis tanpa pemeriksaan.',
    },
    {
      id: 'ai-11',
      topik: 'Prompt',
      tingkat: 'menengah',
      tanya: 'Kenapa output model tidak boleh langsung dipercaya sebagai JSON?',
      jawab:
        'Karena model menghasilkan teks, dan JSON yang dihasilkan bisa saja tidak valid — tanda kutip hilang, koma berlebih, atau field yang diminta tidak ada. Mempercayainya berarti aplikasi bisa crash karena satu keluaran aneh. Praktiknya: minta format ketat, lalu validasi dengan skema (misalnya Zod); kalau gagal, ulangi dengan pesan kesalahan, dan setelah beberapa percobaan berhenti dengan galat yang jelas. Untuk kasus serius, pakai mode structured output yang disediakan penyedia.',
    },
    {
      id: 'ai-12',
      topik: 'Biaya',
      tingkat: 'dasar',
      tanya: 'Bagaimana kamu menekan biaya API model bahasa tanpa mengorbankan mutu?',
      jawab:
        'Tiga tuas utama: (1) kurangi token yang dikirim — ringkas riwayat, kirim hanya chunk yang relevan, jangan menempelkan seluruh dokumen; (2) pakai model lebih kecil untuk tugas mudah (klasifikasi, ekstraksi) dan model besar hanya untuk penalaran; (3) cache hasil untuk pertanyaan yang berulang. Yang paling sering diabaikan adalah (1): prompt sistem yang panjang dikirim ulang setiap panggilan, dan biayanya menumpuk tanpa terasa.',
    },
    {
      id: 'ai-13',
      topik: 'Operasional',
      tingkat: 'lanjutan',
      tanya: 'Apa yang kamu catat di log aplikasi LLM, dan apa yang tidak boleh dicatat?',
      jawab:
        'Yang dicatat: id permintaan, model dan versi, jumlah token masuk dan keluar, durasi, biaya, status, dan apakah jawaban memakai kutipan. Yang tidak boleh: isi percakapan lengkap tanpa penyaringan, data pribadi, dan kredensial. Kalau perlu mencatat isi untuk debugging, simpan terpisah dengan masa simpan pendek dan akses terbatas. Tanpa log token dan biaya, kamu tidak akan tahu fitur mana yang diam-diam menghabiskan anggaran.',
    },
    {
      id: 'ai-14',
      topik: 'Operasional',
      tingkat: 'lanjutan',
      tanya: 'Bagaimana menangani model yang lambat atau gagal di tengah permintaan pengguna?',
      jawab:
        'Dengan streaming dan anggaran waktu. Kirim token saat dihasilkan supaya pengguna melihat kemajuan, bukan layar kosong. Tetapkan batas waktu dan batas token; kalau terlampaui, hentikan dan beri jawaban sebagian yang jujur ("jawaban terpotong"). Untuk kegagalan, ulangi maksimal sekali — lebih dari itu biasanya masalah penyedia, bukan kebetulan. Sediakan jalur cadangan ke model lain kalau layanan utama mati, dan pastikan pengguna tahu kualitasnya bisa berbeda.',
    },
    {
      id: 'ai-15',
      topik: 'RAG',
      tingkat: 'lanjutan',
      tanya: 'Kapan fine-tuning lebih tepat daripada RAG?',
      jawab:
        'RAG untuk pengetahuan yang berubah dan harus bisa dikutip. Fine-tuning untuk perilaku dan format yang konsisten — gaya jawaban, struktur keluaran, klasifikasi dengan label tetap. Fine-tuning bukan cara menambah pengetahuan: model yang di-fine-tune dengan dokumen tetap bisa salah mengutip, dan pengetahuannya tidak bisa diperbarui tanpa melatih ulang. Aturan praktisnya: kalau jawabannya perlu menyebut sumber, itu RAG; kalau yang perlu diubah adalah cara menjawab, itu fine-tuning.',
    },
  ],
};

export const interviewDari = (track: string): PertanyaanInterview[] =>
  INTERVIEW[track] ?? [];

/** Kelompokkan per topik, urutan topik mengikuti kemunculan pertama. */
export function kelompokTopik(daftar: PertanyaanInterview[]) {
  const peta = new Map<string, PertanyaanInterview[]>();
  for (const q of daftar) {
    const isi = peta.get(q.topik) ?? [];
    isi.push(q);
    peta.set(q.topik, isi);
  }
  return [...peta.entries()].map(([topik, isi]) => ({ topik, isi }));
}
