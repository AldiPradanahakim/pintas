/**
 * Rubrik capstone per track (PRD F-08 / halaman H5).
 *
 * Ditulis tangan seperti `tracks.ts`: fitur wajib dan bobot rubrik adalah keputusan
 * editorial, bukan sesuatu yang bisa ditebak dari nama folder.
 *
 * Yang TIDAK ada di sini (memang di luar MVP): penilaian otomatis, pengiriman repo,
 * review dari server. Tautan repo disimpan di localStorage pengguna; statusnya
 * selalu "belum direview" sampai ada yang mereview manual lewat issue GitHub.
 */

export interface KriteriaRubrik {
  nama: string;
  /** Bobot dalam persen. Total seluruh kriteria wajib 100. */
  bobot: number;
  /** Apa yang dinilai, dalam bahasa yang bisa diperiksa sendiri oleh pengguna. */
  dinilai: string;
}

export interface Capstone {
  track: string;
  judul: string;
  ringkasan: string;
  /** Fitur yang wajib ada. Semua harus ada, tanpa kecuali. */
  fiturWajib: string[];
  /** Fitur tambahan yang menaikkan nilai, bukan syarat lulus. */
  fiturOpsional: string[];
  rubrik: KriteriaRubrik[];
  /** Ambang skor rubrik untuk lulus, dalam persen. */
  ambangLulus: number;
  /** Langkah pengerjaan berurutan. */
  langkah: string[];
  /** Perkiraan waktu pengerjaan, dalam jam. */
  estimasiJam: number;
}

export const CAPSTONE: Capstone[] = [
  {
    track: 'ai-llm',
    judul: 'Asisten dokumen dengan RAG yang bisa ditelusuri',
    ringkasan:
      'Bangun asisten yang menjawab pertanyaan berdasarkan kumpulan dokumen milikmu sendiri, dan selalu menunjukkan dari mana jawabannya diambil. Yang dinilai bukan kecanggihan model, tapi apakah jawabannya bisa dipercaya dan bisa diperiksa.',
    fiturWajib: [
      'Pipeline ingest: dokumen dipotong jadi chunk, di-embed, dan disimpan ke indeks',
      'Pencarian: minimal satu metode retrieval, dengan parameter top_k yang bisa diatur',
      'Jawaban menyertakan kutipan: setiap klaim menunjuk chunk sumbernya',
      'Menolak menjawab kalau tidak ada chunk yang relevan — bukan mengarang',
      'Evaluasi: minimal 10 pasangan pertanyaan-jawaban acuan, dengan skor recall dan presisi yang dilaporkan',
      'Antarmuka: unggah dokumen, ajukan pertanyaan, lihat kutipan yang bisa diklik',
    ],
    fiturOpsional: [
      'Pencarian hybrid (kata kunci + vektor)',
      'Reranking hasil pencarian',
      'Cache jawaban untuk pertanyaan berulang',
      'Penghitungan biaya token per pertanyaan',
    ],
    rubrik: [
      { nama: 'Kebenaran jawaban', bobot: 30, dinilai: 'Jawaban cocok dengan isi dokumen acuan; tidak ada klaim yang tidak didukung sumber.' },
      { nama: 'Kualitas retrieval', bobot: 25, dinilai: 'Chunk yang relevan masuk ke hasil pencarian; recall dan presisi terukur, bukan dirasa-rasa.' },
      { nama: 'Penanganan kasus tepi', bobot: 15, dinilai: 'Perilaku saat dokumen kosong, pertanyaan di luar cakupan, dokumen sangat panjang, dan chunk yang saling bertentangan.' },
      { nama: 'Kejelasan kode', bobot: 15, dinilai: 'Pemisahan ingest / retrieval / generasi; nama yang menjelaskan maksud; tidak ada fungsi raksasa.' },
      { nama: 'Dokumentasi & cara jalan', bobot: 15, dinilai: 'README yang cukup untuk orang lain menjalankan proyek tanpa bertanya; keputusan desain dijelaskan beserta alasannya.' },
    ],
    ambangLulus: 70,
    langkah: [
      'Kumpulkan 5–10 dokumen nyata (boleh dokumentasi teknis) dan tulis 10 pertanyaan yang jawabannya ada di sana.',
      'Bangun ingest: chunking dengan ukuran dan overlap yang eksplisit, lalu embed dan simpan.',
      'Bangun retrieval, lalu ukur recall @ k untuk k = 1, 3, 5. Catat angkanya sebelum menyentuh generasi.',
      'Tambahkan generasi dengan kutipan wajib. Uji dengan pertanyaan yang jawabannya tidak ada — harus menolak.',
      'Uji kasus tepi: dokumen kosong, pertanyaan ambigu, dua dokumen bertentangan.',
      'Ukur ulang recall dan presisi, tulis hasilnya di README.',
    ],
    estimasiJam: 12,
  },
];

export const capstoneDari = (track: string): Capstone | null =>
  CAPSTONE.find((c) => c.track === track) ?? null;

/** Total bobot — dipakai validasi supaya rubrik tidak pernah berjumlah ≠ 100. */
export const totalBobot = (c: Capstone): number =>
  c.rubrik.reduce((a, r) => a + r.bobot, 0);
